"use client";

import dynamic from "next/dynamic";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import type { OnMount } from "@monaco-editor/react";
import { DISPLAY, FOCUS } from "@/data/data";
import { SCRATCH_FILE, type RunResult } from "@/data/oopExercises";
import type { DashboardUser, NavigationUser } from "@/types/auth";
import TopNav from "@/components/layout/TopNav";

const Editor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div
      role="status"
      className="flex h-full items-center justify-center bg-[#F2F4FB] text-sm text-slate-600"
    >
      Loading editor...
    </div>
  ),
});

const STORAGE_KEY = "java-workspace:files";
const FILE_RE = /^[A-Za-z_][A-Za-z0-9_]*\.java$/;
const MAX_FILES = 8;

type WorkFile = { name: string; content: string };

const STARTER: WorkFile[] = [
  {
    name: SCRATCH_FILE,
    content: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, Java!");
    }
}
`,
  },
];

function isWorkFiles(value: unknown): value is WorkFile[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every(
      (f) =>
        f &&
        typeof (f as WorkFile).name === "string" &&
        typeof (f as WorkFile).content === "string",
    )
  );
}

function loadFiles(): WorkFile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved: unknown = JSON.parse(raw);
      if (isWorkFiles(saved)) return saved;
    }
  } catch {
    /* storage unavailable or corrupt */
  }
  return STARTER;
}

const noopSubscribe = () => () => {};

// Render the workspace only in the browser, so the saved files can be read
// when it first renders instead of copying them into state from an effect.
export default function FreeWorkspace({
  apiUrl,
  user,
}: {
  apiUrl: string;
  user: DashboardUser;
}) {
  const isClient = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

  const navUser: NavigationUser = { ...user, unreadNotifications: 0 };

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:shadow-lg"
      >
        Skip to content
      </a>

      <TopNav active={null} page="workspace" user={navUser} navUser={navUser} />

      <main
        id="main"
        className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10"
      >
        <h1
          className={`${DISPLAY} text-2xl font-semibold tracking-tight sm:text-3xl`}
        >
          Workspace
        </h1>
        <p className="mb-6 mt-2 text-sm text-slate-600">
          Write and run Java any time. Your files are saved in this browser.
        </p>

        {isClient ? (
          <Workspace apiUrl={apiUrl} />
        ) : (
          <div
            role="status"
            className="flex h-[460px] items-center justify-center rounded-3xl border border-[#D5DBEE] bg-white text-sm text-slate-600 sm:h-[560px]"
          >
            Loading workspace...
          </div>
        )}
      </main>
    </>
  );
}
function Workspace({ apiUrl }: { apiUrl: string }) {
  const [files, setFiles] = useState<WorkFile[]>(loadFiles);
  const [activeName, setActiveName] = useState(() => files[0].name);

  const [fileForm, setFileForm] = useState<{
    mode: "add" | "rename";
    value: string;
  } | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const [stdin, setStdin] = useState("");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const active = files.find((f) => f.name === activeName) ?? files[0];

  // Load saved work
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
    } catch {
      /* ignore */
    }
  }, [files]);

  function updateContent(name: string, content: string) {
    setFiles((fs) => fs.map((f) => (f.name === name ? { ...f, content } : f)));
  }

  function normalizeName(raw: string) {
    const trimmed = raw.trim();
    return /\.java$/i.test(trimmed) ? trimmed : `${trimmed}.java`;
  }

  function validateName(name: string, ignore?: string): string | null {
    if (!FILE_RE.test(name)) {
      return "Use letters, numbers and underscores, like Student.java.";
    }
    if (
      files.some(
        (f) => f.name.toLowerCase() === name.toLowerCase() && f.name !== ignore,
      )
    ) {
      return `${name} already exists.`;
    }
    return null;
  }

  function submitFileForm(e: React.FormEvent) {
    e.preventDefault();
    if (!fileForm) return;
    const name = normalizeName(fileForm.value);

    if (fileForm.mode === "add") {
      const problem =
        files.length >= MAX_FILES
          ? `You can have up to ${MAX_FILES} files.`
          : validateName(name);
      if (problem) return setFileError(problem);
      const cls = name.replace(/\.java$/i, "");
      setFiles((fs) => [
        ...fs,
        { name, content: `public class ${cls} {\n    \n}\n` },
      ]);
      setActiveName(name);
    } else {
      const problem = validateName(name, active.name);
      if (problem) return setFileError(problem);
      const old = active.name;
      setFiles((fs) => fs.map((f) => (f.name === old ? { ...f, name } : f)));
      setActiveName(name);
    }
    setFileForm(null);
    setFileError(null);
  }

  function deleteActiveFile() {
    if (files.length <= 1) return;
    if (!window.confirm(`Delete ${active.name}? This can't be undone.`)) return;
    const remaining = files.filter((f) => f.name !== active.name);
    setFiles(remaining);
    setActiveName(remaining[0].name);
  }

  function openFileForm(mode: "add" | "rename") {
    setFileError(null);
    setFileForm({
      mode,
      value: mode === "rename" ? active.name.replace(/\.java$/i, "") : "",
    });
  }

  function resetAll() {
    const changed = JSON.stringify(files) !== JSON.stringify(STARTER);
    if (
      changed &&
      !window.confirm("Reset the workspace? All your files will be lost.")
    ) {
      return;
    }
    setFiles(STARTER);
    setActiveName(STARTER[0].name);
    setResult(null);
    setError(null);
    setFileForm(null);
  }

  /* ---------- Running ---------- */

  const run = useCallback(async () => {
    if (running) return;
    setRunning(true);
    setError(null);
    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: "workspace",
          files,
          mode: "program",
          stdin,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data) {
        setError(
          data?.message ??
            "The code runner is unavailable. Try again in a moment.",
        );
        return;
      }
      setResult(data as RunResult);
    } catch {
      setError(
        "Could not reach the code runner. Check your connection and try again.",
      );
    } finally {
      setRunning(false);
    }
  }, [apiUrl, files, running, stdin]);

  const runRef = useRef(run);
  useEffect(() => {
    runRef.current = run;
  }, [run]);

  const handleMount: OnMount = (editor, monaco) => {
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      void runRef.current();
    });
  };

  const empty = result && !result.stdout && !result.stderr;

  return (
    <div className="grid gap-6 lg:grid-cols-5 lg:items-start">
      {/* Editor */}
      <section
        aria-label="Code editor"
        className="min-w-0 overflow-hidden rounded-3xl border border-[#D5DBEE] bg-white lg:col-span-3"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E3E7F4] px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="rounded-md bg-[#F2F4FB] px-2 py-1 text-xs font-semibold">
              Java
            </span>
            <button
              type="button"
              onClick={resetAll}
              className={`rounded text-sm font-medium text-slate-600 underline-offset-4 hover:text-[#0F1B3D] hover:underline ${FOCUS}`}
            >
              Reset all
            </button>
          </div>
          <button
            type="button"
            onClick={() => void run()}
            disabled={running}
            title="Ctrl/Cmd + Enter"
            className={`rounded-full bg-[#2347F4] px-5 py-2 text-sm font-semibold text-white hover:bg-[#1B38C4] disabled:cursor-not-allowed disabled:opacity-60 ${FOCUS}`}
          >
            {running ? "Running..." : "Run program"}
          </button>
        </div>

        <div
          role="tablist"
          aria-label="Files"
          className="flex items-end gap-1 overflow-x-auto bg-[#F2F4FB] px-3 pt-2"
        >
          {files.map((f) => {
            const selected = f.name === active.name;
            return (
              <button
                key={f.name}
                role="tab"
                type="button"
                aria-selected={selected}
                onClick={() => {
                  setActiveName(f.name);
                  setFileForm(null);
                  setFileError(null);
                }}
                className={`shrink-0 rounded-t-lg px-3.5 py-2 font-mono text-xs font-medium ${FOCUS} ${
                  selected
                    ? "bg-white text-[#0F1B3D]"
                    : "text-slate-600 hover:bg-white/60"
                }`}
              >
                {f.name}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => openFileForm("add")}
            disabled={files.length >= MAX_FILES}
            aria-label="Add a file"
            title={
              files.length >= MAX_FILES
                ? `Up to ${MAX_FILES} files`
                : "Add a file"
            }
            className={`mb-1 ml-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-lg leading-none text-slate-600 hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 ${FOCUS}`}
          >
            +
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E3E7F4] px-4 py-2 text-xs text-slate-600">
          {fileForm ? (
            <form
              onSubmit={submitFileForm}
              className="flex flex-wrap items-center gap-2"
            >
              <label
                htmlFor="ws-file-name"
                className="font-medium text-[#0F1B3D]"
              >
                {fileForm.mode === "add" ? "New file" : "Rename to"}
              </label>
              <input
                id="ws-file-name"
                autoFocus
                value={fileForm.value}
                onChange={(e) =>
                  setFileForm({ ...fileForm, value: e.target.value })
                }
                placeholder="Vehicle"
                aria-describedby={fileError ? "ws-file-error" : undefined}
                aria-invalid={fileError ? true : undefined}
                className={`w-40 rounded-lg border border-[#D5DBEE] px-2.5 py-1.5 font-mono text-xs text-[#0F1B3D] ${FOCUS}`}
              />
              <span className="font-mono">.java</span>
              <button
                type="submit"
                className={`rounded-full bg-[#0F1B3D] px-3 py-1.5 font-semibold text-white ${FOCUS}`}
              >
                {fileForm.mode === "add" ? "Create" : "Rename"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setFileForm(null);
                  setFileError(null);
                }}
                className={`rounded px-1 font-medium underline-offset-4 hover:underline ${FOCUS}`}
              >
                Cancel
              </button>
              {fileError && (
                <span id="ws-file-error" role="alert" className="text-rose-700">
                  {fileError}
                </span>
              )}
            </form>
          ) : (
            <>
              <p>
                Run program needs a class named Main with a main method. All
                files are compiled together.
              </p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => openFileForm("rename")}
                  className={`rounded font-medium underline-offset-4 hover:text-[#0F1B3D] hover:underline ${FOCUS}`}
                >
                  Rename
                </button>
                <button
                  type="button"
                  onClick={deleteActiveFile}
                  disabled={files.length <= 1}
                  className={`rounded font-medium underline-offset-4 hover:text-rose-700 hover:underline disabled:cursor-not-allowed disabled:opacity-40 ${FOCUS}`}
                >
                  Delete
                </button>
              </div>
            </>
          )}
        </div>

        <div className="h-[460px] sm:h-[560px]">
          <Editor
            height="100%"
            path={active.name}
            defaultLanguage="java"
            theme="vs"
            value={active.content}
            onChange={(v) => updateContent(active.name, v ?? "")}
            onMount={handleMount}
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 4,
              padding: { top: 12, bottom: 12 },
              ariaLabel: `Java code editor: ${active.name}`,
            }}
          />
        </div>
      </section>

      {/* Console */}
      <section
        aria-label="Console"
        className="min-w-0 rounded-3xl border border-[#D5DBEE] bg-white p-5 sm:p-6 lg:col-span-2"
      >
        <h2 className="text-base font-semibold">Console</h2>

        <details className="mt-4 rounded-xl border border-[#E3E7F4] px-3.5 py-2.5">
          <summary
            className={`cursor-pointer rounded text-sm font-medium ${FOCUS}`}
          >
            Program input (for Scanner)
          </summary>
          <label htmlFor="ws-stdin" className="sr-only">
            Text your program reads from the keyboard
          </label>
          <textarea
            id="ws-stdin"
            value={stdin}
            onChange={(e) => setStdin(e.target.value)}
            rows={3}
            maxLength={5000}
            placeholder="Each line here is one line typed into System.in"
            className={`mt-3 w-full rounded-lg border border-[#D5DBEE] p-2.5 font-mono text-xs ${FOCUS}`}
          />
        </details>

        <div role="status" aria-live="polite" className="mt-4 space-y-3">
          {running && (
            <p className="text-sm font-medium text-[#0F1B3D]">
              Compiling and running your program...
            </p>
          )}

          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
              <p className="font-semibold">Could not run your code</p>
              <p className="mt-1 leading-6">{error}</p>
            </div>
          )}

          {!running && !error && !result && (
            <p className="text-sm leading-6 text-slate-600">
              Press Run program (or Ctrl/Cmd + Enter). Anything you print
              appears here.
            </p>
          )}

          {!running && !error && result?.verdict === "compile_error" && (
            <>
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
                <p className="font-semibold">Compile error</p>
                <p className="mt-1 leading-6">
                  Fix these problems, then run again.
                </p>
              </div>
              <pre className="max-h-96 overflow-auto rounded-2xl bg-[#0F1B3D] p-4 text-xs leading-5 text-rose-100">
                {result.compileOutput || "The code did not compile."}
              </pre>
            </>
          )}

          {!running &&
            !error &&
            result &&
            result.verdict !== "compile_error" && (
              <>
                {result.verdict !== "finished" && result.message && (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                    <p className="font-semibold">
                      {result.verdict === "timeout"
                        ? "Time limit exceeded"
                        : "Stopped early"}
                    </p>
                    <p className="mt-1 leading-6">{result.message}</p>
                  </div>
                )}

                {empty && result.verdict === "finished" && (
                  <p className="text-sm leading-6 text-slate-600">
                    Nothing printed. Add{" "}
                    <code className="rounded bg-[#F2F4FB] px-1">
                      System.out.println(...)
                    </code>{" "}
                    to see values here.
                  </p>
                )}

                {result.stdout && (
                  <div>
                    <p className="mb-1.5 text-xs font-semibold text-slate-600">
                      Output
                    </p>
                    <pre className="max-h-96 overflow-auto rounded-2xl bg-[#0F1B3D] p-4 text-xs leading-5 text-slate-100">
                      {result.stdout}
                    </pre>
                  </div>
                )}

                {result.stderr && (
                  <div>
                    <p className="mb-1.5 text-xs font-semibold text-slate-600">
                      Errors
                    </p>
                    <pre className="max-h-64 overflow-auto rounded-2xl bg-[#0F1B3D] p-4 text-xs leading-5 text-rose-200">
                      {result.stderr}
                    </pre>
                  </div>
                )}

                {result.timeMs !== undefined && (
                  <p className="text-xs text-slate-500">
                    {result.timeMs} ms
                    {result.memoryKb !== undefined &&
                      ` | ${(result.memoryKb / 1024).toFixed(1)} MB`}
                  </p>
                )}
              </>
            )}
        </div>
      </section>
    </div>
  );
}

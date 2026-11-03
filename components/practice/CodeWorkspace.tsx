"use client";

// components/practice/CodeWorkspace.tsx
// Task on the left; multi-file editor, test results and console on the right.
// Files and completion are saved in the browser (localStorage) per exercise.
//
//   Run program  compiles all files and runs your own Main.java (free play)
//   Run tests    checks the sample tests (Main.java is compiled but not run)
//   Submit       adds the hidden tests; all passing marks the exercise complete

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { OnMount } from "@monaco-editor/react";
import Inline from "@/components/lesson/Inline";
import {
  SCRATCH_FILE,
  getStarterFiles,
  type Exercise,
  type RunMode,
  type RunResult,
} from "@/data/oopExercises";

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

// Swap these for FOCUS / DISPLAY from "@/data/data" if you prefer.
const FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2347F4] focus-visible:ring-offset-2";
const DISPLAY = "font-[family-name:var(--font-display)]";

const FILE_RE = /^[A-Za-z_][A-Za-z0-9_]*\.java$/;
const MAX_FILES = 8;

type WorkFile = { name: string; content: string };

type Props = {
  exercise: Exercise;
  lessonHref: string;
  nextHref?: string;
  nextLabel?: string;
  /** Usually `${BASE_PATH}/api/run-java` (fetch does not add Next's basePath). */
  apiUrl: string;
};

const DIFFICULTY_STYLES: Record<Exercise["difficulty"], string> = {
  Easy: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  Medium: "bg-amber-50 text-amber-800 ring-amber-200",
  Hard: "bg-rose-50 text-rose-800 ring-rose-200",
};

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

export default function CodeWorkspace({
  exercise,
  lessonHref,
  nextHref,
  nextLabel,
  apiUrl,
}: Props) {
  const storageKey = `java-practice:${exercise.slug}`;
  const starter = useMemo(() => getStarterFiles(exercise), [exercise]);

  const [files, setFiles] = useState<WorkFile[]>(starter);
  const [activeName, setActiveName] = useState(starter[0].name);
  const [hydrated, setHydrated] = useState(false);
  const [solved, setSolved] = useState(false);

  const [fileForm, setFileForm] = useState<{
    mode: "add" | "rename";
    value: string;
  } | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  // with the other useState calls
  const [submitNotice, setSubmitNotice] = useState<{
    tone: "success" | "info" | "error";
    title: string;
    text: string;
  } | null>(null);

  const [stdin, setStdin] = useState("");
  const [running, setRunning] = useState<RunMode | null>(null);
  const [testResult, setTestResult] = useState<RunResult | null>(null);
  const [programResult, setProgramResult] = useState<RunResult | null>(null);
  const [lastKind, setLastKind] = useState<"tests" | "program">("tests");
  const [error, setError] = useState<string | null>(null);

  const [leftTab, setLeftTab] = useState<"task" | "hints">("task");
  const [rightTab, setRightTab] = useState<"tests" | "console">("tests");
  const [hintsShown, setHintsShown] = useState(0);

  const active = files.find((f) => f.name === activeName) ?? files[0];

  // Load saved work
  useEffect(() => {
    try {
      const raw = localStorage.getItem(`${storageKey}:files`);
      if (raw) {
        const saved: unknown = JSON.parse(raw);
        if (isWorkFiles(saved)) {
          setFiles(saved);
          setActiveName(saved[0].name);
        }
      }
      setSolved(localStorage.getItem(`${storageKey}:solved`) === "1");
    } catch {
      /* storage unavailable or corrupt */
    }
    setHydrated(true);
  }, [storageKey]);

  // Save as the student types
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(`${storageKey}:files`, JSON.stringify(files));
    } catch {
      /* ignore */
    }
  }, [files, hydrated, storageKey]);

  /* ---------- File management ---------- */

  function updateContent(name: string, content: string) {
    setFiles((fs) => fs.map((f) => (f.name === name ? { ...f, content } : f)));
  }

  function normalizeName(raw: string): string {
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

  /* ---------- Running ---------- */

  const execute = useCallback(
    async (mode: RunMode) => {
      if (running) return;
      setRunning(mode);
      setError(null);
      try {
        const res = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug: exercise.slug, files, mode, stdin }),
        });
        const data = await res.json().catch(() => null);
        if (!res.ok || !data) {
          setError(
            data?.message ??
              "The code runner is unavailable. Try again in a moment.",
          );
          return;
        }
        const next = data as RunResult;

        if (mode === "program") {
          setProgramResult(next);
          setLastKind("program");
          setRightTab("console");
          return;
        }

        setTestResult(next);
        setLastKind("tests");
        setRightTab("tests");
        const allPassed =
          next.verdict === "finished" &&
          next.tests.length > 0 &&
          next.tests.every((t) => t.passed);
        if (mode === "submit" && allPassed) {
          setSolved(true);
          try {
            localStorage.setItem(`${storageKey}:solved`, "1");
          } catch {
            /* ignore */
          }
        }

        if (mode === "submit") {
          const summary = next.tests.length
            ? `${next.tests.filter((t) => t.passed).length} of ${next.tests.length} tests passed.`
            : "Your code did not compile yet.";
          if (next.alreadySaved) {
            setSubmitNotice({
              tone: "info",
              title: "Already submitted",
              text: "Your first submission for this exercise is already on file, so this run was not saved again.",
            });
          } else if (next.saved) {
            setSubmitNotice({
              tone: "success",
              title: "Submission saved",
              text: `Your code was submitted successfully. ${summary}`,
            });
          } else if (next.saved === false) {
            setSubmitNotice({
              tone: "error",
              title: "Not saved",
              text: "Your tests ran, but your code could not be saved. Try submitting again.",
            });
          }
        }
      } catch {
        setError(
          "Could not reach the code runner. Check your connection and try again.",
        );
      } finally {
        setRunning(null);
      }
    },
    [apiUrl, exercise.slug, files, running, stdin, storageKey],
  );

  // Keep the latest execute for the Monaco shortcut
  const executeRef = useRef(execute);
  useEffect(() => {
    executeRef.current = execute;
  }, [execute]);

  const handleMount: OnMount = (editor, monaco) => {
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      void executeRef.current("program");
    });
  };

  function resetAll() {
    const changed = JSON.stringify(files) !== JSON.stringify(starter);
    if (
      changed &&
      !window.confirm(
        "Reset all files to the starter code? Your changes will be lost.",
      )
    ) {
      return;
    }
    setFiles(starter);
    setActiveName(starter[0].name);
    setTestResult(null);
    setProgramResult(null);
    setError(null);
    setFileForm(null);
  }

  const passedCount = testResult?.tests.filter((t) => t.passed).length ?? 0;
  const totalCount = testResult?.tests.length ?? 0;
  const allPassed =
    testResult?.verdict === "finished" &&
    totalCount > 0 &&
    passedCount === totalCount;
  const consoleResult = lastKind === "program" ? programResult : testResult;

  const runLabel = (mode: RunMode, idle: string, busy: string) =>
    running === mode ? busy : idle;

  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
      {/* Left: task */}
      <section
        aria-label="Exercise"
        className="min-w-0 rounded-3xl border border-[#D5DBEE] bg-white p-6 sm:p-8"
      >
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${DIFFICULTY_STYLES[exercise.difficulty]}`}
          >
            {exercise.difficulty}
          </span>
          <span className="text-sm text-slate-600">
            About {exercise.minutes} min
          </span>
          {solved && (
            <span className="rounded-full bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white">
              Completed
            </span>
          )}
        </div>

        <h1
          className={`${DISPLAY} mt-3 text-2xl font-semibold tracking-tight sm:text-3xl`}
        >
          {exercise.title}
        </h1>

        <div
          role="tablist"
          aria-label="Exercise sections"
          className="mt-5 flex gap-1 border-b border-[#E3E7F4]"
        >
          {(["task", "hints"] as const).map((tab) => (
            <button
              key={tab}
              role="tab"
              type="button"
              id={`left-${tab}`}
              aria-selected={leftTab === tab}
              aria-controls={`left-panel-${tab}`}
              onClick={() => setLeftTab(tab)}
              className={`-mb-px rounded-t-lg border-b-2 px-4 py-2 text-sm font-semibold ${FOCUS} ${
                leftTab === tab
                  ? "border-[#2347F4] text-[#2347F4]"
                  : "border-transparent text-slate-600 hover:text-[#0F1B3D]"
              }`}
            >
              {tab === "task" ? "Task" : "Hints"}
            </button>
          ))}
        </div>

        {leftTab === "task" ? (
          <div
            role="tabpanel"
            id="left-panel-task"
            aria-labelledby="left-task"
            className="mt-5"
          >
            <div className="space-y-3 leading-7 text-slate-700">
              {exercise.prompt.map((p, i) => (
                <p key={i}>
                  <Inline text={p} />
                </p>
              ))}
            </div>

            <h2 className={`${DISPLAY} mt-6 text-base font-semibold`}>
              Requirements
            </h2>
            <ul className="mt-3 space-y-2.5">
              {exercise.requirements.map((r, i) => (
                <li key={i} className="flex gap-3 leading-7 text-slate-700">
                  <span
                    aria-hidden="true"
                    className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#2347F4]"
                  />
                  <span className="min-w-0">
                    <Inline text={r} />
                  </span>
                </li>
              ))}
            </ul>

            <h2 className={`${DISPLAY} mt-6 text-base font-semibold`}>
              Example
            </h2>
            <pre className="mt-3 overflow-x-auto rounded-2xl bg-[#0F1B3D] p-4 text-sm leading-6 text-slate-100">
              <code>{exercise.example}</code>
            </pre>

            <h2 className={`${DISPLAY} mt-6 text-base font-semibold`}>
              Working with files
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              Each class lives in its own file. Add more with the + tab.{" "}
              <code className="rounded bg-[#F2F4FB] px-1">{SCRATCH_FILE}</code>{" "}
              is where your program starts. <strong>Run program</strong> runs it
              so you can try your classes. Every run compiles all your files,
              but the tests bring their own{" "}
              <code className="rounded bg-[#F2F4FB] px-1">Main</code>, so they
              don&apos;t run yours.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {exercise.concepts.map((c) => (
                <span
                  key={c}
                  className="rounded-full bg-[#F2F4FB] px-3 py-1 text-xs font-medium text-[#0F1B3D]"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div
            role="tabpanel"
            id="left-panel-hints"
            aria-labelledby="left-hints"
            className="mt-5"
          >
            {hintsShown === 0 && (
              <p className="leading-7 text-slate-700">
                Stuck? Reveal one hint at a time. Try the task on your own
                first.
              </p>
            )}
            <ol className="space-y-3">
              {exercise.hints.slice(0, hintsShown).map((h, i) => (
                <li
                  key={i}
                  className="rounded-2xl bg-[#F2F4FB] p-4 leading-7 text-slate-700"
                >
                  <span className="font-semibold text-[#0F1B3D]">
                    Hint {i + 1}.{" "}
                  </span>
                  <Inline text={h} />
                </li>
              ))}
            </ol>
            {hintsShown < exercise.hints.length && (
              <button
                type="button"
                onClick={() => setHintsShown((n) => n + 1)}
                className={`mt-4 rounded-full border border-[#D5DBEE] bg-white px-4 py-2 text-sm font-semibold hover:border-[#2347F4] ${FOCUS}`}
              >
                Show hint {hintsShown + 1} of {exercise.hints.length}
              </button>
            )}
          </div>
        )}
      </section>

      {/* Right: editor + results */}
      <div className="flex min-w-0 flex-col gap-4">
        <section
          aria-label="Code editor"
          className="overflow-hidden rounded-3xl border border-[#D5DBEE] bg-white"
        >
          {/* Toolbar */}
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
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => void execute("program")}
                disabled={running !== null}
                title="Ctrl/Cmd + Enter"
                className={`rounded-full border border-[#D5DBEE] bg-white px-4 py-2 text-sm font-semibold hover:border-[#2347F4] disabled:cursor-not-allowed disabled:opacity-60 ${FOCUS}`}
              >
                {runLabel("program", "Run program", "Running...")}
              </button>
              <button
                type="button"
                onClick={() => void execute("run")}
                disabled={running !== null}
                className={`rounded-full border border-[#D5DBEE] bg-white px-4 py-2 text-sm font-semibold hover:border-[#2347F4] disabled:cursor-not-allowed disabled:opacity-60 ${FOCUS}`}
              >
                {runLabel("run", "Run tests", "Testing...")}
              </button>
              <button
                type="button"
                onClick={() => void execute("submit")}
                disabled={running !== null}
                className={`rounded-full bg-[#2347F4] px-5 py-2 text-sm font-semibold text-white hover:bg-[#1B38C4] disabled:cursor-not-allowed disabled:opacity-60 ${FOCUS}`}
              >
                {runLabel("submit", "Submit", "Submitting...")}
              </button>
            </div>
          </div>

          {/* File tabs */}
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
                  {f.name === SCRATCH_FILE && (
                    <span className="sr-only"> (starts your program)</span>
                  )}
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

          {/* File actions */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E3E7F4] px-4 py-2 text-xs text-slate-600">
            {fileForm ? (
              <form
                onSubmit={submitFileForm}
                className="flex flex-wrap items-center gap-2"
              >
                <label
                  htmlFor="file-name"
                  className="font-medium text-[#0F1B3D]"
                >
                  {fileForm.mode === "add" ? "New file" : "Rename to"}
                </label>
                <input
                  id="file-name"
                  autoFocus
                  value={fileForm.value}
                  onChange={(e) =>
                    setFileForm({ ...fileForm, value: e.target.value })
                  }
                  placeholder="Vehicle"
                  aria-describedby={fileError ? "file-error" : undefined}
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
                  <span id="file-error" role="alert" className="text-rose-700">
                    {fileError}
                  </span>
                )}
              </form>
            ) : (
              <>
                <p>
                  {active.name === SCRATCH_FILE
                    ? "Your Main class. Run program starts here. It is compiled on every run, but tests don't run it."
                    : "Part of your solution. Tests and Run program both use this file."}
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

          <div className="h-[420px] sm:h-[480px]">
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

        <section
          aria-label="Results"
          className="rounded-3xl border border-[#D5DBEE] bg-white p-5 sm:p-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div role="tablist" aria-label="Results" className="flex gap-1">
              {(["tests", "console"] as const).map((tab) => (
                <button
                  key={tab}
                  role="tab"
                  type="button"
                  aria-selected={rightTab === tab}
                  onClick={() => setRightTab(tab)}
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold ${FOCUS} ${
                    rightTab === tab
                      ? "bg-[#0F1B3D] text-white"
                      : "text-slate-600 hover:bg-[#F2F4FB]"
                  }`}
                >
                  {tab === "tests" ? "Tests" : "Console"}
                </button>
              ))}
            </div>
            <span className="text-xs text-slate-500">
              Run tests checks samples. Submit adds hidden tests.
            </span>
          </div>

          <details className="mt-4 rounded-xl border border-[#E3E7F4] px-3.5 py-2.5">
            <summary
              className={`cursor-pointer rounded text-sm font-medium ${FOCUS}`}
            >
              Program input (for Scanner)
            </summary>
            <label htmlFor="program-stdin" className="sr-only">
              Text your program reads from the keyboard
            </label>
            <textarea
              id="program-stdin"
              value={stdin}
              onChange={(e) => setStdin(e.target.value)}
              rows={3}
              maxLength={5000}
              placeholder="Each line here is one line typed into System.in"
              className={`mt-3 w-full rounded-lg border border-[#D5DBEE] p-2.5 font-mono text-xs ${FOCUS}`}
            />
          </details>

          <div role="status" aria-live="polite" className="mt-4">
            {error && (
              <Banner tone="error" title="Could not run your code">
                {error}
              </Banner>
            )}

            {running && (
              <p className="text-sm font-medium text-[#0F1B3D]">
                {running === "submit"
                  ? "Checking all tests..."
                  : running === "run"
                    ? "Running sample tests..."
                    : "Compiling and running your program..."}
              </p>
            )}

            {!running && rightTab === "tests" && submitNotice && (
              <div className="mb-3">
                <Banner tone={submitNotice.tone} title={submitNotice.title}>
                  {submitNotice.text}
                </Banner>
              </div>
            )}

            {!running &&
              !error &&
              rightTab === "tests" &&
              (testResult ? (
                <TestsView
                  result={testResult}
                  passedCount={passedCount}
                  totalCount={totalCount}
                  allPassed={allPassed}
                />
              ) : (
                <p className="text-sm leading-6 text-slate-600">
                  Press Run tests to check your solution. To try your own code
                  first, press Run program.
                </p>
              ))}

            {!running &&
              !error &&
              rightTab === "console" &&
              (consoleResult ? (
                <ConsoleView result={consoleResult} />
              ) : (
                <p className="text-sm leading-6 text-slate-600">
                  Press Run program to run{" "}
                  <code className="rounded bg-[#F2F4FB] px-1">
                    {SCRATCH_FILE}
                  </code>
                  . Anything you print appears here.
                </p>
              ))}
          </div>

          {solved && (
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#FFD84A] p-4 text-[#0F1B3D]">
              <p className="text-sm font-semibold">
                Exercise complete. All tests passed.
              </p>
              <Link
                href={nextHref ?? lessonHref}
                className={`rounded-full bg-[#0F1B3D] px-4 py-2 text-sm font-semibold text-white ${FOCUS}`}
              >
                {nextHref ? (nextLabel ?? "Next lesson") : "Back to the lesson"}
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

/* ---------- Results pieces ---------- */

function Banner({
  tone,
  title,
  children,
}: {
  tone: "success" | "error" | "warn" | "info";
  title: string;
  children?: React.ReactNode;
}) {
  const styles = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-900",
    error: "border-rose-200 bg-rose-50 text-rose-900",
    warn: "border-amber-200 bg-amber-50 text-amber-900",
    info: "border-[#D5DBEE] bg-[#F2F4FB] text-[#0F1B3D]",
  }[tone];
  return (
    <div className={`rounded-2xl border p-4 ${styles}`}>
      <p className="font-semibold">{title}</p>
      {children && <div className="mt-1 text-sm leading-6">{children}</div>}
    </div>
  );
}

function CompileErrors({ output }: { output: string }) {
  return (
    <div className="space-y-3">
      <Banner tone="error" title="Compile error">
        Fix these problems, then run again. File names and line numbers match
        your code.
      </Banner>
      <pre className="max-h-72 overflow-auto rounded-2xl bg-[#0F1B3D] p-4 text-xs leading-5 text-rose-100">
        {output || "The code did not compile."}
      </pre>
    </div>
  );
}

function TestsView({
  result,
  passedCount,
  totalCount,
  allPassed,
}: {
  result: RunResult;
  passedCount: number;
  totalCount: number;
  allPassed: boolean;
}) {
  if (result.verdict === "compile_error") {
    return <CompileErrors output={result.compileOutput} />;
  }

  const hasHidden = result.tests.some((t) => t.hidden);

  let banner: React.ReactNode;
  if (result.verdict !== "finished" && result.message) {
    banner = (
      <Banner
        tone="warn"
        title={
          result.verdict === "timeout" ? "Time limit exceeded" : "Stopped early"
        }
      >
        {result.message}
      </Banner>
    );
  } else if (allPassed) {
    banner = hasHidden ? (
      <Banner
        tone="success"
        title={`Accepted. All ${totalCount} tests passed.`}
      />
    ) : (
      <Banner
        tone="success"
        title={`Sample tests passed (${passedCount}/${totalCount}).`}
      >
        Press Submit to check the hidden tests too.
      </Banner>
    );
  } else {
    banner = (
      <Banner
        tone="error"
        title={`${passedCount} of ${totalCount} tests passed`}
      >
        Check the failed tests below to see what went wrong.
      </Banner>
    );
  }

  return (
    <div className="space-y-3">
      {banner}
      <ul className="space-y-2">
        {result.tests.map((t, i) => (
          <li
            key={i}
            className="rounded-xl border border-[#E3E7F4] px-3.5 py-2.5"
          >
            <div className="flex items-start gap-3">
              <span
                aria-hidden="true"
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                  t.passed ? "bg-emerald-600" : "bg-rose-600"
                }`}
              >
                <svg
                  viewBox="0 0 16 16"
                  className="h-3 w-3 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {t.passed ? (
                    <path d="M3.5 8.5l3 3 6-7" />
                  ) : (
                    <path d="M4 4l8 8M12 4l-8 8" />
                  )}
                </svg>
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium">
                  <span className="sr-only">
                    {t.passed ? "Passed: " : "Failed: "}
                  </span>
                  {t.name}
                </p>
                {!t.passed && t.message && (
                  <p className="mt-1 break-words font-mono text-xs leading-5 text-rose-700">
                    {t.message}
                  </p>
                )}
                {!t.passed && t.hidden && (
                  <p className="mt-1 text-xs text-slate-600">
                    Details are hidden. Re-read the requirements and check edge
                    cases.
                  </p>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
      {(result.timeMs !== undefined || result.memoryKb !== undefined) && (
        <p className="text-xs text-slate-500">
          {result.timeMs !== undefined && `${result.timeMs} ms`}
          {result.timeMs !== undefined &&
            result.memoryKb !== undefined &&
            " | "}
          {result.memoryKb !== undefined &&
            `${(result.memoryKb / 1024).toFixed(1)} MB`}
        </p>
      )}
    </div>
  );
}

function ConsoleView({ result }: { result: RunResult }) {
  if (result.verdict === "compile_error") {
    return <CompileErrors output={result.compileOutput} />;
  }

  const empty = !result.stdout && !result.stderr;
  const ranProgram = result.mode === "program";

  return (
    <div className="space-y-3">
      {result.verdict !== "finished" && result.message && (
        <Banner
          tone="warn"
          title={
            result.verdict === "timeout"
              ? "Time limit exceeded"
              : "Stopped early"
          }
        >
          {result.message}
        </Banner>
      )}

      {empty && result.verdict === "finished" && (
        <p className="text-sm leading-6 text-slate-600">
          Nothing printed. Add{" "}
          <code className="rounded bg-[#F2F4FB] px-1">
            System.out.println(...)
          </code>{" "}
          to your code to see values here.
        </p>
      )}

      {result.stdout && (
        <div>
          <p className="mb-1.5 text-xs font-semibold text-slate-600">Output</p>
          <pre className="max-h-64 overflow-auto rounded-2xl bg-[#0F1B3D] p-4 text-xs leading-5 text-slate-100">
            {result.stdout}
          </pre>
        </div>
      )}
      {result.stderr && (
        <div>
          <p className="mb-1.5 text-xs font-semibold text-slate-600">
            {ranProgram ? "Errors" : "Errors printed by your code"}
          </p>
          <pre className="max-h-64 overflow-auto rounded-2xl bg-[#0F1B3D] p-4 text-xs leading-5 text-rose-200">
            {result.stderr}
          </pre>
        </div>
      )}

      {ranProgram && result.timeMs !== undefined && (
        <p className="text-xs text-slate-500">
          {result.timeMs} ms
          {result.memoryKb !== undefined &&
            ` | ${(result.memoryKb / 1024).toFixed(1)} MB`}
        </p>
      )}
    </div>
  );
}

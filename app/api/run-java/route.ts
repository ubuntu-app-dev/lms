// app/api/run-java/route.ts
// Merges the student's files, optionally appends a server-side test harness,
// and runs everything in a sandbox (Judge0). The browser never receives the
// hidden tests.
//
// Modes:
//   program  compile all files and run the student's own Main (free play)
//   run      compile all files (Main.java included), run the sample tests
//   submit   compile all files (Main.java included), run sample + hidden tests
// In test modes the student's Main.java is compiled but never run: the tests
// need the class name "Main" for themselves.
//
// Works with the free public instance out of the box (no key needed).
// Optional env vars:
//   JUDGE0_URL               defaults to https://ce.judge0.com
//   JUDGE0_AUTH_TOKEN        only for a self-hosted Judge0 with authn enabled
//   JUDGE0_RAPIDAPI_KEY      only if you use Judge0 through RapidAPI
//   JUDGE0_JAVA_LANGUAGE_ID  skip auto-detection and force a language id
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { getHarness } from "@/data/oopExerciseHarness";
import { SCRATCH_FILE } from "@/data/oopExercises";
import type { RunMode, RunResult, RunTest } from "@/data/oopExercises";
import {
  cleanCompileOutput,
  combineFiles,
  renameMainForTests,
  restoreMainName,
  validateFiles,
} from "@/lib/java-source";

const MAX_STDIN_CHARS = 5_000;
const RATE_WINDOW_MS = 10_000;
const RATE_MAX_RUNS = 4;

// Simple per-instance rate limit. Use Redis/Upstash if you run several instances.
const hits = new Map<string, number[]>();

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (recent.length >= RATE_MAX_RUNS) {
    hits.set(key, recent);
    return true;
  }
  recent.push(now);
  hits.set(key, recent);
  return false;
}

const toB64 = (s: string) => Buffer.from(s, "utf8").toString("base64");
const fromB64 = (s?: string | null) =>
  s ? Buffer.from(s, "base64").toString("utf8") : "";
const clip = (s: string, max = 8000) =>
  s.length > max ? `${s.slice(0, max)}\n... output truncated` : s;

function fail(message: string, status: number) {
  return NextResponse.json({ verdict: "error", message }, { status });
}

type Judge0Result = {
  token?: string;
  stdout?: string | null;
  stderr?: string | null;
  compile_output?: string | null;
  message?: string | null;
  status?: { id: number; description: string };
  time?: string | null;
  memory?: number | null;
};

class RunnerError extends Error {
  status: number;
  constructor(status: number) {
    super(`Judge0 responded with ${status}`);
    this.status = status;
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const QUERY = "base64_encoded=true&fields=*";

// Find the newest "Java (OpenJDK x)" language on the instance (cached).
let javaIdPromise: Promise<number> | null = null;

function getJavaLanguageId(
  base: string,
  headers: Record<string, string>,
): Promise<number> {
  const forced = Number(process.env.JUDGE0_JAVA_LANGUAGE_ID);
  if (forced) return Promise.resolve(forced);

  javaIdPromise ??= (async () => {
    try {
      const res = await fetch(`${base}/languages`, {
        headers,
        signal: AbortSignal.timeout(8_000),
      });
      const list = (await res.json()) as { id: number; name: string }[];
      const best = list
        .map((l) => ({
          id: l.id,
          version: Number(l.name.match(/^Java \(OpenJDK (\d+)/i)?.[1] ?? 0),
        }))
        .filter((l) => l.version > 0)
        .sort((a, b) => b.version - a.version)[0];
      return best?.id ?? 62;
    } catch {
      javaIdPromise = null; // try again next time
      return 62;
    }
  })();

  return javaIdPromise;
}

// POST with wait=true. If the instance disallows waiting, or the result is not
// ready yet, poll GET /submissions/{token} until it finishes.
async function runOnJudge0(
  base: string,
  headers: Record<string, string>,
  payload: unknown,
): Promise<Judge0Result> {
  const post = (wait: boolean) =>
    fetch(`${base}/submissions?${QUERY}${wait ? "&wait=true" : ""}`, {
      method: "POST",
      headers,
      cache: "no-store",
      signal: AbortSignal.timeout(25_000),
      body: JSON.stringify(payload),
    });

  let res = await post(true);
  if (res.status === 400) res = await post(false); // "wait not allowed"
  if (!res.ok) throw new RunnerError(res.status);

  let j = (await res.json()) as Judge0Result;

  for (let i = 0; i < 12 && j.token && (!j.status || j.status.id <= 2); i++) {
    await sleep(1_000);
    const poll = await fetch(`${base}/submissions/${j.token}?${QUERY}`, {
      headers,
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    if (!poll.ok) throw new RunnerError(poll.status);
    j = (await poll.json()) as Judge0Result;
  }
  return j;
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (isRateLimited(ip)) {
    return fail("Too many runs. Wait a few seconds and try again.", 429);
  }

  let body: {
    slug?: unknown;
    files?: unknown;
    mode?: unknown;
    stdin?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return fail("Invalid request.", 400);
  }

  const slug = typeof body.slug === "string" ? body.slug : "";
  const mode: RunMode =
    body.mode === "submit"
      ? "submit"
      : body.mode === "program"
        ? "program"
        : "run";

  if (mode === "submit" && !user) {
    return fail("Sign in to submit your solution.", 401);
  }
  const stdinText = typeof body.stdin === "string" ? body.stdin : "";

  // Keeps this endpoint scoped to real exercises.
  // const harness = getHarness(slug);
  // if (!harness) return fail("Unknown exercise.", 404);
  const harness = mode === "program" ? "" : getHarness(slug);
  if (mode !== "program" && !harness) return fail("Unknown exercise.", 404);

  const parsed = validateFiles(body.files);
  if ("error" in parsed) return fail(parsed.error, 400);
  if (stdinText.length > MAX_STDIN_CHARS) {
    return fail("The program input is too long.", 413);
  }

  let files = parsed.files;
  const originalFiles = parsed.files;

  if (mode === "program") {
    const all = files.map((f) => f.content).join("\n");
    if (!/\bclass\s+Main\b/.test(all) || !/\bvoid\s+main\s*\(/.test(all)) {
      return fail(
        `Add a class named Main with a "public static void main(String[] args)" method. ${SCRATCH_FILE} is the place for it.`,
        400,
      );
    }
  } else {
    // Tests supply their own Main. The student's Main.java is still compiled so
    // mistakes in it are reported, but it is renamed and never run.
    const solution = files.filter((f) => f.name !== SCRATCH_FILE);
    if (!solution.length) {
      return fail(
        `Add your solution files. ${SCRATCH_FILE} only starts your program, so the tests need your classes in other files.`,
        400,
      );
    }
    if (
      solution.some((f) =>
        /\b(class|interface|enum|record)\s+(Main|__T)\b/.test(f.content),
      )
    ) {
      return fail(
        `Rename your Main class. The tests use that name, so only ${SCRATCH_FILE} may define it.`,
        400,
      );
    }
    files = files.map((f) =>
      f.name === SCRATCH_FILE
        ? { ...f, content: renameMainForTests(f.content) }
        : f,
    );
  }

  const base = (process.env.JUDGE0_URL ?? "https://ce.judge0.com").replace(
    /\/$/,
    "",
  );

  const combined = combineFiles(files);
  const source =
    mode === "program" ? combined.source : `${combined.source}\n${harness}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (process.env.JUDGE0_AUTH_TOKEN) {
    headers["X-Auth-Token"] = process.env.JUDGE0_AUTH_TOKEN;
  }
  if (process.env.JUDGE0_RAPIDAPI_KEY) {
    headers["X-RapidAPI-Key"] = process.env.JUDGE0_RAPIDAPI_KEY;
    headers["X-RapidAPI-Host"] = new URL(base).host;
  }

  let j: Judge0Result;
  try {
    j = await runOnJudge0(base, headers, {
      language_id: await getJavaLanguageId(base, headers),
      source_code: toB64(source),
      stdin: toB64(mode === "program" ? stdinText : `${mode}\n`),
      cpu_time_limit: 5,
      wall_time_limit: 10,
      memory_limit: 256000,
    });
  } catch (err) {
    if (err instanceof RunnerError && err.status === 429) {
      return fail(
        "The code runner is busy right now. Wait a few seconds and try again.",
        429,
      );
    }
    return fail("The code runner took too long or could not be reached.", 504);
  }

  const statusId = j.status?.id ?? 0;
  const stdout = fromB64(j.stdout);
  const stderrRaw = fromB64(j.stderr);

  // Pull out test markers; everything else on stderr is the student's own output.
  const tests: RunTest[] = [];
  const otherErr: string[] = [];
  let finished = mode === "program" ? statusId === 3 : false;
  let hiddenCount = 0;

  for (const line of stderrRaw.split("\n")) {
    if (mode !== "program" && line.startsWith("@@TEST|")) {
      const [, hidden, status, name, ...rest] = line.split("|");
      const isHidden = hidden === "1";
      if (isHidden) hiddenCount += 1;
      tests.push({
        name: isHidden ? `Hidden test ${hiddenCount}` : name,
        hidden: isHidden,
        passed: status === "PASS",
        message:
          isHidden || status === "PASS"
            ? undefined
            : rest.join("|") || undefined,
      });
    } else if (mode !== "program" && line.startsWith("@@DONE")) {
      finished = true;
    } else if (line.trim()) {
      otherErr.push(line);
    }
  }

  let verdict: RunResult["verdict"];
  let message: string | undefined;

  if (statusId === 6) {
    verdict = "compile_error";
  } else if (statusId === 5) {
    verdict = "timeout";
    message = "Your program ran too long. Look for a loop that never ends.";
  } else if (finished) {
    verdict = "finished";
  } else if (statusId >= 7 && statusId <= 12) {
    verdict = "runtime_error";
    message =
      mode === "program"
        ? "Your program crashed. The error is in the console."
        : "Your program crashed before the tests finished.";
  } else if (statusId >= 1 && statusId <= 2) {
    verdict = "error";
    message = "The code runner is busy. Try again in a moment.";
  } else if (statusId === 13 || statusId === 14) {
    verdict = "error";
    message = "The code runner hit an internal error. Try again.";
  } else {
    verdict = "incomplete";
    message =
      "The program ended before all tests ran. Remove any System.exit(...) calls.";
  }

  const result: RunResult = {
    verdict,
    mode,
    tests,
    stdout: clip(stdout),
    stderr: clip(otherErr.join("\n")),
    compileOutput:
      verdict === "compile_error"
        ? clip(
            restoreMainName(
              cleanCompileOutput(
                fromB64(j.compile_output),
                combined.segments,
                combined.lines,
              ),
            ),
          )
        : "",
    message,
    timeMs: j.time ? Math.round(parseFloat(j.time) * 1000) : undefined,
    memoryKb: j.memory ?? undefined,
  };

  if (mode === "submit" && user && verdict !== "error") {
    const passedCount = tests.filter((t) => t.passed).length;

    const { error: saveError } = await supabase
      .from("code_submissions")
      .insert({
        user_id: user.id,
        exercise_slug: slug,
        files: originalFiles,
        verdict,
        passed:
          verdict === "finished" &&
          tests.length > 0 &&
          passedCount === tests.length,
        passed_count: passedCount,
        total_count: tests.length,
        time_ms: result.timeMs ?? null,
        memory_kb: result.memoryKb ?? null,
      });

    // 23505 = this exercise was already saved for this student, which is fine
    const duplicate = saveError?.code === "23505";
    if (saveError && !duplicate) {
      console.error("Could not save submission:", saveError.message);
    }
    result.saved = !saveError || duplicate;
    result.alreadySaved = duplicate;
  }

  return NextResponse.json(result);
}

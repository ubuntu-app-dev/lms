// lib/java-source.ts
// Pure helpers (no Next.js imports) used by app/api/run-java/route.ts.
//
// Judge0's plain Java language compiles ONE file (Main.java). To support
// several student files without zips, we merge them into a single compilation
// unit: imports are hoisted onto line 1 and removed from their original lines,
// so every other line keeps its position. That lets us map javac errors back
// to "File.java:line".

export type SourceFile = { name: string; content: string };
export type Segment = { name: string; start: number; end: number };

export const FILE_NAME = /^[A-Za-z_][A-Za-z0-9_]*\.java$/;
export const MAX_FILES = 8;
export const MAX_TOTAL_CHARS = 40_000;

export function validateFiles(
  input: unknown,
): { files: SourceFile[] } | { error: string } {
  if (!Array.isArray(input) || input.length === 0) {
    return { error: "Add at least one file." };
  }
  if (input.length > MAX_FILES) {
    return { error: `Use at most ${MAX_FILES} files.` };
  }

  const files: SourceFile[] = [];
  const seen = new Set<string>();
  let total = 0;

  for (const item of input) {
    const raw = (item ?? {}) as { name?: unknown; content?: unknown };
    const name = typeof raw.name === "string" ? raw.name : "";
    const content = typeof raw.content === "string" ? raw.content : "";
    if (!FILE_NAME.test(name)) {
      return {
        error: `"${name}" is not a valid file name. Use a name like Student.java.`,
      };
    }
    if (seen.has(name.toLowerCase())) {
      return { error: `There are two files named ${name}.` };
    }
    seen.add(name.toLowerCase());
    total += content.length;
    files.push({ name, content });
  }

  if (total > MAX_TOTAL_CHARS)
    return { error: "Your code is too long to run." };
  if (!files.some((f) => f.content.trim()))
    return { error: "Write some code first." };
  return { files };
}

const PACKAGE_LINE = /^[ \t]*package\s+[\w.]+\s*;[ \t]*$/gm;
const IMPORT_LINE = /^[ \t]*(import\s+(?:static\s+)?[\w.*]+\s*;)[ \t]*$/gm;
// Top-level types can't be public in Main.java (and several can't share a file).
const PUBLIC_TYPE =
  /^(\s*)public\s+(?=(?:abstract\s+|final\s+|sealed\s+)?(?:class|interface|enum|record)\b)/gm;

export function combineFiles(files: SourceFile[]): {
  source: string;
  lines: number;
  segments: Segment[];
} {
  const imports = new Set<string>(["import java.util.*;"]);
  const segments: Segment[] = [];
  let line = 1;

  const parts = files.map((f) => {
    const cleaned = f.content
      .replace(/\r\n?/g, "\n")
      .replace(PACKAGE_LINE, "")
      .replace(IMPORT_LINE, (_m, imp: string) => {
        imports.add(imp.replace(/\s+/g, " "));
        return ""; // keep the (now empty) line so numbering is unchanged
      })
      .replace(PUBLIC_TYPE, "$1");
    const count = cleaned.split("\n").length;
    segments.push({ name: f.name, start: line, end: line + count - 1 });
    line += count;
    return cleaned;
  });

  // Imports share line 1 with the first file's first line.
  return {
    source: `${[...imports].join(" ")} ${parts.join("\n")}`,
    lines: line - 1,
    segments,
  };
}

/**
 * Rewrites javac output for the student: errors in their code become
 * "File.java:line". Errors inside the hidden test harness are reduced to their
 * message so no test source is revealed.
 */
export function cleanCompileOutput(
  raw: string,
  segments: Segment[],
  studentLines: number,
): string {
  const blocks = raw.split(/(?=^Main\.java:\d+: )/m).filter((b) => b.trim());
  const kept: string[] = [];
  let mismatch = false;

  for (const block of blocks) {
    const lines = block
      .trimEnd()
      .split("\n")
      .filter((l) => !/^\d+ errors?$/.test(l.trim()));
    const m = lines[0]?.match(/^Main\.java:(\d+): (.*)/);
    if (!m) {
      if (lines.length) kept.push(lines.join("\n"));
      continue;
    }

    const lineNo = Number(m[1]);
    if (lineNo <= studentLines) {
      const seg = segments.find((s) => lineNo >= s.start && lineNo <= s.end);
      const label = seg
        ? `${seg.name}:${lineNo - seg.start + 1}:`
        : `Solution.java:${lineNo}:`;
      kept.push(lines.join("\n").replace(/^Main\.java:\d+:/, label));
    } else {
      mismatch = true;
      // Drop the source line and caret (lines 2-3); keep "symbol:" / "location:" details.
      kept.push([`Test runner: ${m[2]}`, ...lines.slice(3)].join("\n"));
    }
  }

  if (mismatch) {
    kept.push(
      "The tests could not be built against your code. Check that class names, constructors and method signatures match the task.",
    );
  }
  // The same missing method is often reported once per test, so dedupe.
  return [...new Set(kept)].join("\n\n");
}

// While tests run, the harness owns the class name "Main". The student's own
// Main.java is still compiled (so mistakes in it are reported) under a name of
// the SAME length, which keeps javac's caret (^) columns aligned. It is never run.
const HIDDEN_MAIN = "Mai_";

export function renameMainForTests(content: string): string {
  return content.replace(/\bMain\b/g, HIDDEN_MAIN);
}

export function restoreMainName(text: string): string {
  return text.replace(/\bMai_\b/g, "Main");
}

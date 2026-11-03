import type { ReactNode } from "react";

const KEYWORDS = new Set([
  "abstract",
  "boolean",
  "break",
  "byte",
  "case",
  "catch",
  "char",
  "class",
  "continue",
  "default",
  "do",
  "double",
  "else",
  "enum",
  "extends",
  "final",
  "finally",
  "float",
  "for",
  "if",
  "implements",
  "import",
  "instanceof",
  "int",
  "interface",
  "long",
  "new",
  "package",
  "private",
  "protected",
  "public",
  "return",
  "short",
  "static",
  "super",
  "switch",
  "this",
  "throw",
  "throws",
  "try",
  "void",
  "while",
  "true",
  "false",
  "null",
  "var",
]);

// Groups: 1 comment, 2 string/char, 3 annotation, 4 number, 5 word
const TOKEN =
  /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)')|(@[A-Za-z_]\w*)|(\b\d+(?:\.\d+)?[fFdDlL]?\b)|(\b[A-Za-z_]\w*\b)/g;

/** Returns Java source as colored spans. Colors are chosen for the dark code theme. */
export function highlightJava(source: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let key = 0;

  for (const match of source.matchAll(TOKEN)) {
    const index = match.index ?? 0;
    const [text, comment, str, annotation, num, word] = match;

    if (index > last) out.push(source.slice(last, index));

    let cls = "";
    if (comment) cls = "text-slate-400 italic";
    else if (str) cls = "text-[#8FE3B0]";
    else if (annotation) cls = "text-[#FFA7C4]";
    else if (num) cls = "text-[#FFB38A]";
    else if (word) {
      if (KEYWORDS.has(word)) cls = "text-[#FFD84A]";
      else if (/^[A-Z]/.test(word)) cls = "text-[#A5B8FF]";
    }

    out.push(
      cls ? (
        <span key={key++} className={cls}>
          {text}
        </span>
      ) : (
        text
      ),
    );
    last = index + text.length;
  }

  if (last < source.length) out.push(source.slice(last));
  return out;
}

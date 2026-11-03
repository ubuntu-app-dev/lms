import CopyButton from "./CopyButton";
import { highlightJava } from "./Highlight";

export default function CodeBlock({
  code,
  output,
  title,
  lang = "java",
}: {
  code: string;
  output?: string;
  title?: string;
  lang?: "java" | "shell";
}) {
  const source = code.replace(/^\n+/, "").replace(/\s+$/, "");

  return (
    <figure className="my-6 overflow-hidden rounded-2xl bg-[#0F1B3D] text-blue-50">
      <figcaption className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-2">
        <span className="text-sm font-medium text-blue-100">
          {title ?? (lang === "java" ? "Java" : "Terminal")}
        </span>
        <CopyButton text={source} />
      </figcaption>

      {/* tabIndex lets keyboard users scroll long lines */}
      <pre
        tabIndex={0}
        className="overflow-x-auto p-4 text-sm leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/60"
      >
        <code className="font-mono">
          {lang === "java" ? highlightJava(source) : source}
        </code>
      </pre>

      {output && (
        <div className="border-t border-white/10 bg-[#0A1530] px-4 py-3">
          <p className="text-xs font-medium text-blue-200">Output</p>
          <pre className="mt-1 overflow-x-auto text-sm leading-relaxed text-[#8FE3B0]">
            <code className="font-mono">{output}</code>
          </pre>
        </div>
      )}
    </figure>
  );
}

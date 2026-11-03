import type { Block } from "@/data/oopCourse";
import { DISPLAY } from "@/data/data";
import CodeBlock from "./CodeBlock";
import Inline from "./Inline";

const TONES = {
  tip: { label: "Tip", box: "border-[#2347F4] bg-[#E4EAFF]" },
  note: { label: "Note", box: "border-[#7B87AB] bg-[#F2F4FB]" },
  warning: { label: "Watch out", box: "border-[#C99700] bg-[#FFF3C4]" },
} as const;

export default function LessonContent({ blocks }: { blocks: Block[] }) {
  return (
    <div>
      {blocks.map((block, i) => {
        switch (block.type) {
          case "p":
            return (
              <p key={i} className="mt-4 leading-7 text-slate-700">
                <Inline text={block.text} />
              </p>
            );

          case "h":
            return (
              <h2
                key={i}
                className={`${DISPLAY} mt-10 text-xl font-semibold tracking-tight`}
              >
                {block.text}
              </h2>
            );

          case "list":
            return (
              <ul key={i} className="mt-4 space-y-2.5 text-slate-700">
                {block.items.map((item, j) => (
                  <li key={j} className="flex gap-3 leading-7">
                    <span
                      aria-hidden="true"
                      className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-[#2347F4]"
                    />
                    <span className="min-w-0">
                      <Inline text={item} />
                    </span>
                  </li>
                ))}
              </ul>
            );

          case "code":
            return (
              <CodeBlock
                key={i}
                code={block.code}
                output={block.output}
                title={block.title}
                lang={block.lang}
              />
            );

          case "note": {
            const tone = TONES[block.tone];
            return (
              <div
                key={i}
                role="note"
                className={`mt-5 rounded-xl border-l-4 px-4 py-3 text-sm leading-6 text-[#0F1B3D] ${tone.box}`}
              >
                <strong className="font-semibold">{tone.label}: </strong>
                <Inline text={block.text} />
              </div>
            );
          }
        }
      })}
    </div>
  );
}

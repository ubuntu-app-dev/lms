import { Fragment } from "react";

/** Renders text, turning `backticked` parts into inline code. */
export default function Inline({ text }: { text: string }) {
  return (
    <>
      {text.split("`").map((part, i) =>
        i % 2 === 1 ? (
          <code
            key={i}
            className="rounded-md bg-[#EEF1FA] px-1.5 py-0.5 font-mono text-[0.9em] font-medium text-[#0F1B3D]"
          >
            {part}
          </code>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}

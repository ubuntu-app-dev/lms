"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icon/Icon";
import { BTN_PRIMARY, DISPLAY, PASS_MARK } from "@/data/data";
import type { QuizQuestion } from "@/data/oopCourse";
import type { LessonResult } from "@/components/progress/ProgressProvider";
import { submitQuiz } from "@/actions/quiz";
import Inline from "./Inline";
import { highlightJava } from "./Highlight";
import { LESSON_ICONS } from "@/components/icon/Icon";

const LETTERS = ["A", "B", "C", "D"];

type Props = {
  questions: QuizQuestion[];
  topic: string;
  lessonSlug: string;
  nextHref: string;
  nextLabel: string;
  /**
   * The student's saved result, from getLessonResult() on the lesson page.
   * When it is set, the assessment opens locked and nothing can be retaken.
   */
  previous?: LessonResult | null;
};

export default function Quiz({
  questions,
  topic,
  lessonSlug,
  nextHref,
  nextLabel,
  previous = null,
}: Props) {
  const router = useRouter();
  const total = questions.length;

  // A lesson marked done by hand has no saved answers to review.
  const noDetails = previous !== null && previous.answers === null;

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>(
    () => previous?.answers ?? Array(total).fill(null),
  );
  const [finished, setFinished] = useState(previous !== null);
  const [save, setSave] = useState<"idle" | "saving" | "saved" | "error">(
    previous !== null ? "saved" : "idle",
  );

  const questionRef = useRef<HTMLHeadingElement>(null);
  const resultRef = useRef<HTMLHeadingElement>(null);

  const current = questions[index];
  const score = noDetails
    ? (previous?.score ?? 0)
    : answers.reduce<number>(
        (n, a, i) => (a === questions[i].answer ? n + 1 : n),
        0,
      );
  const passed = score >= PASS_MARK;

  function check() {
    if (selected === null) return;
    setAnswers((prev) => prev.map((a, i) => (i === index ? selected : a)));
    setChecked(true);
  }

  /** Grades on the server and saves. Saving is what marks the lesson done. */
  async function persist() {
    setSave("saving");
    try {
      const res = await submitQuiz(topic, lessonSlug, answers as number[]);
      if (res.ok) {
        setSave("saved");
        // Re-render the lesson page so the sidebar shows the check.
        router.refresh();
      } else {
        setSave("error");
      }
    } catch {
      setSave("error");
    }
  }

  function next() {
    if (index < total - 1) {
      setIndex((i) => i + 1);
      setSelected(null);
      setChecked(false);
      requestAnimationFrame(() => questionRef.current?.focus());
    } else {
      setFinished(true);
      void persist();
      requestAnimationFrame(() => resultRef.current?.focus());
    }
  }

  return (
    <section
      id="assessment"
      aria-labelledby="assessment-heading"
      className="mt-12 scroll-mt-36 border-t border-[#E3E7F4] pt-10"
    >
      <h2
        id="assessment-heading"
        className={`${DISPLAY} text-2xl font-semibold tracking-tight`}
      >
        Test your knowledge
      </h2>
      <p className="mt-1.5 text-slate-600">
        {total} questions. Answer {PASS_MARK} or more correctly to pass. You can
        take this assessment only once.
      </p>

      {!finished ? (
        /* ------------------------------ Question ------------------------------ */
        <div className="mt-6 rounded-2xl border border-[#D5DBEE] bg-[#F7F8FD] p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <h3
              ref={questionRef}
              tabIndex={-1}
              className="text-sm font-semibold focus:outline-none"
            >
              Question {index + 1} of {total}
            </h3>
            <div
              aria-hidden="true"
              className="h-1.5 w-28 overflow-hidden rounded-full bg-[#D5DBEE]"
            >
              <div
                className="h-full rounded-full bg-[#2347F4] transition-[width] motion-reduce:transition-none"
                style={{
                  width: `${((index + (checked ? 1 : 0)) / total) * 100}%`,
                }}
              />
            </div>
          </div>

          <fieldset className="mt-4">
            <legend className="text-lg font-semibold leading-snug">
              <Inline text={current.prompt} />
            </legend>

            {current.code && (
              <pre
                tabIndex={0}
                className="mt-3 overflow-x-auto rounded-xl bg-[#0F1B3D] p-4 text-sm leading-relaxed text-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2347F4]"
              >
                <code className="font-mono">{highlightJava(current.code)}</code>
              </pre>
            )}

            <div className="mt-4 space-y-2.5">
              {current.options.map((option, i) => {
                const isSelected = selected === i;
                const isCorrect = i === current.answer;
                const wrongPick = checked && isSelected && !isCorrect;

                const state = !checked
                  ? isSelected
                    ? "border-[#2347F4] ring-2 ring-[#2347F4]/20"
                    : "border-[#B8C1DE] hover:border-[#4A5883]"
                  : isCorrect
                    ? "border-[#0B6B42] bg-[#EAF7F0]"
                    : wrongPick
                      ? "border-red-600 bg-red-50"
                      : "border-[#D5DBEE] opacity-70";

                return (
                  <label
                    key={i}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border bg-white p-3.5 transition-colors focus-within:ring-4 focus-within:ring-[#2347F4]/25 motion-reduce:transition-none ${state}`}
                  >
                    <input
                      type="radio"
                      name={`question-${index}`}
                      value={i}
                      checked={isSelected}
                      onChange={() => {
                        if (!checked) setSelected(i);
                      }}
                      className="mt-1 h-4 w-4 shrink-0 accent-[#2347F4]"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="font-semibold text-slate-500">
                        {LETTERS[i]}.{" "}
                      </span>
                      <Inline text={option} />
                      {checked && isCorrect && (
                        <span className="ml-2 text-sm font-semibold text-[#0B6B42]">
                          Correct answer
                        </span>
                      )}
                      {wrongPick && (
                        <span className="ml-2 text-sm font-semibold text-red-700">
                          Your answer
                        </span>
                      )}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <div role="status" aria-live="polite">
            {checked && (
              <div
                className={`mt-4 rounded-xl px-4 py-3 text-sm leading-6 ${
                  selected === current.answer
                    ? "bg-[#DDF3E8] text-[#0B3D26]"
                    : "bg-[#FFE9E6] text-[#7A1F14]"
                }`}
              >
                <strong className="font-semibold">
                  {selected === current.answer ? "Correct. " : "Not quite. "}
                </strong>
                <Inline text={current.explanation} />
              </div>
            )}
          </div>

          {/* One button for both steps keeps keyboard focus in place */}
          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={checked ? next : check}
              disabled={!checked && selected === null}
              className={`${BTN_PRIMARY} w-full disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto`}
            >
              {!checked
                ? "Check answer"
                : index < total - 1
                  ? "Next question"
                  : "Submit assessment"}
            </button>
          </div>
        </div>
      ) : noDetails ? (
        /* ------------------- Done earlier, nothing to review ------------------ */
        <div className="mt-6 rounded-2xl border border-[#D5DBEE] bg-[#F7F8FD] p-5 sm:p-8">
          <h3
            ref={resultRef}
            tabIndex={-1}
            className={`${DISPLAY} text-3xl font-semibold tracking-tight focus:outline-none`}
          >
            Assessment completed
          </h3>
          <p className="mt-2 text-slate-700">
            You already finished this lesson, so the assessment is closed.
          </p>
          <div className="mt-6 flex sm:justify-end">
            <Link href={nextHref} className={`${BTN_PRIMARY} w-full sm:w-auto`}>
              {nextLabel}
            </Link>
          </div>
        </div>
      ) : (
        /* ------------------------------- Results ------------------------------ */
        <div className="mt-6 rounded-2xl border border-[#D5DBEE] bg-[#F7F8FD] p-5 sm:p-8">
          <h3
            ref={resultRef}
            tabIndex={-1}
            className={`${DISPLAY} text-3xl font-semibold tracking-tight focus:outline-none`}
          >
            You scored {score} out of {total}
          </h3>
          <p className="mt-2 text-slate-700">
            {passed
              ? "Nicely done, you passed this assessment."
              : `You needed ${PASS_MARK} correct to pass. This assessment can't be retaken, so review the lesson before you move on.`}
          </p>

          <p role="status" className="mt-2 text-sm text-slate-600">
            {save === "saving" && "Saving your result…"}
            {save === "saved" &&
              (previous
                ? "This is your saved result."
                : "Your result has been saved.")}
            {save === "error" && (
              <>
                We couldn&apos;t save your result. Stay on this page and{" "}
                <button
                  type="button"
                  onClick={persist}
                  className="font-semibold text-[#2347F4] underline underline-offset-4"
                >
                  try again
                </button>
                .
              </>
            )}
          </p>

          <ol className="mt-6 space-y-3">
            {questions.map((qq, i) => {
              const ok = answers[i] === qq.answer;
              const picked = answers[i];
              return (
                <li
                  key={i}
                  className="rounded-xl border border-[#D5DBEE] bg-white p-4"
                >
                  <p className="flex items-start gap-2.5 font-semibold">
                    <span
                      aria-hidden="true"
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white ${
                        ok ? "bg-[#0B6B42]" : "bg-red-600"
                      }`}
                    >
                      <Icon
                        path={ok ? LESSON_ICONS.check : LESSON_ICONS.cross}
                        className="h-3 w-3"
                      />
                    </span>
                    <span>
                      <span className="sr-only">
                        {ok ? "Correct. " : "Incorrect. "}
                      </span>
                      <Inline text={qq.prompt} />
                    </span>
                  </p>
                  {!ok && picked !== null && (
                    <p className="mt-2 text-sm text-slate-700">
                      Your answer: <Inline text={qq.options[picked]} />
                    </p>
                  )}
                  <p className="mt-1 text-sm text-slate-700">
                    Correct answer: <Inline text={qq.options[qq.answer]} />
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    <Inline text={qq.explanation} />
                  </p>
                </li>
              );
            })}
          </ol>

          <div className="mt-6 flex sm:justify-end">
            <Link href={nextHref} className={`${BTN_PRIMARY} w-full sm:w-auto`}>
              {nextLabel}
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}

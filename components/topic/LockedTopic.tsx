import Link from "next/link";
import { Icon, ICONS } from "@/components/icon/Icon";
import {
  BASE_PATH,
  BTN_PRIMARY,
  BTN_SECONDARY,
  DISPLAY,
  LOCKED_COPY,
  TOPICS,
  type Topic,
} from "@/data/data";

export default function LockedTopic({ topic }: { topic: Topic }) {
  // Send learners to the first topic that is open
  const openTopic = TOPICS.find((t) => !t.locked);

  return (
    <section
      aria-labelledby="locked-heading"
      className="mx-auto max-w-2xl py-4 lg:py-8"
    >
      <div className="rounded-3xl border border-[#D5DBEE] bg-white p-8 text-center sm:p-12">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0F1B3D] text-[#FFD84A]">
          <Icon path={ICONS.lock} className="h-8 w-8" />
        </span>

        <h1
          id="locked-heading"
          className={`${DISPLAY} mt-6 text-3xl font-semibold tracking-tight sm:text-4xl`}
        >
          {topic.label} is locked
        </h1>
        <p className="mx-auto mt-3 max-w-md text-slate-600">
          {LOCKED_COPY.body}
        </p>

        <p className="mx-auto mt-5 inline-flex max-w-md items-center gap-3 rounded-2xl bg-[#F2F4FB] px-4 py-3 text-left text-sm text-slate-700">
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${topic.tile}`}
          >
            <Icon path={topic.icon} className="h-5 w-5" />
          </span>
          <span>
            <span className="block font-semibold text-[#0F1B3D]">
              What&apos;s inside
            </span>
            {topic.description}
          </span>
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          {openTopic && (
            <Link
              href={`${BASE_PATH}?topic=${openTopic.slug}`}
              className={BTN_PRIMARY}
            >
              Go to {openTopic.label}
            </Link>
          )}
          <Link href={BASE_PATH} className={BTN_SECONDARY}>
            Back to overview
          </Link>
        </div>
      </div>

      {/* Ghost preview of the locked content (decorative) */}
      <ul aria-hidden="true" className="mt-5 space-y-3">
        {[0, 1, 2].map((i) => (
          <li
            key={i}
            className="flex items-center gap-4 rounded-2xl border border-dashed border-[#B8C1DE] bg-white/60 p-4"
            style={{ opacity: 1 - i * 0.25 }}
          >
            <span className="h-10 w-10 shrink-0 rounded-full bg-[#E3E7F4]" />
            <span className="flex-1 space-y-2">
              <span className="block h-3 w-2/5 rounded-full bg-[#E3E7F4]" />
              <span className="block h-2.5 w-3/5 rounded-full bg-[#EEF1FA]" />
            </span>
            <Icon path={ICONS.lock} className="h-4 w-4 text-slate-400" />
          </li>
        ))}
      </ul>
    </section>
  );
}

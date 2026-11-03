// components/practice/PracticeCta.tsx
// Shown on a lesson page when that lesson has a coding exercise.
import Link from "next/link";
import type { Exercise } from "@/data/oopExercises";

type Props = {
  href: string;
  exercise: Exercise;
};

export default function PracticeCta({ href, exercise }: Props) {
  return (
    <section
      aria-labelledby="practice-heading"
      className="mt-10 rounded-2xl bg-[#0F1B3D] p-5 text-white sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div className="min-w-0 max-w-xl">
          <h2
            id="practice-heading"
            className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight"
          >
            Write the code: {exercise.title}
          </h2>
          <p className="mt-1.5 leading-7 text-slate-300">{exercise.blurb}</p>
          <p className="mt-3 text-sm text-slate-300">
            {exercise.difficulty}, about {exercise.minutes} min
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {exercise.concepts.map((c) => (
              <li
                key={c}
                className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium"
              >
                {c}
              </li>
            ))}
          </ul>
        </div>
        <Link
          href={href}
          className="rounded-full bg-[#FFD84A] px-5 py-2.5 text-sm font-semibold text-[#0F1B3D] hover:bg-[#FFE27A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F1B3D]"
        >
          Open the coding exercise
        </Link>
      </div>
    </section>
  );
}

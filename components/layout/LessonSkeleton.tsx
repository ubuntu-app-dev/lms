// components/lesson/LessonSkeleton.tsx
// Mirrors the lesson page layout: top nav, sidebar, breadcrumb, title,
// content, key takeaways, and quiz. Server component (no client JS needed).

type BarProps = {
  className?: string;
};

/** A single placeholder shape. Pulses, but stays still for reduced-motion users. */
function Bar({ className = "" }: BarProps) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-md bg-[#E3E7F4] motion-reduce:animate-none ${className}`}
    />
  );
}

/** A paragraph made of several lines, with a shorter last line. */
function Lines({
  count = 3,
  className = "",
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <Bar
          key={i}
          className={`h-4 ${i === count - 1 ? "w-3/5" : "w-full"}`}
        />
      ))}
    </div>
  );
}

export default function LessonSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className="min-h-screen bg-[#F2F4FB] text-[#0F1B3D]"
    >
      <span className="sr-only">Loading lesson...</span>

      {/* Top nav */}
      <div className="border-b border-[#D5DBEE] bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Bar className="h-7 w-28" />
          <div className="hidden items-center gap-6 sm:flex">
            <Bar className="h-4 w-16" />
            <Bar className="h-4 w-16" />
            <Bar className="h-4 w-16" />
          </div>
          <Bar className="h-9 w-9 rounded-full" />
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-10">
          {/* Sidebar */}
          <aside className="hidden h-fit rounded-3xl border border-[#D5DBEE] bg-white p-5 lg:block">
            <Bar className="h-5 w-32" />
            <div className="mt-5 space-y-5">
              {Array.from({ length: 2 }).map((_, group) => (
                <div key={group} className="space-y-3">
                  <Bar className="h-3 w-24" />
                  {Array.from({ length: 3 }).map((_, row) => (
                    <div key={row} className="flex items-center gap-3">
                      <Bar className="h-6 w-6 shrink-0 rounded-full" />
                      <Bar className="h-4 flex-1" />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </aside>

          {/* Mobile lesson switcher stand-in */}
          <Bar className="h-12 w-full rounded-2xl lg:hidden" />

          {/* Article */}
          <article className="min-w-0 rounded-3xl border border-[#D5DBEE] bg-white p-6 sm:p-10 lg:col-start-2 lg:row-start-1">
            {/* Breadcrumb + pager */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Bar className="h-4 w-16" />
                <Bar className="h-4 w-3" />
                <Bar className="h-4 w-28" />
                <Bar className="h-4 w-3" />
                <Bar className="h-4 w-16" />
              </div>
              <div className="flex gap-2">
                <Bar className="h-9 w-9 rounded-full" />
                <Bar className="h-9 w-9 rounded-full" />
              </div>
            </div>

            {/* Title, summary, meta */}
            <Bar className="mt-6 h-9 w-4/5 sm:h-10" />
            <Bar className="mt-4 h-5 w-full max-w-xl" />
            <Bar className="mt-2 h-5 w-2/3 max-w-md" />
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
              <Bar className="h-4 w-36" />
              <Bar className="h-4 w-40" />
            </div>

            {/* Lesson content */}
            <div className="mt-6 space-y-8 border-t border-[#E3E7F4] pt-8">
              <div className="space-y-4">
                <Bar className="h-6 w-1/2" />
                <Lines count={4} />
              </div>

              {/* Code block */}
              <div
                aria-hidden="true"
                className="space-y-3 rounded-2xl bg-[#0F1B3D]/90 p-5"
              >
                <div className="h-3 w-2/5 animate-pulse rounded bg-white/15 motion-reduce:animate-none" />
                <div className="h-3 w-3/5 animate-pulse rounded bg-white/15 motion-reduce:animate-none" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-white/15 motion-reduce:animate-none" />
                <div className="h-3 w-1/3 animate-pulse rounded bg-white/15 motion-reduce:animate-none" />
              </div>

              <div className="space-y-4">
                <Bar className="h-6 w-2/5" />
                <Lines count={3} />
              </div>
            </div>

            {/* Key takeaways */}
            <section className="mt-10 rounded-2xl bg-[#F2F4FB] p-5 sm:p-6">
              <Bar className="h-5 w-36 bg-[#D5DBEE]" />
              <div className="mt-4 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div
                      aria-hidden="true"
                      className="mt-1 h-5 w-5 shrink-0 animate-pulse rounded-full bg-[#FFD84A]/60 motion-reduce:animate-none"
                    />
                    <Bar
                      className={`h-4 bg-[#D5DBEE] ${i === 2 ? "w-2/3" : "w-full"}`}
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* Assessment */}
            <section className="mt-10 space-y-4">
              <Bar className="h-6 w-40" />
              <Bar className="h-5 w-3/4" />
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Bar key={i} className="h-12 w-full rounded-xl" />
                ))}
              </div>
              <Bar className="h-11 w-36 rounded-full" />
            </section>

            {/* Bottom pager */}
            <div className="mt-10 flex items-center justify-between gap-4 border-t border-[#E3E7F4] pt-6">
              <Bar className="h-12 w-36 rounded-xl" />
              <Bar className="h-12 w-36 rounded-xl" />
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}

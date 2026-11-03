import Link from "next/link";
import { Icon } from "@/components/icon/Icon";
import { DISPLAY, FOCUS } from "@/data/data";
import { LESSON_ICONS } from "@/components/icon/Icon";

type Item = { number: number; slug: string; title: string; module: string };

function groupByModule(items: Item[]) {
  const groups: { title: string; items: Item[] }[] = [];
  for (const item of items) {
    const last = groups[groups.length - 1];
    if (last && last.title === item.module) last.items.push(item);
    else groups.push({ title: item.module, items: [item] });
  }
  return groups;
}

function TopicList({
  items,
  currentSlug,
  completed,
}: {
  items: Item[];
  currentSlug: string;
  completed: Set<string>;
}) {
  return (
    <nav aria-label="Java OOP topics">
      {groupByModule(items).map((group) => (
        <div key={group.title} className="mt-4 first:mt-0">
          <h3 className="px-3 text-xs font-semibold text-slate-500">
            {group.title}
          </h3>
          <ol className="mt-1 space-y-0.5">
            {group.items.map((item) => {
              const current = item.slug === currentSlug;
              const done = completed.has(item.slug);
              return (
                <li key={item.slug}>
                  <Link
                    href={`/topics/oop/${item.slug}`}
                    aria-current={current ? "page" : undefined}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors motion-reduce:transition-none ${FOCUS} ${
                      current
                        ? "bg-[#E4EAFF] font-semibold text-[#14298F]"
                        : "text-slate-700 hover:bg-[#EEF1FA]"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                        done
                          ? "bg-[#2347F4] text-white"
                          : current
                            ? "bg-[#FFD84A] text-[#0F1B3D]"
                            : "bg-[#EEF1FA] text-slate-600"
                      }`}
                    >
                      {done ? (
                        <Icon
                          path={LESSON_ICONS.check}
                          className="h-3.5 w-3.5"
                        />
                      ) : (
                        item.number
                      )}
                    </span>
                    <span className="min-w-0">
                      {item.title}
                      {done && <span className="sr-only"> (completed)</span>}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </div>
      ))}
    </nav>
  );
}

export default function LessonSidebar({
  items,
  currentSlug,
  completed,
}: {
  items: Item[];
  currentSlug: string;
  /** Slugs of the lessons the student has finished */
  completed: string[];
}) {
  const completedSet = new Set(completed);

  return (
    <>
      {/* Mobile: collapsible list above the lesson */}
      <details className="rounded-2xl border border-[#D5DBEE] bg-white lg:hidden">
        <summary
          className={`flex cursor-pointer list-none items-center justify-between gap-3 rounded-2xl px-4 py-3 font-semibold ${FOCUS}`}
        >
          All {items.length} topics
          <Icon
            path={LESSON_ICONS.chevronDown}
            className="h-4 w-4 text-slate-500"
          />
        </summary>
        <div className="max-h-80 overflow-y-auto border-t border-[#E3E7F4] p-2">
          <TopicList
            items={items}
            currentSlug={currentSlug}
            completed={completedSet}
          />
        </div>
      </details>

      {/* Desktop: sticky sidebar */}
      <aside className="hidden lg:block">
        <div className="sticky top-32 max-h-[calc(100vh-9rem)] overflow-y-auto rounded-3xl border border-[#D5DBEE] bg-white p-3">
          <h2 className={`${DISPLAY} px-3 pb-3 pt-2 text-lg font-semibold`}>
            Java OOP
          </h2>
          <TopicList
            items={items}
            currentSlug={currentSlug}
            completed={completedSet}
          />
        </div>
      </aside>
    </>
  );
}

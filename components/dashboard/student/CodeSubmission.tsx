import Link from "next/link";
import { getCurrentUser } from "@/lib/supabase/current-user";
import { createClient } from "@/lib/supabase/server";
import TopNav from "@/components/layout/TopNav";

const FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2347F4] focus-visible:ring-offset-2";
const DISPLAY = "font-[family-name:var(--font-display)]";

type WorkFile = { name: string; content: string };
type Submission = {
  id: string;
  exercise_slug: string;
  files: WorkFile[];
  verdict: string;
  passed: boolean;
  passed_count: number;
  total_count: number;
  created_at: string;
};

// Swap for your own exercise lookup if you want the real titles.
const titleFromSlug = (slug: string) =>
  slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Manila",
  });

function StatusBadge({ s }: { s: Submission }) {
  if (s.passed) {
    return (
      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-200">
        All tests passed
      </span>
    );
  }
  if (s.verdict === "compile_error") {
    return (
      <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-800 ring-1 ring-rose-200">
        Did not compile
      </span>
    );
  }
  return (
    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 ring-1 ring-amber-200">
      {s.passed_count} of {s.total_count} tests passed
    </span>
  );
}

export default async function SubmissionsPage() {
  const user = await getCurrentUser();
  const supabase = await createClient();
  const navUser = {
    ...user,
    unreadNotifications: 0,
  };

  const { data, error } = await supabase
    .from("code_submissions")
    .select(
      "id, exercise_slug, files, verdict, passed, passed_count, total_count, created_at",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const submissions = (data ?? []) as Submission[];

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:shadow-lg"
      >
        Skip to content
      </a>
      <TopNav
        active={null}
        page="submissions"
        user={navUser}
        navUser={navUser}
      />
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <h1
          className={`${DISPLAY} text-2xl font-semibold tracking-tight sm:text-3xl`}
        >
          My submitted codes
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          {submissions.length} exercise{submissions.length === 1 ? "" : "s"}{" "}
          submitted. Only your first submission for each exercise is kept.
        </p>

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900"
          >
            Could not load your submissions. Try again in a moment.
          </div>
        )}

        {!error && submissions.length === 0 && (
          <div className="mt-6 rounded-3xl border border-[#D5DBEE] bg-white p-6 text-sm leading-6 text-slate-700">
            Nothing submitted yet. Open an exercise, write your solution and
            press Submit. It will show up here.
          </div>
        )}

        <ul className="mt-6 space-y-4">
          {submissions.map((s) => {
            const files = Array.isArray(s.files) ? s.files : [];
            return (
              <li
                key={s.id}
                className="rounded-3xl border border-[#D5DBEE] bg-white"
              >
                <details className="group">
                  <summary
                    className={`flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 rounded-3xl p-5 sm:p-6 ${FOCUS}`}
                  >
                    <div className="min-w-0">
                      <p className={`${DISPLAY} text-lg font-semibold`}>
                        {titleFromSlug(s.exercise_slug)}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        Submitted {formatDate(s.created_at)} · {files.length}{" "}
                        file
                        {files.length === 1 ? "" : "s"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge s={s} />
                      <span
                        aria-hidden="true"
                        className="text-sm text-slate-500 group-open:rotate-180"
                      >
                        ▾
                      </span>
                    </div>
                  </summary>

                  <div className="space-y-4 border-t border-[#E3E7F4] p-5 sm:p-6">
                    {files.map((f) => (
                      <div key={f.name}>
                        <p className="mb-1.5 font-mono text-xs font-semibold text-[#0F1B3D]">
                          {f.name}
                        </p>
                        <pre className="max-h-96 overflow-auto rounded-2xl bg-[#0F1B3D] p-4 text-xs leading-5 text-slate-100">
                          <code>{f.content}</code>
                        </pre>
                      </div>
                    ))}
                    <Link
                      href={`/student/practice/${s.exercise_slug}`}
                      className={`inline-block rounded-full border border-[#D5DBEE] px-4 py-2 text-sm font-semibold hover:border-[#2347F4] ${FOCUS}`}
                    >
                      Open exercise
                    </Link>
                  </div>
                </details>
              </li>
            );
          })}
        </ul>
      </main>
    </>
  );
}

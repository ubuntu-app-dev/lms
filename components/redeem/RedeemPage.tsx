"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Icon, ICONS } from "@/components/icon/Icon";
import { BASE_PATH, BRAND, DISPLAY, FOCUS } from "@/data/data";
import CodeForm, { type CodeKind } from "./CodeForm";

const ARROW_LEFT = "M19 12H5 M12 19l-7-7 7-7";
const KINDS: CodeKind[] = ["voucher", "classCode"];

/** ?type=voucher or ?type=class */
function parseKind(value: string | null): CodeKind | null {
  if (value === "voucher") return "voucher";
  if (value === "class") return "classCode";
  return null;
}

export default function RedeemPage() {
  const params = useSearchParams();
  const focusKind = parseKind(params.get("type"));
  const code = params.get("code") ?? "";
  const prefilled = focusKind !== null && code !== "";

  return (
    <>
      <header className="border-b border-[#D5DBEE] bg-white">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link
            href={BASE_PATH}
            className={`flex items-center gap-2.5 rounded-lg ${FOCUS}`}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2347F4] text-white">
              <Icon path={ICONS.cap} />
            </span>
            <span className={`${DISPLAY} text-xl font-semibold tracking-tight`}>
              {BRAND}
            </span>
          </Link>

          <Link
            href={BASE_PATH}
            className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-slate-600 hover:text-[#0F1B3D] ${FOCUS}`}
          >
            <Icon path={ARROW_LEFT} className="h-4 w-4" />
            Back to dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:py-14">
        <h1
          className={`${DISPLAY} text-3xl font-semibold tracking-tight sm:text-4xl`}
        >
          Redeem a voucher or join a class
        </h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Enter a code to add a voucher to your account, or to enroll in your
          teacher&apos;s class.
        </p>

        {prefilled && (
          <p
            role="status"
            className="mt-5 inline-block rounded-xl bg-[#FFF3C4] px-4 py-2.5 text-sm text-[#5C4300]"
          >
            Your link included a code. Check it, then continue.
          </p>
        )}

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {KINDS.map((kind) => {
            const highlighted = focusKind === kind;
            return (
              <div
                key={`${kind}-${highlighted ? code : ""}`}
                className={`rounded-3xl border bg-white p-6 sm:p-8 ${
                  highlighted
                    ? "border-[#2347F4] ring-4 ring-[#2347F4]/15"
                    : "border-[#D5DBEE]"
                }`}
              >
                <CodeForm
                  kind={kind}
                  initialCode={highlighted ? code : ""}
                  autoFocus={highlighted}
                  allowAnother
                  doneHref={BASE_PATH}
                  doneLabel="Go to dashboard"
                />
              </div>
            );
          })}
        </div>

        <p className="mt-8 text-sm text-slate-600">
          Can&apos;t find your code? Check the email or message it came in, or{" "}
          <Link
            href="/support"
            className={`rounded font-medium text-[#2347F4] underline-offset-4 hover:underline ${FOCUS}`}
          >
            contact support
          </Link>
          .
        </p>
      </main>
    </>
  );
}

"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icon/Icon";
import { FOCUS } from "@/data/data";
import type { DashboardUser } from "@/types/auth";
import { logoutAction } from "@/actions/auth/logout";
import CodeForm, {
  CODE_KINDS,
  type CodeKind,
} from "@/components/redeem/CodeForm";

/* -------------------------------------------------------------------------- */
/*  Icons (move these into your ICONS object if you prefer)                    */
/* -------------------------------------------------------------------------- */

const ACCOUNT_ICONS = {
  user: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2 M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
  logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9",
  chevronDown: "m6 9 6 6 6-6",
  close: "M18 6 6 18 M6 6l12 12",
};

/* -------------------------------------------------------------------------- */
/*  Backend hook: replace with your real sign-out                              */
/*  (The voucher and class code calls live in components/redeem/CodeForm.tsx)  */
/* -------------------------------------------------------------------------- */

async function logout() {
  // next-auth:   await signOut({ redirect: false });
  // custom API:  await fetch("/api/auth/logout", { method: "POST" });
  await new Promise((r) => setTimeout(r, 500));
}

/* -------------------------------------------------------------------------- */
/*  Dialog shell around the shared form                                        */
/* -------------------------------------------------------------------------- */

function CodeDialog({
  kind,
  onClose,
}: {
  kind: CodeKind;
  /** `completed` is true when the code was accepted */
  onClose: (completed: boolean) => void;
}) {
  const uid = useId();
  const titleId = `${uid}-title`;
  const descId = `${uid}-desc`;

  const dialogRef = useRef<HTMLDialogElement>(null);
  const completedRef = useRef(false);

  // The native <dialog> gives us focus trapping, Esc to close, and an inert page.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
    dialog?.querySelector<HTMLElement>("[data-autofocus]")?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const close = () => onClose(completedRef.current);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={descId}
      onClose={close}
      onClick={(e) => {
        // A click on the backdrop targets the <dialog> itself
        if (e.target === e.currentTarget) close();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-3xl border border-[#D5DBEE] bg-white p-0 text-[#0F1B3D] shadow-2xl backdrop:bg-[#0F1B3D]/55"
    >
      <div className="relative p-6 sm:p-8">
        <CodeForm
          kind={kind}
          headingId={titleId}
          descriptionId={descId}
          onCancel={close}
          onSuccess={() => {
            completedRef.current = true;
          }}
          onDone={() => onClose(true)}
        />
        <button
          type="button"
          aria-label="Close"
          onClick={close}
          className={`absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full text-slate-500 hover:bg-[#EEF1FA] hover:text-[#0F1B3D] ${FOCUS}`}
        >
          <Icon path={ACCOUNT_ICONS.close} />
        </button>
      </div>
    </dialog>
  );
}

/* -------------------------------------------------------------------------- */
/*  Account menu                                                               */
/* -------------------------------------------------------------------------- */

const ITEM = `flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors motion-reduce:transition-none ${FOCUS}`;

function MenuItem({
  icon,
  label,
  hint,
  href,
  onClick,
  disabled,
  danger = false,
}: {
  icon: string;
  label: ReactNode;
  hint?: string;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  const className = `${ITEM} ${
    danger ? "text-red-700 hover:bg-red-50" : "hover:bg-[#EEF1FA]"
  } disabled:cursor-not-allowed disabled:opacity-70`;

  const content = (
    <>
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
          danger ? "bg-red-50 text-red-700" : "bg-[#EEF1FA] text-[#2347F4]"
        }`}
      >
        <Icon path={icon} className="h-[18px] w-[18px]" />
      </span>
      <span className="min-w-0">
        <span className="block font-medium">{label}</span>
        {hint && <span className="block text-xs text-slate-500">{hint}</span>}
      </span>
    </>
  );

  return href ? (
    <Link href={href} onClick={onClick} className={className}>
      {content}
    </Link>
  ) : (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      {content}
    </button>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function AccountMenu({ user }: { user: DashboardUser }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dialog, setDialog] = useState<CodeKind | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Close on outside click, Escape, or when focus moves elsewhere
  useEffect(() => {
    if (!menuOpen) return;

    function onPointerDown(e: PointerEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setMenuOpen(false);
    }
    function onFocusIn(e: FocusEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setMenuOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMenuOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  function openDialog(kind: CodeKind) {
    setMenuOpen(false);
    setDialog(kind);
  }

  function closeDialog(completed: boolean) {
    setDialog(null);
    triggerRef.current?.focus();
    // Re-fetch server data so a new enrollment or voucher shows up
    if (completed) router.refresh();
  }

  async function handleLogout() {
    setLoggingOut(true);
    setLogoutError("");

    try {
      await logoutAction();
    } catch {
      setLogoutError("We couldn't log you out. Try again.");
      setLoggingOut(false);
    }
  }

  const firstName = user.fullName.split(" ")[0];

  return (
    <>
      <div ref={wrapRef} className="relative">
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="account-menu"
          aria-label={`Account menu for ${user.fullName}`}
          className={`flex items-center gap-2 rounded-full p-1 hover:bg-[#EEF1FA] sm:pr-3 ${FOCUS}`}
        >
          <span
            aria-hidden="true"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FFD84A] text-xs font-semibold text-[#0F1B3D]"
          >
            {initials(user.fullName)}
          </span>
          <span className="hidden text-sm font-medium sm:block">
            {firstName}
          </span>
          <Icon
            path={ACCOUNT_ICONS.chevronDown}
            className={`hidden h-4 w-4 text-slate-500 transition-transform motion-reduce:transition-none sm:block ${
              menuOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {menuOpen && (
          <div
            id="account-menu"
            className="absolute right-0 top-full z-40 mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-2xl border border-[#D5DBEE] bg-white p-2 shadow-xl shadow-[#0F1B3D]/10"
          >
            <div className="px-3 py-2.5">
              <p className="text-xs text-slate-500">Signed in as</p>
              <p className="truncate font-semibold">{user.fullName}</p>
            </div>

            <ul className="space-y-0.5 border-t border-[#E3E7F4] pt-2">
              <li>
                <MenuItem
                  icon={ACCOUNT_ICONS.user}
                  label="Profile"
                  href="/profile"
                  onClick={() => setMenuOpen(false)}
                />
              </li>
              <li>
                <MenuItem
                  icon={CODE_KINDS.voucher.icon}
                  label="Redeem voucher"
                  hint="Add a voucher code to your account"
                  onClick={() => openDialog("voucher")}
                />
              </li>
              <li>
                <MenuItem
                  icon={CODE_KINDS.classCode.icon}
                  label="Enroll with class code"
                  hint="Join your teacher's class"
                  onClick={() => openDialog("classCode")}
                />
              </li>
            </ul>

            <div className="mt-2 border-t border-[#E3E7F4] pt-2">
              <MenuItem
                danger
                icon={ACCOUNT_ICONS.logout}
                label={loggingOut ? "Logging out…" : "Log out"}
                onClick={handleLogout}
                disabled={loggingOut}
              />
              {logoutError && (
                <p
                  role="alert"
                  className="px-3 pb-1 pt-1.5 text-sm text-red-700"
                >
                  {logoutError}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {dialog && (
        <CodeDialog key={dialog} kind={dialog} onClose={closeDialog} />
      )}
    </>
  );
}

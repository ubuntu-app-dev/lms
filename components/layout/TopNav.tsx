"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Icon, ICONS } from "@/components/icon/Icon";
import {
  BASE_PATH,
  BRAND,
  DISPLAY,
  FOCUS,
  NAV_ITEMS,
  type TopicFilter,
  type User,
} from "@/data/data";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function TopNav({
  active,
  user,
}: {
  active: TopicFilter;
  user: Pick<User, "name" | "unreadNotifications">;
}) {
  // On small screens the topic bar scrolls sideways; keep the active topic in view.
  const listRef = useRef<HTMLUListElement>(null);
  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>('[aria-current="page"]')
      ?.scrollIntoView({ inline: "center", block: "nearest" });
  }, [active]);

  const firstName = user.name.split(" ")[0];
  const unread = user.unreadNotifications;

  return (
    <header className="sticky top-0 z-30 border-b border-[#D5DBEE] bg-white/90 backdrop-blur">
      {/* Row 1: brand and account */}
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
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

        <div className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            aria-label={
              unread > 0 ? `Notifications, ${unread} unread` : "Notifications"
            }
            className={`relative flex h-10 w-10 items-center justify-center rounded-full text-slate-600 hover:bg-[#EEF1FA] hover:text-[#0F1B3D] ${FOCUS}`}
          >
            <Icon path={ICONS.bell} />
            {unread > 0 && (
              <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-[#2347F4] ring-2 ring-white" />
            )}
          </button>

          <Link
            href="/profile"
            className={`flex items-center gap-2.5 rounded-full p-1 hover:bg-[#EEF1FA] sm:pr-3 ${FOCUS}`}
          >
            <span
              aria-hidden="true"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FFD84A] text-xs font-semibold text-[#0F1B3D]"
            >
              {initials(user.name)}
            </span>
            <span className="hidden text-sm font-medium sm:block">
              {firstName}
            </span>
            <span className="sr-only sm:hidden">Account: {user.name}</span>
          </Link>
        </div>
      </div>

      {/* Row 2: topics */}
      <nav
        aria-label="Topics"
        className="mx-auto max-w-6xl px-2 sm:px-5 lg:px-7"
      >
        <ul
          ref={listRef}
          className="flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = item.slug === active;
            return (
              <li key={item.slug} className="shrink-0">
                <Link
                  href={
                    item.slug === "all"
                      ? BASE_PATH
                      : `${BASE_PATH}?topic=${item.slug}`
                  }
                  scroll={false}
                  aria-current={isActive ? "page" : undefined}
                  className={`inline-flex items-center gap-2 whitespace-nowrap rounded-t-lg border-b-2 px-3 py-3.5 text-sm font-medium transition-colors motion-reduce:transition-none ${FOCUS} ${
                    isActive
                      ? "border-[#2347F4] text-[#0F1B3D]"
                      : "border-transparent text-slate-600 hover:text-[#0F1B3D]"
                  }`}
                >
                  <Icon path={item.icon} className="h-4 w-4" />
                  {item.label}

                  {item.locked ? (
                    <>
                      <Icon
                        path={ICONS.lock}
                        className="h-3.5 w-3.5 text-slate-500"
                      />
                      <span className="sr-only">(locked)</span>
                    </>
                  ) : item.count !== undefined ? (
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        isActive
                          ? "bg-[#2347F4] text-white"
                          : "bg-[#EEF1FA] text-slate-600"
                      }`}
                    >
                      {item.count}
                      <span className="sr-only"> topics</span>
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}

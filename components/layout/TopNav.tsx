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
  EXTRA_LINKS,
  type TopicFilter,
} from "@/data/data";
import AccountMenu from "./AccountMenu";
import type { DashboardUser } from "@/types/auth";
import type { NavigationUser } from "@/types/auth";

export default function TopNav({
  active,
  page,
  user,
}: {
  active: TopicFilter | null;
  page?: "workspace" | "submissions";
  user: DashboardUser;
  navUser: NavigationUser;
}) {
  // On small screens the topic bar scrolls sideways; keep the active topic in view.
  const listRef = useRef<HTMLUListElement>(null);
  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>('[aria-current="page"]')
      ?.scrollIntoView({ inline: "center", block: "nearest" });
  }, [active]);

  const navUser: NavigationUser = {
    ...user,
    unreadNotifications: 0,
  };

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
              navUser.unreadNotifications > 0
                ? `Notifications, ${navUser.unreadNotifications} unread`
                : "Notifications"
            }
            className={`relative flex h-10 w-10 items-center justify-center rounded-full text-slate-600 hover:bg-[#EEF1FA] hover:text-[#0F1B3D] ${FOCUS}`}
          >
            <Icon path={ICONS.bell} />
            {navUser.unreadNotifications > 0 && (
              <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-[#2347F4] ring-2 ring-white" />
            )}
          </button>

          {/* Profile, redeem voucher, class code, and log out live in here */}
          <AccountMenu user={user} />
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
          {EXTRA_LINKS.map((item) => {
            const isActive = item.page === page;
            return (
              <li key={item.page} className="shrink-0">
                <Link
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`inline-flex items-center gap-2 whitespace-nowrap rounded-t-lg border-b-2 px-3 py-3.5 text-sm font-medium transition-colors motion-reduce:transition-none ${FOCUS} ${
                    isActive
                      ? "border-[#2347F4] text-[#0F1B3D]"
                      : "border-transparent text-slate-600 hover:text-[#0F1B3D]"
                  }`}
                >
                  <Icon path={item.icon} className="h-4 w-4" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}

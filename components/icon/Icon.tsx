export const ICONS = {
  cap: "M22 10v6M2 10l10-5 10 5-10 5z M6 12v5c3 3 9 3 12 0v-5",
  check: "M20 6 9 17l-5-5",
  clock: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M12 6v6l4 2",
  bell: "M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9 M10.3 21a1.94 1.94 0 0 0 3.4 0",
  play: "M6 3l14 9-14 9z",
  grid: "M3 3h7v7H3z M14 3h7v7h-7z M14 14h7v7h-7z M3 14h7v7H3z",
  lock: "M5 11h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2z M7 11V7a5 5 0 0 1 10 0v4",
  // Topic icons
  coffee:
    "M10 2v2 M14 2v2 M6 2v2 M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1",
  code: "m16 18 6-6-6-6 M8 6l-6 6 6 6",
  braces:
    "M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5c0 1.1.9 2 2 2h1 M16 21h1a2 2 0 0 0 2-2v-5c0-1.1.9-2 2-2a2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1",
  terminal: "M12 19h8 M4 17l6-6-6-6",
  database:
    "M12 2a9 3 0 1 0 0 6 9 3 0 0 0 0-6z M3 5v14a9 3 0 0 0 18 0V5 M3 12a9 3 0 0 0 18 0",
};

export function Icon({
  path,
  className = "h-5 w-5",
}: {
  path: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  );
}

export const LESSON_ICONS = {
  arrowLeft: "M19 12H5 M12 19l-7-7 7-7",
  arrowRight: "M5 12h14 M12 5l7 7-7 7",
  check: "M20 6 9 17l-5-5",
  cross: "M18 6 6 18 M6 6l12 12",
  chevronDown: "m6 9 6 6 6-6",
  clock: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M12 6v6l4 2",
};

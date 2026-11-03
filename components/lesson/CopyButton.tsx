"use client";

import { useState } from "react";

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable: the code is still selectable on screen */
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={copy}
        aria-label="Copy code"
        className="rounded-md px-2.5 py-1 text-sm font-medium text-blue-100 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 motion-reduce:transition-none"
      >
        {copied ? "Copied" : "Copy"}
      </button>
      <span role="status" className="sr-only">
        {copied ? "Code copied to clipboard" : ""}
      </span>
    </>
  );
}

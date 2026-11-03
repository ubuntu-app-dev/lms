"use client";

import { logoutAction } from "@/actions/auth/logout";

export default function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className="rounded-md px-4 py-2 text-sm font-medium
                   text-red-600 transition hover:bg-red-50"
      >
        Log out
      </button>
    </form>
  );
}

"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function logoutAction() {
  const supabase = await createClient();

  // Identify the current user before signing out.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let loginPath = "/login";

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.role === "student") {
      loginPath = "/student/auth";
    } else if (profile?.role === "teacher") {
      loginPath = "/teacher/auth";
    } else if (profile?.role === "admin") {
      loginPath = "/login";
    }
  }

  await supabase.auth.signOut();

  redirect(loginPath);
}

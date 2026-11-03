import "server-only";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";

export type AppRole = "admin" | "teacher" | "student";

export async function requireRole(allowedRoles: AppRole[]) {
  await connection();
  const supabase = await createClient();

  // 1. Verify that the user is authenticated.
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    if (allowedRoles.includes("teacher")) {
      redirect("/teacher/auth");
    }

    redirect("/student/auth");
  }
  // 2. Load the user's role and approval status from the database.
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, role, approval_status")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile) {
    const fallbackAuth = allowedRoles.includes("teacher")
      ? "/teacher/auth?error=profile"
      : "/student/auth?error=profile";
    redirect(fallbackAuth);
  }

  // 3. Block pending or rejected users.
  if (profile.approval_status !== "approved") {
    redirect("/pending");
  }

  // 4. Verify the role on the server.
  if (!allowedRoles.includes(profile.role as AppRole)) {
    redirect("/unauthorized");
  }

  return { user, profile, supabase };
}

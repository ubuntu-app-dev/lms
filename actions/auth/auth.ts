"use server";

import { createClient } from "@/lib/supabase/server";

type LoginInput = {
  email: string;
  password: string;
  role: "student" | "teacher";
  remember: boolean;
};

type LoginResult =
  | { success: true; redirectTo: string }
  | { success: false; error: string };

/**
 * Server action used by LoginForm.tsx.
 * Expects profiles.id to match auth.users.id, with role and approval_status columns.
 */
export async function loginAction(input: LoginInput): Promise<LoginResult> {
  const email = input.email.trim().toLowerCase();
  if (!email || !input.password) {
    return { success: false, error: "Enter your email and password." };
  }

  const supabase = await createClient();
  const { data: authData, error: authError } =
    await supabase.auth.signInWithPassword({
      email,
      password: input.password,
    });

  if (authError || !authData.user) {
    return {
      success: false,
      error: "That email and password don't match. Check them and try again.",
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, approval_status")
    .eq("id", authData.user.id)
    .maybeSingle();

  if (profileError || !profile) {
    await supabase.auth.signOut();
    return {
      success: false,
      error: "Your account profile could not be found. Please contact support.",
    };
  }

  // Never trust the role selected on the login page; compare it to the database.
  if (profile.role !== input.role) {
    await supabase.auth.signOut();
    return {
      success: false,
      error: `This account is not registered as a ${input.role}. Use the correct login page.`,
    };
  }

  if (profile.approval_status !== "approved") {
    // Keep the authenticated session so the pending page can identify the user.
    return { success: true, redirectTo: "/pending" };
  }

  return {
    success: true,
    redirectTo: input.role === "teacher" ? "/teacher" : "/student",
  };
}

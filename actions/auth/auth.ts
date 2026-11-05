"use server";

import { createClient } from "@/lib/supabase/server";

type Role = "student" | "teacher";

type SendResult = { success: true } | { success: false; error: string };
type VerifyResult =
  | { success: true; redirectTo: string }
  | { success: false; error: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Step 1: email a one-time code. */
export async function sendLoginCode(input: {
  email: string;
}): Promise<SendResult> {
  const email = input.email.trim().toLowerCase();
  if (!EMAIL_RE.test(email)) {
    return { success: false, error: "Enter a valid email." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    // Only existing (subscribed) users can log in; never create accounts here.
    options: { shouldCreateUser: false },
  });

  if (error) {
    if (error.status === 429) {
      return {
        success: false,
        error: "Please wait a minute before requesting another code.",
      };
    }
    // Log real failures (SMTP down, etc.) but return a generic success so the
    // response doesn't reveal whether an email is registered.
    console.error("sendLoginCode:", error.message);
  }

  return { success: true };
}

/** Step 2: verify the code, then run the same role/approval checks as before. */
export async function verifyLoginCode(input: {
  email: string;
  code: string;
  role: Role;
}): Promise<VerifyResult> {
  const email = input.email.trim().toLowerCase();
  const code = input.code.trim();
  if (!email || !code) {
    return { success: false, error: "Enter the code we emailed you." };
  }

  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.verifyOtp({
    email,
    token: code,
    type: "email",
  });

  if (authError || !authData.user) {
    return {
      success: false,
      error: "That code is invalid or has expired. Request a new one.",
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

  if (profile.role !== input.role) {
    await supabase.auth.signOut();
    return {
      success: false,
      error: `This account is not registered as a ${input.role}. Use the correct login page.`,
    };
  }

  if (profile.approval_status !== "approved") {
    return { success: true, redirectTo: "/pending" };
  }

  return {
    success: true,
    redirectTo: input.role === "teacher" ? "/teacher" : "/student",
  };
}

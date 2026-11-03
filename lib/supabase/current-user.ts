import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function getCurrentUser() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/student/auth");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("full_name, role, approval_status")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile) {
    redirect("/student/auth");
  }

  return {
    id: user.id,
    email: user.email ?? "",
    fullName: profile.full_name,
    role: profile.role,
    approvalStatus: profile.approval_status,
  };
}

"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { BASE_PATH } from "@/data/data";

/**
 * Returns a result object instead of throwing. In production, Next.js hides the
 * message of an error thrown inside a server action, so the friendly text would
 * never reach the form.
 */
export type EnrollResult =
  | { ok: true; className: string; alreadyEnrolled: boolean }
  | { ok: false; message: string };

export async function enrollWithClassCode(
  rawCode: string,
): Promise<EnrollResult> {
  // Same rules as normalizeCode() in CodeForm
  const code = String(rawCode)
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, "")
    .slice(0, 32);

  if (code.length < 4) {
    return {
      ok: false,
      message: "That code looks too short. Check it and try again.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, message: "Your session expired. Log in again." };
  }

  // Students can't read the classes table, so the lookup uses the service role.
  const admin = createAdminClient();

  const { data: cls, error: lookupError } = await admin
    .from("classes")
    .select("id, name")
    .eq("code", code)
    .maybeSingle();

  if (lookupError) {
    return { ok: false, message: "Something went wrong. Try again." };
  }
  if (!cls) {
    return {
      ok: false,
      message: "We couldn't find that class code. Check it with your teacher.",
    };
  }

  const { error: insertError } = await admin
    .from("enrollments")
    .insert({ student_id: user.id, class_id: cls.id });

  // 23505 = already enrolled in this class. Treat it as success.
  const alreadyEnrolled = insertError?.code === "23505";
  if (insertError && !alreadyEnrolled) {
    return { ok: false, message: "We couldn't enroll you. Try again." };
  }

  revalidatePath(BASE_PATH);
  revalidatePath("/topics", "layout");
  return { ok: true, className: cls.name, alreadyEnrolled };
}

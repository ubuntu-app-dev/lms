import "server-only";
import { createClient } from "@/lib/supabase/server";

/**
 * True when the signed-in student has enrolled in at least one class.
 *
 * Reads the "enrollments" table created in supabase/enrollment.sql and written
 * by actions/enroll.ts. If you use different names, change them in both files.
 * If the query fails this returns false (and logs the error), so students
 * would see the enrollment gate.
 */
export async function isEnrolled(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { count, error } = await supabase
    .from("enrollments")
    .select("*", { count: "exact", head: true })
    .eq("student_id", user.id);

  if (error) {
    console.error("isEnrolled query failed:", error.message);
    return false;
  }
  return (count ?? 0) > 0;
}

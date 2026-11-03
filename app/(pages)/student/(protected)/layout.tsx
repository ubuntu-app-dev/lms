import { connection } from "next/server";
import { requireRole } from "@/lib/supabase/authorization";

export const instant = false;

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();
  await requireRole(["student"]);

  return <>{children}</>;
}

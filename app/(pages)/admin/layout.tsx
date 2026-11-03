import { requireRole } from "@/lib/supabase/authorization";

export const instant = false;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole(["admin"]);

  return <>{children}</>;
}

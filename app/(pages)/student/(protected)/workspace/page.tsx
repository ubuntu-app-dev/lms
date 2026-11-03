import { Suspense } from "react";
import type { Metadata } from "next";
import { Bricolage_Grotesque, Instrument_Sans } from "next/font/google";
import FreeWorkspace from "@/components/practice/FreeWorkspance";
import { API_PATH } from "@/data/data";
import LessonSkeleton from "@/components/layout/LessonSkeleton";
import { getCurrentUser } from "@/lib/supabase/current-user";

// Same fonts as /dashboard and /subscribe
const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});
const body = Instrument_Sans({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Workspace",
  description: "Redeem a voucher or enroll in a class with a class code.",
  robots: { index: false },
};

async function WorkspaceContent() {
  const user = await getCurrentUser();
  return <FreeWorkspace apiUrl="/api/run-java" user={user} />;
}

export default function WorkspaceRoute() {
  return (
    <div
      className={`${body.className} ${display.variable} min-h-screen bg-[#F2F4FB] text-[#0F1B3D]`}
    >
      <Suspense fallback={<LessonSkeleton />}>
        <WorkspaceContent />
      </Suspense>
    </div>
  );
}

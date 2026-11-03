import { Suspense } from "react";
import type { Metadata } from "next";
import { Bricolage_Grotesque, Instrument_Sans } from "next/font/google";
import Dashboard from "@/components/dashboard/student/Dashboard";
import { ProgressProvider } from "@/components/progress/ProgressProvider";
import { getCurrentUser } from "@/lib/supabase/current-user";
import { getCompletedLessons } from "@/lib/progress";
import { isEnrolled } from "@/lib/enrollment";
import EnrollmentGate from "@/components/enrollment/EnrollmentGate";

// Same fonts as /subscribe. If you'd rather not declare them twice, move these
// two blocks into app/layout.tsx and apply the classNames to <body>.
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
  title: "Dashboard",
  description: "Your courses, progress, and upcoming work.",
};
export const instant = false;

export default async function DashboardPage() {
  const [user, completed, enrolled] = await Promise.all([
    getCurrentUser(),
    getCompletedLessons(),
    isEnrolled(),
  ]);

  return (
    <div
      className={`${body.className} ${display.variable} min-h-screen bg-[#F2F4FB] text-[#0F1B3D]`}
    >
      {/* Dashboard reads ?topic= from the URL, which needs a Suspense boundary */}
      <Suspense fallback={<div className="min-h-screen" aria-busy="true" />}>
        <ProgressProvider completed={completed}>
          <Dashboard user={user} />
        </ProgressProvider>
      </Suspense>

      {/* Students must enter a class code before they can use the lessons */}
      {!enrolled && <EnrollmentGate />}
    </div>
  );
}

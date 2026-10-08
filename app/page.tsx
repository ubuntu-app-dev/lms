import type { Metadata } from "next";
import { Bricolage_Grotesque, Instrument_Sans } from "next/font/google";
import Landing from "@/components/layout/Landing";

// Same fonts as the subscribe page. `variable` exposes --font-display,
// which the Landing component picks up.
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
  title: "LMS: Learning platform for IT students",
  description:
    "Courses, quizzes and certificates for IT students. Log in as a student or a teacher.",
};

export default function HomePage() {
  return (
    <div
      className={`${body.className} ${display.variable} min-h-screen bg-[#F2F4FB] text-[#0F1B3D]`}
    >
      <Landing />
    </div>
  );
}

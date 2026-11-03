import { Suspense } from "react";
import type { Metadata } from "next";
import { Bricolage_Grotesque, Instrument_Sans } from "next/font/google";
import RedeemPage from "@/components/redeem/RedeemPage";

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
  title: "Redeem a code",
  description: "Redeem a voucher or enroll in a class with a class code.",
  robots: { index: false },
};

export default function RedeemRoute() {
  return (
    <div
      className={`${body.className} ${display.variable} min-h-screen bg-[#F2F4FB] text-[#0F1B3D]`}
    >
      {/* RedeemPage reads ?type= and ?code= from the URL, which needs Suspense */}
      <Suspense fallback={<div className="min-h-screen" aria-busy="true" />}>
        <RedeemPage />
      </Suspense>
    </div>
  );
}

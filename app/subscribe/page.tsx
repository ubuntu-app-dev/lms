import type { Metadata } from "next";
import { Bricolage_Grotesque, Instrument_Sans } from "next/font/google";
import SubscribeFlow from "@/components/SubscribeFlow";

// Display font for headings, clean UI font for everything else.
// `variable` exposes --font-display, which SubscribeFlow picks up.
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
  title: "Subscribe",
  description: "Subscribe to get full access to every course.",
};

export default function SubscribePage() {
  return (
    <main
      className={`${body.className} ${display.variable} min-h-screen bg-[#F2F4FB] text-[#0F1B3D]`}
    >
      <SubscribeFlow />
    </main>
  );
}

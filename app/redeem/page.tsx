import type { Metadata } from "next";
import RedeemFlow from "@/components/RedeemFlow";
import { body, display } from "@/lib/fonts/fonts";

export const metadata: Metadata = {
  title: "Redeem voucher",
  description: "Enter your voucher code to unlock access to every course.",
};

export default function RedeemPage() {
  return (
    <main
      className={`${body.className} ${display.variable} min-h-screen bg-[#F2F4FB] text-[#0F1B3D]`}
    >
      <RedeemFlow />
    </main>
  );
}

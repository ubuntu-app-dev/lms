import type { Metadata } from "next";
import LoginForm from "@/components/auth/LoginForm";
import { body, display } from "@/lib/fonts/fonts";

export const metadata: Metadata = {
  title: "Student login",
  description: "Log in to your student account to open your courses.",
};

export default function AdminLoginPage() {
  return (
    <main
      className={`${body.className} ${display.variable} min-h-screen bg-[#F2F4FB] text-[#0F1B3D]`}
    >
      {/* <LoginForm role="admin" /> */} this is admin
    </main>
  );
}

import type { Metadata } from "next";
import LoginForm from "@/components/auth/LoginForm";
import { body, display } from "@/lib/fonts/fonts";

export const metadata: Metadata = {
  title: "Teacher login",
  description: "Log in to your teacher account to manage your classes.",
};

export default function TeacherLoginPage() {
  return (
    <main
      className={`${body.className} ${display.variable} min-h-screen bg-[#F2F4FB] text-[#0F1B3D]`}
    >
      <LoginForm role="teacher" />
    </main>
  );
}

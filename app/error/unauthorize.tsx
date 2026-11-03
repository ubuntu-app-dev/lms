import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-2xl font-bold">Access Denied</h1>
      <p>You do not have permission to access this page.</p>
      <Link className="underline" href="/">
        Return home
      </Link>
    </main>
  );
}

export default function PendingPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold">Account Pending Approval</h1>
        <p className="mt-3 text-gray-600">
          Your account has not been approved yet. Please contact your
          administrator.
        </p>
      </div>
    </main>
  );
}

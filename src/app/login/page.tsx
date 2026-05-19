import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) {
    redirect(user.role === "ADMIN" ? "/admin" : "/dashboard");
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:py-16">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold text-gray-900">Welcome back</h1>
        <p className="mt-2 text-sm text-gray-500">Sign in to manage your villas</p>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
        <LoginForm />
      </div>

      <p className="mt-6 text-center text-sm text-gray-500">
        New here?{" "}
        <Link href="/register" className="font-medium text-gray-900 hover:underline">
          Create account
        </Link>
      </p>
    </div>
  );
}

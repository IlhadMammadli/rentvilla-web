import Link from "next/link";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";

export default async function RegisterPage() {
  const user = await getSessionUser();
  if (user) redirect("/dashboard");

  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:py-16">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold text-gray-900">Create account</h1>
        <p className="mt-2 text-sm text-gray-500">
          Register to list your villas on RentVilla
        </p>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
        <RegisterForm />
      </div>

      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-gray-900 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}

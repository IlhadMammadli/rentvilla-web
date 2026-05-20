import Link from "next/link";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getTranslations } from "@/i18n/server";

export default async function RegisterPage() {
  const user = await getSessionUser();
  const { t } = await getTranslations();

  if (user) redirect("/dashboard");

  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:py-16">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold text-gray-900">{t("auth.registerTitle")}</h1>
        <p className="mt-2 text-sm text-gray-500">{t("auth.registerSubtitle")}</p>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
        <RegisterForm />
      </div>

      <p className="mt-6 text-center text-sm text-gray-500">
        {t("auth.hasAccount")}{" "}
        <Link href="/login" className="font-medium text-gray-900 hover:underline">
          {t("auth.signIn")}
        </Link>
      </p>
    </div>
  );
}

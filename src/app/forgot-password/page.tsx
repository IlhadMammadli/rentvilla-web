import Link from "next/link";
import { Suspense } from "react";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { getTranslations } from "@/i18n/server";

export default async function ForgotPasswordPage() {
  const { t } = await getTranslations();

  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:py-16">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold text-gray-900">{t("auth.forgotPasswordTitle")}</h1>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
        <Suspense fallback={null}>
          <ForgotPasswordForm />
        </Suspense>
      </div>

      <p className="mt-6 text-center text-sm text-gray-500">
        <Link href="/login" className="font-medium text-gray-900 hover:underline">
          {t("auth.backToLogin")}
        </Link>
      </p>
    </div>
  );
}

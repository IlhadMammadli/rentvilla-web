import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { defaultPathForRole } from "@/lib/favorites";
import { getTranslations } from "@/i18n/server";

export default async function LoginPage() {
  const user = await getSessionUser();
  const { t } = await getTranslations();

  if (user) {
    redirect(defaultPathForRole(user.role));
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:py-16">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold text-gray-900">{t("auth.loginTitle")}</h1>
        <p className="mt-2 text-sm text-gray-500">{t("auth.loginSubtitle")}</p>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>

      <p className="mt-6 text-center text-sm text-gray-500">
        {t("auth.newHere")}{" "}
        <Link href="/register" className="font-medium text-gray-900 hover:underline">
          {t("nav.register")}
        </Link>
      </p>
    </div>
  );
}

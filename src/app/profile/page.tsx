import Link from "next/link";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { getSessionUser } from "@/lib/auth";
import { getUserProfile } from "@/lib/profile";
import { getTranslations } from "@/i18n/server";

export default async function ProfilePage() {
  const session = await getSessionUser();
  const { t } = await getTranslations();

  if (!session) {
    redirect("/login?redirect=/profile");
  }

  const profile = await getUserProfile(session.id);
  if (!profile) {
    redirect("/login?redirect=/profile");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">{t("profile.title")}</h1>
        <p className="mt-1 text-sm text-gray-500">
          {t("profile.subtitle", { name: profile.displayName })}
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <Link href="/favorites" className="font-medium text-gray-900 hover:underline">
            {t("nav.favorites")}
          </Link>
        </div>
      </div>

      <ProfileForm initialProfile={profile} />
    </div>
  );
}

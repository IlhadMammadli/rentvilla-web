import Link from "next/link";
import { requireStaff } from "@/lib/admin";
import { getTranslations } from "@/i18n/server";
import { isAdmin } from "@/lib/permissions";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireStaff();
  const { t } = await getTranslations();
  const adminUser = isAdmin(user.role);

  const nav = [
    { href: "/admin", label: t("admin.overview") },
    { href: "/admin/analytics", label: t("admin.analytics") },
    { href: "/admin/users", label: t("admin.users") },
    { href: "/admin/villas", label: t("admin.villas") },
    ...(adminUser
      ? [
          { href: "/admin/cities", label: t("admin.cities") },
          { href: "/admin/facilities", label: t("admin.facilities") },
        ]
      : []),
  ];

  return (
    <div className="mx-auto flex max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <aside className="hidden w-52 shrink-0 md:block">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
          {adminUser ? t("admin.panel") : t("admin.managerPanel")}
        </p>
        {!adminUser && (
          <p className="mb-4 text-xs text-gray-500">{t("admin.managerReadOnly")}</p>
        )}
        <nav className="space-y-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

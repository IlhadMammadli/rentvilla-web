import { prisma } from "@/lib/prisma";
import { getTranslations } from "@/i18n/server";

export default async function AdminUsersPage() {
  const { t } = await getTranslations();

  const users = await prisma.user.findMany({
    include: {
      villaOwnerProfile: true,
      realtorProfile: true,
      _count: { select: { villas: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">{t("admin.users")}</h1>
      <div className="mt-6 overflow-x-auto rounded-xl border border-gray-100">
        <table className="w-full min-w-[600px] text-left text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">{t("admin.role")}</th>
              <th className="px-4 py-3 font-medium">{t("admin.nameCompany")}</th>
              <th className="px-4 py-3 font-medium">{t("auth.email")}</th>
              <th className="px-4 py-3 font-medium">{t("auth.phone")}</th>
              <th className="px-4 py-3 font-medium">{t("admin.villas")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => {
              const displayName =
                user.villaOwnerProfile
                  ? `${user.villaOwnerProfile.firstName} ${user.villaOwnerProfile.lastName}`
                  : user.realtorProfile?.companyName ?? "—";

              return (
                <tr key={user.id}>
                  <td className="px-4 py-3 text-gray-600">{user.role}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{displayName}</td>
                  <td className="px-4 py-3 text-gray-600">{user.email ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {user.phone ??
                      user.villaOwnerProfile?.phone ??
                      user.realtorProfile?.phone ??
                      "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{user._count.villas}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

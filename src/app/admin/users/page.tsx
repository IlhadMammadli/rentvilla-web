import { prisma } from "@/lib/prisma";
import { getTranslations } from "@/i18n/server";
import { requireStaff } from "@/lib/admin";
import { isAdmin } from "@/lib/permissions";
import { AdminUserActions } from "@/components/admin/AdminUserActions";
import { AdminRealtorPromote } from "@/components/admin/AdminRealtorPromote";
import { GrantManagerForm } from "@/components/admin/GrantManagerForm";

export default async function AdminUsersPage() {
  const user = await requireStaff();
  const { t } = await getTranslations();
  const actorIsAdmin = isAdmin(user.role);

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

      {actorIsAdmin && (
        <div className="mt-6">
          <GrantManagerForm />
        </div>
      )}

      <div className="mt-6 overflow-x-auto rounded-xl border border-gray-100">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">{t("admin.role")}</th>
              <th className="px-4 py-3 font-medium">{t("admin.nameCompany")}</th>
              <th className="px-4 py-3 font-medium">{t("auth.email")}</th>
              <th className="px-4 py-3 font-medium">{t("admin.userId")}</th>
              <th className="px-4 py-3 font-medium">{t("admin.status")}</th>
              <th className="px-4 py-3 font-medium">{t("admin.villas")}</th>
              <th className="px-4 py-3 font-medium">{t("admin.actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((u) => {
              const displayName =
                u.villaOwnerProfile
                  ? `${u.villaOwnerProfile.firstName} ${u.villaOwnerProfile.lastName}`
                  : u.realtorProfile?.companyName ?? "—";

              return (
                <tr key={u.id} className={u.isBlocked ? "bg-red-50/50" : ""}>
                  <td className="px-4 py-3 text-gray-600">{u.role}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{displayName}</td>
                  <td className="px-4 py-3 text-gray-600">{u.email ?? "—"}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{u.id}</td>
                  <td className="px-4 py-3">
                    {u.isBlocked ? (
                      <span className="text-red-600">{t("admin.blocked")}</span>
                    ) : (
                      <span className="text-green-600">{t("admin.active")}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{u._count.villas}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {actorIsAdmin && u.role === "REALTOR" && u.realtorProfile && (
                        <AdminRealtorPromote
                          userId={u.id}
                          isPromoted={u.realtorProfile.isPromoted}
                        />
                      )}
                      <AdminUserActions
                        userId={u.id}
                        role={u.role}
                        isBlocked={u.isBlocked}
                        isAdmin={actorIsAdmin}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

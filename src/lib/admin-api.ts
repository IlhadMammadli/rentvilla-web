import { getSessionUser } from "./auth";
import {
  canAssignSiteManager,
  canBlockUser,
  canDeleteUser,
  canDeleteVilla,
  canPromoteVilla,
  canToggleVillaPublish,
  isAdmin,
  isStaff,
} from "./permissions";
import { prisma } from "./prisma";
import { UserRole } from "@prisma/client";

export async function getStaffFromRequest() {
  const user = await getSessionUser();
  if (!user || !isStaff(user.role)) return null;
  return user;
}

export async function requireAdminApi() {
  const user = await getStaffFromRequest();
  if (!user || !isAdmin(user.role)) return null;
  return user;
}

export function forbidden() {
  return { error: "Forbidden", status: 403 as const };
}

export async function assertCanModifyUser(
  actorRole: UserRole,
  targetId: string,
  actorId: string
) {
  if (targetId === actorId) return forbidden();
  const target = await prisma.user.findUnique({ where: { id: targetId } });
  if (!target) return { error: "User not found", status: 404 as const };
  if (target.role === "ADMIN") return forbidden();
  if (!canBlockUser(actorRole) && !canDeleteUser(actorRole)) return forbidden();
  return { target };
}

export {
  canAssignSiteManager,
  canBlockUser,
  canDeleteUser,
  canDeleteVilla,
  canPromoteVilla,
  canToggleVillaPublish,
};

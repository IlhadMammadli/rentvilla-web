import { redirect } from "next/navigation";
import { getSessionUser } from "./auth";
import { canAccessAdminPanel } from "./permissions";
import type { UserRole } from "@prisma/client";

export async function requireStaff() {
  const user = await getSessionUser();
  if (!user || !canAccessAdminPanel(user.role)) {
    redirect("/login");
  }
  return user;
}

/** @deprecated use requireStaff — kept alias */
export async function requireAdmin() {
  return requireStaff();
}

export async function requireOwnerOrRealtor() {
  const user = await getSessionUser();
  if (!user || (user.role !== "VILLA_OWNER" && user.role !== "REALTOR")) {
    redirect("/login");
  }
  return user;
}

export async function requireAdminOnly() {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/login");
  }
  return user;
}

export type StaffSession = Awaited<ReturnType<typeof requireStaff>>;

export function staffRole(user: { role: UserRole }) {
  return user.role;
}

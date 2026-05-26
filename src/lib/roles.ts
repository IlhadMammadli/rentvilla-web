import type { UserRole } from "@prisma/client";

/** Individual accounts: browse, favorites, and list villas (guest merged with villa owner). */
export function isIndividualUser(role: UserRole) {
  return role === "VILLA_OWNER" || role === "GUEST";
}

export function canListVillas(role: UserRole) {
  return role === "VILLA_OWNER" || role === "GUEST" || role === "REALTOR";
}

export function canAccessDashboard(role: UserRole) {
  return canListVillas(role);
}

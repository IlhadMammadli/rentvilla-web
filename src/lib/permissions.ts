import type { UserRole } from "@prisma/client";

export function isAdmin(role: UserRole) {
  return role === "ADMIN";
}

export function isSiteManager(role: UserRole) {
  return role === "SITE_MANAGER";
}

export function isStaff(role: UserRole) {
  return role === "ADMIN" || role === "SITE_MANAGER";
}

export function canAccessAdminPanel(role: UserRole) {
  return isStaff(role);
}

export function canDeleteUser(role: UserRole) {
  return isAdmin(role);
}

export function canDeleteVilla(role: UserRole) {
  return isAdmin(role);
}

export function canBlockUser(role: UserRole) {
  return isAdmin(role);
}

export function canPromoteVilla(role: UserRole) {
  return isAdmin(role);
}

export function canPromoteRealtor(role: UserRole) {
  return isAdmin(role);
}

export function canToggleVillaPublish(role: UserRole) {
  return isStaff(role);
}

export function canAssignSiteManager(role: UserRole) {
  return isAdmin(role);
}

export function canManageCitiesAndFacilities(role: UserRole) {
  return isAdmin(role);
}

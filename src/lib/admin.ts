import { redirect } from "next/navigation";
import { getSessionUser } from "./auth";

export async function requireAdmin() {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/login");
  }
  return user;
}

export async function requireOwnerOrRealtor() {
  const user = await getSessionUser();
  if (!user || (user.role !== "VILLA_OWNER" && user.role !== "REALTOR")) {
    redirect("/login");
  }
  return user;
}

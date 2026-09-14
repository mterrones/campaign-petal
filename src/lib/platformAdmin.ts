import type { AuthUser } from "@/context/AuthContext";

export const PLATFORM_ADMIN_EMAIL = "gerencia@enviamas.pe";

function matchesPlatformAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === PLATFORM_ADMIN_EMAIL;
}

export function isPlatformAdmin(user: AuthUser | null | undefined): boolean {
  if (!user) return false;
  if (typeof user.isPlatformAdmin === "boolean") {
    return user.isPlatformAdmin;
  }
  return matchesPlatformAdminEmail(user.email);
}

export function canViewMessageProcessLog(
  user: AuthUser | null | undefined,
): boolean {
  if (!user) return false;
  return (
    isPlatformAdmin(user) ||
    matchesPlatformAdminEmail(user.impersonation?.email)
  );
}

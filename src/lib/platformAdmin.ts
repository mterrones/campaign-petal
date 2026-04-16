import type { AuthUser } from "@/context/AuthContext";

export const PLATFORM_ADMIN_EMAIL = "gerencia@enviamas.pe";

export function isPlatformAdmin(user: AuthUser | null | undefined): boolean {
  if (!user) return false;
  return user.email.trim().toLowerCase() === PLATFORM_ADMIN_EMAIL;
}

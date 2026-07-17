import {
  deleteJson,
  getJson,
  patchJson,
  postJson,
  mailingApiV1Path,
} from "@/lib/api";

const base = `${mailingApiV1Path}/platform/admin/mail-providers`;

export type AdminMailProviderRow = {
  id: string;
  name: string;
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUser: string | null;
  hasPassword: boolean;
  tlsRejectUnauthorized: boolean;
  isActive: boolean;
  isDefault: boolean;
  assignedClientCount: number;
};

export const platformAdminMailProvidersQueryKey = [
  "platform",
  "admin",
  "mail-providers",
] as const;

export async function fetchPlatformAdminMailProviders(token: string) {
  return getJson<{ providers: AdminMailProviderRow[] }>(base, token);
}

export async function createPlatformAdminMailProvider(
  token: string,
  body: {
    name: string;
    smtpHost: string;
    smtpPort: number;
    smtpSecure: boolean;
    smtpUser?: string | null;
    smtpPassword?: string | null;
    tlsRejectUnauthorized: boolean;
    isActive: boolean;
    isDefault?: boolean;
  },
) {
  return postJson<{ provider: AdminMailProviderRow }>(base, body, { token });
}

export async function patchPlatformAdminMailProvider(
  token: string,
  providerId: string,
  body: Partial<{
    name: string;
    smtpHost: string;
    smtpPort: number;
    smtpSecure: boolean;
    smtpUser: string | null;
    smtpPassword: string | null;
    tlsRejectUnauthorized: boolean;
    isActive: boolean;
    isDefault: boolean;
  }>,
) {
  return patchJson<{ provider: AdminMailProviderRow }>(
    `${base}/${encodeURIComponent(providerId)}`,
    body,
    { token },
  );
}

export async function deletePlatformAdminMailProvider(
  token: string,
  providerId: string,
) {
  await deleteJson(`${base}/${encodeURIComponent(providerId)}`, token);
}

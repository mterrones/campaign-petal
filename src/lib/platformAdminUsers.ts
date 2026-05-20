import { getJson, patchJson, postJson, mailingApiV1Path } from "@/lib/api";

const base = `${mailingApiV1Path}/platform/admin`;

export type PlatformAdminUserRow = {
  id: string;
  email: string;
  clientId: string | null;
  createdAt: string;
};

export const platformAdminUsersQueryKey = ["platform", "admin", "users"] as const;

export async function fetchPlatformAdminUsers(token: string) {
  return getJson<{ users: PlatformAdminUserRow[] }>(`${base}/users`, token);
}

export async function createPlatformAdminUser(
  token: string,
  body: { email: string; password: string; clientId?: string | null },
) {
  return postJson<{ user: PlatformAdminUserRow }>(`${base}/users`, body, {
    token,
  });
}

export async function patchPlatformAdminUser(
  token: string,
  userId: string,
  body: { email?: string; clientId?: string | null },
) {
  return patchJson<{ user: Omit<PlatformAdminUserRow, "createdAt"> }>(
    `${base}/users/${encodeURIComponent(userId)}`,
    body,
    { token },
  );
}

export async function patchPlatformAdminUserPassword(
  token: string,
  userId: string,
  password: string,
) {
  return patchJson<{ ok: boolean }>(
    `${base}/users/${encodeURIComponent(userId)}/password`,
    { password },
    { token },
  );
}

export type ImpersonatePlatformUserResponse = {
  token: string;
  user: {
    id: string;
    email: string;
    clientId: string | null;
    sendingDomains?: string[];
    defaultFrom?: string | null;
    impersonation: { id: string; email: string };
  };
};

export async function impersonatePlatformAdminUser(token: string, userId: string) {
  return postJson<ImpersonatePlatformUserResponse>(
    `${base}/users/${encodeURIComponent(userId)}/impersonate`,
    {},
    { token },
  );
}

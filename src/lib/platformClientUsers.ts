import { getJson, patchJson, postJson, mailingApiV1Path } from "@/lib/api";
import type { ClientRole } from "@/context/AuthContext";

const base = `${mailingApiV1Path}/platform/client/users`;

export type ClientUserRow = {
  id: string;
  email: string;
  clientRole: ClientRole;
  disabled: boolean;
  createdAt: string;
};

export const clientUsersQueryKey = ["platform", "client", "users"] as const;

export const CLIENT_ROLE_LABELS: Record<ClientRole, string> = {
  admin: "Administrador",
  member: "Miembro",
};

export async function fetchClientUsers(token: string) {
  return getJson<{ users: ClientUserRow[] }>(base, token);
}

export async function createClientUser(
  token: string,
  body: { email: string; password: string; clientRole: ClientRole },
) {
  return postJson<{ user: ClientUserRow }>(base, body, { token });
}

export async function patchClientUser(
  token: string,
  userId: string,
  body: { clientRole?: ClientRole; disabled?: boolean },
) {
  return patchJson<{ user: Omit<ClientUserRow, "createdAt"> }>(
    `${base}/${encodeURIComponent(userId)}`,
    body,
    { token },
  );
}

export async function patchClientUserPassword(
  token: string,
  userId: string,
  password: string,
) {
  return patchJson<{ ok: boolean }>(
    `${base}/${encodeURIComponent(userId)}/password`,
    { password },
    { token },
  );
}

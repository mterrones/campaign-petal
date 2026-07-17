import {
  deleteJson,
  getJson,
  patchJson,
  postJson,
  mailingApiV1Path,
} from "@/lib/api";

const base = `${mailingApiV1Path}/platform/admin/clients`;

export type AdminClientDomain = {
  id: string;
  domain: string;
  isDefault: boolean;
  createdAt: string;
};

export type AdminClientMailProvider = {
  id: string;
  name: string;
  isActive: boolean;
  isDefault: boolean;
};

export type AdminClientRow = {
  id: string;
  name: string;
  createdAt: string;
  mailProvider: AdminClientMailProvider | null;
  domains: AdminClientDomain[];
};

export const platformAdminClientsQueryKey = [
  "platform",
  "admin",
  "clients",
] as const;

export async function fetchPlatformAdminClients(token: string) {
  return getJson<{ clients: AdminClientRow[] }>(base, token);
}

export async function createPlatformAdminClient(
  token: string,
  body: { name: string; initialDomain?: string; mailProviderId?: string },
) {
  return postJson<{ client: AdminClientRow }>(base, body, { token });
}

export async function patchPlatformAdminClient(
  token: string,
  clientId: string,
  body: { name?: string; mailProviderId?: string },
) {
  return patchJson<{ client: AdminClientRow }>(
    `${base}/${encodeURIComponent(clientId)}`,
    body,
    { token },
  );
}

export async function deletePlatformAdminClient(token: string, clientId: string) {
  await deleteJson(`${base}/${encodeURIComponent(clientId)}`, token);
}

export async function addPlatformAdminClientDomain(
  token: string,
  clientId: string,
  body: { domain: string; isDefault?: boolean },
) {
  return postJson<{ domain: AdminClientDomain }>(
    `${base}/${encodeURIComponent(clientId)}/domains`,
    body,
    { token },
  );
}

export async function deletePlatformAdminClientDomain(
  token: string,
  clientId: string,
  domainId: string,
) {
  await deleteJson(
    `${base}/${encodeURIComponent(clientId)}/domains/${encodeURIComponent(domainId)}`,
    token,
  );
}

export async function setPlatformAdminClientDefaultDomain(
  token: string,
  clientId: string,
  domainId: string,
) {
  return patchJson<{ domain: AdminClientDomain }>(
    `${base}/${encodeURIComponent(clientId)}/domains/${encodeURIComponent(domainId)}`,
    { isDefault: true },
    { token },
  );
}

import {
  deleteJson,
  getJson,
  patchJson,
  postJson,
  mailingApiV1Path,
} from "@/lib/api";

const base = `${mailingApiV1Path}/platform`;

export type PlatformContactDirectory = {
  id: string;
  name: string;
  color: string;
  isDefault: boolean;
  createdAt: string;
  contactCount: number;
  activeCount: number;
};

export type PlatformContact = {
  id: string;
  directoryId: string;
  email: string;
  name: string;
  lastName: string;
  tags: string[];
  status: "active" | "unsubscribed" | "bounced";
  createdAt: string;
};

export const platformContactDirectoriesQueryKey = ["platform", "contact-directories"] as const;

export const platformContactsListQueryKey = (
  directoryId: string | undefined,
  q: string,
  page: number,
) => ["platform", "contacts", directoryId ?? "all", q, page] as const;

export const platformContactsStatsQueryKey = ["platform", "contacts", "stats"] as const;

export const platformEmailSuppressionsQueryKey = ["platform", "email-suppressions"] as const;

export type PlatformEmailSuppressionItem = {
  email: string;
  createdAt: string;
};

export function fetchEmailSuppressions(
  token: string,
  options: { page?: number; limit?: number },
): Promise<{
  items: PlatformEmailSuppressionItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  const sp = new URLSearchParams();
  if (options.page) sp.set("page", String(options.page));
  if (options.limit) sp.set("limit", String(options.limit));
  const q = sp.toString();
  return getJson(`${base}/email-suppressions${q ? `?${q}` : ""}`, token);
}

export function addEmailSuppression(
  token: string,
  body: { email: string },
): Promise<{ ok: boolean }> {
  return postJson(`${base}/email-suppressions`, body, { token });
}

export function removeEmailSuppression(token: string, email: string): Promise<void> {
  return deleteJson(`${base}/email-suppressions/${encodeURIComponent(email)}`, token);
}

export function fetchContactDirectories(token: string): Promise<{
  directories: PlatformContactDirectory[];
}> {
  return getJson(`${base}/contact-directories`, token);
}

export function fetchContactsPage(
  token: string,
  options: {
    directoryId?: string;
    q?: string;
    page?: number;
    limit?: number;
  },
): Promise<{
  contacts: PlatformContact[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  const sp = new URLSearchParams();
  if (options.directoryId && options.directoryId !== "all") {
    sp.set("directoryId", options.directoryId);
  }
  if (options.q?.trim()) sp.set("q", options.q.trim());
  if (options.page) sp.set("page", String(options.page));
  if (options.limit) sp.set("limit", String(options.limit));
  const q = sp.toString();
  return getJson(`${base}/contacts${q ? `?${q}` : ""}`, token);
}

export function fetchContactsActiveCount(
  token: string,
  directoryId: string | "all",
): Promise<{ count: number }> {
  const sp = new URLSearchParams({ directoryId });
  return getJson(`${base}/contacts/active-count?${sp.toString()}`, token);
}

export function fetchContactsStats(token: string): Promise<{ activeCount: number }> {
  return getJson(`${base}/contacts/stats`, token);
}

export function fetchActiveEmailsForAgenda(
  token: string,
  directoryId: string | "all",
): Promise<{ emails: string[] }> {
  const sp = new URLSearchParams({ directoryId });
  return getJson(`${base}/contacts/active-emails?${sp.toString()}`, token);
}

export function createContactDirectory(
  token: string,
  body: { name: string; color?: string },
): Promise<{ directory: PlatformContactDirectory }> {
  return postJson(`${base}/contact-directories`, body, { token });
}

export function updateContactDirectory(
  token: string,
  id: string,
  body: { name?: string; color?: string },
): Promise<{ directory: PlatformContactDirectory }> {
  return patchJson(`${base}/contact-directories/${encodeURIComponent(id)}`, body, {
    token,
  });
}

export function deleteContactDirectory(token: string, id: string): Promise<void> {
  return deleteJson(`${base}/contact-directories/${encodeURIComponent(id)}`, token);
}

export function createPlatformContact(
  token: string,
  body: {
    directoryId: string;
    email: string;
    name?: string;
    lastName?: string;
    tags?: string[];
  },
): Promise<{ contact: PlatformContact }> {
  return postJson(`${base}/contacts`, body, { token });
}

export function createPlatformContactsBatch(
  token: string,
  body: {
    directoryId: string;
    contacts: {
      email: string;
      name?: string;
      lastName?: string;
      tags?: string[];
    }[];
  },
): Promise<{ inserted: number; skipped: number }> {
  return postJson(`${base}/contacts/batch`, body, { token });
}

export function bulkDeleteContacts(
  token: string,
  ids: string[],
): Promise<{ deleted: number }> {
  return postJson(`${base}/contacts/bulk-delete`, { ids }, { token });
}

export function bulkMoveContacts(
  token: string,
  ids: string[],
  directoryId: string,
): Promise<{ moved: number }> {
  return postJson(`${base}/contacts/bulk-move`, { ids, directoryId }, { token });
}

export function deletePlatformContact(token: string, id: string): Promise<void> {
  return deleteJson(`${base}/contacts/${encodeURIComponent(id)}`, token);
}

export function updatePlatformContact(
  token: string,
  id: string,
  body: {
    directoryId?: string;
    email?: string;
    name?: string;
    lastName?: string;
    tags?: string[];
    status?: "active" | "unsubscribed" | "bounced";
  },
): Promise<{ contact: PlatformContact }> {
  return patchJson(`${base}/contacts/${encodeURIComponent(id)}`, body, { token });
}

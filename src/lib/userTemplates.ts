import {
  deleteJson,
  getJson,
  mailingApiV1Path,
  patchJson,
  postJson,
} from "@/lib/api";
import type { EmailBlock, GlobalEmailStyles } from "@/components/email-editor/types";

const STORAGE_KEY = "enviamas_user_templates";
const base = `${mailingApiV1Path}/platform/email-templates`;

export interface UserTemplate {
  id: string;
  name: string;
  description: string;
  subject: string;
  blocks: EmailBlock[];
  globalStyles: Partial<GlobalEmailStyles>;
  createdAt: string;
  updatedAt: string;
}

export type EmailTemplateWrite = {
  name: string;
  description: string;
  subject: string;
  blocks: EmailBlock[];
  globalStyles: Partial<GlobalEmailStyles>;
};

export const platformEmailTemplatesQueryKey = ["platform-email-templates"] as const;

export function platformEmailTemplateQueryKey(id: string | undefined) {
  return ["platform-email-template", id] as const;
}

function readLocalTemplates(): UserTemplate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function clearLocalTemplates(): void {
  localStorage.removeItem(STORAGE_KEY);
}

function asUserTemplate(raw: UserTemplate): UserTemplate {
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description ?? "",
    subject: raw.subject ?? "",
    blocks: Array.isArray(raw.blocks) ? raw.blocks : [],
    globalStyles: raw.globalStyles ?? {},
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

export async function listEmailTemplates(token: string): Promise<UserTemplate[]> {
  const data = await getJson<{ templates: UserTemplate[] }>(base, token);
  return (data.templates ?? []).map(asUserTemplate);
}

export async function getEmailTemplate(
  token: string,
  id: string,
): Promise<UserTemplate> {
  const data = await getJson<{ template: UserTemplate }>(
    `${base}/${encodeURIComponent(id)}`,
    token,
  );
  return asUserTemplate(data.template);
}

export async function createEmailTemplate(
  token: string,
  body: EmailTemplateWrite,
): Promise<UserTemplate> {
  const data = await postJson<{ template: UserTemplate }>(base, body, { token });
  return asUserTemplate(data.template);
}

export async function updateEmailTemplate(
  token: string,
  id: string,
  body: EmailTemplateWrite,
): Promise<UserTemplate> {
  const data = await patchJson<{ template: UserTemplate }>(
    `${base}/${encodeURIComponent(id)}`,
    body,
    { token },
  );
  return asUserTemplate(data.template);
}

export async function deleteEmailTemplate(
  token: string,
  id: string,
): Promise<void> {
  await deleteJson(`${base}/${encodeURIComponent(id)}`, token);
}

export async function persistEmailTemplate(
  token: string,
  body: EmailTemplateWrite,
  existingId?: string | null,
): Promise<UserTemplate> {
  const saved = existingId
    ? await updateEmailTemplate(token, existingId, body)
    : await createEmailTemplate(token, body);
  const verified = await getEmailTemplate(token, saved.id);
  if (verified.id !== saved.id) {
    throw new Error("TEMPLATE_PERSIST_UNVERIFIED");
  }
  return verified;
}

export async function duplicateEmailTemplate(
  token: string,
  id: string,
): Promise<UserTemplate> {
  const source = await getEmailTemplate(token, id);
  return persistEmailTemplate(token, {
    name: `${source.name} (copia)`,
    description: source.description,
    subject: source.subject,
    blocks: JSON.parse(JSON.stringify(source.blocks)) as EmailBlock[],
    globalStyles: { ...source.globalStyles },
  });
}

export async function migrateLocalTemplatesIfNeeded(
  token: string,
  remote: UserTemplate[],
): Promise<UserTemplate[]> {
  if (remote.length > 0) return remote;
  const local = readLocalTemplates();
  if (local.length === 0) return remote;

  const created: UserTemplate[] = [];
  let failed = false;
  for (const tpl of local) {
    if (!tpl.blocks || tpl.blocks.length === 0 || !tpl.name?.trim()) continue;
    try {
      created.push(
        await persistEmailTemplate(token, {
          name: tpl.name.trim(),
          description: tpl.description ?? "",
          subject: tpl.subject ?? "",
          blocks: tpl.blocks,
          globalStyles: tpl.globalStyles ?? {},
        }),
      );
    } catch {
      failed = true;
    }
  }
  if (!failed) clearLocalTemplates();
  return created.sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
}

export async function listEmailTemplatesWithMigration(
  token: string,
): Promise<UserTemplate[]> {
  const remote = await listEmailTemplates(token);
  return migrateLocalTemplatesIfNeeded(token, remote);
}

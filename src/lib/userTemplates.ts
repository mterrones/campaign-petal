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
  /** Visible to the other users of the owner's company. */
  shared: boolean;
  ownerEmail: string;
  isOwner: boolean;
  /** Owner, or a company admin on a shared template. Others can only use/duplicate. */
  canEdit: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EmailTemplateList {
  templates: UserTemplate[];
  /** False when the account has no company, so it cannot share templates. */
  canShare: boolean;
}

export type EmailTemplateWrite = {
  name: string;
  description: string;
  subject: string;
  blocks: EmailBlock[];
  globalStyles: Partial<GlobalEmailStyles>;
  /** Omit on update to keep the current sharing. */
  shared?: boolean;
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
    shared: raw.shared === true,
    ownerEmail: raw.ownerEmail ?? "",
    isOwner: raw.isOwner !== false,
    canEdit: raw.canEdit !== false,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

export async function listEmailTemplates(token: string): Promise<EmailTemplateList> {
  const data = await getJson<{ templates: UserTemplate[]; canShare?: boolean }>(
    base,
    token,
  );
  return {
    templates: (data.templates ?? []).map(asUserTemplate),
    canShare: data.canShare === true,
  };
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

export async function setEmailTemplateShared(
  token: string,
  id: string,
  shared: boolean,
): Promise<UserTemplate> {
  const data = await patchJson<{ template: UserTemplate }>(
    `${base}/${encodeURIComponent(id)}/sharing`,
    { shared },
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
  // Templates shared by teammates do not mean this user already migrated.
  if (remote.some((t) => t.isOwner)) return remote;
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
  return [...created, ...remote].sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
}

export async function listEmailTemplatesWithMigration(
  token: string,
): Promise<EmailTemplateList> {
  const remote = await listEmailTemplates(token);
  const templates = await migrateLocalTemplatesIfNeeded(token, remote.templates);
  return { templates, canShare: remote.canShare };
}

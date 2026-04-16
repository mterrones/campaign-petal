import { EmailBlock, GlobalEmailStyles } from "@/components/email-editor/types";

const STORAGE_KEY = "enviamas_user_templates";

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

function read(): UserTemplate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(templates: UserTemplate[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
    window.dispatchEvent(new Event("user-templates-changed"));
  } catch {
    /* ignore quota errors */
  }
}

export function listUserTemplates(): UserTemplate[] {
  return read().sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
}

export function getUserTemplate(id: string): UserTemplate | null {
  return read().find((t) => t.id === id) ?? null;
}

export function saveUserTemplate(
  data: Omit<UserTemplate, "id" | "createdAt" | "updatedAt"> & { id?: string },
): UserTemplate {
  const all = read();
  const now = new Date().toISOString();
  if (data.id) {
    const idx = all.findIndex((t) => t.id === data.id);
    if (idx !== -1) {
      const updated: UserTemplate = {
        ...all[idx],
        ...data,
        id: all[idx].id,
        createdAt: all[idx].createdAt,
        updatedAt: now,
      };
      all[idx] = updated;
      write(all);
      return updated;
    }
  }
  const created: UserTemplate = {
    id: `ut-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: data.name,
    description: data.description,
    subject: data.subject,
    blocks: data.blocks,
    globalStyles: data.globalStyles,
    createdAt: now,
    updatedAt: now,
  };
  all.unshift(created);
  write(all);
  return created;
}

export function duplicateUserTemplate(id: string): UserTemplate | null {
  const tpl = getUserTemplate(id);
  if (!tpl) return null;
  return saveUserTemplate({
    name: `${tpl.name} (copia)`,
    description: tpl.description,
    subject: tpl.subject,
    blocks: JSON.parse(JSON.stringify(tpl.blocks)),
    globalStyles: { ...tpl.globalStyles },
  });
}

export function deleteUserTemplate(id: string): void {
  write(read().filter((t) => t.id !== id));
}

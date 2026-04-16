import { contacts } from "@/data/mockData";

export function countActiveEmailsForAgenda(directoryId: string): number {
  return getActiveEmailsForAgenda(directoryId).length;
}

export function getActiveEmailsForAgenda(directoryId: string): string[] {
  const active = contacts.filter((c) => c.status === "active");
  const list =
    directoryId === "all"
      ? active
      : active.filter((c) => c.directoryId === directoryId);
  const emails = list.map((c) => c.email.trim().toLowerCase());
  return [...new Set(emails)];
}

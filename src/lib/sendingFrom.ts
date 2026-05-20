export type ParsedDefaultFrom = {
  displayName: string;
  localPart: string;
  domain: string | null;
};

const LOCAL_PART_RE = /^[a-zA-Z0-9](?:[a-zA-Z0-9._+-]{0,62}[a-zA-Z0-9])?$/;

export function parseDefaultFrom(defaultFrom: string | null): ParsedDefaultFrom {
  const fallback = {
    displayName: "",
    localPart: "",
    domain: null as string | null,
  };
  if (!defaultFrom?.trim()) return fallback;

  const trimmed = defaultFrom.trim();
  const m = /^\s*(.+?)\s*<([^>]+)>\s*$/.exec(trimmed);
  const emailPart = m ? m[2].trim() : trimmed;
  const displayName = m ? m[1].trim().replace(/^["']|["']$/g, "") : "";
  const at = emailPart.lastIndexOf("@");
  if (at <= 0 || at >= emailPart.length - 1) {
    return { displayName, localPart: "", domain: null };
  }
  const localPart = emailPart.slice(0, at).trim();
  const domain = emailPart.slice(at + 1).trim().toLowerCase();
  return { displayName, localPart, domain };
}

export function buildFromHeader(
  displayName: string,
  localPart: string,
  domain: string,
): string {
  const local = localPart.trim();
  const host = domain.trim().toLowerCase();
  const addr = `${local}@${host}`;
  const name = displayName.trim();
  if (!name) return addr;
  return `${name} <${addr}>`;
}

export function validateLocalPart(localPart: string): string | null {
  const trimmed = localPart.trim();
  if (!trimmed) return "Indica la parte antes de @.";
  if (/\s/.test(trimmed)) return "No debe contener espacios.";
  if (trimmed.includes("@")) return "No incluyas @ ni el dominio.";
  if (!LOCAL_PART_RE.test(trimmed)) {
    return "Usa solo letras, números y . _ + -";
  }
  return null;
}

export function validateDisplayName(displayName: string): string | null {
  const trimmed = displayName.trim();
  if (!trimmed) return null;
  if (/[<>]/.test(trimmed)) return "El nombre no puede incluir < ni >.";
  return null;
}

export function resolveInitialSendDomain(sendingDomains: string[]): string {
  return sendingDomains[0] ?? "";
}

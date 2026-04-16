const GMT_MINUS_5_ZONE = "America/Bogota";

export function formatDateTimeGmtMinus5(iso: string | null | undefined): string {
  if (iso == null || iso === "") return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d
    .toLocaleString("sv-SE", {
      timeZone: GMT_MINUS_5_ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
    .replace("T", " ");
}

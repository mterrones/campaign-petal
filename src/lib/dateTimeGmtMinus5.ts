export const GMT_MINUS_5_ZONE = "America/Lima";

function zonedParts(d: Date): {
  year: string;
  month: string;
  day: string;
  hour: string;
  minute: string;
  second: string;
} {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: GMT_MINUS_5_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "";
  const hourRaw = get("hour");
  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: hourRaw === "24" ? "00" : hourRaw,
    minute: get("minute"),
    second: get("second"),
  };
}

export function formatDateTimeGmtMinus5(iso: string | null | undefined): string {
  if (iso == null || iso === "") return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const { year, month, day, hour, minute, second } = zonedParts(d);
  if (!year || !month || !day) return "—";
  return `${day}-${month}-${year} ${hour}:${minute}:${second}`;
}

export function calendarDateGmtMinus5(d: Date = new Date()): string {
  const { year, month, day } = zonedParts(d);
  return `${year}-${month}-${day}`;
}

export function shiftCalendarDateGmtMinus5(
  ymd: string,
  deltaDays: number,
): string {
  const base = new Date(`${ymd}T12:00:00-05:00`);
  base.setTime(base.getTime() + deltaDays * 86400000);
  return calendarDateGmtMinus5(base);
}

export function formatChartDayLabel(ymd: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);
  if (!m) return ymd;
  return `${m[3]}-${m[2]}`;
}

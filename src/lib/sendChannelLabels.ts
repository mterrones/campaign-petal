export type AdminSendChannel = "smtp" | "ses_smtp" | "ses_api";

export function sendChannelLabel(channel: AdminSendChannel | string | undefined): string {
  if (channel === "ses_api") return "Cloud API";
  if (channel === "ses_smtp") return "Cloud SMTP";
  return "SMTP propio";
}

export function sendChannelBadge(channel: AdminSendChannel | string | undefined): string {
  if (channel === "ses_api") return "Cloud API";
  if (channel === "ses_smtp") return "Cloud SMTP";
  return "SMTP";
}

export function needsSmtpFields(channel: AdminSendChannel): boolean {
  return channel === "smtp" || channel === "ses_smtp";
}

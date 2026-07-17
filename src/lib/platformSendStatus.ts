import { getJson, mailingApiV1Path } from "@/lib/api";

export const TEST_DELIVERY_POLL_INTERVAL_MS = 2000;
export const TEST_DELIVERY_POLL_TIMEOUT_MS = 90_000;

export type PlatformMessageStatus = {
  id: string;
  deliveryStatus: string;
  errorCode?: string | null;
  errorDetail?: string | null;
  sentAt?: string | null;
};

export type TestDeliveryPhase = "pending" | "success" | "failure";

export function classifyTestDeliveryStatus(
  status: string,
): TestDeliveryPhase {
  if (status === "enqueued" || status === "delayed") {
    return "pending";
  }
  if (status === "sent" || status === "delivered" || status === "sandbox") {
    return "success";
  }
  if (status === "failed" || status === "bounced" || status === "blacklisted") {
    return "failure";
  }
  return "pending";
}

export function platformMessageStatusQueryKey(messageId: string) {
  return ["platform", "message-status", messageId] as const;
}

export async function fetchPlatformMessageStatus(
  token: string,
  messageId: string,
): Promise<PlatformMessageStatus> {
  return getJson<PlatformMessageStatus>(
    `${mailingApiV1Path}/platform/messages/${encodeURIComponent(messageId)}`,
    token,
  );
}

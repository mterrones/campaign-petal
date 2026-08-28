import { getJson, mailingApiV1Path } from "@/lib/api";

export type SmtpQueueStatus = {
  processingMessageId: string | null;
  pendingCount: number;
  lastStartedAt: string | null;
  lastFinishedAt: string | null;
  lastError: {
    messageId: string;
    message: string;
    at: string;
  } | null;
};

export type GatewayQueueStatus =
  | { configured: false }
  | {
      configured: true;
      main: {
        visible: number;
        inFlight: number;
        oldestMessageAgeSec: number | null;
      };
      dlq: { visible: number };
    };

export type AdminQueuesStatusResponse = {
  smtpQueue: SmtpQueueStatus;
  gatewayQueue: GatewayQueueStatus;
  fetchedAt: string;
};

export const adminQueuesStatusQueryKey = [
  "platform",
  "admin",
  "queues",
  "status",
] as const;

export async function fetchAdminQueuesStatus(token: string) {
  return getJson<AdminQueuesStatusResponse>(
    `${mailingApiV1Path}/platform/admin/queues/status`,
    token,
  );
}

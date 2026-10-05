import { getJson, postJson, mailingApiV1Path } from "@/lib/api";

const base = `${mailingApiV1Path}/platform`;

export type CampaignSendJobStatus =
  | "queued"
  | "running"
  | "completed"
  | "failed";

export type CampaignSendJob = {
  id: string;
  directoryId: string | null;
  campaignId: string | null;
  subject: string;
  status: CampaignSendJobStatus;
  total: number;
  processed: number;
  enqueued: number;
  blacklisted: number;
  failed: number;
  error: string | null;
  createdAt: string;
  updatedAt: string;
};

export const platformSendAgendaActiveQueryKey = [
  "platform",
  "send-agenda",
  "active",
] as const;

export function fetchActiveCampaignSendJob(
  token: string,
): Promise<{ job: CampaignSendJob | null }> {
  return getJson(`${base}/send-agenda/active`, token);
}

export function startCampaignAgendaSend(
  token: string,
  body: {
    directoryId: string;
    subject: string;
    html: string;
    from?: string;
    campaignId?: string;
  },
): Promise<{ job: CampaignSendJob }> {
  return postJson(`${base}/send-agenda`, body, { token });
}

export function isCampaignSendJobActive(
  status: CampaignSendJobStatus | undefined,
): boolean {
  return status === "queued" || status === "running";
}

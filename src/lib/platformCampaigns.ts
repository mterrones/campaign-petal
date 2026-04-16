export type PlatformCampaignStatus =
  | "draft"
  | "sending"
  | "sent"
  | "scheduled"
  | "paused";

export type PlatformCampaign = {
  id: string;
  name: string;
  subject: string;
  status: PlatformCampaignStatus;
  recipients: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  unsubscribed: number;
  createdAt: string;
  scheduledAt: string | null;
  sentAt: string | null;
};

export type CampaignsListResponse = {
  campaigns: PlatformCampaign[];
};

export type CampaignOneResponse = {
  campaign: PlatformCampaign;
};

export type PlatformCampaignMessage = {
  id: string;
  to: string;
  deliveryStatus: string;
  sentAt: string | null;
  openCount: number;
  firstOpenedAt: string | null;
  clickCount: number;
  firstClickedAt: string | null;
  errorCode: string | null;
  errorDetail: string | null;
  createdAt: string;
};

export type CampaignMessagesResponse = {
  messages: PlatformCampaignMessage[];
  nextCursor: string | null;
};

export const platformCampaignsQueryKey = ["platform-campaigns"] as const;

export function platformCampaignQueryKey(id: string | undefined) {
  return ["platform-campaign", id] as const;
}

export function platformCampaignMessagesQueryKey(id: string | undefined) {
  return ["platform-campaign-messages", id] as const;
}

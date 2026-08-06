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
  total?: number;
  page?: number;
  pageSize?: number;
};

import { mailingApiV1Path } from "@/lib/api";
import type { MessageSort } from "@/lib/platformReports";

export type CampaignMessagesFilters = {
  statuses?: string[];
};

function applyCampaignMessagesFilters(
  sp: URLSearchParams,
  filters: CampaignMessagesFilters,
  sort?: MessageSort,
): void {
  if (filters.statuses && filters.statuses.length > 0) {
    sp.set("statuses", filters.statuses.join(","));
  }
  if (sort) {
    sp.set("sort", sort.field);
    sp.set("dir", sort.dir);
  }
}

export function buildCampaignMessagesPath(
  id: string,
  page: number,
  pageSize: number,
  filters: CampaignMessagesFilters = {},
  sort?: MessageSort,
): string {
  const sp = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  applyCampaignMessagesFilters(sp, filters, sort);
  return `${mailingApiV1Path}/platform/campaigns/${id}/messages?${sp.toString()}`;
}

export function buildCampaignMessagesExportPath(
  id: string,
  filters: CampaignMessagesFilters = {},
  sort?: MessageSort,
): string {
  const sp = new URLSearchParams();
  applyCampaignMessagesFilters(sp, filters, sort);
  const query = sp.toString();
  return `${mailingApiV1Path}/platform/campaigns/${id}/messages/export${query ? `?${query}` : ""}`;
}

export const platformCampaignsQueryKey = ["platform-campaigns"] as const;

export function platformCampaignQueryKey(id: string | undefined) {
  return ["platform-campaign", id] as const;
}

export function platformCampaignMessagesQueryKey(id: string | undefined) {
  return ["platform-campaign-messages", id] as const;
}

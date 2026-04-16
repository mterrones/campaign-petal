import { getJson } from "@/lib/api";

export const platformApiMessagesReportQueryKey = (
  from: string,
  to: string,
) => ["platform", "reports", "api-messages", from, to] as const;

export type ApiMessagesReportResponse = {
  aggregate: {
    total: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
  };
  byDay: {
    day: string;
    total: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
  }[];
  noClient?: boolean;
};

export function fetchApiMessagesReport(
  token: string,
  from: string,
  to: string,
): Promise<ApiMessagesReportResponse> {
  const sp = new URLSearchParams({ from, to });
  return getJson<ApiMessagesReportResponse>(
    `/v1/platform/reports/api-messages?${sp.toString()}`,
    token,
  );
}

export function defaultDateRange(days: number): { from: string; to: string } {
  const to = new Date();
  const from = new Date(to);
  from.setUTCDate(from.getUTCDate() - days);
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}

export const platformApiMessagesListQueryKey = (from: string, to: string) =>
  ["platform", "reports", "api-messages-list", from, to] as const;

export type ApiMessageListItem = {
  id: string;
  to: string;
  subject: string;
  deliveryStatus: string;
  sentAt: string | null;
  createdAt: string;
};

export type ApiMessagesListResponse = {
  messages: ApiMessageListItem[];
  nextCursor: string | null;
  noClient?: boolean;
};

export function fetchApiMessagesListPage(
  token: string,
  from: string,
  to: string,
  cursor: string | null,
  limit = 50,
): Promise<ApiMessagesListResponse> {
  const sp = new URLSearchParams({
    from,
    to,
    limit: String(limit),
  });
  if (cursor) sp.set("cursor", cursor);
  return getJson<ApiMessagesListResponse>(
    `/v1/platform/reports/api-messages/list?${sp.toString()}`,
    token,
  );
}

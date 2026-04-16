import { getJson, mailingApiV1Path } from "@/lib/api";

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
    `${mailingApiV1Path}/platform/reports/api-messages?${sp.toString()}`,
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

export const platformApiMessagesListQueryKey = (
  from: string,
  to: string,
  page: number,
  limit: number,
) => ["platform", "reports", "api-messages-list", from, to, page, limit] as const;

export type ApiMessageListItem = {
  id: string;
  to: string;
  subject: string;
  deliveryStatus: string;
  sentAt: string | null;
  createdAt: string;
  openCount: number;
  clickCount: number;
};

export type ApiMessagesListResponse = {
  messages: ApiMessageListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  noClient?: boolean;
};

export const defaultApiMessagesPageSize = 20;

export function fetchApiMessagesListPage(
  token: string,
  from: string,
  to: string,
  page: number,
  limit = defaultApiMessagesPageSize,
): Promise<ApiMessagesListResponse> {
  const sp = new URLSearchParams({
    from,
    to,
    page: String(page),
    limit: String(limit),
  });
  return getJson<ApiMessagesListResponse>(
    `${mailingApiV1Path}/platform/reports/api-messages/list?${sp.toString()}`,
    token,
  );
}

export type ApiMessagePreviewResponse = {
  subject: string;
  htmlBody: string | null;
  textBody: string | null;
};

export function fetchApiMessagePreview(
  token: string,
  messageId: string,
): Promise<ApiMessagePreviewResponse> {
  return getJson<ApiMessagePreviewResponse>(
    `${mailingApiV1Path}/platform/reports/api-messages/${encodeURIComponent(messageId)}/preview`,
    token,
  );
}

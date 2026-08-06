import { getJson, mailingApiV1Path } from "@/lib/api";
import {
  calendarDateGmtMinus5,
  shiftCalendarDateGmtMinus5,
} from "@/lib/dateTimeGmtMinus5";

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
  const to = calendarDateGmtMinus5();
  const from = shiftCalendarDateGmtMinus5(to, -days);
  return { from, to };
}

export type ApiMessagesListFilters = {
  email?: string;
  subject?: string;
  content?: string;
};

export const platformApiMessagesListQueryKey = (
  from: string,
  to: string,
  page: number,
  limit: number,
  filters: ApiMessagesListFilters = {},
) =>
  [
    "platform",
    "reports",
    "api-messages-list",
    from,
    to,
    page,
    limit,
    filters.email ?? "",
    filters.subject ?? "",
    filters.content ?? "",
  ] as const;

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
  filters: ApiMessagesListFilters = {},
): Promise<ApiMessagesListResponse> {
  const sp = new URLSearchParams({
    from,
    to,
    page: String(page),
    limit: String(limit),
  });
  if (filters.email) sp.set("email", filters.email);
  if (filters.subject) sp.set("subject", filters.subject);
  if (filters.content) sp.set("content", filters.content);
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

export type MessageTimelineResponse = {
  requestReceivedAt: string;
  sentAt: string | null;
  deliveredAt: string | null;
  bouncedAt: string | null;
  failedAt: string | null;
  firstOpenedAt: string | null;
  deliveryStatus: string;
};

export const messageTimelineQueryKey = (messageId: string | null) =>
  ["platform", "reports", "message-timeline", messageId] as const;

export function fetchMessageTimeline(
  token: string,
  messageId: string,
): Promise<MessageTimelineResponse> {
  return getJson<MessageTimelineResponse>(
    `${mailingApiV1Path}/platform/reports/messages/${encodeURIComponent(messageId)}/timeline`,
    token,
  );
}

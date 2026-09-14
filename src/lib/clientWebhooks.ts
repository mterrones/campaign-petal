export const WEBHOOK_STATUSES = [
  "sent",
  "delivered",
  "delayed",
  "bounced",
  "failed",
  "complaint",
  "open",
] as const;

export type ClientWebhookStatus = (typeof WEBHOOK_STATUSES)[number];

export type ClientWebhookRow = {
  id: string;
  clientId: string;
  url: string;
  statuses: ClientWebhookStatus[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  secretPreview: string;
  secret?: string;
};

export type ClientWebhookWriteBody = {
  url: string;
  statuses: ClientWebhookStatus[];
  isActive?: boolean;
};

export type ClientWebhookPatchBody = {
  url?: string;
  statuses?: ClientWebhookStatus[];
  isActive?: boolean;
};

export type ClientWebhooksApi = {
  queryKey: readonly unknown[];
  list: () => Promise<{ webhooks: ClientWebhookRow[] }>;
  create: (
    body: ClientWebhookWriteBody,
  ) => Promise<{ webhook: ClientWebhookRow }>;
  patch: (
    webhookId: string,
    body: ClientWebhookPatchBody,
  ) => Promise<{ webhook: ClientWebhookRow }>;
  remove: (webhookId: string) => Promise<void>;
};

import {
  deleteJson,
  getJson,
  patchJson,
  postJson,
  mailingApiV1Path,
} from "@/lib/api";
import type {
  ClientWebhookPatchBody,
  ClientWebhookRow,
  ClientWebhooksApi,
  ClientWebhookWriteBody,
} from "@/lib/clientWebhooks";

const base = `${mailingApiV1Path}/platform/webhooks`;

export function platformClientWebhooksQueryKey() {
  return ["platform", "webhooks"] as const;
}

export function createPlatformClientWebhooksApi(
  token: string,
): ClientWebhooksApi {
  return {
    queryKey: platformClientWebhooksQueryKey(),
    list: () => getJson<{ webhooks: ClientWebhookRow[] }>(base, token),
    create: (body: ClientWebhookWriteBody) =>
      postJson<{ webhook: ClientWebhookRow }>(base, body, { token }),
    patch: (webhookId: string, body: ClientWebhookPatchBody) =>
      patchJson<{ webhook: ClientWebhookRow }>(
        `${base}/${encodeURIComponent(webhookId)}`,
        body,
        { token },
      ),
    remove: async (webhookId: string) => {
      await deleteJson(`${base}/${encodeURIComponent(webhookId)}`, token);
    },
  };
}

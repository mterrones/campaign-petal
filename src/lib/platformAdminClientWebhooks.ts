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

const clientBase = `${mailingApiV1Path}/platform/admin/clients`;

export function platformAdminClientWebhooksQueryKey(clientId: string) {
  return ["platform", "admin", "clients", clientId, "webhooks"] as const;
}

export function createPlatformAdminClientWebhooksApi(
  token: string,
  clientId: string,
): ClientWebhooksApi {
  const base = `${clientBase}/${encodeURIComponent(clientId)}/webhooks`;
  return {
    queryKey: platformAdminClientWebhooksQueryKey(clientId),
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

export async function fetchPlatformAdminClientWebhooks(
  token: string,
  clientId: string,
) {
  return createPlatformAdminClientWebhooksApi(token, clientId).list();
}

export async function createPlatformAdminClientWebhook(
  token: string,
  clientId: string,
  body: ClientWebhookWriteBody,
) {
  return createPlatformAdminClientWebhooksApi(token, clientId).create(body);
}

export async function patchPlatformAdminClientWebhook(
  token: string,
  clientId: string,
  webhookId: string,
  body: ClientWebhookPatchBody,
) {
  return createPlatformAdminClientWebhooksApi(token, clientId).patch(
    webhookId,
    body,
  );
}

export async function deletePlatformAdminClientWebhook(
  token: string,
  clientId: string,
  webhookId: string,
) {
  await createPlatformAdminClientWebhooksApi(token, clientId).remove(webhookId);
}

export {
  WEBHOOK_STATUSES,
  type ClientWebhookRow,
  type ClientWebhookStatus,
} from "@/lib/clientWebhooks";

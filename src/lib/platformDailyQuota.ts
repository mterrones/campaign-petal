import { getJson } from "@/lib/api";

export type DailySendQuotaResponse = {
  limit: number;
  used: number;
  remaining: number;
  timezone: string;
};

export const platformDailySendQuotaQueryKey = [
  "platform",
  "daily-send-quota",
] as const;

export function fetchDailySendQuota(
  token: string,
): Promise<DailySendQuotaResponse> {
  return getJson<DailySendQuotaResponse>(
    "/v1/platform/daily-send-quota",
    token,
  );
}

import { getJson, mailingApiV1Path } from "@/lib/api";

type QuotaBase = {
  limit: number;
  used: number;
  remaining: number;
  timezone: string;
};

export type TestQuotaResponse = QuotaBase & {
  mode: "test";
  totalUsed: number;
  totalLimit: number | null;
};

export type ProductionQuotaResponse = QuotaBase & {
  mode: "production";
  tierLimit: number;
  streakDays: number;
  requiredDays: number;
  nextLimit: number | null;
  thresholds: {
    maxBouncePct: number;
    maxComplaintPct: number;
    minUtilizationPct: number;
    minDailyVolume: number;
  } | null;
  current: {
    day: string;
    bouncePct: number;
    complaintPct: number;
    utilizationPct: number;
    dailyVolume: number;
  } | null;
  braked: boolean;
};

export type DailySendQuotaResponse = TestQuotaResponse | ProductionQuotaResponse;

export const platformDailySendQuotaQueryKey = [
  "platform",
  "daily-send-quota",
] as const;

export function fetchDailySendQuota(
  token: string,
): Promise<DailySendQuotaResponse> {
  return getJson<DailySendQuotaResponse>(
    `${mailingApiV1Path}/platform/daily-send-quota`,
    token,
  );
}

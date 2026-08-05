import { getJson, mailingApiV1Path } from "@/lib/api";

export type DashboardStatsResponse = {
  noClient: boolean;
  bounce: {
    rate: number;
    bounced: number;
    finalized: number;
    windowDays: number;
  };
  complaint: {
    rate: number;
    complaints: number;
    sentOrDelivered: number;
    windowDays: number;
  };
  hourly: { hour: number; count: number }[];
  timezone: string;
};

export const platformDashboardStatsQueryKey = [
  "platform",
  "dashboard",
  "stats",
] as const;

export function fetchDashboardStats(
  token: string,
): Promise<DashboardStatsResponse> {
  return getJson<DashboardStatsResponse>(
    `${mailingApiV1Path}/platform/dashboard/stats`,
    token,
  );
}

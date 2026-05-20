import { getJson, mailingApiV1Path } from "@/lib/api";

export type DnsAuthRecordKind = "spf" | "dkim" | "dmarc";
export type DnsAuthCheckStatus = "ok" | "warning" | "missing" | "error";

export type DnsAuthCheck = {
  record: DnsAuthRecordKind;
  hostname: string;
  status: DnsAuthCheckStatus;
  message: string;
  values: string[];
  expectedValues?: string[];
  selector?: string;
};

export type DomainDnsAuthReport = {
  domain: string;
  checkedAt: string;
  checks: DnsAuthCheck[];
};

export async function fetchDomainDnsAuth(token: string, domain: string) {
  return getJson<DomainDnsAuthReport>(
    `${mailingApiV1Path}/platform/sending-domains/${encodeURIComponent(domain)}/dns-auth`,
    token,
  );
}

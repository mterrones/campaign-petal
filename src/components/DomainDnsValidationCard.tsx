import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, Loader2, ShieldCheck, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { ApiError } from "@/lib/api";
import {
  fetchDomainDnsAuth,
  type DnsAuthCheck,
  type DnsAuthCheckStatus,
  type DomainDnsAuthReport,
} from "@/lib/platformDomainDns";

const RECORD_LABELS: Record<DnsAuthCheck["record"], string> = {
  spf: "SPF",
  dkim: "DKIM",
  dmarc: "DMARC",
};

function StatusBadge({ status }: { status: DnsAuthCheckStatus }) {
  if (status === "ok") {
    return (
      <Badge variant="default" className="gap-1 bg-emerald-600 hover:bg-emerald-600">
        <CheckCircle2 className="w-3 h-3" />
        OK
      </Badge>
    );
  }
  if (status === "warning") {
    return (
      <Badge variant="secondary" className="gap-1 text-amber-700 bg-amber-100">
        <AlertTriangle className="w-3 h-3" />
        Revisar
      </Badge>
    );
  }
  if (status === "missing") {
    return (
      <Badge variant="destructive" className="gap-1">
        <XCircle className="w-3 h-3" />
        No encontrado
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="gap-1">
      <AlertTriangle className="w-3 h-3" />
      Error
    </Badge>
  );
}

type DomainDnsValidationCardProps = {
  domain: string;
  token: string;
};

export function DomainDnsValidationCard({ domain, token }: DomainDnsValidationCardProps) {
  const [report, setReport] = useState<DomainDnsAuthReport | null>(null);

  const validateMutation = useMutation({
    mutationFn: () => fetchDomainDnsAuth(token, domain),
    onSuccess: (data) => {
      setReport(data);
      const allOk = data.checks.every((c) => c.status === "ok");
      if (allOk) {
        toast.success(`DNS de ${domain}: SPF, DKIM y DMARC correctos`);
      } else {
        toast.message(`Validación de ${domain} completada`, {
          description: "Revisa los registros marcados como «No encontrado» o «Revisar».",
        });
      }
    },
    onError: (err: unknown) => {
      if (err instanceof ApiError) {
        toast.error(err.message);
        return;
      }
      toast.error("No se pudo consultar DNS. Intenta de nuevo.");
    },
  });

  return (
    <div className="rounded-md border bg-card p-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="font-mono text-sm font-medium">{domain}</span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={validateMutation.isPending}
          onClick={() => validateMutation.mutate()}
        >
          {validateMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <ShieldCheck className="w-4 h-4 mr-2" />
          )}
          Validar SPF, DKIM y DMARC
        </Button>
      </div>

      {report && report.domain === domain && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            Consultado: {new Date(report.checkedAt).toLocaleString()}
          </p>
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[90px]">Registro</TableHead>
                <TableHead className="min-w-[140px]">Host DNS</TableHead>
                <TableHead className="w-[120px]">Estado</TableHead>
                <TableHead className="min-w-[280px]">Detalle</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {report.checks.map((check) => (
                <TableRow key={`${check.record}-${check.hostname}`}>
                  <TableCell className="font-medium">
                    {RECORD_LABELS[check.record]}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {check.hostname}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={check.status} />
                  </TableCell>
                  <TableCell className="text-sm min-w-[240px] max-w-xl align-top">
                    <p>{check.message}</p>
                    {check.expectedValues && check.expectedValues.length > 0 && (
                      <div className="mt-2 space-y-1">
                        <p className="text-xs font-medium text-foreground">Esperado</p>
                        <ul className="space-y-1 text-xs font-mono break-all whitespace-pre-wrap">
                          {check.expectedValues.map((value, i) => (
                            <li
                              key={`exp-${i}`}
                              className="rounded border border-dashed border-primary/30 bg-primary/5 px-2 py-1.5 text-foreground"
                            >
                              {value}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {check.values.length > 0 && (
                      <div className="mt-2 space-y-1">
                        <p className="text-xs font-medium text-foreground">
                          {check.record === "spf" && check.values.length > 1
                            ? "Registros TXT actuales (SPF y otros)"
                            : "Registro actual"}
                        </p>
                        <ul className="space-y-1 text-xs text-muted-foreground font-mono break-all whitespace-pre-wrap">
                          {check.values.map((value, i) => (
                            <li
                              key={i}
                              className="rounded bg-muted/50 px-2 py-1.5 text-foreground"
                            >
                              {value}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        </div>
      )}
    </div>
  );
}

import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import {
  adminQueuesStatusQueryKey,
  fetchAdminQueuesStatus,
  type AdminQueuesStatusResponse,
} from "@/lib/platformAdminQueues";
import { Activity, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";

function healthBadge(data: AdminQueuesStatusResponse | undefined) {
  if (!data) return { label: "Cargando…", tone: "muted" as const };
  const smtpPending = data.smtpQueue.pendingCount;
  const smtpProcessing = data.smtpQueue.processingMessageId != null;
  const gw = data.gatewayQueue;
  if (gw.configured && gw.dlq.visible > 0) {
    return { label: "Crítico (DLQ)", tone: "destructive" as const };
  }
  if (
    gw.configured &&
    (gw.main.visible > 10 ||
      (gw.main.oldestMessageAgeSec != null && gw.main.oldestMessageAgeSec > 60))
  ) {
    return { label: "Atención", tone: "warning" as const };
  }
  if (smtpPending > 10 || smtpProcessing) {
    return { label: "Procesando SMTP", tone: "warning" as const };
  }
  return { label: "OK", tone: "success" as const };
}

const AdminQueues = () => {
  const { token } = useAuth();
  const statusQuery = useQuery({
    queryKey: adminQueuesStatusQueryKey,
    queryFn: () => fetchAdminQueuesStatus(token!),
    enabled: Boolean(token),
    refetchInterval: 15_000,
  });

  const health = healthBadge(statusQuery.data);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Colas</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Seguimiento de cola SMTP (backend) y cola gateway AWS (SQS).
          </p>
        </div>
        <Badge
          variant={
            health.tone === "destructive"
              ? "destructive"
              : health.tone === "warning"
                ? "secondary"
                : "outline"
          }
          className="gap-1.5"
        >
          {health.tone === "success" && (
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          )}
          {health.tone === "warning" && (
            <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
          )}
          {health.tone === "destructive" && (
            <AlertTriangle className="h-3.5 w-3.5" />
          )}
          {health.tone === "muted" && (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          )}
          {health.label}
        </Badge>
      </div>

      {statusQuery.isError && (
        <p className="text-sm text-destructive">No se pudo cargar el estado de las colas.</p>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Cola SMTP (backend)
            </CardTitle>
            <CardDescription>Procesamiento serial in-process en Coolify.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Pendientes" value={statusQuery.data?.smtpQueue.pendingCount ?? "—"} />
            <Row
              label="En curso"
              value={
                statusQuery.data?.smtpQueue.processingMessageId ?? "—"
              }
              mono
            />
            <Row
              label="Último inicio"
              value={statusQuery.data?.smtpQueue.lastStartedAt ?? "—"}
            />
            <Row
              label="Último fin"
              value={statusQuery.data?.smtpQueue.lastFinishedAt ?? "—"}
            />
            {statusQuery.data?.smtpQueue.lastError && (
              <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-xs mt-2">
                <p className="font-medium text-destructive">Último error SMTP</p>
                <p className="mt-1 font-mono break-all">
                  {statusQuery.data.smtpQueue.lastError.messageId}
                </p>
                <p className="mt-1 text-muted-foreground">
                  {statusQuery.data.smtpQueue.lastError.message}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Cola gateway (SQS)
            </CardTitle>
            <CardDescription>api.sl.mailling.enviamas.pe</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {!statusQuery.data?.gatewayQueue.configured ? (
              <p className="text-muted-foreground text-xs leading-relaxed">
                Gateway no configurado en el backend (faltan{" "}
                <code className="bg-muted px-1 rounded">GATEWAY_SQS_*</code>). Solo se
                muestra la cola SMTP.
              </p>
            ) : (
              <>
                <Row label="Visibles" value={statusQuery.data.gatewayQueue.main.visible} />
                <Row
                  label="En vuelo"
                  value={statusQuery.data.gatewayQueue.main.inFlight}
                />
                <Row
                  label="Edad más antigua (s)"
                  value={
                    statusQuery.data.gatewayQueue.main.oldestMessageAgeSec ?? "—"
                  }
                />
                <Row
                  label="DLQ"
                  value={statusQuery.data.gatewayQueue.dlq.visible}
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {statusQuery.data?.fetchedAt && (
        <p className="text-xs text-muted-foreground">
          Actualizado: {new Date(statusQuery.data.fetchedAt).toLocaleString()} · refresh
          15s
        </p>
      )}
    </div>
  );
};

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string | number;
  mono?: boolean;
}) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className={mono ? "font-mono text-xs break-all text-right" : "font-medium"}>
        {value}
      </span>
    </div>
  );
}

export default AdminQueues;

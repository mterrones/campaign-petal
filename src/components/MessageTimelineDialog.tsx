import { useQuery } from "@tanstack/react-query";
import { Inbox, Send, CheckCircle2, Eye, XCircle, AlertTriangle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";
import { formatDateTimeGmtMinus5 } from "@/lib/dateTimeGmtMinus5";
import {
  fetchMessageTimeline,
  messageTimelineQueryKey,
} from "@/lib/platformReports";
import {
  resolveStatusReason,
  resolveTimelineStep,
  type TimelineStepKey,
} from "@/lib/messageDetail";
import DeliveryStatusBadge from "@/components/reports/DeliveryStatusBadge";

type MessageTimelineDialogProps = {
  messageId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const timelineSteps: { key: TimelineStepKey; label: string; icon: LucideIcon }[] =
  [
    { key: "requestReceivedAt", label: "Recepción de petición", icon: Inbox },
    { key: "sentAt", label: "Envío desde el servidor", icon: Send },
    { key: "deliveredAt", label: "Confirmación de recepción", icon: CheckCircle2 },
    { key: "firstOpenedAt", label: "Apertura", icon: Eye },
  ];

const MessageTimelineDialog = ({
  messageId,
  open,
  onOpenChange,
}: MessageTimelineDialogProps) => {
  const { token } = useAuth();

  const detailQuery = useQuery({
    queryKey: messageTimelineQueryKey(messageId),
    queryFn: () => fetchMessageTimeline(token!, messageId!),
    enabled: open && !!token && !!messageId,
  });

  const detail = detailQuery.data;
  const reason = detail ? resolveStatusReason(detail) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="pr-8 leading-snug">
            {detail?.subject?.trim() || "Detalle del envío"}
          </DialogTitle>
          <DialogDescription>
            {detail ? detail.toAddress : "Detalle del mensaje enviado."}
          </DialogDescription>
        </DialogHeader>

        {detailQuery.isPending && (
          <p className="text-sm text-muted-foreground py-6 text-center">
            Cargando detalle…
          </p>
        )}
        {detailQuery.isError && (
          <p className="text-sm text-destructive py-6 text-center">
            No se pudo cargar el detalle.
          </p>
        )}

        {detail && !detailQuery.isPending && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <DeliveryStatusBadge
                status={detail.deliveryStatus}
                reason={reason}
              />
              {detail.cc.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  CC: {detail.cc.join(", ")}
                </span>
              )}
              {detail.bcc.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  BCC: {detail.bcc.join(", ")}
                </span>
              )}
            </div>

            {reason && (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-destructive">
                    Motivo
                  </p>
                  <p className="text-sm text-destructive/90 break-words">
                    {reason}
                  </p>
                </div>
              </div>
            )}

            <div>
              <h3 className="mb-3 text-sm font-semibold">Línea de tiempo</h3>
              <ol className="relative ml-3 border-l border-border">
                {timelineSteps.map((step) => {
                  const view = resolveTimelineStep(step.key, step.label, detail);
                  const isError = view.tone === "error";
                  const done = isError || view.terminal || view.value != null;
                  const Icon = isError ? XCircle : step.icon;
                  const detailText = view.value
                    ? formatDateTimeGmtMinus5(view.value)
                    : isError
                      ? "Sin fecha registrada"
                      : view.terminal
                        ? "—"
                        : "Pendiente";
                  return (
                    <li key={step.key} className="mb-6 ml-6 last:mb-0">
                      <span
                        className={`absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-background ${
                          isError
                            ? "bg-destructive/10 text-destructive"
                            : done
                              ? "bg-primary/10 text-primary"
                              : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <p
                        className={`text-sm font-medium ${
                          isError ? "text-destructive" : ""
                        }`}
                      >
                        {view.label}
                      </p>
                      <p className="text-xs text-muted-foreground tabular-nums">
                        {detailText}
                      </p>
                    </li>
                  );
                })}
              </ol>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-semibold">Contenido enviado</h3>
              <div className="rounded-md border bg-muted/20 overflow-hidden">
                {detail.htmlBody ? (
                  <iframe
                    title="Vista previa del correo"
                    sandbox=""
                    srcDoc={detail.htmlBody}
                    className="w-full min-h-[360px] border-0 bg-background"
                  />
                ) : detail.textBody ? (
                  <pre className="p-4 text-sm whitespace-pre-wrap font-sans overflow-auto">
                    {detail.textBody}
                  </pre>
                ) : (
                  <p className="p-6 text-sm text-muted-foreground text-center">
                    No hay cuerpo HTML ni texto guardado para este envío.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MessageTimelineDialog;

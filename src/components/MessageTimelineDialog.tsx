import { useQuery } from "@tanstack/react-query";
import { Inbox, Send, CheckCircle2, Eye } from "lucide-react";
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
  type MessageTimelineResponse,
} from "@/lib/platformReports";

type MessageTimelineDialogProps = {
  messageId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type TimelineStep = {
  key: keyof Pick<
    MessageTimelineResponse,
    "requestReceivedAt" | "sentAt" | "deliveredAt" | "firstOpenedAt"
  >;
  label: string;
  icon: LucideIcon;
};

const timelineSteps: TimelineStep[] = [
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

  const timelineQuery = useQuery({
    queryKey: messageTimelineQueryKey(messageId),
    queryFn: () => fetchMessageTimeline(token!, messageId!),
    enabled: open && !!token && !!messageId,
  });

  const timeline = timelineQuery.data;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Histórico de tiempos</DialogTitle>
          <DialogDescription>
            Línea de tiempo del mensaje: recepción, envío, confirmación y apertura.
          </DialogDescription>
        </DialogHeader>
        {timelineQuery.isPending && (
          <p className="text-sm text-muted-foreground py-6 text-center">
            Cargando tiempos…
          </p>
        )}
        {timelineQuery.isError && (
          <p className="text-sm text-destructive py-6 text-center">
            No se pudieron cargar los tiempos.
          </p>
        )}
        {timeline && !timelineQuery.isPending && (
          <ol className="relative ml-3 border-l border-border">
            {timelineSteps.map((step) => {
              const value = timeline[step.key];
              const done = value != null;
              const Icon = step.icon;
              return (
                <li key={step.key} className="mb-6 ml-6 last:mb-0">
                  <span
                    className={`absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-background ${
                      done
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <p className="text-sm font-medium">{step.label}</p>
                  <p className="text-xs text-muted-foreground tabular-nums">
                    {done ? formatDateTimeGmtMinus5(value) : "Pendiente"}
                  </p>
                </li>
              );
            })}
          </ol>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MessageTimelineDialog;

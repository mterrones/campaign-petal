export type DeliveryStatusTone =
  | "success"
  | "info"
  | "warning"
  | "destructive"
  | "muted";

export type DeliveryStatusMeta = {
  value: string;
  label: string;
  tone: DeliveryStatusTone;
};

export const DELIVERY_STATUS_OPTIONS: DeliveryStatusMeta[] = [
  { value: "enqueued", label: "En cola", tone: "warning" },
  { value: "sent", label: "Enviado", tone: "info" },
  { value: "delivered", label: "Entregado", tone: "success" },
  { value: "delayed", label: "Retrasado", tone: "warning" },
  { value: "bounced", label: "Rebotado", tone: "destructive" },
  { value: "failed", label: "Falló", tone: "destructive" },
  { value: "blacklisted", label: "Lista negra", tone: "muted" },
  { value: "sandbox", label: "Sandbox", tone: "muted" },
];

const STATUS_META_BY_VALUE = new Map(
  DELIVERY_STATUS_OPTIONS.map((option) => [option.value, option]),
);

export function getDeliveryStatusMeta(value: string): DeliveryStatusMeta {
  return (
    STATUS_META_BY_VALUE.get(value) ?? {
      value,
      label: value,
      tone: "muted",
    }
  );
}

export const DELIVERY_STATUS_TONE_CLASSES: Record<DeliveryStatusTone, string> = {
  success: "border-success/30 bg-success/10 text-success",
  info: "border-info/30 bg-info/10 text-info",
  warning: "border-warning/30 bg-warning/10 text-warning",
  destructive: "border-destructive/30 bg-destructive/10 text-destructive",
  muted: "border-border bg-muted text-muted-foreground",
};

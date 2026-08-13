import type { MessageTimelineResponse } from "@/lib/platformReports";

export type TimelineStepKey =
  | "requestReceivedAt"
  | "sentAt"
  | "deliveredAt"
  | "firstOpenedAt";

export type TimelineStepView = {
  label: string;
  value: string | null;
  tone: "normal" | "error";
  terminal: boolean;
};

export function resolveTimelineStep(
  key: TimelineStepKey,
  baseLabel: string,
  timeline: MessageTimelineResponse,
): TimelineStepView {
  if (key === "deliveredAt") {
    switch (timeline.deliveryStatus) {
      case "bounced":
        return {
          label: "Rebotado",
          value: timeline.bouncedAt,
          tone: "error",
          terminal: true,
        };
      case "failed":
        return {
          label: "Falló",
          value: timeline.failedAt,
          tone: "error",
          terminal: true,
        };
      case "blacklisted":
        return {
          label: "No enviado",
          value: null,
          tone: "error",
          terminal: true,
        };
      case "sandbox":
        return {
          label: "Simulado (sandbox)",
          value: timeline.sentAt,
          tone: "normal",
          terminal: true,
        };
      default:
        break;
    }
  }
  return {
    label: baseLabel,
    value: timeline[key],
    tone: "normal",
    terminal: false,
  };
}

export function resolveStatusReason(
  timeline: MessageTimelineResponse,
): string | null {
  if (timeline.deliveryStatus === "blacklisted") {
    return (
      timeline.errorDetail ||
      "Destinatario en lista de supresión; el mensaje no se envió."
    );
  }
  if (
    timeline.deliveryStatus === "bounced" ||
    timeline.deliveryStatus === "failed"
  ) {
    if (timeline.errorCode && timeline.errorDetail) {
      return `${timeline.errorCode}: ${timeline.errorDetail}`;
    }
    return timeline.errorDetail || timeline.errorCode || null;
  }
  return null;
}

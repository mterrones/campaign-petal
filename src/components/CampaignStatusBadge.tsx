import { Badge } from "@/components/ui/badge";

type CampaignStatus = "draft" | "sending" | "sent" | "scheduled" | "paused";

const statusConfig: Record<CampaignStatus, { label: string; className: string }> = {
  draft: { label: "Borrador", className: "bg-muted text-muted-foreground" },
  sending: { label: "Enviando", className: "bg-info/10 text-info border-info/20" },
  sent: { label: "Enviada", className: "bg-success/10 text-success border-success/20" },
  scheduled: { label: "Programada", className: "bg-warning/10 text-warning border-warning/20" },
  paused: { label: "Pausada", className: "bg-muted text-muted-foreground" },
};

const CampaignStatusBadge = ({ status }: { status: CampaignStatus }) => {
  const config = statusConfig[status];
  return (
    <Badge variant="outline" className={`text-xs font-medium ${config.className}`}>
      {config.label}
    </Badge>
  );
};

export default CampaignStatusBadge;

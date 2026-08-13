import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  DELIVERY_STATUS_TONE_CLASSES,
  getDeliveryStatusMeta,
} from "./deliveryStatusMeta";

type DeliveryStatusBadgeProps = {
  status: string;
  reason?: string | null;
  className?: string;
};

const DeliveryStatusBadge = ({
  status,
  reason,
  className,
}: DeliveryStatusBadgeProps) => {
  const meta = getDeliveryStatusMeta(status);
  const badge = (
    <Badge
      variant="outline"
      className={cn(DELIVERY_STATUS_TONE_CLASSES[meta.tone], className)}
    >
      {meta.label}
    </Badge>
  );

  const showReason =
    !!reason && (meta.tone === "destructive" || meta.tone === "muted");
  if (!showReason) return badge;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="cursor-help">{badge}</span>
      </TooltipTrigger>
      <TooltipContent className="max-w-[320px] break-words">
        {reason}
      </TooltipContent>
    </Tooltip>
  );
};

export default DeliveryStatusBadge;

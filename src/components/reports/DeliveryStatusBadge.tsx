import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  DELIVERY_STATUS_TONE_CLASSES,
  getDeliveryStatusMeta,
} from "./deliveryStatusMeta";

type DeliveryStatusBadgeProps = {
  status: string;
  className?: string;
};

const DeliveryStatusBadge = ({ status, className }: DeliveryStatusBadgeProps) => {
  const meta = getDeliveryStatusMeta(status);
  return (
    <Badge
      variant="outline"
      className={cn(DELIVERY_STATUS_TONE_CLASSES[meta.tone], className)}
    >
      {meta.label}
    </Badge>
  );
};

export default DeliveryStatusBadge;

import { HelpCircle, type LucideIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type RateStatCardProps = {
  title: string;
  percent: string;
  detail: string;
  icon: LucideIcon;
  iconColor?: string;
  tooltip: string;
};

const RateStatCard = ({
  title,
  percent,
  detail,
  icon: Icon,
  iconColor = "bg-primary/10 text-primary",
  tooltip,
}: RateStatCardProps) => {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <p className="text-sm text-muted-foreground">{title}</p>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="text-muted-foreground/70 hover:text-foreground"
                  aria-label={`Definición de ${title}`}
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-[240px]">{tooltip}</TooltipContent>
            </Tooltip>
          </div>
          <p className="text-3xl font-bold mt-1">{percent}</p>
          <p className="text-xs mt-2 text-muted-foreground">{detail}</p>
        </div>
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconColor}`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};

export default RateStatCard;

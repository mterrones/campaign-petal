import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  iconColor?: string;
}

const StatCard = ({ title, value, change, changeType = "neutral", icon: Icon, iconColor = "bg-primary/10 text-primary" }: StatCardProps) => {
  const changeColors = {
    positive: "text-success",
    negative: "text-destructive",
    neutral: "text-muted-foreground",
  };

  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
          {change && (
            <p className={`text-xs mt-2 font-medium ${changeColors[changeType]}`}>
              {change}
            </p>
          )}
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconColor}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;

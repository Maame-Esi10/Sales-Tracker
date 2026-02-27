import { ReactNode } from "react";

interface MetricCardProps {
  label: string;
  value: string;
  icon: ReactNode;
  trend?: string;
  trendUp?: boolean;
}

const MetricCard = ({ label, value, icon, trend, trendUp }: MetricCardProps) => (
  <div className="glass shadow-soft rounded-xl p-4 flex flex-col gap-2 animate-slide-up">
    <div className="flex items-center justify-between">
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
      <div className="text-accent">{icon}</div>
    </div>
    <div className="text-xl font-bold">{value}</div>
    {trend && (
      <span className={`text-xs font-medium ${trendUp ? "text-success" : "text-destructive"}`}>
        {trend}
      </span>
    )}
  </div>
);

export default MetricCard;

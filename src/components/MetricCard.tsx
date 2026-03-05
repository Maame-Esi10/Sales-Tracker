import { ReactNode } from "react";
import { motion } from "framer-motion";

interface MetricCardProps {
  label: string;
  value: string;
  icon: ReactNode;
  trend?: string;
  trendUp?: boolean;
  gradient?: boolean;
}

const MetricCard = ({ label, value, icon, trend, trendUp, gradient }: MetricCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    className={`rounded-xl p-4 flex flex-col gap-2 ${
      gradient
        ? "text-primary-foreground"
        : "glass shadow-soft"
    }`}
    style={gradient ? {
      background: "linear-gradient(135deg, hsl(270 45% 25%), hsl(270 50% 35%))",
      boxShadow: "0 4px 20px hsl(270 50% 30% / 0.25)",
    } : undefined}
  >
    <div className="flex items-center justify-between">
      <span className={`text-xs font-medium uppercase tracking-wide ${gradient ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{label}</span>
      <div className={gradient ? "text-primary-foreground/80" : "text-accent"}>{icon}</div>
    </div>
    <div className="text-xl font-bold">{value}</div>
    {trend && (
      <span className={`text-xs font-medium ${trendUp ? "text-success" : "text-destructive"}`}>
        {trend}
      </span>
    )}
  </motion.div>
);

export default MetricCard;

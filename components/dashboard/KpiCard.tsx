import { motion } from "framer-motion";
import { useCountUp } from "@/hooks/useCountUp";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  glowClass?: string;
  decimals?: number;
}

export function KpiCard({
  title,
  value,
  prefix = "",
  suffix = "",
  change,
  changeType = "neutral",
  icon: Icon,
  glowClass,
  decimals = 0,
}: KpiCardProps) {
  const animatedValue = useCountUp(value, 2000, decimals);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3 }}
      className={cn("glass-card p-6", glowClass)}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight text-foreground">
            {prefix}
            {animatedValue.toLocaleString()}
            {suffix}
          </p>
          {change && (
            <p
              className={cn(
                "text-xs font-medium",
                changeType === "positive" && "text-success",
                changeType === "negative" && "text-destructive",
                changeType === "neutral" && "text-muted-foreground"
              )}
            >
              {change}
            </p>
          )}
        </div>
        <div className="rounded-xl bg-accent/10 p-3">
          <Icon className="h-5 w-5 text-accent" />
        </div>
      </div>
    </motion.div>
  );
}

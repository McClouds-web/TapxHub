import { motion } from "framer-motion";
import { Clock, CheckCircle2, AlertCircle, FileText, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow, subHours, subDays } from "date-fns";

const getInitialActivities = () => {
  const now = new Date();
  return [
    {
      icon: CheckCircle2,
      text: "Project 'Brand Redesign' moved to Review",
      time: subHours(now, 2),
      color: "text-success",
      client: "Tapx Client"
    },
    {
      icon: FileText,
      text: "New Invoice #1041 issued",
      time: subHours(now, 4),
      color: "text-accent",
      client: "Tapx Client"
    },
    {
      icon: AlertCircle,
      text: "Phase 1: Wireframes completed",
      time: subHours(now, 6),
      color: "text-warning",
      client: "Tapx Client"
    },
    {
      icon: Clock,
      text: "System maintenance scheduled",
      time: subDays(now, 1),
      color: "text-muted-foreground",
      adminOnly: true
    },
    {
      icon: CheckCircle2,
      text: "Payment received (P3,200)",
      time: subDays(now, 2),
      color: "text-success",
      client: "Tapx Client"
    },
    {
      icon: Activity,
      text: "New signup: NovaTech",
      time: subDays(now, 3),
      color: "text-accent",
      adminOnly: true
    }
  ];
};

export function ActivityFeed() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const initialActivities = getInitialActivities();

  const filteredActivities = initialActivities.filter(a => {
    if (isAdmin) return true;
    return a.client === user?.name;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="glass-card p-8 group h-full"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Activity className="h-5 w-5 text-accent animate-pulse" />
          Recent Activity
        </h3>
        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 bg-white/40 px-3 py-1 rounded-full border border-white/40">
          Real-time
        </span>
      </div>
      <div className="space-y-6">
        {filteredActivities.map((activity, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-start gap-4 p-3 rounded-[1rem] transition-all hover:bg-white/40 border border-transparent hover:border-white/40 group/item"
          >
            <div className={cn(
              "p-2.5 rounded-xl transition-all group-hover/item:scale-110",
              activity.color.replace('text-', 'bg-') + "/10",
              activity.color
            )}>
              <activity.icon className="h-4 w-4 shrink-0" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-foreground leading-snug">{activity.text}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mt-1">
                {formatDistanceToNow(activity.time, { addSuffix: true })}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
      {filteredActivities.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center mb-4">
            <Activity className="h-6 w-6 text-muted-foreground/30" />
          </div>
          <p className="text-muted-foreground font-medium text-sm">No recent activity for your project.</p>
        </div>
      )}
    </motion.div>
  );
}

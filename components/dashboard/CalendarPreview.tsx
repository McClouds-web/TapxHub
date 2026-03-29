import { motion } from "framer-motion";
import { CalendarDays } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { format, addDays } from "date-fns";

const typeColors: Record<string, string> = {
  deadline: "bg-destructive/10 text-destructive",
  retainer: "bg-accent/10 text-accent",
  meeting: "bg-success/10 text-success",
};

export function CalendarPreview() {

  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const now = new Date();

  const initialUpcoming = [
    { date: addDays(now, 1), event: "Bloom Rebrand — Final Delivery", type: "deadline", client: "Bloom" },
    { date: addDays(now, 3), event: "Luna Studio — Retainer Renewal", type: "retainer", client: "Luna" },
    { date: addDays(now, 5), event: "NovaTech — SEO Report Due", type: "deadline", client: "NovaTech" },
    { date: addDays(now, 8), event: "Greenfield — Q1 Review Call", type: "meeting", client: "Greenfield" },
    { date: addDays(now, 2), event: "Brand Redesign — Feedback", type: "meeting", client: "Tapx Client" },
    { date: addDays(now, 4), event: "Phase 2: Development Start", type: "deadline", client: "Tapx Client" },
  ];

  const upcoming = initialUpcoming.filter(item => {
    if (isAdmin) return true;
    return item.client === user?.name || item.client === "Tapx Client"; // Mock filtering
  }).slice(0, isAdmin ? 6 : 4);


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="glass-card p-6"
    >
      <div className="mb-4 flex items-center gap-2">
        <CalendarDays className="h-5 w-5 text-accent" />
        <h3 className="text-lg font-semibold text-foreground">Upcoming</h3>
      </div>
      <div className="space-y-3">
        {upcoming.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + i * 0.08 }}
            className="flex items-center gap-3"
          >
            <span className="w-14 text-xs font-semibold text-muted-foreground">
              {format(item.date, "MMM d")}
            </span>
            <span
              className={`status-pill ${typeColors[item.type] || "bg-secondary text-muted-foreground"}`}
            >
              {item.type}
            </span>
            <span className="text-sm text-foreground">
              {item.event} {isAdmin && <span className="text-[10px] text-muted-foreground/50 ml-1">({item.client})</span>}
            </span>
          </motion.div>
        ))}
        {upcoming.length === 0 && (
          <p className="text-sm text-muted-foreground py-4 text-center">No upcoming events.</p>
        )}
      </div>
    </motion.div>
  );
}


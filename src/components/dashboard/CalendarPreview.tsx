import { motion } from "framer-motion";
import { CalendarDays, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { format, addDays } from "date-fns";

const typeColors: Record<string, string> = {
  deadline: "#ef4444",
  meeting: "#3b82f6",
  retainer: "#a855f7",
  personal: "#6b7280",
};

const typeLabelColors: Record<string, string> = {
  deadline: "rgba(239,68,68,0.1)",
  meeting: "rgba(59,130,246,0.1)",
  retainer: "rgba(168,85,247,0.1)",
  personal: "rgba(107,114,128,0.1)",
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

  const upcoming = initialUpcoming
    .filter((item) => {
      if (isAdmin) return true;
      return item.client === user?.name || item.client === "Tapx Client";
    })
    .slice(0, isAdmin ? 6 : 4);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      style={{
        background: "var(--glass-bg)",
        backdropFilter: "var(--glass-blur)",
        border: "1px solid var(--glass-border)",
        borderRadius: "var(--radius)",
      }}
      className="p-6"
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays
            className="h-5 w-5"
            style={{ color: "var(--brand-accent)" }}
          />
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">
            Upcoming
          </h3>
        </div>
        <button
          style={{
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
            borderRadius: "var(--radius-sm)",
            transition: "all 0.2s ease",
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-hover)]"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Event
        </button>
      </div>

      <div className="space-y-2">
        {upcoming.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + i * 0.08 }}
            className="flex items-center gap-3 p-2.5 rounded-[var(--radius-sm)]"
            style={{
              borderLeft: `3px solid ${typeColors[item.type] || "#6b7280"}`,
              background: "rgba(255,255,255,0.02)",
              transition: "background 0.15s ease",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.background =
                "rgba(255,255,255,0.05)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.background =
                "rgba(255,255,255,0.02)")
            }
          >
            {/* Date */}
            <span className="w-12 text-xs font-semibold text-[var(--text-secondary)] shrink-0">
              {format(item.date, "MMM d")}
            </span>

            {/* Event title */}
            <span className="text-sm text-[var(--text-primary)] flex-1 truncate">
              {item.event}
            </span>

            {/* Company badge */}
            {isAdmin && (
              <span
                className="text-[10px] px-2 py-0.5 rounded-full shrink-0"
                style={{
                  background: typeLabelColors[item.type] || "var(--glass-bg)",
                  border: "1px solid var(--glass-border)",
                  color: "var(--text-secondary)",
                }}
              >
                {item.client}
              </span>
            )}
          </motion.div>
        ))}

        {upcoming.length === 0 && (
          <p className="text-sm text-[var(--text-secondary)] py-4 text-center">
            No upcoming events.
          </p>
        )}
      </div>
    </motion.div>
  );
}

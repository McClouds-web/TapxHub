import { useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  CheckSquare,
  FileText,
  Upload,
  UserPlus,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { useTasks, useInvoices } from "@/hooks/useAppData";

type FilterKey = "all" | "tasks" | "invoices" | "files" | "clients";

const filters: { key: FilterKey; label: string }[] = [
  { key: "all",      label: "All" },
  { key: "tasks",    label: "Tasks" },
  { key: "invoices", label: "Invoices" },
  { key: "files",    label: "Files" },
  { key: "clients",  label: "Clients" },
];

interface ActivityItem {
  text: string;
  time: Date;
  category: FilterKey;
}

function getIcon(category: FilterKey) {
  switch (category) {
    case "tasks":    return { Icon: CheckSquare, color: "var(--brand-accent)" };
    case "invoices": return { Icon: FileText,    color: "var(--success)" };
    case "files":    return { Icon: Upload,      color: "#3b82f6" };
    case "clients":  return { Icon: UserPlus,    color: "#a855f7" };
    default:         return { Icon: Activity,    color: "var(--text-secondary)" };
  }
}

export function ActivityFeed() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");

  const { data: tasks    = [] } = useTasks();
  const { data: invoices = [] } = useInvoices();

  // Build a unified activity list from live Supabase data
  const items: ActivityItem[] = [
    ...tasks
      .filter((t) => t.created_at)
      .map((t) => ({
        text: `Task "${t.title}" — ${t.status === "done" ? "completed" : t.status}`,
        time: new Date(t.created_at!),
        category: "tasks" as FilterKey,
      })),
    ...invoices
      .filter((i) => i.created_at)
      .map((i) => ({
        text: `Invoice${i.invoice_number ? ` ${i.invoice_number}` : ""} — ${i.status}`,
        time: new Date(i.created_at!),
        category: "invoices" as FilterKey,
      })),
  ]
    .sort((a, b) => b.time.getTime() - a.time.getTime())
    .slice(0, 20);

  const visible = items.filter(
    (a) => activeFilter === "all" || a.category === activeFilter
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      style={{
        background: "var(--glass-bg)",
        backdropFilter: "var(--glass-blur)",
        border: "1px solid var(--glass-border)",
        borderRadius: "var(--radius)",
      }}
      className="p-6 h-full flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
          <Activity className="h-5 w-5 animate-pulse" style={{ color: "var(--brand-accent)" }} />
          Recent Activity
        </h3>
        <span
          className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full"
          style={{
            color: "var(--text-secondary)",
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
          }}
        >
          Live
        </span>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 flex-wrap mb-4 shrink-0">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            style={{
              transition: "all 0.15s ease",
              background: activeFilter === f.key ? "var(--brand-primary)" : "var(--glass-bg)",
              border: "1px solid var(--glass-border)",
              borderRadius: "var(--radius-sm)",
              color: activeFilter === f.key ? "white" : "var(--text-secondary)",
            }}
            className="px-3 py-1 text-xs font-medium"
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto space-y-1">
        {visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="h-10 w-10 rounded-full flex items-center justify-center mb-3" style={{ background: "var(--glass-bg)" }}>
              <Activity className="h-5 w-5" style={{ color: "var(--text-secondary)" }} />
            </div>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              No activity yet.
            </p>
          </div>
        ) : (
          visible.map((activity, i) => {
            const { Icon, color } = getIcon(activity.category);
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-start gap-3 p-3 rounded-[var(--radius-sm)]"
                style={{ transition: "background 0.15s ease" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
              >
                <div className="p-2 rounded-xl shrink-0" style={{ background: `${color}18` }}>
                  <Icon className="h-4 w-4" style={{ color }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-snug" style={{ color: "var(--text-primary)" }}>
                    {activity.text}
                  </p>
                  <p className="text-[10px] font-semibold uppercase tracking-widest mt-0.5" style={{ color: "var(--text-secondary)" }}>
                    {formatDistanceToNow(activity.time, { addSuffix: true })}
                  </p>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}

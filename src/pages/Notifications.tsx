import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, CheckCircle2, FileText, Users, AlertCircle,
  Settings, CheckCheck, Circle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { useNotifications, useMarkAllRead, Notification } from "@/hooks/useAppData";

type FilterKey = "all" | "tasks" | "invoices" | "clients" | "system";

const filters: { key: FilterKey; label: string }[] = [
  { key: "all",      label: "All" },
  { key: "tasks",    label: "Tasks" },
  { key: "invoices", label: "Invoices" },
  { key: "clients",  label: "Clients" },
  { key: "system",   label: "System" },
];

function getTypeInfo(type?: string): { icon: React.ElementType; color: string; bg: string; label: string } {
  switch (type) {
    case "task":    return { icon: CheckCircle2, color: "#10b981", bg: "bg-emerald-500/10", label: "Task" };
    case "invoice": return { icon: FileText,     color: "#3b82f6", bg: "bg-blue-500/10",    label: "Invoice" };
    case "client":  return { icon: Users,        color: "#a855f7", bg: "bg-purple-500/10",  label: "Client" };
    case "alert":   return { icon: AlertCircle,  color: "#f59e0b", bg: "bg-amber-500/10",   label: "Alert" };
    default:        return { icon: Settings,     color: "#64748b", bg: "bg-slate-500/10",   label: "System" };
  }
}

function typeToFilter(type?: string): FilterKey {
  if (type === "task")    return "tasks";
  if (type === "invoice") return "invoices";
  if (type === "client")  return "clients";
  return "system";
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

// Fallback demo items shown when the DB table is empty
const DEMO: Notification[] = [
  { id: "d1", is_read: false, message: "Invoice #INV-1042 is pending payment from Tapx Client.", type: "invoice", created_at: new Date(Date.now() - 3_600_000).toISOString() },
  { id: "d2", is_read: false, message: "Task \"Q2 Campaign Brief\" is due today.", type: "task", created_at: new Date(Date.now() - 7_200_000).toISOString() },
  { id: "d3", is_read: true,  message: "Luna Studio contract has been renewed.", type: "client", created_at: new Date(Date.now() - 86_400_000).toISOString() },
  { id: "d4", is_read: true,  message: "Invoice #INV-1041 marked as paid.", type: "invoice", created_at: new Date(Date.now() - 172_800_000).toISOString() },
  { id: "d5", is_read: true,  message: "System backup completed successfully.", type: "system", created_at: new Date(Date.now() - 259_200_000).toISOString() },
  { id: "d6", is_read: true,  message: "New client NovaTech added to the system.", type: "client", created_at: new Date(Date.now() - 345_600_000).toISOString() },
];

export default function Notifications() {
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const { data: raw = [], isLoading } = useNotifications();
  const markAllRead = useMarkAllRead();

  const notifications = raw.length > 0 ? raw : DEMO;
  const unread = notifications.filter((n) => !n.is_read).length;

  const visible = notifications.filter((n) => {
    if (activeFilter === "all") return true;
    return typeToFilter(n.type) === activeFilter;
  });

  return (
    <motion.div variants={container} initial="hidden" animate="show"
      className="flex flex-col h-full gap-6 overflow-hidden pb-4">

      {/* Header */}
      <motion.div variants={item} className="flex items-end justify-between shrink-0">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--brand-primary)]">Notifications</h1>
          <p className="text-sm text-[var(--brand-primary)]/50 font-bold mt-1.5 uppercase tracking-widest">
            Alerts &amp; Updates
          </p>
        </div>
        {unread > 0 && (
          <button
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-[#0F1E3D] text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#1E3A8A] transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            <CheckCheck className="h-4 w-4 text-white/70" /> Mark All Read
          </button>
        )}
      </motion.div>

      {/* Summary cards */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
        <div className="bg-white border border-[#0F1E3D]/5 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] font-black uppercase tracking-widest text-[var(--brand-primary)]/40 mb-3">Total</span>
          <span className="text-3xl font-extrabold text-[var(--brand-primary)] tracking-tight">{notifications.length}</span>
        </div>
        <div className="bg-white border border-[#0F1E3D]/5 rounded-2xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-bl-[100px] pointer-events-none" />
          <span className="text-[10px] font-black uppercase tracking-widest text-rose-500/70 mb-3">Unread</span>
          <span className="text-3xl font-extrabold text-rose-500 tracking-tight">{unread}</span>
        </div>
        <div className="bg-white border border-[#0F1E3D]/5 rounded-2xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-[100px] pointer-events-none" />
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600/70 mb-3">Read</span>
          <span className="text-3xl font-extrabold text-emerald-600 tracking-tight">{notifications.length - unread}</span>
        </div>
      </motion.div>

      {/* List */}
      <motion.div variants={item} className="flex-1 min-h-0 bg-white border border-[#0F1E3D]/5 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        {/* Filter bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#0F1E3D]/5 shrink-0 bg-[#F8FAFC]/50 gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-[#1E3A8A]" />
            <span className="text-sm font-black uppercase tracking-widest text-[var(--brand-primary)]">Inbox</span>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                className={cn(
                  "px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg border transition-all",
                  activeFilter === f.key
                    ? "bg-[#0F1E3D] text-white border-[#0F1E3D]"
                    : "bg-white text-[var(--brand-primary)]/50 border-[#0F1E3D]/10 hover:border-[#0F1E3D]/20 hover:text-[var(--brand-primary)]"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Rows */}
        <div className="flex-1 overflow-y-auto px-2 py-2">
          {isLoading ? (
            [0, 1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-xl bg-[#F8FAFC] animate-pulse m-1 border border-[#0F1E3D]/5" />
            ))
          ) : visible.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <Bell className="h-8 w-8 text-[var(--brand-primary)] opacity-20 mb-3" />
              <p className="text-sm font-bold text-[var(--brand-primary)]">No notifications here.</p>
            </div>
          ) : (
            <div className="space-y-0.5">
              <AnimatePresence>
                {visible.map((notif, i) => {
                  const { icon: Icon, color, bg } = getTypeInfo(notif.type);
                  return (
                    <motion.div
                      key={notif.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className={cn(
                        "flex items-start gap-4 p-4 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-[#0F1E3D]/5 hover:bg-[#F8FAFC]",
                        !notif.is_read && "bg-[#F8FAFC] border-[#0F1E3D]/5"
                      )}
                    >
                      {/* Icon */}
                      <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", bg)}>
                        <Icon className="h-4 w-4" style={{ color }} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "text-sm leading-snug",
                          notif.is_read ? "font-medium text-[var(--brand-primary)]/60" : "font-bold text-[var(--brand-primary)]"
                        )}>
                          {notif.message ?? "No message"}
                        </p>
                        {notif.created_at && (
                          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--brand-primary)]/30 mt-1">
                            {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                          </p>
                        )}
                      </div>

                      {/* Unread dot */}
                      <div className="shrink-0 pt-1">
                        {notif.is_read
                          ? <Circle className="h-2.5 w-2.5 text-[#0F1E3D]/10" />
                          : <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500/40" />
                        }
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

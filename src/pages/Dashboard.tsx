import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckSquare, FileText, Users, Bell, CalendarCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { TodaysFocus } from "@/components/dashboard/TodaysFocus";
import { AiClientUpdate } from "@/components/dashboard/AiClientUpdate";
import { MorningBriefing } from "@/components/dashboard/MorningBriefing";
import { CentralCommand } from "@/components/dashboard/CentralCommand";
import {
  useActiveTaskCount,
  usePendingInvoiceCount,
  useCompanies,
  useUnreadNotificationCount,
} from "@/hooks/useAppData";

const TABS = [
  { id: "focus",   label: "Today's Focus" },
  { id: "ai",      label: "AI Client Update" },
  { id: "command", label: "Central Command" },
  { id: "revenue", label: "Revenue" },
] as const;

type Tab = (typeof TABS)[number]["id"];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as any } },
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("focus");

  const activeTasks     = useActiveTaskCount();
  const pendingInvoices = usePendingInvoiceCount();
  const unreadAlerts    = useUnreadNotificationCount();
  const { data: companies } = useCompanies();
  const activeClients   = companies.length;

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-5 w-full pb-2"
      style={{ height: "100%", overflow: "hidden" }}
    >
      {/* ── 1. Morning Briefing ──────────────────────────────────────────── */}
      <motion.div variants={item} className="shrink-0">
        <MorningBriefing />
      </motion.div>

      {/* ── 2. KPI Cards ─────────────────────────────────────────────────── */}
      <motion.div
        variants={item}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0"
      >
        <Link to="/planner" className="block outline-none">
          <KpiCard title="Active Tasks" value={activeTasks} icon={CheckSquare} />
        </Link>
        <Link to="/invoices" className="block outline-none">
          <KpiCard title="Pending Invoices" value={pendingInvoices} icon={FileText} />
        </Link>
        <Link to="/clients" className="block outline-none">
          <KpiCard title="Active Clients" value={activeClients} icon={Users} />
        </Link>
        <Link to="/notifications" className="block outline-none">
          <KpiCard title="Unread Alerts" value={unreadAlerts} icon={Bell} />
        </Link>
      </motion.div>

      {/* ── 3. Tab Panel ─────────────────────────────────────────────────── */}
      <motion.div
        variants={item}
        className="flex flex-col min-h-0 flex-1"
        style={{ overflow: "hidden" }}
      >
        {/* Tab bar */}
        <div className="flex items-center gap-2 shrink-0 mb-4 flex-wrap">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={cn(
                "px-5 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300 shrink-0",
                activeTab === t.id
                  ? "bg-[var(--brand-primary)] text-white shadow-md"
                  : "bg-white text-[var(--brand-primary)] border border-[#0F1E3D]/10 hover:bg-[#F1F5F9]"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content — fills all remaining space, no overflow */}
        <div className="flex-1 min-h-0 relative">
          <AnimatePresence mode="wait">
            {activeTab === "focus" && (
              <motion.div
                key="focus"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0"
              >
                <TodaysFocus />
              </motion.div>
            )}
            {activeTab === "ai" && (
              <motion.div
                key="ai"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 overflow-y-auto"
              >
                <AiClientUpdate />
              </motion.div>
            )}
            {activeTab === "command" && (
              <motion.div
                key="command"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 overflow-y-auto pr-1"
              >
                <CentralCommand />
              </motion.div>
            )}
            {activeTab === "revenue" && (
              <motion.div
                key="revenue"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0"
              >
                <RevenueChart />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

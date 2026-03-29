import { motion } from "framer-motion";
import { Plus, Users } from "lucide-react";
import { format } from "date-fns";
import { useCompanies, useUpdateRetainerStatus } from "@/hooks/useAppData";

const statusStyles: Record<string, { label: string; bg: string; color: string }> = {
  in_progress: { label: "In Progress", bg: "rgba(245,158,11,0.1)",  color: "#f59e0b" },
  completed:   { label: "Completed",   bg: "rgba(59,130,246,0.1)",  color: "#3b82f6" },
  delivered:   { label: "Delivered",   bg: "rgba(34,197,94,0.1)",   color: "#22c55e" },
};

function SkeletonCard() {
  return (
    <div className="animate-pulse p-5 rounded-[var(--radius)]"
      style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
      <div className="flex justify-between mb-4">
        <div className="h-4 bg-white/10 rounded w-32" />
        <div className="h-5 bg-white/10 rounded-full w-16" />
      </div>
      <div className="h-7 bg-white/10 rounded w-24 mb-2" />
      <div className="h-3 bg-white/10 rounded w-20 mb-4" />
      <div className="flex gap-2">
        <div className="flex-1 h-8 bg-white/10 rounded-[var(--radius-sm)]" />
        <div className="flex-1 h-8 bg-white/10 rounded-[var(--radius-sm)]" />
      </div>
    </div>
  );
}

export function RetainerTracker() {
  const { data: companies = [], isLoading } = useCompanies();
  const updateStatus = useUpdateRetainerStatus();
  const currentMonth = format(new Date(), "MMMM yyyy");

  // Only show companies that have a monthly retainer amount
  const retainers = companies.filter((c) => c.monthly_amount && c.monthly_amount > 0);

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
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">Retainer Clients</h3>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">Monthly work tracker</p>
        </div>
        <button style={{
          background: "var(--glass-bg)", border: "1px solid var(--glass-border)",
          borderRadius: "var(--radius-sm)", transition: "all 0.2s ease",
        }} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
          <Plus className="h-3.5 w-3.5" /> Add New Client
        </button>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {isLoading ? (
          <><SkeletonCard /><SkeletonCard /></>
        ) : retainers.length === 0 ? (
          <div className="col-span-2 flex flex-col items-center justify-center py-12 gap-3">
            <div className="h-12 w-12 rounded-full flex items-center justify-center"
              style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
              <Users className="h-6 w-6" style={{ color: "var(--text-secondary)" }} />
            </div>
            <p className="text-sm text-[var(--text-secondary)] text-center">
              No retainer clients yet. Add your first retainer client.
            </p>
          </div>
        ) : (
          retainers.map((client, i) => {
            const s = statusStyles[client.retainer_status ?? "in_progress"] ?? statusStyles.in_progress;
            return (
              <motion.div
                key={client.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ scale: 1.01 }}
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid var(--glass-border)",
                  borderRadius: "var(--radius)",
                  transition: "all 0.2s ease",
                }}
                className="p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className="text-sm font-bold text-[var(--text-primary)]">{client.name}</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(168,85,247,0.1)", color: "#a855f7" }}>
                    Retainer
                  </span>
                </div>
                <p className="text-2xl font-bold mb-1" style={{ color: "var(--brand-accent)" }}>
                  P{Number(client.monthly_amount).toLocaleString()}
                  <span className="text-xs font-normal text-[var(--text-secondary)] ml-1">/mo</span>
                </p>
                <p className="text-xs text-[var(--text-secondary)] mb-3">{currentMonth}</p>
                <span className="inline-block text-[10px] font-bold px-2.5 py-1 rounded-full mb-4"
                  style={{ background: s.bg, color: s.color }}>
                  {s.label}
                </span>
                <div className="flex gap-2">
                  <button style={{
                    border: "1px solid var(--glass-border)", borderRadius: "var(--radius-sm)",
                    color: "var(--text-secondary)", transition: "all 0.2s ease",
                  }} className="flex-1 py-1.5 text-xs font-medium hover:text-[var(--text-primary)]">
                    Log Work
                  </button>
                  <button
                    onClick={() => updateStatus.mutate({ id: client.id, retainer_status: "completed" })}
                    style={{ background: "var(--brand-primary)", borderRadius: "var(--radius-sm)", transition: "all 0.2s ease" }}
                    className="flex-1 py-1.5 text-xs font-semibold text-white hover:opacity-90"
                  >
                    Mark Complete
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}

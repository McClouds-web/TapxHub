import { motion } from "framer-motion";
import { Plus, ArrowRight, FolderOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCompanies } from "@/hooks/useAppData";

const typeStyles: Record<string, { bg: string; color: string; label: string }> = {
  invoice:  { bg: "rgba(59,130,246,0.1)",  color: "#3b82f6",  label: "Invoice" },
  retainer: { bg: "rgba(168,85,247,0.1)",  color: "#a855f7",  label: "Retainer" },
};

function SkeletonCard() {
  return (
    <div className="animate-pulse p-3 rounded-[var(--radius)]"
      style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-white/10" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3 bg-white/10 rounded w-24" />
          <div className="h-2 bg-white/10 rounded w-14" />
        </div>
      </div>
    </div>
  );
}

export function ClientFolders() {
  const { data: companies = [], isLoading } = useCompanies();
  const navigate = useNavigate();

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
      className="p-3"
    >
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-[11px] font-semibold text-[var(--text-primary)]">Client Folders</h3>
          <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">Quick access to all clients</p>
        </div>
        <button style={{
          background: "var(--glass-bg)", border: "1px solid var(--glass-border)",
          borderRadius: "var(--radius-sm)", transition: "all 0.2s ease",
        }} className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
          <Plus className="h-3.5 w-3.5" /> Add New Client
        </button>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <><SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard /></>
        ) : companies.length === 0 ? (
          <div className="col-span-3 flex flex-col items-center justify-center py-12 gap-3">
            <div className="h-12 w-12 rounded-full flex items-center justify-center"
              style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
              <FolderOpen className="h-6 w-6" style={{ color: "var(--text-secondary)" }} />
            </div>
            <p className="text-[10px] text-[var(--text-secondary)] text-center">
              No clients yet. Add your first client.
            </p>
          </div>
        ) : (
          companies.map((company, i) => {
            const type = company.client_type ?? "invoice";
            const badge = typeStyles[type] ?? typeStyles.invoice;
            return (
              <motion.div
                key={company.id}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ scale: 1.01 }}
                onClick={() => navigate(`/clients/${company.id}`)}
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid var(--glass-border)",
                  borderRadius: "var(--radius)",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                className="p-3 flex items-center gap-3 group"
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.border = "1px solid var(--border-hover)";
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.border = "1px solid var(--glass-border)";
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
                }}
              >
                <div className="h-10 w-10 rounded-full flex items-center justify-center shrink-0 text-white text-[11px] font-bold"
                  style={{ background: "var(--brand-primary)" }}>
                  {company.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                    {company.name}
                  </p>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: badge.bg, color: badge.color }}>
                    {badge.label}
                  </span>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  style={{ color: "var(--text-secondary)" }} />
              </motion.div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}

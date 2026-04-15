import { motion, AnimatePresence } from "framer-motion";
import { X, BarChart2 } from "lucide-react";
import { useClientReports } from "@/hooks/useAppData";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

interface ClientReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyName: string;
}

export function ClientReportModal({ isOpen, onClose, companyName }: ClientReportModalProps) {
  const { user } = useAuth();
  const { data: reports = [], isLoading } = useClientReports(user?.company_id);
  const latest = reports[0];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-3 bg-black/30 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 16 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-[#0F1E3D]/5 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-5 border-b border-[#0F1E3D]/5 bg-[#F8FAFC]/60">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#0F1E3D] flex items-center justify-center">
                  <BarChart2 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-[10px] font-black text-[#0F1E3D] leading-none">Performance Report</h3>
                  <p className="text-[10px] font-bold text-[#0F1E3D]/40 uppercase tracking-widest mt-0.5">{companyName}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-[#0F1E3D]/30 hover:text-[#0F1E3D] hover:bg-[#F1F5F9] transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-3">
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => <div key={i} className="h-10 bg-[#F8FAFC] rounded-xl animate-pulse" />)}
                </div>
              ) : !latest ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <BarChart2 className="w-10 h-10 text-[#0F1E3D]/10 mb-3" />
                  <p className="text-[10px] font-black text-[#0F1E3D]">No reports yet</p>
                  <p className="text-[10px] text-[#0F1E3D]/40 mt-1">Your performance data will appear here once synced.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#0F1E3D]/40">
                    {format(new Date(latest.report_month), "MMMM yyyy")}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Reach", value: latest.reach?.toLocaleString() },
                      { label: "Impressions", value: latest.impressions?.toLocaleString() },
                      { label: "Clicks", value: latest.clicks?.toLocaleString() },
                      { label: "Leads", value: latest.leads?.toLocaleString() },
                      { label: "Conversions", value: latest.conversions?.toLocaleString() },
                      { label: "Revenue", value: `$${latest.revenue?.toLocaleString()}` },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-[#F8FAFC] rounded-xl p-3 border border-[#0F1E3D]/5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#0F1E3D]/40 mb-1">{label}</p>
                        <p className="text-[11px] font-black text-[#0F1E3D]">{value ?? "—"}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="px-4 pb-6">
              <button
                onClick={onClose}
                className="w-full px-4 py-3 bg-[#0F1E3D] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#1E3A8A] transition-all"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

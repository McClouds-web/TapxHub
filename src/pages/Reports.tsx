import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, subMonths, addMonths } from "date-fns";

type StatusKey = "all" | "draft" | "approved" | "sent";
const statusFilters: { key: StatusKey; label: string }[] = [
  { key: "all",      label: "All" },
  { key: "draft",    label: "Draft" },
  { key: "approved", label: "Approved" },
  { key: "sent",     label: "Sent" },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function Reports() {
  const [activeStatus, setActiveStatus] = useState<StatusKey>("all");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showReportModal, setShowReportModal] = useState(false);

  return (
    <motion.div variants={container} initial="hidden" animate="show"
      className="flex flex-col h-full gap-6 overflow-hidden pb-4">

      {/* Header */}
      <motion.div variants={item} className="flex items-end justify-between shrink-0">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--brand-primary)]">Reports</h1>
          <p className="text-sm text-[var(--brand-primary)]/50 font-bold mt-1.5 uppercase tracking-widest">
            Monthly Client Reports
          </p>
        </div>
        <button 
          onClick={() => setShowReportModal(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-[#0F1E3D] text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#1E3A8A] transition-all shadow-md active:scale-95"
        >
          <Plus className="h-4 w-4 text-white/70" /> Generate Report
        </button>
      </motion.div>

      {/* Filter bar */}
      <motion.div variants={item} className="flex items-center gap-4 flex-wrap shrink-0">
        {/* Month picker */}
        <div className="flex items-center gap-2 bg-white border border-[#0F1E3D]/10 rounded-xl px-3 py-2 shadow-sm">
          <button
            onClick={() => setCurrentMonth((d) => subMonths(d, 1))}
            className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-[#F8FAFC] transition-colors text-[var(--brand-primary)]/50 hover:text-[var(--brand-primary)]"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <span className="text-xs font-black uppercase tracking-widest text-[var(--brand-primary)] min-w-[110px] text-center">
            {format(currentMonth, "MMMM yyyy")}
          </span>
          <button
            onClick={() => setCurrentMonth((d) => addMonths(d, 1))}
            className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-[#F8FAFC] transition-colors text-[var(--brand-primary)]/50 hover:text-[var(--brand-primary)]"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Status pills */}
        <div className="flex gap-1.5">
          {statusFilters.map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveStatus(f.key)}
              className={cn(
                "px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg border transition-all",
                activeStatus === f.key
                  ? "bg-[#0F1E3D] text-white border-[#0F1E3D]"
                  : "bg-white text-[var(--brand-primary)]/50 border-[#0F1E3D]/10 hover:border-[#0F1E3D]/20 hover:text-[var(--brand-primary)]"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Empty state card */}
      <motion.div variants={item}
        className="flex-1 min-h-0 bg-white border border-[#0F1E3D]/5 rounded-2xl shadow-sm flex flex-col items-center justify-center p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#F8FAFC] border border-[#0F1E3D]/5 flex items-center justify-center mb-5 shadow-sm">
          <BarChart3 className="h-7 w-7 text-[var(--brand-primary)] opacity-20" />
        </div>
        <h3 className="text-xl font-extrabold text-[var(--brand-primary)] mb-2">No reports yet</h3>
        <p className="text-sm font-medium text-[var(--brand-primary)]/40 max-w-sm leading-relaxed mb-6">
          Reports are automatically generated at the end of each month for all retainer clients.
          You can also generate one manually above.
        </p>
        <button 
          onClick={() => setShowReportModal(true)}
          className="flex items-center gap-1.5 px-5 py-2.5 bg-[#0F1E3D] text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#1E3A8A] transition-all shadow-md active:scale-95"
        >
          <Plus className="h-4 w-4 text-white/70" /> Generate Report Now
        </button>
      </motion.div>

      {/* Generate Report Modal */}
      <AnimatePresence>
        {showReportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
            onClick={(e) => e.target === e.currentTarget && setShowReportModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-[#0F1E3D]/5"
            >
              <h2 className="text-xl font-extrabold text-[var(--brand-primary)] mb-2">Generate Manual Report</h2>
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--brand-primary)]/40 mb-6">Compile analytics and metrics</p>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-[var(--brand-primary)]/50 mb-1.5 block">Client</label>
                  <select className="w-full bg-[#F8FAFC] border border-[#0F1E3D]/10 rounded-xl px-4 py-3 text-sm font-bold text-[var(--brand-primary)] focus:outline-none focus:border-[var(--brand-accent)] transition-colors">
                    <option>Select client...</option>
                    <option>Apex Digital</option>
                    <option>NovaTech</option>
                    <option>Luna Studio</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-[var(--brand-primary)]/50 mb-1.5 block">Report Type</label>
                  <select className="w-full bg-[#F8FAFC] border border-[#0F1E3D]/10 rounded-xl px-4 py-3 text-sm font-bold text-[var(--brand-primary)] focus:outline-none focus:border-[var(--brand-accent)] transition-colors">
                    <option>Monthly Performance (SEO/Ads)</option>
                    <option>Social Media Audit</option>
                    <option>CRO Strategy Report</option>
                  </select>
                </div>
              </div>
              
              <div className="flex gap-3 mt-8">
                <button onClick={() => setShowReportModal(false)} className="flex-1 px-4 py-3 bg-[#F8FAFC] text-[var(--brand-primary)] rounded-xl text-xs font-black uppercase tracking-widest border border-[#0F1E3D]/10 hover:bg-[#F1F5F9] transition-all">
                  Cancel
                </button>
                <button onClick={() => { setShowReportModal(false); }} className="flex-1 px-4 py-3 bg-[#0F1E3D] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#1E3A8A] transition-all shadow-md">
                  Generate Now
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

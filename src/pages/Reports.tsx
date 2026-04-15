import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, Plus, ChevronLeft, ChevronRight, Loader2, FileText, CheckCircle2, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, subMonths, addMonths } from "date-fns";
import { useCompanies, useReports, useAddReport } from "@/hooks/useAppData";
import { toast } from "sonner";

type StatusKey = "all" | "draft" | "approved" | "sent";
const statusFilters: { key: StatusKey; label: string }[] = [
  { key: "all",      label: "All" },
  { key: "draft",    label: "Draft" },
  { key: "approved", label: "Approved" },
  { key: "sent",     label: "Sent" },
];

const statusStyles: Record<string, string> = {
  draft:    "bg-amber-500/10 text-amber-600 border-amber-500/20",
  approved: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  sent:     "bg-blue-500/10 text-blue-600 border-blue-500/20",
};

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
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [reportType, setReportType] = useState("Monthly Performance (SEO/Ads)");

  const { data: companies = [] } = useCompanies();
  const { data: reports = [] } = useReports();
  const addReport = useAddReport();

  const visible = reports.filter(r =>
    activeStatus === "all" || r.status === activeStatus
  );

  const handleGenerate = async () => {
    if (!selectedCompanyId) {
      toast.error("Please select a client");
      return;
    }
    const company = companies.find(c => c.id === selectedCompanyId);
    try {
      await addReport.mutateAsync({
        company_id: selectedCompanyId,
        company_name: company?.name,
        report_type: reportType,
        month: format(currentMonth, "yyyy-MM"),
      });
      toast.success("Report generated and saved as Draft");
      setShowReportModal(false);
      setSelectedCompanyId("");
    } catch {
      toast.error("Failed to generate report");
    }
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show"
      className="flex flex-col h-full gap-4 overflow-hidden pb-4">

      {/* Header */}
      <motion.div variants={item} className="flex items-end justify-between shrink-0">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--brand-primary)]">Reports</h1>
          <p className="text-[10px] text-[var(--brand-primary)]/50 font-bold mt-1.5 uppercase tracking-widest">
            Monthly Client Reports
          </p>
        </div>
        <button 
          onClick={() => setShowReportModal(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-[#0F1E3D] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#1E3A8A] transition-all shadow-md active:scale-95"
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
          <span className="text-[10px] font-black uppercase tracking-widest text-[var(--brand-primary)] min-w-[110px] text-center">
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

      {/* Report list / empty state */}
      <motion.div variants={item} className="flex-1 min-h-0 bg-white border border-[#0F1E3D]/5 rounded-xl shadow-sm overflow-hidden flex flex-col">
        {visible.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-16 h-16 rounded-xl bg-[#F8FAFC] border border-[#0F1E3D]/5 flex items-center justify-center mb-5 shadow-sm">
              <BarChart3 className="h-7 w-7 text-[var(--brand-primary)] opacity-20" />
            </div>
            <h3 className="text-[12px] font-extrabold text-[var(--brand-primary)] mb-2">No reports yet</h3>
            <p className="text-[10px] font-medium text-[var(--brand-primary)]/40 max-w-sm leading-relaxed mb-4">
              Reports are automatically generated at the end of each month for all retainer clients.
              You can also generate one manually above.
            </p>
            <button
              onClick={() => setShowReportModal(true)}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-[#0F1E3D] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#1E3A8A] transition-all shadow-md active:scale-95"
            >
              <Plus className="h-4 w-4 text-white/70" /> Generate Report Now
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto divide-y divide-[#0F1E3D]/5">
            {visible.map(r => (
              <div key={r.id} className="flex items-center gap-4 px-4 py-4 hover:bg-[#F8FAFC] transition-colors">
                <div className="w-9 h-9 rounded-xl bg-[#0F1E3D] flex items-center justify-center shrink-0">
                  <FileText className="h-4 w-4 text-white/70" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-extrabold text-[var(--brand-primary)] truncate">{r.company_name ?? "Unknown client"}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--brand-primary)]/40 mt-0.5">{r.report_type} · {r.month}</p>
                </div>
                <span className={cn(
                  "inline-flex items-center px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border shrink-0",
                  statusStyles[r.status] ?? "bg-[#F8FAFC] text-[var(--brand-primary)]/40 border-[#0F1E3D]/10"
                )}>
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Generate Report Modal */}
      <AnimatePresence>
        {showReportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-3"
            onClick={(e) => e.target === e.currentTarget && setShowReportModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md border border-[#0F1E3D]/5"
            >
              <h2 className="text-[12px] font-extrabold text-[var(--brand-primary)] mb-2">Generate Manual Report</h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--brand-primary)]/40 mb-4">Compile analytics and metrics</p>
              
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--brand-primary)]/50 mb-1.5 block">Client *</label>
                  <select
                    value={selectedCompanyId}
                    onChange={e => setSelectedCompanyId(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-[#0F1E3D]/10 rounded-xl px-4 py-3 text-[10px] font-bold text-[var(--brand-primary)] focus:outline-none focus:border-[var(--brand-accent)] transition-colors"
                  >
                    <option value="">Select client...</option>
                    {companies.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--brand-primary)]/50 mb-1.5 block">Report Type</label>
                  <select
                    value={reportType}
                    onChange={e => setReportType(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-[#0F1E3D]/10 rounded-xl px-4 py-3 text-[10px] font-bold text-[var(--brand-primary)] focus:outline-none focus:border-[var(--brand-accent)] transition-colors"
                  >
                    <option>Monthly Performance (SEO/Ads)</option>
                    <option>Social Media Audit</option>
                    <option>CRO Strategy Report</option>
                    <option>Email Campaign Report</option>
                    <option>Full Growth OS Summary</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-5">
                <button onClick={() => setShowReportModal(false)} className="flex-1 px-4 py-3 bg-[#F8FAFC] text-[var(--brand-primary)] rounded-xl text-[10px] font-black uppercase tracking-widest border border-[#0F1E3D]/10 hover:bg-[#F1F5F9] transition-all">
                  Cancel
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={addReport.isPending || !selectedCompanyId}
                  className="flex-1 px-4 py-3 bg-[#0F1E3D] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#1E3A8A] transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {addReport.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
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

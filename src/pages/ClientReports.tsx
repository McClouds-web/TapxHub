import { motion } from "framer-motion";
import {
  BarChart2, TrendingUp, TrendingDown, Eye, MousePointer,
  Users, DollarSign, FileText, Download, Calendar, Loader2,
  AlertCircle
} from "lucide-react";
import { useInvoices, useFiles, useTasks, useReports } from "@/hooks/useAppData";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

export default function ClientReports() {
  const { user } = useAuth();
  const { data: invoices = [] } = useInvoices();
  const { data: files = [] } = useFiles();
  const { data: tasks = [] } = useTasks();
  const { data: reports = [], isLoading: reportsLoading } = useReports(user?.company_id);

  const deliverables = files.filter(f => f.is_deliverable);
  const completedTasks = tasks.filter(t => t.status === "done").length;
  const totalTasks = tasks.length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const totalPaid = invoices.filter(i => i.status === "paid").reduce((s, i) => s + (i.amount ?? 0), 0);

  // Process Real Report Data
  const { currentKpis, chartData } = useMemo(() => {
    if (!reports || reports.length === 0) {
      return {
        currentKpis: [
          { label: "Total Reach", value: "0", change: "0%", up: true, icon: Eye },
          { label: "Impressions", value: "0", change: "0%", up: true, icon: MousePointer },
          { label: "New Leads", value: "0", change: "0%", up: true, icon: Users },
          { label: "Ad Spend", value: "$0.00", change: "0%", up: true, icon: DollarSign },
        ],
        chartData: []
      };
    }

    const latest = reports[0];
    const previous = reports[1] || latest;

    const calcChange = (curr: number, prev: number) => {
      if (prev === 0) return { text: "0%", up: true };
      const pct = ((curr - prev) / prev) * 100;
      return { text: `${Math.abs(Math.round(pct))}%`, up: pct >= 0 };
    };

    const reachChange = calcChange(latest.reach, previous.reach);
    const impressionsChange = calcChange(latest.impressions, previous.impressions);
    const leadsChange = calcChange(latest.leads, previous.leads);
    const spendChange = calcChange(latest.spend, previous.spend);

    const kpis = [
      { label: "Total Reach", value: latest.reach.toLocaleString(), change: reachChange.text, up: reachChange.up, icon: Eye },
      { label: "Impressions", value: latest.impressions.toLocaleString(), change: impressionsChange.text, up: impressionsChange.up, icon: MousePointer },
      { label: "New Leads", value: latest.leads.toLocaleString(), change: leadsChange.text, up: leadsChange.up, icon: Users },
      { label: "Ad Spend", value: `$${Number(latest.spend).toLocaleString()}`, change: spendChange.text, up: !spendChange.up, icon: DollarSign },
    ];

    // Format chart data (max 6 months)
    const reversedReports = [...reports].reverse().slice(-6);
    const maxReach = Math.max(...reversedReports.map(r => r.reach), 1);
    const maxLeads = Math.max(...reversedReports.map(r => r.leads), 1);
    const maxSpend = Math.max(...reversedReports.map(r => r.spend), 1);

    const cData = reversedReports.map(r => ({
      month: new Date(r.report_month).toLocaleDateString('en-US', { month: 'short' }),
      reach: (r.reach / maxReach) * 100,
      leads: (r.leads / maxLeads) * 100,
      spend: (r.spend / maxSpend) * 100,
    }));

    return { currentKpis: kpis, chartData: cData };
  }, [reports]);

  return (
    <motion.div variants={container} initial="hidden" animate="show"
      className="flex flex-col h-full gap-6 overflow-y-auto pb-4">

      {/* Header */}
      <motion.div variants={item} className="flex items-end justify-between shrink-0">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--brand-primary)]">My Reports</h1>
          <p className="text-sm text-[var(--brand-primary)]/50 font-bold mt-1.5 uppercase tracking-widest">
            Performance &amp; Analytics
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-[#F8FAFC] border border-[#0F1E3D]/10 rounded-xl text-xs font-bold text-[var(--brand-primary)]/60">
          <Calendar className="h-3.5 w-3.5" />
          Real-time Sync Active
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0">
        {currentKpis.map((kpi) => (
          <div key={kpi.label} className="bg-white border border-[#0F1E3D]/5 rounded-2xl p-5 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[9px] font-black uppercase tracking-widest text-[var(--brand-primary)]/40">{kpi.label}</span>
              <div className="w-8 h-8 rounded-lg bg-[#F8FAFC] border border-[#0F1E3D]/5 flex items-center justify-center">
                <kpi.icon className="h-4 w-4 text-[#1E3A8A]" />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-[var(--brand-primary)] tracking-tight">{kpi.value}</p>
            <div className={cn("flex items-center gap-1 mt-1.5 text-[10px] font-black", kpi.up ? "text-emerald-600" : "text-red-500")}>
              {kpi.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {kpi.change} vs last month
            </div>
          </div>
        ))}
      </motion.div>

      {/* Campaign Progress + Financials */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
        <div className="md:col-span-2 bg-white border border-[#0F1E3D]/5 rounded-2xl p-6 shadow-sm">
          <h3 className="text-xs font-black uppercase tracking-widest text-[var(--brand-primary)]/40 mb-5">Campaign Progress</h3>
          <div className="space-y-5">
            {[
              { label: "Overall Progress", pct: progress || 0, color: "bg-[#1E3A8A]" },
              { label: "Content Created",  pct: 85,             color: "bg-emerald-500" },
              { label: "Ads Published",    pct: 72,             color: "bg-purple-500" },
              { label: "Reporting Done",   pct: reports.length > 0 ? 100 : 0, color: "bg-amber-500" },
            ].map((bar) => (
              <div key={bar.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-[var(--brand-primary)]">{bar.label}</span>
                  <span className="text-xs font-black text-[var(--brand-primary)]">{bar.pct}%</span>
                </div>
                <div className="h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${bar.pct}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={cn("h-full rounded-full", bar.color)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-[#0F1E3D]/5 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-[var(--brand-primary)]/40">Billing Summary</h3>
          <div className="space-y-3 flex-1">
            <div className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-xl border border-[#0F1E3D]/5">
              <span className="text-xs font-bold text-[var(--brand-primary)]/60">Total Paid</span>
              <span className="text-sm font-extrabold text-emerald-600">
                ${totalPaid.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-xl border border-[#0F1E3D]/5">
              <span className="text-xs font-bold text-[var(--brand-primary)]/60">Invoices</span>
              <span className="text-sm font-extrabold text-[var(--brand-primary)]">{invoices.length}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-xl border border-[#0F1E3D]/5">
              <span className="text-xs font-bold text-[var(--brand-primary)]/60">Pending</span>
              <span className="text-sm font-extrabold text-amber-600">
                {invoices.filter(i => i.status === "sent").length}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Monthly Bar Chart (Real Data) */}
      <motion.div variants={item} className="bg-white border border-[#0F1E3D]/5 rounded-2xl p-6 shadow-sm shrink-0 min-h-[200px]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-[var(--brand-primary)]">Monthly Performance</h3>
            <p className="text-[10px] font-bold text-[var(--brand-primary)]/40 mt-0.5 uppercase tracking-widest">Reach · Leads · Spend index</p>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest">
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-[#1E3A8A]" /><span className="text-[var(--brand-primary)]/50">Reach</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /><span className="text-[var(--brand-primary)]/50">Leads</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-amber-400" /><span className="text-[var(--brand-primary)]/50">Spend</span></div>
          </div>
        </div>
        
        {reportsLoading ? (
           <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="h-6 w-6 text-[var(--brand-primary)]/20 animate-spin" />
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--brand-primary)]/30">Syncing real-time insights...</p>
           </div>
        ) : chartData.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-12 gap-3 bg-[#F8FAFC] rounded-xl border border-dashed border-[#0F1E3D]/10">
              <AlertCircle className="h-6 w-6 text-[var(--brand-primary)]/20" />
              <div className="text-center">
                 <p className="text-xs font-bold text-[var(--brand-primary)]">Awaiting First Sync</p>
                 <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--brand-primary)]/30 mt-0.5">Automated reports will appear shortly.</p>
              </div>
           </div>
        ) : (
          <div className="flex items-end justify-between gap-3 h-36">
            {chartData.map((d) => (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex items-end justify-center gap-0.5 h-28">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${d.reach}%` }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="flex-1 bg-[#1E3A8A] rounded-t-md min-w-[6px]"
                  />
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${d.leads}%` }}
                    transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
                    className="flex-1 bg-emerald-500 rounded-t-md min-w-[6px]"
                  />
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${d.spend}%` }}
                    transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
                    className="flex-1 bg-amber-400 rounded-t-md min-w-[6px]"
                  />
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest text-[var(--brand-primary)]/30">{d.month}</span>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Deliverables / Report Files */}
      <motion.div variants={item} className="bg-white border border-[#0F1E3D]/5 rounded-2xl shadow-sm overflow-hidden shrink-0">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#0F1E3D]/5 bg-[#F8FAFC]/50">
          <div className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-[#1E3A8A]" />
            <span className="text-sm font-black uppercase tracking-widest text-[var(--brand-primary)]">
              Deliverables & Reports
            </span>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[var(--brand-primary)]/30">
            {deliverables.length} file{deliverables.length !== 1 ? "s" : ""}
          </span>
        </div>

        {deliverables.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <FileText className="h-7 w-7 text-[var(--brand-primary)] opacity-15 mb-3" />
            <p className="text-sm font-bold text-[var(--brand-primary)]">No deliverables yet</p>
            <p className="text-xs font-medium text-[var(--brand-primary)]/40 mt-1 max-w-xs leading-relaxed">
              Monthly performance reports and campaign assets will appear here once uploaded by your agency.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#0F1E3D]/5">
            {deliverables.map((file) => (
              <div key={file.id} className="flex items-center justify-between px-6 py-4 hover:bg-[#F8FAFC] transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-rose-500/10 flex items-center justify-center shrink-0">
                    <FileText className="h-4 w-4 text-rose-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[var(--brand-primary)] truncate">{file.name}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--brand-primary)]/30 mt-0.5">
                      {file.created_at
                        ? new Date(file.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                        : "—"}
                    </p>
                  </div>
                </div>
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={file.name}
                  className="flex items-center gap-1.5 px-3 py-2 bg-[#F8FAFC] border border-[#0F1E3D]/10 text-[var(--brand-primary)] rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white hover:shadow-sm transition-all"
                >
                  <Download className="h-3 w-3" /> Download
                </a>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

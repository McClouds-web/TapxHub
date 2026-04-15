import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  BarChart2, TrendingUp, TrendingDown, Eye, MousePointer,
  Users, DollarSign, FileText, Download, Calendar, Loader2,
  AlertCircle, Shield, Activity, Target
} from "lucide-react";
import { useInvoices, useFiles, useTasks, useReports } from "@/hooks/useAppData";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

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
      className="flex flex-col h-full gap-5 overflow-y-auto no-scrollbar pb-8 text-[#0F1E3D] font-sans">

      {/* Header */}
      <motion.div variants={item} className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight">Intelligence System</h1>
          <p className="text-[11px] font-bold tracking-[0.2em] text-[#3b82f6] uppercase mt-1 flex items-center gap-2">
            <Target className="w-4 h-4"/> Performance & Tactical Analytics
          </p>
        </div>
        <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-[16px] border border-gray-100 shadow-sm">
           <Calendar className="w-4 h-4 text-[#3b82f6] ml-2"/>
           <span className="text-[11px] font-black uppercase tracking-widest text-[#0F1E3D] pr-4">Real-time Sync Active</span>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-4 px-2">
        {currentKpis.map((kpi) => (
          <div key={kpi.label} className="bg-white border border-gray-100 rounded-[28px] p-3 shadow-sm hover:translate-y-[-2px] transition-all group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-20 h-20 bg-[#0F1E3D]/[0.02] rounded-bl-[40px] pointer-events-none group-hover:scale-150 transition-transform"/>
            <div className="flex items-center justify-between mb-4 relative z-10">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-[#3b82f6] transition-colors">{kpi.label}</span>
              <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center group-hover:bg-[#0F1E3D] group-hover:text-white transition-all">
                <kpi.icon className="h-5 w-5"/>
              </div>
            </div>
            <p className="text-3xl font-black text-[#0F1E3D] tracking-tighter leading-none relative z-10 mb-2">{kpi.value}</p>
            <div className={cn("flex items-center gap-2 text-[10px] font-black uppercase tracking-widest relative z-10", kpi.up ? "text-[#3b82f6]" : "text-rose-500")}>
              {kpi.up ? <TrendingUp className="h-3 w-3 stroke-[3]"/> : <TrendingDown className="h-3 w-3 stroke-[3]"/>}
              {kpi.change} Momentum
            </div>
          </div>
        ))}
      </motion.div>

      {/* Campaign Progress + Financials */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-5 px-2">
        <div className="md:col-span-2 bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm">
          <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-10">Operational Progress</h3>
          <div className="space-y-5">
            {[
              { label: "Overall Execution", pct: progress || 0, color: "bg-[#0F1E3D]" },
              { label: "Content Lifecycle", pct: 85, color: "bg-[#3b82f6]" },
              { label: "Ad Dissemination", pct: 72, color: "bg-[#1E3A8A]" },
              { label: "Intelligence Sync", pct: reports.length > 0 ? 100 : 0, color: "bg-[#3b82f6]" },
            ].map((bar) => (
              <div key={bar.label}>
                <div className="flex items-center justify-between mb-3 text-[11px] font-black uppercase tracking-widest">
                  <span className="text-[#0F1E3D]">{bar.label}</span>
                  <span className="text-gray-400">{bar.pct}%</span>
                </div>
                <div className="h-2 bg-gray-50 rounded-full overflow-hidden border border-gray-100 shadow-inner">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${bar.pct}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className={cn("h-full rounded-full transition-all duration-1000", bar.color)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-[32px] p-8 shadow-sm text-gray-900 flex flex-col gap-10 relative overflow-hidden">
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#0F1E3D]/5 rounded-full blur-3xl pointer-events-none"/>
          <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] relative z-10">Financial Ledger</h3>
          <div className="space-y-4 relative z-10 flex-1">
            <FinancialSummaryItem label="Total Investment" val={`$${totalPaid.toLocaleString()}`} color="text-[#3b82f6]" />
            <FinancialSummaryItem label="Settled Invoices" val={invoices.length.toString()} color="text-gray-900" />
            <FinancialSummaryItem label="Pending Actions" val={invoices.filter(i => i.status === "sent").length.toString()} color="text-amber-500" />
          </div>
          <button className="w-full py-4 bg-white rounded-xl text-[11px] font-black uppercase tracking-widest text-center hover:bg-gray-50 transition-all border border-gray-100 shadow-sm relative z-10 text-gray-900">
            View Billing Core
          </button>
        </div>
      </motion.div>

      {/* Monthly Bar Chart (Real Data) */}
      <motion.div variants={item} className="bg-white border border-gray-100 rounded-[40px] p-8 shadow-sm flex flex-col min-h-[300px] mx-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h3 className="text-[13px] font-black text-[#0F1E3D] uppercase tracking-tight">Signal History</h3>
            <p className="text-[11px] font-bold text-gray-400 mt-1 uppercase tracking-widest">Reach · Leads · Spend System</p>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest bg-gray-50 px-4 py-3 rounded-xl border border-gray-100">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#0F1E3D]"/><span className="text-[#0F1E3D]">Reach</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#3b82f6]"/><span className="text-[#0F1E3D]">Leads</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#1E3A8A]"/><span className="text-[#0F1E3D]">Spend</span></div>
          </div>
        </div>
        
        {reportsLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4 flex-1">
            <Loader2 className="h-8 w-8 text-[#3b82f6] animate-spin"/>
            <p className="text-[11px] font-black text-gray-300 uppercase tracking-widest">Synchronizing Intelligence...</p>
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4 bg-gray-50 rounded-[32px] border border-dashed border-gray-200 flex-1">
            <AlertCircle className="h-8 w-8 text-gray-200"/>
            <div className="text-center">
              <p className="text-[12px] font-black text-[#0F1E3D] uppercase tracking-widest">Awaiting First Pulse</p>
              <p className="text-[10px] font-bold text-gray-300 mt-1 uppercase tracking-widest">Automated reports will materialize shortly.</p>
            </div>
          </div>
        ) : (
          <div className="flex items-end justify-between gap-4 h-48 px-4">
            {chartData.map((d) => (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-4">
                <div className="w-full flex items-end justify-center gap-1 h-36">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${d.reach}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="flex-1 bg-[#0F1E3D] rounded-t-lg min-w-[12px] opacity-90 shadow-sm"
                  />
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${d.leads}%` }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.1 }}
                    className="flex-1 bg-[#3b82f6] rounded-t-lg min-w-[12px] shadow-sm"
                  />
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${d.spend}%` }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                    className="flex-1 bg-[#1E3A8A] rounded-t-lg min-w-[12px] opacity-90 shadow-sm"
                  />
                </div>
                <span className="text-[11px] font-black text-gray-300 uppercase tracking-widest">{d.month}</span>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Deliverables / Report Files */}
      <motion.div variants={item} className="bg-white border border-gray-100 rounded-[40px] shadow-sm overflow-hidden mx-2">
        <div className="flex items-center justify-between px-10 py-4 border-b border-gray-50 bg-gray-50/50">
          <div className="flex items-center gap-4">
            <BarChart2 className="h-5 w-5 text-[#3b82f6]"/>
            <span className="text-[13px] font-black text-[#0F1E3D] uppercase tracking-tight">Intelligence Catalog</span>
          </div>
          <span className="text-[11px] font-black text-gray-300 uppercase tracking-widest">
            {deliverables.length} NODES IDENTIFIED
          </span>
        </div>

        {deliverables.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 text-center">
            <div className="w-20 h-20 rounded-[28px] bg-gray-50 border border-gray-100 flex items-center justify-center mb-5 shadow-sm">
                <FileText className="h-8 w-8 text-gray-200"/>
            </div>
            <p className="text-[13px] font-black text-[#0F1E3D] uppercase tracking-tight mb-2">Protocol Standby</p>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest max-w-xs leading-relaxed">
              Performance transcripts and campaign blueprints will materialize here post-deployment.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {deliverables.map((file) => (
              <div key={file.id} className="flex items-center justify-between px-10 py-4 hover:bg-gray-50 transition-all group">
                <div className="flex items-center gap-5 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 group-hover:bg-[#0F1E3D] group-hover:text-white transition-all text-gray-400">
                    <FileText className="h-5 w-5"/>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12px] font-black text-[#0F1E3D] truncate uppercase tracking-tight">{file.name}</p>
                    <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">
                      ARCHIVED: {file.created_at ? format(new Date(file.created_at), "MMM d, yyyy") : "OPERATIONAL"}
                    </p>
                  </div>
                </div>
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={file.name}
                  className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-100 text-[#0F1E3D] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#0F1E3D] hover:text-white hover:border-[#0F1E3D] transition-all shadow-sm"
                >
                  <Download className="h-4 w-4 stroke-[3]"/> Download
                </a>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

function FinancialSummaryItem({ label, val, color }: any) {
  return (
    <div className="flex flex-col gap-2 p-3 bg-white rounded-xl border border-gray-100 shadow-sm group hover:border-gray-200 transition-all">
      <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{label}</span>
      <span className={cn("text-[13px] font-black tracking-tight", color)}>{val}</span>
    </div>
  );
}

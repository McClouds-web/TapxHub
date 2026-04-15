import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, TrendingDown, DollarSign, Users, 
  Target, BarChart3, AlertCircle, CheckCircle2,
  Clock, ArrowUpRight, ArrowDownRight, Zap,
  Layers, Wallet, Briefcase, Activity, 
  Info, Search, Filter, Download, MoreHorizontal,
  ShieldCheck, ShieldAlert, Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  useCompanies, 
  useInvoices, 
  useLeads, 
  useTasks,
  useServicePerformance,
  useRevenueMetrics,
  useRecalculateHealth
} from '@/hooks/useAppData';
import { 
  AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts';
import { format } from 'date-fns';
import { toast } from 'sonner';

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ExecutiveDashboard() {
  const { data: companies = [] } = useCompanies();
  const { data: invoices = [] } = useInvoices();
  const { data: leads = [] } = useLeads();
  const { data: tasks = [] } = useTasks();
  const { data: serviceStats = [] } = useServicePerformance();
  const { data: revenueTrend = [] } = useRevenueMetrics();
  const recalculateHealth = useRecalculateHealth();

  // --- Financial Calculations ---
  const totalMRR = useMemo(() => companies.reduce((acc, c) => acc + (c.monthly_amount || 0), 0), [companies]);
  const totalLTV = useMemo(() => companies.reduce((acc, c) => acc + (c.lifetime_value || 0), 0), [companies]);
  const activeClients = companies.length;
  const leadConvRate = useMemo(() => {
    const total = leads.length || 1;
    const won = leads.filter(l => l.pipeline_stage === 'won').length;
    return Math.round((won / total) * 100);
  }, [leads]);

  // --- Dynamic Trend Calculations ---
  const trends = useMemo(() => {
    const revenueHistory = [...revenueTrend].sort((a, b) => a.month.localeCompare(b.month)); // Oldest first
    const last = revenueHistory[revenueHistory.length - 1];
    const prev = revenueHistory[revenueHistory.length - 2];

    const calculatePct = (curr: number, former: number) => {
      if (!former) return 0;
      return Math.round(((curr - former) / former) * 100);
    };

    return {
      mrr: last && prev ? calculatePct(last.total_mrr, prev.total_mrr) : 0,
      nodes: companies.filter(c => {
        const createdDate = new Date(c.created_at || '');
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return createdDate > thirtyDaysAgo;
      }).length,
      pipeline: 0 // Default
    };
  }, [revenueTrend, companies]);

  // --- Intelligence Insights ---
  const insights = useMemo(() => {
    const list = [];
    if (leadConvRate < 5) list.push({ type: 'warning', text: "Low pipeline velocity. Lead transition lag detected." });
    if (totalMRR > 100000) list.push({ type: 'success', text: "MRR Milestone achieved. Scalability index increasing." });
    
    // Check for high activity but low LTV
    const mismatched = companies.find(c => (c.health_score || 0) > 90 && (c.lifetime_value || 0) < 5000);
    if (mismatched) list.push({ type: 'info', text: `Upsell Opportunity: ${mismatched.name} has high health but low LTV.` });
    
    if (companies.length === 0) list.push({ type: 'info', text: "System standby. No active client nodes detected." });
    
    return list;
  }, [leadConvRate, totalMRR, companies]);

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

  return (
    <div className="flex flex-col h-full gap-6 overflow-x-hidden text-[#0F1E3D]">
      
      {/* ── HEADER ── */}
      <header className="flex items-center justify-between shrink-0 px-2">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#0F1E3D] flex items-center justify-center shadow-xl shadow-[#0F1E3D]/10 group transition-all">
             <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight uppercase">Executive Command</h1>
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mt-1 flex items-center gap-2">
               <Zap className="w-4 h-4 text-amber-500 fill-amber-500"/> TapxMedia Global Revenue Intelligence
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-5 py-3 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2">
             <Download className="w-4 h-4" /> Export Report
          </button>
          <div className="px-5 py-3 bg-[#0F1E3D] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-[#0F1E3D]/10 flex items-center gap-2">
             <Clock className="w-4 h-4" /> Live Ops: {format(new Date(), 'HH:mm')}
          </div>
        </div>
      </header>

      {/* ── GLOBAL METRICS ── */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 shrink-0 px-2">
         <MetricCard 
           title="Monthly Recurring Revenue" 
           val={`$${totalMRR.toLocaleString()}`} 
           trend={trends.mrr >= 0 ? `+${trends.mrr}%` : `${trends.mrr}%`} 
           trendDir={trends.mrr >= 0 ? "up" : "down"} 
           icon={<DollarSign/>} 
         />
         <MetricCard 
           title="System-Wide LTV" 
           val={`$${totalLTV.toLocaleString()}`} 
           trend="Lifetime" 
           trendDir="up" 
           icon={<Wallet/>} 
         />
         <MetricCard 
           title="Operational Nodes" 
           val={activeClients} 
           trend={`+${trends.nodes} new`} 
           trendDir="up" 
           icon={<Layers/>} 
         />
         <MetricCard 
           title="Pipeline Velocity" 
           val={`${leadConvRate}%`} 
           trend="Live" 
           trendDir="up" 
           icon={<Target/>} 
         />
      </motion.div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 px-2 pb-8 overflow-y-auto no-scrollbar">
         
         {/* Center Column: Charts & Health */}
         <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* Revenue Trend Chart */}
            <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm flex flex-col">
               <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-[15px] font-black uppercase tracking-tight">Revenue Trajectory</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Global P&L Pulse</p>
                  </div>
                  <div className="flex gap-2">
                     <span className="flex items-center gap-1.5 text-[10px] font-black text-[#0F1E3D]/40"><div className="w-2 h-2 rounded-full bg-indigo-500"/> MRR</span>
                  </div>
               </div>
               <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueTrend}>
                      <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="month" hide />
                      <YAxis hide />
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                        itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                      />
                      <Area type="monotone" dataKey="total_mrr" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                    </AreaChart>
                  </ResponsiveContainer>
                  {revenueTrend.length === 0 && (
                    <div className="absolute inset-x-0 bottom-24 flex flex-col items-center justify-center text-gray-300">
                       <BarChart3 className="w-12 h-12 mb-2 opacity-10" />
                       <p className="text-[10px] font-black uppercase tracking-widest opacity-20">Insufficient Data for Visualization</p>
                    </div>
                  )}
               </div>
            </div>

            {/* Client Intelligence Map */}
            <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm flex flex-col">
               <div className="flex justify-between items-center mb-8">
                  <h3 className="text-[15px] font-black uppercase tracking-tight">Client Intelligence Map</h3>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                    <input className="bg-gray-50 border border-gray-50 rounded-xl pl-9 pr-4 py-2 text-[11px] font-bold focus:outline-none focus:bg-white focus:border-indigo-100 transition-all w-48" placeholder="Filter nodes..." />
                  </div>
               </div>

               <div className="space-y-4">
                  {companies.length === 0 ? (
                    <div className="py-12 text-center text-gray-300">
                      <Users className="w-12 h-12 mx-auto mb-3 opacity-10" />
                      <p className="text-[11px] font-black uppercase tracking-widest opacity-20">No active client nodes found</p>
                    </div>
                  ) : (
                    companies.map(client => (
                      <ClientRow key={client.id} client={client} onRecalculate={() => recalculateHealth.mutate(client.id)} />
                    ))
                  )}
               </div>
            </div>
         </div>

         {/* Right Column: Service Matrix & Insights */}
         <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* AI Strategic Insights */}
            <div className="bg-[#0F1E3D] rounded-[32px] p-8 border border-[#0F1E3D] shadow-xl shadow-[#0F1E3D]/10 flex flex-col text-white">
               <div className="flex items-center gap-3 mb-6">
                  <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
                  <h3 className="text-[13px] font-black uppercase tracking-tight">Executive Insights</h3>
               </div>
               <div className="space-y-4">
                  {insights.map((insight, i) => (
                    <div key={i} className={cn(
                      "p-4 rounded-xl border border-white/5 bg-white/5 flex items-start gap-4 transition-all hover:bg-white/10",
                      insight.type === 'warning' && "border-rose-500/20",
                      insight.type === 'success' && "border-emerald-500/20"
                    )}>
                       <div className={cn(
                         "w-2 h-2 rounded-full mt-1.5 shrink-0",
                         insight.type === 'warning' ? "bg-rose-500" : insight.type === 'success' ? "bg-emerald-500" : "bg-blue-500"
                       )} />
                       <p className="text-[11px] font-bold leading-relaxed">{insight.text}</p>
                    </div>
                  ))}
               </div>
            </div>

            {/* Service Performance Rank */}
            <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm flex flex-col">
               <h3 className="text-[13px] font-black uppercase tracking-tight mb-6">Service Profitability</h3>
               <div className="space-y-6">
                  {serviceStats.length === 0 ? (
                    <div className="py-8 text-center text-gray-300">
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-20">Awaiting Service Data</p>
                    </div>
                  ) : (
                    serviceStats.map(service => (
                      <div key={service.id} className="space-y-2">
                         <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-tight">
                            <span>{service.service_type}</span>
                            <span className="text-emerald-500">${service.profit_estimate.toLocaleString()}</span>
                         </div>
                         <div className="h-1.5 w-full bg-gray-50 rounded-full border border-gray-50 overflow-hidden">
                            <div 
                              className="h-full bg-indigo-600 rounded-full" 
                              style={{ width: `${Math.min((service.profit_estimate / 100000) * 100, 100)}%` }} 
                            />
                         </div>
                      </div>
                    ))
                  )}
               </div>
            </div>

         </div>

      </div>

    </div>
  );
}

// ─── Sub-Components ─────────────────────────────────────────────────────────

function MetricCard({ title, val, trend, trendDir, icon }: any) {
  return (
    <div className="bg-white rounded-[28px] p-8 border border-gray-100 shadow-sm flex flex-col group hover:-translate-y-1 transition-all">
       <div className="flex justify-between items-start mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-[#0F1E3D] group-hover:bg-[#0F1E3D] group-hover:text-white transition-all">
             {icon}
          </div>
          <div className={cn(
            "flex items-center gap-1 text-[10px] font-black uppercase px-2 py-1 rounded-full",
            trendDir === 'up' ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50"
          )}>
             {trendDir === 'up' ? <ArrowUpRight className="w-3 h-3"/> : <ArrowDownRight className="w-3 h-3"/>}
             {trend}
          </div>
       </div>
       <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{title}</h4>
       <div className="text-[28px] font-black tracking-tighter tabular-nums">{val}</div>
    </div>
  );
}

function ClientRow({ client, onRecalculate }: { client: any, onRecalculate: () => void }) {
  const healthColor = client.health_score > 80 ? 'bg-emerald-500' : client.health_score > 50 ? 'bg-amber-500' : 'bg-rose-500';
  const HealthIcon = client.health_score > 80 ? ShieldCheck : client.health_score > 50 ? Shield : ShieldAlert;

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-transparent hover:border-indigo-100 hover:bg-white transition-all group">
       <div className="flex items-center gap-4 flex-1">
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm", healthColor)}>
             <HealthIcon className="w-5 h-5" />
          </div>
          <div>
             <h5 className="text-[13px] font-black tracking-tight">{client.name}</h5>
             <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">LTV: ${client.lifetime_value?.toLocaleString()}</p>
          </div>
       </div>
       <div className="flex items-center gap-12">
          <div className="text-right">
             <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Health Score</div>
             <div className="flex items-center gap-2">
                <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                   <div className={cn("h-full rounded-full transition-all duration-1000", healthColor)} style={{ width: `${client.health_score}%` }} />
                </div>
                <span className="text-[11px] font-black">{client.health_score}%</span>
             </div>
          </div>
          <button 
            onClick={onRecalculate}
            className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-[#0F1E3D]/40 hover:text-[#0F1E3D] hover:border-indigo-100 transition-all"
          >
             <RefreshCcw className="w-4 h-4" />
          </button>
       </div>
    </div>
  );
}

function RefreshCcw(props: any) {
  return (
    <svg 
      {...props}
      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" 
    >
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 16h5v5" />
    </svg>
  );
}

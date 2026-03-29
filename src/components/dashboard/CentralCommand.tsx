import React from 'react';
import { Brain, TrendingUp, AlertCircle, FileBarChart, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClientHealth {
  id: string;
  name: string;
  sentiment: number;
  status: 'stable' | 'growth' | 'at-risk';
  opportunity: string;
}

const MOCK_HEALTH: ClientHealth[] = [
  { id: '1', name: 'Earth Metals', sentiment: 92, status: 'growth', opportunity: 'SEO Expansion' },
  { id: '2', name: 'Aero Dynamics', sentiment: 45, status: 'at-risk', opportunity: 'Onboarding Rescue' },
  { id: '3', name: 'Global Logistics', sentiment: 78, status: 'stable', opportunity: 'Paid Ads Upsell' },
];

import { useAdminInsights } from '@/hooks/useAppData';

export const CentralCommand: React.FC = () => {
  const { data: insightsArray, isLoading } = useAdminInsights();

  if (isLoading) return <div className="animate-pulse bg-[#F8FAFC] h-full rounded-2xl" />;

  const insightRecord = insightsArray?.[0]; 
  const healthData = insightRecord?.client_health || MOCK_HEALTH;
  const opportunities = insightRecord?.opportunities || [];

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* KPI: Sentiment Avg */}
        <div className="glass-card p-6 border-none bg-indigo-500 text-white shadow-xl shadow-indigo-500/20">
          <div className="flex justify-between items-start mb-4">
            <Brain className="w-6 h-6 text-indigo-200" />
            <span className="text-[10px] font-black uppercase tracking-widest bg-white/10 px-2 py-1 rounded-md">Network Sentiment</span>
          </div>
          <p className="text-3xl font-black mb-1">72%</p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-100">+5% vs Last Week</p>
        </div>

        {/* KPI: Growth Opportunities */}
        <div className="glass-card p-6 border-none bg-[#0F1E3D] text-white shadow-xl shadow-[#0F1E3D]/10">
          <div className="flex justify-between items-start mb-4">
            <Sparkles className="w-6 h-6 text-blue-400" />
            <span className="text-[10px] font-black uppercase tracking-widest bg-white/10 px-2 py-1 rounded-md">Growth Alerts</span>
          </div>
          <p className="text-3xl font-black mb-1">12</p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Detected by AI Engine</p>
        </div>

        {/* Action: Report Generator */}
        <div className="glass-card p-6 flex flex-col justify-center items-center gap-3 border-dashed border-[#0F1E3D]/20 hover:border-indigo-500 transition-all cursor-pointer group">
          <FileBarChart className="w-8 h-8 text-[#0F1E3D]/30 group-hover:text-indigo-500 transition-colors" />
          <p className="text-[10px] font-black uppercase tracking-widest text-[#0F1E3D]/40 group-hover:text-[#0F1E3D]">Generate Weekly Reports</p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
        {/* Client Health Radar */}
        <div className="glass-card p-6 flex flex-col h-full">
           <h3 className="text-sm font-black uppercase tracking-widest text-[#0F1E3D] mb-6">Client Health Matrix</h3>
           <div className="space-y-4 flex-1 overflow-y-auto pr-1">
             {MOCK_HEALTH.map((client) => (
               <div key={client.id} className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#0F1E3D]/5 hover:border-indigo-500/30 transition-all group">
                 <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-black text-[#0F1E3D]">{client.name}</span>
                    <div className={cn(
                      "text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter",
                      client.status === 'growth' ? "bg-emerald-500/10 text-emerald-600" :
                      client.status === 'at-risk' ? "bg-rose-500/10 text-rose-600" : "bg-slate-200 text-slate-600"
                    )}>
                      {client.status}
                    </div>
                 </div>
                 <div className="w-full bg-[#0F1E3D]/5 h-2 rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full transition-all duration-1000",
                        client.sentiment > 80 ? "bg-emerald-500" : client.sentiment > 50 ? "bg-amber-500" : "bg-rose-500"
                      )} 
                      style={{ width: `${client.sentiment}%` }} 
                    />
                 </div>
                 <div className="mt-2 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#0F1E3D]/40 uppercase tracking-widest">Sentiment: {client.sentiment}%</span>
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Details →</span>
                 </div>
               </div>
             ))}
           </div>
        </div>

        {/* Opportunity Radar */}
        <div className="glass-card p-6 flex flex-col h-full bg-[#F8FAFC] border-none">
           <h3 className="text-sm font-black uppercase tracking-widest text-[#0F1E3D] mb-6">Opportunity Radar</h3>
           <div className="space-y-3 flex-1 overflow-y-auto pr-1">
              {opportunities.map((opp, i) => (
                <div key={i} className="flex items-start gap-4 p-4 bg-white rounded-2xl shadow-sm border border-[#0F1E3D]/5">
                   <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                      <TrendingUp className="w-5 h-5 text-emerald-600" />
                   </div>
                   <div>
                      <p className="text-xs font-black text-[#0F1E3D]">{opp.title}</p>
                      <p className="text-[10px] text-[#0F1E3D]/60 font-medium mt-1 leading-relaxed">
                        {opp.description}
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                         <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-md">{opp.probability}</span>
                         <span className="text-[9px] font-black text-[#0F1E3D]/40 uppercase tracking-widest">Est. {opp.value}</span>
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

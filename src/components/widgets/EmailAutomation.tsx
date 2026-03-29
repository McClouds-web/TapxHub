import React from 'react';
import { Mail, Zap, ArrowUpRight, BarChart3, Users } from 'lucide-react';

const STATS = [
  { label: 'Avg Open Rate', val: '42.8%', trend: '+8%' },
  { label: 'Avg Click Rate', val: '3.1%', trend: '+4%' },
  { label: 'Automation Health', val: '98%', trend: 'Stable' },
];

export const EmailAutomation = () => {
  return (
    <div className="flex flex-col gap-5 h-full">
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-8">
           <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-[#0F1E3D]">Lifecycle Pulse</h3>
              <p className="text-[10px] text-[#0F1E3D]/40 font-bold uppercase tracking-widest">Active Automation Flows</p>
           </div>
           <Mail className="w-5 h-5 text-blue-600" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {STATS.map((stat, i) => (
            <div key={i} className="p-4 bg-[#F8FAFC] border border-[#0F1E3D]/5 rounded-2xl">
               <span className="text-[9px] font-black uppercase text-[#0F1E3D]/40 block mb-1">{stat.label}</span>
               <div className="flex items-end justify-between">
                  <span className="text-lg font-black text-[#1E3A8A]">{stat.val}</span>
                  <span className="text-[9px] font-black text-emerald-600 mb-0.5">{stat.trend}</span>
               </div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
           <h4 className="text-[9px] font-black uppercase tracking-widest text-[#0F1E3D]/30">Active Flows</h4>
           {[
             { name: 'Welcome Sequence', active: 1240, cvr: '12%' },
             { name: 'Abandoned Cart', active: 450, cvr: '18%' },
             { name: 'Win-back Campaign', active: 89, cvr: '4%' },
           ].map((flow, i) => (
             <div key={i} className="flex items-center justify-between p-4 bg-white border border-[#0F1E3D]/5 rounded-xl hover:bg-[#F8FAFC] transition-all cursor-pointer group">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <Zap className="w-4 h-4 text-blue-600" />
                   </div>
                   <span className="text-xs font-bold text-[#0F1E3D]">{flow.name}</span>
                </div>
                <div className="flex items-center gap-4">
                   <div className="text-right">
                      <span className="text-[8px] font-black uppercase text-[#0F1E3D]/30 block whitespace-nowrap">Active Subscriptions</span>
                      <span className="text-[11px] font-black text-[#0F1E3D]">{flow.active}</span>
                   </div>
                   <button className="p-1.5 bg-[#0F1E3D] text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowUpRight className="w-3 h-3" />
                   </button>
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

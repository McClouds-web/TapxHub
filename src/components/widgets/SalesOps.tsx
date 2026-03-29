import React from 'react';
import { Briefcase, CheckCircle2, DollarSign, Filter, Layers, Users } from 'lucide-react';

export const SalesOps = () => {
  return (
    <div className="flex flex-col gap-5 h-full">
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-8">
           <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-[#0F1E3D]">Sales Infrastructure</h3>
              <p className="text-[10px] text-[#0F1E3D]/40 font-bold uppercase tracking-widest">CRM & Pipeline Operations</p>
           </div>
           <Briefcase className="w-5 h-5 text-emerald-600" />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
           <div className="p-5 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
              <span className="text-[9px] font-black uppercase text-emerald-600 block mb-1">Pipeline Value</span>
              <span className="text-2xl font-black text-[#0F1E3D]">$142,500</span>
           </div>
           <div className="p-5 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
              <span className="text-[9px] font-black uppercase text-blue-600 block mb-1">Lead Velocity</span>
              <span className="text-2xl font-black text-[#0F1E3D]">3.4 days</span>
           </div>
        </div>

        <div className="space-y-4">
           <h4 className="text-[9px] font-black uppercase tracking-widest text-[#0F1E3D]/30">Sales Flow Health</h4>
           {[
             { name: 'Lead Assignment Automation', status: 'Optimal', icon: Filter },
             { name: 'CRM Data Integrity Sync', status: 'Stable', icon: Layers },
             { name: 'Sales Enablement Assets', status: 'Active', icon: Users },
           ].map((item, i) => (
             <div key={i} className="flex items-center justify-between p-4 bg-white border border-[#0F1E3D]/5 rounded-xl">
                <div className="flex items-center gap-3">
                   <item.icon className="w-4 h-4 text-[#0F1E3D]/30" />
                   <span className="text-xs font-bold text-[#0F1E3D]">{item.name}</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 text-emerald-600 rounded-lg">
                   <CheckCircle2 className="w-3 h-3" />
                   <span className="text-[8px] font-black uppercase">{item.status}</span>
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Brain, Cpu, MessageSquare, Sparkles, Zap } from 'lucide-react';

export const AIStrategy = () => {
  return (
    <div className="flex flex-col gap-5 h-full">
      <div className="glass-card p-3">
        <div className="flex items-center justify-between mb-5">
           <div>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-[#0F1E3D]">AI Cognitive Layer</h3>
              <p className="text-[10px] text-[#0F1E3D]/40 font-bold uppercase tracking-widest">Automated Growth Intelligence</p>
           </div>
           <Brain className="w-5 h-5 text-indigo-500" />
        </div>

        <div className="space-y-4">
           {/* Active Agents */}
           <div className="p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />
              <div className="flex items-center gap-3 mb-4">
                 <div className="w-10 h-10 rounded-xl bg-[#0F1E3D] flex items-center justify-center shadow-xl shadow-[#0F1E3D]/20">
                    <Sparkles className="w-5 h-5 text-white" />
                 </div>
                 <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-[#0F1E3D]">Agent Smith (Content)</h4>
                    <p className="text-[10px] font-bold text-indigo-600 uppercase">Processing: Social Sprint #14</p>
                 </div>
              </div>
              <div className="w-full bg-white/50 h-1 rounded-full overflow-hidden">
                 <div className="bg-indigo-500 h-full w-[82%] rounded-full animate-pulse" />
              </div>
           </div>

           {/* Metrics Grid */}
           <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-white border border-[#0F1E3D]/5 rounded-xl">
                 <Cpu className="w-4 h-4 text-[#0F1E3D]/30 mb-2" />
                 <span className="text-[10px] font-black uppercase text-[#0F1E3D]/40 block">Systems Integrated</span>
                 <span className="text-[10px] font-black text-[#0F1E3D]">12/13 OS Pillars</span>
              </div>
              <div className="p-3 bg-white border border-[#0F1E3D]/5 rounded-xl">
                 <MessageSquare className="w-4 h-4 text-[#0F1E3D]/30 mb-2" />
                 <span className="text-[10px] font-black uppercase text-[#0F1E3D]/40 block">Daily Inferences</span>
                 <span className="text-[10px] font-black text-[#0F1E3D]">4,210 Ops</span>
              </div>
           </div>

           {/* AI Roadmap Note */}
           <div className="p-3 bg-[#F8FAFC] rounded-xl border border-dashed border-[#0F1E3D]/10">
              <p className="text-[10px] text-[#0F1E3D]/60 font-medium leading-relaxed italic">
                 "Our AI layer is currently optimizing the high-velocity CRO experiments by analyzing real-time user heatmaps across the mobile checkout flow."
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

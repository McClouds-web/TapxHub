import React from 'react';
import { motion } from 'framer-motion';
import { Activity, ArrowRight, CheckCircle2, FlaskConical, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const TESTS = [
  { id: 1, name: 'Main Hero CTA: "Book Now" vs "Get Started"', control: '3.4%', variant: '5.2%', uplift: '+52%', sig: '98%', status: 'active' },
  { id: 2, name: 'Pricing Grid Layout: Stacked vs Grid', control: '1.2%', variant: '1.4%', uplift: '+16%', sig: '82%', status: 'completed' },
];

export const CROTests = () => {
  return (
    <div className="flex flex-col gap-5 h-full">
      <div className="glass-card p-3 flex flex-col gap-4">
        <div className="flex items-center justify-between">
           <div>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-[#0F1E3D]">A/B Strategy Vault</h3>
              <p className="text-[10px] text-[#0F1E3D]/40 font-bold uppercase tracking-widest">Active Hypothesis Testing</p>
           </div>
           <FlaskConical className="w-5 h-5 text-purple-600" />
        </div>

        <div className="space-y-4">
          {TESTS.map((test) => (
            <div key={test.id} className="p-3 bg-white border border-[#0F1E3D]/5 rounded-xl relative overflow-hidden group hover:border-purple-500/20 transition-all">
               <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
               
               <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-purple-600">{test.name}</span>
                  <div className={cn(
                    "px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest",
                    test.status === 'active' ? "bg-blue-500/10 text-blue-600" : "bg-slate-100 text-slate-400"
                  )}>
                    {test.status}
                  </div>
               </div>

               <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col">
                     <span className="text-[10px] font-black uppercase text-[#0F1E3D]/40">Control</span>
                     <span className="text-[11px] font-black text-[#0F1E3D]">{test.control}</span>
                  </div>
                  <div className="flex flex-col">
                     <span className="text-[10px] font-black uppercase text-[#0F1E3D]/40">Variant</span>
                     <span className="text-[11px] font-black text-purple-600">{test.variant}</span>
                  </div>
                  <div className="flex flex-col items-end">
                     <span className="text-[10px] font-black uppercase text-blue-600">Uplift</span>
                     <span className="text-[11px] font-black text-blue-600">{test.uplift}</span>
                  </div>
               </div>

               <div className="mt-4 pt-4 border-t border-[#0F1E3D]/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
                     <span className="text-[10px] font-black uppercase tracking-widest text-[#0F1E3D]/60">{test.sig} Significance</span>
                  </div>
                  <button className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0F1E3D]/30 hover:text-purple-600 transition-colors">
                     View Heatmaps →
                  </button>
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

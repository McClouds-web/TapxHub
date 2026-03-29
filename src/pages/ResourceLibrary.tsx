import React from 'react';
import { 
  FileText, Video, Layout, Download, Lock, CheckCircle2, 
  Search, Filter, ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Resource {
  id: string;
  title: string;
  type: 'pdf' | 'video' | 'template';
  category: string;
  locked: boolean;
  module: string;
}

const RESOURCES: Resource[] = [
  { id: '1', title: 'Brand Identity Guidelines', type: 'pdf', category: 'Branding', locked: false, module: 'branding' },
  { id: '2', title: 'SEO 2026 Strategy Guide', type: 'pdf', category: 'SEO', locked: false, module: 'seo' },
  { id: '3', title: 'Paid Ads Performance Matrix', type: 'template', category: 'Paid Media', locked: true, module: 'paid-ads' },
  { id: '4', title: 'Viral Hooks Cheat Sheet', type: 'pdf', category: 'Social', locked: true, module: 'social' },
  { id: '5', title: 'UI/UX Conversion Training', type: 'video', category: 'CRO', locked: true, module: 'cro' },
  { id: '6', title: 'Standard Email Automations', type: 'template', category: 'Email', locked: true, module: 'email' },
];

export default function ResourceLibrary() {
  return (
    <div className="flex flex-col h-full gap-6">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div>
            <h1 className="text-2xl font-black text-[#0F1E3D]">Resource Library</h1>
            <p className="text-[10px] text-[#0F1E3D]/40 font-black uppercase tracking-[0.2em]">Scale your growth with our internal assets</p>
         </div>
         <div className="flex items-center gap-3">
            <div className="relative group">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0F1E3D]/30" />
               <input 
                 type="text" 
                 placeholder="Search assets..." 
                 className="bg-white border border-[#0F1E3D]/5 rounded-xl py-2 pl-9 pr-4 text-xs font-bold text-[#0F1E3D] placeholder:text-[#0F1E3D]/30 focus:outline-none focus:ring-2 focus:ring-[#0F1E3D]/5 w-64 transition-all"
               />
            </div>
            <button className="p-2 bg-white border border-[#0F1E3D]/5 rounded-xl hover:bg-[#F8FAFC] transition-all">
               <Filter className="w-4 h-4 text-[#0F1E3D]/40" />
            </button>
         </div>
      </div>

      {/* Resource Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-1 overflow-y-auto pr-1 no-scrollbar pb-8">
        {RESOURCES.map((res) => (
          <div 
            key={res.id} 
            className={cn(
              "glass-card p-6 flex flex-col group relative overflow-hidden transition-all duration-500",
              res.locked ? "bg-[#F8FAFC]/50" : "hover:border-blue-500/20 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/5"
            )}
          >
            {/* Top Row: Icon & Status */}
            <div className="flex items-center justify-between mb-6">
               <div className={cn(
                 "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                 res.locked ? "bg-slate-200 text-slate-400" : "bg-blue-600 text-white"
               )}>
                  {res.type === 'pdf' ? <FileText className="w-4 h-4" /> : 
                   res.type === 'video' ? <Video className="w-4 h-4" /> : <Layout className="w-4 h-4" />}
               </div>
               {res.locked ? (
                 <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 rounded-md">
                    <Lock className="w-3 h-3 text-slate-400" />
                    <span className="text-[9px] font-black uppercase text-slate-400">Locked</span>
                 </div>
               ) : (
                 <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 rounded-md">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span className="text-[9px] font-black uppercase text-emerald-600">Unlocked</span>
                 </div>
               )}
            </div>

            {/* Content */}
            <div className="flex-1">
               <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#0F1E3D]/30 mb-1 block">{res.category}</span>
               <h3 className={cn(
                 "text-sm font-black text-[#0F1E3D] mb-2 leading-tight",
                 res.locked && "opacity-40"
               )}>{res.title}</h3>
               {res.locked && (
                 <p className="text-[10px] text-[#0F1E3D]/30 font-bold uppercase tracking-widest bg-white border border-dashed border-[#0F1E3D]/10 p-2 rounded-lg text-center mt-4">
                   Activate {res.module.toUpperCase()} module to access
                 </p>
               )}
            </div>

            {/* Bottom Row: Actions */}
            {!res.locked && (
              <div className="mt-8 flex items-center justify-between pt-4 border-t border-[#0F1E3D]/5">
                 <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#0F1E3D]/40 hover:text-blue-600 transition-all">
                    <Download className="w-3.5 h-3.5" /> Download
                 </button>
                 <button className="p-1.5 bg-[#F8FAFC] rounded-lg text-[#0F1E3D]/30 hover:text-[#0F1E3D] transition-colors">
                    <ExternalLink className="w-3.5 h-3.5" />
                 </button>
              </div>
            )}

            {/* Glass decoration */}
            <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-full blur-2xl pointer-events-none -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-1000" />
          </div>
        ))}

        {/* Upgrade Card */}
        <div className="glass-card p-6 bg-[#0F1E3D] border-none flex flex-col items-center justify-center text-center gap-4 group cursor-pointer hover:bg-[#1E3A8A] transition-all">
           <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform">
              <Lock className="w-5 h-5 text-white" />
           </div>
           <div>
              <h3 className="text-sm font-black text-white mb-2">Unlock Full Library</h3>
              <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest max-w-[150px]">Upgrade to Elite Growth Plan</p>
           </div>
           <button className="w-full py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20">
              Request Upgrade
           </button>
        </div>
      </div>
    </div>
  );
}

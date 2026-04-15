import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Video, Layout, Download, Lock, CheckCircle2, 
  Search, Filter, ExternalLink, Shield, Zap, Sparkles,
  BookOpen, Play, Terminal, Target, ArrowRight, ChevronRight,
  ShieldCheck, Activity, Globe, Layers
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'pdf' | 'video' | 'template' | 'sop';
  category: string;
  locked: boolean;
  module: string;
  duration?: string;
  complexity: 'Standard' | 'Advanced' | 'Master';
}

const RESOURCES: Resource[] = [
  { 
    id: '1', 
    title: 'Outbound Pulse: High-Ticket Acquisition', 
    description: 'The definitive sequence for identifying and converting 5-figure retainers through automated LinkedIn and Email orchestration.',
    type: 'sop', 
    category: 'Lead Gen', 
    locked: false, 
    module: 'leads',
    complexity: 'Master'
  },
  { 
    id: '2', 
    title: 'Brand Brain Core: Visual Orchestration', 
    description: 'Protocol for creating high-fidelity visual identities that sustain 8-figure brand authority across all digital touchpoints.',
    type: 'pdf', 
    category: 'Branding', 
    locked: false, 
    module: 'branding',
    complexity: 'Advanced'
  },
  { 
    id: '3', 
    title: 'The 8-Figure Roadmap: Revenue Scaling', 
    description: 'Capital deployment logic for scaling ad spend from $10k to $1M+ monthly while maintaining target conversion integrity.',
    type: 'template', 
    category: 'Paid Media', 
    locked: true, 
    module: 'paid-ads',
    complexity: 'Master'
  },
  { 
    id: '4', 
    title: 'Velocity Engine: Viral Post Architecture', 
    description: 'Precision linguistic triggers and structural hooks designed to maximize platform engagement and distribution velocity.',
    type: 'sop', 
    category: 'Social', 
    locked: true, 
    module: 'social',
    complexity: 'Standard'
  },
  { 
    id: '5', 
    title: 'LTV Optimizer: Post-Acquisition Retention', 
    description: 'A masterclass sequence on client satisfaction loops and upsell logic to maximize lifetime value and account health.',
    type: 'video', 
    category: 'CRO', 
    locked: true, 
    module: 'retention',
    duration: '58m',
    complexity: 'Advanced'
  },
  { 
    id: '6', 
    title: 'Semantic Search Node: SEO 2026', 
    description: 'Transitioning from keyword-based SEO to thematic authority clusters optimized for AI-driven search models.',
    type: 'sop', 
    category: 'SEO', 
    locked: true, 
    module: 'seo',
    complexity: 'Master'
  },
];

export default function ResourceLibrary() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filteredResources = RESOURCES.filter(res => {
    const matchesFilter = filter === 'all' || res.category.toLowerCase() === filter.toLowerCase();
    const matchesSearch = res.title.toLowerCase().includes(search.toLowerCase()) || 
                         res.description.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  return (
    <motion.div variants={container} initial="hidden" animate="show"
      className="flex flex-col h-full gap-5 overflow-y-auto no-scrollbar pb-10 text-[#0F1E3D] font-sans px-2">
      
      {/* Header & Control Center */}
      <motion.div variants={item} className="flex flex-col xl:flex-row xl:items-center justify-between gap-5 px-2">
        <div className="flex-1">
          <h1 className="text-3xl font-black uppercase tracking-tight text-[#0F1E3D]">Growth Hub</h1>
          <p className="text-[11px] font-bold tracking-[0.2em] text-[#3b82f6] uppercase mt-1 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4"/> Certified Proprietary Mastery Node
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[#3b82f6] transition-colors"/>
            <input 
              type="text"
              placeholder="Search resource system..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white border border-gray-100 rounded-[20px] py-4 pl-14 pr-6 text-[12px] font-bold text-[#0F1E3D] placeholder:text-gray-300 focus:outline-none focus:border-[#3b82f6]/30 w-full md:w-80 transition-all shadow-sm"
            />
          </div>
          <div className="flex bg-gray-50 p-1.5 rounded-[22px] border border-gray-100 shadow-sm overflow-x-auto no-scrollbar max-w-full">
            {['all', 'branding', 'seo', 'paid media', 'social'].map((f) => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                  filter === f ? "bg-[#0F1E3D] text-white shadow-lg" : "text-gray-400 hover:text-[#0F1E3D]"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Featured Masterclass Callout */}
      <motion.div variants={item} className="px-2">
        <div className=" rounded-[48px] p-12 md:p-16  relative overflow-hidden group shadow-2xl bg-slate-50 border border-slate-200 text-gray-900 shadow-sm">
          <div className="absolute top-0 right-0 w-[50%] h-full bg-[#3b82f6]/5 skew-x-12 translate-x-1/4 pointer-events-none group-hover:bg-[#3b82f6]/10 transition-colors duration-700"/>
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none"/>
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-16">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-[32px] md:rounded-[40px] bg-white/10 flex items-center justify-center border border-white/10 shadow-2xl shrink-0 group-hover:scale-110 transition-transform duration-700">
               <Zap className="w-12 h-12 md:w-16 md:h-16 text-[#3b82f6] fill-[#3b82f6]/20 animate-pulse" />
            </div>
            <div className="flex-1 text-center lg:text-left">
               <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-4">
                  <span className="px-4 py-1.5 bg-[#3b82f6] text-white rounded-full text-[10px] font-black uppercase tracking-widest">Masterclass</span>
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Module: Agency Scaling System</span>
               </div>
               <h2 className="text-[16px] md:text-[20px] font-black tracking-tighter leading-none mb-4">THE GROWTH ARCHITECT <br /> OPERATIONAL MANUAL</h2>
               <p className="text-white/40 text-[12px] md:text-[13px] font-bold uppercase tracking-widest max-w-2xl mb-10 leading-relaxed">
                  Access the fundamental sequence for scaling high-velocity marketing operations from 0 to 8-figures.
               </p>
               <button className="px-10 py-5 bg-white text-[#0F1E3D] rounded-[24px] text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-4 hover:bg-[#3b82f6] hover:text-white transition-all shadow-2xl active:scale-95 group">
                  Initiate Sequence
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform stroke-[3]" />
               </button>
            </div>
            <div className="hidden xl:flex flex-col gap-4 text-right border-l border-white/5 pl-12 shrink-0">
               <div className="space-y-1">
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Enrolled Node Count</p>
                  <p className="text-[13px] font-black text-white">4,821</p>
               </div>
               <div className="space-y-1">
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Mastery Progress</p>
                  <p className="text-[13px] font-black text-[#3b82f6]">12.4%</p>
               </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Grid System */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 px-2">
        <AnimatePresence mode="popLayout">
          {filteredResources.map((res) => (
            <motion.div 
              layout
              key={res.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4 }}
              className={cn(
                "bg-white border border-gray-100 rounded-[40px] p-10 flex flex-col group relative overflow-hidden transition-all duration-500",
                res.locked ? "opacity-90 grayscale-[0.5] hover:grayscale-0 shadow-sm" : "hover:shadow-2xl hover:border-[#3b82f6]/30 hover:-translate-y-2 shadow-md"
              )}
            >
              {/* Top Meta */}
              <div className="flex items-center justify-between mb-10 relative z-10">
                <div className={cn(
                  "w-16 h-16 rounded-[24px] flex items-center justify-center transition-all shadow-sm border border-transparent",
                  res.locked ? "bg-gray-50 text-gray-300" : "bg-[#0F1E3D] text-white group-hover:bg-[#3b82f6] group-hover:shadow-xl group-hover:shadow-[#3b82f6]/20"
                )}>
                  {res.type === 'pdf' ? <FileText className="w-7 h-7"/> : 
                   res.type === 'video' ? <Play className="w-7 h-7 fill-current"/> : 
                   res.type === 'sop' ? <Terminal className="w-7 h-7"/> : <Layers className="w-7 h-7"/>}
                </div>
                
                <div className="flex flex-col items-end gap-1.5">
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-widest",
                    res.complexity === 'Master' ? "text-rose-500" : res.complexity === 'Advanced' ? "text-amber-500" : "text-[#3b82f6]"
                  )}>{res.complexity} NODE</span>
                  {res.duration && <span className="text-[10px] font-black text-gray-300 flex items-center gap-1.5 uppercase"><Activity className="w-3 h-3"/> {res.duration}</span>}
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-6 h-[2px] bg-[#3b82f6]"/>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#3b82f6]">{res.category}</span>
                </div>
                <h3 className={cn(
                  "text-[16px] font-black text-[#0F1E3D] mb-4 leading-tight tracking-tight uppercase",
                  res.locked && "opacity-60"
                )}>{res.title}</h3>
                <p className="text-[12px] font-bold text-gray-400 leading-relaxed uppercase tracking-widest">
                  {res.description}
                </p>
              </div>

              {/* Interaction Layer */}
              <div className="mt-12 relative z-10">
                {res.locked ? (
                  <div className="w-full h-[60px] bg-gray-50 rounded-[20px] flex items-center justify-center gap-4 group/lock cursor-not-allowed">
                    <Lock className="w-4 h-4 text-gray-300 group-hover/lock:scale-125 transition-transform" />
                    <span className="text-[11px] font-black uppercase tracking-widest text-gray-300">Upgrade Priority to Unlock</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <button className="flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.2em] text-[#0F1E3D] hover:text-[#3b82f6] transition-all group/btn">
                       <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center group-hover/btn:bg-[#3b82f6] group-hover/btn:text-white transition-all">
                          <Download className="w-5 h-5 stroke-[2.5]" />
                       </div>
                       Manifest Data
                    </button>
                    <button className="w-12 h-12 bg-gray-50 rounded-xl text-gray-300 hover:text-[#0F1E3D] hover:bg-white hover:border-gray-100 border border-transparent transition-all flex items-center justify-center">
                       <ExternalLink className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Decoration */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#0F1E3D]/[0.02] rounded-bl-[120px] pointer-events-none group-hover:scale-150 transition-transform duration-1000"/>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#3b82f6]/[0.02] rounded-tr-[60px] pointer-events-none"/>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Global Mastery Progress (Footer) */}
      <motion.div variants={item} className="px-2 mt-12">
        <div className="bg-white border border-gray-100 rounded-[40px] p-12 shadow-sm flex flex-col md:flex-row items-center justify-between gap-12">
           <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-[28px] bg-gray-50 flex items-center justify-center text-[#3b82f6] border border-gray-100">
                 <BookOpen className="w-10 h-10" />
              </div>
              <div>
                 <h4 className="text-[13px] font-black text-[#0F1E3D] uppercase tracking-tight">Growth OS Mastery Status</h4>
                 <p className="text-[11px] font-black text-gray-300 uppercase tracking-widest mt-1">Calculating neural integration of propriety blueprints</p>
              </div>
           </div>
           
           <div className="flex-1 max-w-xl w-full">
              <div className="flex justify-between items-end mb-4">
                 <p className="text-[16px] font-black text-[#0F1E3D] leading-none tracking-tighter">12 / 848 <span className="text-[12px] text-gray-300 uppercase ml-2 tracking-widest">Assets Mastered</span></p>
                 <p className="text-[11px] font-black text-[#3b82f6] uppercase tracking-widest">1.4%</p>
              </div>
              <div className="w-full h-4 bg-gray-50 rounded-full overflow-hidden border border-gray-100 shadow-inner">
                 <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '1.4%' }}
                    transition={{ duration: 2, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-[#0F1E3D] to-[#3b82f6] rounded-full"
                 />
              </div>
           </div>

           <button className="px-6 py-5 border-4 border-gray-50 rounded-[24px] text-[11px] font-black text-[#0F1E3D] uppercase tracking-widest hover:border-[#3b82f6] hover:text-[#3b82f6] transition-all shrink-0">
              System Roadmap
           </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

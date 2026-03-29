import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Compass, Calendar, PenTool, CheckCircle, Share2, 
  BarChart3, Settings2, ChevronRight, ChevronLeft,
  ThumbsUp, ThumbsDown, MessageSquare, Image as ImageIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useSocialWorkflow } from '@/hooks/useAppData';

const STAGES = [
  { id: 'strategy', name: 'Strategy', icon: Compass, color: 'text-purple-500' },
  { id: 'planning', name: 'Planning', icon: Calendar, color: 'text-blue-500' },
  { id: 'creation', name: 'Creation', icon: PenTool, color: 'text-amber-500' },
  { id: 'approval', name: 'Approval', icon: CheckCircle, color: 'text-emerald-500' },
  { id: 'publishing', name: 'Publishing', icon: Share2, color: 'text-indigo-500' },
  { id: 'tracking', name: 'Tracking', icon: BarChart3, color: 'text-rose-500' },
  { id: 'optimization', name: 'Optimization', icon: Settings2, color: 'text-cyan-500' },
];

const MOCK_CONTENT = [
  { id: 1, type: 'Carousel', platform: 'Instagram', title: 'The Growth OS Launch', image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=600&q=80' },
  { id: 2, type: 'Reel', platform: 'Instagram/TikTok', title: 'Client Success: $12k ROI', image: 'https://images.unsplash.com/photo-1611926653458-09294b319dd7?auto=format&fit=crop&w=600&q=80' },
  { id: 3, type: 'Thread', platform: 'X / LinkedIn', title: 'Why Multi-Channel is Queen', image: 'https://images.unsplash.com/photo-1611606063065-ee7946f0787a?auto=format&fit=crop&w=600&q=80' },
];

export default function SocialEngine() {
  const { user } = useAuth();
  const { data: workflow, isLoading } = useSocialWorkflow(user?.company_id || '');
  const [contentIndex, setContentIndex] = useState(0);

  const currentStage = workflow?.current_stage || 'approval';
  const activeStage = STAGES.find(s => s.id === currentStage) || STAGES[0];

  if (isLoading) return <div className="animate-pulse bg-[#F8FAFC] h-full rounded-3xl" />;

  return (
    <div className="flex flex-col h-full gap-6">
      {/* 7-Stage Progress Tracker */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-8 overflow-x-auto no-scrollbar pb-2">
          {STAGES.map((stage, i) => {
            const Icon = stage.icon;
            const isActive = stage.id === currentStage;
            const isCompleted = STAGES.findIndex(s => s.id === currentStage) > i;

            return (
              <div key={stage.id} className="flex items-center group shrink-0">
                <div 
                  className={cn(
                    "flex flex-col items-center gap-2 transition-all",
                    isActive ? "scale-110 opacity-100" : "opacity-40"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500",
                    isActive ? "bg-[#0F1E3D] text-white shadow-xl shadow-[#0F1E3D]/20 rotate-0" : "bg-[#F8FAFC] text-[#0F1E3D]/40 rotate-6",
                    isCompleted && "bg-emerald-500/10 text-emerald-600"
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-center">
                    {stage.name}
                  </span>
                </div>
                {i < STAGES.length - 1 && (
                  <div className="w-8 h-px bg-[#0F1E3D]/5 mx-2" />
                )}
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between bg-[#F8FAFC] p-4 rounded-2xl border border-[#0F1E3D]/5">
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-xl bg-white shadow-sm", activeStage.color)}>
              <activeStage.icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-[#0F1E3D]">{activeStage.name} Phase</h3>
              <p className="text-[10px] text-[#0F1E3D]/40 font-bold uppercase tracking-widest">Active Social Media Workflow</p>
            </div>
          </div>
          <button className="bg-[#0F1E3D] text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#1E3A8A] transition-all">
            Open Chat Guide
          </button>
        </div>
      </div>

      {/* Main Engine Workplace */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Left: Dynamic Interface based on Stage */}
        <div className="lg:col-span-8 h-full">
          {currentStage === 'approval' ? (
            <div className="h-full flex flex-col items-center justify-center gap-8">
               <div className="max-w-md w-full relative">
                  <AnimatePresence mode="wait">
                    <motion.div 
                      key={MOCK_CONTENT[contentIndex].id}
                      initial={{ opacity: 0, scale: 0.9, x: 20 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.9, x: -20 }}
                      className="glass-card overflow-hidden h-[500px] flex flex-col"
                    >
                      <div className="h-[70%] relative overflow-hidden">
                        <img src={MOCK_CONTENT[contentIndex].image} className="w-full h-full object-cover" alt="content" />
                        <div className="absolute top-4 left-4 flex gap-2">
                           <span className="bg-[#0F1E3D]/80 backdrop-blur-md text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest">
                             {MOCK_CONTENT[contentIndex].type}
                           </span>
                           <span className="bg-white/80 backdrop-blur-md text-[#0F1E3D] text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest">
                             {MOCK_CONTENT[contentIndex].platform}
                           </span>
                        </div>
                      </div>
                      <div className="p-6 flex-1 flex flex-col">
                        <h4 className="text-lg font-black text-[#0F1E3D] mb-2">{MOCK_CONTENT[contentIndex].title}</h4>
                        <p className="text-xs text-[#0F1E3D]/60 font-medium leading-relaxed">
                          "This visual focuses on the modular nature of the Hub OS, emphasizing the ease of tracking ROI across 13 distinct pillars."
                        </p>
                        <div className="mt-auto flex items-center justify-between">
                           <div className="flex items-center gap-1.5 p-2 bg-emerald-500/10 text-emerald-600 rounded-lg cursor-pointer hover:bg-emerald-500/20 transition-all font-black text-[10px] uppercase tracking-widest">
                             <ThumbsUp className="w-3.5 h-3.5" /> Approve
                           </div>
                           <div className="flex items-center gap-1.5 p-2 bg-rose-500/10 text-rose-600 rounded-lg cursor-pointer hover:bg-rose-500/20 transition-all font-black text-[10px] uppercase tracking-widest">
                             <ThumbsDown className="w-3.5 h-3.5" /> Revision
                           </div>
                           <div className="p-2 bg-[#F8FAFC] text-[#0F1E3D]/40 rounded-lg hover:text-[#0F1E3D] transition-colors">
                             <MessageSquare className="w-4 h-4" />
                           </div>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  <div className="flex justify-center gap-4 mt-6">
                    <button 
                      onClick={() => setContentIndex(prev => Math.max(0, prev - 1))}
                      className="w-10 h-10 rounded-full border border-[#0F1E3D]/10 flex items-center justify-center hover:bg-white transition-all disabled:opacity-20"
                      disabled={contentIndex === 0}
                    >
                      <ChevronLeft className="w-5 h-5 text-[#0F1E3D]" />
                    </button>
                    <button 
                      onClick={() => setContentIndex(prev => Math.min(MOCK_CONTENT.length - 1, prev + 1))}
                      className="w-10 h-10 rounded-full border border-[#0F1E3D]/10 flex items-center justify-center hover:bg-white transition-all disabled:opacity-20"
                      disabled={contentIndex === MOCK_CONTENT.length - 1}
                    >
                      <ChevronRight className="w-5 h-5 text-[#0F1E3D]" />
                    </button>
                  </div>
               </div>
            </div>
          ) : (
            <div className="h-full glass-card flex flex-col items-center justify-center p-12 text-center">
               <div className="w-16 h-16 rounded-3xl bg-blue-500/10 flex items-center justify-center mb-4">
                 <activeStage.icon className={cn("w-8 h-8", activeStage.color)} />
               </div>
               <h3 className="text-xl font-black text-[#0F1E3D] mb-2">{activeStage.name} Module Initializing</h3>
               <p className="text-sm text-[#0F1E3D]/40 font-medium max-w-sm">
                 The agency is currently finalizing the {activeStage.name.toLowerCase()} for this sprint. 
                 Check back in 24-48 hours for updates.
               </p>
            </div>
          )}
        </div>

        {/* Right: Engine Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-6 h-full overflow-y-auto pr-1 no-scrollbar">
          <div className="glass-card p-6">
             <h4 className="text-[10px] font-black uppercase tracking-widest text-[#0F1E3D]/40 mb-4">Content Pillars</h4>
             <div className="space-y-3">
               {['ROI-Driven Marketing', 'AI-Automation', 'Elite Design Agency'].map((pillar, i) => (
                 <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-[#F8FAFC] border border-[#0F1E3D]/5">
                   <div className="w-2 h-2 rounded-full bg-blue-500" />
                   <span className="text-xs font-bold text-[#0F1E3D]">{pillar}</span>
                 </div>
               ))}
             </div>
          </div>

          <div className="glass-card p-6 flex-1">
             <h4 className="text-[10px] font-black uppercase tracking-widest text-[#0F1E3D]/40 mb-4">Action Log</h4>
             <div className="space-y-6 relative ml-1">
                <div className="absolute top-0 bottom-0 left-[7px] w-0.5 bg-[#0F1E3D]/5" />
                {[1, 2, 3].map((_, i) => (
                  <div key={i} className="flex gap-4 relative">
                    <div className="w-3.5 h-3.5 rounded-full bg-white border-2 border-[#0F1E3D] z-10 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-[#0F1E3D]">Strategy Draft Uploaded</p>
                      <p className="text-[9px] text-[#0F1E3D]/40 font-bold uppercase">2 days ago • Admin</p>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}

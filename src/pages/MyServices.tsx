import { motion } from "framer-motion";
import { 
  Zap, 
  Target, 
  ChevronRight, 
  ArrowRight,
  ShieldCheck,
  Hexagon,
  Sparkles,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useProjects, useTasks } from "@/hooks/useAppData";
import { useNavigate } from "react-router-dom";

export default function MyServices() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: projects = [], isLoading } = useProjects();
  const { data: tasks = [] } = useTasks();

  // Filter projects for this client's company
  const myServices = projects.filter(p => p.company_id === user?.company_id);

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

  return (
    <motion.div variants={container} initial="hidden" animate="show"
      className="flex flex-col h-full gap-6 overflow-y-auto no-scrollbar pb-10">
      
      <motion.div variants={item} className="flex justify-between items-end">
        <div>
           <h1 className="text-4xl font-black tracking-tight text-[#0F1E3D] uppercase">My Services</h1>
           <p className="text-[10px] text-[#0F1E3D]/40 font-black mt-2 uppercase tracking-[0.25em] flex items-center gap-2">
             <ShieldCheck className="w-4 h-4 text-emerald-500" /> Active Service Infrastructure
           </p>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
           <Loader2 className="w-8 h-8 animate-spin text-[#1E3A8A]" />
        </div>
      ) : myServices.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-white border border-[#0F1E3D]/5 rounded-[40px] shadow-sm">
           <div className="w-20 h-20 rounded-3xl bg-[#F8FAFC] border border-[#0F1E3D]/5 flex items-center justify-center mb-6">
              <Hexagon className="w-10 h-10 text-[var(--brand-primary)] opacity-10" />
           </div>
           <h3 className="text-[14px] font-black text-[#0F1E3D] uppercase tracking-widest mb-3">No Active Modules</h3>
           <p className="text-[11px] font-medium text-[#0F1E3D]/40 max-w-sm leading-relaxed mb-6">
             Your operational framework is currently in the strategy phase. Modules will appear here once the Growth Agent initializes your specific service nodes.
           </p>
           <button 
             onClick={() => navigate('/client-portal')}
             className="px-6 py-3 bg-[#0F1E3D] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#1E3A8A] transition-all flex items-center gap-2 shadow-lg active:scale-95"
           >
             Return to Hub <ArrowRight className="w-4 h-4" />
           </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
           {myServices.map((service) => {
             const serviceSlug = service.service || service.title.toLowerCase().replace(/\s+/g, '-');
             const serviceIconColor = 
                serviceSlug.includes('seo') ? 'bg-indigo-500' :
                serviceSlug.includes('ads') ? 'bg-amber-500' :
                serviceSlug.includes('video') ? 'bg-emerald-500' : 'bg-[#0F1E3D]';

             return (
               <motion.div 
                 key={service.id} 
                 variants={item}
                 onClick={() => navigate(`/services/${serviceSlug}`)}
                 className="group bg-white border border-[#0F1E3D]/5 rounded-[32px] p-8 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer relative overflow-hidden"
               >
                 <div className="relative z-10">
                   <div className="flex items-center justify-between mb-8">
                      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-black/5", serviceIconColor)}>
                         <Zap className="w-6 h-6 fill-current" />
                      </div>
                      <div className="flex flex-col items-end">
                         <span className={cn(
                           "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                           service.status === 'active' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-amber-50 border-amber-100 text-amber-600'
                         )}>
                            {service.status}
                         </span>
                         <span className="text-[9px] font-black text-gray-300 uppercase mt-2">{service.due_date || 'Ongoing'}</span>
                      </div>
                   </div>

                   <h3 className="text-[16px] font-black text-[#0F1E3D] uppercase tracking-tight mb-2 group-hover:text-[#1E3A8A] transition-colors">{service.title}</h3>
                   <p className="text-[11px] font-bold text-[#0F1E3D]/40 uppercase tracking-widest mb-6">Service Infrastructure</p>
                   
                   <div className="space-y-3 mb-8">
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                         <span className="text-gray-400">Momentum</span>
                         <span className="text-[#1E3A8A]">{service.progress || 0}%</span>
                      </div>
                      <div className="w-full bg-[#F8FAFC] h-1.5 rounded-full overflow-hidden border border-[#0F1E3D]/5">
                         <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: `${service.progress || 0}%` }}
                           transition={{ duration: 1, delay: 0.5 }}
                           className={cn("h-full rounded-full bg-gradient-to-r", serviceIconColor.replace('bg-', 'from-'))} 
                         />
                      </div>
                   </div>

                   <div className="flex items-center justify-between pt-4 border-t border-gray-50 group-hover:border-[#1E3A8A]/10 transition-colors">
                      <div className="flex items-center gap-2">
                         <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                         <span className="text-[10px] font-black uppercase text-[#1E3A8A]/50">Strategic Alpha</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#0F1E3D]/20 group-hover:text-[#1E3A8A] group-hover:translate-x-1 transition-all" />
                   </div>
                 </div>
                 
                 {/* Decorative background shape */}
                 <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[#F8FAFC]/50 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000" />
               </motion.div>
             );
           })}
        </div>
      )}
    </motion.div>
  );
}

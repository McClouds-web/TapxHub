import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  BarChart, Bar, ResponsiveContainer, AreaChart, Area, 
  LineChart, Line, XAxis, Tooltip
} from "recharts";
import { 
  TrendingUp, CheckSquare, Target, Zap, Clock, ChevronRight,
  History, Activity, Layout
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SEOTracker } from "@/components/widgets/SEOTracker";
import { AdsROI } from "@/components/widgets/AdsROI";
import { LeadTable } from "@/components/widgets/LeadTable";
import { ReviewGallery } from "@/components/widgets/ReviewGallery";
import { CROTests } from "@/components/widgets/CROTests";
import { EmailAutomation } from "@/components/widgets/EmailAutomation";
import { BrandAssets } from "@/components/widgets/BrandAssets";
import { AnalyticsDash } from "@/components/widgets/AnalyticsDash";
import { AIStrategy } from "@/components/widgets/AIStrategy";
import { SalesOps } from "@/components/widgets/SalesOps";
import { ConversationalAI } from "@/components/widgets/ConversationalAI";

const SERVICES_DATA: Record<string, { title: string, kpis: any[], dummyData: any[], tasks: any[] }> = {
  "branding": { 
      title: "Brand Strategy & Identity", 
      kpis: [{ label: "Brand Mentions", val: "420" }, { label: "Sentiment", val: "94%" }],
      dummyData: [{ name: 'W1', val: 120 }, { name: 'W2', val: 180 }, { name: 'W3', val: 300 }, { name: 'W4', val: 420 }],
      tasks: [ { t: "Brand Guidelines PDF", done: true }, { t: "Tone of Voice Doc", done: false } ]
  },
  "analytics": { 
      title: "Data Analytics & Insights", 
      kpis: [{ label: "Data Sources", val: "7" }, { label: "Events Tracked", val: "1.2M" }],
      dummyData: [{ name: 'W1', val: 400 }, { name: 'W2', val: 600 }, { name: 'W3', val: 900 }, { name: 'W4', val: 1200 }],
      tasks: [ { t: "Google Tag Manager Audit", done: true }, { t: "Mixpanel Dashboards", done: false } ]
  },
  "video": { title: "Video & Motion Systems", kpis: [{ label: "Assets Delivered", val: "14" }], dummyData: [], tasks: [] },
  "ecommerce": { title: "E-Commerce & Sales Infra", kpis: [{ label: "Store CR", val: "3.4%" }], dummyData: [], tasks: [] },
  "seo": { title: "SEO & Organic Engineering", kpis: [{ label: "Organic Traffic", val: "+24%" }], dummyData: [], tasks: [] },
  "social": { title: "Social Media Systems", kpis: [{ label: "Total Reach", val: "145k" }], dummyData: [], tasks: [] },
  "email": { title: "Email & Lifecycle Automation", kpis: [{ label: "Open Rate", val: "42%" }], dummyData: [], tasks: [] },
  "ai": { title: "AI-Integrated Marketing", kpis: [{ label: "Hours Saved", val: "112" }], dummyData: [], tasks: [] },
  "conversational": { title: "Conversational & Chat", kpis: [{ label: "Bot Resolution", val: "88%" }], dummyData: [], tasks: [] },
  "paid-ads": { title: "Paid Media & Performance", kpis: [{ label: "Current ROAS", val: "4.2x" }], dummyData: [], tasks: [] },
  "lead-gen": { title: "Lead Gen & Funnels", kpis: [{ label: "Leads Gen", val: "89" }], dummyData: [], tasks: [] },
  "cro": { title: "Conversion Rate Optimization", kpis: [{ label: "Uplift", val: "+12%" }], dummyData: [], tasks: [] },
  "sales": { title: "Marketing Automation & Ops", kpis: [{ label: "Systems Synced", val: "5" }], dummyData: [], tasks: [] },
};

export default function ServiceModule() {
  const { id } = useParams<{ id: string }>();
  const service = id && SERVICES_DATA[id] ? SERVICES_DATA[id] : { 
      title: "Custom Service Module", 
      kpis: [{ label: "Status", val: "Active" }],
      dummyData: [{ name: 'W1', val: 10 }, { name: 'W2', val: 40 }, { name: 'W3', val: 80 }, { name: 'W4', val: 100 }],
      tasks: [{ t: "Initial Consultation", done: true }, { t: "Strategy Implementation", done: false }]
  };

  const hasData = service.dummyData.length > 0;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-full gap-5">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-white border border-[#0F1E3D]/5 rounded-2xl p-6 shadow-sm">
         <div>
            <div className="flex items-center gap-2 mb-1">
               <span className="text-[10px] font-black uppercase tracking-widest text-[#0F1E3D]/40">TapxMedia OS</span>
               <ChevronRight className="w-3 h-3 text-[#0F1E3D]/30" />
               <span className="text-[10px] font-black uppercase tracking-widest text-[#1E3A8A]">Active Module</span>
            </div>
            <h1 className="text-2xl font-extrabold text-[#0F1E3D]">{service.title}</h1>
         </div>
         <div className="mt-4 md:mt-0 flex items-center gap-4">
            {service.kpis.map((kpi, i) => (
                <div key={i} className="flex flex-col items-end">
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#0F1E3D]/40">{kpi.label}</span>
                    <span className="text-xl font-black text-[#1E3A8A] leading-none">{kpi.val}</span>
                </div>
            ))}
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 min-h-0">
          
          {/* Main Content Area: Conditional Tool Injection */}
          <div className="lg:col-span-2 min-h-0">
            {id === 'seo' ? <SEOTracker /> :
             id === 'paid-ads' ? <AdsROI /> :
             id === 'lead-gen' ? <LeadTable /> :
             id === 'video' ? <ReviewGallery /> :
             id === 'cro' ? <CROTests /> :
             id === 'email' ? <EmailAutomation /> :
             id === 'branding' ? <BrandAssets /> :
             id === 'analytics' ? <AnalyticsDash /> :
             id === 'ai' ? <AIStrategy /> :
             id === 'sales' ? <SalesOps /> :
             id === 'conversational' ? <ConversationalAI /> :
             id === 'ecommerce' ? <SalesOps /> : (
                <div className="bg-white border border-[#0F1E3D]/5 rounded-2xl p-6 shadow-sm flex flex-col relative overflow-hidden h-full group">
                   <div className="absolute top-0 right-0 w-64 h-64 bg-[#1E3A8A]/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/4" />
                   <div className="flex justify-between items-start mb-6 z-10">
                       <div>
                           <h3 className="text-xs font-black uppercase tracking-widest text-[#0F1E3D]">Performance Velocity</h3>
                           <p className="text-[10px] uppercase font-bold text-[#0F1E3D]/40 tracking-wider">30 Day Trajectory</p>
                       </div>
                       <div className="flex items-center gap-2 bg-[#F8FAFC] px-3 py-1.5 rounded-lg border border-[#0F1E3D]/5 text-[10px] font-black uppercase tracking-widest text-[#0F1E3D]/60 transition-all group-hover:border-blue-500/20">
                           <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> +High
                       </div>
                   </div>
                   
                   <div className="flex-1 w-full min-h-[250px] z-10 cursor-crosshair">
                      <ResponsiveContainer width="100%" height="100%">
                          {hasData ? (
                              <AreaChart data={service.dummyData}>
                                  <defs>
                                      <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                          <stop offset="5%" stopColor="#1E3A8A" stopOpacity={0.3}/>
                                          <stop offset="95%" stopColor="#1E3A8A" stopOpacity={0}/>
                                      </linearGradient>
                                  </defs>
                                  <Tooltip 
                                      contentStyle={{ backgroundColor: '#0F1E3D', borderRadius: '12px', border: 'none', color: '#fff' }}
                                      itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: 'bold' }}
                                  />
                                  <Area type="monotone" dataKey="val" stroke="#1E3A8A" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
                              </AreaChart>
                          ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-[#0F1E3D]/10 rounded-xl">
                                  <Activity className="w-8 h-8 text-[#0F1E3D]/10 mb-2" />
                                  <p className="text-[10px] font-black text-[#0F1E3D]/30 uppercase tracking-[0.2em]">Awaiting Live Sync</p>
                              </div>
                          )}
                      </ResponsiveContainer>
                   </div>
                </div>
             )}
          </div>

          {/* Module Tasks & Sync */}
          <div className="flex flex-col gap-5">
              <div className="bg-white border border-[#0F1E3D]/5 rounded-2xl p-6 shadow-sm flex-1">
                  <div className="flex items-center gap-2 mb-4">
                    <Layout className="w-3.5 h-3.5 text-blue-600" />
                    <h3 className="text-xs font-black uppercase tracking-widest text-[#0F1E3D]">Module Operations</h3>
                  </div>
                  <div className="flex flex-col gap-3">
                      {service.tasks.length > 0 ? service.tasks.map((task, i) => (
                           <div key={i} className="group flex items-center justify-between p-3 rounded-xl border border-[#0F1E3D]/5 bg-[#F8FAFC] hover:border-blue-500/30 hover:bg-white transition-all cursor-pointer">
                               <div className="flex items-center gap-3">
                                   <div className={cn("w-5 h-5 rounded-lg flex items-center justify-center transition-all", task.done ? "bg-emerald-500 text-white" : "border-2 border-[#0F1E3D]/10 bg-white group-hover:border-blue-500")}>
                                       {task.done && <CheckSquare className="w-3 h-3" />}
                                   </div>
                                   <span className={cn("text-[11px] font-bold tracking-tight", task.done ? "text-[#0F1E3D]/30 line-through" : "text-[#0F1E3D]")}>{task.t}</span>
                               </div>
                           </div>
                      )) : (
                          <div className="text-center py-10">
                              <Zap className="w-7 h-7 text-blue-600/20 mx-auto mb-2 animate-pulse" />
                              <p className="text-[10px] font-black text-[#0F1E3D]/30 uppercase tracking-[0.2em]">Systems Stabilizing...</p>
                          </div>
                      )}
                  </div>
              </div>
              
              <div className="bg-[#0F1E3D] text-white rounded-2xl p-6 shadow-xl shadow-[#0F1E3D]/10 shrink-0 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-1000" />
                  <Clock className="w-5 h-5 text-blue-400 mb-3" />
                  <h4 className="text-xs font-black uppercase tracking-widest mb-1">Engine Pulse</h4>
                  <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.15em] mb-4">Syncing with Supabase</p>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-blue-400 h-full w-[65%] rounded-full animate-pulse" />
                  </div>
              </div>
          </div>
      </div>

      {/* NEW: Project History / Sprint Log */}
      <div className="bg-white border border-[#0F1E3D]/5 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
              <History className="w-4 h-4 text-[#0F1E3D]/40" />
              <h3 className="text-xs font-black uppercase tracking-widest text-[#0F1E3D]">Module History & Log</h3>
          </div>
          <div className="space-y-4">
              {[1, 2].map((_, i) => (
                  <div key={i} className="flex gap-4 group">
                      <div className="flex flex-col items-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 group-hover:scale-150 transition-transform" />
                          <div className="w-px flex-1 bg-[#0F1E3D]/5 my-1" />
                      </div>
                      <div className="pb-4">
                          <p className="text-[10px] font-black uppercase tracking-widest text-[#0F1E3D]/40 mb-1">Sprint #{4-i} Update</p>
                          <p className="text-xs font-bold text-[#0F1E3D] mb-1">Technical infrastructure migration complete.</p>
                          <p className="text-[10px] font-medium text-[#0F1E3D]/30">Automated log entry via TapxMedia AI Assistant • 3 days ago</p>
                      </div>
                  </div>
              ))}
          </div>
      </div>

    </motion.div>
  );
}

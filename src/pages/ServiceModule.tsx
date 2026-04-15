import React from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  BarChart, Bar, ResponsiveContainer, AreaChart, Area, 
  LineChart, Line, XAxis, Tooltip, Cell
} from "recharts";
import { 
  TrendingUp, CheckSquare, Target, Zap, Clock, ChevronRight,
  History, Activity, Layout, Shield, Sparkles, Hexagon
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-full gap-5 overflow-y-auto no-scrollbar pb-8 text-[#0F1E3D] font-sans">
      
      {/* Header Card */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm px-10">
        <div className="flex items-center gap-4">
           <div className="w-16 h-16 rounded-xl bg-[#0F1E3D] flex items-center justify-center text-white shadow-xl shadow-[#0F1E3D]/10">
              <Hexagon className="w-8 h-8 text-[#3b82f6]"/>
           </div>
           <div>
            <div className="flex items-center gap-2 mb-1.5 uppercase tracking-[0.2em] font-black text-[10px]">
              <span className="text-gray-300">TapxHub OS</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#3b82f6] stroke-[4]"/>
              <span className="text-[#3b82f6]">Active Module</span>
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tight text-[#0F1E3D] leading-none">{service.title}</h1>
          </div>
        </div>

        <div className="mt-5 lg:mt-0 flex items-center gap-10">
          {service.kpis.map((kpi, i) => (
            <div key={i} className="flex flex-col items-end">
              <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-2">{kpi.label}</span>
              <span className="text-3xl font-black text-[#0F1E3D] leading-none tracking-tighter">{kpi.val}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 px-2 min-h-0">
        
        {/* Main Content Area: Conditional Tool Injection */}
        <div className="lg:col-span-2 min-h-[400px]">
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
            <div className="bg-white border border-gray-100 rounded-[40px] p-10 shadow-sm flex flex-col relative overflow-hidden h-full group">
              <div className="absolute top-0 right-0 w-[40%] h-[100%] bg-[#0F1E3D]/[0.02] -skew-x-12 translate-x-1/4 pointer-events-none"/>
              <div className="flex justify-between items-center mb-10 z-10 relative">
                <div>
                  <h3 className="text-[13px] font-black text-[#0F1E3D] uppercase tracking-tight">Performance Velocity</h3>
                  <p className="text-[11px] font-black text-gray-300 uppercase tracking-[0.2em] mt-1">Operational Trajectory System</p>
                </div>
                <div className="flex items-center gap-3 bg-[#eefcfb] px-4 py-2 rounded-xl border border-[#c6e9dc] text-[10px] font-black uppercase tracking-widest text-[#3b82f6]">
                  <TrendingUp className="w-4 h-4 stroke-[3]"/> 12.4% Momentum
                </div>
              </div>
              
              <div className="flex-1 w-full min-h-[300px] z-10 relative">
                <ResponsiveContainer width="100%" height="100%">
                  {hasData ? (
                    <AreaChart data={service.dummyData}>
                      <defs>
                        <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0F1E3D', borderRadius: '16px', border: 'none', color: '#fff', padding: '12px 16px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                        itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: '900' }}
                      />
                      <Area type="monotone" dataKey="val" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorVal)"/>
                    </AreaChart>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center border-4 border-dashed border-gray-50 rounded-[32px]">
                      <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                         <Activity className="w-8 h-8 text-gray-200"/>
                      </div>
                      <p className="text-[11px] font-black text-gray-300 tracking-[0.3em] uppercase">Synchronizing Signal Core</p>
                    </div>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {/* Module Tasks & Sync */}
        <div className="flex flex-col gap-5">
          <div className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm flex flex-col">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100">
                <Layout className="w-5 h-5 text-[#3b82f6]"/>
              </div>
              <h3 className="text-[12px] font-black text-[#0F1E3D] uppercase tracking-widest">Operational Chain</h3>
            </div>
            
            <div className="flex flex-col gap-4 overflow-y-auto no-scrollbar flex-1">
              {service.tasks.length > 0 ? service.tasks.map((task, i) => (
                <div key={i} className="group flex items-center justify-between p-3 rounded-[20px] bg-gray-50 border border-transparent hover:border-[#3b82f6]/30 hover:bg-white transition-all cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-6 h-6 rounded-lg flex items-center justify-center transition-all border-2",
                      task.done ? "bg-[#3b82f6] border-[#3b82f6] text-white" : "bg-white border-gray-200 group-hover:border-[#3b82f6]"
                    )}>
                      {task.done && <CheckSquare className="w-4 h-4 stroke-[3]"/>}
                    </div>
                    <span className={cn("text-[12px] font-bold tracking-tight", task.done ? "text-gray-300 line-through" : "text-[#0F1E3D]")}>{task.t}</span>
                  </div>
                </div>
              )) : (
                <div className="text-center py-16 flex flex-col items-center">
                  <Zap className="w-10 h-10 text-gray-100 mb-4 animate-pulse"/>
                  <p className="text-[11px] font-black text-gray-300 tracking-[0.2em] uppercase">Stabilizing Sprints...</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-slate-50 text-gray-900 border border-slate-200 rounded-[32px] p-8 shadow-sm relative overflow-hidden group flex flex-col justify-between h-[200px] shrink-0">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#3b82f6]/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-1000"/>
            
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-gray-100 shadow-sm">
                  <Clock className="w-5 h-5 text-[#3b82f6] animate-pulse"/>
               </div>
               <div>
                  <h4 className="text-[12px] font-black uppercase tracking-tight text-[#0F1E3D]">Signal Sync</h4>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mt-1">Supabase Edge Engine</p>
               </div>
            </div>
            
            <div className="space-y-3 relative z-10">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-[#0F1E3D]">
                 <span>Integrity Secure</span>
                 <span className="text-[#3b82f6]">88%</span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden shadow-inner border border-gray-200">
                <div className="bg-[#3b82f6] h-full w-[88%] rounded-full shadow-sm transition-all duration-[2000ms]"/>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Project History / Sprint Log */}
      <div className="bg-white border border-gray-100 rounded-[40px] p-10 shadow-sm mx-2">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100">
               <History className="w-6 h-6"/>
            </div>
            <h3 className="text-[13px] font-black text-[#0F1E3D] uppercase tracking-tight">Protocol History</h3>
          </div>
          <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest underline decoration-[#3b82f6]/30 underline-offset-4 pointer-events-none">Audit Trail Active</p>
        </div>
        
        <div className="space-y-5">
          {[1, 2].map((_, i) => (
            <div key={i} className="flex gap-5 group">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full border-2 border-[#3b82f6] bg-white group-hover:bg-[#3b82f6] transition-all duration-300 relative z-10"/>
                <div className="w-0.5 flex-1 bg-gray-100 my-2 group-hover:bg-[#3b82f6]/20 transition-all"/>
              </div>
              <div className="pb-8 flex-1">
                <div className="flex items-center gap-4 mb-2">
                   <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Operational Sprint #{14-i}</p>
                   <span className="w-1.5 h-1.5 rounded-full bg-gray-200"/>
                   <p className="text-[11px] font-black text-[#3b82f6] uppercase tracking-widest">Successful Deployment</p>
                </div>
                <p className="text-[12px] font-bold text-[#0F1E3D] mb-3 leading-tight tracking-tight uppercase">Technical infrastructure optimization & multi-cluster synchronization protocol verified.</p>
                <div className="flex items-center gap-3 mt-4">
                   <div className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center">
                      <Shield className="w-4 h-4 text-gray-300"/>
                   </div>
                   <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Authenticated via TapxHub Brand Brain • 2 hours ago</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </motion.div>
  );
}

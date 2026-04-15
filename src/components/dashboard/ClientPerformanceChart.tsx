import { LineChart, Line, ResponsiveContainer, AreaChart, Area } from "recharts";
import { Target, ShieldCheck, Zap, TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const kpiConfig = [
  {
    id: "velocity",
    title: "Overall Velocity",
    value: "95%",
    delta: "+5.2%",
    isPositive: true,
    icon: Zap,
    color: "#0F1E3D",
    gradient: "velGradient",
    data: [{v:75},{v:80},{v:85},{v:82},{v:90},{v:95}]
  },
  {
    id: "completion",
    title: "Task Completion Rate",
    value: "92%",
    delta: "+2.1%",
    isPositive: true,
    icon: Target,
    color: "#1E3A8A",
    gradient: "compGradient",
    data: [{v:65},{v:78},{v:92},{v:84},{v:100},{v:90}]
  },
  {
    id: "delivery",
    title: "On-Time Delivery",
    value: "98%",
    delta: "-1.5%",
    isPositive: false,
    icon: ShieldCheck,
    color: "#3b82f6",
    gradient: "delGradient",
    data: [{v:90},{v:95},{v:88},{v:96},{v:100},{v:98}]
  }
];

export function ClientPerformanceChart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col h-full bg-[#f8fafc]/50 p-3 sm:p-3"
      style={{
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--glass-border)",
        boxShadow: "0 10px 30px -10px rgba(15,30,61,0.05)",
      }}
    >
      <div className="flex items-center justify-between mb-5 shrink-0 px-1">
        <div>
          <h3 className="text-[12px] font-extrabold text-[var(--brand-primary)] tracking-tight">Project Health View</h3>
          <p className="text-[10px] font-black uppercase tracking-widest text-[#1E3A8A] mt-1">Key Performance Metrics</p>
        </div>
        <button className="px-4 py-2 bg-white text-[10px] font-black uppercase tracking-widest text-[#0F1E3D] rounded-xl border border-[#0F1E3D]/10 hover:bg-[#0F1E3D] hover:text-white transition-all shadow-sm">
          Detailed Log
        </button>
      </div>

      <div className="flex-1 flex flex-col gap-3 min-h-0">
        {kpiConfig.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={kpi.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.1 }}
              className="flex-1 flex items-center justify-between p-3 bg-white border border-[#0F1E3D]/5 rounded-xl hover:border-[#0F1E3D]/15 hover:shadow-md transition-all group cursor-pointer"
            >
              {/* Left Logo + Titles */}
              <div className="flex items-center gap-4 w-1/3 min-w-0">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 shadow-inner"
                  style={{ backgroundColor: `${kpi.color}10`, color: kpi.color }}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 truncate">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[var(--brand-primary)]/40 mb-0.5 truncate">{kpi.title}</p>
                  <p className="text-[12px] sm:text-[13px] font-extrabold text-[var(--brand-primary)] tracking-tight truncate">{kpi.value}</p>
                </div>
              </div>

              {/* Center Sparkline AreaChart */}
              <div className="h-12 w-1/3 hidden md:block px-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={kpi.data}>
                    <defs>
                      <linearGradient id={kpi.gradient} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={kpi.color} stopOpacity={0.2} />
                        <stop offset="95%" stopColor={kpi.color} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area 
                      type="monotone" 
                      dataKey="v" 
                      stroke={kpi.color} 
                      strokeWidth={2.5}
                      fill={`url(#${kpi.gradient})`}
                      isAnimationActive={true}
                      animationDuration={1500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Right Delta */}
              <div className="flex flex-col items-end justify-center w-1/4 sm:w-1/3 min-w-0 pl-2">
                <span className={cn(
                  "flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm",
                  kpi.isPositive ? "bg-blue-50 text-blue-600 border border-blue-100" : "bg-red-50 text-red-600 border border-red-100"
                )}>
                  {kpi.isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {kpi.delta}
                </span>
                <span className="text-[10px] font-bold text-[var(--brand-primary)]/30 mt-1.5 uppercase tracking-widest hidden sm:block">vs Last Month</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

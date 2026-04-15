import { useState, useEffect } from"react";
import { motion, AnimatePresence } from"framer-motion";
import { useAuth } from"@/contexts/AuthContext";

import {
 CheckSquare, FileText, FileSignature, MessageSquare, CheckCircle2, Send, Check, FolderOpen, Activity, Brain, Zap, TrendingUp, Search, Target, X, Loader2
} from"lucide-react";
import {
 BarChart, Bar, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Tooltip
} from"recharts";
import { cn } from"@/lib/utils";
import { 
  useTasks, useAddTask, useInvoices, useNotifications, 
  useConversations, useConversationMessages, useSendConversationMessage, 
  useCompanies, useFiles, useBookings, useProfile, useUpdateTaskStatus,
  useActivityLogs, type ActivityLog 
} from"@/hooks/useAppData";
import { Link, useNavigate } from"react-router-dom";
import { ClientOnboardingWizard } from"@/components/client/ClientOnboardingWizard";
import { format, formatRelative } from "date-fns";
import BookingSection from"@/components/BookingSection";
import { RevenuePulse } from"@/components/dashboard/RevenuePulse";
import { ConversationalAI } from"@/components/widgets/ConversationalAI";
import { ClientReportModal } from"@/components/client/ClientReportModal";
import { toast } from"sonner";
import { SocialApproval } from"@/components/client/SocialApproval";

// Helper hook
function useLocalTime() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const tick = () => setTime(new Intl.DateTimeFormat("en-US", { hour:"2-digit", minute:"2-digit", second:"2-digit", hour12: true }).format(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

const perfData = [
  { name: 'Jan', val1: 4000, val2: 2400 },
  { name: 'Feb', val1: 3000, val2: 1398 },
  { name: 'Mar', val1: 2000, val2: 9800 },
  { name: 'Apr', val1: 2780, val2: 3908 },
  { name: 'May', val1: 1890, val2: 4800 },
  { name: 'Jun', val1: 2390, val2: 3800 },
];

function MiniKpi({ title, value, data, type ="bar", icon: Icon, link }: any) {
  return (
    <Link to={link} className="glass-card flex flex-col p-3 group cursor-pointer hover:-translate-y-1 transition-transform duration-300">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="flex items-center gap-2 text-[10px] text-[#0F1E3D]/50 mb-2 font-bold group-hover:text-[#1E3A8A] transition-colors">
            <Icon className="h-4 w-4"/> {title}
          </h4>
          <span className="text-3xl font-semibold text-[#0F1E3D] leading-none group-hover:text-[#1E3A8A] transition-colors">{value}</span>
        </div>
      </div>
      <div className="flex-1 h-[40px] w-full mt-4 opacity-50 group-hover:opacity-100 transition-opacity">
        <ResponsiveContainer width="100%"height="100%">
          {type ==="bar"? (
            <BarChart data={data}>
              <Bar dataKey="val1"fill="url(#colorBar)"radius={[4, 4, 0, 0]} />
              <defs>
                <linearGradient id="colorBar"x1="0"y1="0"x2="0"y2="1">
                  <stop offset="0%"stopColor="#1E3A8A"stopOpacity={0.8}/>
                  <stop offset="100%"stopColor="#1E3A8A"stopOpacity={0.2}/>
                </linearGradient>
              </defs>
            </BarChart>
          ) : (
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorArea"x1="0"y1="0"x2="0"y2="1">
                  <stop offset="0%"stopColor="#1E3A8A"stopOpacity={0.3}/>
                  <stop offset="100%"stopColor="#1E3A8A"stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area type="monotone"dataKey="val1"stroke="#1E3A8A"fill="url(#colorArea)"strokeWidth={2.5} />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </Link>
  );
}

export default function ClientPortal() {
  const { user } = useAuth();
  const firstName = user?.name?.split(" ")[0] || "Luna";
  const localTime = useLocalTime();
  const today = new Date();
  const [reportOpen, setReportOpen] = useState(false);

  // Real data integration
  const { data: tasksRaw } = useTasks();
  const tasks = tasksRaw ?? [];
  const addTask = useAddTask();
  const navigate = useNavigate();
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isAddingTask, setIsAddingTask] = useState(false);

  const { data: invoicesRaw } = useInvoices();
  const invoices = invoicesRaw ?? [];
  const { data: notificationsRaw } = useNotifications();
  const notifications = notificationsRaw ?? [];
  const { data: companiesRaw = [], isLoading: loadingCompanies } = useCompanies();
  const companies = companiesRaw ?? [];
  const { data: activity = [] } = useActivityLogs(user?.company_id);
  const { data: filesRaw = [] } = useFiles(user?.company_id);
  const { data: bookingsRaw = [] } = useBookings();

  const myCompany = companies.find((c) => c.id === user?.company_id);
  const myBookings = bookingsRaw.filter(b => b.email === user?.email);
  const nextBooking = myBookings.length > 0 ? myBookings[0] : null;

  const activeTasksCount = tasks.filter(t => t.status !== "done").length;
  const completedTasksCount = tasks.filter(t => t.status === "done").length;
  const totalTasksCount = tasks.length;
  
  const completionPct = totalTasksCount > 0 
    ? Math.round((completedTasksCount / totalTasksCount) * 100) 
    : 0;

  const pendingApprovalsCount = invoices.filter(i => i.status === "sent").length;
  const unreadNotificationsCount = notifications.filter(n => !n.is_read).length;

  const recentlyCompleted = tasks
    .filter(t => t.status === "done")
    .slice(0, 3)
    .map(t => t.title);

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

  const timelineSteps = [
    { id: 1, title: "Onboarding", status: myCompany?.onboarding_completed ? "completed" : "current", date: "Initial" },
    { id: 2, title: "Strategy Phase", status: myCompany?.onboarding_completed ? (completionPct > 10 ? "completed" : "current") : "upcoming", date: "Phase 1" },
    { id: 3, title: "Asset Creation", status: completionPct > 50 ? "completed" : (completionPct > 0 ? "current" : "upcoming"), progress: completionPct, date: "Phase 2" },
    { id: 4, title: "Final Review", status: completionPct === 100 ? "completed" : "upcoming", date: "TBD" }
  ];

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !user?.company_id) return;
    setIsAddingTask(true);
    try {
      await addTask.mutateAsync({
        title: newTaskTitle.trim(),
        company_id: user.company_id,
        project_id: "default",
        status: "todo",
        priority: "normal",
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
      toast.success("Task initiated and structured by AI pipeline.");
      setNewTaskTitle("");
      setTaskModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to schedule task");
    } finally {
      setIsAddingTask(false);
    }
  };

  const [showWizard, setShowWizard] = useState(false);
  useEffect(() => {
    if (!loadingCompanies && myCompany && myCompany.onboarding_completed !== true) {
      setShowWizard(true);
    }
  }, [loadingCompanies, myCompany]);

  return (
    <motion.div variants={container} initial="hidden" animate="show"
      className="flex flex-col w-full h-full gap-4 overflow-y-auto no-scrollbar pb-10">
      
      <AnimatePresence>
        {showWizard && myCompany && (
          <ClientOnboardingWizard 
            company={myCompany} 
            onClose={() => setShowWizard(false)} 
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {taskModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-3">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#0F1E3D]/40 backdrop-blur-sm" onClick={() => setTaskModalOpen(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden p-8 border border-[#0F1E3D]/10">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-[12px] font-semibold text-[#0F1E3D]">New Request</h3>
                  <p className="text-[10px] font-bold text-[#0F1E3D]/40 mt-1">Submit Task to Strategy Agent</p>
                </div>
                <button onClick={() => setTaskModalOpen(false)} className="p-2 hover:bg-[#F8FAFC] rounded-lg text-[#0F1E3D]/40 transition-colors"><X className="w-5 h-5"/></button>
              </div>
              <form onSubmit={handleCreateTask} className="flex flex-col gap-4">
                <input autoFocus type="text" placeholder="e.g. Design a new landing page..." className="w-full bg-[#F8FAFC] border border-[#0F1E3D]/10 rounded-xl px-4 py-3 text-[10px] font-bold text-[#0F1E3D] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20" value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} />
                <button disabled={!newTaskTitle.trim() || isAddingTask} type="submit" className="w-full mt-2 py-3 bg-[#0F1E3D] text-white rounded-xl text-[10px] font-semibold hover:bg-[#1E3A8A] transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50">
                  {isAddingTask ? <Loader2 className="w-4 h-4 animate-spin"/> : <Zap className="w-4 h-4"/>}
                  {isAddingTask ? "Processing..." : "Submit to Pipeline"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      <motion.div variants={item} className="w-full flex flex-col gap-4">
        <div className="glass-card p-3 md:p-8 flex flex-col md:flex-row items-center justify-between relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#1E3A8A]/5 to-transparent opacity-50 pointer-events-none"/>
          <div className="relative z-10 flex-1 flex flex-col md:flex-row md:items-center justify-between w-full">
            <div>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-[#0F1E3D] leading-none mb-3">
                Welcome back, {firstName}
              </h2>
              <p className="text-[10px] font-bold text-[#1E3A8A]/60 uppercase tracking-widest">
                {myCompany?.name || "Initializing Workspace..."} Dashboard
              </p>
            </div>
            <div className="flex items-center gap-3 mt-4 md:mt-0">
              <span className="inline-flex items-center gap-2 bg-white/50 backdrop-blur-md border border-[#0F1E3D]/5 rounded-xl px-4 py-2">
                <span className="w-2 h-2 rounded-full bg-[#1E3A8A] opacity-50"/>
                <span className="text-[10px] font-semibold text-[#0F1E3D]/70">
                  {format(today, "MMM do, yyyy")}
                </span>
              </span>
              {localTime && (
                <span className="inline-flex items-center gap-2 bg-[#1E3A8A] text-white rounded-xl px-4 py-2 shadow-lg shadow-[#1E3A8A]/20">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse"/>
                  <span className="text-[10px] font-semibold font-mono">{localTime}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button onClick={() => setTaskModalOpen(true)} className="px-4 py-2.5 bg-[#0F1E3D] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#1E3A8A] transition-all shadow-md active:scale-95 flex items-center gap-2">
            <CheckSquare className="w-3.5 h-3.5"/> + Request Task
          </button>
          
          <button onClick={() => setShowWizard(true)} className="px-4 py-2.5 bg-white border border-[#0F1E3D]/10 text-[#0F1E3D] rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#F8FAFC] transition-all shadow-sm flex items-center gap-2 active:scale-95">
            <FileText className="w-3.5 h-3.5"/> Strategy Audit
          </button>

          <Link to="/my-files" className="px-4 py-2.5 bg-white border border-[#0F1E3D]/10 text-[#0F1E3D] rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#F8FAFC] transition-all shadow-sm flex items-center gap-2 active:scale-95">
            <FolderOpen className="w-3.5 h-3.5"/> Asset Vault
          </Link>
        </div>
      </motion.div>

      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        <motion.div variants={item} className="lg:col-span-3 flex flex-col gap-4">
          <MiniKpi title="Active Tasks" value={activeTasksCount} data={[]} icon={CheckSquare} link="/client-portal"/>
          <MiniKpi title="Vault Assets" value={filesRaw.length} data={[]} icon={FolderOpen} link="/my-files"/>
          <MiniKpi title="Pending Audits" value={pendingApprovalsCount} data={[]} icon={FileSignature} link="/my-invoices"/>
          <MiniKpi title="Unread Updates" value={unreadNotificationsCount} data={[]} icon={MessageSquare} link="/client-messages"/>
        </motion.div>

        <motion.div variants={item} className="lg:col-span-6 flex flex-col gap-4">
          <div className="glass-card flex-1 p-8 flex flex-col items-center justify-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#1E3A8A]/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/4"/>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-[#0F1E3D]/30 absolute top-6 left-6 z-20">Project Velocity</h3>
            
            <div className="w-full h-64 relative flex items-center justify-center z-10">
              <div className="relative w-48 h-48 md:w-56 md:h-56 flex items-center justify-center">
                <svg className="absolute w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="8" fill="none" className="text-[#0F1E3D] opacity-[0.03]"/>
                  <motion.circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="8" fill="none" strokeLinecap="round" className="text-[#1E3A8A]"
                    style={{ strokeDasharray: 264 }}
                    initial={{ strokeDashoffset: 264 }}
                    animate={{ strokeDashoffset: 264 - (264 * completionPct) / 100 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-6xl font-black text-[#0F1E3D] tracking-tighter">{completionPct}%</span>
                  <span className="text-[10px] font-black uppercase text-[#3b82f6] mt-2">Completion</span>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-8 shrink-0">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-[#0F1E3D]/30">Deployment Roadmap</h3>
              <span className="text-[9px] font-black uppercase text-[#1E3A8A] bg-[#1E3A8A]/5 px-3 py-1 rounded-lg border border-[#1E3A8A]/10">Sprint Active</span>
            </div>
            
            <div className="flex items-center justify-between relative mt-8">
              <div className="absolute top-1/2 left-0 w-full h-1 bg-[#0F1E3D]/5 -translate-y-1/2 z-0 rounded-full"/>
              {timelineSteps.map((step) => (
                <div key={step.id} className="relative z-10 flex flex-col items-center group">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black shadow-sm transition-all duration-300",
                    step.status === "completed" ? "bg-[#0F1E3D] text-white" :
                    step.status === "current" ? "bg-white border-4 border-[#1E3A8A] text-[#1E3A8A]" : "bg-[#F8FAFC] border-2 border-[#0F1E3D]/10 text-[#0F1E3D]/30"
                  )}>
                    {step.status === "completed" ? <Check className="h-4 w-4"/> : step.id}
                  </div>
                  <div className="mt-4 text-center">
                    <h4 className={cn("text-[10px] font-black uppercase tracking-widest", step.status === "upcoming" ? "text-gray-300" : "text-[#0F1E3D]")}>{step.title}</h4>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div variants={item} className="lg:col-span-3 flex flex-col gap-4">
          <div className="glass-card flex-1 p-5 flex flex-col">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-[#0F1E3D]/30 mb-5 border-b border-gray-100 pb-3">Strategic Value</h3>
            <div className="flex-1 overflow-y-auto space-y-4">
              {recentlyCompleted.length > 0 ? recentlyCompleted.map((title, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center shrink-0"><Check className="w-3 h-3 text-green-600"/></div>
                  <p className="text-[11px] font-bold text-[#0F1E3D] leading-tight">{title}</p>
                </div>
              )) : (
                <div className="h-full flex flex-col items-center justify-center opacity-30 italic">
                  <Activity className="w-8 h-8 mb-2"/>
                  <span className="text-[10px] font-bold">Waiting for assets...</span>
                </div>
              )}
            </div>
          </div>

          <div className="glass-card flex-1 p-5 flex flex-col overflow-hidden">
             <h3 className="text-[10px] font-black uppercase tracking-widest text-[#0F1E3D]/30 mb-5 border-b border-gray-100 pb-3">Activity Stream</h3>
             <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                {activity.slice(0, 5).map(log => (
                  <div key={log.id} className="flex flex-col gap-1">
                    <p className="text-[11px] font-bold text-[#0F1E3D]">{log.description}</p>
                    <span className="text-[8px] font-black text-gray-300 uppercase">{formatRelative(new Date(log.created_at), new Date())}</span>
                  </div>
                ))}
                {(!activity || activity.length === 0) && (
                   <p className="text-[10px] font-bold text-gray-200 text-center py-10 uppercase italic">Awaiting pulse...</p>
                )}
             </div>
          </div>
        </motion.div>
      </div>

       <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-4">
          <div className="lg:col-span-8">
             <ConversationalAI />
          </div>
          <div className="lg:col-span-4 glass-card p-5">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-[#0F1E3D]/30 mb-5">Next Strategic Move</h3>
              <p className="text-[11px] font-bold text-[#0F1E3D] mb-4">
                {myCompany?.onboarding_completed 
                  ? "Analyze high-intent keywords to scale ad spend and optimize conversation rates."
                  : "Complete your Brand Brain questionnaire to unlock the Growth OS engine."}
              </p>
              <button onClick={() => navigate('/brand-brain')} className="w-full py-3 bg-[#0F1E3D] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#1E3A8A] transition-all">
                 Launch Brand Brain
              </button>
          </div>
       </div>

      <BookingSection clientName={firstName} />

    </motion.div>
  );
}

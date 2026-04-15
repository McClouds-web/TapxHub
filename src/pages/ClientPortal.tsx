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

  // Find company by user's assigned company_id
  const myCompany = companies.find((c) => c.id === user?.company_id);
  const myBookings = bookingsRaw.filter(b => b.email === user?.email);
  const nextBooking = myBookings.length > 0 ? myBookings[0] : null;

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !user?.company_id) return;
    setIsAddingTask(true);
    try {
      await addTask.mutateAsync({
        title: newTaskTitle.trim(),
        company_id: user.company_id,
        project_id:"default",
        status:"todo",
        priority:"normal",
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
      toast.success("Task initiated and structured by AI pipeline.");
      setNewTaskTitle("");
      setTaskModalOpen(false);
    } catch (err: any) {
      toast.error(err.message ||"Failed to schedule task");
    } finally {
      setIsAddingTask(false);
    }
  };

  // If loading is done but no company exists for this client (fresh user), we don't crash,
  // we just show a state where they are waiting for assignment.
  const onboardingNotDone = !loadingCompanies && myCompany && myCompany.onboarding_completed !== true;

  // Modal Wizard state
  const [showWizard, setShowWizard] = useState(false);
  useEffect(() => {
    if (onboardingNotDone) {
      setShowWizard(true);
    }
  }, [onboardingNotDone]);

  const activeTasks = tasks.filter(t => t.status !=="done").length;
  const completedTasks = tasks.filter(t => t.status ==="done").length;
  const totalTasks = tasks.length;
  
  const completionPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 85;

  const pendingApprovals = invoices.filter(i => i.status ==="sent").length;
  const unreadMessages = notifications.filter(n => !n.is_read).length;

  // Interactive states
  const [replyText, setReplyText] = useState("");
  const [msgSent, setMsgSent] = useState(false);

  const { data: conversationsRaw = [] } = useConversations();
  const conversations = (conversationsRaw ?? []).filter(c => c.company_id === user?.company_id);
  // Pick the first conversation that belongs to this client's company
  const myConversation = conversations[0] ?? null;
  const { data: messagesListRaw = [], isLoading: loadingMessages } = useConversationMessages(myConversation?.id ?? null);
  const messagesList = messagesListRaw ?? [];
  const sendMessage = useSendConversationMessage();

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !myConversation) return;

    sendMessage.mutate({
      conversationId: myConversation.id,
      senderId: user?.id ||"client-mock-id",
      senderRole:"client",
      content: replyText.trim(),
    });

    setMsgSent(true);
    setReplyText("");
    setTimeout(() => setMsgSent(false), 3000);
  };

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

 // Dynamic Timeline
 const timelineSteps = [
 { id: 1, title:"Onboarding", status:"completed", date:"Oct 12"},
 { id: 2, title:"Strategy Phase", status:"completed", date:"Oct 24"},
 { id: 3, title:"Asset Creation", status:"current", progress: completionPct, date:"Nov 05"},
 { id: 4, title:"Final Review", status:"upcoming", date:"TBD"}
 ];

 return (
 <motion.div variants={container} initial="hidden"animate="show"
 className="flex flex-col w-full h-full gap-4 overflow-y-auto no-scrollbar pb-10">
 
 {/* Onboarding Wizard Overlay */}
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
 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#0F1E3D]/40 backdrop-blur-sm"onClick={() => setTaskModalOpen(false)} />
 <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden p-8 border border-[#0F1E3D]/10">
 <div className="flex justify-between items-center mb-4">
 <div>
 <h3 className="text-[12px] font-semibold text-[#0F1E3D]">New Request</h3>
 <p className="text-[10px] font-bold text-[#0F1E3D]/40 mt-1">Submit Task to Strategy Agent</p>
 </div>
 <button onClick={() => setTaskModalOpen(false)} className="p-2 hover:bg-[#F8FAFC] rounded-lg text-[#0F1E3D]/40 transition-colors"><X className="w-5 h-5"/></button>
 </div>
 <form onSubmit={handleCreateTask} className="flex flex-col gap-4">
 <input autoFocus type="text"placeholder="e.g. Design a new landing page..."className="w-full bg-[#F8FAFC] border border-[#0F1E3D]/10 rounded-xl px-4 py-3 text-[10px] font-bold text-[#0F1E3D] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20"value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} />
 <button disabled={!newTaskTitle.trim() || isAddingTask} type="submit"className="w-full mt-2 py-3 bg-[#0F1E3D] text-white rounded-xl text-[10px] font-semibold hover:bg-[#1E3A8A] transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50">
 {isAddingTask ? <Loader2 className="w-4 h-4 animate-spin"/> : <Zap className="w-4 h-4"/>}
 {isAddingTask ?"Processing...":"Submit to Pipeline"}
 </button>
 </form>
 </motion.div>
 </div>
 )}
 </AnimatePresence>
 
 {/* 1. Greeting Box */}
 <motion.div variants={item} className="w-full flex flex-col gap-4">
 <div className="glass-card p-3 md:p-8 flex flex-col md:flex-row items-center justify-between relative overflow-hidden group">
 <div className="absolute inset-0 bg-gradient-to-r from-[#1E3A8A]/5 to-transparent opacity-50 pointer-events-none"/>
 <div className="relative z-10 flex-1 flex flex-col md:flex-row md:items-center justify-between w-full">
 <div>
 <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-[#0F1E3D] leading-none mb-3">
 Welcome back, {firstName}
 </h2>
 <p className="text-[10px] font-bold text-[#1E3A8A]/60">
 TapxMedia Client Dashboard
 </p>
 </div>
 <div className="flex items-center gap-3 mt-4 md:mt-0">
 <span className="inline-flex items-center gap-2 bg-white/50 backdrop-blur-md border border-[#0F1E3D]/5 rounded-xl px-4 py-2">
 <span className="w-2 h-2 rounded-full bg-[#1E3A8A] opacity-50"/>
 <span className="text-[10px] font-semibold text-[#0F1E3D]/70">
 {format(today,"MMM do, yyyy")}
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

 {/* Global Action Bar — Fixing 'Dead Buttons' from Audit */}
 <div className="flex flex-wrap items-center gap-4">
 <button 
 onClick={() => setTaskModalOpen(true)}
 className="px-4 py-2.5   rounded-xl text-[10px] font-semibold hover:bg-[#1E3A8A] transition-all shadow-lg shadow-[#0F1E3D]/10 flex items-center gap-2 active:scale-95 bg-slate-50 border border-slate-200 text-gray-900 shadow-sm"
 >
 <CheckSquare className="w-3.5 h-3.5"/> + Add Task
 </button>
 
 <button 
 onClick={() => setShowWizard(true)}
 className="px-4 py-2.5 bg-white border border-[#0F1E3D]/10 text-[#0F1E3D] rounded-xl text-[10px] font-semibold hover:bg-[#F8FAFC] transition-all shadow-sm flex items-center gap-2 active:scale-95"
 >
 <FileText className="w-3.5 h-3.5"/> + New Project
 </button>

 <Link 
 to="/my-files"
 className="px-4 py-2.5 bg-white border border-[#0F1E3D]/10 text-[#0F1E3D] rounded-xl text-[10px] font-semibold hover:bg-[#F8FAFC] transition-all shadow-sm flex items-center gap-2 active:scale-95"
 >
 <FolderOpen className="w-3.5 h-3.5"/> Upload File
 </Link>

 <button 
 onClick={() => navigate('/client-reports')}
 className="px-4 py-2.5 border border-dashed border-[#0F1E3D]/20 text-[#0F1E3D]/50 rounded-xl text-[10px] font-semibold hover:border-[#1E3A8A] hover:text-[#1E3A8A] transition-all flex items-center gap-2 active:scale-95"
 >
 <CheckCircle2 className="w-3.5 h-3.5"/> + Generate Report
 </button>
 </div>
 </motion.div>

 {/* Revenue Pulse / North Star Metric */}
 <motion.div variants={item}>
 <RevenuePulse />
 </motion.div>

 {/* 2. Main Dashboard Grid */}
 <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-5">
 
 {/* Left Column: Vertical KPIs linked to real data */}
 <motion.div variants={item} className="lg:col-span-3 flex flex-col gap-4">
 <div className="relative group">
 <MiniKpi title="Active Tasks"value={activeTasks} data={perfData.slice(0, 4)} type="bar"icon={CheckSquare} link="/client-portal"/>
 <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#0F1E3D] text-white text-[10px] font-semibold p-1.5 rounded-lg shadow-xl cursor-help"title="These are your items currently in the production pipeline.">INF</div>
 </div>
 <div className="relative group">
 <MiniKpi title="Delivered Files"value={filesRaw.length} data={perfData.slice(1, 4)} type="area"icon={FileText} link="/my-files"/>
 <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#0F1E3D] text-white text-[10px] font-semibold p-1.5 rounded-lg shadow-xl cursor-help"title="Total strategic assets, designs, and reports published this month.">INF</div>
 </div>
 <div className="relative group">
 <MiniKpi title="Pending Approvals"value={pendingApprovals} data={perfData.slice(2, 6)} type="bar"icon={FileSignature} link="/my-invoices"/>
 <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#0F1E3D] text-white text-[10px] font-semibold p-1.5 rounded-lg shadow-xl cursor-help"title="Items waiting for your review to proceed to the next phase.">INF</div>
 </div>
 <div className="relative group">
 <MiniKpi title="Unread Messages"value={unreadMessages} data={perfData.slice(0, 4)} type="area"icon={MessageSquare} link="/client-messages"/>
 <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#0F1E3D] text-white text-[10px] font-semibold p-1.5 rounded-lg shadow-xl cursor-help"title="Direct communications from your dedicated growth strategist.">INF</div>
 </div>
 </motion.div>

 {/* Center Panel: Interactive Progress Tracker */}
 <motion.div variants={item} className="lg:col-span-6 flex flex-col gap-4">
 {/* Top Half: Velocity Gauge with Tooltips */}
 <div className="glass-card flex-1 p-8 flex flex-col items-center justify-center relative overflow-hidden group">
 <div className="absolute top-0 right-0 w-96 h-96 bg-[#1E3A8A]/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/4"/>
 <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none translate-y-1/2 -translate-x-1/4"/>
 
 <h3 className="text-[10px] font-semibold text-[#0F1E3D]/50 absolute top-6 left-6 z-20">Real-time Project Completion</h3>
 
 <div className="w-full h-64 relative flex items-center justify-center z-10 mt-4 md:mt-2">
 {/* Custom UI Apple-Watch Style Glowing Ring */}
 <div className="relative w-48 h-48 md:w-56 md:h-56 flex items-center justify-center">
 <svg className="absolute w-full h-full -rotate-90 transform drop-shadow-xl"viewBox="0 0 100 100">
 {/* Background Track */}
 <circle
 cx="50"
 cy="50"
 r="42"
 stroke="currentColor"
 strokeWidth="8"
 fill="none"
 className="text-[#0F1E3D] opacity-[0.03]"
 />
 {/* Animated Progress Ring */}
 <motion.circle
 cx="50"
 cy="50"
 r="42"
 stroke="currentColor"
 strokeWidth="8"
 fill="none"
 strokeLinecap="round"
 className="text-[#1E3A8A]"
 style={{
 strokeDasharray: 264, // 2 * PI * 42 = 263.89
 }}
 initial={{ strokeDashoffset: 264 }}
 animate={{ strokeDashoffset: 264 - (264 * completionPct) / 100 }}
 transition={{ duration: 2, ease:"easeOut", delay: 0.2 }}
 />
 </svg>
 
 {/* Internal Centered Value */}
 <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none group-hover:scale-105 transition-transform duration-500">
 <motion.span 
 initial={{ opacity: 0, scale: 0.8 }}
 animate={{ opacity: 1, scale: 1 }}
 transition={{ delay: 0.5, duration: 0.5 }}
 className="text-5xl md:text-6xl font-semibold text-[#0F1E3D] leading-none tracking-tighter mb-2"
 >
 {completionPct}%
 </motion.span>
 <motion.span 
 initial={{ opacity: 0, y: 5 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.7, duration: 0.5 }}
 className="text-[10px] font-semibold text-[#3b82f6] bg-[#3b82f6]/10 border border-[#3b82f6]/20 px-2 py-1 rounded-md shadow-sm"
 >
 ✓ On Schedule
 </motion.span>
 </div>
 </div>
 </div>
 </div>

 {/* Bottom Half: Interactive Progress Timeline */}
 <div className="glass-card p-8 shrink-0">
 <div className="flex items-center justify-between mb-5">
 <h3 className="text-[10px] font-semibold text-[#0F1E3D]/70">Project Velocity</h3>
 <span className="text-[10px] font-semibold text-[#1E3A8A] bg-[#1E3A8A]/5 px-3 py-1.5 rounded-lg border border-[#1E3A8A]/10">On Track</span>
 </div>
 
 <div className="flex items-center justify-between relative mt-4">
 <div className="absolute top-1/2 left-0 w-full h-1 bg-[#0F1E3D]/5 -translate-y-1/2 z-0 rounded-full"/>
 <div className="absolute top-1/2 left-0 w-[60%] h-1 bg-[#1E3A8A]/20 -translate-y-1/2 z-0 rounded-full"/>
 
 {timelineSteps.map((step) => (
 <div key={step.id} className="relative z-10 flex flex-col items-center group cursor-pointer transition-transform hover:-translate-y-2 duration-300">
 <div className={cn(
"w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-semibold shadow-sm transition-all duration-300",
 step.status ==="completed"?"bg-[#0F1E3D] text-white shadow-lg shadow-[#0F1E3D]/20":
 step.status ==="current"?"bg-white border-4 border-[#1E3A8A] text-transparent scale-110 shadow-xl shadow-[#1E3A8A]/20":
"bg-[#F8FAFC] border-2 border-[#0F1E3D]/10 text-[#0F1E3D]/30"
 )}>
 {step.status ==="completed"&& <Check className="h-4 w-4"/>}
 {step.status ==="current"&& <div className="w-2 h-2 bg-[#1E3A8A] rounded-full animate-pulse"/>}
 </div>
 
 <div className="mt-4 text-center">
 <h4 className={cn("text-[10px] font-semibold whitespace-nowrap", step.status ==="upcoming"?"text-[#0F1E3D]/30":"text-[#0F1E3D] transition-colors")}>
 {step.title}
 </h4>
 </div>
 </div>
 ))}
 </div>
 </div>
 </motion.div>

 {/* Right Column: Deep Dive Activity (Fully Interactive) */}
 <motion.div variants={item} className="lg:col-span-3 flex flex-col gap-4">
 
 {/* Interactive Deliverables */}
 <div className="glass-card flex-1 p-3 flex flex-col">
 <div className="flex items-center justify-between border-b border-[#0F1E3D]/5 pb-4 shrink-0 mb-4">
 <h3 className="text-[10px] font-semibold text-[#0F1E3D]/70">Recent Deliverables</h3>
 <Link to="/my-files"><FolderOpen className="h-4 w-4 text-[#0F1E3D]/40 hover:text-[#1E3A8A] transition-colors"/></Link>
 </div>
 <div className="flex-1 overflow-y-auto pr-2 flex flex-col items-center justify-center p-3">
 <FolderOpen className="w-10 h-10 text-[#0F1E3D] opacity-10 mb-3"/>
 <p className="text-[10px] font-semibold text-[#0F1E3D]">No files yet</p>
 <p className="text-[10px] font-medium text-[#0F1E3D]/40 text-center mt-1">Your agency files will appear here when uploaded.</p>
 </div>
 </div>

 {/* Deep Dive Activity Feed */}
 <div className="glass-card flex-1 p-3 flex flex-col relative overflow-hidden group">
 <div className="flex items-center justify-between border-b border-[#0F1E3D]/5 pb-4 shrink-0 mb-4">
 <h3 className="text-[10px] font-semibold text-[#0F1E3D]/70">Activity & Roadmap</h3>
 <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"/>
 </div>
 <div className="flex-1 overflow-y-auto pr-2 space-y-4">
 {nextBooking && (
   <div className="flex gap-4 group/item">
     <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0 border border-amber-500/20">
       <Activity className="w-4 h-4 text-amber-600"/>
     </div>
     <div>
       <p className="text-[11px] font-semibold text-[#0F1E3D] leading-tight">Upcoming: Strategy Session</p>
       <p className="text-[10px] font-bold text-[#0F1E3D]/30 mt-1">{format(new Date(nextBooking.start_time), "MMM do, h:mm a")}</p>
     </div>
   </div>
 )}
 <div className="flex gap-4 group/item">
 <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20">
 <CheckCircle2 className="w-4 h-4 text-blue-600"/>
 </div>
 <div>
 <p className="text-[11px] font-semibold text-[#0F1E3D] leading-tight">Node Integrity Scan Complete</p>
 <p className="text-[10px] font-bold text-[#0F1E3D]/30 mt-1">2 hours ago</p>
 </div>
 </div>
 <div className="flex gap-4 group/item">
 <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20">
 <FileText className="w-4 h-4 text-blue-600"/>
 </div>
 <div>
 <p className="text-[11px] font-semibold text-[#0F1E3D] leading-tight">Strategic Map Updated</p>
 <p className="text-[10px] font-bold text-[#0F1E3D]/30 mt-1">Yesterday</p>
 </div>
 </div>
 </div>
 <button className="mt-4 w-full py-2.5 bg-[#F8FAFC] border border-[#0F1E3D]/5 rounded-xl text-[10px] font-semibold text-[#0F1E3D]/40 hover:bg-[#0F1E3D] hover:text-white transition-all shrink-0">
 View Full History
 </button>
 </div>

 {/* Interactive Live Chat Widget */}
 <div className="glass-card flex-1 p-3 flex flex-col relative overflow-hidden group">
 <div className="flex items-center justify-between border-b border-[#0F1E3D]/5 pb-4 shrink-0 mb-4">
 <h3 className="text-[10px] font-semibold text-[#0F1E3D]/70">Live Agency Update</h3>
 <Link to="/client-messages"><MessageSquare className="h-4 w-4 text-[#0F1E3D]/40 hover:text-[#1E3A8A] transition-colors"/></Link>
 </div>
 <div className="flex items-start gap-4 flex-1 overflow-y-auto pb-4 pr-2">
 {loadingMessages ? (
 <div className="w-full flex flex-col gap-3">
 <div className="h-10 w-[80%] bg-[#F8FAFC] rounded-xl animate-pulse"/>
 <div className="h-10 w-[60%] bg-[#F8FAFC] rounded-xl animate-pulse self-end"/>
 </div>
 ) : messagesList.length > 0 ? (
 <div className="w-full flex flex-col gap-4">
 {messagesList.slice(-2).map((msg) => (
 <div key={msg.id} className="flex flex-col">
 <span className="text-[10px] font-semibold text-[#0F1E3D]/40 block mb-1">{msg.sender_id === user?.id ?"You":"Agency"}</span>
 <div className={cn("p-3 rounded-xl text-[10px] font-medium max-w-[90%] shadow-sm", msg.sender_id === user?.id ?"bg-[#0F1E3D] text-white self-end rounded-br-none":"bg-white border border-[#0F1E3D]/5 text-[#0F1E3D] self-start rounded-bl-none")}>
 {msg.content}
 </div>
 </div>
 ))}
 </div>
 ) : (
 <div className="w-full flex-1 flex flex-col items-center justify-center p-3">
 <MessageSquare className="w-10 h-10 text-[#0F1E3D] opacity-10 mb-3"/>
 <p className="text-[10px] font-semibold text-[#0F1E3D]">Ready to chat!</p>
 <p className="text-[10px] font-medium text-[#0F1E3D]/40 text-center mt-1">Send a message to start communicating with the agency.</p>
 </div>
 )}
 </div>

 <form onSubmit={handleSendReply} className="mt-auto pt-3 relative z-10 border-t border-[#0F1E3D]/5">
 <AnimatePresence mode="wait">
 {msgSent ? (
 <motion.div key="msg-sent"initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="flex items-center justify-center gap-2 py-2 text-blue-600 bg-blue-500/10 rounded-lg">
 <Check className="h-4 w-4"/>
 <span className="text-[10px] font-semibold">Message Sent</span>
 </motion.div>
 ) : (
 <motion.div key="msg-input"initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex gap-3 items-center relative">
 <input 
 type="text"
 value={replyText}
 onChange={(e) => setReplyText(e.target.value)}
 placeholder="Type your reply..."
 className="w-full bg-white/50 text-[#0F1E3D] text-[10px] font-medium rounded-xl px-4 py-3 border border-[#0F1E3D]/10 focus:outline-none focus:border-[#1E3A8A]/50 focus:bg-white focus:ring-4 focus:ring-[#1E3A8A]/5 transition-all pr-12"
 />
 <button type="submit"disabled={!replyText.trim()} className="absolute right-1.5 w-9 h-9 flex items-center justify-center rounded-lg bg-[#0F1E3D] text-white hover:bg-[#1E3A8A] transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 shadow-md">
 <Send className="h-4 w-4 -ml-0.5"/>
 </button>
 </motion.div>
 )}
 </AnimatePresence>
 </form>
 </div>

 {/* 🤖 Strategy AI Bot Widget */}
 <div className="lg:h-[500px] shrink-0">
 <ConversationalAI />
 </div>
 
 </motion.div>
 </div>

 {/* 3. Strategic Value Feed (New Core Checklist Item) */}
 <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
 <div className="glass-card p-3 border-l-4 border-l-[#1E3A8A]">
 <h4 className="text-[10px] font-semibold text-[#0F1E3D]/40 mb-3">Work Performed (7 Days)</h4>
 <ul className="space-y-3">
 {['Funnel Logic Architecture', 'Pixel/API Tracking Scan', 'A/B Test Variation V1'].map((item, i) => (
 <li key={i} className="flex items-center gap-2 text-[10px] font-bold text-[#0F1E3D]">
 <div className="w-1.5 h-1.5 rounded-full bg-[#3b82f6]"/> {item}
 </li>
 ))}
 </ul>
 </div>
 <div className="glass-card p-3 border-l-4 border-l-blue-500">
 <h4 className="text-[10px] font-semibold text-[#0F1E3D]/40 mb-3">Direct Results</h4>
 <div className="space-y-4">
 <div>
 <p className="text-[12px] font-semibold text-blue-600">+12%</p>
 <p className="text-[10px] font-bold text-[#0F1E3D]/30">CPC Reduction</p>
 </div>
 <div>
 <p className="text-[12px] font-semibold text-blue-600">42</p>
 <p className="text-[10px] font-bold text-[#0F1E3D]/30">New Qualified Leads</p>
 </div>
 </div>
 </div>
 <div className="glass-card p-3 border-l-4 border-l-amber-500 bg-amber-50/20">
 <h4 className="text-[10px] font-semibold text-[#0F1E3D]/40 mb-3">Next Strategic Move</h4>
 <p className="text-[10px] font-semibold text-[#0F1E3D] leading-tight mb-2">Scale Ad Spend by 15%</p>
 <p className="text-[10px] font-medium text-[#0F1E3D]/60 leading-relaxed mb-4">Current ROI 3.4x justifies aggressive scaling on the high-intent keywords identified this week.</p>
 <button onClick={() => toast.info("Notifying Strategy Team of your approval...")} className="w-full py-2 bg-[#0F1E3D] text-white rounded-lg text-[10px] font-semibold hover:bg-amber-600 transition-colors">
 Approve Scaling
 </button>
 </div>
 </motion.div>

 {/* Booking Section embedded natively in the Hub for Clients */}
 <motion.div variants={item} className="mt-5 mb-12 w-full">
 <BookingSection 
 sectionTitle="Schedule a Strategy Call"
 clientName={firstName} 
 calendarContext="Select a date and time to review your Growth OS analytics or discuss new campaigns."
 />
  {/* Real-time Activity Stream */}
  <motion.div variants={item} className="mt-5 w-full">
    <div className="glass-card p-4 md:p-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
          <Zap className="w-5 h-5"/>
        </div>
        <div>
          <h3 className="text-[14px] font-black uppercase tracking-tight text-[#0F1E3D]">Operational Pulse</h3>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Global Activity Streams</p>
        </div>
      </div>
      <div className="space-y-4">
        {activity.slice(0, 5).map(log => (
          <div key={log.id} className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0">
             <div className="flex items-center gap-4">
               <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
               <p className="text-[12px] font-bold text-[#0F1E3D]">{log.description}</p>
             </div>
             <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">{formatRelative(new Date(log.created_at), new Date())}</span>
          </div>
        ))}
        {(!activity || activity.length === 0) && (
           <p className="text-[10px] font-bold text-gray-300 uppercase py-8 text-center italic">Awaiting operational frequency...</p>
        )}
      </div>
    </div>
  </motion.div>
 </motion.div>
  {/* 4. Social & Content Approval Pipeline */}
  <motion.div variants={item} className="mt-5 w-full">
  <div className="glass-card p-4 md:p-8">
  <SocialApproval companyId={user?.company_id ||""} />
  </div>
  </motion.div>

 {/* Client Report Modal */}
 <ClientReportModal 
 isOpen={reportOpen} 
 onClose={() => setReportOpen(false)} 
 companyName={myCompany?.name ||"Client"} 
 />

 </motion.div>
 );
}

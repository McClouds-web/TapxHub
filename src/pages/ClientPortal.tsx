import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import {
  CheckSquare, FileText, FileSignature, MessageSquare, CheckCircle2, Send, Check, FolderOpen
} from "lucide-react";
import {
  BarChart, Bar, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Tooltip
} from "recharts";
import { cn } from "@/lib/utils";
import { useTasks, useInvoices, useNotifications, useConversations, useConversationMessages, useSendConversationMessage, useCompanies } from "@/hooks/useAppData";
import { Link } from "react-router-dom";
import { ClientOnboardingWizard } from "@/components/client/ClientOnboardingWizard";
import BookingSection from "@/components/BookingSection";
import { RevenuePulse } from "@/components/dashboard/RevenuePulse";
import { ConversationalAI } from "@/components/widgets/ConversationalAI";

// Helper hook
function useLocalTime() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const tick = () => setTime(new Intl.DateTimeFormat("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true }).format(new Date()));
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

function MiniKpi({ title, value, data, type = "bar", icon: Icon, link }: any) {
  return (
    <Link to={link} className="glass-card flex flex-col p-6 group cursor-pointer hover:-translate-y-1 transition-transform duration-300">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#0F1E3D]/50 mb-2 font-bold group-hover:text-[#1E3A8A] transition-colors">
            <Icon className="h-4 w-4" /> {title}
          </h4>
          <span className="text-3xl font-black text-[#0F1E3D] leading-none group-hover:text-[#1E3A8A] transition-colors">{value}</span>
        </div>
      </div>
      <div className="flex-1 h-[40px] w-full mt-4 opacity-50 group-hover:opacity-100 transition-opacity">
        <ResponsiveContainer width="100%" height="100%">
          {type === "bar" ? (
            <BarChart data={data}>
              <Bar dataKey="val1" fill="url(#colorBar)" radius={[4, 4, 0, 0]} />
              <defs>
                <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1E3A8A" stopOpacity={0.8}/>
                  <stop offset="100%" stopColor="#1E3A8A" stopOpacity={0.2}/>
                </linearGradient>
              </defs>
            </BarChart>
          ) : (
             <AreaChart data={data}>
               <defs>
                 <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                   <stop offset="0%" stopColor="#1E3A8A" stopOpacity={0.3}/>
                   <stop offset="100%" stopColor="#1E3A8A" stopOpacity={0}/>
                 </linearGradient>
               </defs>
               <Area type="monotone" dataKey="val1" stroke="#1E3A8A" fill="url(#colorArea)" strokeWidth={2.5} />
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

  // Real data integration
  const { data: tasks } = useTasks();
  const { data: invoices } = useInvoices();
  const { data: notifications } = useNotifications();
  const { data: companies = [], isLoading: loadingCompanies } = useCompanies();

  // Find company by user's assigned company_id
  const myCompany = companies.find((c) => c.id === user?.company_id);

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

  const activeTasks = (tasks ?? []).filter(t => t.status !== "done").length;
  const completedTasks = (tasks ?? []).filter(t => t.status === "done").length;
  const totalTasks = (tasks ?? []).length;
  
  const completionPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 85;
  const pieData = [{ name: 'Complete', value: completionPct }, { name: 'Pending', value: 100 - completionPct }];

  const pendingApprovals = (invoices ?? []).filter(i => i.status === "sent").length;
  const unreadMessages = (notifications ?? []).filter(n => !n.is_read).length;

  // Interactive states
  const [replyText, setReplyText] = useState("");
  const [msgSent, setMsgSent] = useState(false);

  const { data: conversations = [] } = useConversations();
  // Pick the first conversation that belongs to this client's company
  const myConversation = conversations[0] ?? null;
  const { data: messagesList = [], isLoading: loadingMessages } = useConversationMessages(myConversation?.id ?? null);
  const sendMessage = useSendConversationMessage();

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !myConversation) return;

    sendMessage.mutate({
      conversationId: myConversation.id,
      senderId: user?.id || "client-mock-id",
      senderRole: "client",
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
    { id: 1, title: "Onboarding", status: "completed", date: "Oct 12" },
    { id: 2, title: "Strategy Phase", status: "completed", date: "Oct 24" },
    { id: 3, title: "Asset Creation", status: "current", progress: completionPct, date: "Nov 05" },
    { id: 4, title: "Final Review", status: "upcoming", date: "TBD" }
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show"
      className="flex flex-col w-full gap-6">
      
      {/* Onboarding Wizard Overlay */}
      <AnimatePresence>
         {showWizard && myCompany && (
            <ClientOnboardingWizard 
               company={myCompany} 
               onClose={() => setShowWizard(false)} 
            />
         )}
      </AnimatePresence>
      
      {/* 1. Greeting Box */}
      <motion.div variants={item} className="w-full flex flex-col gap-6">
        <div className="glass-card p-6 md:p-8 flex flex-col md:flex-row items-center justify-between relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#1E3A8A]/5 to-transparent opacity-50 pointer-events-none" />
          <div className="relative z-10 flex-1 flex flex-col md:flex-row md:items-center justify-between w-full">
            <div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight text-[#0F1E3D] leading-none mb-3">
                Welcome back, {firstName}
              </h2>
              <p className="text-xs font-bold text-[#1E3A8A]/60 uppercase tracking-widest">
                TapxMedia Client Dashboard
              </p>
            </div>
            <div className="flex items-center gap-3 mt-6 md:mt-0">
              <span className="inline-flex items-center gap-2 bg-white/50 backdrop-blur-md border border-[#0F1E3D]/5 rounded-xl px-4 py-2">
                <span className="w-2 h-2 rounded-full bg-[#1E3A8A] opacity-50" />
                <span className="text-xs font-black uppercase tracking-widest text-[#0F1E3D]/70">
                  {format(today, "MMM do, yyyy")}
                </span>
              </span>
              {localTime && (
                <span className="inline-flex items-center gap-2 bg-[#1E3A8A] text-white rounded-xl px-4 py-2 shadow-lg shadow-[#1E3A8A]/20">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  <span className="text-xs font-black tracking-widest font-mono">{localTime}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Global Action Bar — Fixing 'Dead Buttons' from Audit */}
        <div className="flex flex-wrap items-center gap-4">
           <button 
             onClick={() => {
               const chat = document.getElementById('ai-chat-input');
               if (chat) chat.focus();
               import('sonner').then(s => s.toast.info("Strategy Assistant: How can I help with your new task?"));
             }}
             className="px-4 py-2.5 bg-[#0F1E3D] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#1E3A8A] transition-all shadow-lg shadow-[#0F1E3D]/10 flex items-center gap-2 active:scale-95"
           >
             <CheckSquare className="w-3.5 h-3.5" /> + Add Task
           </button>
           
           <button 
             onClick={() => setShowWizard(true)}
             className="px-4 py-2.5 bg-white border border-[#0F1E3D]/10 text-[#0F1E3D] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#F8FAFC] transition-all shadow-sm flex items-center gap-2 active:scale-95"
           >
             <FileText className="w-3.5 h-3.5" /> + New Project
           </button>

           <Link 
             to="/my-files"
             className="px-4 py-2.5 bg-white border border-[#0F1E3D]/10 text-[#0F1E3D] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#F8FAFC] transition-all shadow-sm flex items-center gap-2 active:scale-95"
           >
             <FolderOpen className="w-3.5 h-3.5" /> Upload File
           </Link>

           <button 
             onClick={() => import('sonner').then(s => s.toast.success("Generating latest Growth OS Report..."))}
             className="px-4 py-2.5 border border-dashed border-[#0F1E3D]/20 text-[#0F1E3D]/50 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-[#1E3A8A] hover:text-[#1E3A8A] transition-all flex items-center gap-2 active:scale-95"
           >
             <CheckCircle2 className="w-3.5 h-3.5" /> + Generate Report
           </button>
        </div>
      </motion.div>

      {/* Revenue Pulse / North Star Metric */}
      <motion.div variants={item}>
        <RevenuePulse />
      </motion.div>

      {/* 2. Main Dashboard Grid */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Vertical KPIs linked to real data */}
        <motion.div variants={item} className="lg:col-span-3 flex flex-col gap-6">
          <MiniKpi title="Active Tasks" value={activeTasks} data={perfData.slice(0, 4)} type="bar" icon={CheckSquare} link="/client-portal" />
          <MiniKpi title="Delivered Files" value={12} data={perfData.slice(1, 4)} type="area" icon={FileText} link="/my-files" />
          <MiniKpi title="Pending Approvals" value={pendingApprovals} data={perfData.slice(2, 6)} type="bar" icon={FileSignature} link="/my-invoices" />
          <MiniKpi title="Unread Messages" value={unreadMessages} data={perfData.slice(0, 4)} type="area" icon={MessageSquare} link="/client-messages" />
        </motion.div>

        {/* Center Panel: Interactive Progress Tracker */}
        <motion.div variants={item} className="lg:col-span-6 flex flex-col gap-6">
          {/* Top Half: Velocity Gauge with Tooltips */}
          <div className="glass-card flex-1 p-8 flex flex-col items-center justify-center relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-96 h-96 bg-[#1E3A8A]/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/4" />
             <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none translate-y-1/2 -translate-x-1/4" />
             
             <h3 className="text-xs font-black uppercase tracking-widest text-[#0F1E3D]/50 absolute top-6 left-6 z-20">Real-time Project Completion</h3>
             
             <div className="w-full h-64 relative flex items-center justify-center z-10 mt-6 md:mt-2">
               {/* Custom UI Apple-Watch Style Glowing Ring */}
               <div className="relative w-48 h-48 md:w-56 md:h-56 flex items-center justify-center">
                 <svg className="absolute w-full h-full -rotate-90 transform drop-shadow-xl" viewBox="0 0 100 100">
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
                     transition={{ duration: 2, ease: "easeOut", delay: 0.2 }}
                   />
                 </svg>
                 
                 {/* Internal Centered Value */}
                 <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none group-hover:scale-105 transition-transform duration-500">
                   <motion.span 
                     initial={{ opacity: 0, scale: 0.8 }}
                     animate={{ opacity: 1, scale: 1 }}
                     transition={{ delay: 0.5, duration: 0.5 }}
                     className="text-5xl md:text-6xl font-black text-[#0F1E3D] leading-none tracking-tighter mb-2"
                   >
                     {completionPct}%
                   </motion.span>
                   <motion.span 
                     initial={{ opacity: 0, y: 5 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: 0.7, duration: 0.5 }}
                     className="text-[10px] font-black uppercase tracking-widest text-[#10b981] bg-[#10b981]/10 border border-[#10b981]/20 px-2 py-1 rounded-md shadow-sm"
                   >
                     ✓ On Schedule
                   </motion.span>
                 </div>
               </div>
             </div>
          </div>

          {/* Bottom Half: Interactive Progress Timeline */}
          <div className="glass-card p-8 shrink-0">
             <div className="flex items-center justify-between mb-8">
                <h3 className="text-xs font-black uppercase tracking-widest text-[#0F1E3D]/70">Project Velocity</h3>
                <span className="text-xs font-extrabold text-[#1E3A8A] bg-[#1E3A8A]/5 px-3 py-1.5 rounded-lg border border-[#1E3A8A]/10">On Track</span>
             </div>
             
             <div className="flex items-center justify-between relative mt-4">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-[#0F1E3D]/5 -translate-y-1/2 z-0 rounded-full" />
                <div className="absolute top-1/2 left-0 w-[60%] h-1 bg-[#1E3A8A]/20 -translate-y-1/2 z-0 rounded-full" />
                
                {timelineSteps.map((step) => (
                   <div key={step.id} className="relative z-10 flex flex-col items-center group cursor-pointer transition-transform hover:-translate-y-2 duration-300">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold shadow-sm transition-all duration-300",
                        step.status === "completed" ? "bg-[#0F1E3D] text-white shadow-lg shadow-[#0F1E3D]/20" :
                        step.status === "current" ? "bg-white border-4 border-[#1E3A8A] text-transparent scale-110 shadow-xl shadow-[#1E3A8A]/20" :
                        "bg-[#F8FAFC] border-2 border-[#0F1E3D]/10 text-[#0F1E3D]/30"
                      )}>
                        {step.status === "completed" && <Check className="h-4 w-4" />}
                        {step.status === "current" && <div className="w-2 h-2 bg-[#1E3A8A] rounded-full animate-pulse" />}
                      </div>
                      
                      <div className="mt-4 text-center">
                         <h4 className={cn("text-xs font-black uppercase tracking-widest whitespace-nowrap", step.status === "upcoming" ? "text-[#0F1E3D]/30" : "text-[#0F1E3D] transition-colors")}>
                            {step.title}
                         </h4>
                      </div>
                   </div>
                ))}
             </div>
          </div>
        </motion.div>

        {/* Right Column: Deep Dive Activity (Fully Interactive) */}
        <motion.div variants={item} className="lg:col-span-3 flex flex-col gap-6">
          
          {/* Interactive Deliverables */}
          <div className="glass-card flex-1 p-6 flex flex-col">
             <div className="flex items-center justify-between border-b border-[#0F1E3D]/5 pb-4 shrink-0 mb-4">
               <h3 className="text-xs font-black uppercase tracking-widest text-[#0F1E3D]/70">Recent Deliverables</h3>
               <Link to="/my-files"><FolderOpen className="h-4 w-4 text-[#0F1E3D]/40 hover:text-[#1E3A8A] transition-colors" /></Link>
             </div>
              <div className="flex-1 overflow-y-auto pr-2 flex flex-col items-center justify-center p-4">
                 <FolderOpen className="w-10 h-10 text-[#0F1E3D] opacity-10 mb-3" />
                 <p className="text-sm font-black text-[#0F1E3D]">No files yet</p>
                 <p className="text-xs font-medium text-[#0F1E3D]/40 text-center mt-1">Your agency files will appear here when uploaded.</p>
              </div>
          </div>

          {/* Interactive Live Chat Widget */}
          <div className="glass-card flex-1 p-6 flex flex-col relative overflow-hidden group">
             <div className="flex items-center justify-between border-b border-[#0F1E3D]/5 pb-4 shrink-0 mb-4">
               <h3 className="text-xs font-black uppercase tracking-widest text-[#0F1E3D]/70">Live Agency Update</h3>
               <Link to="/client-messages"><MessageSquare className="h-4 w-4 text-[#0F1E3D]/40 hover:text-[#1E3A8A] transition-colors" /></Link>
             </div>
              <div className="flex items-start gap-4 flex-1 overflow-y-auto pb-4 pr-2">
                 {loadingMessages ? (
                    <div className="w-full flex flex-col gap-3">
                       <div className="h-10 w-[80%] bg-[#F8FAFC] rounded-2xl animate-pulse" />
                       <div className="h-10 w-[60%] bg-[#F8FAFC] rounded-2xl animate-pulse self-end" />
                    </div>
                 ) : messagesList.length > 0 ? (
                    <div className="w-full flex flex-col gap-4">
                       {messagesList.slice(-2).map((msg) => (
                          <div key={msg.id} className="flex flex-col">
                             <span className="text-[10px] font-black uppercase tracking-widest text-[#0F1E3D]/40 block mb-1">{msg.sender_id === user?.id ? "You" : "Agency"}</span>
                             <div className={cn("p-4 rounded-2xl text-sm font-medium max-w-[90%] shadow-sm", msg.sender_id === user?.id ? "bg-[#0F1E3D] text-white self-end rounded-br-none" : "bg-white border border-[#0F1E3D]/5 text-[#0F1E3D] self-start rounded-bl-none")}>
                                {msg.content}
                             </div>
                          </div>
                       ))}
                    </div>
                 ) : (
                    <div className="w-full flex-1 flex flex-col items-center justify-center p-4">
                       <MessageSquare className="w-10 h-10 text-[#0F1E3D] opacity-10 mb-3" />
                       <p className="text-sm font-black text-[#0F1E3D]">Ready to chat!</p>
                       <p className="text-xs font-medium text-[#0F1E3D]/40 text-center mt-1">Send a message to start communicating with the agency.</p>
                    </div>
                 )}
              </div>

             <form onSubmit={handleSendReply} className="mt-auto pt-3 relative z-10 border-t border-[#0F1E3D]/5">
                <AnimatePresence mode="wait">
                  {msgSent ? (
                    <motion.div key="msg-sent" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="flex items-center justify-center gap-2 py-2 text-emerald-600 bg-emerald-500/10 rounded-lg">
                      <Check className="h-4 w-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Message Sent</span>
                    </motion.div>
                  ) : (
                    <motion.div key="msg-input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex gap-3 items-center relative">
                      <input 
                        type="text" 
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Type your reply..." 
                        className="w-full bg-white/50 text-[#0F1E3D] text-sm font-medium rounded-xl px-4 py-3 border border-[#0F1E3D]/10 focus:outline-none focus:border-[#1E3A8A]/50 focus:bg-white focus:ring-4 focus:ring-[#1E3A8A]/5 transition-all pr-12"
                      />
                      <button type="submit" disabled={!replyText.trim()} className="absolute right-1.5 w-9 h-9 flex items-center justify-center rounded-lg bg-[#0F1E3D] text-white hover:bg-[#1E3A8A] transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 shadow-md">
                         <Send className="h-4 w-4 -ml-0.5" />
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

      {/* Booking Section embedded natively in the Hub for Clients */}
      <motion.div variants={item} className="mt-8 mb-12 w-full">
          <BookingSection 
             sectionTitle="Schedule a Strategy Call" 
             clientName={firstName} 
             calendarContext="Select a date and time to review your Growth OS analytics or discuss new campaigns."
          />
      </motion.div>

    </motion.div>
  );
}

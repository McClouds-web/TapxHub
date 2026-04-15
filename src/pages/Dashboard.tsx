import React, { useState, useMemo } from "react";
import { useProfile, useCompanies, useTasks, useBookings, useUpdateTaskStatus, useInvoices, useFiles, useActivityLogs, useConvertLead } from "@/hooks/useAppData";
import { useLeads } from "@/hooks/useLeads";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp, Users, DollarSign, Target, Plus, MoreVertical, Paperclip, FileText, Calendar as CalendarIcon, Loader2, Zap
} from "lucide-react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { formatRelative, format } from "date-fns";
import { cn } from "@/lib/utils";

const TABS = ["Overview", "Capabilities", "Activity", "Sectors"];

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: profile, isLoading: pLoading } = useProfile();
  const { data: companies = [], isLoading: cLoading } = useCompanies();
  const { data: tasks = [], isLoading: tLoading } = useTasks();
  const { data: leads = [] } = useLeads();
  const { data: bookings = [] } = useBookings();
  const { data: invoices = [] } = useInvoices();
  const { data: files = [] } = useFiles();
  const { data: activity = [] } = useActivityLogs();
  const updateTaskStatus = useUpdateTaskStatus();
  const convertLead = useConvertLead();

  const [activeTab, setActiveTab] = useState("Overview");
  const [calendarView, setCalendarView] = useState("Month");
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  // Efficiency Distribution
  const velocityData = useMemo(() => {
    return [
      { name: 'Todo', value: tasks.filter(t => t.status === 'todo').length },
      { name: 'Doing', value: tasks.filter(t => t.status === 'doing').length },
      { name: 'Done', value: tasks.filter(t => t.status === 'done').length },
      { name: 'Total', value: tasks.length },
    ];
  }, [tasks]);

  if (pLoading || cLoading || tLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#3b82f6]" />
      </div>
    );
  }

  const isAdmin = profile?.role === "admin";

  // --- ADMIN AGGREGATES ---
  const totalRevenue = companies.reduce((acc, c) => acc + (c.monthly_amount || 0), 0);
  const wonLeads = leads.filter(l => l.status === 'Won').length;
  const totalLeads = leads.length || 1;
  const successRate = Math.round((wonLeads / totalLeads) * 100) || 0;

  const pipeline = [
    { title: "To Do", status: "todo", color: "#6366f1" },
    { title: "Doing", status: "doing", color: "#f59e0b" },
    { title: "Done", status: "done", color: "#3b82f6" },
  ];

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedItem(id);
    e.dataTransfer.setData("taskId", id);
  };

  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    if (taskId) {
      updateTaskStatus.mutate({ id: taskId, status });
    }
    setDraggedItem(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="flex h-full w-full bg-transparent overflow-hidden">
      
      {/* Main Core Area */}
      <div className="flex-1 flex flex-col min-w-0 pr-4 pl-4 md:pl-8 py-6 overflow-y-auto no-scrollbar shadow-[inset_0_20px_20px_-20px_rgba(0,0,0,0.02)]">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 shrink-0 mb-8 mt-2">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-[#0F1E3D] -ml-0.5">
              {isAdmin ? "Core System" : "Client Portal"}
            </h1>
            <p className="text-[13px] text-[#0F1E3D]/40 font-medium mt-1">
              {isAdmin ? "High-level overview of global operations." : `Welcome back, ${profile?.full_name || 'Client'}. Here is your project overview.`}
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white/50 p-1.5 rounded-full border border-white shadow-sm">
            {TABS.map(t => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={cn(
                  "px-4 py-2 rounded-full text-[12px] font-bold tracking-wide transition-all z-10",
                  activeTab === t ? "bg-white shadow-sm text-[#0F1E3D]" : "text-[#0F1E3D]/40 hover:text-[#0F1E3D]"
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {activeTab === "Overview" ? (
          <>
            {/* HEROS: Split based on role */}
            {isAdmin ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 shrink-0">
                <div className="group relative bg-white rounded-[24px] overflow-hidden shadow-[0_20px_40px_-10px_rgba(15,30,61,0.06),_0_10px_20px_-5px_rgba(15,30,61,0.04)] border border-white">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-8">
                      <div className="w-10 h-10 rounded-full bg-[#f8fafc] flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-[#3b82f6]" />
                      </div>
                      <div className="px-3 py-1 bg-blue-50 text-blue-600 font-bold text-[11px] rounded-full flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> {companies.length > 0 ? "LIVE" : "SYNCING"}
                      </div>
                    </div>
                    <p className="text-[12px] font-bold uppercase tracking-widest text-[#0F1E3D]/30 mb-1">Total Revenue</p>
                    <h2 className="text-4xl font-black text-[#0F1E3D] tracking-tighter">${totalRevenue.toLocaleString()}</h2>
                  </div>
                  <div className="h-16 w-full -mb-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={velocityData} margin={{ top: 0, left: 0, right: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="group relative bg-white rounded-[24px] p-6 shadow-[0_20px_40px_-10px_rgba(15,30,61,0.06),_0_10px_20px_-5px_rgba(15,30,61,0.04)] border border-white">
                  <div className="flex items-start justify-between mb-8">
                    <div className="w-10 h-10 rounded-full bg-[#f8fafc] flex items-center justify-center">
                      <Target className="w-5 h-5 text-indigo-500" />
                    </div>
                  </div>
                  <p className="text-[12px] font-bold uppercase tracking-widest text-[#0F1E3D]/30 mb-1">Win Rate</p>
                  <div className="flex items-baseline gap-3">
                    <h2 className="text-4xl font-black text-[#0F1E3D] tracking-tighter">{successRate}%</h2>
                    <span className="text-[12px] font-bold text-[#0F1E3D]/40">{wonLeads} won</span>
                  </div>
                  <div className="mt-8 h-2 w-full bg-[#f8fafc] rounded-full overflow-hidden flex">
                     <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${successRate}%`}} />
                  </div>
                </div>

                <div className="group relative bg-white rounded-[24px] p-6 shadow-[0_20px_40px_-10px_rgba(15,30,61,0.06),_0_10px_20px_-5px_rgba(15,30,61,0.04)] border border-white overflow-hidden">
                   <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 blur-[40px] rounded-full pointer-events-none" />
                   <div className="relative z-10 flex items-start justify-between mb-8">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="px-3 py-1 bg-blue-50 text-blue-600 font-bold text-[11px] rounded-full">
                       Active
                    </div>
                  </div>
                  <p className="relative z-10 text-[12px] font-bold uppercase tracking-widest text-[#0F1E3D]/30 mb-1">Client Roster</p>
                  <div className="relative z-10 flex items-baseline gap-3">
                    <h2 className="text-4xl font-black text-[#0F1E3D] tracking-tighter">{companies.length}</h2>
                    <span className="text-[12px] font-bold text-[#0F1E3D]/40">Accounts</span>
                  </div>
                  <button 
                    onClick={() => navigate('/clients')}
                    className="relative z-10 mt-8 w-full py-3 bg-[#f8fafc] text-[#0F1E3D] border border-[#0F1E3D]/5 rounded-[14px] text-[13px] font-bold tracking-wide hover:bg-blue-500 hover:text-white hover:border-transparent transition-all"
                  >
                    Manage Accounts
                  </button>
                </div>
              </div>
            ) : (
              // CLIENT VIEW HERO WIDGETS
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 shrink-0">
                 {/* Open Tasks Widget */}
                 <div className="bg-white rounded-[24px] p-6 shadow-sm border border-white">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mb-6">
                      <Users className="w-5 h-5 text-blue-500" />
                    </div>
                    <p className="text-[12px] font-bold uppercase tracking-widest text-[#0F1E3D]/30 mb-1">Active Tasks</p>
                    <div className="flex items-baseline justify-between">
                       <h2 className="text-4xl font-black text-[#0F1E3D] tracking-tighter">{tasks.filter(t => t.status !== 'done').length}</h2>
                       <button onClick={() => navigate('/workspace')} className="text-[11px] font-bold text-blue-500 hover:text-blue-600">View Pipeline</button>
                    </div>
                 </div>

                 {/* Files / Vault Widget */}
                 <div className="bg-white rounded-[24px] p-6 shadow-sm border border-white">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center mb-6">
                      <Paperclip className="w-5 h-5 text-indigo-500" />
                    </div>
                    <p className="text-[12px] font-bold uppercase tracking-widest text-[#0F1E3D]/30 mb-1">Vault Files</p>
                    <div className="flex items-baseline justify-between">
                       <h2 className="text-4xl font-black text-[#0F1E3D] tracking-tighter">{files.length}</h2>
                       <button onClick={() => navigate('/vault')} className="text-[11px] font-bold text-indigo-500 hover:text-indigo-600">View Vault</button>
                    </div>
                 </div>

                 {/* Invoices Widget */}
                 <div className="bg-white rounded-[24px] p-6 shadow-sm border border-white">
                    <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center mb-6">
                      <FileText className="w-5 h-5 text-rose-500" />
                    </div>
                    <p className="text-[12px] font-bold uppercase tracking-widest text-[#0F1E3D]/30 mb-1">Pending Invoices</p>
                    <div className="flex items-baseline justify-between">
                       <h2 className="text-4xl font-black text-[#0F1E3D] tracking-tighter">{invoices.filter(i => i.status === 'sent').length}</h2>
                       <button onClick={() => navigate('/invoices')} className="text-[11px] font-bold text-rose-500 hover:text-rose-600">Pay Now</button>
                    </div>
                 </div>

                 {/* Bookings Widget */}
                 <div className="bg-white rounded-[24px] p-6 shadow-sm border border-white">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center mb-6">
                      <CalendarIcon className="w-5 h-5 text-emerald-500" />
                    </div>
                    <p className="text-[12px] font-bold uppercase tracking-widest text-[#0F1E3D]/30 mb-1">Bookings</p>
                    <div className="flex items-baseline justify-between">
                       <h2 className="text-4xl font-black text-[#0F1E3D] tracking-tighter">{bookings.length}</h2>
                       <button onClick={() => navigate('/bookings')} className="text-[11px] font-bold text-emerald-500 hover:text-emerald-600">Schedule</button>
                    </div>
                 </div>
              </div>
            )}

            {/* Floating Kanban Section */}
            <div className="flex-1 min-h-0 flex flex-col">
              <div className="flex items-center justify-between mb-6 shrink-0">
                 <h3 className="text-xl font-black text-[#0F1E3D] tracking-tight">{isAdmin ? "Active Operations" : "Your Active Tasks"}</h3>
                 <button 
                   onClick={() => navigate('/workspace')}
                   className="flex items-center gap-2 text-[12px] font-bold text-[#0F1E3D]/50 hover:text-[#0F1E3D] transition-colors bg-white hover:bg-[#F8FAFC] border border-[#0F1E3D]/5 px-3 py-1.5 rounded-full shadow-sm"
                 >
                    View All Board
                 </button>
              </div>

              {/* The Pipeline (Columnless approach) */}
              <div className="flex-1 overflow-x-auto overflow-y-hidden no-scrollbar pb-6 relative min-h-[300px]">
                <div className="absolute inset-0 flex gap-6">
                   {pipeline.map((col) => {
                     const colTasks = tasks.filter(t => t.status === col.status);
                     return (
                       <div 
                         key={col.title} 
                         className={cn(
                           "w-[320px] shrink-0 flex flex-col h-full rounded-2xl transition-colors",
                           draggedItem && isAdmin && "bg-[#F4F5F7]/30"
                         )}
                         onDrop={(e) => isAdmin ? handleDrop(e, col.status) : undefined}
                         onDragOver={handleDragOver}
                       >
                         {/* Column Header */}
                         <div className="flex items-center justify-between mb-4 px-1">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: col.color }} />
                              <h4 className="text-[13px] font-bold text-[#0F1E3D]">{col.title}</h4>
                              <span className="text-[10px] font-bold text-[#0F1E3D]/40 bg-white shadow-sm border border-[#0F1E3D]/5 px-2 py-0.5 rounded-full">{colTasks.length}</span>
                            </div>
                            {isAdmin && <button onClick={() => navigate('/workspace')} className="text-[#0F1E3D]/30 hover:text-[#0F1E3D] transition-colors"><Plus className="w-4 h-4" /></button>}
                         </div>
                         {/* Tasks List */}
                         <div className="flex flex-col gap-3 overflow-y-auto no-scrollbar pb-4 pr-1">
                            {colTasks.length === 0 && (
                              <div className="border-2 border-dashed border-[#0F1E3D]/5 rounded-2xl h-24 flex items-center justify-center">
                                <span className="text-[11px] font-bold text-[#0F1E3D]/20">Empty</span>
                              </div>
                            )}
                            {colTasks.map(t => (
                              <motion.div 
                                draggable={isAdmin}
                                onDragStart={(e: any) => handleDragStart(e, t.id)}
                                onClick={() => navigate('/workspace')}
                                layout
                                key={t.id}
                                className={cn(
                                  "bg-white p-5 rounded-[20px] shadow-[0_10px_30px_-10px_rgba(15,30,61,0.08)] border border-white group transition-all relative overflow-hidden",
                                  isAdmin ? "cursor-grab active:cursor-grabbing hover:border-[#0F1E3D]/5" : "cursor-pointer"
                                )}
                              >
                                <div className="flex items-start justify-between mb-3">
                                  <span className="text-[10px] font-bold bg-[#F4F5F7] text-[#0F1E3D]/60 px-2.5 py-1 rounded-full uppercase tracking-wider">
                                    {t.company_name || 'Internal'}
                                  </span>
                                  <button className="text-[#0F1E3D]/20 group-hover:text-[#0F1E3D]/60 transition-colors">
                                    <MoreVertical className="w-4 h-4" />
                                  </button>
                                </div>
                                <h5 className="text-[14px] font-bold text-[#0F1E3D] leading-snug mb-4">{t.title}</h5>
                                <div className="flex items-center justify-between mt-auto">
                                  <div className="w-16 h-1.5 rounded-full bg-[#F4F5F7] overflow-hidden">
                                    <div className="h-full rounded-full" style={{ width: t.status === 'done' ? '100%' : '45%', backgroundColor: col.color }} />
                                  </div>
                                  <div className="flex items-center -space-x-1">
                                    <div className="w-6 h-6 rounded-full border-2 border-white bg-indigo-100 flex items-center justify-center z-20">
                                      <span className="text-[8px] font-bold text-indigo-700">TX</span>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                         </div>
                       </div>
                     );
                   })}
                </div>
              </div>
            </div>
          </>
        ) : activeTab === "Activity" ? (
          <div className="flex-1 flex flex-col gap-4">
            {activity.map(log => (
              <div key={log.id} className="bg-white p-6 rounded-[24px] border border-gray-100 flex items-center justify-between group hover:shadow-lg transition-all">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <Zap className="w-5 h-5"/>
                   </div>
                   <div>
                      <p className="text-[13px] font-bold text-[#0F1E3D]">{log.description}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{formatRelative(new Date(log.created_at), new Date())}</p>
                   </div>
                </div>
                <div className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-widest">
                   {log.event_type.replace('_', ' ')}
                </div>
              </div>
            ))}
          </div>
        ) : activeTab === "Sectors" && isAdmin ? (
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
             {leads.filter(l => l.pipeline_stage !== 'won').map(lead => (
               <div key={lead.id} className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex flex-col justify-between group">
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-[#0F1E3D] group-hover:bg-[#0F1E3D] group-hover:text-white transition-all">
                         <Target className="w-6 h-6"/>
                      </div>
                      <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-3 py-1 rounded-full uppercase tracking-widest">{lead.pipeline_stage}</span>
                    </div>
                    <h4 className="text-[18px] font-black tracking-tight">{lead.business_name}</h4>
                    <p className="text-[12px] font-medium text-gray-400 mt-1">{lead.industry || 'Global Sector'}</p>
                  </div>
                  <button 
                    onClick={() => {
                      if(confirm(`Convert ${lead.business_name} to Client Node?`)) {
                        convertLead.mutate({ leadId: lead.id, adminId: profile!.id });
                      }
                    }}
                    className="mt-8 w-full py-4 bg-[#0F1E3D] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-[#0F1E3D]/10"
                  >
                     {convertLead.isPending ? 'Syncing OS...' : 'Activate Client Node'}
                  </button>
               </div>
             ))}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-[#0F1E3D]/40">
            <h3 className="text-xl font-black mb-2">{activeTab} Mode</h3>
            <p className="text-sm">This module is currently processing live sync queries.</p>
          </div>
        )}
      </div>

      {/* Right Sidebar - System Stream & Activities */}
      <div className="w-[340px] shrink-0 border-l border-[#0F1E3D]/5 bg-white/40 flex flex-col h-full rounded-tr-[32px] overflow-hidden backdrop-blur-sm relative z-10 hidden xl:flex">
        
        {/* Calendar / Quick State */}
        <div className="p-6 shrink-0 border-b border-[#0F1E3D]/5 bg-white shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[14px] font-black tracking-tight text-[#0F1E3D]">Schedule</h3>
            <div className="flex gap-1 justify-center bg-[#F4F5F7] rounded-full p-1">
               <button 
                 onClick={() => setCalendarView("Month")}
                 className={cn("px-3 py-1 rounded-full text-[11px] font-bold transition-all shadow-sm", calendarView === "Month" ? "bg-white text-[#0F1E3D]" : "bg-transparent text-[#0F1E3D]/40 shadow-none")}
               >Month</button>
               <button 
                 onClick={() => setCalendarView("Week")}
                 className={cn("px-3 py-1 rounded-full text-[11px] font-bold transition-all shadow-sm", calendarView === "Week" ? "bg-white text-[#0F1E3D]" : "bg-transparent text-[#0F1E3D]/40 shadow-none")}
               >Week</button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
              <div key={i} className="text-[10px] font-bold text-[#0F1E3D]/30">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {[...Array(35)].map((_, i) => {
              const d = i - 2;
              if (d < 1 || d > 31) return <div key={i} className="" />;
              const today = new Date().getDate();
              const isToday = d === today;
              
              // Check if there's a booking on this day
              const hasBooking = bookings.some(b => {
                const bDate = new Date(b.start_time);
                return bDate.getDate() === d && bDate.getMonth() === new Date().getMonth();
              });

              return (
                 <div key={i} className={cn(
                  "h-8 flex flex-col items-center justify-center rounded-xl text-[12px] font-bold transition-all cursor-default",
                  isToday ? "bg-[#3b82f6] text-white shadow-[0_4px_12px_rgba(59,130,246,0.3)]" : "text-[#0F1E3D]/60 hover:bg-[#F4F5F7]"
                )}>
                  {d}
                  {hasBooking && !isToday && <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-[1px]" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Global Activity Feed (Admin vs Client Scoped) */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-6">
          <h3 className="text-[14px] font-black tracking-tight text-[#0F1E3D] mb-6">Comm Relay</h3>
          <div className="space-y-4">
            {activity.slice(0, 8).map(log => (
              <div key={log.id} className="bg-white p-4 rounded-[20px] shadow-sm border border-[#0F1E3D]/5 hover:border-indigo-100 transition-all">
                <div className="flex gap-3 relative">
                  <div className="w-7 h-7 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                    <Zap className="w-3.5 h-3.5 text-indigo-500"/>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-[#0F1E3D] leading-snug">
                       {log.description}
                    </p>
                    <p className="text-[9px] font-black text-[#0F1E3D]/20 uppercase tracking-widest mt-1">
                       {format(new Date(log.created_at), 'h:mm a')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
      </div>
    </div>
  );
}

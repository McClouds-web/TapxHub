import { useState } from "react";
import { format, isSameDay } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Search, CheckCircle2, Circle, Clock, Tag, 
  Calendar as CalendarIcon, X, Video, ExternalLink, 
  User, Check, Loader2, Sparkles, Trash2, CalendarCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  useTasks, useAddTask, useUpdateTaskStatus, useDeleteTask,
  useMeetings, useAddMeeting, useUpdateMeeting, useDeleteMeeting,
  useCompanies
} from "@/hooks/useAppData";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

export default function Planner() {
  const { data: allTasks = [], isLoading: tasksLoading } = useTasks();
  const { data: allMeetings = [], isLoading: meetingsLoading } = useMeetings();
  const { data: companies = [] } = useCompanies();
  
  const addTask = useAddTask();
  const updateStatus = useUpdateTaskStatus();
  const deleteTask = useDeleteTask();
  const addMeeting = useAddMeeting();
  const updateMeeting = useUpdateMeeting();
  const deleteMeeting = useDeleteMeeting();

  const [isAdding, setIsAdding] = useState(false);
  const [addMode, setAddMode] = useState<'task' | 'meeting'>('task');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    title: "",
    tag: "",
    company_id: "",
    startTime: "10:00",
    endTime: "11:00",
    link: "",
  });

  const filteredTasks = allTasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || (t.company_name || "").toLowerCase().includes(search.toLowerCase());
    const matchesDate = selectedDate && t.due_date ? isSameDay(new Date(t.due_date), selectedDate) : true;
    return matchesSearch && matchesDate;
  });

  const dailyMeetings = allMeetings.filter(m => 
    selectedDate && isSameDay(new Date(m.start_time), selectedDate)
  );

  const todoTasks = filteredTasks.filter(t => t.status === "todo");
  const inProgressTasks = filteredTasks.filter(t => t.status === "in_progress");
  const doneTasks = filteredTasks.filter(t => t.status === "done");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !selectedDate) return;

    try {
      if (addMode === 'task') {
        const due_date = `${format(selectedDate, "yyyy-MM-dd")}T23:59:00`;
        await addTask.mutateAsync({ 
          title: form.title.trim(), 
          company_name: form.tag.trim() || undefined,
          status: "todo", 
          priority: "medium", 
          due_date 
        });
        toast.success("Task added to workspace");
      } else {
        const start = `${format(selectedDate, "yyyy-MM-dd")}T${form.startTime}:00`;
        const end = `${format(selectedDate, "yyyy-MM-dd")}T${form.endTime}:00`;
        await addMeeting.mutateAsync({
          title: form.title.trim(),
          company_id: form.company_id || undefined,
          start_time: start,
          end_time: end,
          meeting_link: form.link || undefined,
          status: 'scheduled',
          is_personal: !form.company_id
        });
        toast.success("Meeting scheduled on calendar");
      }

      setForm({ title: "", tag: "", company_id: "", startTime: "10:00", endTime: "11:00", link: "" });
      setIsAdding(false);
    } catch (err) {
      toast.error("Failed to save item");
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (confirm("Delete this task?")) {
      await deleteTask.mutateAsync(id);
      toast.info("Task removed");
    }
  };

  const handleDeleteMeeting = async (id: string) => {
    if (confirm("Cancel this meeting?")) {
      await deleteMeeting.mutateAsync(id);
      toast.info("Meeting cancelled");
    }
  };

  const toggleMeetingStatus = async (meeting: any) => {
    const newStatus = meeting.status === 'completed' ? 'scheduled' : 'completed';
    await updateMeeting.mutateAsync({ id: meeting.id, status: newStatus });
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col h-full gap-4 overflow-hidden">
      
      {/* Header */}
      <motion.div variants={item} className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--brand-primary)]">Agency Command Center</h1>
          <p className="text-[10px] font-bold text-[var(--brand-primary)]/50 uppercase tracking-widest mt-1.5 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" /> Unified Strategy & Execution
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0F1E3D]/30 group-focus-within:text-[#1E3A8A] transition-colors" />
            <input 
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search everything..." 
              className="w-full sm:w-64 pl-9 pr-4 py-2.5 bg-white border border-[#0F1E3D]/10 rounded-xl text-[10px] font-bold text-[#0F1E3D] placeholder:text-[#0F1E3D]/30 focus:outline-none focus:border-[#1E3A8A] shadow-sm transition-all"
            />
          </div>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="px-5 py-3   text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-[#1E3A8A] transition shadow-md flex items-center gap-2 whitespace-nowrap active:scale-95 bg-slate-50 border border-slate-200 text-gray-900 shadow-sm"
          >
            {isAdding ? <><X className="w-3.5 h-3.5" /> Close</> : <><Plus className="w-3.5 h-3.5" /> Plan Day</>}
          </button>
        </div>
      </motion.div>

      <div className="flex-1 flex flex-col xl:flex-row gap-4 min-h-0">
        
        {/* Sidebar: Calendar + Agenda */}
        <motion.div variants={item} className="xl:w-[320px] flex flex-col shrink-0 gap-4 min-h-0">
           <div className="bg-white rounded-xl p-3 shadow-sm border border-[#0F1E3D]/5 flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-4">
                 <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--brand-primary)] flex items-center gap-2">
                   <CalendarIcon className="w-4 h-4 text-[#1E3A8A]" /> Calendar
                 </h3>
                 {selectedDate && (
                    <button onClick={() => setSelectedDate(undefined)} className="text-[10px] font-black uppercase text-[#1E3A8A]/50 hover:text-[#1E3A8A] transition">Show All</button>
                 )}
              </div>
              
              <Calendar
                 mode="single"
                 selected={selectedDate}
                 onSelect={setSelectedDate}
                 className="w-full bg-[#F8FAFC]/50 rounded-xl p-2 border border-[#0F1E3D]/5 shadow-inner"
                 classNames={{
                    day_selected: "bg-[var(--brand-primary)] text-white hover:bg-[#1E3A8A] rounded-xl shadow-md font-black ring-2 ring-white",
                    day_today: "bg-[#1E3A8A]/10 text-[#1E3A8A] font-black rounded-xl",
                 }}
              />
              
              <div className="mt-5 flex-1 overflow-y-auto min-h-0 pb-4 no-scrollbar">
                 <h4 className="text-[10px] font-bold text-[#0F1E3D]/40 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Video className="w-3.5 h-3.5" /> Agenda
                 </h4>
                 
                 {dailyMeetings.length === 0 ? (
                    <div className="p-3 bg-[#F8FAFC] rounded-xl border border-dashed border-[#0F1E3D]/10 text-center">
                       <CalendarCheck className="w-5 h-5 text-[#0F1E3D]/10 mx-auto mb-2" />
                       <p className="text-[10px] font-bold text-[#0F1E3D]/30 uppercase tracking-widest">Free Day</p>
                    </div>
                 ) : (
                    <div className="space-y-3">
                       {dailyMeetings.map(m => (
                          <div key={m.id} className={cn(
                            "group p-3.5 bg-[#F8FAFC]/80 border rounded-xl transition-all hover:shadow-sm relative",
                            m.status === 'completed' ? "border-blue-500/20 opacity-60" : "border-[#0F1E3D]/5 hover:border-[#1E3A8A]/20"
                          )}>
                             <div className="flex items-center justify-between mb-1.5">
                                <span className={cn("text-[10px] font-black uppercase tracking-widest", m.status === 'completed' ? "text-blue-600" : "text-[#1E3A8A]")}>
                                  {m.startTime} — {m.endTime}
                                </span>
                                <div className="flex items-center gap-1">
                                   <button 
                                     onClick={() => toggleMeetingStatus(m)}
                                     className={cn("p-1.5 rounded-lg transition-colors", m.status === 'completed' ? "bg-blue-500 text-white" : "bg-white text-[#0F1E3D]/10 hover:text-blue-500")}
                                   >
                                      <Check className="w-2.5 h-2.5" />
                                   </button>
                                   <button onClick={() => handleDeleteMeeting(m.id)} className="p-1.5 rounded-lg bg-white text-[#0F1E3D]/10 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100">
                                      <Trash2 className="w-2.5 h-2.5" />
                                   </button>
                                </div>
                             </div>
                             <p className={cn("text-[10px] font-bold text-[#0F1E3D] leading-tight mb-2", m.status === 'completed' && "line-through")}>{m.title}</p>
                             {m.company_id && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-white border border-[#0F1E3D]/5 rounded-md text-[#0F1E3D]/40">
                                   <User className="w-2 h-2" /> {companies.find(c => c.id === m.company_id)?.name || 'Client'}
                                </span>
                             )}
                          </div>
                       ))}
                    </div>
                 )}
              </div>
           </div>
        </motion.div>

        {/* Global Kanban Board */}
        <div className="flex-1 flex flex-col min-h-0 gap-4">
          
          {/* Unified Entry Form */}
          <AnimatePresence>
            {isAdding && (
              <motion.form 
                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                onSubmit={handleSave}
                className="bg-white p-7 rounded-[2.5rem] border border-[#0F1E3D]/10 shadow-2xl shrink-0 overflow-hidden relative z-10"
              >
                <div className="flex items-center justify-between mb-4">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#0F1E3D] flex items-center justify-center text-white shadow-md">
                         {addMode === 'task' ? <Plus className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                      </div>
                      <div>
                         <h4 className="text-[12px] font-extrabold text-[var(--brand-primary)] m-0">Create Strategy Item</h4>
                         <p className="text-[10px] uppercase font-bold tracking-widest text-[#1E3A8A]/50 mt-1">Timeline: {selectedDate ? format(selectedDate, "MMMM do, yyyy") : "Global"}</p>
                      </div>
                   </div>
                   <div className="flex bg-[#F8FAFC] p-1 rounded-xl border border-[#0F1E3D]/5">
                      <button type="button" onClick={() => setAddMode('task')} className={cn("px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all", addMode === 'task' ? "bg-white text-[#1E3A8A] shadow-sm" : "text-[#0F1E3D]/30")}>Task</button>
                      <button type="button" onClick={() => setAddMode('meeting')} className={cn("px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all", addMode === 'meeting' ? "bg-white text-[#1E3A8A] shadow-sm" : "text-[#0F1E3D]/30")}>Meeting</button>
                   </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                   <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-black tracking-widest text-[#0F1E3D]/40 ml-2">Name / Objective</label>
                      <input 
                        autoFocus
                        value={form.title}
                        onChange={e => setForm({ ...form, title: e.target.value })}
                        placeholder={addMode === 'task' ? "e.g. Optimize Landing Page" : "e.g. Monthly Results Call"}
                        className="w-full bg-[#F8FAFC] border border-[#0F1E3D]/10 rounded-xl px-4 py-3.5 text-[10px] font-bold text-[#0F1E3D] focus:outline-none focus:border-[#1E3A8A] focus:bg-white transition-all shadow-inner"
                      />
                   </div>

                   {addMode === 'task' ? (
                      <div className="space-y-1.5">
                         <label className="text-[10px] uppercase font-black tracking-widest text-[#0F1E3D]/40 ml-2">Client Reference</label>
                         <input 
                           value={form.tag}
                           onChange={e => setForm({ ...form, tag: e.target.value })}
                           placeholder="e.g. TapxMedia / Internal"
                           className="w-full bg-[#F8FAFC] border border-[#0F1E3D]/10 rounded-xl px-4 py-3.5 text-[10px] font-bold text-[#0F1E3D] focus:outline-none focus:border-[#1E3A8A] focus:bg-white transition-all shadow-inner"
                         />
                      </div>
                   ) : (
                      <>
                         <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-black tracking-widest text-[#0F1E3D]/40 ml-2">Link to Company</label>
                            <select 
                              value={form.company_id}
                              onChange={e => setForm({ ...form, company_id: e.target.value })}
                              className="w-full bg-[#F8FAFC] border border-[#0F1E3D]/10 rounded-xl px-4 py-3.5 text-[10px] font-bold text-[#0F1E3D] focus:outline-none focus:border-[#1E3A8A] focus:bg-white transition-all shadow-inner"
                            >
                               <option value="">No Company (Personal)</option>
                               {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                         </div>
                         <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-black tracking-widest text-[#0F1E3D]/40 ml-2">Duration Slot</label>
                            <div className="flex items-center gap-2">
                               <input type="time" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} className="flex-1 bg-[#F8FAFC] border border-[#0F1E3D]/10 rounded-xl px-3 py-3 text-[10px] font-bold" />
                               <span className="text-[#0F1E3D]/20">—</span>
                               <input type="time" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} className="flex-1 bg-[#F8FAFC] border border-[#0F1E3D]/10 rounded-xl px-3 py-3 text-[10px] font-bold" />
                            </div>
                         </div>
                      </>
                   )}
                </div>

                <div className="flex justify-between items-center pt-6 mt-4 border-t border-[#0F1E3D]/5">
                   {addMode === 'meeting' ? (
                      <div className="flex-1 max-w-sm">
                         <div className="relative">
                            <ExternalLink className="absolute left-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#1E3A8A]/30" />
                            <input 
                              value={form.link}
                              onChange={e => setForm({ ...form, link: e.target.value })}
                              placeholder="Add meeting link..."
                              className="w-full pl-6 bg-transparent text-[11px] font-bold text-[#1E3A8A] placeholder:text-[#1E3A8A]/30 focus:outline-none"
                            />
                         </div>
                      </div>
                   ) : <div />}
                   <button 
                     type="submit" 
                     disabled={!form.title.trim() || (addMode === 'task' ? addTask.isPending : addMeeting.isPending)}
                     className="px-6 py-3.5   text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-[#1E3A8A] transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center gap-2 bg-slate-50 border border-slate-200 text-gray-900 shadow-sm"
                   >
                     {addTask.isPending || addMeeting.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4" /> Finalize Operation</>}
                   </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Kanban Flow */}
          <motion.div variants={item} className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 min-h-0">
            
            <KanbanColumn title="Backlog" icon={<Circle className="w-4 h-4 opacity-50" />} tasks={todoTasks} count={todoTasks.length} color="blue" onMove={updateStatus.mutate} onDelete={handleDeleteTask} nextStatus="in_progress" />
            <KanbanColumn title="Execution" icon={<Clock className="w-4 h-4" />} tasks={inProgressTasks} count={inProgressTasks.length} color="purple" active onMove={updateStatus.mutate} onDelete={handleDeleteTask} prevStatus="todo" nextStatus="done" />
            <KanbanColumn title="Delivered" icon={<CheckCircle2 className="w-4 h-4" />} tasks={doneTasks} count={doneTasks.length} color="emerald" onMove={updateStatus.mutate} onDelete={handleDeleteTask} prevStatus="in_progress" />

          </motion.div>
        </div>

      </div>
    </motion.div>
  );
}

// ── Components ─────────────────────────────────────────────────────────────

function KanbanColumn({ title, icon, tasks, count, color, active, onMove, onDelete, prevStatus, nextStatus }: any) {
  return (
    <div className={cn(
       "flex flex-col bg-[#F8FAFC] border rounded-[2.5rem] overflow-hidden min-h-0 transition-all",
       active ? "border-[#1E3A8A]/10 shadow-xl shadow-[#0F1E3D]/5 bg-white scale-[1.02] z-10" : "border-[#0F1E3D]/5 shadow-sm"
    )}>
       <div className={cn("p-3 border-b border-[#0F1E3D]/5 flex items-center justify-between shrink-0", active ? "bg-[#1E3A8A]/[0.02]" : "bg-transparent")}>
         <h3 className={cn("text-[10px] font-black uppercase tracking-widest flex items-center gap-2", active ? "text-[#1E3A8A]" : "text-[var(--brand-primary)]/40")}>
           {icon} {title}
         </h3>
         <span className={cn("text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full border shadow-sm", active ? "bg-[#1E3A8A] text-white border-[#1E3A8A]" : "bg-white text-[#0F1E3D]/40 border-[#0F1E3D]/10")}>{count}</span>
       </div>
       <div className="flex-1 overflow-y-auto p-3 space-y-4 no-scrollbar">
          {tasks.map((task: any) => (
             <TaskCard key={task.id} task={task} onMove={onMove} onDelete={onDelete} prevStatus={prevStatus} nextStatus={nextStatus} />
          ))}
          {tasks.length === 0 && (
            <div className="py-12 flex flex-col items-center justify-center opacity-10">
               <Sparkles className="w-8 h-8 mb-2" />
               <p className="text-[10px] font-black uppercase tracking-widest">Empty Workspace</p>
            </div>
          )}
       </div>
    </div>
  );
}

function TaskCard({ task, onMove, onDelete, prevStatus, nextStatus }: any) {
  const isDone = task.status === "done";
  const dateStr = task.due_date ? format(new Date(task.due_date), "MMM d") : "No date";
  
  return (
    <motion.div 
      layout
      whileHover={{ scale: 1.01 }}
      className={cn(
        "bg-white p-3 rounded-xl border shadow-sm group transition-all duration-300 relative overflow-hidden",
        isDone ? "border-blue-500/10 opacity-70 bg-blue-50/20" : "border-[#0F1E3D]/5 hover:border-[#1E3A8A]/30 hover:shadow-lg"
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
         <p className={cn("text-[10px] font-extrabold text-[#0F1E3D] leading-tight", isDone && "line-through opacity-50")}>{task.title}</p>
         <button onClick={() => onDelete(task.id)} className="p-1.5 rounded-lg text-[#0F1E3D]/10 hover:text-rose-500 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all shrink-0">
            <Trash2 className="w-3.5 h-3.5" />
         </button>
      </div>
      
      <div className="flex items-center justify-between">
         <div className="flex items-center gap-2">
            {task.company_name && (
               <span className="px-2 py-0.5 rounded-lg border border-[#0F1E3D]/10 bg-[#F8FAFC] text-[10px] font-black uppercase tracking-widest text-[#1E3A8A]">
                  {task.company_name}
               </span>
            )}
            <span className="text-[10px] font-bold text-[#0F1E3D]/30 uppercase tracking-widest">{dateStr}</span>
         </div>
         <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100">
            {prevStatus && (
               <button onClick={() => onMove({ id: task.id, status: prevStatus })} className="p-2 rounded-xl bg-[#F8FAFC] text-[#0F1E3D]/40 hover:text-[#1E3A8A] border border-transparent hover:border-[#1E3A8A]/20 transition-all">←</button>
            )}
            {nextStatus && (
               <button onClick={() => onMove({ id: task.id, status: nextStatus })} className="p-2 rounded-xl bg-[#0F1E3D] text-white hover:bg-[#1E3A8A] shadow-md transition-all">Done →</button>
            )}
         </div>
      </div>
    </motion.div>
  );
}

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Plus, Circle, Clock, AlertCircle, Calendar as CalendarIcon, Tag, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, isBefore, isToday, isAfter, startOfDay } from "date-fns";
import { useTasks, useAddTask, useUpdateTaskStatus } from "@/hooks/useAppData";

export function TodaysFocus() {
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskTag, setNewTaskTag] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const { data: allTasks = [], isLoading } = useTasks();
  const addTask = useAddTask();
  const updateStatus = useUpdateTaskStatus();

  // Filter out Done tasks from the main view to keep it clean, but keep them accessible if needed
  const activeTasks = allTasks.filter((t) => t.status !== "done");
  const doneTasks = allTasks.filter((t) => t.status === "done");

  const todayStart = startOfDay(new Date());

  // Grouping tasks
  const overdue = activeTasks.filter(t => t.due_date && isBefore(new Date(t.due_date), todayStart));
  const today = activeTasks.filter(t => t.due_date && isToday(new Date(t.due_date)));
  const upcoming = activeTasks.filter(t => t.due_date && isAfter(new Date(t.due_date), todayStart) && !isToday(new Date(t.due_date)));
  const noDate = activeTasks.filter(t => !t.due_date);

  const progress = allTasks.length === 0 ? 0 : Math.round((doneTasks.length / allTasks.length) * 100);

  const handleAdd = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newTaskTitle.trim()) return;
    
    // Default to today if adding from the quick interface
    const due_date = `${format(new Date(), "yyyy-MM-dd")}T23:59:00`;
    
    addTask.mutate({ 
      title: newTaskTitle.trim(), 
      company_name: newTaskTag.trim() || undefined,
      status: "todo", 
      priority: "medium", 
      due_date 
    });
    
    setNewTaskTitle("");
    setNewTaskTag("");
    setIsAdding(false);
  };

  const toggleDone = (id: string, current: string) => {
    updateStatus.mutate({ id, status: current === "done" ? "todo" : "done" });
  };

  const renderTaskGroup = (title: string, tasks: any[], icon: any, colorClass: string, bgClass: string) => {
    if (tasks.length === 0) return null;
    const Icon = icon;
    
    return (
      <div className="mb-6 last:mb-0">
        <h4 className={cn("text-xs font-black uppercase tracking-widest flex items-center gap-2 mb-3", colorClass)}>
          <Icon className="w-4 h-4" /> {title} ({tasks.length})
        </h4>
        <div className="space-y-2">
          <AnimatePresence>
            {tasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={cn(
                  "flex items-center justify-between p-3.5 rounded-xl border transition-all group",
                  bgClass,
                  "hover:shadow-md hover:-translate-y-0.5"
                )}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <button 
                    onClick={() => toggleDone(task.id, task.status)}
                    className={cn(
                      "flex-shrink-0 transition-colors",
                      colorClass
                    )}
                  >
                    {task.status === "in_progress" ? (
                      <Clock className="h-5 w-5 opacity-50" />
                    ) : (
                       <Circle className="h-5 w-5 opacity-40 hover:opacity-100" />
                    )}
                  </button>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[var(--brand-primary)] truncate group-hover:text-[#1E3A8A] transition-colors">
                      {task.title}
                    </p>
                    {task.company_name && (
                      <p className="text-[9px] font-black uppercase tracking-widest text-[#1E3A8A]/50 mt-0.5 flex items-center gap-1">
                        <Tag className="w-3 h-3" /> {task.company_name}
                      </p>
                    )}
                  </div>
                </div>
                {task.due_date && title !== "Today" && (
                  <span className={cn(
                    "flex items-center gap-1 ml-3 shrink-0 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md bg-white border border-white/50 shadow-sm",
                    colorClass
                  )}>
                    {format(new Date(task.due_date), "MMM d")}
                  </span>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      style={{
        background: "var(--glass-bg)",
        backdropFilter: "var(--glass-blur)",
        border: "1px solid var(--glass-border)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--glass-shadow)",
      }}
      className="flex flex-col h-full bg-white relative overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 border-b border-[#0F1E3D]/5 flex items-center justify-between shrink-0 bg-[#F8FAFC]/50">
        <div>
          <h3 className="text-lg font-extrabold text-[var(--brand-primary)]">Active Agenda</h3>
          <p className="text-[10px] font-black uppercase tracking-widest text-[#1E3A8A] mt-1 opacity-60">
            All Pending Tasks
          </p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest bg-[#0F1E3D] text-white hover:bg-[#1E3A8A] transition-all shadow-md flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Add Task
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        
        {/* Add Task Modal overlay */}
        <AnimatePresence>
          {isAdding && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md p-4"
              onClick={(e) => e.target === e.currentTarget && setIsAdding(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 12 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 12 }}
                className="bg-white rounded-[var(--radius-lg)] shadow-2xl p-8 w-full max-w-md border border-[#0F1E3D]/5 relative"
              >
                <button onClick={() => setIsAdding(false)} className="absolute top-4 right-4 p-2 rounded-xl hover:bg-[#F8FAFC] transition-colors text-[var(--brand-primary)]/20 hover:text-[var(--brand-primary)]">
                  <X className="h-4 w-4" />
                </button>
                
                <h2 className="text-xl font-extrabold text-[var(--brand-primary)] mb-1">Schedule New Task</h2>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#1E3A8A] opacity-30 mb-8">Personalize your agenda</p>

                <form onSubmit={handleAdd} className="space-y-4">
                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-[var(--brand-primary)]/50 mb-1.5 block">What needs focus?</label>
                    <input autoFocus value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} placeholder="Enter task title..." className="w-full bg-[#F8FAFC] border border-[#0F1E3D]/10 rounded-xl px-4 py-3 text-sm font-bold text-[var(--brand-primary)] focus:outline-none focus:border-[var(--brand-accent)] transition-colors" />
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-[var(--brand-primary)]/50 mb-1.5 block">Client Tag (Optional)</label>
                    <div className="relative">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--brand-primary)] opacity-30 pointer-events-none" />
                      <input value={newTaskTag} onChange={(e) => setNewTaskTag(e.target.value)} placeholder="Project identifier..." className="w-full bg-[#F8FAFC] border border-[#0F1E3D]/10 rounded-xl pl-9 pr-4 py-3 text-sm font-bold text-[var(--brand-primary)] focus:outline-none focus:border-[var(--brand-accent)] transition-colors" />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button type="button" onClick={() => setIsAdding(false)} className="flex-1 px-4 py-3.5 text-xs font-black uppercase tracking-widest border border-[#0F1E3D]/10 rounded-xl hover:bg-[#F8FAFC] transition-colors">Cancel</button>
                    <button type="submit" disabled={!newTaskTitle.trim()} className="flex-1 px-4 py-3.5 text-xs font-black uppercase tracking-widest bg-[var(--brand-primary)] text-white rounded-xl shadow-lg hover:bg-[#1E3A8A] transition-all disabled:opacity-30">Save Task</button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Task list */}
        <div className="flex-1 overflow-y-auto pr-2 -mr-2">
          {isLoading ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-14 rounded-xl bg-[#F8FAFC] animate-pulse border border-[#0F1E3D]/5" />
              ))}
            </div>
          ) : activeTasks.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center pb-8 pt-4">
              <div className="w-20 h-20 rounded-3xl flex items-center justify-center bg-[#F1F5F9] border border-[#0F1E3D]/5 mb-5 shadow-inner">
                <CheckCircle2 className="h-10 w-10 text-emerald-500 opacity-80" />
              </div>
              <h4 className="text-base font-extrabold text-[var(--brand-primary)] mb-1.5">No active tasks</h4>
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--brand-primary)] opacity-40 max-w-[200px]">
                You are all caught up! Enjoy your free time.
              </p>
            </div>
          ) : (
            <div className="pb-4">
              {renderTaskGroup("Overdue", overdue, AlertCircle, "text-rose-600", "bg-rose-50/50 border-rose-100")}
              {renderTaskGroup("Today", today, Clock, "text-[#1E3A8A]", "bg-[#F8FAFC] border-[#1E3A8A]/10")}
              {renderTaskGroup("Upcoming", upcoming, CalendarIcon, "text-[#0F1E3D]/60", "bg-white border-[#0F1E3D]/5")}
              {renderTaskGroup("No Date Assigned", noDate, Circle, "text-[#0F1E3D]/40", "bg-[#F8FAFC]/50 border-[#0F1E3D]/5 border-dashed")}
            </div>
          )}
        </div>
      </div>

      {/* Progress footer */}
      <div className="p-6 pt-0 mt-auto shrink-0 border-t border-[#0F1E3D]/5 bg-[#F8FAFC]/80">
        <div className="flex items-center justify-between mb-3 mt-4">
          <span className="text-[10px] uppercase font-black tracking-widest text-[var(--brand-primary)]/40">Overall Progress</span>
          <span className="text-[10px] uppercase font-black tracking-wider text-[var(--brand-primary)]">{doneTasks.length} of {allTasks.length} completed</span>
        </div>
        <div className="h-2 w-full bg-[#E2E8F0] rounded-full overflow-hidden shadow-inner">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="h-full bg-[var(--brand-primary)] rounded-full"
          />
        </div>
      </div>
    </motion.div>
  );
}

import React, { useState } from "react";
import { 
  Plus, MoreVertical, LayoutGrid, List, Search,
  Filter, Calendar, ChevronRight, Activity, Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTasks, useUpdateTaskStatus, Task } from "@/hooks/useAppData";
import { TaskFormModal } from "@/components/widgets/TaskFormModal";

export default function Workspace() {
  const { data: allTasks = [], isLoading } = useTasks();
  const updateTaskStatus = useUpdateTaskStatus();
  
  const [view, setView] = useState<"board" | "list">("board");
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [modalDefaultStatus, setModalDefaultStatus] = useState("todo");
  
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const tasks = allTasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === "All" || 
      t.company_name?.toLowerCase().includes(activeFilter.toLowerCase()) ||
      t.assigned_user?.toLowerCase().includes(activeFilter.toLowerCase());
    return matchesSearch && matchesFilter;
  });

  // Kanban Pipeline Definition
  const PIPELINE = [
    { id: "todo", title: "To Do", color: "#6366f1" },
    { id: "doing", title: "In Progress", color: "#f59e0b" },
    { id: "review", title: "In Review", color: "#3b82f6" },
    { id: "done", title: "Completed", color: "#3b82f6" }
  ];

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#0F1E3D]/10 border-t-[#3b82f6] animate-spin" />
      </div>
    );
  }

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedItem(id);
    e.dataTransfer.setData("text/plain", id);
    e.currentTarget.classList.add("opacity-50");
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove("opacity-50");
    setDraggedItem(null);
  };

  return (
    <div className="flex flex-col h-full w-full bg-transparent overflow-hidden">
      
      {/* Workspace Header */}
      <div className="shrink-0 px-4 md:px-8 py-6 pb-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-[#0F1E3D] -ml-0.5">Project Tasks</h1>
            <p className="text-[13px] text-[#0F1E3D]/40 font-medium">Manage and execute active workflows.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-white/60 backdrop-blur-md p-1 rounded-[14px] border border-white shadow-sm">
              <button 
                onClick={() => setView("board")}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-xl text-[12px] font-bold transition-all duration-200",
                  view === "board" ? "bg-white text-[#0F1E3D] shadow-sm" : "text-[#0F1E3D]/40 hover:text-[#0F1E3D]"
                )}
              >
                <LayoutGrid className="w-3.5 h-3.5" /> Board
              </button>
              <button 
                onClick={() => setView("list")}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-xl text-[12px] font-bold transition-all duration-200",
                  view === "list" ? "bg-white text-[#0F1E3D] shadow-sm" : "text-[#0F1E3D]/40 hover:text-[#0F1E3D]"
                )}
              >
                <List className="w-3.5 h-3.5" /> List
              </button>
            </div>
            
            <button className="flex items-center gap-2 h-9 px-4 bg-white hover:bg-[#F8FAFC] text-[#0F1E3D]/60 hover:text-[#0F1E3D] rounded-[14px] border border-white shadow-sm transition-all text-[12px] font-bold">
              <Filter className="w-3.5 h-3.5" /> Filter
            </button>
            
            <button 
              onClick={() => { setEditingTask(null); setModalDefaultStatus("todo"); setIsModalOpen(true); }}
              className="flex items-center gap-2 h-9 px-4 bg-[#0F1E3D] hover:bg-[#1a365d] text-white rounded-[14px] shadow-md transition-all text-[12px] font-bold tracking-wide"
            >
              <Plus className="w-4 h-4" /> New Task
            </button>
          </div>
        </div>

        {/* Global Search / Quick Filter Bar */}
        <div className="mt-6 flex items-center gap-4">
           <div className="flex-1 max-w-sm relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0F1E3D]/30" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search tasks..." 
                className="w-full bg-white pl-9 pr-4 py-2.5 rounded-[16px] text-[13px] font-medium text-[#0F1E3D] border border-white focus:border-[#0F1E3D]/10 outline-none shadow-sm transition-all placeholder:text-[#0F1E3D]/30"
              />
           </div>
           
           <div className="flex flex-wrap items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {["All", "Design", "Frontend", "Backend", "John Doe"].map(tag => (
                 <span 
                   key={tag} 
                   onClick={() => setActiveFilter(tag)}
                   className={cn(
                     "px-3 py-1.5 border rounded-full text-[11px] font-bold shadow-sm cursor-pointer transition-all shrink-0",
                     activeFilter === tag 
                       ? "bg-[#0F1E3D] text-white border-[#0F1E3D]" 
                       : "bg-white border-[#0F1E3D]/5 text-[#0F1E3D]/50 hover:border-[#0F1E3D]/20"
                   )}
                 >
                    {tag}
                 </span>
              ))}
           </div>
        </div>
      </div>

      {/* Floating Canvas Board Area */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden no-scrollbar px-4 md:px-8 pb-8 pt-4">
        <div className="flex gap-6 h-full min-w-max">
          {PIPELINE.map(column => {
            const columnTasks = tasks.filter(t => t.status === column.id);
            
            return (
              <div 
                key={column.id} 
                className="w-[340px] flex flex-col h-full rounded-3xl shrink-0 border border-transparent transition-colors"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.add("bg-[#F4F5F7]/50", "border-[#0F1E3D]/5");
                }}
                onDragLeave={(e) => {
                  e.currentTarget.classList.remove("bg-[#F4F5F7]/50", "border-[#0F1E3D]/5");
                }}
                onDrop={(e) => {
                  e.currentTarget.classList.remove("bg-[#F4F5F7]/50", "border-[#0F1E3D]/5");
                  const taskId = e.dataTransfer.getData("text/plain");
                  if (taskId) {
                    updateTaskStatus.mutate({ id: taskId, status: column.id });
                    setDraggedItem(null);
                  }
                }}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-4 px-2 shrink-0">
                  <div className="flex items-center gap-2.5">
                    <div 
                      className="w-2.5 h-2.5 rounded-full shadow-sm" 
                      style={{ backgroundColor: column.color }}
                    />
                    <h2 className="text-[14px] font-bold text-[#0F1E3D] tracking-tight">{column.title}</h2>
                    <span className="flex items-center justify-center px-2 py-0.5 rounded-full bg-white border border-[#0F1E3D]/5 shadow-sm text-[11px] font-black text-[#0F1E3D]/40">
                      {columnTasks.length}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                     <button 
                       onClick={() => { setEditingTask(null); setModalDefaultStatus(column.id); setIsModalOpen(true); }}
                       className="text-[#0F1E3D]/30 hover:text-[#0F1E3D]/80 p-1 rounded-md transition-colors"
                     >
                       <Plus className="w-4 h-4" />
                     </button>
                     <button className="text-[#0F1E3D]/30 hover:text-[#0F1E3D]/80 p-1 rounded-md transition-colors">
                       <MoreVertical className="w-4 h-4" />
                     </button>
                  </div>
                </div>

                {/* Column Cards Container - No visual column background, just floating cards */}
                <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pb-8 px-1">
                  
                  <AnimatePresence>
                    {columnTasks.map(task => {
                      // Determine progress visually based on status
                      let progress = "0%";
                      if (task.status === "doing") progress = "45%";
                      if (task.status === "review") progress = "80%";
                      if (task.status === "done") progress = "100%";
                      
                      return (
                        <motion.div
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          key={task.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, task.id)}
                          onDragEnd={handleDragEnd}
                          onClick={() => { setEditingTask(task); setIsModalOpen(true); }}
                          className={cn(
                            "group bg-white p-5 rounded-[24px]",
                            "border border-white shadow-[0_12px_24px_-12px_rgba(15,30,61,0.08)]",
                            "hover:shadow-[0_16px_32px_-12px_rgba(15,30,61,0.12)] hover:border-[#0F1E3D]/5",
                            "transition-all duration-300 cursor-pointer active:cursor-grabbing relative overflow-hidden",
                            draggedItem === task.id && "opacity-50"
                          )}
                        >
                          {/* Active Line Indicator depending on column */}
                          {task.status === 'done' && (
                             <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-blue-500" />
                          )}
                          
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex gap-1.5 flex-wrap">
                              {/* Pill Tags */}
                              <span className={cn(
                                "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                task.priority === 'high' 
                                  ? "bg-rose-50 text-rose-600"
                                  : "bg-indigo-50 text-indigo-600"
                              )}>
                                {task.priority || 'Medium'}
                              </span>
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#F4F5F7] text-[#0F1E3D]/50 border border-[#0F1E3D]/5">
                                {task.company_name || 'Design'}
                              </span>
                            </div>
                            <button className="text-[#0F1E3D]/20 group-hover:text-[#0F1E3D]/50 transition-colors">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <h3 className="text-[15px] font-bold text-[#0F1E3D] leading-snug mb-4">
                            {task.title}
                          </h3>
                          
                          <div className="flex flex-col gap-3 mt-auto">
                            {/* Visual Progress Bar */}
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] font-bold text-[#0F1E3D]/40 tracking-wider">Progress</span>
                              <div className="flex-1 h-1.5 bg-[#F4F5F7] rounded-full overflow-hidden">
                                 <div 
                                   className="h-full rounded-full transition-all duration-500 ease-out"
                                   style={{ width: progress, backgroundColor: column.color }}
                                 />
                              </div>
                              <span className="text-[10px] font-black" style={{ color: column.color }}>{progress}</span>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-[#0F1E3D]/5">
                              {/* Assignees (Avatars) */}
                              <div className="flex items-center -space-x-1.5">
                                <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center border-[2px] border-white z-20">
                                  <span className="text-[9px] font-black text-blue-700">T</span>
                                </div>
                                <div className="w-7 h-7 rounded-full bg-rose-100 flex items-center justify-center border-[2px] border-white z-10">
                                  <span className="text-[9px] font-black text-rose-700">A</span>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-3 text-[#0F1E3D]/30">
                                 <div className="flex items-center gap-1">
                                    <MessageSquare className="w-3.5 h-3.5" />
                                    <span className="text-[11px] font-bold">2</span>
                                 </div>
                                 <div className="flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span className="text-[11px] font-bold">Today</span>
                                 </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>

                  {/* Add Task Button per column */}
                  <button 
                    onClick={() => { setEditingTask(null); setModalDefaultStatus(column.id); setIsModalOpen(true); }}
                    className="w-full py-4 border-2 border-dashed border-[#0F1E3D]/10 hover:border-[#0F1E3D]/30 rounded-[24px] flex items-center justify-center gap-2 text-[#0F1E3D]/30 hover:text-[#0F1E3D]/60 transition-colors group"
                  >
                     <Plus className="w-4 h-4 transition-transform group-hover:scale-110" />
                     <span className="text-[13px] font-bold">Add Task</span>
                  </button>

                </div>
              </div>
            );
          })}
        </div>
      </div>
      <TaskFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        task={editingTask}
        defaultStatus={modalDefaultStatus}
      />
    </div>
  );
}

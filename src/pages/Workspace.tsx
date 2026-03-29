import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PenSquare, Plus, MoreHorizontal, ArrowUpRight,
  FileText, Layers, Megaphone, Globe, CheckCircle2, Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCompanies } from "@/hooks/useAppData";

type StatusKey = "all" | "active" | "review" | "completed";

const statusFilters: { key: StatusKey; label: string }[] = [
  { key: "all",       label: "All" },
  { key: "active",    label: "Active" },
  { key: "review",    label: "In Review" },
  { key: "completed", label: "Completed" },
];

const statusStyles: Record<string, string> = {
  active:    "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  review:    "bg-amber-500/10 text-amber-600 border-amber-500/20",
  completed: "bg-[#0F1E3D]/5 text-[#0F1E3D]/40 border-[#0F1E3D]/10",
};

const serviceIcon: Record<string, React.ElementType> = {
  "Brand Identity":    Layers,
  "Social Media":      Megaphone,
  "Web Development":   Globe,
  "Content Strategy":  FileText,
  "Campaign":          Megaphone,
};

interface WorkspaceProject {
  id: string;
  title: string;
  client: string;
  service: string;
  status: "active" | "review" | "completed";
  progress: number;
  due: string;
  tasks: number;
  tasksDone: number;
}

const PROJECTS: WorkspaceProject[] = [
  { id: "1", title: "Q2 Brand Campaign",       client: "NovaTech",      service: "Campaign",          status: "active",    progress: 65,  due: "Apr 15, 2026", tasks: 12, tasksDone: 8  },
  { id: "2", title: "Website Redesign",         client: "Luna Studio",   service: "Web Development",   status: "active",    progress: 40,  due: "May 1, 2026",  tasks: 18, tasksDone: 7  },
  { id: "3", title: "Brand Identity Refresh",   client: "Wildflower Co", service: "Brand Identity",    status: "review",    progress: 90,  due: "Mar 30, 2026", tasks: 9,  tasksDone: 9  },
  { id: "4", title: "March Social Media Pack",  client: "Apex Digital",  service: "Social Media",      status: "active",    progress: 75,  due: "Mar 28, 2026", tasks: 6,  tasksDone: 4  },
  { id: "5", title: "Content Calendar Q1",      client: "Luna Studio",   service: "Content Strategy",  status: "completed", progress: 100, due: "Feb 28, 2026", tasks: 10, tasksDone: 10 },
  { id: "6", title: "Annual Report Design",     client: "NovaTech",      service: "Brand Identity",    status: "review",    progress: 85,  due: "Apr 5, 2026",  tasks: 8,  tasksDone: 7  },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function Workspace() {
  const [activeFilter, setActiveFilter] = useState<StatusKey>("all");
  const [showNewProject, setShowNewProject] = useState(false);
  const { data: companies = [] } = useCompanies();

  const visible = PROJECTS.filter(
    (p) => activeFilter === "all" || p.status === activeFilter
  );

  const activeCount    = PROJECTS.filter((p) => p.status === "active").length;
  const reviewCount    = PROJECTS.filter((p) => p.status === "review").length;
  const completedCount = PROJECTS.filter((p) => p.status === "completed").length;

  return (
    <motion.div variants={container} initial="hidden" animate="show"
      className="flex flex-col h-full gap-6 overflow-hidden pb-4">

      {/* Header */}
      <motion.div variants={item} className="flex items-end justify-between shrink-0">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--brand-primary)]">Workspace</h1>
          <p className="text-sm text-[var(--brand-primary)]/50 font-bold mt-1.5 uppercase tracking-widest">
            Active Projects &amp; Deliverables
          </p>
        </div>
        <button 
          onClick={() => setShowNewProject(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-[#0F1E3D] text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#1E3A8A] transition-all shadow-md active:scale-95"
        >
          <Plus className="h-4 w-4 text-white/70" /> New Project
        </button>
      </motion.div>

      {/* Metric cards */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
        <div className="bg-white border border-[#0F1E3D]/5 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] font-black uppercase tracking-widest text-[var(--brand-primary)]/40 mb-3">Active Projects</span>
          <span className="text-3xl font-extrabold text-[var(--brand-primary)] tracking-tight">{activeCount}</span>
        </div>
        <div className="bg-white border border-[#0F1E3D]/5 rounded-2xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-bl-[100px] pointer-events-none" />
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-600/70 mb-3">In Review</span>
          <span className="text-3xl font-extrabold text-amber-600 tracking-tight">{reviewCount}</span>
        </div>
        <div className="bg-white border border-[#0F1E3D]/5 rounded-2xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-[100px] pointer-events-none" />
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600/70 mb-3">Completed</span>
          <span className="text-3xl font-extrabold text-emerald-600 tracking-tight">{completedCount}</span>
        </div>
      </motion.div>

      {/* Project list */}
      <motion.div variants={item} className="flex-1 min-h-0 bg-white border border-[#0F1E3D]/5 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#0F1E3D]/5 shrink-0 bg-[#F8FAFC]/50 gap-4 flex-wrap">
          <div className="flex items-center gap-2 shrink-0">
            <PenSquare className="h-4 w-4 text-[#1E3A8A]" />
            <span className="text-sm font-black uppercase tracking-widest text-[var(--brand-primary)]">Projects</span>
          </div>
          <div className="flex gap-1.5">
            {statusFilters.map((f) => (
              <button key={f.key} onClick={() => setActiveFilter(f.key)}
                className={cn(
                  "px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg border transition-all",
                  activeFilter === f.key
                    ? "bg-[#0F1E3D] text-white border-[#0F1E3D]"
                    : "bg-white text-[var(--brand-primary)]/50 border-[#0F1E3D]/10 hover:border-[#0F1E3D]/20 hover:text-[var(--brand-primary)]"
                )}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Rows */}
        <div className="flex-1 overflow-y-auto px-2 py-2">
          {visible.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-8">
              <PenSquare className="h-8 w-8 text-[var(--brand-primary)] opacity-20 mb-3" />
              <p className="text-sm font-bold text-[var(--brand-primary)]">No projects in this category.</p>
            </div>
          ) : (
            <div className="space-y-1">
              <AnimatePresence>
                {visible.map((proj, i) => {
                  const Icon = serviceIcon[proj.service] ?? FileText;
                  return (
                    <motion.div key={proj.id} layout
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="flex items-center gap-4 p-4 rounded-xl border border-transparent hover:border-[#0F1E3D]/5 hover:bg-[#F8FAFC] transition-colors cursor-pointer group"
                    >
                      {/* Service icon */}
                      <div className="w-10 h-10 rounded-xl bg-[#0F1E3D] flex items-center justify-center shrink-0 shadow-sm">
                        <Icon className="h-4.5 w-4.5 text-white/80" style={{ width: "1.125rem", height: "1.125rem" }} />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-extrabold text-[var(--brand-primary)] truncate">{proj.title}</p>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[#1E3A8A]">{proj.client}</span>
                          <span className="text-[10px] font-bold text-[var(--brand-primary)]/40">{proj.service}</span>
                        </div>

                        {/* Progress bar */}
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex-1 h-1.5 bg-[#0F1E3D]/5 rounded-full overflow-hidden max-w-[160px]">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${proj.progress}%`,
                                background: proj.status === "completed"
                                  ? "#10b981"
                                  : proj.status === "review"
                                  ? "#f59e0b"
                                  : "var(--brand-primary)",
                              }}
                            />
                          </div>
                          <span className="text-[10px] font-black text-[var(--brand-primary)]/40">{proj.progress}%</span>
                        </div>
                      </div>

                      {/* Right side */}
                      <div className="flex items-center gap-5 shrink-0 ml-2">
                        {/* Task count */}
                        <div className="hidden md:flex flex-col items-end">
                          <div className="flex items-center gap-1">
                            {proj.tasksDone === proj.tasks
                              ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                              : <Clock className="h-3.5 w-3.5 text-[var(--brand-primary)]/30" />
                            }
                            <span className="text-xs font-black text-[var(--brand-primary)]">
                              {proj.tasksDone}/{proj.tasks}
                            </span>
                          </div>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--brand-primary)]/30 mt-0.5">tasks</span>
                        </div>

                        {/* Due date */}
                        <div className="hidden sm:flex flex-col items-end">
                          <span className="text-xs font-bold text-[var(--brand-primary)]">{proj.due}</span>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--brand-primary)]/30 mt-0.5">due date</span>
                        </div>

                        {/* Status badge */}
                        <span className={cn(
                          "inline-flex items-center px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                          statusStyles[proj.status]
                        )}>
                          {proj.status === "review" ? "In Review" : proj.status}
                        </span>

                        {/* Actions */}
                        <div className="flex items-center gap-1">
                          <button className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--brand-primary)]/30 hover:bg-white hover:text-[var(--brand-primary)] hover:shadow-sm border border-transparent hover:border-[#0F1E3D]/10 transition-all">
                            <ArrowUpRight className="h-4 w-4" />
                          </button>
                          <button className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--brand-primary)]/30 hover:bg-white hover:text-[var(--brand-primary)] hover:shadow-sm border border-transparent hover:border-[#0F1E3D]/10 transition-all">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>

      {/* New Project Modal */}
      <AnimatePresence>
        {showNewProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
            onClick={(e) => e.target === e.currentTarget && setShowNewProject(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-[#0F1E3D]/5"
            >
              <h2 className="text-xl font-extrabold text-[var(--brand-primary)] mb-2">Create New Project</h2>
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--brand-primary)]/40 mb-6">Initialize a new workspace sprint</p>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-[var(--brand-primary)]/50 mb-1.5 block">Project Name *</label>
                  <input placeholder="e.g. Q3 Brand Campaign" className="w-full bg-[#F8FAFC] border border-[#0F1E3D]/10 rounded-xl px-4 py-3 text-sm font-bold text-[var(--brand-primary)] focus:outline-none focus:border-[var(--brand-accent)] transition-colors" />
                </div>
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-[var(--brand-primary)]/50 mb-1.5 block">Primary Service</label>
                  <select className="w-full bg-[#F8FAFC] border border-[#0F1E3D]/10 rounded-xl px-4 py-3 text-sm font-bold text-[var(--brand-primary)] focus:outline-none focus:border-[var(--brand-accent)] transition-colors">
                    <option>Brand Identity</option>
                    <option>Web Development</option>
                    <option>Social Media</option>
                    <option>Performance Marketing</option>
                  </select>
                </div>
              </div>
              
              <div className="flex gap-3 mt-8">
                <button onClick={() => setShowNewProject(false)} className="flex-1 px-4 py-3 bg-[#F8FAFC] text-[var(--brand-primary)] rounded-xl text-xs font-black uppercase tracking-widest border border-[#0F1E3D]/10 hover:bg-[#F1F5F9] transition-all">
                  Cancel
                </button>
                <button onClick={() => { setShowNewProject(false); }} className="flex-1 px-4 py-3 bg-[#0F1E3D] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#1E3A8A] transition-all shadow-md">
                  Create Project
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

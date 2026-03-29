import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Sparkles, Info } from "lucide-react";
import { format, addDays } from "date-fns";


type KanbanStatus = "backlog" | "in_progress" | "review" | "complete";

interface ProjectCard {
  id: number;
  title: string;
  client: string;
  status: KanbanStatus;
  health: "green" | "amber" | "red";
  dueDate: Date;
}

const getInitialProjects = () => {
  const now = new Date();
  return [
    { id: 1, title: "Brand Identity Redesign", client: "Tapx Client", status: "in_progress", health: "green", dueDate: addDays(now, 13) },
    { id: 2, title: "SEO Campaign", client: "Tapx Client", status: "in_progress", health: "red", dueDate: addDays(now, 6) },
    { id: 3, title: "E-commerce Store", client: "Tapx Client", status: "review", health: "green", dueDate: addDays(now, 18) },
    { id: 4, title: "Social Media Strategy", client: "Greenfield Corp", status: "backlog", health: "green", dueDate: addDays(now, 23) },
    { id: 5, title: "Email Automation", client: "Apex Digital", status: "in_progress", health: "amber", dueDate: addDays(now, 10) },
    { id: 6, title: "Analytics Dashboard", client: "Wildflower Co", status: "complete", health: "green", dueDate: addDays(now, -4) },
    { id: 7, title: "Paid Media Campaign", client: "Apex Digital", status: "backlog", health: "green", dueDate: addDays(now, 30) },
    { id: 8, title: "CRO Audit", client: "NovaTech", status: "review", health: "amber", dueDate: addDays(now, 8) },
  ];
};

const columns: { key: KanbanStatus; label: string; color: string }[] = [
  { key: "backlog", label: "Backlog", color: "border-muted-foreground/30" },
  { key: "in_progress", label: "In Progress", color: "border-accent/50" },
  { key: "review", label: "Review", color: "border-warning/50" },
  { key: "complete", label: "Complete", color: "border-success/50" },
];

const healthGlow: Record<string, string> = {
  green: "glow-success",
  amber: "glow-warning",
  red: "glow-destructive",
};

export default function Projects() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const allProjects = getInitialProjects();
  const projects = isAdmin ? allProjects : allProjects.filter(p => p.client === user?.name || p.client === 'Tapx Client');

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as any } }
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8 pb-12">
      <motion.div variants={item} className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground lg:text-4xl text-gradient">
          Projects
        </h1>
        <p className="text-base text-muted-foreground/80 font-medium">
          {isAdmin ? "Oversee all active agency projects." : "Track the progress of your active projects."}
        </p>
      </motion.div>

      <motion.div variants={item} className="flex gap-4 overflow-x-auto pb-6 snap-x snap-mandatory lg:snap-none no-scrollbar">
        {columns.map((col) => {
          const colProjects = projects.filter((p) => p.status === col.key);
          return (
            <div key={col.key} className="min-w-[300px] flex-1 snap-center">
              <div className={cn("mb-4 flex items-center justify-between border-b-2 pb-3", col.color)}>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">{col.label}</h3>
                  <span className="rounded-full bg-white/40 border border-white/60 px-2.5 py-0.5 text-xs font-bold text-muted-foreground backdrop-blur-md">
                    {colProjects.length}
                  </span>
                </div>
              </div>
              <div className="space-y-4 min-h-[500px]">
                <AnimatePresence>
                  {colProjects.map((project) => (
                    <motion.div
                      key={project.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      whileHover={{ y: -4, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        "glass-card cursor-pointer p-5 transition-all group relative overflow-hidden",
                        healthGlow[project.health]
                      )}
                    >
                      <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex flex-col gap-3">
                        <div>
                          <p className="text-base font-bold text-foreground leading-tight group-hover:text-accent transition-colors">
                            {project.title}
                          </p>
                          {isAdmin && (
                            <p className="text-xs font-semibold text-muted-foreground mt-1 flex items-center gap-1">
                              <Sparkles className="h-3 w-3" /> {project.client}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1.5">
                            <div className={cn(
                              "h-2 w-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.1)]",
                              project.health === "green" ? "bg-success" :
                                project.health === "amber" ? "bg-warning" : "bg-destructive animate-pulse"
                            )} />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                              {project.health === "green" ? "Stable" : project.health === "amber" ? "Attention" : "High Risk"}
                            </span>
                          </div>
                          <span className="text-[11px] font-bold text-muted-foreground bg-white/20 px-2 py-0.5 rounded-md border border-white/40">
                            Due {format(project.dueDate, "MMM d")}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}

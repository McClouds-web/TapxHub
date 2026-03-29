import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Circle, Clock, Tag, Calendar, ListFilter } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useTasks } from "@/hooks/useAppData";

const priorityColors: Record<string, string> = {
  high: "bg-destructive/10 text-destructive border-destructive/20",
  medium: "bg-warning/10 text-warning border-warning/20",
  low: "bg-success/10 text-success border-success/20",
};

const statusIcons = {
  todo: Circle,
  in_progress: Clock,
  done: CheckCircle2,
};

const statusColors = {
  todo: "text-muted-foreground",
  in_progress: "text-accent",
  done: "text-success",
};

export default function Tasks() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [filter, setFilter] = useState<"all" | "todo" | "in_progress" | "done">("all");

  const { data: allTasks = [] } = useTasks();

  const filteredTasks = allTasks.filter(t => {
    const roleMatches = isAdmin || t.company_name === user?.name || t.company_name === "Tapx Client";
    const filterMatches = filter === "all" || t.status === filter;
    return roleMatches && filterMatches;
  });

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const item = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as any } }
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8 pb-12">
      <motion.div variants={item} className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground lg:text-4xl text-gradient">
          Tasks
        </h1>
        <p className="text-base text-muted-foreground/80 font-medium">
          Manage and track milestones specifically for your active projects.
        </p>
      </motion.div>

      <motion.div variants={item} className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
        <div className="flex items-center gap-2 mr-2 bg-white/20 p-1 rounded-full backdrop-blur-sm border border-white/40">
          {(["all", "todo", "in_progress", "done"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-full px-6 py-2 text-sm font-bold transition-all duration-300",
                filter === f
                  ? "bg-accent text-white shadow-lg shadow-accent/25 translate-y-[-1px]"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/40"
              )}
            >
              {f.charAt(0).toUpperCase() + f.slice(1).replace("_", " ")}
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div variants={container} className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredTasks.map((task: any) => {
            const Icon = statusIcons[task.status as keyof typeof statusIcons] || Circle;
            return (
              <motion.div
                key={task.id}
                layout
                variants={item}
                exit={{ opacity: 0, x: 20 }}
                whileHover={{ scale: 1.005, backgroundColor: "rgba(255,255,255,0.6)" }}
                className={cn(
                  "glass-card flex flex-col md:flex-row md:items-center gap-4 p-5 transition-all group",
                  task.status === "done" && "opacity-60 grayscale-[0.5]"
                )}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className={cn(
                    "p-2 rounded-xl transition-colors",
                    task.status === "in_progress" ? "bg-accent/10" : "bg-white/40"
                  )}>
                    <Icon className={cn("h-6 w-6", statusColors[task.status as keyof typeof statusColors])} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-base font-bold text-foreground transition-all group-hover:text-accent",
                      task.status === "done" && "line-through"
                    )}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      {task.company_name && (
                        <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                          <Tag className="h-3 w-3" /> {task.company_name}
                        </p>
                      )}
                      {task.due_date && (
                        <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> Due {new Date(task.due_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between md:justify-end gap-3 md:w-48">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm",
                    priorityColors[task.priority ?? "medium"]
                  )}>
                    {task.priority || "MEDIUM"}
                  </span>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <ListFilter className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredTasks.length === 0 && (
          <motion.div variants={item} className="glass-card p-12 text-center opacity-70">
            <p className="text-muted-foreground font-medium">No tasks found matching this criteria.</p>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}

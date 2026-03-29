import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FolderKanban,
  DollarSign,
  FileText,
  AlertTriangle,
  Clock,
  Sparkles,
  Search,
} from "lucide-react";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { DailyPulse } from "@/components/dashboard/DailyPulse";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { CalendarPreview } from "@/components/dashboard/CalendarPreview";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";


const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as any } },
};

function getGreeting(name: string) {
  const hour = new Date().getHours();
  if (hour < 12) return `Good morning, ${name}`;
  if (hour < 17) return `Good afternoon, ${name}`;
  return `Good evening, ${name}`;
}

export default function Dashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const firstName = user?.name?.split(" ")[0] || "Tapx";
  const [now, setNow] = useState(new Date());
  const [greeting, setGreeting] = useState(getGreeting(firstName));

  useEffect(() => {
    const timer = setInterval(() => {
      const current = new Date();
      setNow(current);
      setGreeting(getGreeting(firstName));
    }, 60000);
    return () => clearInterval(timer);
  }, [firstName]);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8 pb-12">
      {/* Header */}
      <motion.div
        variants={item}
        className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between"
      >
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground lg:text-4xl text-gradient">
            {greeting}
          </h1>
          <p className="mt-2 text-base text-muted-foreground/80 font-medium">
            {isAdmin
              ? "Here's your agency's real-time performance overview."
              : "Welcome back. Everything's running smoothly with your projects."}
          </p>
        </div>
        {!isAdmin && (
          <Button variant="outline" className="glass-card mt-4 border-white/20 px-6 font-semibold md:mt-0 shadow-sm">
            <Search className="mr-2 h-4 w-4" /> Quick Find
          </Button>
        )}
      </motion.div>

      {/* KPI Grid */}
      <motion.div variants={item} className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="animate-breathe">
          <KpiCard
            title={isAdmin ? "Total Revenue" : "My Projects"}
            value={isAdmin ? 124500 : 2}
            prefix={isAdmin ? "P" : ""}
            icon={isAdmin ? DollarSign : FolderKanban}
            change={isAdmin ? "+12% vs last month" : "On schedule"}
            changeType="positive"
            glowClass="glow-accent"
          />
        </div>
        <KpiCard
          title={isAdmin ? "Outstanding" : "My Tasks"}
          value={isAdmin ? 8400 : 5}
          prefix={isAdmin ? "P" : ""}
          icon={isAdmin ? FileText : Clock}
          change={isAdmin ? "4 pending invoices" : "2 due this week"}
          changeType="neutral"
          glowClass="glow-warning"
        />
        <KpiCard
          title={isAdmin ? "Active Projects" : "Recent Assets"}
          value={isAdmin ? 12 : 14}
          icon={isAdmin ? FolderKanban : Sparkles}
          change={isAdmin ? "+2 new this week" : "3 new shared"}
          changeType="positive"
          glowClass="glow-success"
        />
        <KpiCard
          title={isAdmin ? "At Risk" : "Unread Alerts"}
          value={isAdmin ? 1 : 0}
          icon={isAdmin ? AlertTriangle : AlertTriangle}
          change={isAdmin ? "Phase 2 overdue" : "All caught up"}
          changeType={isAdmin ? "negative" : "positive"}
          glowClass={isAdmin ? "glow-destructive" : ""}
        />
      </motion.div>

      {/* Dynamic Content Sections */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <motion.div variants={item} className="lg:col-span-2">
          {isAdmin ? (
            <RevenueChart />
          ) : (
            <div className="glass-card flex h-full min-h-[400px] flex-col overflow-hidden group">
              <div className="border-b border-white/20 p-6 bg-white/10">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-accent animate-pulse" />
                  Priority Growth Insights
                </h3>
              </div>
              <div className="flex flex-1 flex-col justify-center items-center p-8 text-center space-y-6">
                <div className="h-24 w-24 bg-accent/10 rounded-[2.5rem] flex items-center justify-center border border-accent/20 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                  <FolderKanban className="h-10 w-10 text-accent" />
                </div>
                <div className="max-w-md">
                  <h3 className="text-2xl font-bold text-foreground">Premium Brand Strategy</h3>
                  <p className="text-muted-foreground mt-3 leading-relaxed">
                    Your brand is evolving. Unlock our 2024 Strategy Roadmap to scale your digital presence
                    with advanced SEO and conversion-focused funnels.
                  </p>
                  <div className="flex gap-4 justify-center mt-8">
                    <Button className="bg-accent hover:bg-accent/90 px-8 rounded-full shadow-lg shadow-accent/30 text-white font-bold transition-all hover:translate-y-[-2px]">
                      Upgrade Plan
                    </Button>
                    <Button variant="outline" className="rounded-full px-8 bg-white/20 border-white/40 hover:bg-white/40 backdrop-blur-sm transition-all">
                      View Roadmap
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
        <motion.div variants={item}>
          <DailyPulse currentGreeting={greeting} />
        </motion.div>
      </div>

      {/* Lower section */}
      <div className={cn("grid grid-cols-1 gap-6", isAdmin ? "lg:grid-cols-2" : "lg:grid-cols-1")}>
        <motion.div variants={item}>
          <CalendarPreview />
        </motion.div>
        {isAdmin && (
          <motion.div variants={item}>
            <ActivityFeed />
          </motion.div>
        )}
      </div>
    </motion.div>

  );
}

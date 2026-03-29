import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, CalendarCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { format, addMonths, subMonths, startOfMonth, getDay, getDaysInMonth } from "date-fns";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface CalEvent {
  day: number;
  title: string;
  type: "deadline" | "retainer" | "meeting" | "vacation" | "available" | "booking";
  client?: string;
}

const sampleEvents: CalEvent[] = [
  { day: 3,  title: "Bloom — Final Delivery",    type: "deadline", client: "Bloom" },
  { day: 5,  title: "Luna Retainer Renewal",     type: "retainer", client: "Luna" },
  { day: 7,  title: "NovaTech SEO Report",       type: "deadline", client: "NovaTech" },
  { day: 10, title: "Greenfield Q1 Call",        type: "meeting",  client: "Greenfield" },
  { day: 14, title: "Apex Strategy Review",      type: "meeting",  client: "Apex Digital" },
  { day: 17, title: "Agency Break",              type: "vacation" },
  { day: 11, title: "Available",                 type: "available" },
  { day: 18, title: "Available",                 type: "available" },
  { day: 20, title: "Available",                 type: "available" },
];

const typeColors: Record<string, string> = {
  deadline:  "bg-destructive/15 text-destructive border-destructive/20",
  retainer:  "bg-accent/15 text-accent border-accent/20",
  meeting:   "bg-success/15 text-success border-success/20",
  vacation:  "bg-warning/15 text-warning border-warning/20",
  available: "bg-accent/5 text-accent/60 border-accent/10 border-dashed",
  booking:   "bg-blue-500/15 text-blue-700 border-blue-300",
};

export default function Calendar() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [currentDate, setCurrentDate] = useState(new Date());

  const monthLabel = format(currentDate, "MMMM yyyy");
  const daysInMonth = getDaysInMonth(currentDate);
  // getDay returns 0=Sunday…6=Saturday, we want Mon=0…Sun=6
  const rawStart = getDay(startOfMonth(currentDate)); // 0=Sun
  const startOffset = rawStart === 0 ? 6 : rawStart - 1; // shift so Mon=0

  const events = sampleEvents.filter(e => {
    if (isAdmin) return true;
    if (e.type === "available" || e.type === "booking") return true;
    if (e.type === "vacation") return false;
    return e.client === user?.name;
  });

  const cells = Array.from({ length: 42 }, (_, i) => {
    const day = i - startOffset + 1;
    return day >= 1 && day <= daysInMonth ? day : null;
  });

  const today = new Date();
  const isCurrentMonth =
    today.getMonth() === currentDate.getMonth() &&
    today.getFullYear() === currentDate.getFullYear();
  const todayDay = isCurrentMonth ? today.getDate() : -1;

  const summary = [
    { label: "Deadlines", count: events.filter(e => e.type === "deadline").length, color: "text-destructive" },
    { label: "Meetings",  count: events.filter(e => e.type === "meeting").length,  color: "text-success" },
    { label: "Retainers", count: events.filter(e => e.type === "retainer").length, color: "text-accent" },
    { label: isAdmin ? "Time Off" : "Available", count: events.filter(e => e.type === (isAdmin ? "vacation" : "available")).length, color: isAdmin ? "text-warning" : "text-accent" },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Calendar</h1>
          <p className="text-sm text-muted-foreground">
            {isAdmin ? "Manage all client meetings and agency deadlines." : "Your project deadlines, booked sessions & available slots."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentDate(d => subMonths(d, 1))}
            className="rounded-lg p-2 hover:bg-secondary border border-border/30 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-semibold text-foreground min-w-[130px] text-center">{monthLabel}</span>
          <button
            onClick={() => setCurrentDate(d => addMonths(d, 1))}
            className="rounded-lg p-2 hover:bg-secondary border border-border/30 transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {summary.map((s) => (
          <div key={s.label} className="glass-card p-4 text-center">
            <p className={cn("text-2xl font-bold", s.color)}>{s.count}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="glass-card overflow-hidden p-4">
        <div className="grid grid-cols-7 gap-px">
          {DAYS.map((d) => (
            <div key={d} className="py-2 text-center text-xs font-semibold text-muted-foreground">{d}</div>
          ))}
          {cells.map((day, i) => {
            const dayEvents = day ? events.filter((e) => e.day === day) : [];
            const isToday = day === todayDay;
            const isPast = day && !isCurrentMonth 
              ? currentDate < today 
              : day && day < todayDay;

            return (
              <div
                key={i}
                className={cn(
                  "relative min-h-[110px] border border-[#0F1E3D]/5 p-2 transition-all duration-300",
                  day && !isPast ? "hover:bg-[#F8FAFC] cursor-pointer group/cell" : "bg-[#F1F5F9]/30",
                  isToday && "bg-blue-50/30 ring-inset ring-2 ring-blue-500/10",
                  isPast && "opacity-30 grayscale-[0.5] pointer-events-none cursor-not-allowed bg-[#F1F5F9]/50"
                )}
              >
                {day && (
                  <>
                    <span className={cn(
                      "text-[10px] font-black tracking-widest uppercase transition-colors",
                      isToday ? "text-blue-600" : isPast ? "text-[var(--brand-primary)]/20" : "text-[var(--brand-primary)]/40"
                    )}>
                      {day}
                    </span>
                    {isToday && <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />}
                    <div className="mt-2 space-y-1.5">
                      {dayEvents.map((event, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className={cn(
                            "rounded-md border px-1.5 py-0.5 text-[10px] font-bold truncate transition-all hover:scale-105",
                            typeColors[event.type]
                          )}
                        >
                          {event.type === "available"
                            ? (isAdmin ? "Bookable" : "Book Slot")
                            : event.type === "booking"
                            ? `📅 ${event.title}`
                            : event.title}
                        </motion.div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {!isAdmin && (
        <div className="glass-card p-6 flex items-center gap-4 border-dashed">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
            <CalendarCheck className="w-5 h-5 text-accent" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">Want to book a session?</p>
            <p className="text-xs text-muted-foreground">Visit the TapxMedia website to schedule a consultation with Tapiwa.</p>
          </div>
          <a
            href="https://www.tapxmedia.com/#booking"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto shrink-0 px-4 py-2 bg-[#0F1E3D] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#1E3A8A] transition-all shadow-md"
          >
            Book Now
          </a>
        </div>
      )}
    </motion.div>
  );
}

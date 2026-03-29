import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";


const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface CalEvent {
  day: number;
  title: string;
  type: "deadline" | "retainer" | "meeting" | "vacation" | "available";
  client?: string;
  span?: number;
}

const initialEvents: CalEvent[] = [
  { day: 3, title: "Bloom — Final Delivery", type: "deadline", client: "Bloom" },
  { day: 5, title: "Luna Retainer Renewal", type: "retainer", client: "Luna" },
  { day: 7, title: "NovaTech SEO Report", type: "deadline", client: "NovaTech" },
  { day: 10, title: "Greenfield Q1 Call", type: "meeting", client: "Greenfield" },
  { day: 14, title: "Apex Strategy Review", type: "meeting", client: "Apex Digital" },
  { day: 17, title: "Agency Break", type: "vacation", span: 3 },
  { day: 2, title: "Brand Redesign Workshop", type: "meeting", client: "Tapx Client" },
  { day: 12, title: "Website Beta Review", type: "deadline", client: "Tapx Client" },
  { day: 22, title: "Invoice Batch", type: "deadline", client: "Tapx Client" },
  { day: 25, title: "Monthly Success Call", type: "meeting", client: "Tapx Client" },
  // Available slots for booking
  { day: 11, title: "Available Slot", type: "available" },
  { day: 18, title: "Available Slot", type: "available" },
  { day: 20, title: "Available Slot", type: "available" },
];

const typeColors: Record<string, string> = {
  deadline: "bg-destructive/15 text-destructive border-destructive/20",
  retainer: "bg-accent/15 text-accent border-accent/20",
  meeting: "bg-success/15 text-success border-success/20",
  vacation: "bg-warning/15 text-warning border-warning/20",
  available: "bg-accent/5 text-accent/60 border-accent/10 border-dashed",
};

export default function Calendar() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [currentMonth] = useState("March 2026");
  const daysInMonth = 31;
  const startDay = 6; // March 2026 starts on Sunday → offset 6

  const events = initialEvents.filter(e => {
    if (isAdmin) return true;
    if (e.type === "available") return true; // Clients see available slots to book
    if (e.type === "vacation") return false; // Clients don't see vacation details, maybe just "Unavailable"
    return e.client === user?.name || e.client === "Tapx Client";
  });

  const cells = Array.from({ length: 42 }, (_, i) => {
    const day = i - startDay + 1;
    return day >= 1 && day <= daysInMonth ? day : null;
  });

  const summary = [
    { label: "Deadlines", count: events.filter(e => e.type === "deadline").length, color: "text-destructive" },
    { label: "Meetings", count: events.filter(e => e.type === "meeting").length, color: "text-success" },
    { label: "Retainer Cycles", count: events.filter(e => e.type === "retainer").length, color: "text-accent" },
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
          <button className="rounded-lg p-2 hover:bg-secondary"><ChevronLeft className="h-4 w-4" /></button>
          <span className="text-sm font-semibold text-foreground">{currentMonth}</span>
          <button className="rounded-lg p-2 hover:bg-secondary"><ChevronRight className="h-4 w-4" /></button>
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
            const isToday = day === 2;
            return (
              <div
                key={i}
                className={cn(
                  "relative min-h-[100px] border border-border/30 p-1.5 transition-colors",
                  day ? "hover:bg-secondary/50 cursor-pointer" : "bg-muted/20",
                  isToday && "ring-2 ring-accent/30 bg-accent/5"
                )}
              >
                {day && (
                  <>
                    <span className={cn("text-xs font-medium", isToday ? "text-accent font-bold" : "text-foreground")}>
                      {day}
                      {isToday && <span className="ml-1 text-[8px] uppercase tracking-tighter">Today</span>}
                    </span>
                    <div className="mt-1 space-y-1">
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
                          {event.type === "available" ? (isAdmin ? "Bookable Slot" : "Book Slot") : event.title}
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
    </motion.div>
  );
}


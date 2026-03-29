import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { CheckCircle2, Calendar, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { useTasks, useTodayTaskCount, usePendingInvoiceCount, Task } from "@/hooks/useAppData";
import { useAuth } from "@/contexts/AuthContext";

function getGreeting(name: string) {
  const h = new Date().getHours();
  if (h < 12) return `Good morning, ${name}`;
  if (h < 17) return `Good afternoon, ${name}`;
  return `Good evening, ${name}`;
}

interface GeoInfo {
  city: string;
  country: string;
  timezone: string;
}

function useGeoLocation(): GeoInfo {
  const [geo, setGeo] = useState<GeoInfo>({ city: "—", country: "", timezone: "" });

  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then((r) => r.json())
      .then((d) => {
        setGeo({
          city: d.city || "—",
          country: d.country_name || "",
          timezone: d.timezone || "",
        });
      })
      .catch(() => {});
  }, []);

  return geo;
}

function useLocalTime(timezone: string) {
  const [time, setTime] = useState("");

  useEffect(() => {
    const tick = () => {
      const opts: Intl.DateTimeFormatOptions = {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
        timeZone: timezone || undefined,
      };
      setTime(new Intl.DateTimeFormat("en-US", opts).format(new Date()));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [timezone]);

  return time;
}

function TodayProgressRing() {
  const { data: tasks } = useTasks();
  const today = format(new Date(), "yyyy-MM-dd");
  const todayTasks: Task[] = (tasks ?? []).filter(
    (t) => t.due_date && t.due_date.startsWith(today)
  );
  const done = todayTasks.filter((t) => t.status === "done").length;
  const total = todayTasks.length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="relative z-10 mt-6 md:mt-0 flex flex-col items-center justify-center shrink-0 md:ml-8 lg:mr-4 p-4 bg-white/50 rounded-2xl border border-white shadow-sm">
      <div className="relative w-24 h-24 flex items-center justify-center rounded-full bg-[#f8fafc] shadow-inner">
        <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 96 96">
          <circle cx="48" cy="48" r="40" fill="none" stroke="rgba(15,30,61,0.05)" strokeWidth="8" />
          <circle
            cx="48" cy="48" r="40"
            fill="none"
            stroke="var(--brand-primary)"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ strokeLinecap: "round", transition: "stroke-dashoffset 0.6s ease" }}
          />
        </svg>
        <span className="text-2xl font-black text-[var(--brand-primary)]">{pct}%</span>
      </div>
      <span className="text-[9px] font-bold text-[var(--brand-primary)] opacity-60 mt-3 tracking-[0.2em] uppercase">
        Today's Progress
      </span>
    </div>
  );
}

export function MorningBriefing() {
  const { user } = useAuth();
  const firstName = user?.name?.split(" ")[0] || "Tapiwa";
  const today = new Date();

  const todayTasks      = useTodayTaskCount();
  const pendingInvoices = usePendingInvoiceCount();
  const geo             = useGeoLocation();
  const localTime       = useLocalTime(geo.timezone);

  return (
    <motion.div
      className="relative overflow-hidden rounded-[var(--radius-xl)] p-5 sm:px-8 sm:py-6 flex flex-col md:flex-row items-center justify-between group"
      style={{
        background: "var(--glass-bg)",
        backdropFilter: "var(--glass-blur)",
        border: "1px solid var(--glass-border)",
        boxShadow: "0 24px 48px -12px rgba(15,30,61,0.06)",
      }}
    >
      <div className="relative z-10 flex-1">
        {/* Greeting */}
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[var(--brand-primary)] leading-none mb-3">
          {getGreeting(firstName)}
        </h2>

        {/* Date + live clock — styled pill row */}
        <div className="flex flex-wrap items-center gap-2 mb-5">
          <span className="inline-flex items-center gap-1.5 bg-[#0F1E3D]/5 border border-[#0F1E3D]/8 rounded-full px-3.5 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-primary)] opacity-50 shrink-0" />
            <span className="text-[11px] font-black uppercase tracking-[0.18em] text-[var(--brand-primary)]/70">
              {format(today, "EEEE, MMMM do, yyyy")}
            </span>
          </span>
          {localTime && (
            <span className="inline-flex items-center gap-1.5 bg-[var(--brand-primary)] rounded-full px-3.5 py-1.5 shadow-md shadow-[#0F1E3D]/10">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse shrink-0" />
              <span className="text-[11px] font-black tracking-[0.12em] text-white font-mono">
                {localTime}
              </span>
            </span>
          )}
        </div>

        {/* Quick links with live counts */}
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/planner"
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider bg-white/70 px-3 py-1.5 rounded-lg border border-[#0F1E3D]/5 text-[var(--brand-primary)] shadow-sm hover:scale-105 transition-transform outline-none"
          >
            <CheckCircle2 className="w-3.5 h-3.5 opacity-70" />
            <span>{todayTasks} task{todayTasks !== 1 ? "s" : ""} today</span>
          </Link>
          <Link
            to="/planner"
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider bg-white/70 px-3 py-1.5 rounded-lg border border-[#0F1E3D]/5 text-[var(--brand-primary)] shadow-sm hover:scale-105 transition-transform outline-none"
          >
            <Calendar className="w-3.5 h-3.5 opacity-70" />
            <span>2 meetings</span>
          </Link>
          <Link
            to="/invoices"
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider bg-white/70 px-3 py-1.5 rounded-lg border border-[#0F1E3D]/5 text-[var(--brand-primary)] shadow-sm hover:scale-105 transition-transform outline-none"
          >
            <FileText className="w-3.5 h-3.5 opacity-70" />
            <span>{pendingInvoices} pending invoice{pendingInvoices !== 1 ? "s" : ""}</span>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

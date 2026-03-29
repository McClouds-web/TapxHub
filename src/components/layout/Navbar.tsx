import { useState, useEffect } from "react";
import { NavLink, useNavigate, Link } from "react-router-dom";
import {
  LayoutDashboard,
  PenSquare,
  Calendar,
  Users,
  FolderLock,
  FileText,
  Bell,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  CloudSun,
  MessageSquare,
  BarChart3,
  CalendarCheck,
  Share2,
  Brain,
  Database,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useUnreadNotificationCount } from "@/hooks/useAppData";
import { useIsMobile } from "@/hooks/use-mobile";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/workspace", label: "Workspace", icon: PenSquare },
  { to: "/planner", label: "Planner", icon: Calendar },
  { to: "/bookings", label: "Bookings", icon: CalendarCheck },
  { to: "/lead-engine", label: "Lead Engine", icon: Database },
  { to: "/social-engine", label: "Social Engine", icon: Share2 },
  { to: "/brand-brain", label: "Brand Brain", icon: Brain },
  { to: "/clients", label: "Clients", icon: Users },
  { to: "/vault", label: "Vault", icon: FolderLock },
  { to: "/messages", label: "Messages", icon: MessageSquare, badge: true },
  { to: "/reports", label: "Reports", icon: BarChart3 },
  { to: "/invoices", label: "Invoices", icon: FileText },
  { to: "/notifications", label: "Notifications", icon: Bell, badge: true },
  { to: "/settings", label: "Settings", icon: Settings },
];

interface NavbarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Navbar({ mobileOpen = false, onMobileClose }: NavbarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(false);
  const unreadCount = useUnreadNotificationCount();

  // Timer state
  const targetDate = new Date("2026-03-31T00:00:00").getTime();
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    const tick = () => {
      const now = new Date().getTime();
      const distance = targetDate - now;
      if (distance > 0) {
        setTimeLeft({
          d: Math.floor(distance / (1000 * 60 * 60 * 24)),
          h: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          m: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          s: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  // IP-based location + weather
  const [geoCity, setGeoCity] = useState("—");
  const [weather, setWeather] = useState<{ temp: string; desc: string } | null>(null);

  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then((r) => r.json())
      .then((d) => {
        setGeoCity(d.city || "—");
        // Open-Meteo: free, no key required
        if (d.latitude && d.longitude) {
          return fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${d.latitude}&longitude=${d.longitude}&current_weather=true`
          )
            .then((r) => r.json())
            .then((w) => {
              const code = w.current_weather?.weathercode ?? -1;
              const desc =
                code === 0 ? "Clear Sky" :
                code <= 3 ? "Partly Cloudy" :
                code <= 48 ? "Foggy" :
                code <= 67 ? "Rainy" :
                code <= 77 ? "Snowy" :
                "Mixed";
              setWeather({
                temp: `${Math.round(w.current_weather?.temperature ?? 0)}°`,
                desc,
              });
            });
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <aside
      style={{
        width: isMobile ? "var(--sidebar-width)" : (collapsed ? "var(--sidebar-collapsed)" : "var(--sidebar-width)"),
        transition: isMobile
          ? "transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)"
          : "width 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)",
      }}
      className={cn(
        "flex flex-col bg-white border-r border-[#0F1E3D]/10 overflow-visible z-40 h-full shadow-[4px_0_24px_-12px_rgba(0,0,0,0.05)]",
        isMobile
          ? "fixed top-0 left-0 shrink-0"
          : "relative shrink-0",
        isMobile && !mobileOpen && "-translate-x-full"
      )}
    >
      {/* Logo */}
      <div className="flex flex-col items-center justify-center py-7 px-4 border-b border-[#0F1E3D]/5 relative">
        <Link to="/" className="flex items-center justify-center w-full">
          <img
            src="/logo.png"
            alt="TapxMedia"
            className={cn(
              "object-contain shrink-0 transition-all duration-300",
              collapsed ? "w-8 h-8" : "h-14 w-auto max-w-[150px]"
            )}
          />
        </Link>
        
        {/* Dynamic Widget Area */}
        {!collapsed && (
          <div className="mt-6 w-full px-2 animate-in fade-in slide-in-from-top-2 duration-500">
             {/* Countdown Timer */}
             <div className="bg-white rounded-xl p-3 shadow-sm mb-3 relative overflow-hidden group border border-[#0F1E3D]/5">
                <p className="text-[9px] uppercase font-black tracking-[0.2em] text-[#0F1E3D]/30 mb-2.5 text-center">Next Major Launch</p>
                <div className="flex items-center justify-center text-[#0F1E3D] font-mono gap-1 text-center">
                   <div className="flex flex-col"><span className="text-sm font-extrabold leading-none">{timeLeft.d}</span><span className="text-[7px] uppercase font-bold tracking-wider text-[#0F1E3D]/30 mt-1">D</span></div><span className="opacity-20 self-start text-xs">:</span>
                   <div className="flex flex-col"><span className="text-sm font-extrabold leading-none">{timeLeft.h.toString().padStart(2, '0')}</span><span className="text-[7px] uppercase font-bold tracking-wider text-[#0F1E3D]/30 mt-1">H</span></div><span className="opacity-20 self-start text-xs">:</span>
                   <div className="flex flex-col"><span className="text-sm font-extrabold leading-none">{timeLeft.m.toString().padStart(2, '0')}</span><span className="text-[7px] uppercase font-bold tracking-wider text-[#0F1E3D]/30 mt-1">M</span></div><span className="opacity-20 self-start text-xs">:</span>
                   <div className="flex flex-col"><span className="text-sm font-extrabold leading-none">{timeLeft.s.toString().padStart(2, '0')}</span><span className="text-[7px] uppercase font-bold tracking-wider text-[#0F1E3D]/30 mt-1">S</span></div>
                </div>
             </div>

             {/* Weather Widget — live from IP + Open-Meteo */}
             <div className="bg-[#F8FAFC] border border-[#0F1E3D]/10 rounded-xl p-3 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <CloudSun className="w-5 h-5 text-amber-500 shrink-0" />
                   <div>
                     <p className="text-[10px] font-black uppercase tracking-widest text-[#0F1E3D] leading-none truncate max-w-[80px]">
                       {geoCity}
                     </p>
                     <p className="text-[8px] font-bold uppercase tracking-wider text-[#0F1E3D]/50 mt-0.5">
                       {weather?.desc ?? "Loading…"}
                     </p>
                   </div>
                </div>
                <div className="text-right shrink-0">
                   <p className="text-base font-black text-[#0F1E3D] leading-none">
                     {weather?.temp ?? "—"}
                   </p>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-[30px] z-50 h-6 w-6 rounded-full bg-white border border-[#0F1E3D]/10 flex items-center justify-center text-[#0F1E3D]/50 hover:text-[#0F1E3D] hover:border-[#0F1E3D]/30 transition-all shadow-sm"
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </button>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-hidden">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => isMobile && onMobileClose?.()}
            className={({ isActive }) =>
              cn(
                "relative flex items-center gap-3.5 px-3 py-3 rounded-xl overflow-hidden group transition-all duration-300",
                collapsed ? "justify-center" : "",
                isActive
                  ? "bg-[#0F1E3D] text-white shadow-md shadow-[#0F1E3D]/10"
                  : "text-[#0F1E3D]/60 hover:bg-[#F1F5F9] hover:text-[#0F1E3D]"
              )
            }
          >
            {({ isActive }) => (
              <>
                {/* Icon + badge */}
                <div className="relative shrink-0 flex items-center justify-center">
                  <item.icon className="h-5 w-5" />
                  {item.badge && unreadCount > 0 && (
                    <span
                      className="absolute -top-1.5 -right-1.5 h-4 min-w-[1rem] px-0.5 rounded-full text-[10px] font-bold text-white flex items-center justify-center bg-[#ef4444]"
                    >
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </div>

                {/* Label */}
                {!collapsed && (
                  <span
                    className={cn(
                      "text-sm font-semibold whitespace-nowrap tracking-wide",
                      isActive ? "text-white" : "text-[#0F1E3D]"
                    )}
                  >
                    {item.label}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="border-t border-[#0F1E3D]/5 px-3 py-4 space-y-2">
        {!collapsed && user && (
          <div className="px-3 py-2 overflow-hidden">
            <p className="text-sm font-bold text-[#0F1E3D] truncate">
              {user.name}
            </p>
            <p className="text-xs font-medium text-[#0F1E3D]/50 truncate">
              {user.email}
            </p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={cn(
            "flex items-center gap-3.5 w-full px-3 py-3 rounded-xl text-[#0F1E3D]/60 hover:bg-red-50 hover:text-red-600 transition-all font-semibold",
            collapsed && "justify-center"
          )}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && (
            <span className="text-sm whitespace-nowrap">Log out</span>
          )}
        </button>
      </div>
    </aside>
  );
}

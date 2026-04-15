import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Target, CalendarDays, BookOpen, UserPlus, Share2, 
  Lightbulb, Users, Server, MessageSquare, FileText, Wallet, Bell, Settings,
  ChevronRight,
  ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useUnreadNotificationCount, useProfile } from "@/hooks/useAppData";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";

interface NavbarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Navbar({ mobileOpen = false, onMobileClose }: NavbarProps) {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const location = useLocation();
  const isAdmin = profile?.role === 'admin';
  const unreadCount = useUnreadNotificationCount();
  const isMobile = useIsMobile();
  const [activeSegment, setActiveSegment] = useState("MAIN");

  const navGroups = {
    "": [
      { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard", exact: true },
      { name: "Workspace", icon: Target, path: "/workspace", exact: false },
      { name: "Planner", icon: CalendarDays, path: "/planner", exact: false },
      { name: "Bookings", icon: BookOpen, path: "/bookings", exact: false },
    ],
    "ENGINES": [
      { name: "Lead Engine", icon: UserPlus, path: "/lead-engine", exact: false },
      { name: "Social Engine", icon: Share2, path: "/social-engine", exact: false },
      { name: "Brand Brain", icon: Lightbulb, path: "/brand-brain", exact: false },
    ],
    "MANAGEMENT": [
      { name: "Clients", icon: Users, path: "/clients", exact: false },
      { name: "Vault", icon: Server, path: "/vault", exact: false },
      { name: "Messages", icon: MessageSquare, path: "/messages", exact: false },
      { name: "Reports", icon: FileText, path: "/reports", exact: false },
      { name: "Invoices", icon: Wallet, path: "/invoices", exact: false },
    ],
    "SYSTEM": [
      ...(isAdmin ? [{ name: "Executive", icon: ShieldCheck, path: "/executive", exact: false }] : []),
      { name: "Notifications", icon: Bell, path: "/notifications", exact: false },
      { name: "Settings", icon: Settings, path: "/settings", exact: false },
    ]
  };

  const navClass = cn(
    "fixed md:relative inset-y-0 left-0 z-50",
    "w-[260px] md:w-[280px] h-screen",
    "flex flex-col bg-transparent p-4", // Added padding to separate the floating panel gracefully
    "transform transition-transform duration-300 ease-in-out md:translate-x-0 relative",
    !mobileOpen ? "-translate-x-full" : "translate-x-0"
  );

  return (
    <aside className={navClass}>
      {/* Neo-Morphic Floating Panel wrapper */}
      <div className="flex-1 flex flex-col h-full bg-[var(--bg-card)] backdrop-blur-xl rounded-3xl border border-[var(--border-color)] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
        
        {/* Logomark Area */}
        <div className="px-5 pt-4 pb-0 flex items-center justify-center w-full relative shrink-0">
            <img 
              src="/logo.png" 
              alt="TapxMedia" 
              className="w-[140px] md:w-[160px] h-auto object-contain transition-transform duration-500 hover:scale-105 bg-transparent logo-img"
            />
        </div>

        {/* Navigation Content */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4 no-scrollbar">
          {Object.entries(navGroups).map(([groupName, items]) => (
            <div key={groupName} className="relative">
              {groupName && (
                <div className="px-3 mb-1 mt-2">
                  <span className="text-[9px] font-black tracking-[0.25em] text-[#0F1E3D]/30 uppercase relative z-10 bg-transparent px-1 ml-[-4px] rounded-md backdrop-blur-sm">
                    {groupName}
                  </span>
                </div>
              )}
              
              <div className="space-y-0.5">
                {items.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    end={item.exact}
                    onClick={() => {
                      setActiveSegment(groupName);
                      if (isMobile && onMobileClose) onMobileClose();
                    }}
                    className={({ isActive }) => cn(
                      "group relative flex items-center justify-between px-3 py-1.5 rounded-xl transition-all duration-300 overflow-hidden",
                      isActive 
                        ? "bg-gradient-to-r from-[#1E3A8A]/5 to-transparent text-[#1E3A8A] font-semibold" 
                        : "hover:bg-slate-50/80 text-[#0F1E3D]/50 hover:text-[#0F1E3D] font-medium"
                    )}
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center gap-2.5 relative z-10">
                          <div className={cn(
                            "p-1 rounded-lg transition-colors duration-300",
                            isActive ? "bg-white shadow-sm text-[#1E3A8A]" : "text-[#0F1E3D]/40 group-hover:text-[#0F1E3D]"
                          )}>
                            <item.icon className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
                          </div>
                          <span className="text-[12px] tracking-tight">{item.name}</span>
                        </div>
                        
                        {isActive && (
                          <motion.div 
                            layoutId="activePill"
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-3/4 bg-[#1E3A8A] rounded-r-full shadow-[1px_0_8px_rgba(30,58,138,0.4)]"
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                          />
                        )}

                        {/* Unread Badge Support */}
                        {(item.name === "Messages" || item.name === "Notifications") && unreadCount > 0 && (
                          <span className="text-[9px] font-black bg-[#1E3A8A] text-white px-2 py-0.5 rounded-full shadow-md shadow-[#1E3A8A]/20 transform scale-100 transition-transform hover:scale-110">
                            {unreadCount}
                          </span>
                        )}
                        {!isActive && item.name !== "Messages" && item.name !== "Notifications" && (
                          <ChevronRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-40 group-hover:translate-x-0 transition-all duration-300" />
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Premium User Card */}
        <div className="p-2 mt-auto border-t border-[#0F1E3D]/5 bg-transparent backdrop-blur-xl shrink-0">
          <div className="flex items-center gap-3 px-2 py-1.5 hover:bg-white/50 rounded-xl transition-colors cursor-pointer group">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0F1E3D] to-[#1E3A8A] flex flex-col items-center justify-center text-white shadow-md shadow-[#1E3A8A]/10 group-hover:shadow-[#1E3A8A]/30 transition-shadow overflow-hidden">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.full_name || "User"} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[10px] font-black leading-none uppercase">
                    {(profile?.full_name || user?.name || "T")[0]}
                  </span>
                )}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full z-10" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-bold text-[#0F1E3D] truncate tracking-tight">
                {profile?.full_name || user?.name || "tapiwa.makore"}
              </p>
              <p className="text-[9px] uppercase font-black tracking-widest text-[#1E3A8A] truncate">System Admin</p>
            </div>
            <Settings className="w-4 h-4 text-[#0F1E3D]/20 group-hover:text-[#0F1E3D]/50 transition-colors opacity-0 group-hover:opacity-100" />
          </div>
        </div>

      </div>
    </aside>
  );
}

import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Bell, Menu, CheckCheck, LogOut, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications, useMarkAllRead, useProfile } from "@/hooks/useAppData";
import { formatDistanceToNow } from "date-fns";

interface TopBarProps {
  onMobileMenuToggle: () => void;
}

export function TopBar({ onMobileMenuToggle }: TopBarProps) {
  const { user, logout } = useAuth();
  const { data: profile } = useProfile();
  const { data: notifications = [] } = useNotifications();
  const markAllRead = useMarkAllRead();

  const [searchOpen, setSearchOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="h-20 shrink-0 flex items-center justify-between px-6 pt-4 relative z-40 bg-transparent">
      
      {/* Left Area: Mobile Menu & Current Path indicator */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMobileMenuToggle}
          className="md:hidden p-2 -ml-2 text-[#0F1E3D]/60 hover:text-[#0F1E3D] hover:bg-white rounded-xl transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden md:flex flex-col">
           {/* You can inject breadcrumbs here in the future. For now, it stays super clean. */}
        </div>
      </div>

      {/* Right Area: Pilled Tools & Profile */}
      <div className="flex items-center gap-4">

        {/* Global Search Pill */}
        <button
          onClick={() => setSearchOpen(true)}
          className="hidden md:flex items-center gap-3 h-11 px-4 bg-white rounded-full border border-[#0F1E3D]/5 shadow-sm hover:shadow-md hover:border-[#0F1E3D]/10 transition-all text-[#0F1E3D]/40 group"
        >
          <Search className="w-4 h-4 group-hover:text-[#3b82f6] transition-colors" />
          <span className="text-[13px] font-medium tracking-wide">Search anything...</span>
          <div className="ml-4 px-2 py-0.5 rounded bg-[#F4F5F7] border border-[#0F1E3D]/5 text-[10px] font-mono text-[#0F1E3D]/40 shrink-0">
            ⌘K
          </div>
        </button>

        <div className="h-6 w-px bg-[#0F1E3D]/10 hidden md:block mx-1" />

        {/* Notification Bell Pill */}
        <div className="relative">
          <button
            onClick={() => setBellOpen(!bellOpen)}
            className={cn(
              "relative w-11 h-11 flex items-center justify-center rounded-full transition-all duration-300 shadow-sm",
              bellOpen || unreadCount > 0
                ? "bg-white border border-[#0F1E3D]/10 text-[#0F1E3D]"
                : "bg-white/50 border border-transparent text-[#0F1E3D]/40 hover:bg-white hover:text-[#0F1E3D]"
            )}
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
            )}
          </button>

          <AnimatePresence>
            {bellOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 top-full mt-3 w-[360px] bg-white/90 backdrop-blur-3xl rounded-[24px] border border-white shadow-[0_20px_60px_-15px_rgba(15,30,61,0.15)] overflow-hidden"
              >
                <div className="p-5 border-b border-[#0F1E3D]/5 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[#0F1E3D]">Activity Feed</h3>
                    <p className="text-[11px] text-[#0F1E3D]/40 mt-0.5">{unreadCount} unread entries</p>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => markAllRead.mutate()}
                      className="text-[11px] font-semibold text-[#3b82f6] bg-[#3b82f6]/10 px-3 py-1.5 rounded-full hover:bg-[#3b82f6]/20 transition-colors"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                <div className="max-h-[320px] overflow-y-auto p-2 no-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-[#0F1E3D]/40 flex flex-col items-center gap-3">
                      <CheckCheck className="w-6 h-6 opacity-20" />
                      <p className="text-[13px] font-medium">You're all caught up.</p>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={cn(
                          "p-4 rounded-[16px] mb-1 last:mb-0 transition-colors cursor-default",
                          !n.is_read ? "bg-[#F4F5F7]/80" : "hover:bg-[#F4F5F7]/40"
                        )}
                      >
                        <div className="flex gap-4">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex flex-col items-center justify-center shrink-0 border border-white shadow-sm",
                            !n.is_read ? "bg-white text-[#3b82f6]" : "bg-white/50 text-[#0F1E3D]/40"
                          )}>
                            <Bell className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex-1">
                            <p className={cn("text-[13px] leading-tight", !n.is_read ? "font-bold text-[#0F1E3D]" : "font-medium text-[#0F1E3D]/60")}>
                              {n.title || n.message}
                            </p>
                            <p className="text-[11px] text-[#0F1E3D]/40 mt-1.5">
                              {formatDistanceToNow(new Date(n.created_at || new Date()), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile / Settings Dropdown */}
        <div className="relative group">
          <button className="w-11 h-11 bg-white rounded-full border border-[#0F1E3D]/5 shadow-sm hover:shadow-md flex items-center justify-center transition-all overflow-hidden p-1">
            <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#0F1E3D] to-[#1E3A8A] flex flex-col items-center justify-center text-white text-[12px] font-black overflow-hidden relative">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.full_name || "User"} className="w-full h-full object-cover" />
              ) : (
                user?.email?.charAt(0).toUpperCase() || "U"
              )}
            </div>
          </button>
          
          <div className="absolute right-0 top-full mt-2 w-48 bg-white/90 backdrop-blur-3xl border border-white shadow-[0_20px_60px_-15px_rgba(15,30,61,0.15)] rounded-[20px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 p-2 transform origin-top-right scale-95 group-hover:scale-100">
            <Link to="/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold text-[#0F1E3D]/70 hover:bg-[#F4F5F7] hover:text-[#0F1E3D] transition-colors">
               <Settings className="w-4 h-4" /> Preferences
            </Link>
            <div className="h-px bg-[#0F1E3D]/5 my-1 mx-2" />
            <button 
              onClick={async () => { await logout(); window.location.href = "/login"; }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold text-rose-500 hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>

      </div>

      {/* Command Palette Mock Layer */}
      {searchOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-32">
          {/* Overlay */}
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#0F1E3D]/20 backdrop-blur-sm"
            onClick={() => setSearchOpen(false)}
          />
          {/* Modal */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="w-full max-w-2xl bg-white rounded-[24px] shadow-[0_40px_100px_-20px_rgba(15,30,61,0.2)] overflow-hidden relative z-10 border border-[#0F1E3D]/5"
          >
            <div className="flex items-center px-6 py-5 border-b border-[#0F1E3D]/5">
              <Search className="w-5 h-5 text-[#0F1E3D]/40 mr-4" />
              <input 
                autoFocus
                type="text" 
                placeholder="Search clients, invoices, or commands..." 
                className="flex-1 bg-transparent border-none outline-none text-[#0F1E3D] text-[15px] font-medium placeholder:text-[#0F1E3D]/30"
              />
              <div className="px-2 py-1 rounded bg-[#F4F5F7] text-[10px] font-bold text-[#0F1E3D]/40">ESC</div>
            </div>
            <div className="p-2 bg-[#FAFBFC]">
               {/* Quick results */}
               <div className="p-4 text-center text-[#0F1E3D]/30 text-[13px] font-medium">Start typing to see results...</div>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}

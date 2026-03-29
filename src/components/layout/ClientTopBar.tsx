import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Bell, Menu, Search, X } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications, useUnreadMessageCount } from "@/hooks/useAppData";

const routeMap: Record<string, string> = {
  "/client-portal":   "My Portal",
  "/my-files":        "My Files",
  "/my-invoices":     "My Invoices",
  "/client-messages": "Messages",
  "/client-reports":  "My Reports",
};

interface ClientTopBarProps {
  onMobileMenuToggle: () => void;
}

export function ClientTopBar({ onMobileMenuToggle }: ClientTopBarProps) {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const pageName = routeMap[pathname] ?? "Client Portal";
  
  const { data: notifications = [] } = useNotifications();
  const recentNotifs = notifications.slice(0, 5);
  const { data: unreadCount = 0 } = useUnreadMessageCount();

  const [bellOpen, setBellOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const bellRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setBellOpen(false);
      }
    };
    if (bellOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [bellOpen]);

  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : "LS";

  return (
    <header className="glass-header h-14 shrink-0 flex items-center justify-between px-5 md:px-8 z-30">
      {/* Left: hamburger (mobile) + page title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuToggle}
          className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg text-[var(--brand-primary)]/50 hover:bg-[#F8FAFC] hover:text-[var(--brand-primary)] transition-colors border border-transparent hover:border-[#0F1E3D]/10"
        >
          <Menu className="h-4 w-4" />
        </button>
        <div>
          <p className="text-sm font-extrabold text-[var(--brand-primary)] leading-none">{pageName}</p>
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--brand-primary)]/30 mt-0.5">
            Client Portal / {pageName}
          </p>
        </div>
      </div>

      {/* Center: Search Trigger (Desktop) */}
      <div className="hidden md:flex flex-1 max-w-md px-8">
        <button
          onClick={() => setSearchOpen(true)}
          className="w-full flex items-center justify-between px-4 py-2 bg-[#F8FAFC] border border-[#0F1E3D]/5 rounded-xl text-[#0F1E3D]/30 hover:bg-white hover:border-[#0F1E3D]/15 hover:shadow-sm transition-all group"
        >
          <div className="flex items-center gap-2.5">
            <Search className="h-3.5 w-3.5 group-hover:text-[var(--brand-primary)]" />
            <span className="text-[11px] font-bold uppercase tracking-widest">Search portal...</span>
          </div>
          <kbd className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-black bg-white border border-[#0F1E3D]/10">
            <span className="text-[8px] opacity-40">⌘</span>K
          </kbd>
        </button>
      </div>

      {/* Right: bell + avatar */}
      <div className="flex items-center gap-1.5">
        {/* Bell */}
        <div ref={bellRef} className="relative">
          <button
            onClick={() => setBellOpen(!bellOpen)}
            className="relative w-8 h-8 flex items-center justify-center rounded-lg text-[var(--brand-primary)]/40 hover:bg-[#F8FAFC] hover:text-[var(--brand-primary)] transition-colors border border-transparent hover:border-[#0F1E3D]/10"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
            )}
          </button>

          {bellOpen && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-[#0F1E3D]/10 rounded-2xl shadow-xl z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#0F1E3D]/5">
                <span className="text-xs font-black uppercase tracking-widest text-[var(--brand-primary)]">Notifications</span>
              </div>
              {recentNotifs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                  <Bell className="h-7 w-7 text-[var(--brand-primary)] opacity-15 mb-2" />
                  <p className="text-xs font-black uppercase tracking-widest text-[var(--brand-primary)]/40 mb-1">No notifications yet</p>
                  <p className="text-[10px] font-medium text-[var(--brand-primary)]/25">All caught up</p>
                </div>
              ) : (
                <div className="max-h-72 overflow-y-auto">
                    {recentNotifs.map((n) => (
                      <div key={n.id}
                        className={cn(
                          "flex items-start gap-3 px-4 py-3 border-b border-[#0F1E3D]/5 last:border-0 hover:bg-[#F8FAFC] transition-colors cursor-pointer",
                          !n.is_read && "bg-[#F8FAFC]"
                        )}
                      >
                         <div className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0", n.is_read ? "bg-[#0F1E3D]/10" : "bg-rose-500")} />
                         <div className="flex-1 min-w-0">
                           <p className={cn("text-xs leading-snug", n.is_read ? "font-medium text-[var(--brand-primary)]/50" : "font-bold text-[var(--brand-primary)]")}>
                             {n.message ?? "New notification"}
                           </p>
                           <p className="text-[9px] font-medium text-[var(--brand-primary)]/25 mt-1">
                              {n.created_at ? format(new Date(n.created_at), "h:mm a") : "Just now"}
                           </p>
                         </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Avatar */}
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-extrabold shadow-sm ml-1",
          "bg-purple-600 cursor-pointer hover:opacity-90 transition-opacity"
        )}>
          {initials}
        </div>
      </div>

      {/* Search Overlay */}
      <AnimatePresence>
        {searchOpen && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4">
            <div 
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setSearchOpen(false)}
            />
            <div 
              ref={searchRef}
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#0F1E3D]/5 overflow-hidden ring-1 ring-black/5"
            >
              <div className="flex items-center gap-3 px-4 py-4 border-b border-[#0F1E3D]/5">
                <Search className="h-4 w-4 text-[var(--brand-primary)]/40" />
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Quick search (Invoices, Files, Services...)"
                  className="flex-1 bg-transparent border-none outline-none text-sm font-bold text-[var(--brand-primary)] placeholder:text-[#0F1E3D]/25"
                />
                <button 
                  onClick={() => setSearchOpen(false)}
                  className="p-1 px-2 rounded-lg bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[var(--brand-primary)]/40 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto px-2 py-2">
                {searchQuery ? (
                  [
                    { title: "Portal Dashboard", url: "/client-portal", icon: Search },
                    { title: "My Deliverables", url: "/my-files", icon: Search },
                    { title: "Invoices & Billing", url: "/my-invoices", icon: Search },
                    { title: "Messages & Support", url: "/client-messages", icon: Search },
                    { title: "My Reports", url: "/client-reports", icon: Search },
                    { title: "SEO Operations", url: "/services/seo", icon: Search },
                    { title: "Video Systems", url: "/services/video", icon: Search },
                  ].filter(l => l.title.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 ? (
                    [
                      { title: "Portal Dashboard", url: "/client-portal", icon: Search },
                      { title: "My Deliverables", url: "/my-files", icon: Search },
                      { title: "Invoices & Billing", url: "/my-invoices", icon: Search },
                      { title: "Messages & Support", url: "/client-messages", icon: Search },
                      { title: "My Reports", url: "/client-reports", icon: Search },
                      { title: "SEO Operations", url: "/services/seo", icon: Search },
                      { title: "Video Systems", url: "/services/video", icon: Search },
                    ].filter(l => l.title.toLowerCase().includes(searchQuery.toLowerCase())).map((link, i) => (
                       <Link 
                         key={i} 
                         to={link.url}
                         onClick={() => setSearchOpen(false)}
                         className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#F8FAFC] transition-colors"
                       >
                         <div className="w-8 h-8 rounded-lg bg-[#0F1E3D]/5 flex items-center justify-center shrink-0">
                           <Search className="w-3.5 h-3.5 text-[var(--brand-primary)]/40" />
                         </div>
                         <div className="flex-1">
                           <p className="text-xs font-bold text-[var(--brand-primary)]">{link.title}</p>
                           <p className="text-[9px] font-black uppercase tracking-widest text-[var(--brand-primary)]/30 mt-0.5">Route</p>
                         </div>
                       </Link>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center py-8">
                      <p className="text-xs font-black uppercase tracking-widest text-[var(--brand-primary)]/25 mb-1">No results found</p>
                    </div>
                  )
                ) : (
                  <div className="flex flex-col items-center justify-center text-center py-8 opacity-25">
                     <Search className="h-6 w-6 mb-2" />
                     <p className="text-xs font-black uppercase tracking-widest">Search anything...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
}

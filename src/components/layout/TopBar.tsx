import { useState, useEffect, useRef } from "react";
import { useLocation, Link } from "react-router-dom";
import { Search, Bell, Menu, X, CheckCheck, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications, useMarkAllRead } from "@/hooks/useAppData";
import { formatDistanceToNow } from "date-fns";

const routeMap: Record<string, string> = {
  "/dashboard":     "Dashboard",
  "/workspace":     "Workspace",
  "/planner":       "Planner",
  "/bookings":      "Bookings",
  "/clients":       "Clients",
  "/vault":         "Vault",
  "/messages":      "Messages",
  "/reports":       "Reports",
  "/invoices":      "Invoices",
  "/notifications": "Notifications",
  "/settings":      "Settings",
  "/client-portal": "Client Portal",
  "/my-files":      "My Files",
  "/my-invoices":   "My Invoices",
  "/client-messages": "Messages",
  "/client-reports": "Reports",
};

interface TopBarProps {
  onMobileMenuToggle: () => void;
}

export function TopBar({ onMobileMenuToggle }: TopBarProps) {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const pageName = routeMap[pathname] ?? "TapxHub";

  const [searchOpen, setSearchOpen]     = useState(false);
  const [searchQuery, setSearchQuery]   = useState("");
  const [bellOpen, setBellOpen]         = useState(false);
  const searchInputRef                  = useRef<HTMLInputElement>(null);
  const bellRef                         = useRef<HTMLDivElement>(null);

  const { data: notifications = [] } = useNotifications();
  const markAllRead = useMarkAllRead();
  const unread = notifications.filter((n) => !n.is_read).length;
  const recentNotifs = notifications.slice(0, 5);

  // Open search overlay on Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setBellOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Focus input when search opens
  useEffect(() => {
    if (searchOpen) setTimeout(() => searchInputRef.current?.focus(), 50);
  }, [searchOpen]);

  // Close bell dropdown when clicking outside
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
    : "TM";

  return (
    <>
      <header className="h-14 shrink-0 flex items-center justify-between px-5 md:px-8 bg-white border-b border-[#0F1E3D]/5 z-30 relative">
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
              TapxHub / {pageName}
            </p>
          </div>
        </div>

        {/* Right: search, bell, avatar */}
        <div className="flex items-center gap-1.5">
          {/* Search button */}
          <button
            onClick={() => setSearchOpen(true)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--brand-primary)]/40 hover:bg-[#F8FAFC] hover:text-[var(--brand-primary)] transition-colors border border-transparent hover:border-[#0F1E3D]/10"
          >
            <Search className="h-4 w-4" />
          </button>

          {/* Bell */}
          <div ref={bellRef} className="relative">
            <button
              onClick={() => setBellOpen(!bellOpen)}
              className="relative w-8 h-8 flex items-center justify-center rounded-lg text-[var(--brand-primary)]/40 hover:bg-[#F8FAFC] hover:text-[var(--brand-primary)] transition-colors border border-transparent hover:border-[#0F1E3D]/10"
            >
              <Bell className="h-4 w-4" />
              {unread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[1rem] px-0.5 rounded-full text-[9px] font-black text-white flex items-center justify-center bg-rose-500 leading-none">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </button>

            {/* Bell dropdown */}
            {bellOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-[#0F1E3D]/10 rounded-2xl shadow-xl z-50 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#0F1E3D]/5">
                  <span className="text-xs font-black uppercase tracking-widest text-[var(--brand-primary)]">Notifications</span>
                  {unread > 0 && (
                    <button
                      onClick={() => { markAllRead.mutate(); setBellOpen(false); }}
                      className="flex items-center gap-1 text-[10px] font-bold text-[#1E3A8A] hover:text-[#0F1E3D] transition-colors"
                    >
                      <CheckCheck className="h-3 w-3" /> Mark all read
                    </button>
                  )}
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
                          {n.created_at && (
                            <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--brand-primary)]/25 mt-0.5">
                              {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="px-4 py-2.5 border-t border-[#0F1E3D]/5">
                  <Link to="/notifications" onClick={() => setBellOpen(false)}
                    className="text-[10px] font-black uppercase tracking-widest text-[#1E3A8A] hover:text-[#0F1E3D] transition-colors">
                    View all notifications →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Avatar with Dropdown */}
          <div className="relative group ml-1">
            <div className="w-8 h-8 rounded-full bg-[#0F1E3D] flex items-center justify-center text-white text-[10px] font-extrabold shadow-sm cursor-pointer hover:opacity-90 transition-opacity">
              {initials}
            </div>
            {/* Dropdown menu */}
            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-[#0F1E3D]/10 rounded-xl shadow-xl z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
               <div className="p-3 border-b border-[#0F1E3D]/5">
                 <p className="text-xs font-bold text-[#0F1E3D] truncate">{user?.name || 'User'}</p>
                 <p className="text-[10px] text-[#0F1E3D]/40 font-medium truncate">{user?.email}</p>
               </div>
               <div className="p-1">
                 <button 
                   onClick={async () => {
                     await logout();
                     window.location.href = "/login";
                   }}
                   className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                 >
                   <LogOut className="h-3 w-3" />
                   Log Out
                 </button>
               </div>
            </div>
          </div>
        </div>
      </header>

      {/* Command palette overlay */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-start justify-center pt-[15vh] px-4"
          onClick={() => setSearchOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-[#0F1E3D]/20 backdrop-blur-sm" />

          {/* Palette */}
          <div
            className="relative w-full max-w-lg bg-white border border-[#0F1E3D]/10 rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#0F1E3D]/5">
              <Search className="h-4 w-4 text-[var(--brand-primary)]/40 shrink-0" />
              <input
                ref={searchInputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search TapxHub..."
                className="flex-1 text-sm font-medium text-[var(--brand-primary)] placeholder:text-[#0F1E3D]/30 focus:outline-none bg-transparent"
              />
              <button onClick={() => setSearchOpen(false)}
                className="w-6 h-6 rounded-lg flex items-center justify-center text-[var(--brand-primary)]/30 hover:bg-[#F8FAFC] hover:text-[var(--brand-primary)] transition-colors">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto px-2 py-2">
              {searchQuery ? (
                [
                  { title: "Dashboard Overview", url: "/dashboard", icon: Menu },
                  { title: "Workspace & Projects", url: "/workspace", icon: Menu },
                  { title: "Client Portal", url: "/client-portal", icon: Menu },
                  { title: "File Vault", url: "/vault", icon: Menu },
                  { title: "Invoices & Billing", url: "/invoices", icon: Menu },
                  { title: "Messages & Chat", url: "/messages", icon: Menu },
                  { title: "Reports", url: "/reports", icon: Menu },
                ].filter(l => l.title.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 ? (
                  [
                    { title: "Dashboard Overview", url: "/dashboard", icon: Menu },
                    { title: "Workspace & Projects", url: "/workspace", icon: Menu },
                    { title: "Client Portal", url: "/client-portal", icon: Menu },
                    { title: "File Vault", url: "/vault", icon: Menu },
                    { title: "Invoices & Billing", url: "/invoices", icon: Menu },
                    { title: "Messages & Chat", url: "/messages", icon: Menu },
                    { title: "Reports", url: "/reports", icon: Menu },
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
                         <p className="text-[9px] font-black uppercase tracking-widest text-[var(--brand-primary)]/30 mt-0.5">Navigation Route</p>
                       </div>
                     </Link>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center text-center py-8">
                    <p className="text-xs font-black uppercase tracking-widest text-[var(--brand-primary)]/25 mb-1">
                      No results found
                    </p>
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-8">
                  <p className="text-xs font-black uppercase tracking-widest text-[var(--brand-primary)]/25 mb-1">
                    Start typing to search
                  </p>
                  <p className="text-[10px] font-medium text-[var(--brand-primary)]/20">
                    Press <kbd className="px-1.5 py-0.5 rounded text-[9px] font-black bg-[#F8FAFC] border border-[#0F1E3D]/10">ESC</kbd> to close
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

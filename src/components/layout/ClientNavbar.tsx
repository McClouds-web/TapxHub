import { useState } from "react";
import { NavLink, useNavigate, Link } from "react-router-dom";
import {
  Home,
  Folder,
  FileText,
  MessageSquare,
  BarChart2,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Layers,
  Share2,
  Brain,
  Library
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUnreadMessageCount } from "@/hooks/useAppData";

const clientNavItems = [
  { to: "/client-portal",  label: "My Portal",   icon: Home,          end: true },
  { to: "/my-files",       label: "My Files",    icon: Folder },
  { to: "/my-invoices",    label: "My Invoices", icon: FileText },
  { to: "/services",       label: "My Services", icon: Layers },
  { to: "/social-engine",  label: "Social Engine",icon: Share2 },
  { to: "/brand-brain",    label: "Brand Brain", icon: Brain },
  { to: "/resource-library",label: "Resources",   icon: Library },
  { to: "/client-messages",label: "Messages",    icon: MessageSquare },
  { to: "/client-reports", label: "My Reports",  icon: BarChart2 },
];

interface ClientNavbarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function ClientNavbar({ mobileOpen = false, onMobileClose }: ClientNavbarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(false);
  const { data: unreadCount = 0 } = useUnreadMessageCount();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : "LS";

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
        isMobile ? "fixed top-0 left-0 shrink-0" : "relative shrink-0",
        isMobile && !mobileOpen && "-translate-x-full"
      )}
    >
      {/* Logo + Client Portal label */}
      <div className="flex flex-col items-center justify-center py-7 px-4 border-b border-[#0F1E3D]/5 relative">
        <Link to="/portal" className="flex items-center justify-center w-full">
          <img
            src="/logo.png"
            alt="TapxMedia"
            className={cn(
              "object-contain shrink-0 transition-all duration-300",
              collapsed ? "w-8 h-8" : "h-14 w-auto max-w-[150px]"
            )}
          />
        </Link>
        {!collapsed && (
          <span className="mt-2 text-[9px] font-black uppercase tracking-[0.2em] text-[#0F1E3D]/30">
            Client Portal
          </span>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-[30px] z-50 h-6 w-6 rounded-full bg-white border border-[#0F1E3D]/10 flex items-center justify-center text-[#0F1E3D]/50 hover:text-[#0F1E3D] hover:border-[#0F1E3D]/30 transition-all shadow-sm"
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-hidden">
        {clientNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => isMobile && onMobileClose?.()}
            className={({ isActive }) =>
              cn(
                "relative flex items-center gap-3.5 px-3 py-3 rounded-xl overflow-hidden transition-all duration-300",
                collapsed ? "justify-center" : "",
                isActive
                  ? "bg-[#0F1E3D] text-white shadow-md shadow-[#0F1E3D]/10"
                  : "text-[#0F1E3D]/60 hover:bg-[#F1F5F9] hover:text-[#0F1E3D]"
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && (
                  <span className={cn(
                    "text-sm font-semibold whitespace-nowrap tracking-wide flex-1",
                    isActive ? "text-white" : "text-[#0F1E3D]"
                  )}>
                    {item.label}
                  </span>
                )}
                {item.label === "Messages" && unreadCount > 0 && (
                  <span className={cn(
                    "px-1.5 py-0.5 rounded-full text-[10px] font-black min-w-[18px] text-center",
                    isActive ? "bg-white text-[#0F1E3D]" : "bg-rose-500 text-white"
                  )}>
                    {unreadCount}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Client info + logout */}
      <div className="border-t border-[#0F1E3D]/5 px-3 py-4 space-y-2">
        {!collapsed && user && (
          <div className="px-3 py-2 flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-[#0F1E3D] flex items-center justify-center text-white text-[10px] font-extrabold shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-[#0F1E3D] truncate">{user.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[9px] font-black uppercase tracking-widest bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded-full">Client</span>
              </div>
            </div>
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
          {!collapsed && <span className="text-sm whitespace-nowrap">Log out</span>}
        </button>
      </div>
    </aside>
  );
}

import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { TopBar } from "./TopBar";
import { useRealtimeSync } from "@/hooks/useAppData";

function RealtimeSync() {
  useRealtimeSync();
  return null;
}

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden text-[#0F1E3D] selection:bg-[#3b82f6]/20 relative font-sans" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <RealtimeSync />

      {/* Mobile sidebar backdrop with soft blur */}
      {mobileOpen && (
        <div
          className="fixed inset-0 backdrop-blur-md z-40 md:hidden opacity-80"
          style={{ backgroundColor: 'var(--bg-secondary)' }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* The main application canvas sits below the floating modules */}
      <div className="absolute inset-0 z-0 pointer-events-none" style={{ background: 'linear-gradient(to bottom right, var(--bg-secondary), var(--bg-tertiary))' }} />

      <Navbar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      <main className="flex-1 overflow-hidden relative z-10 w-full h-full flex flex-col pt-2 pr-2 pb-2 pl-0 bg-transparent">
        <TopBar onMobileMenuToggle={() => setMobileOpen(!mobileOpen)} />
        <div className="flex-1 min-h-0 overflow-hidden relative mt-2 mr-2 bg-transparent rounded-bl-3xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

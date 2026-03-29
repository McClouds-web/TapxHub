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
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC] text-[#0F1E3D] selection:bg-[#1E3A8A]/10 relative">
      <RealtimeSync />

      {/* Mobile sidebar backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-[#0F1E3D]/30 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <Navbar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      <main className="flex-1 overflow-hidden relative z-10 w-full h-full flex flex-col bg-[#F8FAFC]">
        <TopBar onMobileMenuToggle={() => setMobileOpen(!mobileOpen)} />
        <div className="flex-1 min-h-0 overflow-hidden">
          <div className="w-full h-full flex flex-col min-h-0 px-6 py-6 md:px-8 md:py-8 overflow-hidden mx-auto max-w-[1600px]">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}

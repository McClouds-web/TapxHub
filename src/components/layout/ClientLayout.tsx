import { useState } from"react";
import { Outlet } from"react-router-dom";
import { ClientNavbar } from"./ClientNavbar";
import { ClientTopBar } from"./ClientTopBar";
import FloatingChatWidget from"@/components/chatbot/FloatingChatWidget";
import { BlurBackground } from"./BlurBackground";

export function ClientLayout() {
 const [mobileOpen, setMobileOpen] = useState(false);

 return (
 <div className="flex h-screen overflow-hidden bg-[#F8FAFC] text-[#0F1E3D] selection:bg-[#1E3A8A]/10 relative">
 <BlurBackground />
 {/* Mobile sidebar backdrop */}
 {mobileOpen && (
 <div
 className="fixed inset-0 bg-[#0F1E3D]/30 backdrop-blur-sm z-40 md:hidden"
 onClick={() => setMobileOpen(false)}
 />
 )}

 <ClientNavbar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

 <main className="flex-1 overflow-hidden relative z-10 w-full h-full flex flex-col bg-[#F8FAFC]">
 <ClientTopBar onMobileMenuToggle={() => setMobileOpen(!mobileOpen)} />
 <div className="flex-1 min-h-0 overflow-y-auto scroll-smooth">
 <div className="w-full min-h-full flex flex-col px-4 py-6 md:px-6 md:py-10 mx-auto max-w-[1600px]">
 <Outlet />
 </div>
 </div>
 </main>
 
 <FloatingChatWidget />
 </div>
 );
}

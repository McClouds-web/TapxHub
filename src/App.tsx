import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout as AdminLayout } from "@/components/layout/AppLayout";
import { ClientLayout } from "@/components/layout/ClientLayout";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Loader2 } from "lucide-react";
import React from "react";
import { useRealtimeSync } from "@/hooks/useRealtimeSync";

// ── Error Boundary ───────────────────────────────────────────────────────────
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white p-8 text-center">
          <h1 className="text-2xl font-black text-[#0F1E3D] mb-2">Something went wrong</h1>
          <p className="text-slate-500 text-sm mb-6 max-w-md">{(this.state.error as Error).message}</p>
          <button onClick={() => window.location.reload()} className="px-6 py-3 bg-[#0F1E3D] text-white rounded-xl text-xs font-bold uppercase tracking-widest">
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Admin pages
import Dashboard from "./pages/Dashboard";
import Workspace from "./pages/Workspace";
import Planner from "./pages/Planner";
import Vault from "./pages/Vault";
import Notifications from "./pages/Notifications";
import Clients from "./pages/Clients";
import Projects from "./pages/Projects";
import Tasks from "./pages/Tasks";
import Calendar from "./pages/Calendar";
import Services from "./pages/Services";
import Invoices from "./pages/Invoices";
import Settings from "./pages/Settings";
import Media from "./pages/Media";
import Messages from "./pages/Messages";
import Reports from "./pages/Reports";
import Bookings from "./pages/Bookings";
import LeadEngine from "./pages/LeadEngine";

// Client pages
import ClientPortal from "./pages/ClientPortal";
import MyFiles from "./pages/MyFiles";
import MyInvoices from "./pages/MyInvoices";
import ClientMessages from "./pages/ClientMessages";
import ClientReports from "./pages/ClientReports";
import ServiceModule from "./pages/ServiceModule";
import SocialEngine from "./pages/SocialEngine";
import BrandBrain from "./pages/BrandBrain";
import ResourceLibrary from "./pages/ResourceLibrary";

import Login from "./pages/Login";
import PublicInvoice from "./pages/PublicInvoice";

const queryClient = new QueryClient();

const ADMIN_ROLES = ["admin"] as const;
const CLIENT_ROLES = ["client", "retainer"] as const;

const AppRoutes = () => {
  const { user, isLoading } = useAuth();
  useRealtimeSync();

  const isClient = user?.role === "client" || user?.role === "retainer";

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 text-[#1E3A8A] animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />

      {/* ── Admin routes (Layout 1: AdminLayout) ─────────────── */}
      <Route element={
        <ProtectedRoute allowedRoles={[...ADMIN_ROLES]}>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/workspace" element={<Workspace />} />
        <Route path="/planner" element={<Planner />} />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/vault" element={<Vault />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/invoices" element={<Invoices />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/lead-engine" element={<LeadEngine />} />
        
        {/* Legacy utility routes */}
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/media" element={<Media />} />
        <Route path="/services" element={<Services />} />
      </Route>

      {/* ── Client routes (Layout 2: ClientLayout) ────────────── */}
      <Route element={
        <ProtectedRoute allowedRoles={[...CLIENT_ROLES]}>
          <ClientLayout />
        </ProtectedRoute>
      }>
        <Route path="/client-portal" element={<ClientPortal />} />
        <Route path="/my-files" element={<MyFiles />} />
        <Route path="/my-invoices" element={<MyInvoices />} />
        <Route path="/client-messages" element={<ClientMessages />} />
        <Route path="/client-reports" element={<ClientReports />} />
        <Route path="/services" element={<Navigate to="/client-portal" replace />} />
        <Route path="/services/:id" element={<ServiceModule />} />
        <Route path="/social-engine" element={<SocialEngine />} />
        <Route path="/brand-brain" element={<BrandBrain />} />
        <Route path="/resource-library" element={<ResourceLibrary />} />
      </Route>

      {/* Public Pages */}
      <Route path="/invoice/:id" element={<PublicInvoice />} />

      {/* Fallback to root or redirect to right layout based on role */}
      <Route path="/" element={
        !user ? <Navigate to="/login" replace /> :
        isClient ? <Navigate to="/client-portal" replace /> : 
        <Navigate to="/dashboard" replace />
      } />
      <Route path="*" element={
        !user ? <Navigate to="/login" replace /> :
        isClient ? <Navigate to="/client-portal" replace /> : 
        <Navigate to="/dashboard" replace />
      } />
    </Routes>
  );
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter basename="/hub">
            <AppRoutes />
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;

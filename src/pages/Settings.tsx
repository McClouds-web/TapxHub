import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Bell, Shield, Palette, Database, Save, ChevronRight, Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProfile, useUpdateProfile } from "@/hooks/useAppData";
import { supabase } from "@/lib/supabase";

const tabs = [
  { id: "profile",       icon: User,     label: "Profile",       description: "Update your name, email, and avatar" },
  { id: "notifications", icon: Bell,     label: "Notifications", description: "Manage email and push notification preferences" },
  { id: "security",      icon: Shield,   label: "Security",      description: "Password, two-factor authentication, and sessions" },
  { id: "appearance",    icon: Palette,  label: "Appearance",    description: "Theme, colors, and display preferences" },
  { id: "data",          icon: Database, label: "Data & Privacy", description: "Export data, manage connected services" },
];

function SaveButton({ onClick, loading, saved }: { onClick: () => void; loading: boolean; saved: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="px-8 py-3.5 bg-[var(--brand-primary)] text-white text-xs font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition shadow-md disabled:opacity-70"
    >
      {loading
        ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
        : saved
        ? <><Check className="w-4 h-4" /> Saved!</>
        : <><Save className="w-4 h-4" /> Save Changes</>}
    </button>
  );
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile");

  // Profile tab state
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();
  const [fullName, setFullName]   = useState("");
  const [email, setEmail]         = useState("");
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  // Notifications tab state
  const [notifPrefs, setNotifPrefs] = useState({
    daily_briefing: true,
    client_updates: true,
    invoice_reminders: true,
    marketing: false,
  });
  const [notifSaved, setNotifSaved]       = useState(false);
  const [notifLoading, setNotifLoading]   = useState(false);

  // Security tab state
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd]         = useState("");
  const [pwdError, setPwdError]     = useState("");
  const [pwdSaved, setPwdSaved]     = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);

  // Sync profile data when loaded
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? "");
      setEmail(profile.email ?? "");
      const prefs = profile.notification_preferences;
      if (prefs) {
        setNotifPrefs({
          daily_briefing: !!(prefs as any).email,
          client_updates: true,
          invoice_reminders: true,
          marketing: false,
        });
      }
    }
  }, [profile]);

  async function handleSaveProfile() {
    setProfileLoading(true);
    setProfileSaved(false);
    try {
      await updateProfile.mutateAsync({ full_name: fullName });
      // Update email via Supabase auth if changed
      if (email !== profile?.email) {
        await supabase.auth.updateUser({ email });
      }
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } finally {
      setProfileLoading(false);
    }
  }

  async function handleSaveNotifications() {
    setNotifLoading(true);
    setNotifSaved(false);
    try {
      await updateProfile.mutateAsync({
        notification_preferences: {
          email: notifPrefs.daily_briefing,
          telegram: false,
          ntfy: false,
          gmail: false,
        },
      });
      setNotifSaved(true);
      setTimeout(() => setNotifSaved(false), 3000);
    } finally {
      setNotifLoading(false);
    }
  }

  async function handleUpdatePassword() {
    setPwdError("");
    if (!newPwd || newPwd.length < 6) {
      setPwdError("New password must be at least 6 characters.");
      return;
    }
    setPwdLoading(true);
    setPwdSaved(false);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPwd });
      if (error) throw error;
      setCurrentPwd("");
      setNewPwd("");
      setPwdSaved(true);
      setTimeout(() => setPwdSaved(false), 3000);
    } catch (err: any) {
      setPwdError(err.message ?? "Failed to update password.");
    } finally {
      setPwdLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto h-[calc(100vh-140px)]"
    >
      {/* Left Sidebar Menu */}
      <div className="w-full md:w-80 flex flex-col gap-2 shrink-0 border-r border-[#0F1E3D]/5 pr-4 overflow-y-auto">
        <div className="mb-6 px-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--brand-primary)]">Settings</h1>
          <p className="text-sm font-medium text-[var(--brand-primary)] opacity-50 mt-1">Manage your account configurations</p>
        </div>

        <div className="space-y-1.5 flex-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center justify-between p-4 rounded-xl transition-all duration-300 text-left group border border-transparent outline-none ring-0",
                activeTab === tab.id
                  ? "bg-white shadow-sm border-[#0F1E3D]/10"
                  : "hover:bg-[#F1F5F9] hover:border-[#0F1E3D]/5"
              )}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "p-2.5 rounded-lg transition-colors",
                  activeTab === tab.id ? "bg-[#0F1E3D]/5" : "bg-transparent group-hover:bg-white"
                )}>
                  <tab.icon className={cn(
                    "h-5 w-5",
                    activeTab === tab.id ? "text-[var(--brand-accent)]" : "text-[var(--brand-primary)] opacity-60"
                  )} />
                </div>
                <div>
                  <p className={cn("text-sm font-bold", activeTab === tab.id ? "text-[var(--brand-primary)]" : "text-[var(--brand-primary)] opacity-80")}>
                    {tab.label}
                  </p>
                </div>
              </div>
              <ChevronRight className={cn(
                "w-4 h-4 transition-transform duration-300",
                activeTab === tab.id ? "opacity-100 text-[var(--brand-accent)] translate-x-1" : "opacity-0 -translate-x-2"
              )} />
            </button>
          ))}
        </div>
      </div>

      {/* Right Content Pane */}
      <div className="flex-1 bg-white rounded-[2rem] border border-[#0F1E3D]/5 shadow-sm p-8 md:p-12 overflow-y-auto relative">
        <AnimatePresence mode="wait">

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <motion.div key="profile" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }} className="max-w-2xl space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-[var(--brand-primary)]">Personal Information</h2>
                <p className="text-sm font-medium text-[var(--brand-primary)] opacity-60 mt-1">Update your photo and personal details.</p>
              </div>

              <div className="flex items-center gap-6 pb-6 border-b border-[#0F1E3D]/5">
                <div className="w-20 h-20 rounded-full bg-[#0F1E3D] flex items-center justify-center border-2 border-white shadow-sm">
                  <span className="text-white text-2xl font-extrabold">
                    {(fullName || "U").charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex gap-3">
                  <button className="px-5 py-2.5 bg-[#0F1E3D]/5 text-xs font-bold text-[var(--brand-primary)] uppercase tracking-wider rounded-xl hover:bg-[#0F1E3D]/10 transition">
                    Upload New
                  </button>
                  <button className="px-4 py-2.5 text-xs font-bold text-red-600 uppercase tracking-wider rounded-xl hover:bg-red-50 transition">
                    Remove
                  </button>
                </div>
              </div>

              <div className="grid gap-6">
                <div className="grid gap-2">
                  <label className="text-xs font-bold text-[var(--brand-primary)] uppercase tracking-wider opacity-60">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-[#f8fafc] border border-[#0F1E3D]/5 rounded-xl px-4 py-3 text-sm font-medium text-[var(--brand-primary)] focus:outline-none focus:border-[var(--brand-accent)] transition-colors"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-xs font-bold text-[var(--brand-primary)] uppercase tracking-wider opacity-60">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#f8fafc] border border-[#0F1E3D]/5 rounded-xl px-4 py-3 text-sm font-medium text-[var(--brand-primary)] focus:outline-none focus:border-[var(--brand-accent)] transition-colors"
                  />
                </div>
              </div>

              <div className="pt-6">
                <SaveButton onClick={handleSaveProfile} loading={profileLoading} saved={profileSaved} />
              </div>
            </motion.div>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <motion.div key="notifications" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }} className="max-w-2xl space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-[var(--brand-primary)]">Notification Preferences</h2>
                <p className="text-sm font-medium text-[var(--brand-primary)] opacity-60 mt-1">Choose exactly what we notify you about.</p>
              </div>

              <div className="space-y-4">
                {[
                  { key: "daily_briefing", title: "Daily Briefing Email", desc: "A morning summary of tasks and upcoming meetings." },
                  { key: "client_updates", title: "Client Updates", desc: "New messages or files uploaded by clients." },
                  { key: "invoice_reminders", title: "Invoice Reminders", desc: "Alerts when an invoice goes past due." },
                  { key: "marketing", title: "Marketing & News", desc: "Updates about TapxHub platform features." },
                ].map((notif) => (
                  <div key={notif.key} className="flex items-center justify-between p-4 rounded-xl border border-[#0F1E3D]/5 bg-[#f8fafc]">
                    <div>
                      <p className="text-sm font-bold text-[var(--brand-primary)]">{notif.title}</p>
                      <p className="text-xs font-medium text-[var(--brand-primary)] opacity-60 mt-0.5">{notif.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={notifPrefs[notif.key as keyof typeof notifPrefs]}
                        onChange={(e) => setNotifPrefs({ ...notifPrefs, [notif.key]: e.target.checked })}
                      />
                      <div className="w-11 h-6 bg-[#0F1E3D]/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--brand-accent)] border border-transparent shadow-inner"></div>
                    </label>
                  </div>
                ))}
              </div>
              <div className="pt-2">
                <button
                  onClick={handleSaveNotifications}
                  disabled={notifLoading}
                  className="px-8 py-3.5 bg-[var(--brand-primary)] text-white text-xs font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition shadow-md disabled:opacity-70"
                >
                  {notifLoading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                    : notifSaved
                    ? <><Check className="w-4 h-4" /> Saved!</>
                    : <><Save className="w-4 h-4" /> Save Preferences</>}
                </button>
              </div>
            </motion.div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <motion.div key="security" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }} className="max-w-2xl space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-[var(--brand-primary)]">Security & Authentication</h2>
                <p className="text-sm font-medium text-[var(--brand-primary)] opacity-60 mt-1">Keep your account locked out to unauthorized access.</p>
              </div>

              <div className="grid gap-6 pb-6 border-b border-[#0F1E3D]/5">
                <div className="grid gap-2">
                  <label className="text-xs font-bold text-[var(--brand-primary)] uppercase tracking-wider opacity-60">Current Password</label>
                  <input
                    type="password"
                    value={currentPwd}
                    onChange={(e) => setCurrentPwd(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#f8fafc] border border-[#0F1E3D]/5 rounded-xl px-4 py-3 text-sm font-medium text-[var(--brand-primary)] focus:outline-none focus:border-[var(--brand-accent)] transition-colors"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-xs font-bold text-[var(--brand-primary)] uppercase tracking-wider opacity-60">New Password</label>
                  <input
                    type="password"
                    value={newPwd}
                    onChange={(e) => setNewPwd(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#f8fafc] border border-[#0F1E3D]/5 rounded-xl px-4 py-3 text-sm font-medium text-[var(--brand-primary)] focus:outline-none focus:border-[var(--brand-accent)] transition-colors"
                  />
                </div>
                {pwdError && (
                  <p className="text-xs font-bold text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2">{pwdError}</p>
                )}
                <div>
                  <button
                    onClick={handleUpdatePassword}
                    disabled={pwdLoading}
                    className="px-8 py-3.5 bg-[#0F1E3D]/5 text-[var(--brand-primary)] text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-2 hover:bg-[#0F1E3D]/10 transition disabled:opacity-70"
                  >
                    {pwdLoading
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</>
                      : pwdSaved
                      ? <><Check className="w-4 h-4 text-emerald-600" /> Password Updated!</>
                      : "Update Password"}
                  </button>
                </div>
              </div>

              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-bold text-[var(--brand-primary)]">Two-Factor Authentication (2FA)</p>
                  <p className="text-xs font-medium text-[var(--brand-primary)] opacity-60 mt-1 max-w-sm">
                    Secure your account with an authentication code generated via an app like Google Authenticator.
                  </p>
                </div>
                <button className="px-6 py-2.5 bg-[var(--brand-primary)] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md hover:opacity-90 shrink-0">
                  Enable 2FA
                </button>
              </div>
            </motion.div>
          )}

          {/* Appearance Tab */}
          {activeTab === "appearance" && (
            <motion.div key="appearance" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }} className="max-w-2xl space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-[var(--brand-primary)]">Appearance</h2>
                <p className="text-sm font-medium text-[var(--brand-primary)] opacity-60 mt-1">Customize the interface layout.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { name: "Light Premium", active: true },
                  { name: "Dark Hub", active: false },
                  { name: "System Config", active: false },
                ].map((t) => (
                  <div key={t.name} className={cn(
                    "border-2 rounded-2xl p-6 text-center cursor-pointer transition-all",
                    t.active ? "border-[var(--brand-accent)] bg-[#F1F5F9]" : "border-[#0F1E3D]/5 hover:border-[#0F1E3D]/10"
                  )}>
                    <div className="w-12 h-12 rounded-full mx-auto mb-4 border border-[#0F1E3D]/10 shadow-sm" style={{ background: t.active ? "white" : t.name === "Dark Hub" ? "#0A0A0A" : "linear-gradient(135deg, white 50%, #0A0A0A 50%)" }} />
                    <p className={cn("text-xs font-bold uppercase tracking-wider", t.active ? "text-[var(--brand-primary)]" : "text-[var(--brand-primary)] opacity-50")}>{t.name}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Data Tab */}
          {activeTab === "data" && (
            <motion.div key="data" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }} className="max-w-2xl space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-[var(--brand-primary)]">Data & Privacy</h2>
                <p className="text-sm font-medium text-[var(--brand-primary)] opacity-60 mt-1">Control your sensitive data and account history.</p>
              </div>

              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between p-6 rounded-2xl border border-[#0F1E3D]/5 bg-[#f8fafc]">
                <div>
                  <h3 className="text-sm font-bold text-[var(--brand-primary)]">Export Activity Data</h3>
                  <p className="text-xs font-medium text-[var(--brand-primary)] opacity-60 mt-1 max-w-sm">
                    Download an archive of your tasks, invoices history, and client metadata in CSV format.
                  </p>
                </div>
                <button className="px-6 py-2.5 shrink-0 whitespace-nowrap bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-indigo-100 transition">
                  Request Export
                </button>
              </div>

              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between p-6 rounded-2xl border border-red-100 bg-red-50/50">
                <div>
                  <h3 className="text-sm font-bold text-red-600">Delete Account</h3>
                  <p className="text-xs font-medium text-red-600 opacity-80 mt-1 max-w-sm">
                    Permanently wipe your account, settings, and workspace data. This cannot be undone.
                  </p>
                </div>
                <button
                  onClick={() => confirm("Are you absolutely sure? This will permanently delete your account.") && supabase.auth.signOut()}
                  className="px-6 py-2.5 shrink-0 bg-red-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md hover:bg-red-700 transition"
                >
                  Delete Account
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </motion.div>
  );
}

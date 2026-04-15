import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Bell, Shield, Palette, Database, Save, ChevronRight, Loader2, Check, Moon, Sun, Monitor, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProfile, useUpdateProfile } from "@/hooks/useAppData";
import { supabase } from "@/lib/supabase";
import { useTheme, type Theme } from "@/contexts/ThemeContext";
import { uploadPublicFile } from "@/lib/storage";
import { toast } from "sonner";

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
      className="px-6 py-3.5 bg-[var(--brand-primary)] text-white text-[10px] font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition shadow-md disabled:opacity-70"
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
  const { theme, resolvedTheme, setTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile tab state
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();
  const [fullName, setFullName]   = useState("");
  const [email, setEmail]         = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

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

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const bucketToUse = localStorage.getItem('supabase_bucket_override') || 'vault';

    const file = e.target.files?.[0];
    if (!file) return;
    setProfileLoading(true);
    try {
      const { url } = await uploadPublicFile(file, 'avatars', bucketToUse);
      console.log("Uploaded Avatar URL:", url);
      await updateProfile.mutateAsync({ avatar_url: url });
      toast.success("Avatar updated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload avatar");
    } finally {
      setProfileLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleRemoveAvatar() {
    if (!profile?.avatar_url) return;
    setProfileLoading(true);
    try {
      await updateProfile.mutateAsync({ avatar_url: "" });
      toast.success("Avatar removed");
    } catch (err) {
      toast.error("Failed to remove avatar");
    } finally {
      setProfileLoading(false);
    }
  }

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
      className="flex flex-col md:flex-row gap-5 max-w-6xl mx-auto h-[calc(100vh-140px)]"
    >
      {/* Left Sidebar Menu */}
      <div className="w-full md:w-80 flex flex-col gap-2 shrink-0 border-r border-[#0F1E3D]/5 pr-4 overflow-y-auto">
        <div className="mb-4 px-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--brand-primary)]">Settings</h1>
          <p className="text-[10px] font-medium text-[var(--brand-primary)] opacity-50 mt-1">Manage your account configurations</p>
        </div>

        <div className="space-y-1.5 flex-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center justify-between p-3 rounded-xl transition-all duration-300 text-left group border border-transparent outline-none ring-0",
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
                  <p className={cn("text-[10px] font-bold", activeTab === tab.id ? "text-[var(--brand-primary)]" : "text-[var(--brand-primary)] opacity-80")}>
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
            <motion.div key="profile" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }} className="max-w-2xl space-y-5">
              <div>
                <h2 className="text-[13px] font-bold text-[var(--brand-primary)]">Personal Information</h2>
                <p className="text-[10px] font-medium text-[var(--brand-primary)] opacity-60 mt-1">Update your photo and personal details.</p>
              </div>

              <div className="flex items-center gap-4 pb-6 border-b border-[#0F1E3D]/5">
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                />
                <div className="w-20 h-20 rounded-full bg-[#0F1E3D] flex items-center justify-center border-2 border-white shadow-sm overflow-hidden relative group">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt={fullName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white text-[13px] font-extrabold">
                      {(fullName || "U").charAt(0).toUpperCase()}
                    </span>
                  )}
                  {profileLoading && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                    </div>
                  )}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={profileLoading}
                    className="px-5 py-2.5 bg-[#0F1E3D]/5 text-[10px] font-bold text-[var(--brand-primary)] uppercase tracking-wider rounded-xl hover:bg-[#0F1E3D]/10 transition disabled:opacity-50"
                  >
                    Upload New
                  </button>
                  {profile?.avatar_url && (
                    <button
                      onClick={handleRemoveAvatar}
                      disabled={profileLoading}
                      className="px-4 py-2.5 text-[10px] font-bold text-red-600 uppercase tracking-wider rounded-xl hover:bg-red-50 transition disabled:opacity-50"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              <div className="grid gap-4">
                <div className="grid gap-2">
                  <label className="text-[10px] font-bold text-[var(--brand-primary)] uppercase tracking-wider opacity-60">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-[#f8fafc] border border-[#0F1E3D]/5 rounded-xl px-4 py-3 text-[10px] font-medium text-[var(--brand-primary)] focus:outline-none focus:border-[var(--brand-accent)] transition-colors"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-[10px] font-bold text-[var(--brand-primary)] uppercase tracking-wider opacity-60">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#f8fafc] border border-[#0F1E3D]/5 rounded-xl px-4 py-3 text-[10px] font-medium text-[var(--brand-primary)] focus:outline-none focus:border-[var(--brand-accent)] transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <SaveButton onClick={handleSaveProfile} loading={profileLoading} saved={profileSaved} />
              </div>
            </motion.div>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <motion.div key="notifications" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }} className="max-w-2xl space-y-5">
              <div>
                <h2 className="text-[13px] font-bold text-[var(--brand-primary)]">Notification Preferences</h2>
                <p className="text-[10px] font-medium text-[var(--brand-primary)] opacity-60 mt-1">Choose exactly what we notify you about.</p>
              </div>

              <div className="space-y-4">
                {[
                  { key: "daily_briefing", title: "Daily Briefing Email", desc: "A morning summary of tasks and upcoming meetings." },
                  { key: "client_updates", title: "Client Updates", desc: "New messages or files uploaded by clients." },
                  { key: "invoice_reminders", title: "Invoice Reminders", desc: "Alerts when an invoice goes past due." },
                  { key: "marketing", title: "Marketing & News", desc: "Updates about TapxHub platform features." },
                ].map((notif) => (
                  <div key={notif.key} className="flex items-center justify-between p-3 rounded-xl border border-[#0F1E3D]/5 bg-[#f8fafc]">
                    <div>
                      <p className="text-[10px] font-bold text-[var(--brand-primary)]">{notif.title}</p>
                      <p className="text-[10px] font-medium text-[var(--brand-primary)] opacity-60 mt-0.5">{notif.desc}</p>
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
                  className="px-6 py-3.5 bg-[var(--brand-primary)] text-white text-[10px] font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition shadow-md disabled:opacity-70"
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
            <motion.div key="security" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }} className="max-w-2xl space-y-5">
              <div>
                <h2 className="text-[13px] font-bold text-[var(--brand-primary)]">Security & Authentication</h2>
                <p className="text-[10px] font-medium text-[var(--brand-primary)] opacity-60 mt-1">Keep your account locked out to unauthorized access.</p>
              </div>

              <div className="grid gap-4 pb-6 border-b border-[#0F1E3D]/5">
                <div className="grid gap-2">
                  <label className="text-[10px] font-bold text-[var(--brand-primary)] uppercase tracking-wider opacity-60">Current Password</label>
                  <input
                    type="password"
                    value={currentPwd}
                    onChange={(e) => setCurrentPwd(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#f8fafc] border border-[#0F1E3D]/5 rounded-xl px-4 py-3 text-[10px] font-medium text-[var(--brand-primary)] focus:outline-none focus:border-[var(--brand-accent)] transition-colors"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-[10px] font-bold text-[var(--brand-primary)] uppercase tracking-wider opacity-60">New Password</label>
                  <input
                    type="password"
                    value={newPwd}
                    onChange={(e) => setNewPwd(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#f8fafc] border border-[#0F1E3D]/5 rounded-xl px-4 py-3 text-[10px] font-medium text-[var(--brand-primary)] focus:outline-none focus:border-[var(--brand-accent)] transition-colors"
                  />
                </div>
                {pwdError && (
                  <p className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2">{pwdError}</p>
                )}
                <div>
                  <button
                    onClick={handleUpdatePassword}
                    disabled={pwdLoading}
                    className="px-6 py-3.5 /5 text-[var(--brand-primary)] text-[10px] font-bold uppercase tracking-wider rounded-xl flex items-center gap-2 hover:bg-[#0F1E3D]/10 transition disabled:opacity-70 bg-slate-50 border border-slate-200 text-gray-900 shadow-sm"
                  >
                    {pwdLoading
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</>
                      : pwdSaved
                      ? <><Check className="w-4 h-4 text-blue-600" /> Password Updated!</>
                      : "Update Password"}
                  </button>
                </div>
              </div>

              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold text-[var(--brand-primary)]">Two-Factor Authentication (2FA)</p>
                  <p className="text-[10px] font-medium text-[var(--brand-primary)] opacity-60 mt-1 max-w-sm">
                    Secure your account with an authentication code generated via an app like Google Authenticator.
                  </p>
                </div>
                <button className="px-4 py-2.5 bg-[var(--brand-primary)] text-white text-[10px] font-bold uppercase tracking-wider rounded-xl shadow-md hover:opacity-90 shrink-0">
                  Enable 2FA
                </button>
              </div>
            </motion.div>
          )}

          {/* Appearance Tab */}
          {activeTab === "appearance" && (
            <motion.div key="appearance" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }} className="max-w-2xl space-y-8">
              <div>
                <h2 className="text-[13px] font-bold text-[var(--brand-primary)]">Appearance</h2>
                <p className="text-[10px] font-medium text-[var(--brand-primary)] opacity-60 mt-1">Customize the interface layout. Your preference is saved automatically.</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {/* Light Premium */}
                <button
                  onClick={() => setTheme('light')}
                  className={cn(
                    "group relative flex flex-col items-center gap-4 p-5 rounded-2xl border-2 transition-all duration-300 text-left",
                    theme === 'light'
                      ? "border-[var(--brand-accent)] bg-blue-50/50 shadow-lg shadow-blue-500/10"
                      : "border-[#0F1E3D]/10 hover:border-[#0F1E3D]/20 bg-white hover:shadow-md"
                  )}
                >
                  {/* Preview swatch */}
                  <div className="w-full h-20 rounded-xl overflow-hidden shadow-inner border border-black/5 flex flex-col gap-1 p-2 bg-[#f8fafc]">
                    <div className="h-3 w-3/4 rounded bg-[#0F1E3D]/80" />
                    <div className="h-2 w-1/2 rounded bg-[#0F1E3D]/20" />
                    <div className="mt-auto flex gap-1">
                      <div className="h-4 w-8 rounded bg-[#0F1E3D] " />
                      <div className="h-4 w-8 rounded bg-[#0F1E3D]/10" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-full">
                    <Sun className={cn("w-4 h-4 shrink-0", theme === 'light' ? "text-[var(--brand-accent)]" : "text-[#0F1E3D]/40")} />
                    <div>
                      <p className={cn("text-[10px] font-black uppercase tracking-widest", theme === 'light' ? "text-[var(--brand-primary)]" : "text-[#0F1E3D]/60")}>Light Premium</p>
                      <p className="text-[9px] font-bold text-[#0F1E3D]/30 mt-0.5">Clean & airy</p>
                    </div>
                  </div>
                  {theme === 'light' && (
                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[var(--brand-accent)] flex items-center justify-center shadow">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>

                {/* Dark Hub */}
                <button
                  onClick={() => setTheme('dark')}
                  className={cn(
                    "group relative flex flex-col items-center gap-4 p-5 rounded-2xl border-2 transition-all duration-300 text-left",
                    theme === 'dark'
                      ? "border-[var(--brand-accent)] bg-indigo-950/10 shadow-lg shadow-indigo-500/10"
                      : "border-[#0F1E3D]/10 hover:border-[#0F1E3D]/20 bg-white hover:shadow-md"
                  )}
                >
                  <div className="w-full h-20 rounded-xl overflow-hidden border border-white/5 flex flex-col gap-1 p-2 bg-[#0A0F1E]">
                    <div className="h-3 w-3/4 rounded bg-white/80" />
                    <div className="h-2 w-1/2 rounded bg-white/20" />
                    <div className="mt-auto flex gap-1">
                      <div className="h-4 w-8 rounded bg-[#4F8EFF]" />
                      <div className="h-4 w-8 rounded bg-white/10" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-full">
                    <Moon className={cn("w-4 h-4 shrink-0", theme === 'dark' ? "text-[var(--brand-accent)]" : "text-[#0F1E3D]/40")} />
                    <div>
                      <p className={cn("text-[10px] font-black uppercase tracking-widest", theme === 'dark' ? "text-[var(--brand-primary)]" : "text-[#0F1E3D]/60")}>Dark Hub</p>
                      <p className="text-[9px] font-bold text-[#0F1E3D]/30 mt-0.5">Deep & focused</p>
                    </div>
                  </div>
                  {theme === 'dark' && (
                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[var(--brand-accent)] flex items-center justify-center shadow">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>

                {/* System Config */}
                <button
                  onClick={() => setTheme('system')}
                  className={cn(
                    "group relative flex flex-col items-center gap-4 p-5 rounded-2xl border-2 transition-all duration-300 text-left",
                    theme === 'system'
                      ? "border-[var(--brand-accent)] bg-purple-50/50 shadow-lg shadow-purple-500/10"
                      : "border-[#0F1E3D]/10 hover:border-[#0F1E3D]/20 bg-white hover:shadow-md"
                  )}
                >
                  <div className="w-full h-20 rounded-xl overflow-hidden border border-black/5 flex flex-col gap-1 p-2" style={{ background: 'linear-gradient(135deg, #f8fafc 50%, #0A0F1E 50%)' }}>
                    <div className="h-3 w-3/4 rounded" style={{ background: 'linear-gradient(90deg, #0F1E3D 50%, #E8EEFF 50%)' }} />
                    <div className="h-2 w-1/2 rounded" style={{ background: 'linear-gradient(90deg, rgba(15,30,61,0.2) 50%, rgba(232,238,255,0.2) 50%)' }} />
                  </div>
                  <div className="flex items-center gap-2 w-full">
                    <Monitor className={cn("w-4 h-4 shrink-0", theme === 'system' ? "text-[var(--brand-accent)]" : "text-[#0F1E3D]/40")} />
                    <div>
                      <p className={cn("text-[10px] font-black uppercase tracking-widest", theme === 'system' ? "text-[var(--brand-primary)]" : "text-[#0F1E3D]/60")}>System Config</p>
                      <p className="text-[9px] font-bold text-[#0F1E3D]/30 mt-0.5">Follows your OS</p>
                    </div>
                  </div>
                  {theme === 'system' && (
                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[var(--brand-accent)] flex items-center justify-center shadow">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              </div>

              {/* Live status feedback */}
              <div className="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-[#0F1E3D]/[0.04] border border-[#0F1E3D]/5">
                <div className={cn("w-2 h-2 rounded-full animate-pulse", resolvedTheme === 'dark' ? 'bg-indigo-400' : 'bg-blue-500')} />
                <span className="text-[10px] font-black text-[#0F1E3D]/50 uppercase tracking-widest">
                  Currently rendering: <span className="text-[var(--brand-primary)] uppercase">{resolvedTheme === 'dark' ? 'Dark Hub' : 'Light Premium'}</span>
                  {theme === 'system' && <span className="ml-1 opacity-50">(auto)</span>}
                </span>
              </div>
            </motion.div>
          )}

          {/* Data Tab */}
          {activeTab === "data" && (
            <motion.div key="data" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }} className="max-w-2xl space-y-5">
              <div>
                <h2 className="text-[13px] font-bold text-[var(--brand-primary)]">Data & Privacy</h2>
                <p className="text-[10px] font-medium text-[var(--brand-primary)] opacity-60 mt-1">Control your sensitive data and account history.</p>
              </div>

              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between p-3 rounded-xl border border-[#0F1E3D]/5 bg-[#f8fafc]">
                <div>
                  <h3 className="text-[10px] font-bold text-[var(--brand-primary)]">Export Activity Data</h3>
                  <p className="text-[10px] font-medium text-[var(--brand-primary)] opacity-60 mt-1 max-w-sm">
                    Download an archive of your tasks, invoices history, and client metadata in CSV format.
                  </p>
                </div>
                <button className="px-4 py-2.5 shrink-0 whitespace-nowrap bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-wider rounded-xl hover:bg-indigo-100 transition">
                  Request Export
                </button>
              </div>

              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between p-3 rounded-xl border border-red-100 bg-red-50/50">
                <div>
                  <h3 className="text-[10px] font-bold text-red-600">Delete Account</h3>
                  <p className="text-[10px] font-medium text-red-600 opacity-80 mt-1 max-w-sm">
                    Permanently wipe your account, settings, and workspace data. This cannot be undone.
                  </p>
                </div>
                <button
                  onClick={() => confirm("Are you absolutely sure? This will permanently delete your account.") && supabase.auth.signOut()}
                  className="px-4 py-2.5 shrink-0 bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-xl shadow-md hover:bg-red-700 transition"
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

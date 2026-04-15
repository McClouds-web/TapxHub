import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Send, Sparkles, Copy, RefreshCcw,
  MessageSquare, UserCircle, Zap, ShieldCheck,
  History, Settings, Save, CheckCircle2,
  Trash2, ArrowRight, Plus, ExternalLink,
  ChevronRight, Layout, PenTool, Mail,
  Target, Hash, Shield, Rocket, Globe,
  MoreVertical, FileText, UploadCloud,
  ListTodo, Check, X, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from "sonner";
import { format } from "date-fns";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import {
  useProfile,
  useCompanies,
  useBrandOutputs,
  useAddBrandOutput,
  useUpdateCompanyBrandProfile,
  useAddSocialContent,
  useAddTask,
  useUploadFile,
  type BrandOutput,
  type Company
} from "@/hooks/useAppData";

// ─── Constants ───────────────────────────────────────────────────────────────

const MODES = [
  { id: 'professional', name: 'Professional',  icon: ShieldCheck, color: 'text-blue-500',   bg: 'bg-blue-50' },
  { id: 'punchy',       name: 'Punchy',        icon: Zap,         color: 'text-amber-500',  bg: 'bg-amber-50' },
  { id: 'founder',      name: 'Founder Style', icon: UserCircle,  color: 'text-purple-500', bg: 'bg-purple-50' },
  { id: 'luxury',       name: 'Luxury',        icon: Shield,      color: 'text-rose-500',   bg: 'bg-rose-50' },
  { id: 'minimal',      name: 'Minimal',       icon: Layout,      color: 'text-slate-500',  bg: 'bg-slate-50' },
];

const CONTENT_TYPES = [
  { id: 'social_caption', label: 'Social Caption', icon: InstagramIcon },
  { id: 'ad_copy',        label: 'Ad Copy',        icon: Target },
  { id: 'email',          label: 'Email Marketing', icon: Mail },
  { id: 'landing_page',   label: 'Landing Page',   icon: Globe },
  { id: 'campaign_idea',  label: 'Campaign Idea',  icon: Rocket },
  { id: 'blog_outline',   label: 'Blog Outline',   icon: FileText },
];

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function BrandBrain() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const isAdmin = profile?.role === 'admin';
  const { data: companies = [] } = useCompanies();

  const [selectedCompanyId, setSelectedCompanyId] = useState<string | undefined>(profile?.company_id);
  const selectedCompany = useMemo(() => companies.find(c => c.id === selectedCompanyId), [companies, selectedCompanyId]);

  const { data: history = [], isLoading, isError, error } = useBrandOutputs(selectedCompanyId);

  React.useEffect(() => {
    if (isError) console.error("BrandBrain failed to load data:", error);
  }, [isError, error]);

  const addOutput = useAddBrandOutput();
  const updateProfile = useUpdateCompanyBrandProfile();
  const addSocial = useAddSocialContent();
  const addTask = useAddTask();
  const uploadFile = useUploadFile();

  const [activeTab, setActiveTab] = useState<'generate' | 'profile' | 'history'>('generate');
  const [contentType, setContentType] = useState('social_caption');
  const [mode, setMode] = useState('professional');
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentOutput, setCurrentOutput] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-white rounded-[40px] border border-gray-100 m-2">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  const handleGenerate = async () => {
    if (!input || !selectedCompanyId) return toast.error("Select a client node first.");
    setIsGenerating(true);
    setCurrentOutput(null);
    try {
      const { data, error } = await supabase.functions.invoke('vector_chat', {
        body: {
          message: `Task: Generate ${contentType} using ${mode} mode.\n\nContext/Topic: ${input}\n\nBrand Voice: ${selectedCompany?.brand_voice}\nTarget: ${selectedCompany?.target_audience}\nDescription: ${selectedCompany?.brand_description}`,
          userName: profile?.full_name || 'Partner',
          companyData: selectedCompany
        }
      });
      if (error) throw error;
      const result = data.content || "Synthesis complete, but output was null.";
      await addOutput.mutateAsync({
        company_id: selectedCompanyId,
        content_type: contentType,
        persona_mode: mode,
        prompt: input,
        output_text: result,
        created_by: user?.id
      });
      setCurrentOutput(result);
      toast.success("Intelligence fuel exhausted. Content generated.");
    } catch (err: any) {
      console.error("AI Failure:", err);
      toast.error("Generation failed. Check Groq API link.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendToSocial = async () => {
    if (!currentOutput || !selectedCompanyId) return;
    try {
      await addSocial.mutateAsync({ company_id: selectedCompanyId, platform: 'Instagram', content_type: 'post', caption: currentOutput, status: 'idea' });
      toast.success("Sent to Social Engine Pipeline.");
    } catch { toast.error("Bridge failure."); }
  };

  const handleSaveToVault = async () => {
    if (!currentOutput || !selectedCompanyId) return;
    try {
      const fileName = `BrandBrain_${contentType}_${Date.now()}.txt`;
      const blob = new Blob([currentOutput], { type: 'text/plain' });
      const file = new File([blob], fileName, { type: 'text/plain' });
      await uploadFile.mutateAsync({ file, companyId: selectedCompanyId, category: 'reports' });
      toast.success("Strategic asset archived in Vault.");
    } catch { toast.error("Archive failure."); }
  };

  const handleCreateTask = async () => {
    if (!currentOutput || !selectedCompanyId) return;
    try {
      await addTask.mutateAsync({ company_id: selectedCompanyId, title: `Execute Brand Brain Asset: ${contentType}`, description: currentOutput, status: 'todo', priority: 'medium' });
      toast.success("Task created in Workspace.");
    } catch { toast.error("Workspace integration failed."); }
  };

  return (
    <div className="flex flex-col h-full gap-5 overflow-hidden text-[#0F1E3D] font-sans">

      {/* ── HEADER ── */}
      <header className="flex items-center justify-between px-2 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-xl shadow-indigo-500/20 group hover:rotate-6 transition-transform">
             <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight">Brand Brain</h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
               <ShieldCheck className="w-3.5 h-3.5 text-indigo-500"/> Growth OS Intelligence Layer
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <select
              value={selectedCompanyId || ''}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
              className="bg-white border border-gray-100 rounded-xl px-5 py-2.5 text-[11px] font-black uppercase tracking-widest focus:outline-none shadow-sm min-w-[200px]"
            >
              <option value="">Select Domain...</option>
              {companies.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          )}

          <div className="flex bg-white/80 backdrop-blur-sm border border-gray-100 rounded-xl p-1 shadow-sm">
            <TabButton active={activeTab === 'generate'} onClick={() => setActiveTab('generate')} icon={<Sparkles className="w-3.5 h-3.5"/>} label="Fuel" />
            <TabButton active={activeTab === 'profile'}  onClick={() => setActiveTab('profile')}  icon={<Settings className="w-3.5 h-3.5"/>} label="Core" />
            <TabButton active={activeTab === 'history'}  onClick={() => setActiveTab('history')}  icon={<History className="w-3.5 h-3.5"/>}  label="Archive" />
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 grid grid-cols-12 gap-5 min-h-0 px-2 overflow-hidden">

        {/* Left Column */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-5 overflow-y-auto no-scrollbar pb-8">

           <AnimatePresence mode="wait">
              {activeTab === 'generate' && (
                <motion.div key="generate" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="flex flex-col gap-5">

                   {/* Configuration Card */}
                   <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm flex flex-col gap-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div className="space-y-4">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Asset Category</label>
                            <div className="grid grid-cols-2 gap-2">
                               {CONTENT_TYPES.map(ct => (
                                 <button key={ct.id} onClick={() => setContentType(ct.id)}
                                   className={cn("flex items-center gap-2 px-4 py-3 rounded-xl border text-[10px] font-black transition-all text-left",
                                     contentType === ct.id ? "bg-[#0F1E3D] text-white border-transparent shadow-lg" : "bg-white text-gray-400 border-gray-100 hover:border-gray-300")}>
                                   <ct.icon className="w-4 h-4 shrink-0" /> {ct.label}
                                 </button>
                               ))}
                            </div>
                         </div>
                         <div className="space-y-4">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Voice Resonance Mode</label>
                            <div className="grid grid-cols-1 gap-2">
                               {MODES.map(m => (
                                 <button key={m.id} onClick={() => setMode(m.id)}
                                   className={cn("flex items-center justify-between px-5 py-3 rounded-xl border text-[10px] font-black transition-all",
                                     mode === m.id ? "bg-[#0F1E3D] text-white border-transparent shadow-lg" : "bg-white text-gray-400 border-gray-100 hover:border-gray-300")}>
                                   <div className="flex items-center gap-3">
                                      <m.icon className={cn("w-4 h-4", mode === m.id ? "text-white" : m.color)} />
                                      {m.name}
                                   </div>
                                   {mode === m.id && <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />}
                                 </button>
                               ))}
                            </div>
                         </div>
                      </div>

                      <div className="space-y-4">
                         <div className="flex justify-between items-end">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Input Parameters</label>
                            <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Prompt Engineering Active</span>
                         </div>
                         <div className="relative group">
                            <textarea
                              value={input}
                              onChange={(e) => setInput(e.target.value)}
                              placeholder="Describe the objective, target message, or paste source notes..."
                              className="w-full h-48 bg-gray-50 border border-gray-100 rounded-[32px] p-6 text-[13px] font-bold text-[#0F1E3D] outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-inner resize-none"
                            />
                            <div className="absolute bottom-6 right-6">
                               <button onClick={handleGenerate} disabled={isGenerating || !input}
                                 className="px-8 py-4 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-[#1E3A8A] transition-all shadow-xl shadow-indigo-600/20 active:scale-95 disabled:opacity-50 flex items-center gap-2">
                                 {isGenerating ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4"/>}
                                 <span>{isGenerating ? 'Synthesizing...' : 'Ignite Engine'}</span>
                               </button>
                            </div>
                         </div>
                      </div>
                   </div>

                   {/* Output Area */}
                   <AnimatePresence>
                     {currentOutput && (
                       <motion.div
                        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-[#0F1E3D] rounded-[40px] p-10 flex flex-col relative overflow-hidden text-white"
                       >
                         <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                         <div className="flex justify-between items-center mb-8 relative z-10">
                            <div className="flex items-center gap-3">
                               <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                                  <PenTool className="w-5 h-5 text-indigo-300" />
                               </div>
                               <div>
                                  <h4 className="text-[14px] font-black uppercase tracking-tight">Intelligence Output</h4>
                                  <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Validated for {selectedCompany?.name}</p>
                               </div>
                            </div>
                            <button
                              onClick={() => { navigator.clipboard.writeText(currentOutput); toast.success("Copied to clipboard."); }}
                              className="w-11 h-11 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all border border-white/10">
                               <Copy className="w-4 h-4" />
                            </button>
                         </div>

                         <div className="flex-1 bg-white/5 border border-white/5 rounded-[32px] p-8 text-[15px] font-medium leading-relaxed italic relative z-10">
                            {currentOutput}
                         </div>

                         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 relative z-10">
                            <ActionButton onClick={handleSendToSocial} icon={<InstagramIcon className="w-4 h-4"/>} label="Social Engine" />
                            <ActionButton onClick={handleCreateTask} icon={<ListTodo className="w-4 h-4"/>} label="Workspace" />
                            <ActionButton onClick={handleSaveToVault} icon={<UploadCloud className="w-4 h-4"/>} label="Save Vault" />
                            <ActionButton onClick={() => setCurrentOutput(null)} icon={<Trash2 className="w-4 h-4"/>} label="Purge Draft" color="text-rose-400 bg-rose-400/10" />
                         </div>
                       </motion.div>
                     )}
                   </AnimatePresence>
                </motion.div>
              )}

              {activeTab === 'profile' && (
                <motion.div key="profile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-[40px] p-10 border border-gray-100 shadow-sm flex flex-col gap-10">
                   <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-[18px] font-black uppercase tracking-tight">Brand Core Profile</h3>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1">Foundational Intelligence for {selectedCompany?.name || 'Selected Region'}</p>
                      </div>
                      <button
                        onClick={() => { if (!selectedCompanyId) return; toast.success("Brand Core synchronization complete."); }}
                        className="px-6 py-3 bg-[#0F1E3D] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center gap-2">
                         <Save className="w-4 h-4" /> Sync Profile
                      </button>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                      <ProfileInput label="Brand Voice" value={selectedCompany?.brand_voice}
                        onChange={(val) => updateProfile.mutate({ id: selectedCompanyId!, brand_voice: val })}
                        placeholder="e.g. Authoritative yet approachable..." />
                      <ProfileInput label="Target Audience" value={selectedCompany?.target_audience}
                        onChange={(val) => updateProfile.mutate({ id: selectedCompanyId!, target_audience: val })}
                        placeholder="e.g. High-ticket service providers..." />
                      <ProfileInput label="Core Values" value={selectedCompany?.brand_values}
                        onChange={(val) => updateProfile.mutate({ id: selectedCompanyId!, brand_values: val })}
                        placeholder="e.g. Speed, Excellence..." />
                      <ProfileInput label="Description" value={selectedCompany?.brand_description}
                        onChange={(val) => updateProfile.mutate({ id: selectedCompanyId!, brand_description: val })}
                        placeholder="Elevator pitch or mission statement..." multiline />
                   </div>
                </motion.div>
              )}

              {activeTab === 'history' && (
                <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
                   {history.map(item => (
                     <HistoryItem key={item.id} item={item} onReuse={setCurrentOutput} />
                   ))}
                   {history.length === 0 && (
                     <div className="py-20 text-center opacity-20 flex flex-col items-center">
                        <History className="w-12 h-12 mb-4" />
                        <p className="text-[12px] font-black uppercase tracking-widest">Generate your first AI marketing asset.</p>
                     </div>
                   )}
                </motion.div>
              )}
           </AnimatePresence>

        </div>

        {/* Right Column: Side Stats */}
        <div className="hidden lg:col-span-4 lg:flex flex-col gap-5 overflow-y-auto no-scrollbar pb-8">

           <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm flex flex-col gap-6 group">
              <div className="flex justify-between items-center">
                <h4 className="text-[12px] font-black uppercase tracking-tight">Active Context</h4>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                   <Check className="w-4 h-4 text-emerald-500" />
                </div>
              </div>
              <div className="space-y-4">
                 <ContextBit icon={<UserCircle className="w-4 h-4 text-blue-500"/>} label="Primary Avatar" val={selectedCompany?.target_audience || 'TBD'} />
                 <ContextBit icon={<MessageSquare className="w-4 h-4 text-amber-500"/>} label="Voice Lock" val={selectedCompany?.brand_voice || 'Default'} />
                 <ContextBit icon={<Hash className="w-4 h-4 text-purple-500"/>} label="Key Fragments" val={selectedCompany?.brand_keywords?.length || 0} />
              </div>
              <div className="mt-4 pt-6 border-t border-gray-50">
                 <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Resonance Strength</span>
                    <span className="text-[12px] font-black text-indigo-600">88%</span>
                 </div>
                 <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                    <div className="h-full w-[88%] bg-indigo-600 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.3)] transition-all duration-1000" />
                 </div>
              </div>
           </div>

           <div className="bg-indigo-50/50 rounded-[32px] p-8 border border-indigo-100/50 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
                    <Zap className="w-4 h-4 fill-indigo-600" />
                 </div>
                 <span className="text-[11px] font-black uppercase tracking-tight text-[#0F1E3D]">Pro Insight</span>
              </div>
              <p className="text-[11px] font-bold text-indigo-900/60 leading-relaxed uppercase tracking-wider">
                 Combine "Luxury" mode with "High-Ticket" keywords for maximum conversion potential in high-intent campaigns.
              </p>
           </div>
        </div>
      </main>
    </div>
  );
}

// ─── COMPONENTS ───────────────────────────────────────────────────────────────

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button onClick={onClick}
      className={cn("flex items-center gap-2 px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all shrink-0",
        active ? "bg-[#0F1E3D] text-white shadow-xl" : "text-gray-300 hover:text-[#0F1E3D]")}>
      {icon} {label}
    </button>
  );
}

function ActionButton({ onClick, icon, label, color }: { onClick: () => void; icon: React.ReactNode; label: string; color?: string }) {
  return (
    <button onClick={onClick}
      className={cn("flex items-center justify-center gap-3 py-4 rounded-2xl bg-white/10 border border-white/5 hover:bg-white/20 transition-all text-[10px] font-bold uppercase tracking-widest",
        color || "text-white")}>
       {icon} {label}
    </button>
  );
}

function ProfileInput({ label, value, onChange, placeholder, multiline }: { label: string; value?: string; onChange: (val: string) => void; placeholder?: string; multiline?: boolean }) {
  const [val, setVal] = useState(value || '');
  return (
    <div className="space-y-3">
       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</label>
       {multiline ? (
         <textarea value={val} onChange={(e) => setVal(e.target.value)} onBlur={() => onChange(val)} placeholder={placeholder}
           className="w-full h-32 bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-[12px] font-bold outline-none focus:border-indigo-500 transition-all resize-none" />
       ) : (
         <input value={val} onChange={(e) => setVal(e.target.value)} onBlur={() => onChange(val)} placeholder={placeholder}
           className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-[12px] font-bold outline-none focus:border-indigo-500 transition-all" />
       )}
    </div>
  );
}

function HistoryItem({ item, onReuse }: { item: BrandOutput, onReuse: (t: string) => void }) {
  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 group hover:border-indigo-100 transition-all shadow-sm">
       <div className="flex items-center gap-5 flex-1 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-300 group-hover:bg-[#0F1E3D] group-hover:text-white transition-all shrink-0">
             <History className="w-5 h-5" />
          </div>
          <div className="min-w-0">
             <div className="flex items-center gap-3 mb-1">
                <span className="text-[10px] font-black uppercase tracking-tight text-[#0F1E3D]">{item.content_type.replace('_', ' ')}</span>
                <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">• {format(new Date(item.created_at), 'MMM d, h:mm a')}</span>
             </div>
             <p className="text-[11px] font-bold text-[#0F1E3D] truncate max-w-md opacity-60">PROMPT: {item.prompt}</p>
          </div>
       </div>
       <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => onReuse(item.output_text)}
           className="px-5 py-2.5 bg-gray-50 hover:bg-[#0F1E3D] hover:text-white text-[#0F1E3D] rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-gray-100">
             Reuse Output
          </button>
       </div>
    </div>
  );
}

function ContextBit({ icon, label, val }: { icon: React.ReactNode; label: string; val: string | number }) {
  return (
    <div className="flex items-center gap-4">
       <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100">
          {icon}
       </div>
       <div className="min-w-0">
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{label}</p>
          <p className="text-[10px] font-black text-[#0F1E3D] truncate">{val || 'Not Programmed'}</p>
       </div>
    </div>
  );
}

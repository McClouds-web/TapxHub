import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Search, X, Mail, Phone, Building2, Sparkles,
  MoreHorizontal, UserPlus, MessageSquare, Edit, Trash2, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useCompanies,
  useAddCompany,
  useUpdateCompany,
  useDeleteCompany,
  useCreateConversation,
  type Company,
} from "@/hooks/useAppData";
import { uploadPublicFile } from "@/lib/storage";
import { toast } from "sonner";
import { useRef } from "react";

const statusStyles: Record<string, string> = {
  Active:    "bg-blue-500/10 text-blue-600 border-blue-500/20",
  Retainer:  "bg-blue-500/10 text-blue-600 border-blue-500/20",
  "One-off": "bg-amber-500/10 text-amber-600 border-amber-500/20",
  Completed: "bg-[#0F1E3D]/5 text-[#0F1E3D]/40 border-[#0F1E3D]/10",
};

function deriveStatus(c: Company): string {
  if (c.status) return c.status;
  if (c.client_type === "retainer") return "Retainer";
  return "Active";
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

type ModalMode = "add" | "edit" | null;

const emptyForm = {
  name: "",
  contact_email: "",
  phone: "",
  industry: "",
  site: "",
  client_type: "invoice" as "invoice" | "retainer",
  retainer_amount: "",
  kpi_embed_url: "",
  drive_link: "",
  logo_url: "",
};

export default function Clients() {
  const navigate = useNavigate();
  const [search, setSearch]           = useState("");
  const [selectedId, setSelectedId]   = useState<string | null>(null);
  const [modalMode, setModalMode]     = useState<ModalMode>(null);
  const [openMenuId, setOpenMenuId]   = useState<string | null>(null);
  const [form, setForm]               = useState(emptyForm);
  const [saving, setSaving]           = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const { data: companies = [], isLoading } = useCompanies();
  const addCompany      = useAddCompany();
  const updateCompany   = useUpdateCompany();
  const deleteCompany   = useDeleteCompany();
  const createConv      = useCreateConversation();

  const filtered = companies.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.contact_email ?? "").toLowerCase().includes(search.toLowerCase())
  );
  const selected = companies.find((c) => c.id === selectedId);

  const activeCount   = companies.filter((c) => ["Active","Retainer"].includes(deriveStatus(c))).length;
  const retainerCount = companies.filter((c) => deriveStatus(c) === "Retainer").length;

  function openAdd() {
    setForm(emptyForm);
    setModalMode("add");
  }

  function openEdit(client: Company) {
    setForm({
      name: client.name ?? "",
      contact_email: client.contact_email ?? client.email ?? "",
      phone: client.phone ?? "",
      industry: client.industry ?? "",
      site: client.site ?? "",
      client_type: (client.client_type as "invoice" | "retainer") ?? "invoice",
      retainer_amount: String(client.retainer_amount ?? ""),
      kpi_embed_url: client.kpi_embed_url ?? "",
      drive_link: client.drive_link ?? "",
      logo_url: client.logo_url ?? "",
    });
    setModalMode("edit");
    setOpenMenuId(null);
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoUploading(true);
    try {
      const { url } = await uploadPublicFile(file, 'brand_assets');
      setForm(prev => ({ ...prev, logo_url: url }));
      toast.success("Logo uploaded!");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload logo");
    } finally {
      setLogoUploading(false);
      if (logoInputRef.current) logoInputRef.current.value = '';
    }
  }

  async function handleSave() {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (modalMode === "add") {
        await addCompany.mutateAsync({
          name: form.name.trim(),
          contact_email: form.contact_email || undefined,
          client_type: form.client_type,
          retainer_amount: form.retainer_amount ? Number(form.retainer_amount) : undefined,
          kpi_embed_url: form.kpi_embed_url || undefined,
          drive_link: form.drive_link || undefined,
          logo_url: form.logo_url || undefined,
        });
      } else if (modalMode === "edit" && selectedId) {
        await updateCompany.mutateAsync({
          id: selectedId,
          name: form.name.trim(),
          contact_email: form.contact_email || undefined,
          client_type: form.client_type,
          retainer_amount: form.retainer_amount ? Number(form.retainer_amount) : undefined,
          kpi_embed_url: form.kpi_embed_url || undefined,
          drive_link: form.drive_link || undefined,
          logo_url: form.logo_url || undefined,
        });
      }
      setModalMode(null);
    } finally {
      setSaving(false);
    }
  }

  async function handleMessage(client: Company) {
    // Find or create a conversation for this company, then navigate to messages
    try {
      const conv = await createConv.mutateAsync({ companyId: client.id });
      navigate("/messages", { state: { conversationId: conv.id } });
    } catch {
      // Conversation may already exist — just navigate with company context
      navigate("/messages", { state: { companyId: client.id } });
    }
  }

  async function handleDelete(client: Company) {
    if (!confirm(`Delete "${client.name}"? This cannot be undone.`)) return;
    await deleteCompany.mutateAsync(client.id);
    if (selectedId === client.id) setSelectedId(null);
    setOpenMenuId(null);
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show"
      className="flex flex-col h-full gap-4 overflow-hidden pb-4">

      {/* Header */}
      <motion.div variants={item} className="flex items-end justify-between shrink-0">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--brand-primary)]">Clients Directory</h1>
          <p className="text-[10px] text-[var(--brand-primary)]/50 font-bold mt-1.5 uppercase tracking-widest">
            Agency Account Management
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-[#0F1E3D] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#1E3A8A] transition-all shadow-md active:scale-95"
        >
          <UserPlus className="h-4 w-4 text-white/70" /> Add Client
        </button>
      </motion.div>

      {/* Summary Metrics */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
        <div className="bg-white border border-[#0F1E3D]/5 rounded-xl p-3 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] font-black uppercase tracking-widest text-[var(--brand-primary)]/40 mb-3">Total Partners</span>
          <span className="text-3xl font-extrabold text-[var(--brand-primary)] tracking-tight">{companies.length}</span>
        </div>
        <div className="bg-white border border-[#0F1E3D]/5 rounded-xl p-3 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-[100px] pointer-events-none" />
          <span className="text-[10px] font-black uppercase tracking-widest text-blue-600/70 mb-3">Active Engagements</span>
          <span className="text-3xl font-extrabold text-blue-600 tracking-tight">{activeCount}</span>
        </div>
        <div className="bg-white border border-[#0F1E3D]/5 rounded-xl p-3 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-[100px] pointer-events-none" />
          <span className="text-[10px] font-black uppercase tracking-widest text-blue-600/70 mb-3">On Retainer</span>
          <span className="text-3xl font-extrabold text-blue-600 tracking-tight">{retainerCount}</span>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <motion.div variants={item} className="flex gap-5 flex-1 min-h-0">

        {/* Client List */}
        <div className="flex-1 flex flex-col bg-white border border-[#0F1E3D]/5 rounded-xl overflow-hidden shadow-sm min-h-0">
          <div className="flex items-center justify-between px-4 py-5 border-b border-[#0F1E3D]/5 shrink-0 bg-[#F8FAFC]/50 gap-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--brand-primary)] flex items-center gap-2 shrink-0">
              <Users className="h-4 w-4 text-[#1E3A8A]" /> Network
            </h3>
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--brand-primary)]/30 pointer-events-none" />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search clients..."
                className="w-full bg-white border border-[#0F1E3D]/10 rounded-xl pl-9 pr-4 py-2.5 text-[10px] font-bold text-[var(--brand-primary)] placeholder:text-[#0F1E3D]/30 focus:outline-none focus:border-[var(--brand-accent)] transition-colors shadow-sm"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-2 py-2 relative">
            {isLoading ? (
              [0,1,2].map((i) => (
                <div key={i} className="h-16 rounded-xl bg-[#F8FAFC] animate-pulse m-2 border border-[#0F1E3D]/5" />
              ))
            ) : filtered.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 rounded-xl bg-[#F8FAFC] border border-[#0F1E3D]/5 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-[var(--brand-primary)] opacity-30" />
                </div>
                <p className="text-[10px] font-bold text-[var(--brand-primary)]">No clients found.</p>
                <button onClick={openAdd} className="mt-3 px-4 py-2 bg-[#0F1E3D] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#1E3A8A] transition-all">
                  Add First Client
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                <AnimatePresence>
                  {filtered.map((client, i) => {
                    const status = deriveStatus(client);
                    const isSelected = selectedId === client.id;
                    return (
                      <motion.div key={client.id} layout
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        transition={{ delay: i * 0.04 }}
                        onClick={() => setSelectedId(isSelected ? null : client.id)}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-xl group transition-all cursor-pointer border relative",
                          isSelected
                            ? "bg-[#F8FAFC] border-[#0F1E3D]/10 shadow-sm"
                            : "bg-transparent border-transparent hover:border-[#0F1E3D]/5 hover:bg-[#F8FAFC]"
                        )}
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className={cn(
                            "w-10 h-10 rounded-lg border flex items-center justify-center shrink-0 transition-colors shadow-sm overflow-hidden",
                            isSelected ? "bg-[#0F1E3D] border-[#0F1E3D] text-white" : "bg-white border-[#0F1E3D]/5 text-[var(--brand-primary)] group-hover:bg-[#0F1E3D] group-hover:text-white group-hover:border-[#0F1E3D]"
                          )}>
                            {client.logo_url ? (
                              <img src={client.logo_url} alt={client.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-[10px] font-black uppercase">{client.name.charAt(0)}</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] font-extrabold text-[var(--brand-primary)] truncate">{client.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              {client.industry && (
                                <span className="text-[10px] font-bold uppercase tracking-widest text-[#1E3A8A]">{client.industry}</span>
                              )}
                              {client.contact_email && (
                                <>
                                  {client.industry && <span className="text-[10px] font-bold text-[var(--brand-primary)]/30">•</span>}
                                  <span className="text-[10px] font-bold text-[var(--brand-primary)]/50 truncate">{client.contact_email}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 shrink-0 ml-4">
                          {client.retainer_amount ? (
                            <div className="hidden lg:flex flex-col items-end">
                              <span className="text-[10px] font-black text-[var(--brand-primary)]">
                                ${Number(client.retainer_amount).toLocaleString()}/mo
                              </span>
                            </div>
                          ) : null}

                          <div className="w-24 flex justify-end">
                            <span className={cn(
                              "inline-flex items-center px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border",
                              statusStyles[status] ?? statusStyles["Active"]
                            )}>
                              {status}
                            </span>
                          </div>

                          {/* More menu */}
                          <div className="relative" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => setOpenMenuId(openMenuId === client.id ? null : client.id)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--brand-primary)]/40 hover:bg-white hover:text-[#1E3A8A] border border-transparent hover:border-[#0F1E3D]/10 hover:shadow-sm transition-all"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                            <AnimatePresence>
                              {openMenuId === client.id && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                                  className="absolute right-0 top-9 z-20 bg-white border border-[#0F1E3D]/10 rounded-xl shadow-lg py-1.5 w-40"
                                >
                                  <button
                                    onClick={() => { setSelectedId(client.id); setOpenMenuId(null); }}
                                    className="w-full px-4 py-2 text-left text-[10px] font-bold text-[var(--brand-primary)] hover:bg-[#F8FAFC] transition-colors flex items-center gap-2"
                                  >
                                    <Users className="h-3.5 w-3.5 opacity-50" /> View Profile
                                  </button>
                                  <button
                                    onClick={() => { setSelectedId(client.id); openEdit(client); }}
                                    className="w-full px-4 py-2 text-left text-[10px] font-bold text-[var(--brand-primary)] hover:bg-[#F8FAFC] transition-colors flex items-center gap-2"
                                  >
                                    <Edit className="h-3.5 w-3.5 opacity-50" /> Edit
                                  </button>
                                  <button
                                    onClick={() => handleMessage(client)}
                                    className="w-full px-4 py-2 text-left text-[10px] font-bold text-[var(--brand-primary)] hover:bg-[#F8FAFC] transition-colors flex items-center gap-2"
                                  >
                                    <MessageSquare className="h-3.5 w-3.5 opacity-50" /> Message
                                  </button>
                                  <div className="border-t border-[#0F1E3D]/5 my-1" />
                                  <button
                                    onClick={() => handleDelete(client)}
                                    className="w-full px-4 py-2 text-left text-[10px] font-bold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" /> Delete
                                  </button>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        {/* Detailed Side Panel */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0, x: 20, width: 0 }}
              animate={{ opacity: 1, x: 0, width: 340 }}
              exit={{ opacity: 0, x: 20, width: 0 }}
              className="hidden shrink-0 lg:flex flex-col h-full overflow-y-auto relative bg-white border border-[#0F1E3D]/5 rounded-xl shadow-sm"
            >
              <div className="p-3 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className="w-14 h-14 rounded-xl bg-[#0F1E3D] flex items-center justify-center text-white text-[12px] font-extrabold shadow-md shrink-0 border border-[#1E3A8A] overflow-hidden">
                      {selected.logo_url ? (
                        <img src={selected.logo_url} alt={selected.name} className="w-full h-full object-cover" />
                      ) : (
                        selected.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <h3 className="text-[12px] font-extrabold text-[var(--brand-primary)] leading-tight">{selected.name}</h3>
                      {selected.industry && (
                        <span className="inline-block mt-1.5 px-2.5 py-1 bg-[#F8FAFC] border border-[#0F1E3D]/5 rounded-lg text-[10px] font-black uppercase tracking-widest text-[#1E3A8A]">
                          {selected.industry}
                        </span>
                      )}
                      <div className="mt-1.5">
                        <span className={cn(
                          "inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border",
                          statusStyles[deriveStatus(selected)] ?? statusStyles["Active"]
                        )}>
                          {deriveStatus(selected)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedId(null)}
                    className="w-8 h-8 rounded-full border border-[#0F1E3D]/5 flex items-center justify-center text-[var(--brand-primary)]/40 hover:text-[var(--brand-primary)] hover:bg-[#F8FAFC] transition shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#F8FAFC] rounded-xl p-3 border border-[#0F1E3D]/5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#0F1E3D]/40 mb-1 block">Type</span>
                    <span className="text-[10px] font-extrabold text-[#0F1E3D] block capitalize">
                      {selected.client_type ?? "—"}
                    </span>
                  </div>
                  <div className="bg-[#F8FAFC] rounded-xl p-3 border border-[#0F1E3D]/5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#0F1E3D]/40 mb-1 block">Retainer</span>
                    <span className="text-[10px] font-extrabold text-[#0F1E3D] block">
                      {selected.retainer_amount ? `$${Number(selected.retainer_amount).toLocaleString()}/mo` : "—"}
                    </span>
                  </div>
                </div>

                {/* Contact Info */}
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--brand-primary)]/40 mb-3 ml-1">Contact Information</h4>
                  <div className="space-y-2">
                    {(selected.contact_email || selected.email) && (
                      <a
                        href={`mailto:${selected.contact_email ?? selected.email}`}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#F8FAFC] border border-transparent hover:border-[#0F1E3D]/5 transition-all text-left group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#0F1E3D]/5 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
                          <Mail className="h-3.5 w-3.5 text-[#1E3A8A]" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-bold text-[var(--brand-primary)]/40 uppercase tracking-widest">Email</p>
                          <p className="text-[10px] font-bold text-[#0F1E3D] truncate">{selected.contact_email ?? selected.email}</p>
                        </div>
                      </a>
                    )}
                    {selected.phone && (
                      <div className="w-full flex items-center gap-3 p-3 rounded-xl border border-transparent hover:border-[#0F1E3D]/5 hover:bg-[#F8FAFC] group transition-all cursor-pointer">
                        <div className="w-8 h-8 rounded-lg bg-[#0F1E3D]/5 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm">
                          <Phone className="h-3.5 w-3.5 text-[#1E3A8A]" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-bold text-[var(--brand-primary)]/40 uppercase tracking-widest">Phone</p>
                          <p className="text-[10px] font-bold text-[#0F1E3D] truncate">{selected.phone}</p>
                        </div>
                      </div>
                    )}
                    {selected.site && (
                      <a
                        href={selected.site.startsWith("http") ? selected.site : `https://${selected.site}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center gap-3 p-3 rounded-xl border border-transparent hover:border-[#0F1E3D]/5 hover:bg-[#F8FAFC] group transition-all"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#0F1E3D]/5 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm">
                          <Building2 className="h-3.5 w-3.5 text-[#1E3A8A]" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-bold text-[var(--brand-primary)]/40 uppercase tracking-widest">Website</p>
                          <p className="text-[10px] font-bold text-[#1E3A8A] truncate hover:underline">{selected.site}</p>
                        </div>
                      </a>
                    )}
                  </div>
                </div>

                {/* Discovery Brief */}
                {selected.onboarding_completed && selected.business_profile ? (
                  <div className="border-t border-[#0F1E3D]/5 pt-5 pb-2">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-[#1E3A8A] border border-[#1E3A8A]/20 bg-[#1E3A8A]/5 px-3 py-1.5 rounded-lg inline-flex items-center gap-2 mb-4">
                      <Sparkles className="h-3 w-3" /> Discovery Brief
                    </h4>
                    
                    <div className="space-y-3">
                       {selected.business_profile.industry && (
                          <div className="bg-[#F8FAFC] rounded-xl p-3 border border-[#0F1E3D]/5">
                             <p className="text-[10px] font-black uppercase tracking-widest text-[var(--brand-primary)]/40 mb-1 pointer-events-none">Industry & Target</p>
                             <p className="text-[10px] font-bold text-[#0F1E3D]">{selected.business_profile.industry} • {selected.business_profile.targetAudience || 'Unknown Audience'}</p>
                          </div>
                       )}
                       {selected.business_profile.biggestChallenge && (
                          <div className="bg-red-50/50 rounded-xl p-3 border border-red-100">
                             <p className="text-[10px] font-black uppercase tracking-widest text-red-800/60 mb-1 pointer-events-none">Biggest Challenge</p>
                             <p className="text-[10px] font-bold text-red-900">{selected.business_profile.biggestChallenge}</p>
                          </div>
                       )}
                       {selected.business_profile.primaryGoal && (
                          <div className="bg-blue-50/50 rounded-xl p-3 border border-blue-100">
                             <p className="text-[10px] font-black uppercase tracking-widest text-blue-800/60 mb-1 pointer-events-none">Primary Goal</p>
                             <p className="text-[10px] font-bold text-blue-900">{selected.business_profile.primaryGoal}</p>
                          </div>
                       )}
                       
                       {/* Quick Stats Grid */}
                       <div className="grid grid-cols-2 gap-2 mt-2">
                           {selected.business_profile.runPaidAds && (
                              <div className="bg-[#F8FAFC] rounded-lg p-2.5 border border-[#0F1E3D]/5">
                                 <p className="text-[10px] font-black uppercase tracking-widest text-[var(--brand-primary)]/40">Running Ads</p>
                                 <p className="text-[11px] font-bold text-[#0F1E3D] mt-0.5">{selected.business_profile.runPaidAds}</p>
                              </div>
                           )}
                           {selected.business_profile.activeSocials?.length > 0 && (
                              <div className="bg-[#F8FAFC] rounded-lg p-2.5 border border-[#0F1E3D]/5">
                                 <p className="text-[10px] font-black uppercase tracking-widest text-[var(--brand-primary)]/40">Social Platforms</p>
                                 <p className="text-[11px] font-bold text-[#0F1E3D] truncate mt-0.5">{selected.business_profile.activeSocials.join(", ")}</p>
                              </div>
                           )}
                           {selected.business_profile.collectEmails === "Yes" && (
                              <div className="bg-[#F8FAFC] rounded-lg p-2.5 border border-[#0F1E3D]/5">
                                 <p className="text-[10px] font-black uppercase tracking-widest text-[var(--brand-primary)]/40">Email List</p>
                                 <p className="text-[11px] font-bold text-[#0F1E3D] truncate mt-0.5">{selected.business_profile.subscriberCount || "Yes"}</p>
                              </div>
                           )}
                           {selected.business_profile.hasBlog && (
                              <div className="bg-[#F8FAFC] rounded-lg p-2.5 border border-[#0F1E3D]/5">
                                 <p className="text-[10px] font-black uppercase tracking-widest text-[var(--brand-primary)]/40">Active Blog</p>
                                 <p className="text-[11px] font-bold text-[#0F1E3D] mt-0.5">{selected.business_profile.hasBlog}</p>
                              </div>
                           )}
                       </div>
                    </div>
                  </div>
                ) : (
                  <div className="border-t border-[#0F1E3D]/5 pt-5 pb-2">
                    <div className="bg-[#F8FAFC] rounded-xl p-3 border border-[#0F1E3D]/10 border-dashed flex flex-col items-center justify-center text-center">
                       <Sparkles className="h-5 w-5 text-[var(--brand-primary)]/20 mb-2" />
                       <p className="text-[10px] font-bold text-[var(--brand-primary)]/60">No Discovery Brief</p>
                       <p className="text-[10px] font-bold text-[var(--brand-primary)]/30 uppercase tracking-widest mt-0.5">Client has not completed onboarding.</p>
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="pt-4 flex items-center gap-3 border-t border-[#0F1E3D]/5">
                  <button
                    onClick={() => handleMessage(selected)}
                    disabled={createConv.isPending}
                    className="flex-1 px-4 py-2.5 bg-[#0F1E3D] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#1E3A8A] transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-60"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    {createConv.isPending ? "Opening..." : "Message"}
                  </button>
                  <button
                    onClick={() => openEdit(selected)}
                    className="px-4 py-2.5 bg-white border border-[#0F1E3D]/10 text-[#0F1E3D] hover:bg-[#F8FAFC] rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
                  >
                    <Edit className="h-3.5 w-3.5" /> Edit
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Add / Edit Client Modal */}
      <AnimatePresence>
        {modalMode !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-3"
            onClick={(e) => e.target === e.currentTarget && setModalMode(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg border border-[#0F1E3D]/5 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-[12px] font-extrabold text-[var(--brand-primary)]">
                    {modalMode === "add" ? "Add New Client" : "Edit Client"}
                  </h2>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--brand-primary)]/40 mt-0.5">
                    {modalMode === "add" ? "Add to your client directory" : "Update client details"}
                  </p>
                </div>
                <button onClick={() => setModalMode(null)} className="p-2 rounded-xl hover:bg-[#F8FAFC] transition-colors">
                  <X className="h-4 w-4 text-[var(--brand-primary)]/40" />
                </button>
              </div>

              <div className="space-y-4">
                <Field label="Company Name *" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="e.g. Luna Studio" />
                <Field label="Contact Email" type="email" value={form.contact_email} onChange={(v) => setForm({ ...form, contact_email: v })} placeholder="hello@company.com" />
                <Field label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} placeholder="+1 555 000 0000" />
                <Field label="Industry" value={form.industry} onChange={(v) => setForm({ ...form, industry: v })} placeholder="e.g. Technology" />
                <Field label="Website" value={form.site} onChange={(v) => setForm({ ...form, site: v })} placeholder="company.com" />

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--brand-primary)]/50 mb-1.5 block">Client Type</label>
                  <select
                    value={form.client_type}
                    onChange={(e) => setForm({ ...form, client_type: e.target.value as "invoice" | "retainer" })}
                    className="w-full bg-[#F8FAFC] border border-[#0F1E3D]/10 rounded-xl px-4 py-3 text-[10px] font-bold text-[var(--brand-primary)] focus:outline-none focus:border-[var(--brand-accent)] transition-colors"
                  >
                    <option value="invoice">Invoice (Project-based)</option>
                    <option value="retainer">Retainer (Monthly)</option>
                  </select>
                </div>

                {form.client_type === "retainer" && (
                  <Field label="Monthly Retainer ($)" type="number" value={form.retainer_amount} onChange={(v) => setForm({ ...form, retainer_amount: v })} placeholder="0.00" />
                )}

                <Field label="KPI Embed URL (optional)" value={form.kpi_embed_url} onChange={(v) => setForm({ ...form, kpi_embed_url: v })} placeholder="https://datastudio.google.com/..." />
                <Field label="Drive Link (optional)" value={form.drive_link} onChange={(v) => setForm({ ...form, drive_link: v })} placeholder="https://drive.google.com/..." />

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--brand-primary)]/50 mb-1.5 block">Client Logo</label>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#F8FAFC] border border-[#0F1E3D]/10 flex items-center justify-center overflow-hidden shrink-0">
                      {form.logo_url ? (
                        <img src={form.logo_url} alt="Logo preview" className="w-full h-full object-cover" />
                      ) : (
                        <Building2 className="w-5 h-5 text-[#0F1E3D]/20" />
                      )}
                    </div>
                    <input
                      type="file"
                      ref={logoInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleLogoUpload}
                    />
                    <div className="flex gap-2">
                       <button
                        type="button"
                        onClick={() => logoInputRef.current?.click()}
                        disabled={logoUploading}
                        className="px-3 py-2 bg-[#0F1E3D]/5 text-[9px] font-black uppercase tracking-widest text-[var(--brand-primary)] rounded-lg hover:bg-[#0F1E3D]/10 transition disabled:opacity-50"
                      >
                        {logoUploading ? "Uploading..." : "Upload Logo"}
                      </button>
                      {form.logo_url && (
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, logo_url: "" })}
                          className="px-3 py-2 text-[9px] font-black uppercase tracking-widest text-red-600 rounded-lg hover:bg-red-50 transition"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => setModalMode(null)}
                  className="flex-1 px-4 py-3 bg-[#F8FAFC] text-[var(--brand-primary)] rounded-xl text-[10px] font-black uppercase tracking-widest border border-[#0F1E3D]/10 hover:bg-[#F1F5F9] transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!form.name.trim() || saving}
                  className="flex-1 px-4 py-3 bg-[#0F1E3D] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#1E3A8A] transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving
                    ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...</>
                    : modalMode === "add" ? "Add Client" : "Save Changes"
                  }
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close dropdown */}
      {openMenuId && (
        <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
      )}
    </motion.div>
  );
}

function Field({
  label, value, onChange, placeholder, type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="text-[10px] font-black uppercase tracking-widest text-[var(--brand-primary)]/50 mb-1.5 block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#F8FAFC] border border-[#0F1E3D]/10 rounded-xl px-4 py-3 text-[10px] font-bold text-[var(--brand-primary)] placeholder:font-medium placeholder:text-[#0F1E3D]/30 focus:outline-none focus:border-[var(--brand-accent)] transition-colors"
      />
    </div>
  );
}

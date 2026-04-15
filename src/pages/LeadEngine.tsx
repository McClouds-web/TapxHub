import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, MapPin, Globe, Mail, Phone, UserPlus, Database, Loader2,
  Sparkles, AlertTriangle, Info, Plus, Trash2, Download, Check,
  ChevronRight, X, Building2, Tag, Star, ArrowRight, Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useLeads, useAddLead, useUpdateLead, useDeleteLead, Lead } from "@/hooks/useLeads";
import { useAddCompany, useConvertLead } from "@/hooks/useAppData";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Prospect {
  id: string;
  name: string;
  industry: string;
  address: string;
  website: string;
  email: string;
  phone: string;
  rating: number;
}

interface SearchError {
  message: string;
  code: string;
}

type TabId = "pipeline" | "discovery" | "list";

// ── Pipeline Stages ────────────────────────────────────────────────────────────

const STAGES: { id: Lead["pipeline_stage"]; label: string; color: string; bg: string; dot: string }[] = [
  { id: "new",        label: "New",           color: "text-sky-700",    bg: "bg-sky-50 border-sky-100",      dot: "bg-sky-500" },
  { id: "contacted",  label: "Contacted",     color: "text-indigo-700", bg: "bg-indigo-50 border-indigo-100", dot: "bg-indigo-500" },
  { id: "qualified",  label: "Qualified",     color: "text-violet-700", bg: "bg-violet-50 border-violet-100", dot: "bg-violet-500" },
  { id: "proposal",   label: "Proposal Sent", color: "text-amber-700",  bg: "bg-amber-50 border-amber-100",   dot: "bg-amber-500" },
  { id: "won",        label: "Won",           color: "text-emerald-700",bg: "bg-emerald-50 border-emerald-100",dot: "bg-emerald-500" },
  { id: "lost",       label: "Lost",          color: "text-rose-700",   bg: "bg-rose-50 border-rose-100",     dot: "bg-rose-400" },
];

const STAGE_MAP: Record<Lead["pipeline_stage"], typeof STAGES[0]> = Object.fromEntries(
  STAGES.map(s => [s.id, s])
) as any;

const INDUSTRIES = ["Restaurant", "Retail", "Healthcare", "Real Estate", "Marketing", "Technology", "Finance", "Education", "Construction", "Other"];
const SOURCES = ["Google Places", "Manual Entry", "Referral", "Social Media", "Cold Outreach", "Website", "Event"];

// ── Lead Form Modal ────────────────────────────────────────────────────────────

interface LeadFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead?: Lead | null;
  defaultStage?: Lead["pipeline_stage"];
}

function LeadFormModal({ isOpen, onClose, lead, defaultStage = "new" }: LeadFormModalProps) {
  const addLead = useAddLead();
  const updateLead = useUpdateLead();
  const deleteLead = useDeleteLead();

  const [businessName, setBusinessName] = useState(lead?.business_name ?? "");
  const [contactName, setContactName] = useState(lead?.contact_name ?? "");
  const [phone, setPhone] = useState(lead?.phone ?? "");
  const [email, setEmail] = useState(lead?.email ?? "");
  const [website, setWebsite] = useState(lead?.website ?? "");
  const [industry, setIndustry] = useState(lead?.industry ?? "");
  const [location, setLocation] = useState(lead?.location ?? "");
  const [source, setSource] = useState(lead?.lead_source ?? "Manual Entry");
  const [stage, setStage] = useState<Lead["pipeline_stage"]>(lead?.pipeline_stage ?? defaultStage);
  const [notes, setNotes] = useState(lead?.notes ?? "");

  React.useEffect(() => {
    if (isOpen) {
      setBusinessName(lead?.business_name ?? "");
      setContactName(lead?.contact_name ?? "");
      setPhone(lead?.phone ?? "");
      setEmail(lead?.email ?? "");
      setWebsite(lead?.website ?? "");
      setIndustry(lead?.industry ?? "");
      setLocation(lead?.location ?? "");
      setSource(lead?.lead_source ?? "Manual Entry");
      setStage(lead?.pipeline_stage ?? defaultStage);
      setNotes(lead?.notes ?? "");
    }
  }, [isOpen, lead, defaultStage]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!businessName.trim()) { toast.error("Business name is required"); return; }
    const payload = {
      business_name: businessName.trim(),
      contact_name: contactName.trim() || undefined,
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      website: website.trim() || undefined,
      industry: industry || undefined,
      location: location.trim() || undefined,
      lead_source: source,
      pipeline_stage: stage,
      notes: notes.trim() || undefined,
    };
    try {
      if (lead) {
        await updateLead.mutateAsync({ id: lead.id, ...payload });
        toast.success("Lead updated");
      } else {
        await addLead.mutateAsync(payload);
        toast.success(`${businessName} added to pipeline`);
      }
      onClose();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to save lead");
    }
  };

  const handleDelete = async () => {
    if (!lead) return;
    if (!confirm(`Permanently delete "${lead.business_name}"?`)) return;
    try {
      await deleteLead.mutateAsync(lead.id);
      toast.success("Lead deleted");
      onClose();
    } catch { toast.error("Failed to delete lead"); }
  };

  const isSaving = addLead.isPending || updateLead.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#0F1E3D]/40 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative bg-white w-full max-w-2xl rounded-[28px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="flex items-center justify-between px-8 py-6 border-b border-[#0F1E3D]/5 bg-[#FAFBFC] shrink-0">
          <div>
            <h2 className="text-xl font-black text-[#0F1E3D]">{lead ? "Edit Lead" : "New Lead"}</h2>
            <p className="text-[11px] text-[#0F1E3D]/40 font-medium mt-0.5">
              {lead ? `Editing ${lead.business_name}` : "Add a business to your pipeline"}
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-[#0F1E3D]/40 hover:text-[#0F1E3D] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar p-8 space-y-5">
          <div>
            <label className="block text-[11px] font-bold text-[#0F1E3D]/40 uppercase tracking-widest mb-2">Business Name *</label>
            <input
              value={businessName} onChange={e => setBusinessName(e.target.value)}
              placeholder="e.g. Acme Corp"
              className="w-full bg-[#FAFBFC] border border-[#0F1E3D]/5 rounded-2xl px-4 py-3 text-[14px] font-bold text-[#0F1E3D] outline-none focus:border-[#3b82f6] transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-[#0F1E3D]/40 uppercase tracking-widest mb-2">Contact Name</label>
              <input value={contactName} onChange={e => setContactName(e.target.value)} placeholder="John Smith"
                className="w-full bg-[#FAFBFC] border border-[#0F1E3D]/5 rounded-2xl px-4 py-3 text-[13px] font-medium text-[#0F1E3D] outline-none focus:border-[#3b82f6] transition-colors" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#0F1E3D]/40 uppercase tracking-widest mb-2">Phone</label>
              <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+267 7X XXX XXX"
                className="w-full bg-[#FAFBFC] border border-[#0F1E3D]/5 rounded-2xl px-4 py-3 text-[13px] font-medium text-[#0F1E3D] outline-none focus:border-[#3b82f6] transition-colors" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-[#0F1E3D]/40 uppercase tracking-widest mb-2">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="contact@example.com"
                className="w-full bg-[#FAFBFC] border border-[#0F1E3D]/5 rounded-2xl px-4 py-3 text-[13px] font-medium text-[#0F1E3D] outline-none focus:border-[#3b82f6] transition-colors" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#0F1E3D]/40 uppercase tracking-widest mb-2">Website</label>
              <input value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://example.com"
                className="w-full bg-[#FAFBFC] border border-[#0F1E3D]/5 rounded-2xl px-4 py-3 text-[13px] font-medium text-[#0F1E3D] outline-none focus:border-[#3b82f6] transition-colors" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-[#0F1E3D]/40 uppercase tracking-widest mb-2">Industry</label>
              <select value={industry} onChange={e => setIndustry(e.target.value)}
                className="w-full bg-[#FAFBFC] border border-[#0F1E3D]/5 rounded-2xl px-4 py-3 text-[13px] font-medium text-[#0F1E3D] outline-none focus:border-[#3b82f6] transition-colors appearance-none">
                <option value="">Select Industry</option>
                {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#0F1E3D]/40 uppercase tracking-widest mb-2">Location</label>
              <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Gaborone, Botswana"
                className="w-full bg-[#FAFBFC] border border-[#0F1E3D]/5 rounded-2xl px-4 py-3 text-[13px] font-medium text-[#0F1E3D] outline-none focus:border-[#3b82f6] transition-colors" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-[#0F1E3D]/40 uppercase tracking-widest mb-2">Lead Source</label>
              <select value={source} onChange={e => setSource(e.target.value)}
                className="w-full bg-[#FAFBFC] border border-[#0F1E3D]/5 rounded-2xl px-4 py-3 text-[13px] font-medium text-[#0F1E3D] outline-none focus:border-[#3b82f6] transition-colors appearance-none">
                {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#0F1E3D]/40 uppercase tracking-widest mb-2">Pipeline Stage</label>
              <select value={stage} onChange={e => setStage(e.target.value as Lead["pipeline_stage"])}
                className="w-full bg-[#FAFBFC] border border-[#0F1E3D]/5 rounded-2xl px-4 py-3 text-[13px] font-medium text-[#0F1E3D] outline-none focus:border-[#3b82f6] transition-colors appearance-none">
                {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#0F1E3D]/40 uppercase tracking-widest mb-2">Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
              placeholder="Add context, qualifications, or follow-up details..."
              className="w-full bg-[#FAFBFC] border border-[#0F1E3D]/5 rounded-2xl px-4 py-3 text-[13px] font-medium text-[#0F1E3D] outline-none focus:border-[#3b82f6] transition-colors resize-none" />
          </div>
        </div>

        <div className="flex items-center justify-between px-8 py-5 border-t border-[#0F1E3D]/5 bg-[#FAFBFC] shrink-0">
          {lead ? (
            <button onClick={handleDelete} className="p-3 text-rose-500 bg-rose-50 hover:bg-rose-100 rounded-2xl transition-colors">
              <Trash2 className="w-5 h-5" />
            </button>
          ) : <div />}
          <button
            disabled={!businessName.trim() || isSaving}
            onClick={handleSave}
            className="px-8 py-3.5 bg-[#0F1E3D] hover:bg-[#1a365d] disabled:opacity-50 text-white text-[13px] font-bold tracking-wide rounded-[16px] shadow-md transition-all flex items-center gap-2"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {lead ? "Save Changes" : "Add to Pipeline"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Lead Card ──────────────────────────────────────────────────────────────────

interface LeadCardProps {
  lead: Lead;
  onEdit: (lead: Lead) => void;
  onConvert: (lead: Lead) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
}

function LeadCard({ lead, onEdit, onConvert, onDragStart }: LeadCardProps) {
  const stage = STAGE_MAP[lead.pipeline_stage];
  return (
    <motion.div
      layoutId={lead.id}
      draggable
      onDragStart={(e: any) => onDragStart(e, lead.id)}
      onClick={() => onEdit(lead)}
      whileHover={{ y: -2 }}
      className="bg-white rounded-2xl p-4 shadow-sm border border-[#0F1E3D]/5 cursor-pointer hover:shadow-md hover:border-[#0F1E3D]/10 transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold", stage.bg, stage.color)}>
          <span className={cn("w-1.5 h-1.5 rounded-full", stage.dot)} />
          {stage.label}
        </div>
        {lead.pipeline_stage === "won" && (
          <button
            onClick={e => { e.stopPropagation(); onConvert(lead); }}
            className="px-2.5 py-1 bg-emerald-500 text-white text-[10px] font-bold rounded-full hover:bg-emerald-600 transition-colors flex items-center gap-1"
          >
            <ArrowRight className="w-3 h-3" /> Convert
          </button>
        )}
      </div>

      <h4 className="text-[13px] font-black text-[#0F1E3D] leading-snug mb-1">{lead.business_name}</h4>
      {lead.contact_name && (
        <p className="text-[11px] font-medium text-[#0F1E3D]/50 mb-2">{lead.contact_name}</p>
      )}

      <div className="flex flex-wrap gap-1.5 mt-3">
        {lead.industry && (
          <span className="flex items-center gap-1 text-[10px] font-bold bg-[#F4F5F7] text-[#0F1E3D]/60 px-2 py-0.5 rounded-full">
            <Tag className="w-2.5 h-2.5" /> {lead.industry}
          </span>
        )}
        {lead.location && (
          <span className="flex items-center gap-1 text-[10px] font-bold bg-[#F4F5F7] text-[#0F1E3D]/60 px-2 py-0.5 rounded-full">
            <MapPin className="w-2.5 h-2.5" /> {lead.location}
          </span>
        )}
      </div>

      {(lead.phone || lead.email) && (
        <div className="mt-3 pt-3 border-t border-[#0F1E3D]/5 flex flex-col gap-1">
          {lead.phone && (
            <a href={`tel:${lead.phone}`} onClick={e => e.stopPropagation()} className="flex items-center gap-1.5 text-[10px] font-medium text-[#0F1E3D]/50 hover:text-[#3b82f6] transition-colors">
              <Phone className="w-3 h-3" /> {lead.phone}
            </a>
          )}
          {lead.email && (
            <a href={`mailto:${lead.email}`} onClick={e => e.stopPropagation()} className="flex items-center gap-1.5 text-[10px] font-medium text-[#0F1E3D]/50 hover:text-[#3b82f6] transition-colors">
              <Mail className="w-3 h-3" /> {lead.email}
            </a>
          )}
        </div>
      )}
    </motion.div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function LeadEngine() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>("pipeline");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [defaultStage, setDefaultStage] = useState<Lead["pipeline_stage"]>("new");
  const [search, setSearch] = useState("");
  const [filterStage, setFilterStage] = useState<Lead["pipeline_stage"] | "all">("all");
  const [filterIndustry, setFilterIndustry] = useState("");
  const [filterSource, setFilterSource] = useState("");

  // Discovery
  const [keyword, setKeyword] = useState("");
  const [discoveryLocation, setDiscoveryLocation] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState<Prospect[]>([]);
  const [searchError, setSearchError] = useState<SearchError | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  // Drag-and-drop
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const { data: leads = [], isLoading, isError, error } = useLeads();
  const addLead = useAddLead();
  const updateLead = useUpdateLead();
  const convertLead = useConvertLead();

  React.useEffect(() => {
    if (isError) console.error("LeadEngine failed to load data:", error);
  }, [isError, error]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-white rounded-3xl border border-[#0F1E3D]/5">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  const filteredLeads = leads.filter(l => {
    const matchesSearch = !search.trim() ||
      l.business_name.toLowerCase().includes(search.toLowerCase()) ||
      (l.contact_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (l.location ?? "").toLowerCase().includes(search.toLowerCase());
    const matchesStage = filterStage === "all" || l.pipeline_stage === filterStage;
    const matchesIndustry = !filterIndustry || l.industry === filterIndustry;
    const matchesSource = !filterSource || l.lead_source === filterSource;
    return matchesSearch && matchesStage && matchesIndustry && matchesSource;
  });

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggingId(id);
    e.dataTransfer.setData("leadId", id);
  };

  const handleDrop = async (e: React.DragEvent, stage: Lead["pipeline_stage"]) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData("leadId");
    if (!leadId) return;
    const lead = leads.find(l => l.id === leadId);
    if (!lead || lead.pipeline_stage === stage) { setDraggingId(null); return; }
    try {
      await updateLead.mutateAsync({ id: leadId, pipeline_stage: stage });
      if (stage === "won") toast.success(`🎉 ${lead.business_name} moved to Won!`);
    } catch { toast.error("Failed to move lead"); }
    setDraggingId(null);
  };

  const handleConvert = async (lead: Lead) => {
    if (!confirm(`Convert "${lead.business_name}" to a Client?`)) return;
    try {
      await convertLead.mutateAsync({ leadId: lead.id, adminId: user?.id || '' });
      toast.success(`✅ ${lead.business_name} converted to client!`);
    } catch (e: any) {
      toast.error(e?.message ?? "Conversion failed");
    }
  };

  const handleScan = async () => {
    if (!keyword.trim() || !discoveryLocation.trim()) {
      toast.error("Enter both a keyword and location to search");
      return;
    }
    setIsScanning(true); setResults([]); setSearchError(null);
    try {
      const { data, error } = await supabase.functions.invoke("search_places", {
        body: { keyword: keyword.trim(), location: discoveryLocation.trim() },
      });
      if (error) { setSearchError({ code: "FUNCTION_UNAVAILABLE", message: error.message }); return; }
      if (data?.success === false || data?.error) {
        const msg = data?.error ?? "Search failed";
        const code = data?.code ?? "UNKNOWN";
        if (code === "ZERO_RESULTS") { toast.info(`No results for "${keyword}" in ${discoveryLocation}`); return; }
        setSearchError({ message: msg, code });
        return;
      }
      const found: Prospect[] = data?.results ?? [];
      setResults(found);
      if (found.length === 0) toast.info("No results found.");
      else toast.success(`Found ${found.length} businesses in ${discoveryLocation}`);
    } catch (err: any) {
      setSearchError({ code: "UNEXPECTED", message: err?.message ?? "Unexpected error" });
    } finally { setIsScanning(false); }
  };

  const saveProspectAsLead = async (p: Prospect) => {
    if (savedIds.has(p.id)) return;
    try {
      await addLead.mutateAsync({
        business_name: p.name, industry: p.industry, location: p.address,
        website: p.website, email: p.email, phone: p.phone,
        lead_source: "Google Places", pipeline_stage: "new",
      });
      setSavedIds(prev => new Set(prev).add(p.id));
      toast.success(`${p.name} added to pipeline!`);
    } catch { toast.error("Failed to save lead"); }
  };

  const handleExportCSV = () => {
    if (!leads.length) return;
    const headers = ["Business Name", "Contact", "Phone", "Email", "Website", "Industry", "Location", "Source", "Stage", "Notes", "Created"];
    const rows = leads.map(l => [
      l.business_name, l.contact_name ?? "", l.phone ?? "", l.email ?? "",
      l.website ?? "", l.industry ?? "", l.location ?? "", l.lead_source ?? "",
      l.pipeline_stage, l.notes ?? "", l.created_at ? new Date(l.created_at).toLocaleDateString() : "",
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(","));
    const blob = new Blob([[headers.join(","), ...rows].join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `leads_${new Date().toISOString().slice(0,10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
    toast.success("CSV exported");
  };

  const openNewLead = (stage: Lead["pipeline_stage"] = "new") => {
    setEditingLead(null); setDefaultStage(stage); setModalOpen(true);
  };
  const openEditLead = (lead: Lead) => { setEditingLead(lead); setModalOpen(true); };

  const stats = STAGES.map(s => ({ ...s, count: leads.filter(l => l.pipeline_stage === s.id).length }));

  const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: "pipeline",  label: "Pipeline",  icon: <Database className="w-3.5 h-3.5" /> },
    { id: "discovery", label: "Discovery", icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: "list",      label: "List View", icon: <Filter className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="flex flex-col h-full gap-6 pb-10 overflow-y-auto no-scrollbar">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0F1E3D] flex items-center justify-center shadow-lg">
            <Database className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-[#0F1E3D]">Lead Engine</h1>
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#0F1E3D]/30 mt-0.5">
              {leads.length} leads · {leads.filter(l => l.pipeline_stage === "won").length} won
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-white/80 border border-[#0F1E3D]/5 rounded-xl p-1 gap-0.5 shadow-sm">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={cn("px-4 py-2 rounded-[10px] text-[11px] font-bold tracking-wide transition-all flex items-center gap-2",
                  activeTab === t.id ? "bg-[#0F1E3D] text-white shadow" : "text-[#0F1E3D]/40 hover:text-[#0F1E3D]")}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>
          <button onClick={() => openNewLead()}
            className="flex items-center gap-2 px-4 py-2 bg-[#3b82f6] text-white text-[11px] font-bold rounded-xl shadow hover:bg-[#2563eb] transition-colors">
            <Plus className="w-4 h-4" /> Add Lead
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 shrink-0">
        {stats.map(s => (
          <div key={s.id} onClick={() => setFilterStage(filterStage === s.id ? "all" : s.id)}
            className={cn("rounded-2xl border px-4 py-3 cursor-pointer transition-all",
              filterStage === s.id ? cn(s.bg, "shadow-sm scale-[1.02]") : "bg-white border-[#0F1E3D]/5 hover:border-[#0F1E3D]/10")}>
            <p className="text-[10px] font-bold text-[#0F1E3D]/40 uppercase tracking-widest mb-1">{s.label}</p>
            <p className={cn("text-2xl font-black", s.color)}>{s.count}</p>
          </div>
        ))}
      </div>

      {/* Pipeline Tab */}
      {activeTab === "pipeline" && (
        <div className="flex-1 min-h-0">
          <div className="flex gap-4 h-full overflow-x-auto pb-4 no-scrollbar">
            {STAGES.map(col => {
              const colLeads = filteredLeads.filter(l => l.pipeline_stage === col.id);
              return (
                <div key={col.id}
                  className={cn("w-[280px] shrink-0 flex flex-col rounded-2xl border transition-all min-h-[400px]",
                    draggingId ? "border-dashed border-2" : "border-transparent",
                    draggingId && col.id === "won" ? "border-emerald-300 bg-emerald-50/30" :
                    draggingId && col.id === "lost" ? "border-rose-300 bg-rose-50/30" :
                    draggingId ? `bg-[#F8FAFC] ${col.bg}` : "")}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => handleDrop(e, col.id)}>
                  <div className="flex items-center justify-between p-3 mb-1">
                    <div className="flex items-center gap-2">
                      <span className={cn("w-2 h-2 rounded-full", col.dot)} />
                      <span className="text-[12px] font-black text-[#0F1E3D]">{col.label}</span>
                      <span className="text-[10px] font-bold text-[#0F1E3D]/40 bg-white border border-[#0F1E3D]/5 px-2 py-0.5 rounded-full shadow-sm">{colLeads.length}</span>
                    </div>
                    <button onClick={() => openNewLead(col.id)} className="p-1.5 text-[#0F1E3D]/30 hover:text-[#0F1E3D] hover:bg-white rounded-lg transition-all">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex-1 flex flex-col gap-2.5 overflow-y-auto no-scrollbar px-2 pb-2">
                    {colLeads.length === 0 ? (
                      <div onClick={() => openNewLead(col.id)}
                        className="flex-1 border-2 border-dashed border-[#0F1E3D]/5 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#3b82f6]/30 hover:bg-[#F8FAFC]/50 transition-all min-h-[120px]">
                        <Plus className="w-5 h-5 text-[#0F1E3D]/20" />
                        <span className="text-[10px] font-bold text-[#0F1E3D]/20">Create your first lead</span>
                      </div>
                    ) : (
                      <AnimatePresence>
                        {colLeads.map(lead => (
                          <LeadCard key={lead.id} lead={lead} onEdit={openEditLead} onConvert={handleConvert} onDragStart={handleDragStart} />
                        ))}
                      </AnimatePresence>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Discovery Tab */}
      {activeTab === "discovery" && (
        <div className="flex flex-col gap-4 flex-1">
          <div className="bg-white rounded-2xl border border-[#0F1E3D]/5 p-4 flex flex-col md:flex-row items-center gap-3 shadow-sm">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0F1E3D]/30" />
              <input type="text" placeholder="Industry? (e.g. Restaurants)" value={keyword} onChange={e => setKeyword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleScan()}
                className="w-full bg-[#FAFBFC] border border-[#0F1E3D]/5 text-[13px] font-medium rounded-xl pl-11 pr-4 py-3 outline-none focus:border-[#3b82f6] transition-all" />
            </div>
            <div className="relative flex-1 w-full">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0F1E3D]/30" />
              <input type="text" placeholder="Location? (e.g. Gaborone)" value={discoveryLocation} onChange={e => setDiscoveryLocation(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleScan()}
                className="w-full bg-[#FAFBFC] border border-[#0F1E3D]/5 text-[13px] font-medium rounded-xl pl-11 pr-4 py-3 outline-none focus:border-[#3b82f6] transition-all" />
            </div>
            <button onClick={handleScan} disabled={isScanning}
              className="flex items-center gap-2 px-6 py-3 bg-[#0F1E3D] hover:bg-indigo-600 text-white rounded-xl text-[13px] font-bold transition-all disabled:opacity-60 shadow-md whitespace-nowrap">
              {isScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {isScanning ? "Scanning..." : "Search Businesses"}
            </button>
          </div>

          <AnimatePresence>
            {searchError && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="flex gap-4 p-4 bg-rose-50 border border-rose-200 rounded-2xl">
                <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-[12px] font-bold text-rose-700">{searchError.code}</p>
                  <p className="text-[12px] text-rose-600 mt-0.5">{searchError.message}</p>
                </div>
                <button onClick={() => setSearchError(null)} className="text-rose-400 hover:text-rose-600"><X className="w-4 h-4" /></button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex-1 min-h-[300px] relative">
            {isScanning ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white rounded-2xl border border-dashed border-[#0F1E3D]/10">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
                <p className="text-[13px] font-bold text-[#0F1E3D]">Scanning {discoveryLocation}...</p>
              </div>
            ) : results.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {results.map(p => {
                  const isSaved = savedIds.has(p.id) || leads.some(l => l.business_name === p.name);
                  return (
                    <motion.div key={p.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-2xl border border-[#0F1E3D]/5 p-5 flex flex-col shadow-sm hover:shadow-md hover:-translate-y-1 transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-9 h-9 rounded-xl bg-[#F4F5F7] flex items-center justify-center">
                          <Globe className="w-4 h-4 text-indigo-500" />
                        </div>
                        <span className="flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                          <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" /> {p.rating}
                        </span>
                      </div>
                      <h3 className="text-[13px] font-black text-[#0F1E3D] leading-snug mb-0.5">{p.name}</h3>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#0F1E3D]/30 mb-3">{p.industry}</p>
                      <div className="space-y-1.5 mt-auto pt-3 border-t border-[#0F1E3D]/5">
                        {p.address && <p className="flex items-center gap-1.5 text-[10px] text-[#0F1E3D]/50"><MapPin className="w-3 h-3 text-rose-400" /> {p.address}</p>}
                        {p.phone && <p className="flex items-center gap-1.5 text-[10px] text-[#0F1E3D]/50"><Phone className="w-3 h-3 text-blue-400" /> {p.phone}</p>}
                      </div>
                      <button onClick={() => saveProspectAsLead(p)} disabled={isSaved || addLead.isPending}
                        className={cn("mt-4 w-full py-2.5 rounded-xl text-[11px] font-bold flex items-center justify-center gap-2 transition-all",
                          isSaved ? "bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-default" : "bg-indigo-600 text-white hover:bg-[#0F1E3D] shadow-sm")}>
                        {isSaved ? <><Check className="w-3.5 h-3.5" /> Saved</> : <><UserPlus className="w-3.5 h-3.5" /> Add to Pipeline</>}
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white rounded-2xl border border-dashed border-[#0F1E3D]/10">
                <Database className="w-10 h-10 text-[#0F1E3D]/10 mb-3" />
                <p className="text-[12px] font-bold text-[#0F1E3D]/30">Ready to Discover</p>
                <p className="text-[11px] text-[#0F1E3D]/20 mt-1">Enter keyword + location above to begin</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* List Tab */}
      {activeTab === "list" && (
        <div className="flex-1 bg-white rounded-2xl border border-[#0F1E3D]/5 overflow-hidden flex flex-col shadow-sm">
          <div className="px-6 py-4 border-b border-[#0F1E3D]/5 bg-[#FAFBFC] flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full max-w-sm">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0F1E3D]/30" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search leads..."
                className="w-full bg-white border border-[#0F1E3D]/5 text-[13px] rounded-xl pl-11 pr-4 py-2.5 outline-none focus:border-[#3b82f6] transition-all" />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <select value={filterStage} onChange={e => setFilterStage(e.target.value as any)}
                className="bg-white border border-[#0F1E3D]/5 text-[12px] font-medium rounded-xl px-3 py-2.5 outline-none focus:border-[#3b82f6] text-[#0F1E3D]">
                <option value="all">All Stages</option>
                {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
              <select value={filterIndustry} onChange={e => setFilterIndustry(e.target.value)}
                className="bg-white border border-[#0F1E3D]/5 text-[12px] font-medium rounded-xl px-3 py-2.5 outline-none focus:border-[#3b82f6] text-[#0F1E3D]">
                <option value="">All Industries</option>
                {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
              <select value={filterSource} onChange={e => setFilterSource(e.target.value)}
                className="bg-white border border-[#0F1E3D]/5 text-[12px] font-medium rounded-xl px-3 py-2.5 outline-none focus:border-[#3b82f6] text-[#0F1E3D]">
                <option value="">All Sources</option>
                {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <button onClick={handleExportCSV} disabled={!leads.length}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#0F1E3D]/5 text-[12px] font-bold rounded-xl text-[#0F1E3D] hover:bg-[#F4F5F7] transition-all disabled:opacity-40">
                <Download className="w-3.5 h-3.5" /> Export CSV
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar">
            {filteredLeads.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-16">
                <Database className="w-10 h-10 text-[#0F1E3D]/10 mb-3" />
                <p className="text-[13px] font-bold text-[#0F1E3D]/30">No leads yet. Add your first lead.</p>
                <p className="text-[11px] text-[#0F1E3D]/20 mt-1">Create your first lead from the Pipeline or Discovery tab</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-white/90 backdrop-blur-sm border-b border-[#0F1E3D]/5 z-10">
                  <tr>
                    {["Business", "Contact", "Stage", "Industry", "Location", "Source", "Actions"].map(h => (
                      <th key={h} className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-[#0F1E3D]/30">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#0F1E3D]/5">
                  {filteredLeads.map(lead => {
                    const stage = STAGE_MAP[lead.pipeline_stage];
                    return (
                      <tr key={lead.id} className="hover:bg-[#FAFBFC] transition-all group">
                        <td className="px-5 py-4">
                          <p className="text-[13px] font-bold text-[#0F1E3D]">{lead.business_name}</p>
                          {lead.email && <p className="text-[10px] text-[#0F1E3D]/40 mt-0.5">{lead.email}</p>}
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-[12px] font-medium text-[#0F1E3D]/70">{lead.contact_name ?? "—"}</p>
                          {lead.phone && <p className="text-[10px] text-[#0F1E3D]/40">{lead.phone}</p>}
                        </td>
                        <td className="px-5 py-4">
                          <select value={lead.pipeline_stage}
                            onChange={async e => {
                              const newStage = e.target.value as Lead["pipeline_stage"];
                              await updateLead.mutateAsync({ id: lead.id, pipeline_stage: newStage });
                            }}
                            className={cn("text-[11px] font-bold px-2.5 py-1.5 rounded-lg border cursor-pointer focus:outline-none appearance-none pr-6", stage.bg, stage.color)}>
                            {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                          </select>
                        </td>
                        <td className="px-5 py-4 text-[12px] text-[#0F1E3D]/50">{lead.industry ?? "—"}</td>
                        <td className="px-5 py-4 text-[12px] text-[#0F1E3D]/50">{lead.location ?? "—"}</td>
                        <td className="px-5 py-4 text-[12px] text-[#0F1E3D]/50">{lead.lead_source ?? "—"}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <button onClick={() => openEditLead(lead)}
                              className="p-2 bg-[#F4F5F7] text-[#0F1E3D]/50 hover:text-[#0F1E3D] rounded-xl transition-all text-[11px] font-bold">Edit</button>
                            {lead.pipeline_stage === "won" && (
                              <button onClick={() => handleConvert(lead)}
                                className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-xl transition-all text-[11px] font-bold flex items-center gap-1">
                                <ArrowRight className="w-3.5 h-3.5" /> Convert
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      <AnimatePresence>
        {modalOpen && (
          <LeadFormModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditingLead(null); }}
            lead={editingLead} defaultStage={defaultStage} />
        )}
      </AnimatePresence>
    </div>
  );
}

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, MapPin, Globe, Mail, Phone, 
  ExternalLink, UserPlus, Database, Loader2, 
  Sparkles, Filter, Download, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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

const MOCK_RESULTS: Prospect[] = [
  { id: "1", name: "Apex Dental Studio", industry: "Dentistry", address: "12 Baker St, London", website: "apexdental.co.uk", email: "info@apexdental.co.uk", phone: "+44 20 7123 4567", rating: 4.8 },
  { id: "2", name: "Greenfield Law Firm", industry: "Legal", address: "88 Chancery Ln, London", website: "greenfieldlaw.com", email: "contact@greenfieldlaw.com", phone: "+44 20 7890 1234", rating: 4.5 },
  { id: "3", name: "NovaTech Solutions", industry: "IT Services", address: "Tech City, Shoreditch", website: "novatech.io", email: "hello@novatech.io", phone: "+44 20 8990 4433", rating: 4.9 },
  { id: "4", name: "Bloom Marketing", industry: "Marketing", address: "Soho Square, London", website: "bloom.agency", email: "leads@bloom.agency", phone: "+44 20 7665 1122", rating: 4.2 },
];

export default function LeadEngine() {
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState<Prospect[]>([]);
  const [savedLeads, setSavedLeads] = useState<Prospect[]>([]);
  const [activeTab, setActiveTab] = useState<"search" | "database">("search");
  
  // Outreach Modal state
  const [outreachModal, setOutreachModal] = useState<{ open: boolean; lead: Prospect | null }>({
    open: false,
    lead: null
  });
  const [emailContent, setEmailContent] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleScan = () => {
    if (!keyword || !location) {
      toast.error("Please enter both a keyword and location");
      return;
    }
    setIsScanning(true);
    setResults([]);
    
    setTimeout(() => {
      setResults(MOCK_RESULTS);
      setIsScanning(false);
      toast.success(`Found ${MOCK_RESULTS.length} verified businesses in ${location}`);
    }, 2500);
  };

  const saveLead = (lead: Prospect) => {
    if (savedLeads.find(l => l.id === lead.id)) {
      toast.error("Lead already saved to database");
      return;
    }
    setSavedLeads(prev => [...prev, lead]);
    toast.success(`${lead.name} saved to your Prospect Database!`);
  };

  const handleSendEmail = () => {
    if (!emailContent.trim()) return;
    setIsSending(true);
    
    // Simulate Edge Function Call
    setTimeout(() => {
      toast.success(`Email successfully sent to ${outreachModal.lead?.name}!`);
      setIsSending(false);
      setOutreachModal({ open: false, lead: null });
      setEmailContent("");
    }, 1500);
  };

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  return (
    <div className="flex flex-col h-full gap-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-2">
             <div className="w-10 h-10 rounded-2xl bg-[#0F1E3D] flex items-center justify-center shadow-lg shadow-[#0F1E3D]/10">
                <Database className="w-5 h-5 text-indigo-400" />
             </div>
             <div>
                <h1 className="text-3xl font-black tracking-tight text-[#0F1E3D]">Lead Engine</h1>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#0F1E3D]/30">Outreach Station v2.0</p>
             </div>
          </div>
        </div>

        <div className="flex bg-white/50 backdrop-blur-md border border-[#0F1E3D]/5 rounded-2xl p-1 shadow-sm">
           <button 
              onClick={() => setActiveTab("search")}
              className={cn("px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", activeTab === "search" ? "bg-[#0F1E3D] text-white shadow-lg shadow-[#0F1E3D]/20" : "text-[#0F1E3D]/40 hover:text-[#0F1E3D]")}
           >
             Discovery
           </button>
           <button 
              onClick={() => setActiveTab("database")}
              className={cn("px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2", activeTab === "database" ? "bg-[#0F1E3D] text-white shadow-lg shadow-[#0F1E3D]/20" : "text-[#0F1E3D]/40 hover:text-[#0F1E3D]")}
           >
             Database {savedLeads.length > 0 && <span className="bg-rose-500 text-white px-1.5 py-0.5 rounded-full text-[8px]">{savedLeads.length}</span>}
           </button>
        </div>
      </div>

      {activeTab === "search" ? (
        <>
          {/* Search Controls */}
          <div className="glass-card p-4 md:p-6 flex flex-col md:flex-row items-center gap-4 border-[#0F1E3D]/5 shadow-xl shadow-[#0F1E3D]/5">
            <div className="relative flex-1 group w-full">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0F1E3D]/30 group-focus-within:text-indigo-600 transition-colors" />
               <input 
                 type="text" 
                 placeholder="Industry? (e.g. Dentists)"
                 className="w-full bg-[#F8FAFC] border border-[#0F1E3D]/5 text-sm font-bold rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-600/30 transition-all shadow-inner"
                 value={keyword}
                 onChange={(e) => setKeyword(e.target.value)}
               />
            </div>
            <div className="relative flex-1 group w-full">
               <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0F1E3D]/30 group-focus-within:text-red-500 transition-colors" />
               <input 
                 type="text" 
                 placeholder="Location? (e.g. London)"
                 className="w-full bg-[#F8FAFC] border border-[#0F1E3D]/5 text-sm font-bold rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:ring-4 focus:ring-red-500/5 focus:border-red-600/30 transition-all shadow-inner"
                 value={location}
                 onChange={(e) => setLocation(e.target.value)}
               />
            </div>
            <button onClick={handleScan} disabled={isScanning} className="w-full md:w-auto px-8 py-4 bg-[#0F1E3D] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-600/20 active:scale-95 flex items-center justify-center gap-3">
              {isScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {isScanning ? "Scanning..." : "Ignite Search"}
            </button>
          </div>

          {/* Results Grid */}
          <div className="flex-1 relative min-h-[400px]">
            <AnimatePresence mode="wait">
              {isScanning ? (
                <motion.div key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col items-center justify-center glass-card border-dashed border-2 border-[#0F1E3D]/10 rounded-[3rem] bg-white/50 backdrop-blur-3xl">
                  <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
                  <h3 className="text-xl font-black text-[#0F1E3D]">Extracting Local Data...</h3>
                </motion.div>
              ) : results.length > 0 ? (
                <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-1">
                  {results.map((p) => (
                    <motion.div key={p.id} variants={item} className="glass-card p-6 flex flex-col group hover:-translate-y-2 hover:shadow-2xl transition-all duration-500 cursor-pointer border-[#0F1E3D]/5">
                      <div className="flex justify-between items-start mb-4">
                         <div className="w-10 h-10 rounded-xl bg-[#F8FAFC] border border-[#0F1E3D]/5 flex items-center justify-center shadow-inner group-hover:bg-white transition-colors">
                            <Globe className="w-4 h-4 text-indigo-500" />
                         </div>
                         <div className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 text-[9px] font-black uppercase tracking-tighter">{p.rating} ★</div>
                      </div>
                      <h3 className="text-lg font-black text-[#0F1E3D] leading-tight mb-1 group-hover:text-indigo-600 transition-colors line-clamp-1">{p.name}</h3>
                      <p className="text-[9px] font-black uppercase tracking-widest text-[#0F1E3D]/30 mb-4">{p.industry}</p>
                      
                      <div className="space-y-2 mt-auto pt-4 border-t border-[#0F1E3D]/5">
                         <div className="flex items-center gap-2.5">
                            <MapPin className="w-3 h-3 text-red-500" />
                            <span className="text-[10px] font-medium text-[#0F1E3D]/60 truncate">{p.address}</span>
                         </div>
                      </div>

                      <div className="flex items-center gap-2 mt-6">
                         <button onClick={() => saveLead(p)} className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-[#0F1E3D] transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20">
                            <UserPlus className="w-3 h-3" /> Save to CRM
                         </button>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center glass-card border-dashed border-2 border-[#0F1E3D]/10 rounded-[3rem] opacity-60">
                   <Database className="w-8 h-8 text-[#0F1E3D]/20 mb-4" />
                   <p className="text-sm font-black text-[#0F1E3D]/30 uppercase tracking-[0.2em]">Ready to Prospect</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </>
      ) : (
        /* Database View */
        <div className="flex-1 glass-card p-0 overflow-hidden flex flex-col shadow-2xl shadow-[#0F1E3D]/10">
           <div className="px-8 py-6 border-b border-[#0F1E3D]/5 bg-[#F8FAFC]/50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-[#0F1E3D]">Prospect Database</h3>
                <p className="text-[9px] font-bold text-[#0F1E3D]/30 uppercase tracking-widest mt-1">Verified Contacts Ready for Outreach</p>
              </div>
              <button disabled={savedLeads.length === 0} className="px-4 py-2 bg-white border border-[#0F1E3D]/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-[#0F1E3D] hover:bg-[#0F1E3D] hover:text-white transition-all">
                Export to CSV
              </button>
           </div>
           <div className="flex-1 overflow-y-auto">
              {savedLeads.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-12">
                   <div className="w-16 h-16 rounded-3xl bg-[#F8FAFC] border border-[#0F1E3D]/5 flex items-center justify-center mb-4">
                      <Mail className="w-6 h-6 text-[#0F1E3D]/20" />
                   </div>
                   <p className="text-sm font-black text-[#0F1E3D]/40 uppercase tracking-widest">No candidates found in database.</p>
                   <p className="text-[10px] font-medium text-[#0F1E3D]/25 mt-1">Save a lead from the Discovery tab to see them here.</p>
                </div>
              ) : (
                <table className="w-full text-left">
                   <thead className="sticky top-0 bg-white/80 backdrop-blur-md z-10 border-b border-[#0F1E3D]/5">
                      <tr>
                        <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-[#0F1E3D]/30">Candidate</th>
                        <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-[#0F1E3D]/30">Location</th>
                        <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-[#0F1E3D]/30">Contact Info</th>
                        <th className="px-8 py-4 text-right text-[9px] font-black uppercase tracking-widest text-[#0F1E3D]/30">Outreach</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-[#0F1E3D]/5">
                      {savedLeads.map((lead) => (
                        <tr key={lead.id} className="hover:bg-[#F8FAFC]/80 transition-all group">
                           <td className="px-8 py-5">
                              <p className="text-sm font-black text-[#0F1E3D]">{lead.name}</p>
                              <p className="text-[9px] font-black uppercase tracking-widest text-[#0F1E3D]/30 mt-1">{lead.industry}</p>
                           </td>
                           <td className="px-8 py-5 text-xs font-medium text-[#0F1E3D]/50">
                              {lead.address}
                           </td>
                           <td className="px-8 py-5">
                              <div className="flex flex-col gap-1">
                                 <span className="text-xs font-bold text-[#0F1E3D]/60 flex items-center gap-1.5"><Mail className="w-3 h-3" /> {lead.email}</span>
                                 <span className="text-xs font-bold text-[#0F1E3D]/60 flex items-center gap-1.5"><Phone className="w-3 h-3" /> {lead.phone}</span>
                              </div>
                           </td>
                           <td className="px-8 py-5 text-right">
                              <button 
                                 onClick={() => setOutreachModal({ open: true, lead })}
                                 className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/10 hover:bg-[#0F1E3D] transition-all"
                              >
                                 Reach Out
                              </button>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
              )}
           </div>
        </div>
      )}

      {/* Outreach Modal (Email Station) */}
      <AnimatePresence>
         {outreachModal.open && outreachModal.lead && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOutreachModal({ open: false, lead: null })} />
               <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#0F1E3D]/10">
                  {/* Header */}
                  <div className="px-8 py-6 bg-[#0F1E3D] text-white">
                     <div className="flex items-center justify-between mb-4">
                        <div className="px-3 py-1 bg-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest">Outreach Station v2.0</div>
                        <button onClick={() => setOutreachModal({ open: false, lead: null })}><X className="w-4 h-4" /></button>
                     </div>
                     <h3 className="text-xl font-black tracking-tight tracking-tight">Email Strategy Draft</h3>
                     <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">To: {outreachModal.lead.name} ({outreachModal.lead.email})</p>
                  </div>
                  
                  {/* Body */}
                  <div className="p-8 space-y-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[#0F1E3D]/40">Sender Identity</label>
                        <div className="px-4 py-3 bg-[#F8FAFC] border border-[#0F1E3D]/5 rounded-xl text-xs font-bold text-[#0F1E3D]/70 flex items-center gap-2">
                           <UserPlus className="w-3.5 h-3.5" /> tapiwa.makore@tapxmedia.com
                        </div>
                     </div>
                     
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[#0F1E3D]/40 flex justify-between items-center">
                           Email Message
                           <span className="text-[8px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded uppercase">AI Enhanced</span>
                        </label>
                        <textarea 
                           className="w-full h-40 bg-[#F8FAFC] border border-[#0F1E3D]/10 rounded-2xl p-4 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-600/30 transition-all"
                           placeholder="Hey [Name], I saw your business at [Location]..."
                           value={emailContent || `Hi ${outreachModal.lead.name.split(' ')[0]},\n\nI was looking through businesses in ${location} and your work at ${outreachModal.lead.name} stood out. \n\nI'd love to chat about scaling your growth OS.\n\nBest,\nTapiwa Makore`}
                           onChange={(e) => setEmailContent(e.target.value)}
                        />
                     </div>
                     
                     <div className="flex items-center gap-3">
                        <button onClick={handleSendEmail} disabled={isSending} className="flex-1 py-4 bg-[#0F1E3D] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/20 disabled:opacity-50">
                           {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                           {isSending ? "Sending Outreach..." : "Send Personalized Email"}
                        </button>
                     </div>
                  </div>
                  
                  <div className="px-8 py-4 bg-[#F8FAFC] border-t border-[#0F1E3D]/5 text-center">
                     <span className="text-[9px] font-black uppercase tracking-widest text-[#0F1E3D]/20">Verified via TapxMedia Network</span>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>
    </div>
  );
}

const X = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);


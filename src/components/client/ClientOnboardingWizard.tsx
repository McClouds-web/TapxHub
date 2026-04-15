import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Check, ChevronRight, ChevronLeft, Loader2, Sparkles, Building2, 
  Target, Users, Zap, Palette, Share2, Wallet, Upload, X, CheckCircle2, Plus 
} from "lucide-react";
import { useActivateClientSystem, useUploadFile } from "@/hooks/useAppData";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const OBJECTIVES = [
  "Generate more leads", "Increase sales", "Build brand awareness", 
  "Grow social media presence", "Improve conversions", "Run paid ads", 
  "Automate marketing systems"
];

const SERVICES = [
  "Brand Strategy & Identity", "Data Analytics & Insights", "Video & Motion Systems",
  "E-Commerce & Sales Systems", "SEO & Organic Growth", "Social Media Systems",
  "Email & Lifecycle Automation", "AI Marketing Systems", "Conversational Systems",
  "Paid Media Systems", "Lead Generation & Funnels", "CRO Optimization", "Marketing Operations"
];

const PLATFORMS = ["Instagram", "Facebook", "TikTok", "LinkedIn", "X (Twitter)", "Google"];

const BRAND_VOICE_OPTS = ["Professional", "Punchy", "Luxury", "Founder-Led", "Minimalist", "Bold"];

export function ClientOnboardingWizard({ company, onClose }: { company: any; onClose: () => void }) {
  const activateSystem = useActivateClientSystem();
  const uploadFile = useUploadFile();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAssetUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && company.id) {
       try {
         await uploadFile.mutateAsync({
           file: e.target.files[0],
           companyId: company.id,
           category: "brand_assets"
         });
         toast.success("Asset secure in Vault.");
         updateField("hasLogo", true);
       } catch {
         toast.error("Upload failed.");
       }
    }
  };

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Business Profile
    businessName: company?.name || "",
    industry: "",
    website: "",
    location: "",
    contactName: "",
    contactEmail: "",
    
    // Step 2: Goals
    goals: [] as string[],
    
    // Step 3: Audience
    targetAudienceDesc: "",
    ageRange: "",
    audienceInterests: "",
    painPoints: [] as string[],
    
    // Step 4: Services
    selectedServices: [] as string[],
    
    // Step 5: Personality
    brandVoice: "",
    toneStyle: "",
    brandKeywords: [] as string[],
    brandValues: [] as string[],
    messagingDirection: "",
    
    // Step 6: Platforms
    platforms: [] as string[],
    
    // Step 7: Budget
    budgetRange: "",
    workloadLevel: "medium",
    
    // Step 8: Assets (logic only here, real upload handled later or via hook)
    hasLogo: false,
    hasBrandGuide: false
  });

  const updateField = (key: string, value: any) => setFormData(p => ({ ...p, [key]: value }));
  const toggleArray = (key: string, value: string) => {
    setFormData(p => {
      const arr = (p as any)[key] as string[];
      return {
        ...p,
        [key]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value]
      };
    });
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      const result = await activateSystem.mutateAsync({
        companyId: company.id,
        onboardingData: {
          ...formData,
          // Map frontend names to SQL schema expected keys
          brandKeywords: formData.brandKeywords,
          brandValues: formData.brandValues,
          painPoints: formData.painPoints
        }
      });
      
      setIsCompleted(true);
      toast.success("System Activated. Welcome to TapxHub.");
      setTimeout(() => onClose(), 3000);
    } catch (err: any) {
      toast.error(err.message || "Activation failed.");
      setIsSubmitting(false);
    }
  };

  const TOTAL_STEPS = 8;
  const progress = (step / TOTAL_STEPS) * 100;

  const container = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

  if (isCompleted) {
    return (
      <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[#0F1E3D] p-4 text-white">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center flex flex-col items-center">
           <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6 border border-emerald-500/20">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
           </div>
           <h2 className="text-2xl font-black uppercase tracking-tighter mb-2">Systems Online</h2>
           <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest max-w-xs leading-loose">
             Your TapxHub instance has been initialized. Workspace, Brand Brain, and Social Engine are now active for {formData.businessName}.
           </p>
           <div className="mt-8 flex gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse delay-75" />
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse delay-150" />
           </div>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0F1E3D]/60 backdrop-blur-xl p-4">
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white w-full max-w-3xl rounded-[32px] shadow-2xl overflow-hidden flex flex-col border border-white/20 max-h-[90vh]">
        
        {/* Progress Header */}
        <div className="px-8 py-6 border-b border-gray-100 shrink-0">
          <div className="flex items-center justify-between mb-4">
             <div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 block mb-1">System Initialization</span>
                <h2 className="text-[14px] font-black uppercase tracking-tight text-[#0F1E3D]">Step {step}: {
                  step === 1 ? "Business Profile" :
                  step === 2 ? "Primary Goals" :
                  step === 3 ? "Target Audience" :
                  step === 4 ? "Service Matrix" :
                  step === 5 ? "Brand Personality" :
                  step === 6 ? "Platform Activation" :
                  step === 7 ? "Capacity & Budget" : "Asset Vault"
                }</h2>
             </div>
             <div className="text-right">
                <span className="text-[10px] font-black text-slate-300">{Math.round(progress)}% Complete</span>
             </div>
          </div>
          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
             <motion.div className="h-full bg-indigo-600" animate={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-10 py-12">
          <AnimatePresence mode="wait">
            <motion.div key={step} variants={container} initial="hidden" animate="show" exit={{ opacity: 0, x: -10 }} className="space-y-8">
              
              {/* Step 1: Business Profile */}
              {step === 1 && (
                <div className="grid grid-cols-2 gap-6">
                   <div className="col-span-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Full Legal Business Name</label>
                      <input value={formData.businessName} onChange={e => updateField("businessName", e.target.value)} type="text" className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-[13px] font-bold text-[#0F1E3D] focus:ring-2 ring-indigo-500/20" placeholder="e.g. Acme Corp" />
                   </div>
                   <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Industry / Vertical</label>
                      <input value={formData.industry} onChange={e => updateField("industry", e.target.value)} type="text" className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-[13px] font-bold text-[#0F1E3D] focus:ring-2 ring-indigo-500/20" placeholder="e.g. Fintech" />
                   </div>
                   <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Website URL</label>
                      <input value={formData.website} onChange={e => updateField("website", e.target.value)} type="text" className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-[13px] font-bold text-[#0F1E3D] focus:ring-2 ring-indigo-500/20" placeholder="https://..." />
                   </div>
                   <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Contact Name</label>
                      <input value={formData.contactName} onChange={e => updateField("contactName", e.target.value)} type="text" className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-[13px] font-bold text-[#0F1E3D] focus:ring-2 ring-indigo-500/20" />
                   </div>
                   <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Contact Email</label>
                      <input value={formData.contactEmail} onChange={e => updateField("contactEmail", e.target.value)} type="email" className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-[13px] font-bold text-[#0F1E3D] focus:ring-2 ring-indigo-500/20" />
                   </div>
                </div>
              )}

              {/* Step 2: Goals */}
              {step === 2 && (
                <div className="space-y-4">
                   <p className="text-[14px] font-bold text-[#0F1E3D]">Select your primary business objectives.</p>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {OBJECTIVES.map(obj => (
                        <button key={obj} onClick={() => toggleArray("goals", obj)} className={cn("p-4 rounded-2xl border-2 text-left transition-all", formData.goals.includes(obj) ? "bg-indigo-600 border-indigo-600 text-white shadow-lg" : "bg-white border-gray-100 text-slate-500 hover:border-indigo-100")}>
                           <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold uppercase tracking-tight">{obj}</span>
                              {formData.goals.includes(obj) && <Check className="w-4 h-4" />}
                           </div>
                        </button>
                      ))}
                   </div>
                </div>
              )}

              {/* Step 3: Audience */}
              {step === 3 && (
                <div className="space-y-6">
                   <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Describe your ideal customer</label>
                      <textarea value={formData.targetAudienceDesc} onChange={e => updateField("targetAudienceDesc", e.target.value)} className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-[13px] font-bold text-[#0F1E3D] h-32 resize-none" placeholder="Who are they? What is their life like?" />
                   </div>
                   <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Age Range</label>
                        <input value={formData.ageRange} onChange={e => updateField("ageRange", e.target.value)} type="text" className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-[13px] font-bold text-[#0F1E3D]" placeholder="e.g. 25-45" />
                      </div>
                      <div>
                         <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Interests / Behavior</label>
                         <input value={formData.audienceInterests} onChange={e => updateField("audienceInterests", e.target.value)} type="text" className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-[13px] font-bold text-[#0F1E3D]" placeholder="e.g. High-net worth, tech-savvy" />
                      </div>
                   </div>
                </div>
              )}

              {/* Step 4: Services */}
              {step === 4 && (
                <div className="space-y-4">
                   <p className="text-[14px] font-bold text-[#0F1E3D]">Which TapxHub systems will you be activating?</p>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {SERVICES.map(svc => (
                        <button key={svc} onClick={() => toggleArray("selectedServices", svc)} className={cn("p-3 rounded-xl border transition-all text-left", formData.selectedServices.includes(svc) ? "bg-indigo-50 border-indigo-600 text-indigo-700 font-bold ring-2 ring-indigo-500/10" : "bg-white border-gray-100 text-slate-400 hover:border-indigo-200")}>
                           <span className="text-[10px] uppercase tracking-tighter">{svc}</span>
                        </button>
                      ))}
                   </div>
                   <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 mt-6">
                      <p className="text-[10px] font-bold text-indigo-700 italic flex items-center gap-2">
                        <Zap className="w-3.5 h-3.5" /> Selecting services will automatically create relevant task pipelines and Brand Brain vectors.
                      </p>
                   </div>
                </div>
              )}

              {/* Step 5: Brand Personality */}
              {step === 5 && (
                <div className="space-y-6">
                   <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 block">Brand Voice Archetype</label>
                      <div className="flex flex-wrap gap-2">
                         {BRAND_VOICE_OPTS.map(opt => (
                           <button key={opt} onClick={() => updateField("brandVoice", opt)} className={cn("px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", formData.brandVoice === opt ? "bg-[#0F1E3D] text-white shadow-xl" : "bg-gray-100 text-slate-400 hover:bg-gray-200")}>
                             {opt}
                           </button>
                         ))}
                      </div>
                   </div>
                   <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Strategic Messaging Direction</label>
                      <textarea value={formData.messagingDirection} onChange={e => updateField("messagingDirection", e.target.value)} className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-[13px] font-bold text-[#0F1E3D] h-32 resize-none" placeholder="What is the core message we must communicate?" />
                   </div>
                </div>
              )}

               {/* Step 6: Platforms */}
               {step === 6 && (
                <div className="space-y-4">
                   <p className="text-[14px] font-bold text-[#0F1E3D]">Select platforms for Social Engine & Paid Media activation.</p>
                   <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {PLATFORMS.map(plt => (
                        <button key={plt} onClick={() => toggleArray("platforms", plt)} className={cn("p-6 rounded-2xl border-2 flex flex-col items-center gap-4 transition-all", formData.platforms.includes(plt) ? "bg-[#0F1E3D] border-[#0F1E3D] text-white" : "bg-white border-gray-50 text-slate-300 hover:border-indigo-100")}>
                           <Share2 className="w-8 h-8" />
                           <span className="text-[10px] font-black uppercase tracking-widest">{plt}</span>
                        </button>
                      ))}
                   </div>
                </div>
              )}

              {/* Step 7: Budget & Capacity */}
              {step === 7 && (
                <div className="space-y-8">
                   <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 block">Monthly Marketing Budget Range</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                         {["$2,500 - $5,000", "$5,000 - $10,000", "$10,000 - $25,000", "$25,000+"].map(range => (
                           <button key={range} onClick={() => updateField("budgetRange", range)} className={cn("p-4 rounded-xl border text-left text-[11px] font-bold", formData.budgetRange === range ? "bg-indigo-600 text-white border-indigo-600" : "bg-white border-gray-100 text-slate-500")}>
                             {range}
                           </button>
                         ))}
                      </div>
                   </div>
                   <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 block">Expected Operational Workload</label>
                      <div className="flex gap-4">
                         {["low", "medium", "high"].map(lvl => (
                           <button key={lvl} onClick={() => updateField("workloadLevel", lvl)} className={cn("flex-1 py-4 rounded-xl border capitalize text-[11px] font-bold", formData.workloadLevel === lvl ? "bg-indigo-600 text-white border-indigo-600" : "bg-white border-gray-100 text-slate-500")}>
                             {lvl}
                           </button>
                         ))}
                      </div>
                   </div>
                </div>
              )}

              {/* Step 8: Assets */}
              {step === 8 && (
                <div className="space-y-6">
                   <div className="border-2 border-dashed border-gray-100 rounded-[32px] p-12 flex flex-col items-center text-center">
                      <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-6">
                         {uploadFile.isPending ? <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" /> : <Upload className="w-8 h-8 text-indigo-600" />}
                      </div>
                      <h4 className="text-[14px] font-black uppercase tracking-tight text-[#0F1E3D] mb-2">
                        {formData.hasLogo ? "Primary Assets Received" : "Upload Initial Assets"}
                      </h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8">logos, brand guides, current ad creative</p>
                      
                      <div className="flex gap-4">
                         <input ref={fileInputRef} type="file" className="hidden" onChange={handleAssetUpload} />
                         <button onClick={() => fileInputRef.current?.click()} className="px-6 py-3 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center gap-2">
                            {formData.hasLogo ? <Check className="w-3 h-3 text-emerald-500" /> : <Plus className="w-3 h-3" />}
                            {formData.hasLogo ? "Upload More" : "Select Files"}
                         </button>
                         <button onClick={() => toast.info("Global Drive integration coming soon.")} className="px-6 py-3 bg-[#0F1E3D] text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Connect Drive</button>
                      </div>
                   </div>
                   <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100">
                      <p className="text-[10px] font-bold text-amber-900 leading-relaxed uppercase tracking-widest">Initialization Ready</p>
                      <p className="text-[10px] font-medium text-amber-700/70 mt-1">Completing this step will fire the global system activation triggers. This process cannot be undone.</p>
                   </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        <div className="px-10 py-8 border-t border-gray-100 bg-gray-50/30 flex items-center justify-between shrink-0">
          <button 
            onClick={() => step > 1 ? setStep(step - 1) : onClose()} 
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-[#0F1E3D] transition-colors"
          >
            {step === 1 ? "Cancel Setup" : <><ChevronLeft className="w-4 h-4" /> Previous Step</>}
          </button>
          
          {step < TOTAL_STEPS ? (
            <button 
              onClick={() => setStep(step + 1)} 
              className="flex items-center gap-2 bg-[#0F1E3D] text-white rounded-2xl px-8 py-4 text-[11px] font-black uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-500/10"
            >
              Next Phase <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
               onClick={handleComplete}
               disabled={isSubmitting}
               className="flex items-center gap-2 bg-indigo-600 text-white rounded-2xl px-10 py-4 text-[11px] font-black uppercase tracking-[0.2em] hover:bg-[#0F1E3D] transition-all shadow-xl shadow-indigo-500/20 disabled:opacity-50"
            >
               {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
               Initialize Ecosystem
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

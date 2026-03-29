import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronRight, ChevronLeft, Loader2, Sparkles, Building2, Globe, FileSearch, Mail, Target } from "lucide-react";
import { useUpdateCompany, useAddCompany } from "@/hooks/useAppData";
import { cn } from "@/lib/utils";

const SOCIAL_PLATFORMS = ["Facebook", "Instagram", "LinkedIn", "TikTok", "Twitter/X", "Pinterest", "YouTube", "None"];

export function ClientOnboardingWizard({ company, onClose }: { company: any; onClose: () => void }) {
  const updateCompany = useUpdateCompany();
  const addCompany = useAddCompany();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Business Snapshot
    industry: company?.business_profile?.industry || "",
    products: company?.business_profile?.products || "",
    targetAudience: company?.business_profile?.targetAudience || "",
    biggestChallenge: company?.business_profile?.biggestChallenge || "",
    
    // Step 2: Online Presence
    activeSocials: company?.business_profile?.activeSocials || [],
    socialLinks: company?.business_profile?.socialLinks || "",
    runPaidAds: company?.business_profile?.runPaidAds || "", // "Yes" | "No"
    
    // Step 3: Content & SEO
    hasBlog: company?.business_profile?.hasBlog || "", // "Yes" | "No"
    usingSeoTools: company?.business_profile?.usingSeoTools || "", // "Yes" | "No" | "Not Sure"

    // Step 4: Email & Lead Gen
    collectEmails: company?.business_profile?.collectEmails || "", // "Yes" | "No"
    subscriberCount: company?.business_profile?.subscriberCount || "",

    // Step 5: Goals
    primaryGoal: company?.business_profile?.primaryGoal || "",
    focusArea: company?.business_profile?.focusArea || "",
  });

  const updateForm = (key: keyof typeof formData, value: any) => setFormData(p => ({ ...p, [key]: value }));

  const toggleSocial = (platform: string) => {
    setFormData(p => {
      if (platform === "None") return { ...p, activeSocials: ["None"] };
      const newSocials = p.activeSocials.includes("None") ? [] : p.activeSocials;
      
      return {
        ...p,
        activeSocials: newSocials.includes(platform)
          ? newSocials.filter((s: string) => s !== platform)
          : [...newSocials, platform]
      };
    });
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
       await updateCompany.mutateAsync({
         id: company.id,
         onboarding_completed: true,
         business_profile: formData
       });
       onClose();
    } catch (e) {
      console.error("Database save failed:", e);
      setIsSubmitting(false);
    }
  };

  const TOTAL_STEPS = 5;
  const currentProgress = (step / TOTAL_STEPS) * 100;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0F1E3D]/40 backdrop-blur-md p-4 sm:p-6"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col border border-[#0F1E3D]/10 max-h-[90vh]"
      >
        {/* Header & Progress */}
        <div className="px-8 py-6 border-b border-[#0F1E3D]/5 bg-[#F8FAFC]/50 shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-extrabold text-[var(--brand-primary)] flex items-center gap-2 tracking-tight">
                <Sparkles className="h-5 w-5 text-[#1E3A8A]" /> TapXMedia Discovery
              </h2>
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--brand-primary)]/40 mt-1.5">
                Section {step} of {TOTAL_STEPS}
              </p>
            </div>
            <button onClick={onClose} className="text-[10px] font-black uppercase tracking-widest text-[var(--brand-primary)]/40 hover:text-[var(--brand-primary)] hover:bg-[#F1F5F9] px-3 py-1.5 rounded-lg transition-colors">
              Skip for now
            </button>
          </div>
          <div className="w-full bg-[#0F1E3D]/5 h-1.5 rounded-full overflow-hidden">
             <motion.div className="bg-[#0F1E3D] h-full" initial={{ width: 0 }} animate={{ width: `${currentProgress}%` }} transition={{ duration: 0.5 }} />
          </div>
        </div>

        {/* Wizard Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-8 py-8 flex flex-col min-h-[400px]">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: BUSINESS SNAPSHOT */}
            {step === 1 && (
              <motion.div key="s1" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="flex flex-col gap-6">
                <div className="flex flex-col items-center text-center mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
                     <Building2 className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-extrabold text-[var(--brand-primary)] mb-2">Business Snapshot</h3>
                  <p className="text-sm font-medium text-[var(--brand-primary)]/60 max-w-sm">Help us understand your business better so we can tailor the audit to your unique needs.</p>
                </div>
                
                <div className="space-y-5">
                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-[var(--brand-primary)]/50 mb-2 block">What industry are you in?</label>
                    <input type="text" value={formData.industry} onChange={e => updateForm("industry", e.target.value)} placeholder="e.g. Real Estate, SaaS, E-Commerce..." className="w-full bg-[#F8FAFC] border border-[#0F1E3D]/10 rounded-xl px-4 py-3 text-sm font-medium focus:border-[#0F1E3D] transition-colors"/>
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-[var(--brand-primary)]/50 mb-2 block">What product(s) or service(s) do you offer?</label>
                    <textarea value={formData.products} onChange={e => updateForm("products", e.target.value)} placeholder="Briefly describe what you sell." className="w-full bg-[#F8FAFC] border border-[#0F1E3D]/10 rounded-xl px-4 py-3 text-sm font-medium focus:border-[#0F1E3D] transition-colors resize-none h-20"/>
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-[var(--brand-primary)]/50 mb-2 block">Who is your target audience or ideal customer?</label>
                    <input type="text" value={formData.targetAudience} onChange={e => updateForm("targetAudience", e.target.value)} placeholder="e.g. Small business owners, Gen-Z gamers..." className="w-full bg-[#F8FAFC] border border-[#0F1E3D]/10 rounded-xl px-4 py-3 text-sm font-medium focus:border-[#0F1E3D] transition-colors"/>
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-[var(--brand-primary)]/50 mb-2 block">What is your current biggest marketing challenge?</label>
                    <textarea value={formData.biggestChallenge} onChange={e => updateForm("biggestChallenge", e.target.value)} placeholder="e.g. Getting high quality leads, low conversion rate..." className="w-full bg-[#F8FAFC] border border-[#0F1E3D]/10 rounded-xl px-4 py-3 text-sm font-medium focus:border-[#0F1E3D] transition-colors resize-none h-24"/>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: ONLINE PRESENCE */}
            {step === 2 && (
              <motion.div key="s2" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="flex flex-col gap-6">
                <div className="flex flex-col items-center text-center mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
                     <Globe className="h-6 w-6 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-extrabold text-[var(--brand-primary)] mb-2">Online Presence</h3>
                  <p className="text-sm font-medium text-[var(--brand-primary)]/60 max-w-sm">Tell us about your current digital footprint and marketing activities.</p>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-[var(--brand-primary)]/50 mb-3 block">What social media platforms are you active on?</label>
                    <div className="flex flex-wrap gap-2">
                       {SOCIAL_PLATFORMS.map(platform => (
                          <button
                             key={platform}
                             onClick={() => toggleSocial(platform)}
                             className={cn(
                               "px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                               formData.activeSocials.includes(platform) ? "bg-[#0F1E3D] text-white border-[#0F1E3D] shadow-md" : "bg-[#F8FAFC] text-[var(--brand-primary)] border-[#0F1E3D]/10 hover:border-[#0F1E3D]/30"
                             )}
                          >
                             {platform}
                          </button>
                       ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-[var(--brand-primary)]/50 mb-2 block">Paste links to your social media profiles</label>
                    <textarea value={formData.socialLinks} onChange={e => updateForm("socialLinks", e.target.value)} placeholder="e.g. IG: @mybrand, FB: facebook.com/mybrand" className="w-full bg-[#F8FAFC] border border-[#0F1E3D]/10 rounded-xl px-4 py-3 text-sm font-medium focus:border-[#0F1E3D] transition-colors resize-none h-20"/>
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-[var(--brand-primary)]/50 mb-3 block">Do you currently run any paid ads? (Facebook, Google, etc.)</label>
                    <div className="flex gap-3">
                       {["Yes", "No"].map(opt => (
                          <button
                             key={opt}
                             onClick={() => updateForm("runPaidAds", opt)}
                             className={cn(
                               "flex-1 py-3 rounded-xl text-sm font-bold transition-all border",
                               formData.runPaidAds === opt ? "bg-[#0F1E3D] text-white border-[#0F1E3D] shadow-md" : "bg-[#F8FAFC] text-[var(--brand-primary)] border-[#0F1E3D]/10 hover:border-[#0F1E3D]/30"
                             )}
                          >
                             {opt}
                          </button>
                       ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3: CONTENT & SEO */}
            {step === 3 && (
              <motion.div key="s3" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="flex flex-col gap-6">
                <div className="flex flex-col items-center text-center mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4">
                     <FileSearch className="h-6 w-6 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-extrabold text-[var(--brand-primary)] mb-2">Content & SEO</h3>
                  <p className="text-sm font-medium text-[var(--brand-primary)]/60 max-w-sm">Let us know how you manage content and search engine optimization to find areas for improvement.</p>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-[var(--brand-primary)]/50 mb-3 block">Do you have a blog or publish content regularly?</label>
                    <div className="flex gap-3">
                       {["Yes", "No"].map(opt => (
                          <button
                             key={opt}
                             onClick={() => updateForm("hasBlog", opt)}
                             className={cn(
                               "flex-1 py-3 rounded-xl text-sm font-bold transition-all border",
                               formData.hasBlog === opt ? "bg-[#0F1E3D] text-white border-[#0F1E3D] shadow-md" : "bg-[#F8FAFC] text-[var(--brand-primary)] border-[#0F1E3D]/10 hover:border-[#0F1E3D]/30"
                             )}
                          >
                             {opt}
                          </button>
                       ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-[var(--brand-primary)]/50 mb-3 block">Are you using SEO tools like Google Search Console or SEMrush?</label>
                    <div className="flex gap-3">
                       {["Yes", "No", "Not Sure"].map(opt => (
                          <button
                             key={opt}
                             onClick={() => updateForm("usingSeoTools", opt)}
                             className={cn(
                               "flex-1 py-3 rounded-xl text-sm font-bold transition-all border",
                               formData.usingSeoTools === opt ? "bg-[#0F1E3D] text-white border-[#0F1E3D] shadow-md" : "bg-[#F8FAFC] text-[var(--brand-primary)] border-[#0F1E3D]/10 hover:border-[#0F1E3D]/30"
                             )}
                          >
                             {opt}
                          </button>
                       ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 4: EMAIL & LEAD GEN */}
            {step === 4 && (
              <motion.div key="s4" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="flex flex-col gap-6">
                <div className="flex flex-col items-center text-center mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center mb-4">
                     <Mail className="h-6 w-6 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-extrabold text-[var(--brand-primary)] mb-2">Email & Lead Generation</h3>
                  <p className="text-sm font-medium text-[var(--brand-primary)]/60 max-w-sm">Understanding your email marketing efforts will help us provide better recommendations.</p>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-[var(--brand-primary)]/50 mb-3 block">Do you collect emails on your website or run a newsletter?</label>
                    <div className="flex gap-3">
                       {["Yes", "No"].map(opt => (
                          <button
                             key={opt}
                             onClick={() => updateForm("collectEmails", opt)}
                             className={cn(
                               "flex-1 py-3 rounded-xl text-sm font-bold transition-all border",
                               formData.collectEmails === opt ? "bg-[#0F1E3D] text-white border-[#0F1E3D] shadow-md" : "bg-[#F8FAFC] text-[var(--brand-primary)] border-[#0F1E3D]/10 hover:border-[#0F1E3D]/30"
                             )}
                          >
                             {opt}
                          </button>
                       ))}
                    </div>
                  </div>
                  
                  <AnimatePresence>
                     {formData.collectEmails === "Yes" && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                          <label className="text-xs font-black uppercase tracking-widest text-[var(--brand-primary)]/50 mb-2 block">If yes, how many subscribers do you have?</label>
                          <input type="text" value={formData.subscriberCount} onChange={e => updateForm("subscriberCount", e.target.value)} placeholder="e.g. roughly 2,500" className="w-full bg-[#F8FAFC] border border-[#0F1E3D]/10 rounded-xl px-4 py-3 text-sm font-medium focus:border-[#0F1E3D] transition-colors"/>
                        </motion.div>
                     )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {/* STEP 5: YOUR GOALS */}
            {step === 5 && (
              <motion.div key="s5" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="flex flex-col gap-6">
                <div className="flex flex-col items-center text-center mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center mb-4">
                     <Target className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-extrabold text-[var(--brand-primary)] mb-2">Your Goals</h3>
                  <p className="text-sm font-medium text-[var(--brand-primary)]/60 max-w-sm">What do you want to achieve with this audit? The clearer you are, the better we can help!</p>
                </div>
                
                <div className="space-y-5">
                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-[var(--brand-primary)]/50 mb-2 block">What’s your #1 goal with this audit?</label>
                    <textarea value={formData.primaryGoal} onChange={e => updateForm("primaryGoal", e.target.value)} placeholder="e.g. Find out why my ads aren't converting." className="w-full bg-[#F8FAFC] border border-[#0F1E3D]/10 rounded-xl px-4 py-3 text-sm font-medium focus:border-[#0F1E3D] transition-colors resize-none h-24"/>
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-[var(--brand-primary)]/50 mb-2 block">Any specific area you’d like us to focus on?</label>
                    <textarea value={formData.focusArea} onChange={e => updateForm("focusArea", e.target.value)} placeholder="e.g. Our current Facebook ads or our website speed." className="w-full bg-[#F8FAFC] border border-[#0F1E3D]/10 rounded-xl px-4 py-3 text-sm font-medium focus:border-[#0F1E3D] transition-colors resize-none h-24"/>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        <div className="px-8 py-5 border-t border-[#0F1E3D]/5 bg-[#F8FAFC]/30 flex items-center justify-between shrink-0">
          {step > 1 ? (
            <button onClick={() => setStep(s => s - 1)} className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-[var(--brand-primary)] hover:text-[#1E3A8A] transition-colors px-3 py-2">
               <ChevronLeft className="h-4 w-4" /> Back
            </button>
          ) : <div />}
          
          {step < TOTAL_STEPS ? (
            <button onClick={() => setStep(s => s + 1)} className="flex items-center gap-1.5 bg-[#0F1E3D] text-white rounded-xl px-6 py-3 text-xs font-black uppercase tracking-widest hover:bg-[#1E3A8A] transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-[#0F1E3D] focus:ring-offset-2">
               Next <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
               onClick={handleComplete}
               disabled={isSubmitting}
               className="flex items-center gap-2 bg-[#0F1E3D] text-white rounded-xl px-6 py-3 text-xs font-black uppercase tracking-widest hover:bg-[#1E3A8A] transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-[#0F1E3D] focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
               {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
               Submit Profile
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

import { motion } from "framer-motion";
import { Sparkles, Copy, Send } from "lucide-react";
import { useCompanies } from "@/hooks/useAppData";

export function AiClientUpdate() {
  const { data: companies = [] } = useCompanies();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      style={{
        background: "var(--glass-bg)",
        backdropFilter: "var(--glass-blur)",
        border: "1px solid var(--glass-border)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--glass-shadow)",
      }}
      className="p-7 flex flex-col gap-6 h-full"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-[#F1F5F9] shadow-inner flex items-center justify-center shrink-0 border border-[#0F1E3D]/5">
          <Sparkles className="h-6 w-6 text-[var(--brand-primary)] opacity-90" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-[var(--brand-primary)]">
            AI Client Update
          </h3>
          <p className="text-sm font-medium text-[var(--brand-primary)] opacity-60 mt-1">
            Generate a professional client summary instantly
          </p>
        </div>
      </div>

      {/* Client dropdown */}
      <div className="relative">
        <select
          className="w-full px-4 py-3.5 text-sm font-semibold text-[var(--brand-primary)] bg-white border border-[#0F1E3D]/10 rounded-xl focus:outline-none focus:border-[var(--brand-accent)] transition-colors appearance-none shadow-sm cursor-pointer"
          defaultValue=""
        >
          <option value="" disabled className="text-[var(--text-muted)]">
            Select a client...
          </option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[var(--brand-primary)] opacity-40">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
        </div>
      </div>

      {/* Generate button */}
      <button className="w-full py-3.5 text-sm font-bold tracking-widest uppercase text-white bg-[var(--brand-primary)] rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-md">
        <Sparkles className="h-4 w-4" />
        Generate Summary
      </button>

      {/* Output area */}
      <div
        className="flex-1 flex items-center justify-center p-6 text-sm text-center bg-[#F8FAFC] border border-dashed border-[#0F1E3D]/20 rounded-xl text-[var(--brand-primary)] opacity-60 font-medium"
        style={{ minHeight: "160px" }}
      >
        Your AI generated client summary will appear here
      </div>

      {/* Action buttons (Disabled state) */}
      <div className="flex gap-3 mt-auto">
        <button
          disabled
          className="flex-1 py-3 text-xs font-bold uppercase tracking-widest text-[var(--brand-primary)] bg-[#F1F5F9] border border-[#0F1E3D]/5 rounded-xl opacity-50 cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Copy className="h-4 w-4" />
          Copy
        </button>
        <button
          disabled
          className="flex-1 py-3 text-xs font-bold uppercase tracking-widest text-[var(--brand-primary)] bg-[#F1F5F9] border border-[#0F1E3D]/5 rounded-xl opacity-50 cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Send className="h-4 w-4" />
          Send
        </button>
      </div>

      {/* Footer note */}
      <p className="text-[10px] uppercase tracking-widest text-[var(--brand-primary)] opacity-40 text-center font-bold">
        Powered by Gemini AI — Free
      </p>
    </motion.div>
  );
}

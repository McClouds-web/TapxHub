import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Download, ExternalLink, CreditCard, Loader2 } from "lucide-react";
import { useInvoices } from "@/hooks/useAppData";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

export default function MyInvoices() {
  const { data: invoices = [], isLoading } = useInvoices();

  const totalPaid = invoices.filter(i => i.status === "paid").reduce((s, i) => s + (i.amount || 0), 0);
  const totalDue = invoices.filter(i => i.status === "sent").reduce((s, i) => s + (i.amount || 0), 0);
  const outstanding = invoices.filter(i => i.status === "sent").length;

  const handlePay = (invoice: any) => {
    toast.success(`Redirecting to payment gateway for invoice ${invoice.invoice_number}...`);
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show"
      className="flex flex-col h-full gap-8 overflow-hidden pb-4">
      
      {/* Header */}
      <motion.div variants={item} className="shrink-0">
        <h1 className="text-3xl font-extrabold tracking-tight text-[var(--brand-primary)]">My Invoices</h1>
        <p className="text-sm text-[var(--brand-primary)]/50 font-bold mt-1.5 uppercase tracking-widest">
           Secure Billing Management
        </p>
      </motion.div>

      {/* Stats Summary */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
        {[
          { label: "Lifetime Paid", value: `$${totalPaid.toLocaleString()}`, color: "text-[var(--brand-primary)]" },
          { label: "Due Now",       value: `$${totalDue.toLocaleString()}`,  color: "text-amber-600" },
          { label: "Outstanding",    value: outstanding,                      color: "text-amber-600" },
          { label: "Payment Status", value: "Verified",                     color: "text-emerald-500" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white border border-[#0F1E3D]/5 rounded-2xl p-6 shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--brand-primary)]/40 block mb-2">{label}</span>
            <span className={`text-2xl font-extrabold ${color}`}>{value}</span>
          </div>
        ))}
      </motion.div>

      {/* Invoices List */}
      <motion.div variants={item} className="flex-1 min-h-0 bg-white border border-[#0F1E3D]/5 rounded-2xl shadow-sm flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 flex flex-col">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="h-6 w-6 text-[var(--brand-primary)]/20 animate-spin" />
            </div>
          ) : invoices.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
               <div className="w-16 h-16 rounded-2xl bg-[#F8FAFC] border border-[#0F1E3D]/5 flex items-center justify-center mb-5 shadow-sm">
                 <FileText className="h-7 w-7 text-[var(--brand-primary)] opacity-20" />
               </div>
               <h3 className="text-xl font-extrabold text-[var(--brand-primary)] mb-2">Clear Records</h3>
               <p className="text-sm font-medium text-[var(--brand-primary)]/40 max-w-sm leading-relaxed">
                 You have no outstanding or previous invoices at this time.
               </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              <AnimatePresence>
                {invoices.map((inv) => (
                  <motion.div
                    key={inv.id}
                    layout
                    className="group flex flex-col bg-[#F8FAFC] border border-[#0F1E3D]/5 p-5 rounded-[20px] hover:bg-white hover:shadow-xl transition-all border-dashed"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-[#0F1E3D]/5 group-hover:border-blue-500/30 transition-colors">
                        <FileText className="h-5 w-5 text-[#1E3A8A]" />
                      </div>
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border shadow-sm",
                        inv.status === 'paid' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                        "bg-amber-500/10 text-amber-600 border-amber-500/20"
                      )}>
                        {inv.status}
                      </span>
                    </div>
                    
                    <div className="mb-8">
                       <h4 className="text-xs font-black uppercase tracking-widest text-[#0F1E3D]/30 mb-1.5">Invoice Ref</h4>
                       <p className="text-sm font-extrabold text-[#0F1E3D]">{inv.invoice_number}</p>
                       <p className="text-[10px] font-bold text-[#0F1E3D]/40 mt-1 uppercase">Issued on {format(new Date(inv.created_at!), "MMM d, yyyy")}</p>
                    </div>

                    <div className="flex items-end justify-between mt-auto">
                        <div>
                           <p className="text-[10px] font-black uppercase tracking-widest text-[#0F1E3D]/30 mb-1">Amount Due</p>
                           <p className="text-2xl font-black text-[#1E3A8A] tracking-tighter">${(inv.amount || 0).toLocaleString()}</p>
                        </div>
                        <div className="flex gap-2">
                           <button onClick={() => handlePay(inv)} className="w-9 h-9 flex items-center justify-center bg-[#0F1E3D] text-white rounded-xl hover:bg-[#1E3A8A] transition-all shadow-md active:scale-95">
                             <CreditCard className="w-4 h-4" />
                           </button>
                           <a href={inv.pdf_url} target="_blank" className="w-9 h-9 flex items-center justify-center bg-white border border-[#0F1E3D]/5 text-[#0F1E3D] rounded-xl hover:bg-[#F8FAFC] transition-all">
                             <Download className="w-4 h-4" />
                           </a>
                        </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

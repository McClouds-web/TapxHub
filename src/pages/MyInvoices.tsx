import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, Download, CreditCard, Loader2,
  CheckCircle2, AlertCircle, ExternalLink,
} from "lucide-react";
import { useInvoices, useCreateCheckoutSession } from "@/hooks/useAppData";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const STATUS_STYLES: Record<string, string> = {
  paid:    "bg-blue-500/10 text-blue-600 border-blue-500/20",
  sent:    "bg-amber-500/10  text-amber-600  border-amber-500/20",
  overdue: "bg-rose-500/10   text-rose-600   border-rose-500/20",
  draft:   "bg-[#0F1E3D]/5   text-[#0F1E3D]/40 border-[#0F1E3D]/10",
};

const STATUS_ICON: Record<string, React.ElementType> = {
  paid:    CheckCircle2,
  sent:    CreditCard,
  overdue: AlertCircle,
  draft:   FileText,
};

export default function MyInvoices() {
  const { user } = useAuth();
  const { data: invoices = [], isLoading } = useInvoices();
  const createCheckout = useCreateCheckoutSession();

  // Track which invoice is currently generating a checkout session
  const [payingId, setPayingId] = useState<string | null>(null);

  // ── Stripe pay handler ────────────────────────────────────────────────────
  const handlePay = async (inv: (typeof invoices)[number]) => {
    if (inv.status === "paid") {
      toast.info("This invoice is already paid.");
      return;
    }
    setPayingId(inv.id);
    try {
      const session = await createCheckout.mutateAsync({
        invoice_id: inv.id,
        invoice_number: inv.invoice_number,
        amount: inv.amount,
        customer_email: user?.email,
      });
      // Hard-redirect to Stripe-hosted checkout page
      window.location.href = session.url;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Payment failed";
      toast.error(msg);
    } finally {
      setPayingId(null);
    }
  };

  // ── Derived stats ─────────────────────────────────────────────────────────
  const totalPaid    = invoices.filter(i => i.status === "paid").reduce((s, i) => s + (i.amount ?? 0), 0);
  const totalDue     = invoices.filter(i => i.status === "sent" || i.status === "overdue").reduce((s, i) => s + (i.amount ?? 0), 0);
  const outstanding  = invoices.filter(i => i.status === "sent" || i.status === "overdue").length;
  const overdueCount = invoices.filter(i => i.status === "overdue").length;

  const stats = [
    {
      label: "Lifetime Paid",
      value: `$${totalPaid.toLocaleString()}`,
      color: "text-[var(--brand-primary)]",
      sub: `${invoices.filter(i => i.status === "paid").length} invoices`,
    },
    {
      label: "Due Now",
      value: `$${totalDue.toLocaleString()}`,
      color: totalDue > 0 ? "text-amber-600" : "text-[var(--brand-primary)]",
      sub: `${outstanding} outstanding`,
    },
    {
      label: "Overdue",
      value: overdueCount,
      color: overdueCount > 0 ? "text-rose-600" : "text-[var(--brand-primary)]",
      sub: overdueCount > 0 ? "Action required" : "All clear",
    },
    {
      label: "Payment Status",
      value: overdueCount > 0 ? "Attention" : "Verified",
      color: overdueCount > 0 ? "text-rose-600" : "text-blue-500",
      sub: "Secure billing",
    },
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col h-full gap-5 overflow-hidden pb-4"
    >
      {/* Header */}
      <motion.div variants={item} className="shrink-0">
        <h1 className="text-3xl font-extrabold tracking-tight text-[var(--brand-primary)]">
          My Invoices
        </h1>
        <p className="text-[10px] text-[var(--brand-primary)]/50 font-bold mt-1.5 uppercase tracking-widest">
          Secure Billing Management
        </p>
      </motion.div>

      {/* Stats Summary */}
      <motion.div
        variants={item}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0"
      >
        {stats.map(({ label, value, color, sub }) => (
          <div
            key={label}
            className="bg-white border border-[#0F1E3D]/5 rounded-xl p-3 shadow-sm flex flex-col gap-1"
          >
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--brand-primary)]/40">
              {label}
            </span>
            <span className={cn("text-[13px] font-extrabold leading-tight", color)}>
              {value}
            </span>
            <span className="text-[10px] font-bold text-[var(--brand-primary)]/30">
              {sub}
            </span>
          </div>
        ))}
      </motion.div>

      {/* Invoice Cards */}
      <motion.div
        variants={item}
        className="flex-1 min-h-0 bg-white border border-[#0F1E3D]/5 rounded-xl shadow-sm flex flex-col overflow-hidden"
      >
        <div className="flex-1 overflow-y-auto p-3 flex flex-col">
          {isLoading ? (
            /* Skeleton */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="h-52 rounded-[20px] bg-[#F8FAFC] border border-[#0F1E3D]/5 animate-pulse"
                />
              ))}
            </div>
          ) : invoices.length === 0 ? (
            /* Empty state */
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
              <div className="w-16 h-16 rounded-xl bg-[#F8FAFC] border border-[#0F1E3D]/5 flex items-center justify-center mb-5 shadow-sm">
                <FileText className="h-7 w-7 text-[var(--brand-primary)] opacity-20" />
              </div>
              <h3 className="text-[12px] font-extrabold text-[var(--brand-primary)] mb-2">
                Clear Records
              </h3>
              <p className="text-[10px] font-medium text-[var(--brand-primary)]/40 max-w-sm leading-relaxed">
                You have no outstanding or previous invoices at this time.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              <AnimatePresence>
                {invoices.map((inv) => {
                  const isThisPaying = payingId === inv.id;
                  const isPaid = inv.status === "paid";
                  const StatusIcon = STATUS_ICON[inv.status] ?? FileText;

                  return (
                    <motion.div
                      key={inv.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      className="group flex flex-col bg-[#F8FAFC] border border-[#0F1E3D]/5 p-3 rounded-[20px] hover:bg-white hover:shadow-xl transition-all duration-300"
                    >
                      {/* Card top */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-[#0F1E3D]/5 group-hover:border-blue-500/30 transition-colors shadow-sm">
                          <FileText className="h-5 w-5 text-[#1E3A8A]" />
                        </div>
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border shadow-sm",
                            STATUS_STYLES[inv.status] ?? STATUS_STYLES.draft
                          )}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {inv.status}
                        </span>
                      </div>

                      {/* Invoice details */}
                      <div className="mb-5 flex-1">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-[#0F1E3D]/30 mb-1.5">
                          Invoice Ref
                        </h4>
                        <p className="text-[10px] font-extrabold text-[#0F1E3D]">
                          {inv.invoice_number}
                        </p>
                        {inv.created_at && (
                          <p className="text-[10px] font-bold text-[#0F1E3D]/40 mt-1 uppercase">
                            Issued {format(new Date(inv.created_at), "MMM d, yyyy")}
                          </p>
                        )}
                        {inv.due_date && !isPaid && (
                          <p className={cn(
                            "text-[10px] font-bold mt-0.5 uppercase",
                            inv.status === "overdue"
                              ? "text-rose-500"
                              : "text-amber-500"
                          )}>
                            Due {format(new Date(inv.due_date), "MMM d, yyyy")}
                          </p>
                        )}
                      </div>

                      {/* Amount + actions */}
                      <div className="flex items-end justify-between mt-auto">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-[#0F1E3D]/30 mb-1">
                            {isPaid ? "Amount Paid" : "Amount Due"}
                          </p>
                          <p className="text-[13px] font-black text-[#1E3A8A] tracking-tighter">
                            ${(inv.amount ?? 0).toLocaleString()}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          {/* Pay button — Ticket 2: wired to Stripe */}
                          <button
                            onClick={() => handlePay(inv)}
                            disabled={isPaid || isThisPaying}
                            title={isPaid ? "Already paid" : "Pay now via Stripe"}
                            className={cn(
                              "w-9 h-9 flex items-center justify-center rounded-xl transition-all shadow-md active:scale-95",
                              isPaid
                                ? "bg-blue-500/10 text-blue-500 cursor-default border border-blue-500/20"
                                : "bg-[#0F1E3D] text-white hover:bg-[#1E3A8A] disabled:opacity-60 disabled:cursor-not-allowed"
                            )}
                          >
                            {isThisPaying ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : isPaid ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : (
                              <CreditCard className="w-4 h-4" />
                            )}
                          </button>

                          {/* Download/View PDF — Ticket 1: fixed to invoice_url */}
                          {inv.invoice_url ? (
                            <a
                              href={inv.invoice_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="View / download invoice PDF"
                              className="w-9 h-9 flex items-center justify-center bg-white border border-[#0F1E3D]/5 text-[#0F1E3D] rounded-xl hover:bg-[#F8FAFC] hover:border-[#0F1E3D]/20 transition-all"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          ) : (
                            <div
                              title="No PDF available yet"
                              className="w-9 h-9 flex items-center justify-center bg-[#F8FAFC] border border-[#0F1E3D]/5 text-[#0F1E3D]/20 rounded-xl cursor-not-allowed"
                            >
                              <Download className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

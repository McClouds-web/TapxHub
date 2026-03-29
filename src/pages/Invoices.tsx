import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Download, FileText, ArrowUpRight, Clock, CheckCircle2, 
  MoreHorizontal, Plus, X, Loader2, Sparkles, Trash2, Send
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { 
  useInvoices, useAddInvoice, useUpdateInvoiceStatus, 
  useDeleteInvoice, useCompanies, Invoice 
} from "@/hooks/useAppData";
import { toast } from "sonner";
import { format } from "date-fns";
import { useReactToPrint } from "react-to-print";
import { InvoicePDF } from "@/components/invoice/InvoicePDF";

const statusColors: Record<string, string> = {
  paid: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  sent: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  overdue: "bg-rose-500/10 text-rose-600 border-rose-500/20",
  draft: "bg-slate-500/10 text-slate-600 border-slate-500/20",
};

export default function Invoices() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  
  const { data: invoices = [], isLoading: invoicesLoading } = useInvoices();
  const { data: companies = [] } = useCompanies();
  
  const addInvoice = useAddInvoice();
  const updateStatus = useUpdateInvoiceStatus();
  const deleteInvoice = useDeleteInvoice();

  const [isAdding, setIsAdding] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({
    company_id: "",
    amount: 0,
    items: [{ description: "", amount: 0 }],
    due_date: format(new Date(), "yyyy-MM-dd"),
  });

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Invoice_${selectedInvoice?.invoice_number}`,
  });

  const triggerDownload = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    // Allow state to update before printing
    setTimeout(() => {
      handlePrint();
    }, 100);
  };

  const addItem = () => setForm(p => ({ ...p, items: [...p.items, { description: "", amount: 0 }] }));
  const removeItem = (idx: number) => setForm(p => ({ ...p, items: p.items.filter((_, i) => i !== idx) }));
  const updateItem = (idx: number, key: 'description' | 'amount', val: any) => {
    const newItems = [...form.items];
    newItems[idx] = { ...newItems[idx], [key]: key === 'amount' ? Number(val) : val };
    const newTotal = newItems.reduce((acc, item) => acc + item.amount, 0);
    setForm(p => ({ ...p, items: newItems, amount: newTotal }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.company_id || form.amount <= 0) {
      toast.error("Please select a client and add at least one item.");
      return;
    }

    try {
      const invNum = `INV-${Date.now().toString().slice(-6)}`;
      await addInvoice.mutateAsync({
        company_id: form.company_id,
        invoice_number: invNum,
        amount: form.amount,
        items: form.items,
        due_date: form.due_date,
        status: 'draft'
      });
      setIsAdding(false);
      setForm({ company_id: "", amount: 0, items: [{ description: "", amount: 0 }], due_date: format(new Date(), "yyyy-MM-dd") });
      toast.success("Invoice generated successfully");
    } catch (err) {
      toast.error("Failed to generate invoice");
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    await updateStatus.mutateAsync({ id, status: newStatus });
    toast.success(`Status updated to ${newStatus}`);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Permanently delete this invoice record?")) {
      await deleteInvoice.mutateAsync(id);
      toast.info("Invoice record removed");
    }
  };

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col h-full gap-6 overflow-hidden pb-4">
      
      {/* Hidden Printable Component */}
      <div className="hidden">
        {selectedInvoice && (
          <InvoicePDF 
            ref={printRef} 
            invoice={selectedInvoice} 
            company={companies.find(c => c.id === selectedInvoice.company_id) || companies[0]} 
          />
        )}
      </div>

      <motion.div variants={item} className="flex items-end justify-between shrink-0">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--brand-primary)]">Billing Command</h1>
          <p className="text-sm text-[var(--brand-primary)]/50 font-bold mt-1.5 uppercase tracking-widest flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" /> Revenue & Accounts Receivable
          </p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-1.5 px-6 py-3 bg-[#0F1E3D] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#1E3A8A] transition-all shadow-md active:scale-95"
          >
            {isAdding ? <><X className="h-4 w-4" /> Cancel</> : <><Plus className="h-4 w-4" /> Generate Invoice</>}
          </button>
        )}
      </motion.div>

      <AnimatePresence>
        {isAdding && (
          <motion.form 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleCreate}
            className="bg-white p-8 rounded-[2.5rem] border border-[#0F1E3D]/10 shadow-2xl shrink-0 overflow-hidden relative z-10 space-y-6"
          >
            <div className="grid md:grid-cols-2 gap-6">
               <div className="space-y-1.5">
                  <label className="text-[9px] uppercase font-black tracking-widest text-[#0F1E3D]/40 ml-2">Select Client</label>
                  <select 
                    value={form.company_id}
                    onChange={e => setForm({ ...form, company_id: e.target.value })}
                    className="w-full bg-[#F8FAFC] border border-[#0F1E3D]/10 rounded-xl px-4 py-3.5 text-sm font-bold text-[#0F1E3D] focus:outline-none focus:border-[#1E3A8A] focus:bg-white transition-all shadow-inner"
                  >
                    <option value="">Choose a business...</option>
                    {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
               </div>
               <div className="space-y-1.5">
                  <label className="text-[9px] uppercase font-black tracking-widest text-[#0F1E3D]/40 ml-2">Due Date</label>
                  <input 
                    type="date"
                    value={form.due_date}
                    onChange={e => setForm({ ...form, due_date: e.target.value })}
                    className="w-full bg-[#F8FAFC] border border-[#0F1E3D]/10 rounded-xl px-4 py-3.5 text-sm font-bold text-[#0F1E3D] focus:outline-none focus:border-[#1E3A8A] focus:bg-white transition-all shadow-inner"
                  />
               </div>
            </div>

            <div className="space-y-3">
               <div className="flex justify-between items-center mb-2">
                 <h4 className="text-[10px] uppercase font-black tracking-widest text-[#0F1E3D]/40 ml-2">Invoice Items</h4>
                 <button type="button" onClick={addItem} className="text-[9px] font-black uppercase tracking-widest text-[#1E3A8A] hover:underline">+ Add Line Item</button>
               </div>
               {form.items.map((item, idx) => (
                 <div key={idx} className="flex gap-3 items-center">
                    <input 
                      placeholder="Service description..."
                      value={item.description}
                      onChange={e => updateItem(idx, 'description', e.target.value)}
                      className="flex-1 bg-[#F8FAFC] border border-[#0F1E3D]/10 rounded-xl px-4 py-3 text-xs font-bold"
                    />
                    <input 
                      type="number"
                      placeholder="Amount"
                      value={item.amount || ''}
                      onChange={e => updateItem(idx, 'amount', e.target.value)}
                      className="w-32 bg-[#F8FAFC] border border-[#0F1E3D]/10 rounded-xl px-4 py-3 text-xs font-bold"
                    />
                    {form.items.length > 1 && (
                      <button type="button" onClick={() => removeItem(idx)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                 </div>
               ))}
            </div>

            <div className="flex justify-between items-center pt-6 border-t border-[#0F1E3D]/5">
               <div className="flex flex-col">
                  <span className="text-[9px] uppercase font-black tracking-widest text-[#0F1E3D]/40">Total Amount</span>
                  <span className="text-2xl font-black text-[#0F1E3D]">${form.amount.toLocaleString()}</span>
               </div>
               <button 
                 type="submit" 
                 disabled={addInvoice.isPending}
                 className="px-8 py-4 bg-[#0F1E3D] text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-[#1E3A8A] transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center gap-2"
               >
                 {addInvoice.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle2 className="w-4 h-4" /> Confirm & Generate</>}
               </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <motion.div variants={item} className="flex-1 flex flex-col bg-white border border-[#0F1E3D]/5 rounded-3xl overflow-hidden shadow-sm min-h-0">
        <div className="flex items-center justify-between px-8 py-6 border-b border-[#0F1E3D]/5 shrink-0 bg-[#F8FAFC]/50">
          <h3 className="text-xs font-black uppercase tracking-widest text-[var(--brand-primary)] flex items-center gap-2">
            <FileText className="h-4 w-4 text-[#1E3A8A]" /> Transaction History
          </h3>
        </div>
        
        <div className="flex-1 overflow-y-auto no-scrollbar px-2 py-2">
          {invoicesLoading ? (
            <div className="h-full flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-[#1E3A8A]" /></div>
          ) : invoices.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 opacity-30">
              <FileText className="h-12 w-12 mb-4" />
              <p className="text-sm font-black uppercase tracking-widest">No Invoice Records</p>
            </div>
          ) : (
            <div className="space-y-1">
              {invoices.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between p-5 rounded-2xl hover:bg-[#F8FAFC] group transition-all border border-transparent hover:border-[#0F1E3D]/5">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-white border border-[#0F1E3D]/5 flex items-center justify-center shadow-sm group-hover:border-[#1E3A8A]/20">
                      <FileText className="h-5 w-5 text-[#1E3A8A]/40" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-black text-[#0F1E3D] truncate">{inv.invoice_number}</p>
                      <div className="flex items-center gap-2 mt-1">
                         <span className="text-[10px] font-bold text-[var(--brand-primary)]/40 uppercase tracking-widest">
                           {companies.find(c => c.id === inv.company_id)?.name || 'Unknown Client'}
                         </span>
                         <span className="text-[10px] font-bold text-[#0F1E3D]/10">•</span>
                         <span className="text-[10px] font-bold text-[#0F1E3D]/30">{inv.created_at ? format(new Date(inv.created_at), "MMM d, yyyy") : ''}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-8 shrink-0">
                    <div className="hidden md:flex flex-col items-end">
                       <span className="text-sm font-black text-[#0F1E3D]">${inv.amount.toLocaleString()}</span>
                       <span className="text-[9px] font-black uppercase tracking-widest text-[#0F1E3D]/30 mt-1">
                         Due {inv.due_date ? format(new Date(inv.due_date), "MMM d") : 'On Receipt'}
                       </span>
                    </div>
                    
                    <div className="w-28 flex justify-end">
                       {isAdmin ? (
                         <select 
                           value={inv.status}
                           onChange={(e) => handleStatusChange(inv.id, e.target.value)}
                           className={cn(
                             "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all cursor-pointer",
                             statusColors[inv.status as keyof typeof statusColors]
                           )}
                         >
                           <option value="draft">Draft</option>
                           <option value="sent">Sent</option>
                           <option value="paid">Paid</option>
                           <option value="overdue">Overdue</option>
                         </select>
                       ) : (
                         <span className={cn(
                           "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                           statusColors[inv.status as keyof typeof statusColors]
                         )}>
                           {inv.status}
                         </span>
                       )}
                    </div>

                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                      {isAdmin && (
                        <button 
                          onClick={() => {
                            const url = `${window.location.origin}/invoice/${inv.id}`;
                            navigator.clipboard.writeText(url);
                            toast.success("Link copied to clipboard!");
                          }}
                          className="w-10 h-10 rounded-xl flex items-center justify-center bg-white text-[#0F1E3D]/40 hover:text-blue-600 hover:shadow-md border border-[#0F1E3D]/5 transition-all outline-none"
                          title="Copy Public Link"
                        >
                           <Send className="w-4 h-4" />
                        </button>
                      )}
                      <button 
                        onClick={() => triggerDownload(inv)}
                        className="w-10 h-10 rounded-xl flex items-center justify-center bg-white text-[#0F1E3D]/40 hover:text-[#1E3A8A] hover:shadow-md border border-[#0F1E3D]/5 transition-all outline-none"
                        title="Download Invoice"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      {isAdmin && (
                        <button 
                          onClick={() => handleDelete(inv.id)}
                          className="w-10 h-10 rounded-xl flex items-center justify-center bg-white text-[#0F1E3D]/10 hover:text-rose-600 hover:shadow-md border border-[#0F1E3D]/5 transition-all"
                          title="Delete Record"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

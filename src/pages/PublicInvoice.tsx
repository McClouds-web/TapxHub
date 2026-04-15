import { useParams } from "react-router-dom";
import { useInvoices, useCompanies } from "@/hooks/useAppData";
import { InvoicePDF } from "@/components/invoice/InvoicePDF";
import { Loader2, Download, CheckCircle2 } from "lucide-react";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";

export default function PublicInvoice() {
  const { id } = useParams();
  const { data: invoices = [], isLoading: loadingInvoices } = useInvoices();
  const { data: companies = [] } = useCompanies();
  
  const invoice = invoices.find(i => i.id === id);
  const company = companies.find(c => c.id === invoice?.company_id);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Invoice_${invoice?.invoice_number}`,
  });

  if (loadingInvoices) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#0F1E3D]" />
      </div>
    );
  }

  if (!invoice || !company) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 p-3 text-center">
        <h1 className="text-[13px] font-black text-[#0F1E3D] mb-2">Invoice Not Found</h1>
        <p className="text-slate-500 mb-4">The billing link maybe expired or incorrect.</p>
        <a href="/" className="px-4 py-3 bg-[#0F1E3D] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest">Back to portal</a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-12 px-4">
      <div className="max-w-4xl mx-auto mb-5 flex justify-between items-center sm:px-12 bg-white p-3 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status</p>
            <p className="text-[10px] font-bold uppercase text-[#0F1E3D]">{invoice.status}</p>
          </div>
        </div>
        
        <button 
          onClick={() => handlePrint()}
          className="flex items-center gap-2 px-4 py-3 bg-[#0F1E3D] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#1E3A8A] transition-all shadow-md active:scale-95"
        >
          <Download className="w-4 h-4" /> Download PDF
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-xl overflow-hidden">
        <InvoicePDF ref={printRef} invoice={invoice} company={company} />
      </div>

      <div className="max-w-4xl mx-auto mt-5 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
        SECURE BILLING PORTAL POWERED BY TAPXHUB
      </div>
    </div>
  );
}

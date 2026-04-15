import React from "react";
import { format } from "date-fns";
import { Company, Invoice } from "@/hooks/useAppData";

interface InvoicePDFProps {
  invoice: Invoice;
  company: Company;
}

export const InvoicePDF = React.forwardRef<HTMLDivElement, InvoicePDFProps>(({ invoice, company }, ref) => {
  const subtotal = invoice.items?.reduce((acc, item) => acc + item.amount, 0) || invoice.amount;
  const tax = 0; // Tax can be added here if needed
  const total = subtotal + tax;

  return (
    <div ref={ref} className="p-12 bg-white text-slate-900 max-w-4xl mx-auto print:p-8" id="invoice-printable">
      {/* Header */}
      <div className="flex justify-between items-start mb-12">
        <div>
          <img src={`${import.meta.env.BASE_URL}logo.png`} alt="TapxMedia" className="h-12 w-auto mb-4" />
          <h1 className="text-4xl font-black uppercase tracking-tighter text-[#0F1E3D]">INVOICE</h1>
        </div>
        <div className="text-right">
          <p className="font-bold text-[11px]">TapxMedia Agency</p>
          <p className="text-[10px] text-slate-500">tapiwa@tapxmedia.com</p>
          <p className="text-[10px] text-slate-500">London, United Kingdom</p>
        </div>
      </div>

      {/* Bill To & Info */}
      <div className="grid grid-cols-2 gap-5 mb-12">
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">BILL TO</h3>
          <p className="font-bold text-[12px]">{company.name}</p>
          <p className="text-slate-500">{company.contact_email}</p>
        </div>
        <div className="text-right space-y-2">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">INVOICE NUMBER</span>
            <p className="font-bold">{invoice.invoice_number}</p>
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">DATE</span>
            <p className="font-bold">{format(new Date(invoice.created_at || new Date()), "MMMM do, yyyy")}</p>
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">DUE DATE</span>
            <p className="font-bold text-rose-600">{invoice.due_date ? format(new Date(invoice.due_date), "MMMM do, yyyy") : "On Receipt"}</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="mb-12">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-slate-100">
              <th className="py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">DESCRIPTION</th>
              <th className="py-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items && invoice.items.length > 0 ? (
              invoice.items.map((item, idx) => (
                <tr key={idx} className="border-b border-slate-50">
                  <td className="py-4 font-bold">{item.description}</td>
                  <td className="py-4 text-right font-bold">${item.amount.toLocaleString()}</td>
                </tr>
              ))
            ) : (
              <tr className="border-b border-slate-50">
                <td className="py-4 font-bold">Standard Agency Services</td>
                <td className="py-4 text-right font-bold">${invoice.amount.toLocaleString()}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-12">
        <div className="w-64 space-y-4">
          <div className="flex justify-between text-[10px]">
            <span className="font-bold text-slate-400 uppercase tracking-widest">SUBTOTAL</span>
            <span className="font-bold">${subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-[10px]">
            <span className="font-bold text-slate-400 uppercase tracking-widest">TAX (0%)</span>
            <span className="font-bold">$0.00</span>
          </div>
          <div className="flex justify-between pt-4 border-t-2 border-slate-100">
            <span className="text-[11px] font-black uppercase tracking-widest text-[#0F1E3D]">TOTAL</span>
            <span className="text-[13px] font-black text-[#0F1E3D]">${total.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-12 border-t border-slate-100 text-center">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Thank you for your business!</p>
        <p className="text-[10px] text-slate-300 font-bold uppercase tracking-[0.2em]">Automated by TapxHub OS</p>
      </div>
    </div>
  );
});

InvoicePDF.displayName = "InvoicePDF";

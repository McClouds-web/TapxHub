import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarCheck, Clock, Mail, Phone,
  CheckCircle2, XCircle, AlertCircle, X, UserPlus, Loader2, MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useBookings, useUpdateBooking, useConvertBookingToClient, type Booking } from "@/hooks/useAppData";

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending:   { label: "Pending",   color: "bg-amber-50 text-amber-700 border-amber-200",       icon: AlertCircle },
  confirmed: { label: "Confirmed", color: "bg-blue-50 text-blue-700 border-blue-200",  icon: CheckCircle2 },
  cancelled: { label: "Cancelled", color: "bg-red-50 text-red-600 border-red-200",              icon: XCircle },
  converted: { label: "Client",    color: "bg-blue-50 text-blue-700 border-blue-200",           icon: UserPlus },
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function Bookings() {
  const { data: bookings = [], isLoading } = useBookings();
  const updateBooking   = useUpdateBooking();
  const convertBooking  = useConvertBookingToClient();

  const [selected, setSelected]       = useState<Booking | null>(null);
  const [showConvert, setShowConvert]  = useState(false);
  const [companyName, setCompanyName]  = useState("");
  const [clientType, setClientType]    = useState<"invoice" | "retainer">("retainer");

  const pending   = bookings.filter(b => b.status === "pending").length;
  const confirmed = bookings.filter(b => b.status === "confirmed").length;

  function openBooking(b: Booking) {
    setSelected(b);
    setCompanyName(b.name);
  }

  async function handleConvert() {
    if (!selected || !companyName.trim()) return;
    await convertBooking.mutateAsync({
      booking: selected,
      companyName: companyName.trim(),
      clientType,
    });
    setShowConvert(false);
    setSelected(null);
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col h-full gap-4 overflow-hidden pb-4">

      {/* Header */}
      <motion.div variants={item} className="flex items-end justify-between shrink-0">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--brand-primary)]">Bookings</h1>
          <p className="text-[10px] text-[var(--brand-primary)]/50 font-bold mt-1.5 uppercase tracking-widest">
            Incoming Consultation Requests
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-700">{pending} Pending</span>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
        <div className="bg-white border border-[#0F1E3D]/5 rounded-xl p-3 shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-widest text-[var(--brand-primary)]/40 mb-3 block">Total Bookings</span>
          <span className="text-3xl font-extrabold text-[var(--brand-primary)]">{bookings.length}</span>
        </div>
        <div className="bg-white border border-[#0F1E3D]/5 rounded-xl p-3 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-bl-[100px] pointer-events-none" />
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-600/70 mb-3 block">Awaiting Confirmation</span>
          <span className="text-3xl font-extrabold text-amber-600">{pending}</span>
        </div>
        <div className="bg-white border border-[#0F1E3D]/5 rounded-xl p-3 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-[100px] pointer-events-none" />
          <span className="text-[10px] font-black uppercase tracking-widest text-blue-600/70 mb-3 block">Confirmed</span>
          <span className="text-3xl font-extrabold text-blue-600">{confirmed}</span>
        </div>
      </motion.div>

      {/* Booking List */}
      <motion.div variants={item} className="flex-1 bg-white border border-[#0F1E3D]/5 rounded-xl overflow-hidden shadow-sm min-h-0 flex flex-col">
        <div className="flex items-center justify-between px-4 py-5 border-b border-[#0F1E3D]/5 bg-[#F8FAFC]/50 shrink-0">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--brand-primary)] flex items-center gap-2">
            <CalendarCheck className="h-4 w-4 text-[#1E3A8A]" /> Upcoming Requests
          </h3>
          <span className="text-[10px] font-black uppercase tracking-widest text-[var(--brand-primary)]/30">Source: TapxMedia Website</span>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          {isLoading ? (
            <div className="space-y-3 py-2">
              {[1, 2, 3].map(i => <div key={i} className="h-20 bg-[#F8FAFC] border border-[#0F1E3D]/5 animate-pulse rounded-xl" />)}
            </div>
          ) : bookings.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-12">
              <div className="w-16 h-16 rounded-xl bg-[#F8FAFC] border border-[#0F1E3D]/5 flex items-center justify-center mb-4">
                <CalendarCheck className="h-6 w-6 text-[var(--brand-primary)] opacity-30" />
              </div>
              <p className="text-[10px] font-bold text-[var(--brand-primary)]">No bookings yet.</p>
              <p className="text-[10px] text-[var(--brand-primary)]/40 mt-1">Bookings from TapxMedia will appear here automatically.</p>
            </div>
          ) : (
            <div className="space-y-3 py-2">
              <AnimatePresence>
                {bookings.map((booking) => {
                  const status = statusConfig[booking.status] ?? statusConfig.pending;
                  const StatusIcon = status.icon;
                  return (
                    <motion.div
                      key={booking.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      onClick={() => openBooking(booking)}
                      className="flex items-center justify-between p-3 rounded-xl border border-[#0F1E3D]/5 hover:border-[#0F1E3D]/10 hover:bg-[#F8FAFC] transition-all group cursor-pointer"
                    >
                      {/* Avatar + Info */}
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-[#0F1E3D] flex items-center justify-center text-white text-[10px] font-black shrink-0">
                          {booking.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-extrabold text-[var(--brand-primary)] truncate">{booking.name}</p>
                          <div className="flex flex-wrap items-center gap-3 mt-0.5">
                            <span className="flex items-center gap-1 text-[10px] font-bold text-[var(--brand-primary)]/40">
                              <Mail className="h-3 w-3" /> {booking.email}
                            </span>
                            {booking.phone && (
                              <span className="flex items-center gap-1 text-[10px] font-bold text-[var(--brand-primary)]/40">
                                <Phone className="h-3 w-3" /> {booking.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Date + Time */}
                      <div className="hidden md:flex items-center gap-4 shrink-0 mx-8">
                        {booking.preferred_date && (
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--brand-primary)]/60">
                            <CalendarCheck className="h-3.5 w-3.5 text-[#1E3A8A]" />
                            {booking.preferred_date}
                          </div>
                        )}
                        {booking.preferred_time && (
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--brand-primary)]/60">
                            <Clock className="h-3.5 w-3.5 text-[#1E3A8A]" />
                            {booking.preferred_time}
                          </div>
                        )}
                      </div>

                      {/* Status Badge + Quick Actions */}
                      <div className="flex items-center gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <span className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border", status.color)}>
                          <StatusIcon className="h-3 w-3" /> {status.label}
                        </span>
                        {booking.status === "pending" && (
                          <button
                            onClick={() => updateBooking.mutate({ id: booking.id, status: "confirmed" })}
                            disabled={updateBooking.isPending}
                            className="px-3 py-1.5 bg-[#0F1E3D] text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-[#1E3A8A] transition-all shadow-sm disabled:opacity-60"
                          >
                            Confirm
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>

      {/* Booking Detail Modal */}
      <AnimatePresence>
        {selected && !showConvert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-3"
            onClick={(e) => e.target === e.currentTarget && setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-lg border border-[#0F1E3D]/5 overflow-hidden"
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#0F1E3D]/5 bg-[#F8FAFC]/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#0F1E3D] flex items-center justify-center text-white text-[11px] font-extrabold shadow-md">
                    {selected.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-[12px] font-extrabold text-[var(--brand-primary)]">{selected.name}</h2>
                    <span className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border mt-1",
                      (statusConfig[selected.status] ?? statusConfig.pending).color
                    )}>
                      {(() => { const S = (statusConfig[selected.status] ?? statusConfig.pending).icon; return <S className="h-3 w-3" />; })()}
                      {(statusConfig[selected.status] ?? statusConfig.pending).label}
                    </span>
                  </div>
                </div>
                <button onClick={() => setSelected(null)} className="p-2 rounded-xl hover:bg-white transition-colors">
                  <X className="h-4 w-4 text-[var(--brand-primary)]/40" />
                </button>
              </div>

              {/* Modal body */}
              <div className="px-6 py-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <InfoRow icon={<Mail className="h-3.5 w-3.5" />} label="Email" value={selected.email} />
                  {selected.phone && <InfoRow icon={<Phone className="h-3.5 w-3.5" />} label="Phone" value={selected.phone} />}
                  {selected.preferred_date && <InfoRow icon={<CalendarCheck className="h-3.5 w-3.5" />} label="Preferred Date" value={selected.preferred_date} />}
                  {selected.preferred_time && <InfoRow icon={<Clock className="h-3.5 w-3.5" />} label="Preferred Time" value={selected.preferred_time} />}
                  {selected.service_interest && <InfoRow icon={<AlertCircle className="h-3.5 w-3.5" />} label="Service Interest" value={selected.service_interest} />}
                  {selected.source && <InfoRow icon={<MessageSquare className="h-3.5 w-3.5" />} label="Source" value={selected.source} />}
                </div>

                {selected.message && (
                  <div className="bg-[#F8FAFC] border border-[#0F1E3D]/5 rounded-xl p-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--brand-primary)]/40 mb-2">Message</p>
                    <p className="text-[10px] font-medium text-[var(--brand-primary)] leading-relaxed">{selected.message}</p>
                  </div>
                )}
              </div>

              {/* Modal footer actions */}
              <div className="px-6 py-5 border-t border-[#0F1E3D]/5 bg-[#F8FAFC]/30 flex flex-wrap gap-3">
                {selected.status === "pending" && (
                  <button
                    onClick={() => { updateBooking.mutate({ id: selected.id, status: "confirmed" }); setSelected(null); }}
                    disabled={updateBooking.isPending}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-sm"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> Confirm Booking
                  </button>
                )}
                {selected.status === "pending" && (
                  <button
                    onClick={() => { updateBooking.mutate({ id: selected.id, status: "cancelled" }); setSelected(null); }}
                    disabled={updateBooking.isPending}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-all"
                  >
                    <XCircle className="h-3.5 w-3.5" /> Cancel
                  </button>
                )}
                {["confirmed", "pending"].includes(selected.status) && (
                  <button
                    onClick={() => setShowConvert(true)}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-[#0F1E3D] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#1E3A8A] transition-all shadow-md"
                  >
                    <UserPlus className="h-3.5 w-3.5" /> Convert to Client
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Convert to Client Modal */}
      <AnimatePresence>
        {showConvert && selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-3"
            onClick={(e) => e.target === e.currentTarget && setShowConvert(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md border border-[#0F1E3D]/5"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#0F1E3D] flex items-center justify-center">
                  <UserPlus className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-[12px] font-extrabold text-[var(--brand-primary)]">Convert to Client</h2>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--brand-primary)]/40 mt-0.5">
                    Add {selected.name} to your client directory
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--brand-primary)]/50 mb-1.5 block">
                    Company / Client Name *
                  </label>
                  <input
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Company name"
                    className="w-full bg-[#F8FAFC] border border-[#0F1E3D]/10 rounded-xl px-4 py-3 text-[10px] font-bold text-[var(--brand-primary)] placeholder:font-medium placeholder:text-[#0F1E3D]/30 focus:outline-none focus:border-[var(--brand-accent)] transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--brand-primary)]/50 mb-1.5 block">
                    Client Type
                  </label>
                  <select
                    value={clientType}
                    onChange={(e) => setClientType(e.target.value as "invoice" | "retainer")}
                    className="w-full bg-[#F8FAFC] border border-[#0F1E3D]/10 rounded-xl px-4 py-3 text-[10px] font-bold text-[var(--brand-primary)] focus:outline-none focus:border-[var(--brand-accent)] transition-colors"
                  >
                    <option value="retainer">Retainer (Monthly)</option>
                    <option value="invoice">Invoice (Project-based)</option>
                  </select>
                </div>

                <div className="bg-[#F8FAFC] border border-[#0F1E3D]/5 rounded-xl p-3 text-[10px] font-medium text-[var(--brand-primary)]/60 leading-relaxed">
                  This will create a new company record, mark the booking as converted, and send you a notification.
                </div>
              </div>

              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => setShowConvert(false)}
                  className="flex-1 px-4 py-3 bg-[#F8FAFC] text-[var(--brand-primary)] rounded-xl text-[10px] font-black uppercase tracking-widest border border-[#0F1E3D]/10 hover:bg-[#F1F5F9] transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleConvert}
                  disabled={!companyName.trim() || convertBooking.isPending}
                  className="flex-1 px-4 py-3 bg-[#0F1E3D] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#1E3A8A] transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {convertBooking.isPending
                    ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Converting...</>
                    : <><UserPlus className="h-3.5 w-3.5" /> Convert to Client</>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-[#F8FAFC] border border-[#0F1E3D]/5 rounded-xl p-3.5">
      <div className="flex items-center gap-1.5 mb-1 text-[var(--brand-primary)]/40">
        {icon}
        <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-[10px] font-bold text-[var(--brand-primary)] truncate">{value}</p>
    </div>
  );
}

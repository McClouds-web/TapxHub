import { useState } from "react";
import { format } from "date-fns";
import {
  Layers,
  TrendingUp,
  ShieldCheck,
  Users,
  Clock,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Phone,
  Mail,
  User,
  MessageSquare,
  CalendarCheck,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  getAvailableSlots,
  createBooking,
  formatSlotTime,
  type TimeSlot,
} from "@/lib/calendlyApi";

const leftBadges = [
  { icon: Layers, label: "Proven Systems" },
  { icon: TrendingUp, label: "Digital Growth" },
  { icon: ShieldCheck, label: "Elite Strategy" },
  { icon: Users, label: "Client-First" },
];

type Step = "date" | "time" | "form" | "success";

interface FormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

interface BookingSectionProps {
  clientName?: string;
  calendarContext?: string;
  sectionTitle?: string;
}

const BookingSection = ({
  sectionTitle,
  clientName,
  calendarContext,
}: BookingSectionProps) => {
  // ── State ──────────────────────────────────────────────────────────────────
  const [step, setStep] = useState<Step>("date");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | undefined>(undefined);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>({ name: "", email: "", phone: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleDateSelect = async (d: Date | undefined) => {
    if (!d) return;
    setDate(d);
    setSelectedSlot(undefined);
    setSlots([]);
    setSlotsError(null);
    setLoadingSlots(true);
    try {
      const available = await getAvailableSlots(d);
      setSlots(available);
      if (available.length === 0) {
        setSlotsError("No open slots on this day. Please pick another date.");
      } else {
        setStep("time");
      }
    } catch (e: unknown) {
      setSlotsError(
        e instanceof Error ? e.message : "Could not load availability. Try again."
      );
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    setStep("form");
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await createBooking({
        startTime: selectedSlot.start_time,
        name: form.name,
        email: form.email,
        phone: form.phone,
        message: form.message,
      });
      setStep("success");
    } catch (e: unknown) {
      setSubmitError(
        e instanceof Error ? e.message : "Could not confirm booking. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const resetBooking = () => {
    setStep("date");
    setDate(undefined);
    setSlots([]);
    setSelectedSlot(undefined);
    setForm({ name: "", email: "", phone: "", message: "" });
    setSlotsError(null);
    setSubmitError(null);
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <section
      id="booking"
      className="py-12 bg-white relative overflow-hidden"
    >
      <div className="mx-auto max-w-7xl relative z-10 w-full">
        {/* ── Header ───────────────────────────────────────────────────────── */}
        <div className="flex flex-col items-center text-center mb-16 max-w-3xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="text-3xl md:text-4xl font-bold text-[#0F1E3D] leading-tight mb-4"
          >
            {sectionTitle || "Schedule Your Next Session"}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-[10px] text-[#0F1E3D]/60 leading-relaxed font-light max-w-2xl"
          >
            {calendarContext ||
              "Pick a date and time below to schedule a check-in call directly inside the Hub."}
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-start w-full">
          {/* ── LEFT ─────────────────────────────────────────────────────── */}
          <div className="lg:sticky lg:top-32 text-center lg:text-left flex flex-col items-center lg:items-start w-full">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center justify-center lg:justify-start gap-2 md:gap-3 mb-5 md:mb-7"
            >
              <div className="w-6 md:w-8 h-px bg-[#0F1E3D]/25" />
              <span className="text-[10px] md:text-[10px] font-black uppercase tracking-[0.35em] text-[#0F1E3D]/35">
                TapxMedia Hub
              </span>
            </motion.div>

            <motion.h3
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.05 }}
              className="text-3xl lg:text-5xl font-bold text-[#0F1E3D] leading-tight md:leading-[1.05] mb-4 md:mb-5"
            >
              Ready to Align, {clientName || "Partner"}?
            </motion.h3>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.17 }}
              className="flex flex-wrap justify-center lg:justify-start gap-2 md:gap-3 mb-9 w-full max-w-[300px] sm:max-w-sm md:max-w-md lg:max-w-none mx-auto lg:mx-0"
            >
              {leftBadges.map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 rounded-xl bg-[#F8F9FA] border border-[#0F1E3D]/8 text-[8.5px] md:text-[10px] font-black uppercase tracking-widest text-[#0F1E3D]/50"
                >
                  <Icon className="w-3 h-3 md:w-3.5 md:h-3.5 text-[#1E3A8A]" strokeWidth={1.5} />
                  {label}
                </span>
              ))}
            </motion.div>

            {/* Step indicator */}
            {step !== "success" && (
              <div className="flex items-center gap-3 mt-4">
                {(["date", "time", "form"] as Step[]).map((s, i) => (
                  <div key={s} className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all duration-300 ${
                        step === s
                          ? "bg-[#0F1E3D] text-white"
                          : ["time", "form"].indexOf(step) > ["time", "form"].indexOf(s) || step === "form" && s === "time" || step === "form" && s === "date" || step === "time" && s === "date"
                          ? "bg-[#1E3A8A]/15 text-[#1E3A8A]"
                          : "bg-[#0F1E3D]/8 text-[#0F1E3D]/30"
                      }`}
                    >
                      {i + 1}
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${step === s ? "text-[#0F1E3D]" : "text-[#0F1E3D]/30"}`}>
                      {s === "date" ? "Date" : s === "time" ? "Time" : "Details"}
                    </span>
                    {i < 2 && <div className="w-4 h-px bg-[#0F1E3D]/15" />}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── RIGHT: Booking card ───────────────────────────────────────── */}
          <div id="booking-calendar" className="w-full">
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.08 }}
              className="bg-white rounded-[2rem] border border-[#0F1E3D]/8 shadow-[0_20px_80px_rgba(15,30,61,0.09)] overflow-hidden w-full"
            >
              <div className="px-6 py-10 md:px-12 md:py-14 w-full">
                <AnimatePresence mode="wait">

                  {/* ── STEP 1: Pick a date ──────────────────────────────── */}
                  {step === "date" && (
                    <motion.div
                      key="step-date"
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -16 }}
                      className="w-full"
                    >
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#0F1E3D]/35 mb-5">
                        Step 1 — Choose a Date
                      </p>

                      {/* Loading overlay */}
                      {loadingSlots && (
                        <div className="flex items-center gap-2 mb-4 text-[#1E3A8A]">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-[10px] font-semibold">Checking availability…</span>
                        </div>
                      )}

                      {slotsError && !loadingSlots && (
                        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-[10px] text-red-600 font-medium">
                          {slotsError}
                        </div>
                      )}

                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={handleDateSelect}
                        disabled={{ before: new Date(new Date().setHours(0,0,0,0)) }}
                        className="w-full"
                        classNames={{
                          months: "w-full",
                          month: "w-full space-y-3",
                          caption: "flex justify-center pt-1 relative items-center mb-1",
                          caption_label: "text-[10px] font-bold text-[#0F1E3D] uppercase tracking-wider",
                          nav: "space-x-1 flex items-center",
                          nav_button: "h-7 w-7 bg-transparent hover:bg-[#0F1E3D]/5 rounded-lg border border-[#0F1E3D]/10 transition-colors inline-flex items-center justify-center",
                          nav_button_previous: "absolute left-1",
                          nav_button_next: "absolute right-1",
                          table: "w-full border-collapse",
                          head_row: "flex w-full",
                          head_cell: "flex-1 text-center text-[10px] font-black uppercase tracking-widest text-[#0F1E3D]/30 pb-2",
                          row: "flex w-full mt-1",
                          cell: "flex-1 text-center p-0",
                          day: "w-full aspect-square flex items-center justify-center text-[10px] font-medium text-[#0F1E3D]/70 hover:bg-[#0F1E3D]/5 rounded-lg transition-colors cursor-pointer block",
                          day_selected: "bg-[#0F1E3D] text-white hover:bg-[#1E3A8A] rounded-lg font-bold",
                          day_today: "bg-[#0F1E3D]/6 text-[#0F1E3D] font-bold rounded-lg",
                          day_outside: "text-[#0F1E3D]/20",
                          day_disabled: "text-[#0F1E3D]/20 opacity-40 cursor-not-allowed pointer-events-none hover:bg-transparent",
                        }}
                      />
                    </motion.div>
                  )}

                  {/* ── STEP 2: Pick a time ──────────────────────────────── */}
                  {step === "time" && (
                    <motion.div
                      key="step-time"
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 16 }}
                      className="w-full"
                    >
                      <button
                        onClick={() => setStep("date")}
                        className="text-[10px] font-black uppercase tracking-widest text-[#0F1E3D]/30 hover:text-[#0F1E3D] transition-colors mb-5 flex items-center gap-1"
                      >
                        ← Back
                      </button>

                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#0F1E3D]/35 mb-1">
                        Step 2 — Choose a Time
                      </p>
                      <h4 className="text-[10px] font-bold text-[#0F1E3D] flex items-center gap-2 mb-4">
                        <Clock className="w-4 h-4 text-[#1E3A8A]" />
                        {date ? format(date, "EEEE, MMMM d") : ""}
                      </h4>

                      <div className="grid grid-cols-2 gap-3 w-full">
                        {slots.map((slot) => (
                           <button
                             key={slot.start_time}
                             onClick={() => handleSlotSelect(slot)}
                             className="py-3 px-4 rounded-xl border border-[#0F1E3D]/10 text-[10px] font-bold text-[#0F1E3D]/60 hover:border-[#0F1E3D]/40 hover:bg-[#0F1E3D]/4 hover:text-[#0F1E3D] transition-all text-center"
                           >
                             {formatSlotTime(slot.start_time)}
                           </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* ── STEP 3: Fill in details ───────────────────────────── */}
                  {step === "form" && (
                    <motion.div
                      key="step-form"
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 16 }}
                      className="w-full"
                    >
                      <button
                        onClick={() => setStep("time")}
                        className="text-[10px] font-black uppercase tracking-widest text-[#0F1E3D]/30 hover:text-[#0F1E3D] transition-colors mb-5 flex items-center gap-1"
                      >
                        ← Back
                      </button>

                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#0F1E3D]/35 mb-1">
                        Step 3 — Your Details
                      </p>

                      {/* Selected slot summary */}
                      {selectedSlot && date && (
                        <div className="flex items-center gap-2 mb-4 px-4 py-2.5 rounded-xl bg-[#0F1E3D]/4 border border-[#0F1E3D]/8">
                          <CalendarCheck className="w-3.5 h-3.5 text-[#1E3A8A] flex-shrink-0" />
                          <span className="text-[10px] font-bold text-[#0F1E3D]/70">
                            {format(date, "EEE, MMM d")} at{" "}
                            {formatSlotTime(selectedSlot.start_time)}
                          </span>
                        </div>
                      )}

                      <form onSubmit={handleSubmit} className="space-y-4 w-full">
                        {/* Name */}
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#0F1E3D]/30" />
                          <input
                            type="text"
                            name="name"
                            required
                            placeholder="Full Name"
                            value={form.name}
                            onChange={handleFormChange}
                            className="w-full pl-9 pr-4 py-3 rounded-xl border border-[#0F1E3D]/10 text-[10px] font-medium text-[#0F1E3D] placeholder:text-[#0F1E3D]/30 focus:outline-none focus:border-[#0F1E3D]/30 focus:ring-2 focus:ring-[#0F1E3D]/8 transition-all bg-[#FAFAFA]"
                          />
                        </div>

                        {/* Email */}
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#0F1E3D]/30" />
                          <input
                            type="email"
                            name="email"
                            required
                            placeholder="Email Address"
                            value={form.email}
                            onChange={handleFormChange}
                            className="w-full pl-9 pr-4 py-3 rounded-xl border border-[#0F1E3D]/10 text-[10px] font-medium text-[#0F1E3D] placeholder:text-[#0F1E3D]/30 focus:outline-none focus:border-[#0F1E3D]/30 focus:ring-2 focus:ring-[#0F1E3D]/8 transition-all bg-[#FAFAFA]"
                          />
                        </div>

                        {/* Phone */}
                        <div className="relative">
                          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#0F1E3D]/30" />
                          <input
                            type="tel"
                            name="phone"
                            placeholder="Phone Number (optional)"
                            value={form.phone}
                            onChange={handleFormChange}
                            className="w-full pl-9 pr-4 py-3 rounded-xl border border-[#0F1E3D]/10 text-[10px] font-medium text-[#0F1E3D] placeholder:text-[#0F1E3D]/30 focus:outline-none focus:border-[#0F1E3D]/30 focus:ring-2 focus:ring-[#0F1E3D]/8 transition-all bg-[#FAFAFA]"
                          />
                        </div>

                        {/* Message */}
                        <div className="relative">
                          <MessageSquare className="absolute left-3.5 top-3.5 w-3.5 h-3.5 text-[#0F1E3D]/30" />
                          <textarea
                            name="message"
                            placeholder="What would you like to discuss? (optional)"
                            value={form.message}
                            onChange={handleFormChange}
                            rows={3}
                            className="w-full pl-9 pr-4 py-3 rounded-xl border border-[#0F1E3D]/10 text-[10px] font-medium text-[#0F1E3D] placeholder:text-[#0F1E3D]/30 focus:outline-none focus:border-[#0F1E3D]/30 focus:ring-2 focus:ring-[#0F1E3D]/8 transition-all bg-[#FAFAFA] resize-none"
                          />
                        </div>

                        {submitError && (
                          <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-[10px] text-red-600 font-medium">
                            {submitError}
                          </div>
                        )}

                        <Button
                          type="submit"
                          disabled={submitting || !form.name || !form.email}
                          className="w-full gap-2 rounded-xl h-12 text-[10px] font-black uppercase tracking-widest bg-[#0F1E3D] hover:bg-[#1E3A8A] shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          {submitting ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              Confirming…
                            </>
                          ) : (
                            <>
                              Book My Strategy Call
                              <ArrowRight className="w-3.5 h-3.5" />
                            </>
                          )}
                        </Button>

                        <p className="text-center text-[10px] text-[#0F1E3D]/30 font-medium leading-relaxed">
                          You'll receive a calendar confirmation to your email.
                          <br />No spam. Cancel anytime.
                        </p>
                      </form>
                    </motion.div>
                  )}

                  {/* ── SUCCESS ───────────────────────────────────────────── */}
                  {step === "success" && (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center text-center py-6 w-full"
                    >
                      <div className="w-16 h-16 rounded-full bg-[#0F1E3D]/6 flex items-center justify-center mb-4">
                        <CheckCircle2 className="w-8 h-8 text-[#1E3A8A]" strokeWidth={1.5} />
                      </div>

                      <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#0F1E3D]/35 mb-3">
                        You're Confirmed
                      </p>

                      <h3 className="text-[13px] md:text-3xl font-bold text-[#0F1E3D] mb-4 leading-tight">
                        Your Strategy Call <br />is Booked!
                      </h3>

                      <p className="text-[10px] text-[#0F1E3D]/55 font-light leading-relaxed mb-2 max-w-xs">
                        A calendar invite and confirmation email is on its way to{" "}
                        <span className="font-semibold text-[#0F1E3D]/80">{form.email}</span>.
                      </p>

                      {selectedSlot && date && (
                        <div className="flex items-center justify-center gap-2 mt-4 mb-5 px-5 py-3 rounded-xl bg-[#0F1E3D]/4 border border-[#0F1E3D]/8">
                          <CalendarCheck className="w-4 h-4 text-[#1E3A8A] flex-shrink-0" />
                          <span className="text-[10px] font-bold text-[#0F1E3D]">
                            {format(date, "EEEE, MMMM d")} at{" "}
                            {formatSlotTime(selectedSlot.start_time)}
                          </span>
                        </div>
                      )}

                      <button
                        onClick={resetBooking}
                        className="text-[10px] font-black uppercase tracking-widest text-[#0F1E3D]/30 hover:text-[#0F1E3D] transition-colors"
                      >
                        Book Another Call
                      </button>
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookingSection;

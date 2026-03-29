/**
 * Calendly v2 API helpers
 * -------------------------------------------------
 * Calls Calendly directly from the browser (their API allows CORS).
 * The token is embedded in the VITE_ bundle — acceptable for a
 * marketing site where the only risk is someone making fake bookings.
 * For a higher-security setup, move these calls to a serverless function.
 *
 * Required env vars:
 *   VITE_CALENDLY_API_TOKEN   — Personal Access Token from Calendly
 *   VITE_CALENDLY_EVENT_TYPE_URI — Full API URI of your event type
 *     e.g. https://api.calendly.com/event_types/XXXXXXXXXXXXXXXX
 */

const TOKEN = import.meta.env.VITE_CALENDLY_API_TOKEN as string;
const EVENT_TYPE_URI = import.meta.env.VITE_CALENDLY_EVENT_TYPE_URI as string;

const BASE = "https://api.calendly.com";

function headers() {
  return {
    Authorization: `Bearer ${TOKEN}`,
    "Content-Type": "application/json",
  };
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface TimeSlot {
  start_time: string; // ISO 8601
  end_time: string;
  invitees_remaining: number;
}

export interface BookingPayload {
  startTime: string;   // ISO 8601 — must match exactly a slot start_time
  name: string;
  email: string;
  phone?: string;
  message?: string;
}

export interface BookingResult {
  uri: string;
  status: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Convert a local Date to a UTC ISO string at midnight */
function dayToUtcRange(date: Date): { start: string; end: string } {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { start: start.toISOString(), end: end.toISOString() };
}

// ── API functions ─────────────────────────────────────────────────────────────

/**
 * Returns available time slots for a given date.
 * Uses GET /event_type_available_times
 */
function isTokenConfigured(): boolean {
  return (
    !!TOKEN &&
    !!EVENT_TYPE_URI &&
    !TOKEN.includes("your_") &&
    !EVENT_TYPE_URI.includes("your_")
  );
}

export async function getAvailableSlots(date: Date): Promise<TimeSlot[]> {
  if (!isTokenConfigured()) {
    console.warn("Calendly env vars not set — returning demo slots.");
    return getDemoSlots(date);
  }

  const { start, end } = dayToUtcRange(date);
  const params = new URLSearchParams({
    event_type: EVENT_TYPE_URI,
    start_time: start,
    end_time: end,
  });

  const res = await fetch(`${BASE}/event_type_available_times?${params}`, {
    headers: headers(),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? `Calendly error ${res.status}`);
  }

  const data = await res.json();
  // Filter out fully booked slots
  return (data.collection as TimeSlot[]).filter(
    (s) => s.invitees_remaining > 0
  );
}

/**
 * Creates a booking (invitee) for a specific start time.
 * Uses POST /scheduled_events/{uuid}/invitees
 *
 * NOTE: This endpoint requires the event UUID, not the event type URI.
 * Calendly's "Scheduling API" (create invitee directly on an available slot)
 * is the v2 endpoint we target here.
 */
export async function createBooking(payload: BookingPayload): Promise<BookingResult> {
  if (!isTokenConfigured()) {
    console.warn("Calendly env vars not set — simulating booking.");
    return simulateBooking(payload);
  }

  // Step 1: Call the native Create Invitee endpoint to schedule the meeting immediately
  const bookingPayload: any = {
    event_type: EVENT_TYPE_URI,
    start_time: payload.startTime,
    invitee: {
      name: payload.name,
      email: payload.email,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  };

  if (payload.phone) {
    bookingPayload.invitee.text_reminder_number = payload.phone;
  }

  const bookingRes = await fetch(`${BASE}/invitees`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(bookingPayload),
  });

  if (bookingRes.ok) {
    const bookingData = await bookingRes.json();
    const uri = bookingData?.resource?.uri ?? "";
    return {
      uri,
      status: "active",
    };
  }

  const err = await bookingRes.json().catch(() => ({}));
  throw new Error(err.message || "Failed to finalize the booking with Calendly API.");
}

// ── Demo / fallback helpers (no real Calendly token needed locally) ────────────

const DEMO_TIMES = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"];

function getDemoSlots(date: Date): TimeSlot[] {
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
  if (isWeekend) return [];
  return DEMO_TIMES.map((t) => {
    const start = new Date(date);
    const [h, m] = t.split(":").map(Number);
    start.setHours(h, m, 0, 0);
    const end = new Date(start);
    end.setHours(end.getHours() + 1);
    return { start_time: start.toISOString(), end_time: end.toISOString(), invitees_remaining: 1 };
  });
}

async function simulateBooking(payload: BookingPayload): Promise<BookingResult> {
  await new Promise((r) => setTimeout(r, 1200)); // simulate network
  console.log("Simulated booking:", payload);
  return { uri: "https://calendly.com/demo", status: "active" };
}

// ── Utility ───────────────────────────────────────────────────────────────────

/** Format an ISO slot start_time into a human-readable time string */
export function formatSlotTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

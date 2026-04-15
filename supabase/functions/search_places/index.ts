// supabase/functions/search_places/index.ts
//
// Searches Google Places Text Search API and returns a normalised
// array of Prospect objects that match the LeadEngine frontend schema.
//
// Deploy : supabase functions deploy search_places
// Secret : supabase secrets set GOOGLE_PLACES_API_KEY=AIza...
//
// ── Response contract ────────────────────────────────────────────────────────
// This function ALWAYS returns HTTP 200.
// Errors are embedded in the JSON body so the Supabase client library
// never short-circuits into a generic non-2xx exception:
//
//   Success → { success: true,  results: Prospect[], count: number, query: string }
//   Failure → { success: false, error: string, code: string, results: [] }
// ─────────────────────────────────────────────────────────────────────────────

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// ── Types ────────────────────────────────────────────────────────────────────

interface Prospect {
  id: string;       // Google place_id
  name: string;
  industry: string;
  address: string;
  website: string;
  email: string;    // Google Places never returns email; always ""
  phone: string;
  rating: number;
}

interface PlacesTextSearchResult {
  place_id: string;
  name: string;
  formatted_address: string;
  rating?: number;
  types?: string[];
  business_status?: string;
}

interface PlaceDetailsResult {
  formatted_phone_number?: string;
  international_phone_number?: string;
  website?: string;
}

// ── Google type → human-readable industry ───────────────────────────────────

const TYPE_MAP: Record<string, string> = {
  dentist: "Dentistry",
  doctor: "Healthcare",
  hospital: "Healthcare",
  clinic: "Healthcare",
  physiotherapist: "Healthcare",
  pharmacy: "Healthcare",
  veterinary_care: "Veterinary",
  restaurant: "Food & Beverage",
  cafe: "Food & Beverage",
  bakery: "Food & Beverage",
  bar: "Hospitality",
  night_club: "Hospitality",
  hotel: "Hospitality",
  lodging: "Hospitality",
  travel_agency: "Travel",
  real_estate_agency: "Real Estate",
  lawyer: "Legal",
  accounting: "Accounting",
  finance: "Finance",
  bank: "Finance",
  insurance_agency: "Insurance",
  car_dealer: "Automotive",
  car_repair: "Automotive",
  car_rental: "Automotive",
  gym: "Fitness & Wellness",
  beauty_salon: "Beauty",
  hair_care: "Beauty",
  spa: "Beauty",
  school: "Education",
  university: "Education",
  electrician: "Trades",
  plumber: "Trades",
  painter: "Trades",
  roofing_contractor: "Construction",
  general_contractor: "Construction",
  moving_company: "Logistics",
  storage: "Logistics",
  supermarket: "Retail",
  clothing_store: "Fashion",
  shoe_store: "Fashion",
  home_goods_store: "Retail",
  electronics_store: "Technology",
  it_company: "Technology",
  software: "Technology",
  marketing_agency: "Marketing",
  advertising_agency: "Marketing",
  media: "Media",
  church: "Religious",
  funeral_home: "Services",
  laundry: "Services",
  dry_cleaning: "Services",
  establishment: "Business",
  point_of_interest: "Business",
};

function inferIndustry(types: string[] = []): string {
  for (const t of types) {
    const mapped = TYPE_MAP[t];
    if (mapped && mapped !== "Business") return mapped;
  }
  // Last-resort: capitalise and de-snake the first non-generic type
  const candidate = types.find(
    (t) => t !== "point_of_interest" && t !== "establishment"
  );
  if (candidate) {
    return candidate
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }
  return "Business";
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Build a plain-text response that always carries HTTP 200. */
function ok(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

/** Decode Google's `status` field into a clear, actionable message. */
function interpretGoogleStatus(status: string, apiErrorMessage?: string): string {
  switch (status) {
    case "REQUEST_DENIED":
      return (
        apiErrorMessage ??
        "Google rejected the request (REQUEST_DENIED). " +
        "Verify that (1) the Places API is enabled in Google Cloud Console, " +
        "(2) billing is active on the project, and " +
        "(3) the GOOGLE_PLACES_API_KEY secret is correct."
      );
    case "OVER_DAILY_LIMIT":
      return (
        "You have exceeded your daily Google Places API quota (OVER_DAILY_LIMIT). " +
        "Check your GCP billing dashboard and increase your daily request limit."
      );
    case "OVER_QUERY_LIMIT":
      return (
        "Too many requests per second (OVER_QUERY_LIMIT). " +
        "Wait a moment and try again, or upgrade your GCP quota."
      );
    case "INVALID_REQUEST":
      return (
        "Google received an invalid request (INVALID_REQUEST). " +
        "Ensure the search keyword and location are non-empty strings."
      );
    case "ZERO_RESULTS":
      return ""; // not an error – handled separately as an empty result set
    case "UNKNOWN_ERROR":
      return (
        "Google returned an unknown server error (UNKNOWN_ERROR). " +
        "This is usually transient – try again in a few seconds."
      );
    default:
      return `Google Places API returned status: ${status}.`;
  }
}

// ── Place Details fetcher (phone + website) ───────────────────────────────────

async function fetchPlaceDetails(
  placeId: string,
  apiKey: string
): Promise<PlaceDetailsResult> {
  const url =
    `https://maps.googleapis.com/maps/api/place/details/json` +
    `?place_id=${encodeURIComponent(placeId)}` +
    `&fields=formatted_phone_number,international_phone_number,website` +
    `&key=${apiKey}`;

  try {
    const res = await fetch(url);
    if (!res.ok) return {};
    const json = await res.json();
    return (json.result as PlaceDetailsResult) ?? {};
  } catch {
    return {};
  }
}

// ── Main handler ──────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  try {
    // ── 1. Read secrets & body ────────────────────────────────────────────────
    const apiKey = Deno.env.get("GOOGLE_PLACES_API_KEY");

    if (!apiKey) {
      return ok({
        success: false,
        code: "MISSING_SECRET",
        error:
          "GOOGLE_PLACES_API_KEY is not set. " +
          "Run: supabase secrets set GOOGLE_PLACES_API_KEY=AIza...",
        results: [],
      });
    }

    const body = await req.json().catch(() => ({}));
    const keyword = (body.keyword ?? "").toString().trim();
    const location = (body.location ?? "").toString().trim();

    if (!keyword || !location) {
      return ok({
        success: false,
        code: "INVALID_REQUEST",
        error: "Both 'keyword' and 'location' are required.",
        results: [],
      });
    }

    // ── 2. Build the search query ─────────────────────────────────────────────
    // Concatenating keyword + location as a natural-language query works
    // reliably across all global cities and business types. Using the
    // `location` bias parameter alone would require geocoding; a freeform
    // query string is more universally accurate (e.g. "hotels Gaborone").
    const query = `${keyword} in ${location}`;

    // ── 3. Text Search ────────────────────────────────────────────────────────
    const textSearchUrl =
      `https://maps.googleapis.com/maps/api/place/textsearch/json` +
      `?query=${encodeURIComponent(query)}` +
      `&key=${apiKey}`;

    const textSearchResponse = await fetch(textSearchUrl);

    if (!textSearchResponse.ok) {
      return ok({
        success: false,
        code: "FETCH_ERROR",
        error:
          `Google Text Search HTTP ${textSearchResponse.status}: ` +
          (await textSearchResponse.text().catch(() => "unknown")),
        results: [],
      });
    }

    const textSearchJson = await textSearchResponse.json();
    const googleStatus: string = textSearchJson.status ?? "UNKNOWN_ERROR";

    // ── 4. Interpret Google's status ──────────────────────────────────────────
    if (googleStatus === "ZERO_RESULTS") {
      return ok({
        success: true,
        results: [],
        count: 0,
        query,
        hint:
          `No results for "${query}". Try a broader term or check the spelling of the city.`,
      });
    }

    if (googleStatus !== "OK") {
      const errorMsg = interpretGoogleStatus(
        googleStatus,
        textSearchJson.error_message
      );
      return ok({
        success: false,
        code: googleStatus,
        error: errorMsg,
        results: [],
      });
    }

    // ── 5. Fetch place details in parallel (capped at 8 results) ──────────────
    const rawPlaces: PlacesTextSearchResult[] = (
      textSearchJson.results ?? []
    ).slice(0, 8);

    const detailsArray = await Promise.all(
      rawPlaces.map((place) => fetchPlaceDetails(place.place_id, apiKey))
    );

    // ── 6. Normalise into Prospect[] ──────────────────────────────────────────
    const prospects: Prospect[] = rawPlaces.map((place, i) => {
      const details = detailsArray[i];
      return {
        id: place.place_id,
        name: place.name,
        industry: inferIndustry(place.types),
        address: place.formatted_address,
        website: details.website ?? "",
        email: "",   // Google Places API does not expose email addresses
        phone:
          details.formatted_phone_number ??
          details.international_phone_number ??
          "",
        rating: place.rating ?? 0,
      };
    });

    return ok({
      success: true,
      results: prospects,
      count: prospects.length,
      query,
    });
  } catch (err: unknown) {
    // ── 7. Last-resort catch — still return 200 ───────────────────────────────
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred.";
    console.error("[search_places] Unhandled error:", message);
    return ok({
      success: false,
      code: "INTERNAL_ERROR",
      error: `Internal function error: ${message}`,
      results: [],
    });
  }
});

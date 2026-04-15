// supabase/functions/stripe_checkout/index.ts
// Deno edge function — creates a Stripe Checkout Session and returns the URL.
// Deploy: supabase functions deploy stripe_checkout
// Required secrets: STRIPE_SECRET_KEY, STRIPE_SUCCESS_URL, STRIPE_CANCEL_URL

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
    const SUCCESS_URL =
      Deno.env.get("STRIPE_SUCCESS_URL") ??
      "https://tapxmedia.com/hub/my-invoices?payment=success";
    const CANCEL_URL =
      Deno.env.get("STRIPE_CANCEL_URL") ??
      "https://tapxmedia.com/hub/my-invoices?payment=cancelled";

    if (!STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set in Supabase secrets.");
    }

    const body = await req.json();
    const { invoice_id, invoice_number, amount, customer_email } = body as {
      invoice_id: string;
      invoice_number: string;
      amount: number; // value in dollars (e.g. 1500.00)
      customer_email?: string;
    };

    if (!invoice_id || !amount || amount <= 0) {
      return new Response(
        JSON.stringify({ error: "invoice_id and a positive amount are required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Convert dollars → cents for Stripe
    const amountCents = Math.round(amount * 100);

    // Build URLSearchParams body — Stripe REST API uses application/x-www-form-urlencoded
    const params = new URLSearchParams({
      "payment_method_types[]": "card",
      "line_items[0][price_data][currency]": "usd",
      "line_items[0][price_data][product_data][name]": `Invoice ${invoice_number}`,
      "line_items[0][price_data][product_data][description]":
        "TapxMedia — Digital Marketing Services",
      "line_items[0][price_data][unit_amount]": String(amountCents),
      "line_items[0][quantity]": "1",
      mode: "payment",
      success_url: `${SUCCESS_URL}&invoice_id=${invoice_id}`,
      cancel_url: `${CANCEL_URL}&invoice_id=${invoice_id}`,
      // Attach invoice_id so the webhook can reconcile
      "metadata[invoice_id]": invoice_id,
      "metadata[invoice_number]": invoice_number,
    });

    if (customer_email) {
      params.set("customer_email", customer_email);
    }

    const stripeResponse = await fetch(
      "https://api.stripe.com/v1/checkout/sessions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      }
    );

    if (!stripeResponse.ok) {
      const err = await stripeResponse.json();
      throw new Error(
        err?.error?.message ?? `Stripe API error: ${stripeResponse.status}`
      );
    }

    const session = await stripeResponse.json();

    return new Response(
      JSON.stringify({ url: session.url, session_id: session.id }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("[stripe_checkout]", message);
    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

// Cors headers to allow requests
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Note: In an edge function, you use Deno.env instead of process.env
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // We must use the SERVICE ROLE key to bypass RLS when acting as a background worker
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse the Calendly Webhook Payload
    const payload = await req.json();

    // Calendly payload structure generally sends data in payload.payload
    // Example: payload.payload.name, payload.payload.email
    const calendlyData = payload?.payload;

    if (!calendlyData || !calendlyData.email) {
      throw new Error("Missing Calendly payload data");
    }

    const { name, email } = calendlyData;

    // Insert into TapxHub `bookings` table as a Pending Client
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert([
        {
          name: name,
          email: email,
          status: 'pending',
          source: 'Calendly Auto-Sync',
        }
      ])
      .select()
      .single();

    if (bookingError) throw bookingError;

    // Optional: Also send a notification to the TapxHub Admin (you)
    await supabase.from('notifications').insert([{
      title: 'New Booking Synced',
      message: `${name} just booked a call via Calendly.`,
      type: 'webhook_alert'
    }]);

    return new Response(
      JSON.stringify({ success: true, message: 'Calendly Sync Complete', booking }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});

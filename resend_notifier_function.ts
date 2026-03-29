import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;

    if (!RESEND_API_KEY) {
      throw new Error("Missing RESEND_API_KEY in Environment Variables");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Parse the Webhook payload triggered by Supabase
    // This script expects a Supabase "Insert" Webhook payload
    const payload = await req.json();

    if (payload.type !== 'INSERT') {
      return new Response('We only care about new inserts, ignoring.', { status: 200 });
    }

    const { table, record } = payload;
    let recipientEmail = '';
    let emailSubject = '';
    let emailHtml = '';

    // ==========================================
    // LOGIC 1: A new Brand File is Uploaded
    // ==========================================
    if (table === 'files' && record.company_id) {
      
      // Grab the client's actual email address from the CRM (companies table)
      const { data: companyInfo } = await supabase
        .from('companies')
        .select('name, contact_email')
        .eq('id', record.company_id)
        .single();

      if (companyInfo && companyInfo.contact_email) {
        recipientEmail = companyInfo.contact_email;
        emailSubject = `Your New File is Ready - TapxMedia`;
        emailHtml = `
          <h2 style="color: #0F1E3D; font-family: sans-serif;">Identity Vault Updated</h2>
          <p style="font-family: sans-serif;">Hi team,</p>
          <p style="font-family: sans-serif;">A new file named <strong>${record.name}</strong> was just securely uploaded into your portal.</p>
          <br>
          <a href="https://hub.tapxmedia.com/my-files" style="background-color: #1E3A8A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-family: sans-serif;">
            View in Portal
          </a>
        `;
      } else {
        throw new Error("The client profile is missing a contact_email.");
      }

    // ==========================================
    // LOGIC 2: A new Task is created
    // ==========================================
    } else if (table === 'tasks') {
      // Automatically email yourself (the Admin) when things are assigned
      recipientEmail = "tapiwa.makore@tapxmedia.com"; 
      emailSubject = `New TapxHub Task: ${record.title}`;
      emailHtml = `
        <h3>TapxMedia Task Tracker Alert</h3>
        <p>A new task was logged into the system.</p>
        <p><strong>Title:</strong> ${record.title}</p>
        <p><strong>Status:</strong> ${record.status}</p>
        <p><strong>Priority:</strong> ${record.priority}</p>
      `;
    }

    // 2. Stop executing if there's no matching logic
    if (!recipientEmail || !emailHtml) {
       return new Response('Action ignored - No email rules applied to this row.', { status: 200 });
    }

    // 3. Send Mobile Push Notification (ntfy.sh)
    const NTFY_TOPIC = "tapxmedia-alerts";
    fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
      method: "POST",
      headers: {
        "Title": emailSubject,
        "Priority": record.priority === "high" ? "5" : "3",
        "Tags": table === "tasks" ? "clipboard,loudspeaker" : "package,sparkles",
      },
      body: record.title || `New Activity in ${table} table`,
    }).catch(err => console.error("ntfy failed", err));

    // 4. Send the Email using the Resend API
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'TapxMedia OS <noreply@tapxmedia.com>',
        to: [recipientEmail],
        subject: emailSubject,
        html: emailHtml,
      }),
    });

    const responseData = await res.json();
    return new Response(JSON.stringify({ success: true, resendResponse: responseData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Function Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});

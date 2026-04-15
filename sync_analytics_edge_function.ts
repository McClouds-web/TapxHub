import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Master Agency Tokens - securely stored in Supabase secrets
const META_SYSTEM_ACCESS_TOKEN = Deno.env.get("META_SYSTEM_ACCESS_TOKEN");
const GOOGLE_ADS_DEVELOPER_TOKEN = Deno.env.get("GOOGLE_ADS_DEVELOPER_TOKEN");
const GOOGLE_ADS_REFRESH_TOKEN = Deno.env.get("GOOGLE_ADS_REFRESH_TOKEN");
const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID");
const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET");

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req) => {
  try {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];

    // 1. Fetch enabling companies that have IDs for Meta/Google
    const { data: companies, error: companiesError } = await supabase
      .from("companies")
      .select("*")
      .eq("sync_enabled", true);

    if (companiesError) throw companiesError;
    if (!companies || companies.length === 0) {
      return new Response("No companies to sync", { status: 200 });
    }

    const results = [];

    for (const company of companies) {
      const stats = {
        reach: 0,
        impressions: 0,
        clicks: 0,
        spend: 0,
        leads: 0,
      };

      // ─── META ADS SYNC (Simplified Example) ────────────────────
      if (company.meta_ad_account_id && META_SYSTEM_ACCESS_TOKEN) {
        try {
          const metaUrl = `https://graph.facebook.com/v18.0/act_${company.meta_ad_account_id}/insights?fields=reach,impressions,clicks,spend&date_preset=this_month&access_token=${META_SYSTEM_ACCESS_TOKEN}`;
          const res = await fetch(metaUrl);
          const data = await res.json();
          
          if (data.data && data.data[0]) {
            const metaStats = data.data[0];
            stats.reach += parseInt(metaStats.reach || 0);
            stats.impressions += parseInt(metaStats.impressions || 0);
            stats.clicks += parseInt(metaStats.clicks || 0);
            stats.spend += parseFloat(metaStats.spend || 0);
          }
        } catch (e) {
          console.error(`Meta sync error for ${company.name}:`, e);
        }
      }

      // ─── GOOGLE ADS SYNC (Simplified Example) ──────────────────
      // Note: Real Google Ads API requires an OAuth flow to exchange tokens.
      // We would use the Service Role/Refresh token here normally.
      
      // ─── UPSERT THE REPORT ─────────────────────────────────────
      const { error: upsertError } = await supabase
        .from("client_reports")
        .upsert({
          company_id: company.id,
          report_month: firstDayOfMonth,
          reach: stats.reach,
          impressions: stats.impressions,
          clicks: stats.clicks,
          spend: stats.spend,
          synced_at: new Date().toISOString(),
        }, { onConflict: 'company_id,report_month' });

      results.push({ name: company.name, success: !upsertError });
    }

    return new Response(JSON.stringify({ results }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Sync Analytics Error:", error);
    return new Response("Sync Failed", { status: 500 });
  }
});

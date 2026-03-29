import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN")!;
const TELEGRAM_CHAT_ID = Deno.env.get("TELEGRAM_CHAT_ID")!; // Your personal phone's Chat ID
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req) => {
  try {
    const payload = await req.json();

    // ─── 1. OUTBOUND: Supabase Database -> Telegram ────────────────────
    // This catches new messages from clients in the DB and pushes to your phone
    if (payload.type === "INSERT" && payload.table === "messages") {
      const record = payload.record;
      
      // We only want to notify you if the client sends a message, not if you send one.
      if (record.sender_role !== "client") {
         return new Response("Ignored admin message", { status: 200 });
      }

      // Fetch the company name to make your notification look nice
      const { data: conv } = await supabase
        .from("conversations")
        .select(`companies(name)`)
        .eq("id", record.conversation_id)
        .single();
        
      const companyName = conv?.companies?.name || "Unknown Company";

      // The text sent to your Telegram
      const text = `📬 *New Client Message*\n🏢 *${companyName}*\n\n"${record.content}"\n\n_Reply directly to this message to send a response._\n<${record.conversation_id}>`;

      // Send via Telegram API
      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: text,
          parse_mode: "Markdown",
        }),
      });

      return new Response("Sent to Telegram", { status: 200 });
    }

    // ─── 2. INBOUND: Telegram -> Supabase Database ─────────────────────
    // This catches your replies from your phone and pushes them to TapxHub
    if (payload.message && payload.message.reply_to_message) {
      const replyText = payload.message.text;
      const originalBotMessage = payload.message.reply_to_message.text;

      // Extract the hidden conversation_id from the original bot message
      // We formatted it like <abcdef-1234-uuid> at the bottom.
      const match = originalBotMessage.match(/<([a-zA-Z0-9-]+)>/);
      
      if (match && match[1]) {
        const conversationId = match[1];

        // 1. To avoid Foreign Key violations, we need a valid Admin UUID.
        // We'll fetch the first available admin profile.
        const { data: admin } = await supabase
          .from("profiles")
          .select("id")
          .eq("role", "admin")
          .limit(1)
          .single();

        if (!admin) {
           return new Response("No admin profile found to assign message", { status: 400 });
        }

        // 2. Insert your reply back into the client's database portal
        await supabase.from("messages").insert([{
          conversation_id: conversationId,
          sender_id: admin.id,
          sender_role: "admin",
          content: replyText,
          is_read: false
        }]);

        // 3. Auto-update conversation timestamp
        await supabase.from("conversations").update({ last_message_at: new Date().toISOString() }).eq("id", conversationId);

        // Tell your Telegram bot to quickly react with a checkmark so you know it sent!
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
             chat_id: TELEGRAM_CHAT_ID,
             text: `✅ Reply successfully pushed to TapxHub Client Portal!`,
             reply_to_message_id: payload.message.message_id
          })
        });

        return new Response("Reply pushed to Supabase", { status: 200 });
      }
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Telegram Webhook Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
});

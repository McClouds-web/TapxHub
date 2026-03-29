-- NOTE: Run this directly in your Supabase SQL Editor.
-- Replace YOUR_PROJECT_REF with your actual Supabase project reference (eg. xxxxxxxxxxxxxxxxxxxx)
-- Replace YOUR_EDGE_FUNCTION_SECRET with your anon key or a custom secret that your edge function checks (we rely on Deno env vars primarily, but standard webhook auth requires anon or service_role key if JWT is enforced).

-- Enable pg_net to make HTTP requests from inside Postgres
CREATE EXTENSION IF NOT EXISTS "pg_net";

-- The trigger function that intercepts new client messages
CREATE OR REPLACE FUNCTION notify_telegram_bot()
RETURNS trigger AS $$
DECLARE
  payload JSONB;
BEGIN
  -- We only push out if the message is from a client
  IF NEW.sender_role = 'admin' THEN
    RETURN NEW;
  END IF;

  -- Build the JSON payload matching exactly what the Edge Function expects
  payload := jsonb_build_object(
    'type', 'INSERT',
    'table', 'messages',
    'schema', 'public',
    'record', row_to_json(NEW)
  );

  -- Fire the webhook asynchronously to your Edge Function!
  PERFORM net.http_post(
    url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/telegram-bot',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer YOUR_ANON_KEY'
    ),
    body := payload
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach the trigger to the messages table
DROP TRIGGER IF EXISTS on_client_message_created ON public.messages;
CREATE TRIGGER on_client_message_created
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_telegram_bot();

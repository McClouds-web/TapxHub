import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function auditFunctions() {
  console.log("--- AUDITING RPC FUNCTIONS ---");
  
  const functions = [
    'convert_lead_to_client',
    'get_user_role',
    'get_user_company_id',
    'recalculate_client_health'
  ];

  for (const fn of functions) {
    // Attempt to call with non-existent UUID to see if it errors with 'function not found' or 'invalid input'
    const { error } = await supabase.rpc(fn, { 
      p_lead_id: '00000000-0000-0000-0000-000000000000',
      p_admin_id: '00000000-0000-0000-0000-000000000000'
    });
    
    if (error && error.message.includes('does not exist')) {
      console.log(`❌ Function ${fn}: MISSING`);
    } else {
      console.log(`✅ Function ${fn}: EXISTS (or errored with valid code: ${error?.message})`);
    }
  }
}

async function auditTables() {
  console.log("\n--- AUDITING TABLES ---");
  const tables = [
    'leads',
    'social_content',
    'brand_outputs',
    'activity_logs',
    'companies',
    'projects',
    'tasks',
    'files',
    'profiles',
    'notifications'
  ];

  for (const table of tables) {
    const { error } = await supabase.from(table).select('id').limit(1);
    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('0 rows')) {
        console.log(`✅ Table ${table}: EXISTS (Empty)`);
      } else if (error.message.includes('does not exist')) {
        console.log(`❌ Table ${table}: MISSING`);
      } else {
        console.log(`⚠️ Table ${table}: ERROR (${error.message})`);
      }
    } else {
      console.log(`✅ Table ${table}: EXISTS`);
    }
  }
}

async function run() {
  await auditFunctions();
  await auditTables();
}

run();

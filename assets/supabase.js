// Connect Collaborative Pianist to Supabase

const SUPABASE_URL = "https://khdmqbrzbxeuuwksjudx.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_B99_uIC1p2au3MrTACFCyw_U8dAnMTy";

// Create the Supabase client
const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

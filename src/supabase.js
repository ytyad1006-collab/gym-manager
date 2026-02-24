import { createClient } from "@supabase/supabase-js";

// keep these values secret – use a local .env file and set VITE_SUPABASE_URL
// and VITE_SUPABASE_KEY before running the app.  Vite exposes variables
// prefixed with `VITE_` through `import.meta.env`.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://hynbyizhnfzjxkpyczdo.supabase.co";
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5bmJ5aXpobmZ6anhrcHljemRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4OTc5MjQsImV4cCI6MjA4NzQ3MzkyNH0.KWKSKa05iiZP14Hsn9pnj2Tg0IfrVVDn09tebHuBzDM";

// sanity check during startup so we notice misconfiguration early
if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Missing Supabase configuration. Make sure VITE_SUPABASE_URL and VITE_SUPABASE_KEY are defined."
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);
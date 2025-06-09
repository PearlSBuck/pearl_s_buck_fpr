import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://euwhpolzjpfuqncfjczc.supabase.co",
  process.env.SUPABASE_KEY ?? "" // Ensure to replace with your actual Supabase project URL and key
);

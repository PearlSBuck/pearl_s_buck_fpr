import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://euwhpolzjpfuqncfjczc.supabase.co",
  import.meta.env.VITE_SUPABASE_KEY ?? "" // Ensure to replace with your actual Supabase project URL and key
);

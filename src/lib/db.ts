import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_ANON_KEY ?? "",
  import.meta.env.VITE_SUPABASE_KEY ?? "" // Ensure to replace with your actual Supabase project URL and key
);

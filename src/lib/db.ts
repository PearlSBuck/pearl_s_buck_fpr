import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.SUAPABASE_ANON_KEY ?? "",
  process.env.SUPABASE_KEY ?? "" // Ensure to replace with your actual Supabase project URL and key
);

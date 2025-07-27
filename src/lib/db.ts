import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
const supabaseServiceRoleKey = import.meta.env
  .VITE_SUPABASE_SERVICE_ROLE_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {

  throw new Error("Missing Supabase environment variables");

}
// Prevent multiple client instances in dev (HMR-safe)
const globalAny = globalThis as any;

export const supabase =
  globalAny.supabase ?? createClient(supabaseUrl, supabaseAnonKey);

export const supabaseAdmin =
  globalAny.supabaseAdmin ?? createClient(supabaseUrl, supabaseServiceRoleKey);

if (import.meta.env.DEV) {
  globalAny.supabase = supabase;
  globalAny.supabaseAdmin = supabaseAdmin;
}
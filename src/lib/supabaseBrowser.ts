// src/lib/supabaseBrowser.ts

// This file sets up the Supabase client for browser use to handle login, logout, and session management.
import { createBrowserClient } from '@supabase/ssr';
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

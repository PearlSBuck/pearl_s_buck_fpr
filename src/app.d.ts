declare global {
  namespace App {
    interface Locals {
      supabase: ReturnType<typeof import('@supabase/ssr').createServerClient>;
      safeGetSession: () => Promise<{
        session: import('@supabase/supabase-js').Session | null;
        user: import('@supabase/supabase-js').User | null;
      }>;
      session: import('@supabase/supabase-js').Session | null;
      user: import('@supabase/supabase-js').User | null;
    }
  }
}
export {};

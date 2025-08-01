import { createClient } from "@supabase/supabase-js";
import { redirect, type RequestEvent } from "@sveltejs/kit";

// Function to create a Supabase client for server-side use
export function createSupabaseServerClient(event: RequestEvent) {
  const accessToken = event.cookies.get("sb-access-token");

  return createClient(
    import.meta.env.VITE_SUPABASE_URL!,
    import.meta.env.VITE_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: accessToken ? `Bearer ${accessToken}` : "",
        },
      },
    }
  );
}
// Function to require a user to be authenticated
export async function requireUser(event: RequestEvent) {
  const supabase = createSupabaseServerClient(event);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw redirect(303, "/login");

  return user;
}

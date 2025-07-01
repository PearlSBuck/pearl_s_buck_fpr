import { createClient } from "@supabase/supabase-js";
import { redirect, type RequestEvent } from "@sveltejs/kit";

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

export async function requireUser(event: RequestEvent) {
  const supabase = createSupabaseServerClient(event);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw redirect(303, "/login");

  return user;
}

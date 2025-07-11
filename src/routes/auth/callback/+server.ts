import { supabaseAdmin } from '$lib/db';

export async function POST({ request }) {
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');

  const { data, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !data) {
    return new Response('Unauthorized', { status: 401 });
  }

  return new Response(JSON.stringify({ user: data.user }));
}
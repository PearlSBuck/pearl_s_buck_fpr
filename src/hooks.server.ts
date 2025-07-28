import { supabaseAdmin } from '$lib/db';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  const authHeader = event.request.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (token) {
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (data?.user && !error) {
      event.locals.user = data.user; // pass user to load functions
    }
  }

  const protectedRoutes = ['/admin', '/fis', '/fpr'];

  if (protectedRoutes.some((route) => event.url.pathname.startsWith(route))) {
    if (!event.locals.user) {
      // If not authenticated, redirect to /login
      return new Response(null, {
        status: 303,
        headers: { location: '/login' }
      });
    }
  }

  return resolve(event);
};

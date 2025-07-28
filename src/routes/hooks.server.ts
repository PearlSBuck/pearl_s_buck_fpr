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

  if (event.url.pathname.startsWith('/admin')) {
      const role = event.locals.user.app_metadata?.role || event.locals.user.user_metadata?.role;

      if (role !== 'Admin') {
        return new Response(null, {
          status: 303,
          headers: { location: '/home' } // or redirect somewhere else
        });
      }
    }

  return resolve(event);
};

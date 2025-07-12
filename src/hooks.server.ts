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

  return resolve(event);
};

import { supabase, supabaseAdmin } from '$lib/db';
import { redirect, type Handle } from '@sveltejs/kit';
async function getCurrentUser() {
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error) {
    console.error('Error fetching user:', error);
    return null;
  }

  return user?.id; // <-- This is the user's UUID
}

async function isAdmin() {
  const { data } = await supabaseAdmin
    .from('users')
    .select('role')
    .eq('id', await getCurrentUser())
    .single();

  return data?.role === 'Admin';
}

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


    if (event.url.pathname.startsWith('/admin')) {
      const isUserAdmin = await isAdmin();
      console.log(isUserAdmin);
      if (!isUserAdmin) {
        throw redirect(308, '/home');

      }
    }



    else if (!event.locals.user) {
      // If not authenticated, redirect to /login
      throw redirect(308, '/login');
    }
  }


  return resolve(event);
};


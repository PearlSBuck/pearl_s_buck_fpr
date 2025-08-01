import { sequence } from '@sveltejs/kit/hooks';
import { createServerClient } from '@supabase/ssr';
import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
// Function to create a Supabase client for session management and role checking
const supabaseHandle: Handle = async ({ event, resolve }) => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  event.locals.supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get: (key) => event.cookies.get(key),
      set: (key, value, options) => {
        event.cookies.set(key, value, { ...options, path: '/' });
      },
      remove: (key, options) => {
        event.cookies.delete(key, { ...options, path: '/' });
      }
    }
  });

  // Optional helper
  event.locals.safeGetSession = async () => {
    const { data: { session } } = await event.locals.supabase.auth.getSession();
    if (!session) return { session: null, user: null };
    const { data: { user } } = await event.locals.supabase.auth.getUser();
    return { session, user };
  };

  return resolve(event);
};

const authGuard: Handle = async ({ event, resolve }) => {
  const { session, user } = await event.locals.safeGetSession();
  event.locals.session = session;
  event.locals.user = user;
  
  if (!user && (event.url.pathname.startsWith('/fis') || event.url.pathname.startsWith('/fpr') || event.url.pathname.startsWith('/admin') || event.url.pathname.startsWith('/home'))) {
    throw redirect(303, '/login');
  }
  
  
  // Check admin routes
  if (event.url.pathname.startsWith('/admin')) {
    if (!user) throw redirect(303, '/home');
    
    const { data: profile } = await event.locals.supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();
    
    console.log('User:', user);
    console.log('Query result:', profile);

    if (profile?.role !== 'Admin') {
      throw redirect(303, '/home');
    }
  }


  return resolve(event);
};

export const handle = sequence(supabaseHandle, authGuard);

// // src/routes/(admin)/+layout.server.ts
// import { redirect } from '@sveltejs/kit';
// import { supabase, supabaseAdmin } from '$lib/db';
// import type { LayoutServerLoad } from './$types';

// export const load: LayoutServerLoad = async () => {
//   // Get current user using your existing client
//   const { data: { user }, error } = await supabase.auth.getUser();
  
//   if (error || !user) {
//     console.log("No user found or error retrieving user:", error);
//     throw redirect(303, '/login');
//   }

//   // Check if user is admin
//   const { data: userData } = await supabaseAdmin
//     .from('users')
//     .select('role')
//     .eq('id', user.id)
//     .single();

//   if (userData?.role !== 'Admin') {
//     throw redirect(303, '/home');
//   }

//   return { role: userData.role };
// };
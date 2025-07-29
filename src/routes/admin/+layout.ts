// // import type { LayoutLoad } from './$types';
// // import { redirect } from '@sveltejs/kit';

// // export const load: LayoutLoad = async ({ data }) => {
// //   if (!data.user) {
// //     throw redirect(303, '/home');
// //   }
// //   if (data.user.role !== 'Admin') {
// //     throw redirect(303, '/home');
// //   }
// //   return {};
// // };

// export const ssr = true;
import { getUsersList } from '../userActions';
// This file handles the retrieval of the user list for the admin panel
export const GET = async () => {
  try {
    const usersList = await getUsersList();
    return new Response(JSON.stringify(usersList), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response('Server error', { status: 500 });
  }
};

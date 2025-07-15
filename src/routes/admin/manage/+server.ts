import { getAuditLog } from './auditLog';

export const GET = async () => {
  try {
    const logs = await getAuditLog();
    return new Response(JSON.stringify(logs), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response('Server error', { status: 500 });
  }
};

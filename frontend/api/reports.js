import { getUserFromRequest } from './_lib/supabase.js';

export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'GET') return new Response('Method Not Allowed', { status: 405 });

  const auth = await getUserFromRequest(req);
  if (!auth) return Response.json({ detail: 'Unauthorized' }, { status: 401 });
  const { user, supabase } = auth;

  const { data, error } = await supabase
    .from('reports')
    .select('id, ticker, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) return Response.json({ detail: error.message }, { status: 500 });

  return Response.json(data || []);
}

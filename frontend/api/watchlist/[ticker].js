import { getUserFromRequest } from '../_lib/supabase.js';

export default async function handler(req) {
  if (req.method !== 'DELETE') return new Response('Method Not Allowed', { status: 405 });

  const auth = await getUserFromRequest(req);
  if (!auth) return Response.json({ detail: 'Unauthorized' }, { status: 401 });
  const { user, supabase } = auth;

  const url = new URL(req.url);
  const ticker = url.pathname.split('/').pop();

  await supabase.from('watchlist').delete().eq('user_id', user.id).eq('ticker', ticker.toUpperCase());
  return Response.json({ status: 'removed', ticker: ticker.toUpperCase() });
}

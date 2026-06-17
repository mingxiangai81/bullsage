import { getUserFromRequest } from '../_lib/supabase.js';

export const config = { runtime: 'edge' };

export default async function handler(req) {
  const auth = await getUserFromRequest(req);
  if (!auth) return Response.json({ detail: 'Unauthorized' }, { status: 401 });
  const { user, supabase } = auth;

  if (req.method === 'GET') {
    const { data } = await supabase.from('watchlist').select('*').eq('user_id', user.id).order('added_at', { ascending: false });
    return Response.json(data || []);
  }

  if (req.method === 'POST') {
    const { ticker } = await req.json();
    if (!ticker) return Response.json({ detail: 'Ticker required' }, { status: 400 });

    // Check free limit
    const { data: existing } = await supabase.from('watchlist').select('id').eq('user_id', user.id);
    const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user.id).single();
    if ((existing?.length || 0) >= 10 && profile?.plan === 'trial') {
      return Response.json({ detail: 'Free plan limited to 10 watchlist items. Upgrade to Pro.' }, { status: 403 });
    }

    const { error } = await supabase.from('watchlist').insert({ user_id: user.id, ticker: ticker.toUpperCase() });
    if (error) return Response.json({ detail: 'Already in watchlist' }, { status: 409 });
    return Response.json({ status: 'added', ticker: ticker.toUpperCase() });
  }

  return new Response('Method Not Allowed', { status: 405 });
}

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hlraxyshjnmtqioonejh.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmF4eXNoam5tdHFpb29uZWpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyOTIxMjUsImV4cCI6MjA5NTg2ODEyNX0.wJNtmypQ8ABb68oOaUbVJsNibHy7sC-KrDaN5p5KaKg';

async function getUser(req) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) return null;
  const supabase = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: { user } } = await supabase.auth.getUser(token);
  return user ? { user, supabase } : null;
}

export default async function handler(req) {
  const auth = await getUser(req);
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

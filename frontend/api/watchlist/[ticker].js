import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hlraxyshjnmtqioonejh.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmF4eXNoam5tdHFpb29uZWpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyOTIxMjUsImV4cCI6MjA5NTg2ODEyNX0.wJNtmypQ8ABb68oOaUbVJsNibHy7sC-KrDaN5p5KaKg';

export default async function handler(req) {
  if (req.method !== 'DELETE') return new Response('Method Not Allowed', { status: 405 });

  const token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) return Response.json({ detail: 'Unauthorized' }, { status: 401 });

  const url = new URL(req.url);
  const ticker = url.pathname.split('/').pop();

  const supabase = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) return Response.json({ detail: 'Unauthorized' }, { status: 401 });

  await supabase.from('watchlist').delete().eq('user_id', user.id).eq('ticker', ticker.toUpperCase());
  return Response.json({ status: 'removed', ticker: ticker.toUpperCase() });
}

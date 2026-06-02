import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hlraxyshjnmtqioonejh.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmF4eXNoam5tdHFpb29uZWpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyOTIxMjUsImV4cCI6MjA5NTg2ODEyNX0.wJNtmypQ8ABb68oOaUbVJsNibHy7sC-KrDaN5p5KaKg';

export default async function handler(req) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) return Response.json({ detail: 'Missing token' }, { status: 401 });

  try {
    const supabase = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return Response.json({ detail: 'Invalid token' }, { status: 401 });

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return Response.json({ id: user.id, email: user.email, ...profile });
  } catch (err) {
    return Response.json({ detail: err.message }, { status: 500 });
  }
}

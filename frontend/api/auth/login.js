import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hlraxyshjnmtqioonejh.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmF4eXNoam5tdHFpb29uZWpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyOTIxMjUsImV4cCI6MjA5NTg2ODEyNX0.wJNtmypQ8ABb68oOaUbVJsNibHy7sC-KrDaN5p5KaKg';

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return Response.json({ detail: 'Email and password are required' }, { status: 400 });
    }

    const supabase = createClient(SUPABASE_URL, ANON_KEY);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      const detail = error.message.includes('Invalid login credentials')
        ? 'Invalid email or password.'
        : error.message.includes('Email not confirmed')
          ? 'Please confirm your email first. Check your inbox.'
          : error.message;
      return Response.json({ detail }, { status: 401 });
    }

    return Response.json({
      access_token: data.session.access_token,
      user_id: data.user.id,
      email: data.user.email,
    });
  } catch (err) {
    return Response.json({ detail: err.message || 'Internal server error' }, { status: 500 });
  }
}

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hlraxyshjnmtqioonejh.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmF4eXNoam5tdHFpb29uZWpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyOTIxMjUsImV4cCI6MjA5NTg2ODEyNX0.wJNtmypQ8ABb68oOaUbVJsNibHy7sC-KrDaN5p5KaKg';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const { email, password, full_name, country, date_of_birth } = await req.json();

    if (!email || !password || !full_name || !country || !date_of_birth) {
      return Response.json({ detail: 'All fields are required' }, { status: 400 });
    }

    const supabaseKey = SERVICE_KEY || ANON_KEY;
    const supabase = createClient(SUPABASE_URL, supabaseKey);

    let userId, userEmail;

    if (SERVICE_KEY) {
      // Admin mode — auto-confirms email immediately
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name,
          display_name: full_name.split(' ')[0],
          country,
          date_of_birth,
        },
      });
      if (error) {
        const detail = error.message.includes('already been registered') || error.message.includes('already exists')
          ? 'Email already registered. Please log in.'
          : error.message;
        return Response.json({ detail }, { status: 400 });
      }
      userId = data.user.id;
      userEmail = data.user.email;
    } else {
      // Standard signUp (email confirmation may be required)
      const anonClient = createClient(SUPABASE_URL, ANON_KEY);
      const { data, error } = await anonClient.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name,
            display_name: full_name.split(' ')[0],
            country,
            date_of_birth,
          },
        },
      });
      if (error) {
        const detail = error.message.includes('already registered') || error.message.includes('User already registered')
          ? 'Email already registered. Please log in.'
          : error.message;
        return Response.json({ detail }, { status: 400 });
      }
      // If session exists immediately (auto-confirm on), return token
      if (data.session) {
        return Response.json({
          access_token: data.session.access_token,
          user_id: data.user.id,
          email: data.user.email,
        });
      }
      // Email confirmation required
      return Response.json({
        email_confirmation_required: true,
        email: data.user?.email,
        detail: 'CHECK_EMAIL',
      }, { status: 202 });
    }

    // Sign in to get session (used when admin created user)
    const anonClient = createClient(SUPABASE_URL, ANON_KEY);
    const { data: signIn, error: signInError } = await anonClient.auth.signInWithPassword({ email, password });
    if (signInError) {
      return Response.json({ detail: signInError.message }, { status: 401 });
    }

    return Response.json({
      access_token: signIn.session.access_token,
      user_id: signIn.user.id,
      email: signIn.user.email,
    });
  } catch (err) {
    return Response.json({ detail: err.message || 'Internal server error' }, { status: 500 });
  }
}

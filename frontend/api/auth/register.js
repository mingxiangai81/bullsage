import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, ANON_KEY } from '../_lib/supabase.js';

export const config = { runtime: 'edge' };

// SUPABASE_SERVICE_KEY must be set in Vercel env vars for auto-confirm
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

    // ── Path A: Admin key available → create user with auto-confirm ──────────
    if (SERVICE_KEY) {
      const admin = createClient(SUPABASE_URL, SERVICE_KEY);
      const { data: created, error: createErr } = await admin.auth.admin.createUser({
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

      if (createErr) {
        const detail = (createErr.message || '').includes('already')
          ? 'Email already registered. Please log in.'
          : createErr.message;
        return Response.json({ detail }, { status: 400 });
      }

      // Sign in to get session
      const client = createClient(SUPABASE_URL, ANON_KEY);
      const { data: session, error: signErr } = await client.auth.signInWithPassword({ email, password });
      if (signErr) return Response.json({ detail: signErr.message }, { status: 401 });

      return Response.json({
        access_token: session.session.access_token,
        user_id: session.user.id,
        email: session.user.email,
      });
    }

    // ── Path B: No admin key → standard signUp (email confirm required) ──────
    const client = createClient(SUPABASE_URL, ANON_KEY);
    const { data, error } = await client.auth.signUp({
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
      const detail = (error.message || '').toLowerCase().includes('already')
        ? 'Email already registered. Please log in.'
        : error.message;
      return Response.json({ detail }, { status: 400 });
    }

    // If session returned immediately (email confirm off in Supabase dashboard)
    if (data?.session) {
      return Response.json({
        access_token: data.session.access_token,
        user_id: data.user.id,
        email: data.user.email,
      });
    }

    // Email confirmation required — return 202 so frontend shows proper screen
    return Response.json({
      email_confirmation_required: true,
      email: data?.user?.email || email,
    }, { status: 202 });

  } catch (err) {
    return Response.json({ detail: err.message || 'Internal server error' }, { status: 500 });
  }
}

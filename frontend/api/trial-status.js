import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hlraxyshjnmtqioonejh.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmF4eXNoam5tdHFpb29uZWpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyOTIxMjUsImV4cCI6MjA5NTg2ODEyNX0.wJNtmypQ8ABb68oOaUbVJsNibHy7sC-KrDaN5p5KaKg';

export default async function handler(req) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) return Response.json({ authenticated: false });

  try {
    const supabase = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) return Response.json({ authenticated: false });

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

    const isTrial = profile?.is_trial ?? false;
    const used = profile?.trial_reports_used ?? 0;
    const LIMIT = 3;
    let daysLeft = null;

    if (isTrial && profile?.trial_expires_at) {
      const diff = new Date(profile.trial_expires_at) - new Date();
      daysLeft = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }

    return Response.json({
      authenticated: true,
      plan: profile?.plan || 'trial',
      is_trial: isTrial,
      trial_queries_used: used,
      trial_queries_remaining: Math.max(0, LIMIT - used),
      trial_days_left: daysLeft,
      trial_expires_at: profile?.trial_expires_at || null,
    });
  } catch (err) {
    return Response.json({ authenticated: false });
  }
}

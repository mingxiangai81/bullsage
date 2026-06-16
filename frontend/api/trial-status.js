import { getUserFromRequest } from './_lib/supabase.js';

export default async function handler(req) {
  const auth = await getUserFromRequest(req);
  if (!auth) return Response.json({ authenticated: false });
  const { user, supabase } = auth;

  try {
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
  } catch {
    return Response.json({ authenticated: false });
  }
}

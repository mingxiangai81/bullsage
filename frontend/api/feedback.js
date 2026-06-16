import { createSupabaseClient, getUserFromRequest } from './_lib/supabase.js';

export default async function handler(req) {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  try {
    const { rating, category, message, email, language } = await req.json();

    if (!rating || !message || !String(message).trim()) {
      return Response.json({ detail: 'Rating and message are required' }, { status: 400 });
    }

    // Feedback is accepted both from logged-in and anonymous visitors.
    const auth = await getUserFromRequest(req);
    const supabase = auth ? auth.supabase : createSupabaseClient();

    const { error } = await supabase.from('feedback').insert({
      user_id: auth?.user?.id ?? null,
      rating,
      category: category || null,
      message: String(message).trim(),
      email: email || null,
      language: language || 'zh',
    });

    if (error) return Response.json({ detail: error.message }, { status: 500 });

    return Response.json({ status: 'ok' });
  } catch (err) {
    return Response.json({ detail: err.message || 'Internal server error' }, { status: 500 });
  }
}

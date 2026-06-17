import { getUserFromRequest } from '../_lib/supabase.js';

export const config = { runtime: 'edge' };

export default async function handler(req) {
  const auth = await getUserFromRequest(req);
  if (!auth) return Response.json({ detail: 'Missing or invalid token' }, { status: 401 });
  const { user, supabase } = auth;

  try {
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

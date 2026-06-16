import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 'https://hlraxyshjnmtqioonejh.supabase.co';
export const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmF4eXNoam5tdHFpb29uZWpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyOTIxMjUsImV4cCI6MjA5NTg2ODEyNX0.wJNtmypQ8ABb68oOaUbVJsNibHy7sC-KrDaN5p5KaKg';

// Plain anon client, no user session attached.
export function createSupabaseClient() {
  return createClient(SUPABASE_URL, ANON_KEY);
}

// Client scoped to the requesting user's access token (respects RLS as that user).
export function createUserSupabaseClient(token) {
  return createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
}

// Resolves the authenticated user (if any) from the request's Bearer token.
// Returns null when no/invalid token is present.
export async function getUserFromRequest(req) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) return null;

  const supabase = createUserSupabaseClient(token);
  const { data: { user } } = await supabase.auth.getUser(token);
  return user ? { user, supabase, token } : null;
}

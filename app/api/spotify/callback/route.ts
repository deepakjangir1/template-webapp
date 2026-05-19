import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const oauthError = url.searchParams.get('error');
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

  console.log('[spotify/callback] start', { hasCode: !!code, state, oauthError });

  if (oauthError) return NextResponse.redirect(new URL(`/profile?spotify=denied`, appUrl));
  if (!code || !state) return NextResponse.redirect(new URL(`/profile?spotify=missing_params`, appUrl));

  // 1. Verify logged-in user
  let user;
  try {
    const supabase = await createClient();
    const result = await supabase.auth.getUser();
    user = result.data.user;
    console.log('[spotify/callback] supabase user', user?.id);
  } catch (e) {
    console.error('[spotify/callback] supabase error', e);
    return NextResponse.redirect(new URL(`/profile?spotify=auth_error`, appUrl));
  }
  if (!user || user.id !== state) {
    console.log('[spotify/callback] user/state mismatch');
    return NextResponse.redirect(new URL('/auth/login', appUrl));
  }

  // 2. Read PKCE verifier
  const cookieStore = await cookies();
  const verifier = cookieStore.get('spotify_pkce')?.value;
  console.log('[spotify/callback] verifier present?', !!verifier, 'len:', verifier?.length);
  if (!verifier) return NextResponse.redirect(new URL(`/profile?spotify=no_verifier`, appUrl));

  // 3. Exchange code for tokens
  let tokens;
  try {
    const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: `${appUrl}/api/spotify/callback`,
        client_id: process.env.SPOTIFY_CLIENT_ID!,
        code_verifier: verifier,
      }),
    });
    const text = await tokenRes.text();
    if (!tokenRes.ok) {
      console.error('[spotify/callback] token exchange failed', tokenRes.status, text);
      return NextResponse.redirect(new URL(`/profile?spotify=token_error`, appUrl));
    }
    tokens = JSON.parse(text);
    console.log('[spotify/callback] tokens received, expires_in:', tokens.expires_in);
  } catch (e) {
    console.error('[spotify/callback] token fetch threw', e);
    return NextResponse.redirect(new URL(`/profile?spotify=fetch_error`, appUrl));
  }

  // 4. Get Spotify profile
  let profile;
  try {
    const profileRes = await fetch('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const text = await profileRes.text();
    if (!profileRes.ok) {
      console.error('[spotify/callback] /me failed', profileRes.status, text);
      return NextResponse.redirect(new URL(`/profile?spotify=me_error`, appUrl));
    }
    profile = JSON.parse(text);
    console.log('[spotify/callback] profile', profile.id, profile.display_name);
  } catch (e) {
    console.error('[spotify/callback] /me threw', e);
    return NextResponse.redirect(new URL(`/profile?spotify=me_fetch_error`, appUrl));
  }

  // 5. Save to DB
  try {
    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );
    const { error: dbError } = await admin.from('spotify_connections').upsert({
      user_id: user.id,
      spotify_user_id: profile.id,
      display_name: profile.display_name ?? profile.id,
      refresh_token: tokens.refresh_token,
      access_token: tokens.access_token,
      expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    });
    if (dbError) {
      console.error('[spotify/callback] db upsert error', dbError);
      return NextResponse.redirect(new URL(`/profile?spotify=db_error`, appUrl));
    }
    console.log('[spotify/callback] saved connection for', user.id);
  } catch (e) {
    console.error('[spotify/callback] db threw', e);
    return NextResponse.redirect(new URL(`/profile?spotify=db_exception`, appUrl));
  }

  const res = NextResponse.redirect(new URL(`/profile?spotify=connected`, appUrl));
  res.cookies.delete('spotify_pkce');
  return res;
}
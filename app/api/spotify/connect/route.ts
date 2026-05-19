import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';

// PKCE helper: base64url-encode a buffer (no padding, URL-safe)
const b64url = (b: Buffer) =>
  b.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

export async function GET() {
  // Make sure the user is signed into our app first
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL('/auth/login', process.env.NEXT_PUBLIC_APP_URL!));
  }

  // PKCE: generate a random verifier and its SHA-256 hash (challenge)
  const verifier = b64url(crypto.randomBytes(32));
  const challenge = b64url(crypto.createHash('sha256').update(verifier).digest());

  // Build the Spotify authorize URL
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.SPOTIFY_CLIENT_ID!,
    scope: 'user-top-read user-read-recently-played user-read-private',
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/spotify/callback`,
    code_challenge_method: 'S256',
    code_challenge: challenge,
    state: user.id, // we'll verify this on the way back
  });

  const res = NextResponse.redirect(
    `https://accounts.spotify.com/authorize?${params.toString()}`
  );

  // Save the verifier in a short-lived HTTP-only cookie. The callback reads it back.
  res.cookies.set('spotify_pkce', verifier, {
    httpOnly: true,
    secure: false, // we're on http://127.0.0.1 in dev; set true in production
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  });

  return res;
}
import { NextRequest, NextResponse } from 'next/server';
import { checkTeamKey, authToken, hostToken, cookieOpts, COOKIE, HOST_COOKIE } from '@/lib/auth';

// The team link: a right key signs in with host access and lands on the team page; a wrong one goes to the ordinary
// sign-in with nothing to say why. The key never reaches the next page (no referrer, no cache).
export const dynamic = 'force-dynamic';
export async function GET(req: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  const ok = await checkTeamKey((await params).key);
  const res = NextResponse.redirect(new URL(ok ? '/team' : '/login', req.url));
  res.headers.set('Cache-Control', 'no-store');
  res.headers.set('Referrer-Policy', 'no-referrer');
  if (!ok) return res;
  res.cookies.set(COOKIE, await authToken(), cookieOpts());
  res.cookies.set(HOST_COOKIE, await hostToken(), cookieOpts());
  return res;
}

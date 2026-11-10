import { NextRequest, NextResponse } from 'next/server';
import { clientToken, cookieOpts, CLIENT_COOKIE } from '@/lib/auth';

// The Church & Dwight link: the right token sets the Church & Dwight pass and lands on /cd; a wrong one lands there too,
// which then says the link doesn't work. The token never reaches the next page (no referrer, no cache).
export const dynamic = 'force-dynamic';
export async function GET(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const ok = (await params).token === (await clientToken());
  const res = NextResponse.redirect(new URL('/cd', req.url));
  res.headers.set('Cache-Control', 'no-store');
  res.headers.set('Referrer-Policy', 'no-referrer');
  if (ok) res.cookies.set(CLIENT_COOKIE, await clientToken(), { ...cookieOpts(), maxAge: 60 * 60 * 24 * 120 });
  return res;
}

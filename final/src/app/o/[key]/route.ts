import { NextRequest, NextResponse } from 'next/server';
import { checkOwnerKey, ownerToken, cookieOpts, OWNER_COOKIE } from '@/lib/auth';

// The owner link: the right key signs this browser in to the pre-brief answers with names (/answers) and nothing else; a
// wrong one goes to the ordinary sign-in with nothing to say why. The key never reaches the next page.
export const dynamic = 'force-dynamic';
export async function GET(req: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  let key = (await params).key;
  try { key = decodeURIComponent(key); } catch {}
  const ok = await checkOwnerKey(key);
  const res = NextResponse.redirect(new URL(ok ? '/answers' : '/login', req.url));
  res.headers.set('Cache-Control', 'no-store');
  res.headers.set('Referrer-Policy', 'no-referrer');
  if (ok) res.cookies.set(OWNER_COOKIE, await ownerToken(), cookieOpts());
  return res;
}

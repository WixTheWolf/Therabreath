import { NextRequest, NextResponse } from 'next/server';
import { isAuthed, COOKIE } from '@/lib/auth';

// Stage, Console and the Playbook need the password. Phones join through signed links instead.
export async function proxy(req: NextRequest) {
  if (await isAuthed(req.cookies.get(COOKIE)?.value)) return NextResponse.next();
  const url = req.nextUrl.clone();
  url.pathname = '/login';
  url.searchParams.set('next', req.nextUrl.pathname + req.nextUrl.search);
  return NextResponse.redirect(url);
}
export const config = { matcher: ['/', '/stage/:path*', '/console/:path*', '/playbook/:path*', '/sessions/:path*'] };

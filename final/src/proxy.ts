import { NextRequest, NextResponse } from 'next/server';
import { isAuthed, isHost, joinToken, COOKIE, HOST_COOKIE } from '@/lib/auth';

// Host tools, Console and the session list need the host password on top of the room password.
const HOST_ONLY = (p: string) => p === '/host' || p.startsWith('/console/') || p.startsWith('/sessions');

// Stage, Console and the Playbook need the password. Phones join through signed links instead.
export async function proxy(req: NextRequest) {
  const authed = await isAuthed(req.cookies.get(COOKIE)?.value);
  if (authed && HOST_ONLY(req.nextUrl.pathname) && !(await isHost(req.cookies.get(HOST_COOKIE)?.value))) {
    const url = req.nextUrl.clone(); url.pathname = '/login'; url.search = ''; url.searchParams.set('host', '1'); url.searchParams.set('next', req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(url);
  }
  if (authed) return NextResponse.next();
  // The opening film also plays on the pre-brief, which carries a signed link instead of the password.
  const { pathname, searchParams } = req.nextUrl, c = searchParams.get('c'), k = searchParams.get('k');
  const film = pathname.startsWith('/media/opening.') || pathname === '/media/film-poster.jpg';
  if (film && c && k && k === (await joinToken(c))) return NextResponse.next();
  if (pathname.startsWith('/media/')) return new NextResponse(null, { status: 403 });
  const url = req.nextUrl.clone();
  url.pathname = '/login';
  if (HOST_ONLY(pathname)) url.searchParams.set('host', '1');
  url.searchParams.set('next', req.nextUrl.pathname + req.nextUrl.search);
  return NextResponse.redirect(url);
}
// THE FLAVOR RACE premieres in the room, so it sits behind the password. The opening film quotes Ross's invitation,
// so it does too, and the pre-brief reaches it with its signed link.
export const config = { matcher: ['/', '/host', '/scorecard', '/stage/:path*', '/console/:path*', '/playbook/:path*', '/sessions/:path*', '/media/flavor-race.mp4', '/media/flavor-race-poster.jpg', '/media/opening.mp4', '/media/opening.webm', '/media/film-poster.jpg'] };

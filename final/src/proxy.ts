import { NextRequest, NextResponse } from 'next/server';
import { isAuthed, joinToken, COOKIE } from '@/lib/auth';

// Stage, Console and the Playbook need the password. Phones join through signed links instead.
export async function proxy(req: NextRequest) {
  if (await isAuthed(req.cookies.get(COOKIE)?.value)) return NextResponse.next();
  // The opening film also plays on the pre-brief, which carries a signed link instead of the password.
  const { pathname, searchParams } = req.nextUrl, c = searchParams.get('c'), k = searchParams.get('k');
  const film = pathname.startsWith('/media/opening.') || pathname === '/media/film-poster.jpg';
  if (film && c && k && k === (await joinToken(c))) return NextResponse.next();
  if (pathname.startsWith('/media/')) return new NextResponse(null, { status: 403 });
  const url = req.nextUrl.clone();
  url.pathname = '/login';
  url.searchParams.set('next', req.nextUrl.pathname + req.nextUrl.search);
  return NextResponse.redirect(url);
}
// THE FLAVOR RACE premieres in the room, so it sits behind the password. The opening film quotes Ross's invitation,
// so it does too, and the pre-brief reaches it with its signed link.
export const config = { matcher: ['/', '/host', '/stage/:path*', '/console/:path*', '/playbook/:path*', '/sessions/:path*', '/media/flavor-race.mp4', '/media/flavor-race-poster.jpg', '/media/opening.mp4', '/media/opening.webm', '/media/film-poster.jpg'] };

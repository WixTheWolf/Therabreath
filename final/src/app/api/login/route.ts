import { NextRequest, NextResponse } from 'next/server';
import { checkPassword, checkHostPassword, authToken, hostToken, COOKIE, HOST_COOKIE } from '@/lib/auth';
// The room password opens the room. The host password opens the room and the host surfaces; it never doubles as the room password.
export async function POST(req: NextRequest) {
  const { password, host } = await req.json().catch(() => ({ password: '', host: false }));
  const p = String(password || '');
  const opts = { httpOnly: true, sameSite: 'lax' as const, secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 24 * 30 };
  if (host) {
    if (!(await checkHostPassword(p))) return NextResponse.json({ ok: false }, { status: 401 });
    const res = NextResponse.json({ ok: true, host: true });
    res.cookies.set(COOKIE, await authToken(), opts);
    res.cookies.set(HOST_COOKIE, await hostToken(), opts);
    return res;
  }
  if (!(await checkPassword(p))) return NextResponse.json({ ok: false }, { status: 401 });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, await authToken(), opts);
  return res;
}

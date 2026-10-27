import { NextRequest, NextResponse } from 'next/server';
import { checkPassword, checkHostPassword, authToken, hostToken, cookieOpts, COOKIE, HOST_COOKIE } from '@/lib/auth';
// One box for both passwords. The host password opens the room and the host surfaces wherever it is typed; the room
// password opens the room only, and is refused where a host page asked for the host password.
export async function POST(req: NextRequest) {
  const { password, host } = await req.json().catch(() => ({ password: '', host: false }));
  const p = String(password || '');
  const opts = cookieOpts();
  if (await checkHostPassword(p)) {
    const res = NextResponse.json({ ok: true, host: true });
    res.cookies.set(COOKIE, await authToken(), opts);
    res.cookies.set(HOST_COOKIE, await hostToken(), opts);
    return res;
  }
  if (host || !(await checkPassword(p))) return NextResponse.json({ ok: false }, { status: 401 });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, await authToken(), opts);
  return res;
}

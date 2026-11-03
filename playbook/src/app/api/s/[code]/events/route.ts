import { NextRequest, NextResponse } from 'next/server';
import { list, append, storeKind } from '@/lib/server/store';
import { nudge } from '@/lib/server/broadcast';
import { isAuthed, joinToken, COOKIE } from '@/lib/auth';

export const dynamic = 'force-dynamic';
const PUBLIC_KINDS = new Set(['join', 'team', 'pick', 'rate', 'guess', 'concept', 'suggest', 'react', 'survey', 'dial', 'benchbase']);
const clean = (c: string) => c.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12);

export async function GET(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const code = clean((await params).code);
  const authed = await isAuthed(req.cookies.get(COOKIE)?.value);
  const k = req.nextUrl.searchParams.get('k');
  if (!authed && k !== (await joinToken(code))) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const after = Number(req.nextUrl.searchParams.get('after') || 0);
  const events = await list(code, after);
  return NextResponse.json({ events, store: storeKind(), topic: 'pb-' + (await joinToken(code)), realtime: !!process.env.NEXT_PUBLIC_SUPABASE_URL }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const code = clean((await params).code);
  const body = await req.json().catch(() => ({}));
  const evs = Array.isArray(body.events) ? body.events.slice(0, 500) : [];
  const authed = await isAuthed(req.cookies.get(COOKIE)?.value);
  const tokenOk = body.k === (await joinToken(code));
  for (const e of evs) {
    if (!e || typeof e.id !== 'string' || typeof e.kind !== 'string') return NextResponse.json({ error: 'bad event' }, { status: 400 });
    if (!authed && !(tokenOk && PUBLIC_KINDS.has(e.kind))) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    e.t = authed && e.t ? e.t : Date.now();
    if (JSON.stringify(e.data || {}).length > 8000) return NextResponse.json({ error: 'too large' }, { status: 413 });
  }
  const last = await append(code, evs);
  nudge('pb-' + (await joinToken(code)), last);
  return NextResponse.json({ ok: true, n: evs.length });
}

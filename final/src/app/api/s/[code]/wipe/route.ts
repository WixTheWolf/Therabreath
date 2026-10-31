import { NextRequest, NextResponse } from 'next/server';
import { list, append, wipe } from '@/lib/server/store';
import { nudge } from '@/lib/server/broadcast';
import { isHost, joinToken, HOST_COOKIE } from '@/lib/auth';
import type { Ev } from '@/lib/state';
export const dynamic = 'force-dynamic';

// A wipe clears the morning (joins, votes, scores, the board) but keeps everyone's pre-brief answers: they arrive days
// before and open the morning, so they're copied back in right after the wipe, the latest answer from each person.
export async function POST(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  if (!(await isHost(req.cookies.get(HOST_COOKIE)?.value))) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const code = (await params).code.toUpperCase();
  const all = await list(code);
  const since = all.slice(all.map((e) => e.kind).lastIndexOf('wipe') + 1);
  const latest = new Map<string, Ev>();
  for (const e of since) if (e.kind === 'survey' && e.pid) latest.set(e.pid, e);
  await wipe(code);
  const now = Date.now();
  const kept: Ev[] = [...latest.values()].map((e, i) => ({ id: `${e.id}~kept${now}${i}`, t: e.t, kind: 'survey', pid: e.pid, data: e.data }));
  const last = await append(code, kept);
  if (last) nudge('pb-' + (await joinToken(code)), last);
  return NextResponse.json({ ok: true, kept: kept.length });
}

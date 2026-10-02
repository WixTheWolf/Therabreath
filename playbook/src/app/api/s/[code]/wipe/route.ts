import { NextRequest, NextResponse } from 'next/server';
import { wipe } from '@/lib/server/store';
import { isAuthed, COOKIE } from '@/lib/auth';
export const dynamic = 'force-dynamic';
export async function POST(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  if (!(await isAuthed(req.cookies.get(COOKIE)?.value))) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  await wipe((await params).code.toUpperCase());
  return NextResponse.json({ ok: true });
}

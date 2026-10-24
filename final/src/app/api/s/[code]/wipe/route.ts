import { NextRequest, NextResponse } from 'next/server';
import { wipe } from '@/lib/server/store';
import { isHost, HOST_COOKIE } from '@/lib/auth';
export const dynamic = 'force-dynamic';
export async function POST(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  if (!(await isHost(req.cookies.get(HOST_COOKIE)?.value))) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  await wipe((await params).code.toUpperCase());
  return NextResponse.json({ ok: true });
}

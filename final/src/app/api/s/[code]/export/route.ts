import { NextRequest, NextResponse } from 'next/server';
import { list } from '@/lib/server/store';
import { isHost, HOST_COOKIE } from '@/lib/auth';
export const dynamic = 'force-dynamic';
export async function GET(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  if (!(await isHost(req.cookies.get(HOST_COOKIE)?.value))) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const code = (await params).code.toUpperCase();
  const rows = await list(code, 0);
  if (req.nextUrl.searchParams.get('format') === 'csv') {
    const q = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const csv = ['seq,time,kind,participant,data', ...rows.map((r) => [r.seq, new Date(r.t).toISOString(), r.kind, r.pid, JSON.stringify(r.data)].map(q).join(','))].join('\n');
    return new NextResponse(csv, { headers: { 'Content-Type': 'text/csv', 'Content-Disposition': `attachment; filename="flavor-playbook-${code}.csv"` } });
  }
  return new NextResponse(JSON.stringify({ code, exported: new Date().toISOString(), events: rows }, null, 2), { headers: { 'Content-Type': 'application/json', 'Content-Disposition': `attachment; filename="flavor-playbook-${code}.json"` } });
}

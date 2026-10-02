import RoomApp from '@/components/RoomApp';
import { joinToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';
const clean = (c: string) => c.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12);

// Phones join through a signed link. A wrong or missing key never reaches the session.
export default async function Join({ params, searchParams }: { params: Promise<{ code: string }>; searchParams: Promise<Record<string, string>> }) {
  const code = clean((await params).code);
  const k = (await searchParams).k || '';
  if (k !== (await joinToken(code))) return <main className="room" data-theme="a"><div className="rm-center"><h1 className="h3">This link has expired.</h1><p className="rm-p">Scan the QR code on the screen to join.</p></div></main>;
  return <RoomApp code={code} k={k} />;
}

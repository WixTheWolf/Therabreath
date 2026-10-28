import ShowApp from '@/components/ShowApp';
import { EVENT } from '@/lib/content';
import { joinToken } from '@/lib/auth';

export const metadata = { title: 'Presentation' };

// The presentation. It drives the live session (FOF1109) so the phones follow along; ?code=REHEARSE (or any other code)
// runs a clean rehearsal session instead. The paper scorecard for the tasting is at /scorecard; the run sheet at
// /host/run.
export const dynamic = 'force-dynamic';
const clean = (c: string) => c.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12);

export default async function Host({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const code = clean((await searchParams).code || '') || EVENT.code;
  return <ShowApp code={code} k={await joinToken(code)} />;
}

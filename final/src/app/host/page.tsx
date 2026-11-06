import ShowApp from '@/components/ShowApp';
import { SEALED, MYSTERY_REVEAL } from '@/lib/sealed';
import { SealedProvider } from '@/lib/sealedClient';
import { EVENT } from '@/lib/content';
import { joinToken } from '@/lib/auth';

// ?results=1 is the printable page of what was decided, so its tab says so.
export async function generateMetadata({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  return { title: 'results' in (await searchParams) ? 'What we decided' : 'Presentation' };
}

// The presentation. It drives the live session (FOF1109) so the phones follow along; ?code=REHEARSE (or any other code)
// runs a clean rehearsal session instead. The paper scorecard for the tasting is at /scorecard; the run sheet at
// /host/run.
export const dynamic = 'force-dynamic';
const clean = (c: string) => c.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12);

export default async function Host({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const code = clean((await searchParams).code || '') || EVENT.code;
  return <SealedProvider value={SEALED}><ShowApp code={code} k={await joinToken(code)} reveal={MYSTERY_REVEAL} /></SealedProvider>;
}

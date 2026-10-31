import WriteupDoc from '@/components/WriteupDoc';
import { EVENT } from '@/lib/content';

export const metadata = { title: 'Playbook write-up' };

// The Flavor Playbook write-up, behind the team link like the rest of /host. It reads the live session (FOF1109) by
// default; ?code=REHEARSE is a practice copy. It gets no sealed names from the server: it shows them only once the
// presentation has revealed them to the room.
export const dynamic = 'force-dynamic';
const clean = (c: string) => c.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12);

export default async function Writeup({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const code = clean((await searchParams).code || '') || EVENT.code;
  return <WriteupDoc code={code} />;
}

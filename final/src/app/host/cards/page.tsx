import PaperCardsPage from '@/components/PaperCards';
import { EVENT } from '@/lib/content';

export const metadata = { title: 'Paper scorecards' };

// After the morning: the paper scorecards, typed in from the cards. Team only, like the rest of /host.
export const dynamic = 'force-dynamic';
const clean = (c: string) => c.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12);

export default async function Cards({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const code = clean((await searchParams).code || '') || EVENT.code;
  return <PaperCardsPage code={code} />;
}

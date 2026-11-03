import PresenterApp from '@/components/PresenterApp';
import { EVENT } from '@/lib/content';

export const metadata = { title: 'Presenter view' };

// The presenter view for the laptop's own screen, opened with P from the presentation. Same team link as /host.
export const dynamic = 'force-dynamic';
const clean = (c: string) => c.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12);

export default async function Presenter({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const code = clean((await searchParams).code || '') || EVENT.code;
  return <PresenterApp code={code} />;
}

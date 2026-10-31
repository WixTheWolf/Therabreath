import ConsoleApp from '@/components/ConsoleApp';
import { SEALED } from '@/lib/sealed';
import { SealedProvider } from '@/lib/sealedClient';
import { joinToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';
const clean = (c: string) => c.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12);

export default async function Console({ params }: { params: Promise<{ code: string }> }) {
  const code = clean((await params).code);
  return <SealedProvider value={SEALED}><ConsoleApp code={code} k={await joinToken(code)} /></SealedProvider>;
}

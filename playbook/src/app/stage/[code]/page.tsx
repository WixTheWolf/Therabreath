import StageApp from '@/components/StageApp';
import { joinToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';
const clean = (c: string) => c.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12);

export default async function Stage({ params, searchParams }: { params: Promise<{ code: string }>; searchParams: Promise<Record<string, string>> }) {
  const code = clean((await params).code);
  const sp = await searchParams;
  return <StageApp code={code} k={await joinToken(code)} withConsole={sp.console === '1'} />;
}

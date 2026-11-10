import FollowupApp from '@/components/FollowupApp';
import { joinToken } from '@/lib/auth';

export const metadata = { title: 'Follow-up' };

export const dynamic = 'force-dynamic';
const clean = (c: string) => c.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12);

// The follow-up link after the morning: the tasting scores and the chips, through the same signed link as the phones.
export default async function Followup({ params, searchParams }: { params: Promise<{ code: string }>; searchParams: Promise<Record<string, string>> }) {
  const code = clean((await params).code);
  const k = (await searchParams).k || '';
  if (k !== (await joinToken(code))) return <main className="room" data-theme="b"><div className="rm-center"><h1 className="h3">This link doesn’t work.</h1><p className="rm-p">Please open the follow-up link exactly as it came in the email.</p></div></main>;
  return <FollowupApp code={code} k={k} />;
}

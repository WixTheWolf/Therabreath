import { cookies } from 'next/headers';
import SiteApp from '@/components/SiteApp';
import { EVENT } from '@/lib/content';
import { isHost, joinToken, HOST_COOKIE } from '@/lib/auth';

// The front door: one short page, behind the password. The presentation lives at /host; with the host cookie the bar
// also opens THE FLAVOR RACE and the presentation.
export default async function Home() {
  const prebrief = `/survey/${EVENT.code}?k=${await joinToken(EVENT.code)}`;
  return <SiteApp host={await isHost((await cookies()).get(HOST_COOKIE)?.value)} prebrief={prebrief} />;
}

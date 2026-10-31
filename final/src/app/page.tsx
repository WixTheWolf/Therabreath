import { cookies } from 'next/headers';
import SiteApp from '@/components/SiteApp';
import { EVENT } from '@/lib/content';
import { joinToken, isHost, HOST_COOKIE } from '@/lib/auth';

// The front door: the scroll that tells the story, behind the password. For the team (signed in with the team link) its
// bar also opens THE FLAVOR RACE, the rehearsal, the run sheet and the team page; Church & Dwight never see that bar.
export default async function Home() {
  const prebrief = `/survey/${EVENT.code}?k=${await joinToken(EVENT.code)}`;
  const team = await isHost((await cookies()).get(HOST_COOKIE)?.value);
  return <SiteApp prebrief={prebrief} team={team} />;
}

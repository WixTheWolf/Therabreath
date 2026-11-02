import { cookies } from 'next/headers';
import SiteApp from '@/components/SiteApp';
import { EVENT } from '@/lib/content';
import { joinToken, isHost, HOST_COOKIE } from '@/lib/auth';

// The front door: the scroll that tells the story, behind the password. For the team (signed in with the team link) its
// bar also opens THE FLAVOR RACE, the rehearsal, the run sheet and the team page; Church & Dwight never see that bar.
// The team's pre-brief buttons open the practice copy (session PREVIEW, as on the team page), so a teammate trying the
// questions never adds an answer to the live session; everyone else gets the live one.
export default async function Home() {
  const team = await isHost((await cookies()).get(HOST_COOKIE)?.value);
  const code = team ? 'PREVIEW' : EVENT.code;
  const prebrief = `/survey/${code}?k=${await joinToken(code)}`;
  return <SiteApp prebrief={prebrief} team={team} />;
}

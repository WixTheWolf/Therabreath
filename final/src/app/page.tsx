import SiteApp from '@/components/SiteApp';
import { EVENT } from '@/lib/content';
import { joinToken } from '@/lib/auth';

// The front door: one short page, behind the password. Its bar opens THE FLAVOR RACE, the presentation (/host), the run
// sheet and the team page.
export default async function Home() {
  const prebrief = `/survey/${EVENT.code}?k=${await joinToken(EVENT.code)}`;
  return <SiteApp prebrief={prebrief} />;
}

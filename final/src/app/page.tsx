import { cookies } from 'next/headers';
import SiteApp from '@/components/SiteApp';
import { isHost, HOST_COOKIE } from '@/lib/auth';

// The front door: the scroll-driven site, behind the password. Facilitator tools live at /host; with the host cookie
// the bar also opens THE FLAVOR RACE and the presentation.
export default async function Home() {
  return <SiteApp host={await isHost((await cookies()).get(HOST_COOKIE)?.value)} />;
}

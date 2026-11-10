import { cookies } from 'next/headers';
import ClientShow from '@/components/ClientShow';
import { EVENT } from '@/lib/content';
import { joinToken, isClient, isHost, CLIENT_COOKIE, HOST_COOKIE } from '@/lib/auth';

export const metadata = { title: 'The presentation' };
export const dynamic = 'force-dynamic';

// The presentation for Church & Dwight, to look through (see ClientShow). Their link, or the team's, opens it.
export default async function ChurchDwightShow() {
  const jar = await cookies();
  const ok = (await isClient(jar.get(CLIENT_COOKIE)?.value)) || (await isHost(jar.get(HOST_COOKIE)?.value));
  if (!ok) return <main className="site tm" data-theme="b"><div className="tm-in"><h1>This link doesn’t work.</h1><p className="tm-lead">Please open the link exactly as it came in the email.</p></div></main>;
  return <ClientShow code={EVENT.code} k={await joinToken(EVENT.code)} />;
}

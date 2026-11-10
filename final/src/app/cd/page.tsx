import { cookies } from 'next/headers';
import { EVENT } from '@/lib/content';
import { joinToken, isClient, isHost, CLIENT_COOKIE, HOST_COOKIE } from '@/lib/auth';

export const metadata = { title: 'The Future of Freshness' };

// Church & Dwight's page after the morning, reached through their link (/c/TOKEN): the presentation to look through,
// the slides as a PDF and the follow-up tasting. The team can open it too, to see what Church & Dwight sees.
export const dynamic = 'force-dynamic';

export default async function ChurchDwight() {
  const jar = await cookies();
  const ok = (await isClient(jar.get(CLIENT_COOKIE)?.value)) || (await isHost(jar.get(HOST_COOKIE)?.value));
  if (!ok) return (
    <main className="site tm" data-theme="b">
      <div className="tm-in"><h1>This link doesn’t work.</h1><p className="tm-lead">Please open the link exactly as it came in the email.</p></div>
    </main>
  );
  const follow = `/f/${EVENT.code}?k=${await joinToken(EVENT.code)}`;
  const items = [
    { href: '/cd/show', t: 'The presentation', d: 'The slides as we showed them in Princeton, with the room’s answers in place. Use the arrow keys or click to move through. Looking through it changes nothing.' },
    { href: '/files/The-Future-of-Freshness-Slides.pdf', t: 'The slides as a PDF', d: 'Every slide at its last build, to save or share inside Church & Dwight.', dl: true },
    { href: follow, t: 'The blind tasting and your five chips', d: 'The phone scoring didn’t open on the day. About two minutes on your phone: score the four samples, then spend five chips on what deserves the next round. Your answers go into the Flavor Playbook.' },
  ];
  return (
    <main className="site tm" data-theme="b">
      <header className="st-bar">
        <div className="st-lock"><img src="/img/tff-logo-white.webp" alt="The Flavor Factory" width={100} height={22} /><span>×</span><b>TheraBreath</b></div>
      </header>
      <div className="tm-in">
        <h1>The Future of Freshness</h1>
        <p className="tm-lead">Thank you for Monday. Here’s the presentation as we showed it, the slides as a PDF and the one part the phones missed on the day.</p>
        <ul className="tm-list">{items.map((x) => <li key={x.t}><a href={x.href} {...(x.dl ? { download: true } : {})}>{x.t}</a><p>{x.d}</p></li>)}</ul>
        <p className="tm-src-note" style={{ marginTop: 28 }}>These are development samples and concepts made for this session. They aren’t finished products or claims. Please keep this link inside Church &amp; Dwight.</p>
      </div>
      <footer className="fd-foot">Confidential · for Church &amp; Dwight and The Flavor Factory</footer>
    </main>
  );
}

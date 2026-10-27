import { EVENT, RUN } from '@/lib/content';
import { joinToken } from '@/lib/auth';

// The team page: everything built for November 9 in one place, for The Flavor Factory team (the password or the
// team link), in the front door's look. The pre-brief here is a practice copy: answers go to the PREVIEW session, never
// the live one.
export const dynamic = 'force-dynamic';
const PRACTICE = 'PREVIEW';

export default async function Team() {
  const prebrief = `/survey/${PRACTICE}?k=${await joinToken(PRACTICE)}`;
  const items = [
    { href: '/host', t: 'The presentation', d: 'Ross’s four objectives as four chapters, each opening in his words and closing on a discussion. Right arrow or click to go on, F for full screen, N for the talking points.', c: '#8FE0F0' },
    { href: '/', t: 'The front door', d: 'What Church & Dwight sees after the password: the film, Ross’s brief, the four platforms, the sealed tasting, who they will meet and the morning.', c: '#F4B860' },
    { href: prebrief, t: 'The pre-brief', d: 'The pre-read Ross sends on November 3. This is a practice copy, so try the homework: answers here never reach the live session.', c: '#CFE8C6' },
    { href: '/host/run', t: 'The run sheet', d: 'The morning minute by minute, the 9:30 setup and what is still to confirm. Prints to two pages.', c: '#C9B8FF' },
    { href: '/scorecard', t: 'The tasting scorecard', d: 'One page per person for the blind tasting of samples A to D.', c: '#F7B6D2' },
    { href: '/media/flavor-race.mp4', t: 'THE FLAVOR RACE', d: 'The 2:26 film that sends the room to lunch at 11:48. Sound on.', c: '#F2677B' },
  ];
  return (
    <main className="site tm" data-theme="b">
      <header className="st-bar">
        <div className="st-lock"><img src="/img/tff-logo-white.webp" alt="The Flavor Factory" /><span>×</span><b>TheraBreath</b></div>
        <nav className="st-hostbar" aria-label="More"><a href="/">Front door</a><a href="/host">Open the presentation</a></nav>
      </header>
      <section className="ws-section tm-top">
        <div className="tm-orb" />
        <div className="st-k">For The Flavor Factory team · {EVENT.date}</div>
        <h2>What we&rsquo;ve<br /><em>built.</em></h2>
        <p className="ws-lead">Everything for The Future of Freshness, in one place. Please keep this page and its link inside the team.</p>
        <div className="ws-grid tm-grid">{items.map((x, i) => (
          <a key={x.t} href={x.href} className="ws-card tm-card" style={{ borderTopColor: x.c }}><span className="ws-code">{String(i + 1).padStart(2, '0')}</span><h3>{x.t}</h3><p>{x.d}</p></a>
        ))}</div>
      </section>
      <section className="st-close tm-morning">
        <div className="st-close-orb" />
        <div className="st-k">The morning · {EVENT.date} · {EVENT.room} room</div>
        <h2>Two hours. <em>Four objectives.</em></h2>
        <ol className="st-agenda">{RUN.map((b) => <li key={b.id}><b>{b.t}</b>{b.title}{b.obj && <em className="st-obj">Objective {b.obj}</em>}</li>)}</ol>
        <footer className="st-foot">Confidential · for The Flavor Factory team</footer>
      </section>
    </main>
  );
}

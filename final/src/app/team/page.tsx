import { EVENT, RUN } from '@/lib/content';
import { joinToken } from '@/lib/auth';
import LivePanel from './LivePanel';

export const metadata = { title: 'Team page' };

// The team page: everything built for November 9 in one place, for The Flavor Factory team (the team link opens it;
// the client password alone does not), in the front door's look. The pre-brief here is a practice copy: answers go to the PREVIEW session, never
// the live one.
export const dynamic = 'force-dynamic';
const PRACTICE = 'PREVIEW';

export default async function Team() {
  const prebrief = `/survey/${PRACTICE}?k=${await joinToken(PRACTICE)}`;
  const items = [
    { href: '/host?code=REHEARSE', t: 'Rehearse the presentation', d: 'The whole presentation, running on a rehearsal session. Scan the code with your own phone to try the votes and the tasting. Nothing you do here reaches the live session.', c: '#8FE0F0' },
    { href: '/', t: 'The front door', d: 'What Church & Dwight sees after the password: the film, Ross’s brief, the four directions, the blind tasting, who they’ll meet and how the morning runs.', c: '#F4B860' },
    { href: prebrief, t: 'The pre-brief', d: 'The pre-read Ross sends out on November 3. This is a practice copy, so go ahead and try the questions. Answers here never reach the live session.', c: '#CFE8C6' },
    { href: '/host/run', t: 'The run sheet', d: 'The morning minute by minute, the 9:30 setup and what we still need to confirm. It prints on two pages.', c: '#C9B8FF' },
    { href: '/scorecard', t: 'The paper scorecard', d: 'A backup for anyone who’d rather not score on a phone, with one page per person for samples A to D.', c: '#F7B6D2' },
    { href: '/media/flavor-race.mp4', t: 'THE FLAVOR RACE', d: 'The 2:26 film that sends everyone off to lunch at 11:48. Turn the sound up.', c: '#F2677B' },
  ];
  return (
    <main className="site tm" data-theme="b">
      <header className="st-bar">
        <div className="st-lock"><img src="/img/tff-logo-white.webp" alt="The Flavor Factory" width={100} height={22} /><span>×</span><b>TheraBreath</b></div>
        <nav className="st-hostbar" aria-label="More"><a href="/">Front door</a><a href="/host?code=REHEARSE">Rehearse</a></nav>
      </header>
      <section className="ws-section tm-top">
        <div className="tm-orb" />
        <div className="st-k">For The Flavor Factory team · {EVENT.date}</div>
        <h1>What we&rsquo;ve<br /><em>built.</em></h1>
        <p className="ws-lead">Everything for The Future of Freshness, in one place. Please keep this page and its link inside the team. The link is what opens the presentation and these pages, and Church &amp; Dwight’s password won’t. Until the day, stick to the rehearsal. On the day, open the live presentation on the presenting laptop only.</p>
        <LivePanel code={EVENT.code} />
        <div className="ws-grid tm-grid">{items.map((x, i) => (
          <a key={x.t} href={x.href} className="ws-card tm-card" style={{ borderTopColor: x.c }}><span className="ws-code">{String(i + 1).padStart(2, '0')}</span><h2>{x.t}</h2><p>{x.d}</p></a>
        ))}</div>
      </section>
      <section className="st-close tm-morning">
        <div className="st-close-orb" />
        <div className="st-k">The morning · {EVENT.date} · {EVENT.room} room</div>
        <h2>How the two hours <em>will go.</em></h2>
        <ol className="st-agenda">{RUN.map((b) => <li key={b.id}><b>{b.t}</b>{b.title}{b.obj && <em className="st-obj">Objective {b.obj}</em>}</li>)}</ol>
        <footer className="st-foot">Confidential · for The Flavor Factory team</footer>
      </section>
    </main>
  );
}

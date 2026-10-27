import { EVENT, RUN } from '@/lib/content';
import { joinToken } from '@/lib/auth';

// The team page: everything built for November 9 in one place, for The Flavor Factory team (host password or the
// team link). The pre-brief here is a practice copy: answers go to the PREVIEW session, never the live one.
export const dynamic = 'force-dynamic';
const PRACTICE = 'PREVIEW';

export default async function Team() {
  const prebrief = `/survey/${PRACTICE}?k=${await joinToken(PRACTICE)}`;
  const items = [
    { href: '/', t: 'The front door', d: 'What Church & Dwight sees after the password: when and where, Ross’s four objectives, the morning and the pre-brief.' },
    { href: prebrief, t: 'The pre-brief', d: 'The pre-read Ross sends on November 3. This is a practice copy, so try the homework: answers here never reach the live session.' },
    { href: '/host', t: 'The presentation', d: 'Twenty slides, one per idea. Right arrow or click to go on, F for full screen, N for the speaker notes.' },
    { href: '/host/run', t: 'The run sheet', d: 'Who leads what, minute by minute, the 9:30 setup and what is still to confirm. Prints to two pages.' },
    { href: '/scorecard', t: 'The tasting scorecard', d: 'One page per person for the blind tasting of samples A to D.' },
    { href: '/media/flavor-race.mp4', t: 'THE FLAVOR RACE', d: 'The 2:26 film that sends the room to lunch at 11:48. Sound on.' },
  ];
  return (
    <main className="sp" data-theme="a">
      <header className="sp-bar">
        <div className="sp-lock"><img src="/img/tff-logo.webp" alt="The Flavor Factory" /><span>×</span><b>TheraBreath</b></div>
      </header>
      <section className="sp-top">
        <p className="sp-k">For The Flavor Factory team · {EVENT.date}</p>
        <h1>What we&rsquo;ve built</h1>
        <p className="sp-where">Everything for The Future of Freshness, in one place. Please keep this page and its link inside the team.</p>
      </section>
      <section className="sp-sec">
        <ol className="sp-cards">{items.map((x, i) => (
          <li key={x.t}><a href={x.href}><span>{String(i + 1).padStart(2, '0')}</span><b>{x.t}</b><p>{x.d}</p></a></li>
        ))}</ol>
      </section>
      <section className="sp-sec">
        <h2>Who leads what</h2>
        <ol className="sp-agenda">{RUN.map((b) => <li key={b.id}><b>{b.t}</b><span>{b.title}{b.obj && <em className="sp-o">Objective {b.obj}</em>}<em className="sp-o">{b.lead}</em></span></li>)}</ol>
      </section>
      <footer className="sp-foot">Confidential · for The Flavor Factory team</footer>
    </main>
  );
}

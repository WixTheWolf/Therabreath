import { EVENT, SOURCES, SOURCE_URLS } from '@/lib/content';
import { joinToken } from '@/lib/auth';
import LivePanel from './LivePanel';
import RehearsalReset from './RehearsalReset';

export const metadata = { title: 'Team page' };

// The team page: everything built for November 9 in one place, for The Flavor Factory team (the team link opens it;
// the client password alone does not). One action leads (the rehearsal); the rest is a plain list. The pre-brief here
// is a practice copy: answers go to the PREVIEW session, never the live one.
export const dynamic = 'force-dynamic';
const PRACTICE = 'PREVIEW';
const FILES = '/files';

export default async function Team() {
  const prebrief = `/survey/${PRACTICE}?k=${await joinToken(PRACTICE)}`;
  const before = [
    { href: `${FILES}/The-Future-of-Freshness-Presenter-Deck.pdf`, t: 'The presentation, page by page', d: 'Every slide with its builds, times and talking points. The easiest way to read it on a phone.' },
    { href: '/host/run', t: 'The run sheet', d: 'The morning minute by minute, the 9:30 setup and what we still need to confirm, including the drafted concept cards, the Flavor School slide and the bottles on slide 3.' },
    { href: '/', t: 'The front door', d: 'What Church & Dwight sees after their password.' },
    { href: prebrief, t: 'The pre-brief', d: 'The pre-read Ross sends on November 3. A practice copy, so try the questions freely.' },
    { href: '/media/opening.mp4', t: 'The opening film', d: '1:22, on the front door and the pre-brief. It isn’t shown in the room.' },
  ];
  const day = [
    { href: '/host/writeup?code=REHEARSE', t: 'The Playbook write-up', d: 'What we send everyone within 8 business days. This is a practice copy; after the morning, switch to the live session at the top.' },
    { href: '/scorecard', t: 'The paper scorecard', d: 'The last resort for anyone without a phone (there’s a loaner too). One page per person. On the day we only count them.' },
    { href: '/host/cards?code=REHEARSE', t: 'Paper scorecards, after the morning', d: 'Where the paper cards are typed in once the morning is over. A practice copy; after the morning, use /host/cards for the live session.' },
    { href: '/media/flavor-race.mp4', t: 'THE FLAVOR RACE', d: '2:24, at 10:37, right before the tasting. Save a copy to the presenting laptop the day before.' },
  ];
  // Every PDF, to save or forward inside the team. The decks show the sample names, so they stay behind the team link.
  const pdfs = [
    ['The-Future-of-Freshness-Presenter-Deck.pdf', 'Presentation with talking points'],
    ['The-Future-of-Freshness-Deck.pdf', 'Slides only'],
    ['The-Future-of-Freshness-Run-Sheet.pdf', 'Run sheet'],
    ['The-Future-of-Freshness-Tasting-Scorecard.pdf', 'Paper scorecard'],
    ['The-Future-of-Freshness-Pre-brief.pdf', 'Pre-brief'],
  ];
  const list = (xs: { href: string; t: string; d: string }[]) => (
    <ul className="tm-list">{xs.map((x) => <li key={x.t}><a href={x.href}>{x.t}</a><p>{x.d}</p></li>)}</ul>
  );
  return (
    <main className="site tm" data-theme="b">
      <header className="st-bar">
        <div className="st-lock"><img src="/img/tff-logo-white.webp" alt="The Flavor Factory" width={100} height={22} /><span>×</span><b>TheraBreath</b></div>
        <nav className="st-hostbar" aria-label="More"><a href="/">Front door</a><a href="/host?code=REHEARSE#1">Rehearse</a></nav>
      </header>
      <div className="tm-in">
        <h1>Everything for November 9</h1>
        <p className="tm-lead">Please keep this page and its link inside the team. Until the day, use the rehearsal. On the day, open the live presentation on the presenting laptop only.</p>
        <div className="tm-start">
          <a className="tm-go" href="/host?code=REHEARSE#1">Rehearse the presentation</a>
          <p>Scan the code with your own phone to try the votes and the tasting, and press P for the presenter view. Nothing here reaches the live session.</p>
          <RehearsalReset />
        </div>
        <LivePanel code={EVENT.code} />
        <h2>Before the day</h2>
        {list(before)}
        <h2>On the day</h2>
        {list(day)}
        <h2>PDFs</h2>
        <ul className="tm-pdfs">{pdfs.map(([f, l]) => <li key={f}><a href={`${FILES}/${f}`} download>{l}</a></li>)}</ul>
        <h2>Sources behind the numbers</h2>
        <p className="tm-src-note">Checked November 3, 2026. Each trend says on screen whether its evidence comes from oral care or from food and flavor more widely.</p>
        <ul className="tm-src">{Object.keys(SOURCE_URLS).map((k) => <li key={k}><a href={SOURCE_URLS[k]} target="_blank" rel="noopener noreferrer">{SOURCES[k]}</a></li>)}</ul>
      </div>
      <footer className="fd-foot">Confidential · for The Flavor Factory team</footer>
    </main>
  );
}

'use client';
// The site: the front door, behind the password. One short page: when and where, why we are meeting, Ross's four
// objectives, the morning, and the pre-brief. Nothing scrolls on its own and nothing animates.
import { useEffect, useState } from 'react';
import FilmModal from './FilmModal';
import { EVENT, OBJECTIVES, AGENDA, SOURCES, ROSS_GOAL } from '@/lib/content';

// `host` (the host cookie, read on the server) adds THE FLAVOR RACE and the presentation to the bar; the room never
// sees either before 11:48. `prebrief` is the signed pre-brief link for the live session.
export default function SiteApp({ host = false, prebrief }: { host?: boolean; prebrief: string }) {
  const [race, setRace] = useState(false);
  useEffect(() => { document.documentElement.dataset.theme = 'a'; }, []);

  return (
    <main className="sp" data-theme="a">
      <header className="sp-bar">
        <div className="sp-lock"><img src="/img/tff-logo.webp" alt="The Flavor Factory" /><span>×</span><b>TheraBreath</b></div>
        {host ? <nav className="sp-host" aria-label="Host"><button onClick={() => setRace(true)}>Watch THE FLAVOR RACE</button><a href="/host">Open the presentation</a></nav>
          : <a className="sp-signin" href="/login?host=1">Host sign-in</a>}
      </header>

      <section className="sp-top">
        <p className="sp-k">{EVENT.date} · {EVENT.time} ET</p>
        <h1>The Future of Freshness</h1>
        <p className="sp-where">{EVENT.room} room · Church &amp; Dwight · 469 N Harrison St, Princeton, NJ</p>
      </section>

      <section className="sp-sec">
        <h2>Why we&rsquo;re meeting</h2>
        <p className="sp-line">TheraBreath took away the burn. Now let&rsquo;s give more people a reason to want it.</p>
        <p>In two hours we will look at what is changing in flavor, taste four samples made in your bases, and agree what to develop first, with owners and dates.</p>
      </section>

      <section className="sp-sec">
        <h2>Your four objectives</h2>
        <ol className="sp-obj">{OBJECTIVES.map((o) => <li key={o.n}><span>{o.n}</span><p><b>{o.short}.</b> {o.ask}</p></li>)}</ol>
        <p className="sp-src">From {SOURCES[ROSS_GOAL.src]}.</p>
      </section>

      <section className="sp-sec">
        <h2>The morning</h2>
        <ol className="sp-agenda">{AGENDA.map(([t, l]) => <li key={t}><b>{t}</b><span>{l}</span></li>)}</ol>
      </section>

      <section className="sp-sec sp-cta">
        <h2>Before you come</h2>
        <p>Two minutes of homework in the pre-brief. Your answers open the morning.</p>
        <a className="sp-btn" href={prebrief}>Open the pre-brief</a>
      </section>

      <footer className="sp-foot">Confidential and private · TheraBreath × The Flavor Factory</footer>
      {race && <FilmModal race onClose={() => setRace(false)} />}
    </main>
  );
}

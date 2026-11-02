'use client';
// The site: the front door, behind the password. The film, then one quiet column: why we're meeting, the morning in
// Ross's words, the four directions, the blind tasting, who you'll meet, and the pre-brief at the end. Distilled on
// November 2 because the long scroll felt busy: no labels over headings, no card grids, no side rail.
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import FilmModal from './FilmModal';
// The team's bar (and THE FLAVOR RACE behind it) loads only for the team, so nothing about the film ships to the room.
const HostBar = dynamic(() => import('./HostBar'), { ssr: false });
import { EVENT, FILM, PRIMARY_TERRITORIES, RUN, OBJECTIVES, ROSS_GOAL, SOURCES, GAP, CITE, TEAM, ABOUT } from '@/lib/content';

// Each objective's words sit under the first block that answers it.
const firstOf = new Set(RUN.filter((b, i) => b.obj && RUN.findIndex((x) => x.obj === b.obj) === i).map((b) => b.id));
const askFor = (n?: string) => OBJECTIVES.find((o) => o.n === n)?.ask;

// For the team, the bar opens THE FLAVOR RACE, the rehearsal, the run sheet and the team page (HostBar).
// `prebrief` is the signed pre-brief link for the live session.
export default function SiteApp({ prebrief, team = false }: { prebrief: string; team?: boolean }) {
  const [film, setFilm] = useState(false);
  useEffect(() => { document.documentElement.dataset.theme = 'b'; }, []);

  return (
    <main className="site fd" data-theme="b">
      <header className="st-bar">
        <div className="st-lock"><img src="/img/tff-logo-white.webp" alt="The Flavor Factory" width={100} height={22} /><span>×</span><b>TheraBreath</b></div>
        {team && <HostBar />}
      </header>

      <section className="st-hero">
        <video autoPlay muted loop playsInline poster="/media/opening-poster.jpg"><source media="(min-width: 701px), (orientation: landscape)" src="/media/loop.mp4" type="video/mp4" /><source src="/media/loop-portrait.mp4" type="video/mp4" /></video>
        <div className="st-shade" />
        <div className="st-hero-in">
          <h1>The Future<br /><em>of Freshness</em></h1>
          <p className="fd-when">{EVENT.date} · {EVENT.time} ET · {EVENT.room} room, {EVENT.city}</p>
          <p>Two hours with Church &amp; Dwight Oral Care R&amp;D. We’ll work through your four objectives, taste four samples we made in your bases and vote on what to develop. By noon, every direction we pick will have a plan and an owner.</p>
          <div className="st-cta">
            <button className="st-play" onClick={() => setFilm(true)}><span className="st-tri" />Watch the film <small>{FILM.site.length} · sound on</small></button>
            <a className="st-ghost" href={prebrief}>Answer the pre-brief</a>
          </div>
        </div>
      </section>

      <div className="fd-body">
        <section className="fd-sec" aria-labelledby="fd-why">
          <h2 id="fd-why">Why we’re meeting</h2>
          <blockquote className="fd-quote"><p>“{ROSS_GOAL.lead} {ROSS_GOAL.loyal} {ROSS_GOAL.joiner} {ROSS_GOAL.fresh}”</p><cite>{SOURCES[ROSS_GOAL.src]}</cite></blockquote>
          <p>TheraBreath took the burn out of mouthwash. The next job is giving more people a reason to want it. Today {GAP.tb}% of US households buy TheraBreath, against {GAP.category}% for mouthwash, which leaves 86 of every 100 who don’t buy it yet. Flavor is one of the easiest ways to give them a reason to try it.</p>
          <p className="fd-src">Source: {CITE.q2call.src}</p>
        </section>

        <section className="fd-sec" aria-labelledby="fd-morning">
          <h2 id="fd-morning">The morning</h2>
          <p>We’ve built the morning around your four objectives.</p>
          <ol className="fd-agenda">{RUN.map((b) => (
            <li key={b.id}><time>{b.t}</time><div><b>{b.title}</b>{firstOf.has(b.id) && <q>{askFor(b.obj)}</q>}</div></li>
          ))}</ol>
        </section>

        <section className="fd-sec" aria-labelledby="fd-dirs">
          <h2 id="fd-dirs">Four directions</h2>
          <p>Two of them are in the tasting, and the other two are there for discussion. You’ll help decide which ones get a next round.</p>
          <ul className="fd-dirs">{PRIMARY_TERRITORIES.map((t) => (
            <li key={t.id}>{t.image ? <img src={t.image} alt="" loading="lazy" style={t.focus ? { objectPosition: t.focus } : undefined} /> : <div className="fd-noimg" />}<h3>{t.name}</h3><p>{t.promise}</p></li>
          ))}</ul>
        </section>

        <section className="fd-sec" aria-labelledby="fd-tasting">
          <h2 id="fd-tasting">A blind tasting</h2>
          <p>We made four samples in the unflavored bases you sent us: A and B in the Kids base, C and D in the Fresh Breath base. You’ll score each one on your phone (or on a paper card, if you’d rather), and the names stay sealed until everyone has scored.</p>
          <img className="fd-wide" src="/img/tasting-cups.webp" alt="" loading="lazy" />
        </section>

        <section className="fd-sec" aria-labelledby="fd-team">
          <h2 id="fd-team">Who you’ll meet</h2>
          <p>{ABOUT}</p>
          <ul className="fd-team">{TEAM.map((t) => <li key={t.name}><b>{t.name}</b><span>{t.title}</span></li>)}</ul>
        </section>

        <section className="fd-sec fd-close" aria-labelledby="fd-before">
          <h2 id="fd-before">Before you come</h2>
          <p>Please take a few minutes to answer four quick questions in the pre-brief. We’ll open the morning with everyone’s answers.</p>
          <a className="st-play fd-go" href={prebrief}>Open the pre-brief</a>
          <p className="fd-logi">{EVENT.dateLine}. {EVENT.room} room, {EVENT.place}. Bring your phone: you’ll use it to score the samples and vote.</p>
        </section>
      </div>

      <footer className="fd-foot">Confidential and private · TheraBreath × The Flavor Factory{!team && <> · <a href="/login?team=1&next=/team">Flavor Factory team sign-in</a></>}</footer>

      {film && <FilmModal file={FILM.site.file} onClose={() => setFilm(false)} next={{ label: 'Open the pre-brief', href: prebrief, line: 'Next: the pre-brief and its four quick questions. We’ll open the morning with everyone’s answers.' }} />}
    </main>
  );
}

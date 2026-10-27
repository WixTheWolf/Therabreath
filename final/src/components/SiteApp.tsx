'use client';
// The site: the front door, behind the password. One scroll that tells the story: the film, Ross's brief, the growth
// math, the four directions in photographs, the blind tasting, who you will meet and the morning, with the pre-brief at
// the end. An optional drawer holds the vocabulary of freshness, science and imagination, and the three shifts.
import { useEffect, useMemo, useRef, useState } from 'react';
import FilmModal from './FilmModal';
import { EVENT, PRIMARY_TERRITORIES, SAMPLES, VOCAB, SHIFTS, SCIENCE, IMAGINATION, AGENDA, OBJECTIVES, TOPICS, RUN, ROSS_GOAL, GAP, SOURCES, TEAM } from '@/lib/content';

const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ease = (x: number) => 1 - Math.pow(1 - clamp(x), 3);
const when = (n: string) => { const bs = RUN.filter((b) => b.obj === n); return bs.length ? `${bs[0].t} to ${bs[bs.length - 1].end}` : ''; };

// Progress through a tall section: 0 when its top reaches the top of the screen, 1 when its bottom does.
function useProgress<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [p, setP] = useState(0);
  useEffect(() => {
    let raf = 0;
    const f = () => {
      raf = 0; const el = ref.current; if (!el) return;
      const r = el.getBoundingClientRect(); const span = Math.max(1, r.height - innerHeight);
      setP(clamp(-r.top / span));
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(f); };
    f(); addEventListener('scroll', on, { passive: true }); addEventListener('resize', on);
    return () => { removeEventListener('scroll', on); removeEventListener('resize', on); cancelAnimationFrame(raf); };
  }, []);
  return [ref, p] as const;
}

// Adds .in when an element scrolls into view, for gentle rises.
function useReveal() {
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && e.target.classList.add('in')), { threshold: 0.2 });
    document.querySelectorAll('.st-rise').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

const NAV = [['hero', 'Film'], ['brief', 'Your brief'], ['why', 'Why flavor'], ['platforms', 'Four directions'], ['flight', 'Tasting'], ['team', 'Who you will meet'], ['close', 'The morning'], ['explore', 'More reading']];

// The bar opens THE FLAVOR RACE, the presentation, the run sheet and the team page for everyone past the password.
// `prebrief` is the signed pre-brief link for the live session.
export default function SiteApp({ prebrief }: { prebrief: string }) {
  const [film, setFilm] = useState(false);
  const [race, setRace] = useState(false);
  const [active, setActive] = useState('hero');
  useReveal();
  useEffect(() => { document.documentElement.dataset.theme = 'b'; }, []);
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)), { rootMargin: '-45% 0px -50% 0px' });
    NAV.forEach(([id]) => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, []);

  return (
    <main className="site" data-theme="b">
      <header className="st-bar">
        <div className="st-lock"><img src="/img/tff-logo-white.webp" alt="The Flavor Factory" /><span>×</span><b>TheraBreath</b></div>
        <nav className="st-hostbar" aria-label="More"><button onClick={() => setRace(true)}>Watch THE FLAVOR RACE</button><a href="/host">Open the presentation</a><a href="/host/run">Run sheet</a><a href="/team">Team page</a></nav>
      </header>
      <nav className="st-rail" aria-label="Chapters">
        {NAV.map(([id, l]) => <a key={id} href={`#${id}`} className={active === id ? 'on' : ''}><span>{l}</span><i /></a>)}
      </nav>

      <Hero onFilm={() => setFilm(true)} />
      <YourBrief />
      <WhyFlavor />
      <WorkshopOverview />
      <Team />
      <Close prebrief={prebrief} />
      <details id="explore" className="st-explore"><summary>More reading: the words we use for freshness, and three shifts we are seeing</summary><p>Optional. These pages explain ideas. They are not formula work or consumer research.</p><Vocab /><Worlds /><ShiftTrack /></details>

      {film && <FilmModal onClose={() => setFilm(false)} />}
      {race && <FilmModal race onClose={() => setRace(false)} />}
    </main>
  );
}

function Hero({ onFilm }: { onFilm: () => void }) {
  return (
    <section id="hero" className="st-hero">
      <video autoPlay muted loop playsInline poster="/media/opening-poster.jpg"><source src="/media/loop.mp4" type="video/mp4" /></video>
      <div className="st-shade" />
      <div className="st-hero-in">
        <div className="st-k">{EVENT.date} · {EVENT.time} ET · {EVENT.city}</div>
        <h1>The Future<br /><em>of Freshness</em></h1>
        <p>Two hours with Church &amp; Dwight Oral Care R&amp;D. We will go through the four things Ross asked for, taste four samples we made in your bases, vote on what to develop, and leave with a plan and an owner for each direction.</p>
        <div className="st-cta">
          <button className="st-play" onClick={onFilm}><span className="st-tri" />Play the film <small>1:27 · sound on</small></button>
          <a className="st-ghost" href="#brief">Explore the workshop</a>
        </div>
      </div>
      <div className="st-cue"><i /></div>
    </section>
  );
}

// "Mint" is where freshness starts, not where it ends. Scroll and the vocabulary bursts out of it.
function Vocab() {
  const [ref, p] = useProgress<HTMLElement>();
  const [pick, setPick] = useState<number | null>(null);
  const spots = useMemo(() => VOCAB.map((_, i) => {
    const inner = i < 7, k = inner ? i / 7 : (i - 7) / 9, off = inner ? 0.2 : 0.05;
    const a = (k + off) * Math.PI * 2, rx = inner ? 24 : 40, ry = inner ? 20 : 34;
    return [50 + Math.cos(a) * rx, 50 + Math.sin(a) * ry];
  }), []);
  const burst = ease((p - 0.08) / 0.55);
  const n = Math.round(clamp((p - 0.08) / 0.55) * VOCAB.length);
  return (
    <section id="vocab" ref={ref} className="st-tall" style={{ height: '280vh' }}>
      <div className="st-stick st-vocab">
        <div className="st-k st-top">01 · The vocabulary of freshness</div>
        <div className="st-mint" style={{ transform: `translate(-50%,-50%) scale(${1.25 - burst * 0.35})` }}>Mint</div>
        {VOCAB.map((v, i) => {
          const e = ease((p - 0.08 - i * 0.018) / 0.5);
          const [x, y] = spots[i];
          return (
            <button key={v.w} className={'st-word' + (pick === i ? ' on' : '')} onClick={() => setPick(pick === i ? null : i)}
              style={{ left: `${50 + (x - 50) * e}%`, top: `${50 + (y - 50) * e}%`, opacity: e, transform: `translate(-50%,-50%) scale(${0.4 + e * 0.6})` }}>{v.w}</button>
          );
        })}
        <div className="st-vocab-foot">
          {pick !== null ? <p><b>{VOCAB[pick].w}.</b> {VOCAB[pick].d}</p>
            : <p>{n < 2 ? 'Freshness used to mean one word.' : n < VOCAB.length ? `${n + 1} words and counting.` : `Now it means ${VOCAB.length + 1}. Tap any word.`}</p>}
        </div>
      </div>
    </section>
  );
}

// Science and imagination slide together into one drop: freshness, designed.
function Worlds() {
  const [ref, p] = useProgress<HTMLElement>();
  const m = ease(p / 0.7), drop = ease((p - 0.6) / 0.3);
  return (
    <section id="worlds" ref={ref} className="st-tall" style={{ height: '240vh' }}>
      <div className="st-stick st-worlds">
        <div className="st-k st-top">02 · Two worlds meet</div>
        <div className="st-col left" style={{ transform: `translateX(${-(1 - m) * 26}vw)`, opacity: 1 - drop * 0.96 }}>
          <b>The science</b>{SCIENCE.map((x, i) => <span key={x} style={{ transitionDelay: `${i * 40}ms` }}>{x}</span>)}
        </div>
        <div className="st-col right" style={{ transform: `translateX(${(1 - m) * 26}vw)`, opacity: 1 - drop * 0.96 }}>
          <b>The imagination</b>{IMAGINATION.map((x) => <span key={x}>{x}</span>)}
        </div>
        <div className="st-drop" style={{ opacity: drop, transform: `translate(-50%,-50%) scale(${0.6 + drop * 0.4})` }}>
          <div className="st-drop-orb" />
          <h2>Science and<br /><em>imagination.</em></h2>
          <p>We work from both sides: what holds up in the bottle, and what people actually want to taste.</p>
        </div>
      </div>
    </section>
  );
}

// Three shifts on a horizontal track. Each one crosses out the old idea as it passes the middle.
function ShiftTrack() {
  const [ref, p] = useProgress<HTMLElement>();
  const track = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(0);
  useEffect(() => { const f = () => setW((track.current?.scrollWidth || 0) - innerWidth); f(); addEventListener('resize', f); return () => removeEventListener('resize', f); }, []);
  return (
    <section id="shifts" ref={ref} className="st-tall" style={{ height: '360vh' }}>
      <div className="st-stick st-shifts">
        <div className="st-k st-top">03 · Three shifts · what is changing</div>
        <div className="st-track" ref={track} style={{ transform: `translateX(${-p * Math.max(0, w)}px)` }}>
          <div className="st-shift intro"><h2>What people<br />expect from<br /><em>fresh</em> is changing.</h2><p>Keep scrolling to see three shifts.</p></div>
          {SHIFTS.map((x, i) => {
            const local = clamp((p - (i + 0.4) / (SHIFTS.length + 1.2)) * (SHIFTS.length + 1) * 1.1);
            return (
              <div key={x.a} className="st-shift" style={{ ['--x' as any]: local }}>
                <span className="st-n">0{i + 1}</span>
                <div className="st-from"><span>{x.a}</span><i /></div>
                <div className="st-arrow">↓</div>
                <div className="st-to">{x.b}</div>
                <p>{x.d}</p>
              </div>
            );
          })}
          <div className="st-shift outro"><h2>Three shifts,<br />and <em>four directions</em><br />that respond to them.</h2></div>
        </div>
        <div className="st-meter"><i style={{ width: `${p * 100}%` }} /></div>
      </div>
    </section>
  );
}

// Ross's brief, word for word: four objectives, each answered in turn through the morning, and the goal behind them.
function YourBrief() {
  return (
    <section id="brief" className="ws-section ws-brief">
      <div className="st-k">From Ross&rsquo;s invitation</div><h2>You asked for four things.<br /><em>Here is when we cover each one.</em></h2>
      <div className="ws-grid ws-four">{OBJECTIVES.map((o, i) => <article className="ws-card st-rise" key={o.n}><span className="ws-code">{o.n}</span><p className="ws-ask">{o.ask}</p><small>{when(o.n)} · {TOPICS[i].title.replace(/\.$/, '')}</small></article>)}</div>
      <blockquote className="ws-goal st-rise"><p>&ldquo;{ROSS_GOAL.lead} <mark className="x">{ROSS_GOAL.loyal}</mark> {ROSS_GOAL.joiner} <mark className="y">{ROSS_GOAL.fresh}</mark>&rdquo;</p><cite>{SOURCES[ROSS_GOAL.src]}</cite></blockquote>
    </section>
  );
}

// The growth math: the category glass and the TheraBreath glass, filled with light as they scroll in.
function WhyFlavor() {
  const r = useReveal1();
  return (
    <section id="why" ref={r} className="ws-section ws-why">
      <div className="st-k">Why flavor, why now</div>
      <h2>86 out of 100 US households<br /><em>don’t buy TheraBreath yet.</em></h2>
      <div className="ws-gap">
        <div className="ws-glass" style={{ ['--f' as any]: GAP.category / 100 }}><i /><b>{GAP.category}%</b><span>Mouthwash category household penetration</span></div>
        <div className="ws-glass tb" style={{ ['--f' as any]: GAP.tb / 100 }}><i /><b>{GAP.tb}%</b><span>TheraBreath household penetration</span></div>
        <div className="ws-facts">
          <div><b>25.3%</b><span>TheraBreath’s share of US mouthwash in Q2 2026, up 4.5 points. It is now number 2 in the category.</span></div>
          <div><b>54%</b><span>of Americans want a milder-tasting mouthwash. The market is now selling intensity as a choice.</span></div>
          <p className="ws-lead">Flavor is one of the easiest ways to give them a reason to try it.</p>
        </div>
      </div>
      <p className="ws-src">Sources: {SOURCES.q2call}; {SOURCES.kenvue}.</p>
    </section>
  );
}

function useReveal1() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => { const el = ref.current; if (!el) return; const io = new IntersectionObserver(([e]) => e.isIntersecting && el.classList.add('in'), { threshold: 0.35 }); io.observe(el); return () => io.disconnect(); }, []);
  return ref;
}

// The four directions, then the tasting: the samples stay unnamed on the site and are revealed in the room.
function WorkshopOverview() {
  const tasting = RUN.find((b) => b.id === 'tasting')!;
  return <>
    <section id="platforms" className="ws-section">
      <div className="st-k">Four directions</div><h2>Where we think<br /><em>flavor could go.</em></h2>
      <p className="ws-lead">Two of them are in the tasting. The other two are for discussion. You will help decide which ones get a next round.</p>
      <div className="ws-grid">{PRIMARY_TERRITORIES.map(t => <article className="ws-card ws-photo st-rise" key={t.id} style={{ borderTopColor: t.palette[1] }}>{t.image && <img src={t.image} alt="" loading="lazy" />}<div className="ws-photo-in"><span className="st-k">0{t.n} · {SAMPLES.some((x) => x.territory === t.id) ? 'In the tasting' : 'For discussion'}</span><h3>{t.name}</h3><p>{t.promise}</p><strong>{t.q}</strong></div></article>)}</div>
    </section>
    <section id="flight" className="ws-section ws-flight"><div className="st-k">{tasting.t} · The tasting</div><h2>Four samples,<br /><em>tasted blind.</em></h2><p className="ws-lead">We made four samples in the unflavored bases you sent: two in Fresh Breath and two in Kids. You will score them on your phone, or on a paper card if you prefer, and we will tell you what they are afterwards.</p>
      <div className="ws-cups st-rise"><img src="/img/tasting-cups.webp" alt="" loading="lazy" /></div>
      <div className="ws-grid ws-four">{SAMPLES.map((x, i) => <article className="ws-card ws-seal" key={x.code} style={{ ['--i' as any]: i }}><span className="ws-code">{x.code}</span><h3>Revealed after the tasting</h3><p>Made in your {x.base}.</p></article>)}</div>
      <div className="ws-outcome"><span className="st-k">What you leave with</span><h3>Up to three directions, each with an owner.</h3><p>For each one: who it is for, what it should taste like, a TFF owner, a C&amp;D reviewer, the base, and a date for the next round of samples.</p><p>The scores are this group&rsquo;s first reactions. Consumer appeal and technical readiness still need proper testing.</p></div>
    </section>
  </>;
}

// The four of us, as the pre-brief letter introduces us.
function Team() {
  return (
    <section id="team" className="ws-section ws-team">
      <div className="st-k">The Flavor Factory · Norco, California</div><h2>Who you<br /><em>will meet.</em></h2>
      <div className="ws-lab st-rise"><img src="/img/lab-bench.webp" alt="" loading="lazy" /></div>
      <div className="ws-grid ws-four">{TEAM.map((t) => <article className="ws-card st-rise" key={t.name}><h3>{t.name}</h3><small>{t.title}</small></article>)}</div>
    </section>
  );
}

function Close({ prebrief }: { prebrief: string }) {
  return (
    <section id="close" className="st-close">
      <div className="st-close-orb" />
      <div className="st-k st-rise">The morning · {EVENT.date}</div>
      <h2 className="st-rise">How the two hours <em>will go.</em></h2>
      <ol className="st-agenda st-rise">{AGENDA.map(([t, l, o]) => <li key={t}><b>{t}</b>{l}{o && <em className="st-obj">Objective {o}</em>}</li>)}</ol>
      <div className="st-before st-rise"><p>Before you come, please answer four quick questions in the pre-brief. We will share everyone’s answers at the start of the morning.</p><a className="st-play" href={prebrief}>Open the pre-brief</a></div>
      <p className="st-note">{EVENT.time} ET · {EVENT.room} room · {EVENT.place}</p>
      <footer className="st-foot">Confidential and private · TheraBreath × The Flavor Factory</footer>
    </section>
  );
}

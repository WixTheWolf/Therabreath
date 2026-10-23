'use client';
// The site: the front door, behind the password. One long scroll that teaches the story: the film, Ross's brief,
// the growth math, the four platforms, the sealed tasting flight and the morning. An optional drawer holds the
// vocabulary of freshness, the two worlds and the three shifts. It goes "Live" once the session starts.
import { useEffect, useMemo, useRef, useState } from 'react';
import FilmModal from './FilmModal';
import { useSession } from '@/lib/useSession';
import { EVENT, PRIMARY_TERRITORIES, SAMPLES, VOCAB, SHIFTS, SCIENCE, IMAGINATION, AGENDA, OBJECTIVES, ROSS_GOAL, GAP, SOURCES } from '@/lib/content';
import { sceneIndex } from '@/lib/scenes';

const LIVE_CODE = EVENT.code;
const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ease = (x: number) => 1 - Math.pow(1 - clamp(x), 3);

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

const NAV = [['hero', 'Film'], ['brief', 'Your brief'], ['why', 'Why flavor'], ['platforms', 'Platforms'], ['flight', 'Tasting'], ['close', 'The morning'], ['explore', 'Explore']];

export default function SiteApp() {
  const { state: s } = useSession(LIVE_CODE, { interval: 8000 });
  const live = s.scene > 0 || Object.keys(s.participants).length > 0;
  const t = sceneIndex('tasting');
  const revealed = t >= 0 && (s.scene > t || (s.scene === t && s.step >= 2));
  const [film, setFilm] = useState(false);
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
        {live && <a className="st-live" href={`/playbook/${LIVE_CODE}`}><i />Live now · open the room&rsquo;s Playbook</a>}
      </header>
      <nav className="st-rail" aria-label="Chapters">
        {NAV.map(([id, l]) => <a key={id} href={`#${id}`} className={active === id ? 'on' : ''}><span>{l}</span><i /></a>)}
      </nav>

      <Hero onFilm={() => setFilm(true)} live={live} />
      <YourBrief />
      <WhyFlavor />
      <WorkshopOverview revealed={revealed} />
      <Close live={live} />
      <details id="explore" className="st-explore"><summary>Explore further: the vocabulary of freshness, two worlds, three shifts</summary><p>Optional reading before or after the workshop. These pages illustrate ideas; they do not validate formulas or consumer demand.</p><Vocab /><Worlds /><ShiftTrack /></details>

      {film && <FilmModal onClose={() => setFilm(false)} />}
    </main>
  );
}

function Hero({ onFilm, live }: { onFilm: () => void; live: boolean }) {
  return (
    <section id="hero" className="st-hero">
      <video autoPlay muted loop playsInline poster="/media/opening-poster.jpg"><source src="/media/loop.mp4" type="video/mp4" /></video>
      <div className="st-shade" />
      <div className="st-hero-in">
        <div className="st-k">{EVENT.date} · {EVENT.time} ET · {EVENT.city}</div>
        <h1>The Future<br /><em>of Freshness</em></h1>
        <p>TheraBreath took away the burn. Now let&rsquo;s give more people a reason to want it. Two hours with Church &amp; Dwight Oral Care R&amp;D: four of your objectives, four samples made in your bases, and a Flavor Playbook with your names on it.{live ? ' The session is live.' : ''}</p>
        <div className="st-cta">
          <button className="st-play" onClick={onFilm}><span className="st-tri" />Play the film <small>1:27 · sound on</small></button>
          <a className="st-ghost" href="#platforms">Explore the workshop</a>
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
          <h2>Freshness,<br /><em>designed.</em></h2>
          <p>The Flavor Factory brings the science. TheraBreath brings the people who trust it. The morning is where they meet.</p>
        </div>
      </div>
    </section>
  );
}

// Six shifts on a horizontal track. Each one crosses out the old idea as it passes the middle.
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
          <div className="st-shift intro"><h2>What people<br />expect from<br /><em>fresh</em> is moving.</h2><p>Keep scrolling. Watch each old idea give way.</p></div>
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
          <div className="st-shift outro"><h2>Three shifts.<br /><em>Four platforms</em><br />to answer them.</h2></div>
        </div>
        <div className="st-meter"><i style={{ width: `${p * 100}%` }} /></div>
      </div>
    </section>
  );
}

function Close({ live }: { live: boolean }) {
  return (
    <section id="close" className="st-close">
      <div className="st-close-orb" />
      <div className="st-k st-rise">The morning · {EVENT.date}</div>
      <h2 className="st-rise">You will leave with a Playbook<br />that has <em>your name</em> on it.</h2>
      <ol className="st-agenda st-rise">{AGENDA.map(([t, l]) => <li key={t}><b>{t}</b>{l}</li>)}</ol>
      {live ? <a className="st-play" href={`/playbook/${LIVE_CODE}`}>Open the room&rsquo;s Playbook</a> : <p className="st-note">{EVENT.time} ET · {EVENT.room} room · {EVENT.place}. Come curious, and hungry for something other than mint.</p>}
      <footer className="st-foot">Confidential and private · TheraBreath × The Flavor Factory</footer>
    </section>
  );
}


// Ross's brief, word for word: four objectives, one chapter each, and the goal behind them.
function YourBrief() {
  return (
    <section id="brief" className="ws-section ws-brief">
      <div className="st-k">Your brief</div><h2>You asked for four things.<br /><em>Each one becomes a chapter.</em></h2>
      <div className="ws-grid ws-four">{OBJECTIVES.map((o) => <article className="ws-card st-rise" key={o.n}><span className="ws-code">{o.n}</span><p className="ws-ask">{o.ask}</p><small>Chapter: {o.chapter}</small></article>)}</div>
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
      <h2>86 of every 100 US households<br /><em>have not met TheraBreath yet.</em></h2>
      <div className="ws-gap">
        <div className="ws-glass" style={{ ['--f' as any]: GAP.category / 100 }}><i /><b>{GAP.category}%</b><span>Mouthwash category household penetration</span></div>
        <div className="ws-glass tb" style={{ ['--f' as any]: GAP.tb / 100 }}><i /><b>{GAP.tb}%</b><span>TheraBreath household penetration</span></div>
        <div className="ws-facts">
          <div><b>25.3%</b><span>Share of US mouthwash in Q2 2026, up 4.5 points. Number 2 in the category.</span></div>
          <div><b>54%</b><span>of Americans want a milder-tasting mouthwash. The market is now selling intensity as a choice.</span></div>
          <p className="ws-lead">Flavor is how a brand introduces itself to people who have never picked it up.</p>
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

function WorkshopOverview({ revealed }: { revealed: boolean }) {
  return <>
    <section id="platforms" className="ws-section">
      <div className="st-k">The question for Princeton</div><h2>Where can flavor take<br /><em>TheraBreath next?</em></h2>
      <p className="ws-lead">Four opportunity platforms. Real development work at the center. Taste, challenge and choose what deserves the next round.</p>
      <div className="ws-grid">{PRIMARY_TERRITORIES.map(t => <article className="ws-card" key={t.id} style={{ borderTopColor: t.palette[1] }}><span className="st-k">0{t.n} · Opportunity platform</span><h3>{t.name}</h3><p>{t.promise}</p><strong>{t.q}</strong><small>{SAMPLES.some((x) => x.territory === t.id) ? 'In today’s blind tasting' : 'Discussed on screen; not in the tasting flight'}</small></article>)}</div>
    </section>
    <section id="flight" className="ws-section ws-flight"><div className="st-k">10:38 · The tasting flight</div><h2>Taste first.<br /><em>Names later.</em></h2><p className="ws-lead">Four samples from The Flavor Factory&rsquo;s development bench, made in the unflavored TheraBreath bases Church &amp; Dwight sent: two in the Fresh Breath base, two in the Kids base. The cards stay sealed until the room reveals them.</p>
      <div className="ws-grid">{SAMPLES.map((x, i) => <article className={'ws-card ws-seal' + (revealed ? ' open' : '')} key={x.code} style={{ ['--i' as any]: i }}><span className="ws-code">{x.code}</span>{revealed ? <><h3>{x.name}</h3><p>{x.note}</p><small>{x.base} · {x.status}</small></> : <><h3>Sealed until the reveal</h3><p>Made in the {x.base}. The name, the profile and the platform open in the room, after you have tasted it.</p><small>{x.base}</small></>}</article>)}</div>
      <div className="ws-outcome"><span className="st-k">The output</span><h3>Three directions worth developing.</h3><p>For each: a consumer, a sensory brief, a TFF owner, a C&D reviewer, an intended base and an agreed next evaluation date.</p><p>Workshop scores reflect this room’s reactions. Consumer appeal and technical readiness still need validation.</p></div>
    </section>
  </>;
}

'use client';
// The presentation: one clean deck for the morning. One idea per slide, big type, Ross's four objectives as the spine.
// No phones: the tasting is scored on the paper card (/scorecard) and the room decides out loud; Now, Next and Later
// are typed in live on the deck. Keys: right, space or click to go on; left to go back; F full screen; N speaker notes.
// ?all=1 lays every slide out in order, for printing the deck to PDF.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSession } from '@/lib/useSession';
import { useScale } from './StageApp';
import { EVENT, JULY, OBJECTIVES, ROSS_GOAL, SOURCES, GAP, MARKET, SIGNALS, PRIMARY_TERRITORIES as PLATFORMS, SAMPLES, HORIZONS, NEXT_STEPS } from '@/lib/content';

type Slide = { id: string; title: string; notes: string; dark?: boolean; body: React.ReactNode };

const SENSES = [
  { t: 'Taste', w: 'The tongue', d: 'Sweet, sour, salty, bitter, umami.' },
  { t: 'Aroma', w: 'The nose, both ways', d: 'Sniffed in, and rising from the back of the mouth as you swallow.' },
  { t: 'Feel', w: 'The trigeminal nerve', d: 'Cooling, tingling, warming. What mint really is.' },
];
const NNL_KEY = `fof-deck-nnl-${EVENT.code}`;

function topOf(xs: (string | undefined)[]) {
  const n: Record<string, number> = {};
  xs.forEach((x) => { if (x) n[x] = (n[x] || 0) + 1; });
  const best = Object.entries(n).sort((a, b) => b[1] - a[1])[0];
  return best ? { v: best[0], n: best[1] } : null;
}

export default function DeckApp() {
  const { state: s } = useSession(EVENT.code, { interval: 15000 });
  const answers = Object.values(s.survey || {});
  const [nnl, setNnl] = useState<Record<string, string>>({});
  useEffect(() => { try { setNnl(JSON.parse(localStorage.getItem(NNL_KEY) || '{}')); } catch {} }, []);
  const write = (id: string, v: string) => { const x = { ...nnl, [id]: v }; setNnl(x); try { localStorage.setItem(NNL_KEY, JSON.stringify(x)); } catch {} };

  const slides = useMemo<Slide[]>(() => {
    const consumer = topOf(answers.map((a) => a.consumer)), moment = topOf(answers.map((a) => a.moment));
    const vetoes = answers.map((a) => (a.veto || '').trim()).filter(Boolean).slice(0, 4);
    const list: (Slide | null)[] = [
      { id: 'title', title: 'The Future of Freshness', dark: true,
        notes: '10:00. Dan welcomes the room and thanks Ross for the invitation. Two hours, and by noon three directions with owners and dates.',
        body: <div className="dk-center"><p className="dk-k">TheraBreath × The Flavor Factory</p><h1 className="dk-hero">The Future<br /><em>of Freshness</em></h1><p className="dk-sub">{EVENT.date} · {EVENT.room} room, Princeton</p></div> },
      { id: 'july', title: 'From July to today',
        notes: '10:02. In July you came to Norco: resiliency, innovation, operations, partnership. Today is the fifth word: growth.',
        body: <><p className="dk-k">From July to today</p><h2 className="dk-h">In July, you came to Norco.<br /><em>Today is about growth.</em></h2><div className="dk-words">{JULY.map((w) => <span key={w} className={w === 'Growth' ? 'on' : ''}>{w}</span>)}</div></> },
      { id: 'brief', title: 'Your four objectives',
        notes: '10:04. Ross\'s four objectives, word for word, and his goal. The morning answers each one in turn.',
        body: <><p className="dk-k">Your brief</p><h2 className="dk-h">You asked for four things.</h2><ol className="dk-obj">{OBJECTIVES.map((o) => <li key={o.n}><span>{o.n}</span><p><b>{o.short}.</b> {o.ask}</p></li>)}</ol><p className="dk-goal">&ldquo;New flavor experiences that both <mark>{ROSS_GOAL.loyal}</mark> and <mark>{ROSS_GOAL.fresh.replace(/\.$/, '')}</mark>.&rdquo;</p><p className="dk-src">{SOURCES[ROSS_GOAL.src]}</p></> },
      answers.length ? { id: 'told', title: 'You told us',
        notes: '10:07. The pre-brief homework. Read the top consumer and the missing moment, then have some fun with the vetoes. No names on screen.',
        body: <><p className="dk-k">Your homework · {answers.length} {answers.length === 1 ? 'answer' : 'answers'}</p><h2 className="dk-h">You told us.</h2><div className="dk-told">
          {consumer && <div><small>The consumer you most want to win next</small><b>{consumer.v}</b></div>}
          {moment && <div><small>The moment TheraBreath is missing</small><b>{moment.v}</b></div>}
        </div>{vetoes.length > 0 && <div className="dk-vetoes"><small>Flavors you would never approve</small>{vetoes.map((v, i) => <q key={i}>{v}</q>)}</div>}</> } : null,
      { id: 'gap', title: '86 of every 100 households',
        notes: '10:10. Alex. One line of context: 25.3% share of US mouthwash in Q2 2026, up 4.5 points, number 2. Then the gap: 86 of every 100 US households have not met TheraBreath yet. Pause. Flavor is how we introduce ourselves.',
        body: <><p className="dk-k">Why flavor, why now</p><h2 className="dk-big">86 of every 100 US households <em>have not met TheraBreath yet.</em></h2><div className="dk-facts"><div><b>{GAP.category}%</b><span>buy mouthwash</span></div><div><b>{GAP.tb}%</b><span>buy TheraBreath</span></div><div><b>25.3%</b><span>share of US mouthwash, Q2 2026, up 4.5 points. Number 2.</span></div></div><p className="dk-src">{SOURCES.q2call}</p></> },
      { id: 'shelf', title: 'The shelf is a flavor shelf',
        notes: '10:14. Alex. Factual and neutral: the shelf is now a flavor shelf, one limited edition at a time. Then the turn: TheraBreath started ahead of this race (alcohol-free, dye-free, OXYD-8, a kids line on shelf). The question is what keeps it ahead.',
        body: <><p className="dk-k">The market</p><h2 className="dk-h">The shelf is now <em>a flavor shelf.</em></h2><ul className="dk-list">{MARKET.map((m) => <li key={m.what}><span>{m.when}</span><p><b>{m.who}.</b> {m.what}</p></li>)}</ul><p className="dk-src">{[...new Set(MARKET.map((m) => SOURCES[m.src].replace(/ \[CONFIRM[^\]]*\]/, '')))].join('; ')}</p></> },
      { id: 'signals', title: 'Seven signals',
        notes: '10:17 to 10:25. Alex. One line each; the proofs are in the pre-brief. Then ask the room: which three matter most for TheraBreath? Count hands and write the three down.',
        body: <><p className="dk-k">What is changing</p><h2 className="dk-h">Seven signals. <em>Which three matter most?</em></h2><ol className="dk-signals">{SIGNALS.map((x) => <li key={x.id}><span>{String(x.n).padStart(2, '0')}</span><b>{x.title}</b><p>{x.so}</p></li>)}</ol></> },
      { id: 'school', title: 'Flavor School',
        notes: '10:25 to 10:35. Ryan. Most of what we call flavor is smell; the rest is feeling. Cooling has two jobs: the first impression and the last. OXYD-8 is tough on odor-causing bacteria, which makes it a demanding home for flavor. Public chemistry only, no formula details.',
        body: <><p className="dk-k">Flavor School · with Ryan</p><h2 className="dk-h">Most of what we call flavor is smell. <em>The rest is feeling.</em></h2><div className="dk-three">{SENSES.map((x) => <div key={x.t}><b>{x.t}</b><small>{x.w}</small><p>{x.d}</p></div>)}</div><p className="dk-line">OXYD-8 is designed to be tough on odor-causing bacteria. That also makes it a demanding home for flavor. <em>We don&rsquo;t just make it taste good. We make it survive.</em></p></> },
      { id: 'platforms', title: 'Four opportunity platforms',
        notes: '10:35. Four platforms. Two carry today\'s samples; two we discuss on screen. Keep sample names for the reveal.',
        body: <><p className="dk-k">Where flavor can go</p><h2 className="dk-h">Four opportunity platforms.</h2><div className="dk-four">{PLATFORMS.map((t) => <div key={t.id} style={{ borderTopColor: t.palette[1] }}><span>0{t.n}</span><b>{t.name}</b><p>{t.promise}</p><small>{SAMPLES.some((x) => x.territory === t.id) ? 'In today’s tasting' : 'For discussion'}</small></div>)}</div></> },
      { id: 'tasting', title: 'Blind tasting',
        notes: '10:40 to 10:55. Ryan. Hand out the scorecards (print from /scorecard, one per person). A and B are in the Fresh Breath base, C and D in the Kids base. C is the mystery: write the fruit guesses before the reveal. Rinse and pause between samples. These are workshop reactions, not consumer validation.',
        body: <><p className="dk-k">The tasting</p><h2 className="dk-h">Taste first. <em>Names later.</em></h2><div className="dk-four dk-samples">{SAMPLES.map((x) => <div key={x.code}><span className="dk-code">{x.code}</span><p>{x.base}</p>{x.code === 'C' && <small>Write down the fruits you taste</small>}</div>)}</div><p className="dk-line">Score each sample on your card: <b>appeal</b>, <b>feels like TheraBreath</b>, <b>newness</b>.</p></> },
      { id: 'reveal', title: 'The reveal',
        notes: '10:55. The reveal. For C, read the fruit guesses first, then the answer. Ask for one word for each sample.',
        body: <><p className="dk-k">The reveal</p><h2 className="dk-h">What you just tasted.</h2><div className="dk-four dk-samples">{SAMPLES.map((x) => <div key={x.code}><span className="dk-code">{x.code}</span><b>{x.name}</b><p>{x.note}</p><small>{x.base}</small></div>)}</div><p className="dk-src">Development concepts made for this conversation: not products, claims or commercial formulations.</p></> },
      { id: 'first', title: 'Which platform first?',
        notes: '11:00 to 11:20. Matt facilitates. Start from the scorecards. For each platform: does it strengthen appeal with loyal users, attract new consumers, or both? Agree the two or three directions worth the next round.',
        body: <><p className="dk-k">Discussion</p><h2 className="dk-h">Which directions go first?</h2><div className="dk-goals"><div><small>Ross&rsquo;s goal, part one</small><b>Strengthen appeal with existing loyal users</b></div><div><small>Ross&rsquo;s goal, part two</small><b>Attract new consumers to the franchise</b></div></div><ul className="dk-qs">{PLATFORMS.map((t) => <li key={t.id}><b>{t.name}.</b> {t.q}</li>)}</ul></> },
      { id: 'nnl', title: 'Now, Next, Later',
        notes: '11:20 to 11:40. Type the directions into the columns as the room decides (click a column to type; the deck saves as you go). For each priority record the TFF owner, the C&D reviewer, the base, the next sample action and the evaluation date.',
        body: <><p className="dk-k">The pipeline</p><h2 className="dk-h">Now. Next. Later.</h2><div className="dk-nnl">{HORIZONS.map((h) => <label key={h.id}><b>{h.label}</b><small>{h.when}</small><textarea value={nnl[h.id] || ''} onChange={(e) => write(h.id, e.target.value)} placeholder="Type as the room decides" /></label>)}</div></> },
      { id: 'next', title: 'What happens next',
        notes: '11:40 to 11:48. Read back the owners, sample actions and dates. Dan closes: thank you for building this with us. [CONFIRM dates]',
        body: <><p className="dk-k">What happens next</p><h2 className="dk-h">Three directions. <em>Clear owners. Agreed next steps.</em></h2><ol className="dk-steps">{NEXT_STEPS.map((n, i) => <li key={n.t}><span>{i + 1}</span><div><b>{n.t}</b><p>{n.d}</p></div></li>)}</ol></> },
      { id: 'film', title: 'THE FLAVOR RACE', dark: true,
        notes: '11:48. The send-off. Lights down, sound up. Two minutes twenty-six. Nobody speaks until the rival has landed; then Dan: see you at lunch.',
        body: <FilmSlide /> },
    ];
    return list.filter(Boolean) as Slide[];
  }, [answers.length, s.survey, nnl]);

  const [i, setI] = useState(0);
  const [notes, setNotes] = useState(false);
  const [hint, setHint] = useState(true);
  const [all, setAll] = useState(false);
  const scale = useScale(1920, 1080);
  const n = slides.length;
  const go = useCallback((d: number) => setI((x) => Math.max(0, Math.min(n - 1, x + d))), [n]);

  useEffect(() => {
    setAll(new URLSearchParams(location.search).has('all'));
    const h = Number(location.hash.slice(1)); if (h > 0) setI(h - 1);
    const t = setTimeout(() => setHint(false), 5000); return () => clearTimeout(t);
  }, []);
  useEffect(() => { if (i > n - 1) setI(n - 1); }, [n, i]);
  useEffect(() => { history.replaceState(null, '', `#${i + 1}`); }, [i]);
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') { if (e.key === 'Escape') el.blur(); return; }
      if (['ArrowRight', 'PageDown', ' ', 'Enter'].includes(e.key)) { e.preventDefault(); go(1); }
      else if (['ArrowLeft', 'PageUp', 'Backspace'].includes(e.key)) { e.preventDefault(); go(-1); }
      else if (e.key === 'Home') setI(0);
      else if (e.key === 'End') setI(n - 1);
      else if (e.key === 'n' || e.key === 'N') setNotes((x) => !x);
      else if (e.key === 'f' || e.key === 'F') { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen?.(); }
    };
    addEventListener('keydown', k); return () => removeEventListener('keydown', k);
  }, [go, n]);

  if (all) return (
    <main className="dk-print">
      {slides.map((sl, j) => <div key={sl.id} className="dk-page"><SlideView sl={sl} active={false} /><span className="dk-count">{j + 1} / {n}</span></div>)}
    </main>
  );

  const sl = slides[i];
  const click = (e: React.MouseEvent) => {
    const el = e.target as HTMLElement;
    if (el.closest('textarea, video, a, button, label')) return;
    go(e.clientX < innerWidth / 3 ? -1 : 1);
  };
  return (
    <main className="dk" onClick={click}>
      <div className="dk-wrap" style={{ width: 1920 * scale, height: 1080 * scale }}>
        <div className="dk-stage" style={{ transform: `scale(${scale})` }}>
          <SlideView sl={sl} active />
          <span className="dk-count">{i + 1} / {n}</span>
        </div>
      </div>
      {notes && <aside className="dk-notes" onClick={(e) => e.stopPropagation()}><b>{i + 1}. {sl.title}</b><p>{sl.notes}</p>{i + 1 < n && <small>Next: {slides[i + 1].title}</small>}</aside>}
      {hint && <div className="dk-hint">Right arrow or click to go on · Left arrow back · F full screen · N notes</div>}
    </main>
  );
}

function SlideView({ sl, active }: { sl: Slide; active: boolean }) {
  return (
    <section className={'dk-slide' + (sl.dark ? ' dark' : '')} data-active={active ? '1' : undefined}>
      {sl.body}
      {!sl.dark && <footer className="dk-foot"><img src="/img/tff-logo.webp" alt="The Flavor Factory" /><span>× TheraBreath · Confidential</span></footer>}
    </section>
  );
}

// THE FLAVOR RACE fills the slide. It starts on the keypress that lands on it (a user gesture, so sound is allowed).
function FilmSlide() {
  const v = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const el = v.current; if (!el) return;
    const live = !!el.closest('[data-active]');
    if (live) el.play().catch(() => {});
    return () => { el.pause(); };
  }, []);
  return <video ref={v} className="dk-film" controls playsInline preload="auto" poster="/media/flavor-race-poster.jpg"><source src="/media/flavor-race.mp4" type="video/mp4" /></video>;
}

'use client';
// The presentation: one clean deck for the morning. One idea per slide, big type, Ross's four objectives as the spine.
// No phones: the tasting is scored on the paper card (/scorecard) and the room decides out loud; the concept cards, the
// white-space marks and Now, Next and Later are typed in live on the deck and saved on this laptop. Each block of the
// run of show (RUN) tags its slides with the objective it answers and who leads it.
// Keys: right, space or click to go on; left to go back; F full screen; N speaker notes.
// ?all=1 lays every slide out in order, for printing the deck to PDF. ?reset=1 clears what was typed in rehearsal.
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSession } from '@/lib/useSession';
import { useScale } from './StageApp';
import { EVENT, JULY, OBJECTIVES, ROSS_GOAL, ROSS_WORDS, SOURCES, GAP, MARKET, SIGNALS, PRIMARY_TERRITORIES as PLATFORMS, SAMPLES, HORIZONS, NEXT_STEPS, RUN, TEAM, SCIENCE, IMAGINATION, PORTFOLIO, SURVEY, ROLES, FORMATS, WHITESPACE } from '@/lib/content';

type Slide = { id: string; title: string; notes: string; block: string; dark?: boolean; body: React.ReactNode };

const SENSES = [
  { t: 'Taste', w: 'The tongue', d: 'Sweet, sour, salty, bitter, umami.' },
  { t: 'Aroma', w: 'The nose, both ways', d: 'Sniffed in, and rising from the back of the mouth as you swallow.' },
  { t: 'Feel', w: 'The trigeminal nerve', d: 'Cooling, tingling, warming. What mint really is.' },
];
// What the room types in, saved on the presenting laptop: Now, Next, Later; the concept cards; the white-space marks.
const SAVED = ['nnl', 'concepts', 'ws'] as const;
const key = (k: string) => `fof-deck-${k}-${EVENT.code}`;
function useSaved<T>(k: (typeof SAVED)[number], init: T): [T, (v: T) => void] {
  const [v, setV] = useState<T>(init);
  useEffect(() => { try { const x = localStorage.getItem(key(k)); if (x) setV(JSON.parse(x)); } catch {} }, [k]);
  return [v, (x: T) => { setV(x); try { localStorage.setItem(key(k), JSON.stringify(x)); } catch {} }];
}
const clean = (src: string) => src.replace(/ \[CONFIRM[^\]]*\]/, '');

// The concept card: a direction, then five questions. Suggestions come from the morning's own lists.
const GROWS = ['Loyal users', 'New consumers', 'Both'];
const FIELDS: { f: string; l: string; opts: string[] }[] = [
  { f: 'dir', l: 'Direction', opts: [...SAMPLES.map((x) => `${x.code}. ${x.name}`), ...PLATFORMS.map((t) => t.name)] },
  { f: 'who', l: 'For', opts: SURVEY.consumer.options },
  { f: 'when', l: 'When', opts: SURVEY.moment.options },
  { f: 'role', l: 'Role', opts: ROLES.map((r) => r.id) },
  { f: 'format', l: 'Format', opts: FORMATS },
  { f: 'grows', l: 'Grows', opts: GROWS },
];
const FORMAT_ORDER = ['Rinse', 'Toothpaste', 'Kids', 'Lozenge', 'Gum', 'Sachet'];
const isMint = (flavor: string) => /mint/i.test(flavor);

function topOf(xs: (string | undefined)[]) {
  const n: Record<string, number> = {};
  xs.forEach((x) => { if (x) n[x] = (n[x] || 0) + 1; });
  const best = Object.entries(n).sort((a, b) => b[1] - a[1])[0];
  return best ? { v: best[0], n: best[1] } : null;
}

export default function DeckApp() {
  const { state: s } = useSession(EVENT.code, { interval: 15000 });
  const answers = Object.values(s.survey || {});
  const [nnl, setNnl] = useSaved<Record<string, string>>('nnl', {});
  const [concepts, setConcepts] = useSaved<Record<string, string>>('concepts', {});
  const [ws, setWs] = useSaved<string[]>('ws', []);
  const write = (id: string, v: string) => setNnl({ ...nnl, [id]: v });
  const type = (id: string, v: string) => setConcepts({ ...concepts, [id]: v });
  const mark = (cell: string) => setWs(ws.includes(cell) ? ws.filter((x) => x !== cell) : [...ws, cell]);

  const slides = useMemo<Slide[]>(() => {
    const consumer = topOf(answers.map((a) => a.consumer)), moment = topOf(answers.map((a) => a.moment));
    const vetoes = answers.map((a) => (a.veto || '').trim()).filter(Boolean).slice(0, 4);
    const mint = PORTFOLIO.filter((v) => isMint(v.flavor)).length;
    const names = [1, 2, 3].map((c) => (concepts[`${c}-name`] || '').trim()).filter(Boolean);
    const count = (k: 'consumer' | 'moment', v: string) => answers.filter((a) => a[k] === v).length;
    const list: (Slide | null)[] = [
      { id: 'title', block: 'welcome', title: 'The Future of Freshness', dark: true,
        notes: '10:00. Dan welcomes the room and thanks Ross for the invitation. Two hours, and by noon a roadmap with owners and dates.',
        body: <div className="dk-center"><p className="dk-k">TheraBreath × The Flavor Factory</p><h1 className="dk-hero">The Future<br /><em>of Freshness</em></h1><p className="dk-sub">{EVENT.date} · {EVENT.room} room, Princeton</p></div> },
      { id: 'team', block: 'welcome', title: 'Who we are and how we work',
        notes: '10:01. Dan. Ross wrote that in July there was no chance to explore our innovation capabilities in depth. This is the short version; the morning is the long one. Flavor is science (how a flavor survives the bottle) and imagination (why someone wants it). Then the four of us, and what each one leads today.',
        body: <><p className="dk-k">Who we are · how we work</p><h2 className="dk-h">Flavor is science <em>and imagination.</em></h2><div className="dk-sci"><div><small>Science</small><p>{SCIENCE.map((x) => <span key={x}>{x}</span>)}</p></div><div><small>Imagination</small><p>{IMAGINATION.map((x) => <span key={x}>{x}</span>)}</p></div></div><div className="dk-team">{TEAM.map((t) => <div key={t.name}><b>{t.name}</b>{t.title && <small>{t.title}</small>}<p>{t.today}</p></div>)}</div><p className="dk-line">You asked to see our &ldquo;{ROSS_WORDS.capabilities}.&rdquo; <em>By noon you will have seen each one at work.</em></p></> },
      { id: 'july', block: 'welcome', title: 'From July to today',
        notes: '10:04. Thirty seconds. In July you came to Norco: resiliency, innovation, operations, partnership. Today is the fifth word: growth.',
        body: <><p className="dk-k">From July to today</p><h2 className="dk-h">In July, you came to Norco.<br /><em>Today is about growth.</em></h2><div className="dk-words">{JULY.map((w) => <span key={w} className={w === 'Growth' ? 'on' : ''}>{w}</span>)}</div></> },
      { id: 'brief', block: 'welcome', title: 'Your four objectives',
        notes: '10:05. Ross\'s four objectives, word for word, and his goal. The morning answers each one in turn.',
        body: <><p className="dk-k">Your brief</p><h2 className="dk-h">You asked for four things.</h2><ol className="dk-obj">{OBJECTIVES.map((o) => <li key={o.n}><span>{o.n}</span><p><b>{o.short}.</b> {o.ask}</p></li>)}</ol><p className="dk-goal">&ldquo;New flavor experiences that both <mark>{ROSS_GOAL.loyal}</mark> and <mark>{ROSS_GOAL.fresh.replace(/\.$/, '')}</mark>.&rdquo;</p><p className="dk-src">{SOURCES[ROSS_GOAL.src]}</p></> },
      { id: 'agenda', block: 'welcome', title: 'The morning',
        notes: '10:07. The morning on one slide. Point to the objective numbers: each block answers one of Ross\'s four, in order. Name who leads each part.',
        body: <><p className="dk-k">The morning</p><h2 className="dk-h">Two hours. <em>Your four objectives, in order.</em></h2><ol className="dk-run">{RUN.map((b) => <li key={b.id}><span>{b.t}</span><p>{b.title}</p><i>{b.obj ? `Objective ${b.obj}` : ''}</i><b>{b.lead}</b></li>)}</ol></> },
      answers.length ? { id: 'told', block: 'welcome', title: 'You told us',
        notes: '10:08. The pre-brief homework. Read the top consumer and the missing moment, then have some fun with the vetoes. No names on screen.',
        body: <><p className="dk-k">Your homework · {answers.length} {answers.length === 1 ? 'answer' : 'answers'}</p><h2 className="dk-h">You told us.</h2><div className="dk-told">
          {consumer && <div><small>The consumer you most want to win next</small><b>{consumer.v}</b></div>}
          {moment && <div><small>The moment TheraBreath is missing</small><b>{moment.v}</b></div>}
        </div>{vetoes.length > 0 && <div className="dk-vetoes"><small>Flavors you would never approve</small>{vetoes.map((v, i) => <q key={i}>{v}</q>)}</div>}</> } : null,
      { id: 'portfolio', block: 'market', title: 'The portfolio today',
        notes: `10:10. Alex. The starting line. ${PORTFOLIO.length} flavors across six formats, and ${mint} of them are mint. TheraBreath has mastered mint. Ross asked for opportunities beyond the current portfolio: the next chapter is everything mint makes possible.`,
        body: <><p className="dk-k">The portfolio today · {PORTFOLIO.length} flavors across {FORMAT_ORDER.length} formats</p><h2 className="dk-h">{mint} of {PORTFOLIO.length} are mint. <em>The next chapter is everything mint makes possible.</em></h2><div className="dk-pf">{FORMAT_ORDER.map((f) => <div key={f} className={f === 'Rinse' ? 'wide' : ''}><small>{f}</small><ul>{PORTFOLIO.filter((v) => v.format === f).map((v, j) => <li key={j} className={isMint(v.flavor) ? '' : 'other'}>{v.flavor}<span>{v.line}</span></li>)}</ul></div>)}</div><p className="dk-src">{clean(SOURCES.listings)}</p></> },
      { id: 'gap', block: 'market', title: '86 of every 100 households',
        notes: '10:13. Alex. One line of context: 25.3% share of US mouthwash in Q2 2026, up 4.5 points, number 2. Then the gap: 86 of every 100 US households have not met TheraBreath yet. Pause. Flavor is how we introduce ourselves.',
        body: <><p className="dk-k">Why flavor, why now</p><h2 className="dk-big">86 of every 100 US households <em>have not met TheraBreath yet.</em></h2><div className="dk-facts"><div><b>{GAP.category}%</b><span>buy mouthwash</span></div><div><b>{GAP.tb}%</b><span>buy TheraBreath</span></div><div><b>25.3%</b><span>share of US mouthwash, Q2 2026, up 4.5 points. Number 2.</span></div></div><p className="dk-src">{SOURCES.q2call}</p></> },
      { id: 'shelf', block: 'market', title: 'The shelf is a flavor shelf',
        notes: '10:15. Alex. Factual and neutral: the shelf is now a flavor shelf, one limited edition at a time. Then the turn: TheraBreath started ahead of this race (alcohol-free, dye-free, OXYD-8, a kids line on shelf). The question is what keeps it ahead.',
        body: <><p className="dk-k">The market</p><h2 className="dk-h">The shelf is now <em>a flavor shelf.</em></h2><ul className="dk-list">{MARKET.map((m) => <li key={m.what}><span>{m.when}</span><p><b>{m.who}.</b> {m.what}</p></li>)}</ul><p className="dk-src">{[...new Set(MARKET.map((m) => clean(SOURCES[m.src])))].join('; ')}</p></> },
      { id: 'signals', block: 'market', title: 'Seven signals',
        notes: '10:18 to 10:25. Alex. One line each; the proofs are in the pre-brief. Then ask the room: which three matter most for TheraBreath? Count hands and write the three down. Hand to Ryan.',
        body: <><p className="dk-k">What is changing</p><h2 className="dk-h">Seven signals. <em>Which three matter most?</em></h2><ol className="dk-signals">{SIGNALS.map((x) => <li key={x.id}><span>{String(x.n).padStart(2, '0')}</span><b>{x.title}</b><p>{x.so}</p></li>)}</ol></> },
      { id: 'school', block: 'school', title: 'Flavor School',
        notes: '10:25 to 10:33. Ryan. Most of what we call flavor is smell; the rest is feeling. Cooling has two jobs: the first impression and the last. OXYD-8 is tough on odor-causing bacteria, which makes it a demanding home for flavor. Public chemistry only, no formula details.',
        body: <><p className="dk-k">Flavor School</p><h2 className="dk-h">Most of what we call flavor is smell. <em>The rest is feeling.</em></h2><div className="dk-three">{SENSES.map((x) => <div key={x.t}><b>{x.t}</b><small>{x.w}</small><p>{x.d}</p></div>)}</div><p className="dk-line">OXYD-8 is designed to be tough on odor-causing bacteria. That also makes it a demanding home for flavor. <em>We don&rsquo;t just make it taste good. We make it survive.</em></p></> },
      { id: 'platforms', block: 'school', title: 'Four opportunity platforms',
        notes: '10:33 to 10:40. Ryan. Four platforms. Two carry today\'s samples; two we discuss on screen. Keep sample names for the reveal. Close on the difference: competitors add flavor one limited edition at a time; these start where TheraBreath is already ahead.',
        body: <><p className="dk-k">Where flavor can go</p><h2 className="dk-h">Four opportunity platforms.</h2><div className="dk-four">{PLATFORMS.map((t) => <div key={t.id} style={{ borderTopColor: t.palette[1] }}><span>0{t.n}</span><b>{t.name}</b><p>{t.promise}</p><small>{SAMPLES.some((x) => x.territory === t.id) ? 'In today’s tasting' : 'For discussion'}</small></div>)}</div><p className="dk-line">The shelf adds flavor one limited edition at a time. These start where TheraBreath is already ahead: <em>alcohol-free, dye-free, built around OXYD-8.</em></p></> },
      { id: 'tasting', block: 'tasting', title: 'Blind tasting',
        notes: '10:40 to 10:55. Ryan. Hand out the scorecards (print from /scorecard, one per person). A and B are in the Fresh Breath base, C and D in the Kids base. D is the Mystery Flavor, tasted last: write the fruit guesses before the reveal. Rinse and pause between samples. These are workshop reactions, not consumer validation.',
        body: <><p className="dk-k">The tasting</p><h2 className="dk-h">Taste first. <em>Names later.</em></h2><div className="dk-four dk-samples">{SAMPLES.map((x) => <div key={x.code}><span className="dk-code">{x.code}</span><p>{x.base}</p>{x.mystery && <small>Write down the fruits you taste</small>}</div>)}</div><p className="dk-line">Score each sample on your card: <b>appeal</b>, <b>feels like TheraBreath</b>, <b>newness</b>.</p></> },
      { id: 'reveal', block: 'tasting', title: 'The reveal',
        notes: '10:55 to 11:00. Ryan. For D, the Mystery Flavor, read the fruit guesses first, then the answer. Ask for one word for each sample. Hand to Matt.',
        body: <><p className="dk-k">The reveal</p><h2 className="dk-h">What you just tasted.</h2><div className="dk-four dk-samples">{SAMPLES.map((x) => <div key={x.code}><span className="dk-code">{x.code}</span><b>{x.name}</b><p>{x.note}</p><small>{x.base}</small></div>)}</div><p className="dk-src">Development concepts made for this conversation: not products, claims or commercial formulations.</p></> },
      { id: 'recipe', block: 'concepts', title: 'Five questions',
        notes: '11:00 to 11:05. Matt. Start from the scorecards: which two or three samples or platforms earned a next round? Each one becomes a concept by answering five questions. The last one is Ross\'s goal: does it strengthen appeal with loyal users, attract new consumers, or both?',
        body: <><p className="dk-k">From samples to concepts</p><h2 className="dk-h">Five questions <em>turn a direction into a concept.</em></h2><ol className="dk-recipe">
          <li><b>Start from</b><p>{SAMPLES.map((x) => <span key={x.code}>{x.code}. {x.name}</span>)}{PLATFORMS.map((t) => <span key={t.id} className="alt">{t.name}</span>)}</p></li>
          <li><b><i>1</i>Who is it for?</b><p>{SURVEY.consumer.options.map((x) => <span key={x}>{x}</span>)}</p></li>
          <li><b><i>2</i>When?</b><p>{SURVEY.moment.options.map((x) => <span key={x}>{x}</span>)}</p></li>
          <li><b><i>3</i>What role?</b><p>{ROLES.map((r) => <span key={r.id}><strong>{r.id}</strong> {r.short}</span>)}</p></li>
          <li><b><i>4</i>What format?</b><p>{FORMATS.map((x) => <span key={x}>{x}</span>)}</p></li>
          <li><b><i>5</i>What does it grow?</b><p><span><strong>Loyal users</strong> {ROSS_GOAL.loyal}</span><span><strong>New consumers</strong> {ROSS_GOAL.fresh.replace(/\.$/, '')}</span><span><strong>Both</strong></span></p></li>
        </ol></> },
      { id: 'concepts', block: 'concepts', title: 'Three concepts',
        notes: '11:05 to 11:20. Matt. Type each concept into a card as the room decides: a name, the direction, then the five answers (each box suggests the morning\'s own options). Three is the ceiling, not the target. The deck saves as you type.',
        body: <><p className="dk-k">Concepts</p><h2 className="dk-h">Three concepts. <em>Built by this room.</em></h2><div className="dk-cards">{[1, 2, 3].map((c) => <div key={c}><span>Concept {c}</span><input className="dk-name" value={concepts[`${c}-name`] || ''} onChange={(e) => type(`${c}-name`, e.target.value)} placeholder="Name it" aria-label={`Concept ${c} name`} />{FIELDS.map((x) => <label key={x.f}><small>{x.l}</small><input list={`dk-${x.f}`} value={concepts[`${c}-${x.f}`] || ''} onChange={(e) => type(`${c}-${x.f}`, e.target.value)} /></label>)}</div>)}</div>{FIELDS.map((x) => <datalist key={x.f} id={`dk-${x.f}`}>{x.opts.map((o) => <option key={o} value={o} />)}</datalist>)}</> },
      { id: 'whitespace', block: 'pipeline', title: 'White space',
        notes: '11:20 to 11:28. Alex. The grid: eight moments of the day across, the consumers from the pre-brief down. Shaded is our read of where TheraBreath is today, there to be challenged: the sink, morning and night, and the dry mouth lozenge on the go. Everything else is open. Click a cell to mark where each concept lands. Then Matt takes the board.',
        body: <><p className="dk-k">White space · our read, to challenge</p><h2 className="dk-h">The day happens <em>between the sinks.</em></h2><div className="dk-ws" style={{ ['--cols' as any]: WHITESPACE.moments.length }}>
          <div />{WHITESPACE.moments.map((m) => <div key={m} className={'dk-ws-m' + (moment?.v === m ? ' top' : '')}>{m}{count('moment', m) > 0 && <b>{count('moment', m)}</b>}</div>)}
          {WHITESPACE.segments.map((sg) => <Fragment key={sg}><div className={'dk-ws-s' + (consumer?.v === sg ? ' top' : '')}>{sg}{count('consumer', sg) > 0 && <b>{count('consumer', sg)}</b>}</div>{WHITESPACE.moments.map((m) => { const cell = `${sg}|${m}`; return <button key={m} className={'dk-ws-c' + (WHITESPACE.today(sg, m) ? ' today' : '') + (ws.includes(cell) ? ' on' : '')} onClick={() => mark(cell)} aria-label={`${sg}, ${m}`} />; })}</Fragment>)}
        </div><div className="dk-ws-key"><span><i className="today" />{WHITESPACE.read}</span><span><i className="on" />Where today&rsquo;s concepts land</span>{answers.length > 0 && <span><b>n</b>Pre-brief answers from this room</span>}</div></> },
      { id: 'nnl', block: 'pipeline', title: 'Now, Next, Later',
        notes: '11:28 to 11:40. Matt. Place each concept and platform in Now, Next or Later, typing as the room decides (click a column to type; one line per direction). For each, record the TFF owner, the C&D reviewer, the base and the next sample action. Hand to Dan.',
        body: <><p className="dk-k">The pipeline</p><h2 className="dk-h">Now. Next. Later.</h2>{names.length > 0 && <p className="dk-names">Your concepts: {names.map((x) => <b key={x}>{x}</b>)}</p>}<div className="dk-nnl">{HORIZONS.map((h) => <label key={h.id}><b>{h.label}</b><small>{h.when}</small><textarea value={nnl[h.id] || ''} onChange={(e) => write(h.id, e.target.value)} placeholder="Type as the room decides" /></label>)}</div></> },
      { id: 'roadmap', block: 'close', title: 'Our innovation roadmap',
        notes: '11:40 to 11:44. Dan. Read the roadmap back, column by column, with each owner. This is what Ross asked for at the end of his invitation.',
        body: <><p className="dk-k">Our innovation roadmap</p><h2 className="dk-h">The roadmap <em>we built together.</em></h2><div className="dk-road">{HORIZONS.map((h) => { const items = (nnl[h.id] || '').split('\n').map((x) => x.trim()).filter(Boolean); return <div key={h.id}><b>{h.label}</b><small>{h.when}</small>{items.length ? <ul>{items.map((x, j) => <li key={j}>{x}</li>)}</ul> : <p>Read back from the board</p>}</div>; })}</div><p className="dk-goal">&ldquo;&hellip;{ROSS_WORDS.roadmap}.&rdquo;</p><p className="dk-src">{SOURCES.ross}</p></> },
      { id: 'next', block: 'close', title: 'What happens next',
        notes: '11:44 to 11:48. Dan. The three next steps, with dates. Then: thank you for building this with us. [CONFIRM dates]',
        body: <><p className="dk-k">What happens next</p><h2 className="dk-h">Three directions. <em>Clear owners. Agreed next steps.</em></h2><ol className="dk-steps">{NEXT_STEPS.map((n, i) => <li key={n.t}><span>{i + 1}</span><div><b>{n.t}</b><p>{n.d}</p></div></li>)}</ol></> },
      { id: 'film', block: 'close', title: 'THE FLAVOR RACE', dark: true,
        notes: '11:48. The send-off. Lights down, sound up. Two minutes twenty-six. Nobody speaks until the rival has landed; then Dan: see you at lunch.',
        body: <FilmSlide /> },
    ];
    return list.filter(Boolean) as Slide[];
  }, [answers.length, s.survey, nnl, concepts, ws]);

  const [i, setI] = useState(0);
  const [notes, setNotes] = useState(false);
  const [hint, setHint] = useState(true);
  const [all, setAll] = useState(false);
  const scale = useScale(1920, 1080);
  const n = slides.length;
  const go = useCallback((d: number) => setI((x) => Math.max(0, Math.min(n - 1, x + d))), [n]);

  useEffect(() => {
    const q = new URLSearchParams(location.search);
    if (q.has('reset')) { SAVED.forEach((k) => { try { localStorage.removeItem(key(k)); } catch {} }); location.replace(location.pathname); return; }
    setAll(q.has('all'));
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
    if (el.closest('textarea, input, video, a, button, label')) return;
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
  const blk = RUN.find((b) => b.id === sl.block);
  return (
    <section className={'dk-slide' + (sl.dark ? ' dark' : '')} data-active={active ? '1' : undefined}>
      {sl.body}
      {!sl.dark && blk && <div className="dk-tag">{blk.obj && <span>Objective {blk.obj}</span>}<b>{blk.lead}</b></div>}
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

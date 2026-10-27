'use client';
// The presentation: one clean deck for the morning. One idea per slide, big type, Ross's four objectives as the spine.
// No phones: the tasting is scored on the paper card (/scorecard) and the room decides out loud; the concept cards, the
// white-space marks and Now, Next and Later are typed in live on the deck and saved on this laptop. Each block of the
// run of show (RUN) tags its slides with the objective it answers.
// Keys: right, space or click to go on; left to go back; F full screen; N speaker notes.
// ?all=1 lays every slide out in order, for printing the deck to PDF; ?all=1&notes=1 is the presenter edition (each
// slide with its lead, time and speaker notes, after a cover with the run of show). ?reset=1 clears rehearsal input.
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSession } from '@/lib/useSession';
import { useScale } from './StageApp';
import { EVENT, JULY, OBJECTIVES, TOPICS, ROSS_GOAL, ROSS_WORDS, SOURCES, GAP, MARKET, SIGNALS, PRIMARY_TERRITORIES as PLATFORMS, SAMPLES, HORIZONS, NEXT_STEPS, RUN, TEAM, SCIENCE, IMAGINATION, PORTFOLIO, SURVEY, ROLES, FORMATS, WHITESPACE } from '@/lib/content';

type Slide = { id: string; title: string; notes: string[]; block: string; dark?: boolean; body: React.ReactNode };

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
        notes: ['Welcome, and thank you to Ross for the invitation.', 'Two hours, built around your four objectives.', 'By noon: concepts, a roadmap, and owners and dates.'],
        body: <div className="dk-center"><p className="dk-k">TheraBreath × The Flavor Factory</p><h1 className="dk-hero">The Future<br /><em>of Freshness</em></h1><p className="dk-sub">{EVENT.date} · {EVENT.room} room, Princeton</p></div> },
      { id: 'team', block: 'welcome', title: 'Who we are and how we work',
        notes: ['Ross asked to see our innovation capabilities in depth; this morning is that, in practice.', 'Flavor is science (how a flavor survives the bottle) and imagination (why someone wants it).', 'Introduce the four of us.'],
        body: <><p className="dk-k">Who we are · how we work</p><h2 className="dk-h">Flavor is science <em>and imagination.</em></h2><div className="dk-sci"><div><small>Science</small><p>{SCIENCE.map((x) => <span key={x}>{x}</span>)}</p></div><div><small>Imagination</small><p>{IMAGINATION.map((x) => <span key={x}>{x}</span>)}</p></div></div><div className="dk-team">{TEAM.map((t) => <div key={t.name}><b>{t.name}</b>{t.title && <small>{t.title}</small>}</div>)}</div><p className="dk-line">You asked to see our &ldquo;{ROSS_WORDS.capabilities}.&rdquo; <em>By noon you will have seen each one at work.</em></p></> },
      { id: 'july', block: 'welcome', title: 'From July to today',
        notes: ['In July you came to Norco: resiliency, innovation, operations, partnership.', 'Today is the fifth word: growth.'],
        body: <><p className="dk-k">From July to today</p><h2 className="dk-h">In July, you came to Norco.<br /><em>Today is about growth.</em></h2><div className="dk-words">{JULY.map((w) => <span key={w} className={w === 'Growth' ? 'on' : ''}>{w}</span>)}</div></> },
      { id: 'brief', block: 'welcome', title: 'Your four objectives',
        notes: ['Ross\'s four objectives, in his words.', 'His goal: strengthen appeal with loyal users and attract new consumers.', 'Each part of the morning answers one objective.'],
        body: <><p className="dk-k">Your brief</p><h2 className="dk-h">You asked for four things.</h2><ol className="dk-obj">{OBJECTIVES.map((o) => <li key={o.n}><span>{o.n}</span><p><b>{o.short}.</b> {o.ask}</p></li>)}</ol><p className="dk-goal">&ldquo;New flavor experiences that both <mark>{ROSS_GOAL.loyal}</mark> and <mark>{ROSS_GOAL.fresh.replace(/\.$/, '')}</mark>.&rdquo;</p><p className="dk-src">{SOURCES[ROSS_GOAL.src]}</p></> },
      { id: 'agenda', block: 'welcome', title: 'The morning',
        notes: ['Two hours, four objectives, in order.', 'A conversation, not a presentation: questions are welcome throughout.'],
        body: <><p className="dk-k">The morning</p><h2 className="dk-h">Two hours. <em>Your four objectives, in order.</em></h2><ol className="dk-run">{RUN.map((b) => <li key={b.id}><span>{b.t}</span><p>{b.title}</p><i>{b.obj ? `Objective ${b.obj}` : ''}</i></li>)}</ol></> },
      answers.length ? { id: 'told', block: 'welcome', title: 'You told us',
        notes: ['The consumer the room most wants to win, and the moment TheraBreath is missing.', 'Have some fun with the vetoes. No names on screen.'],
        body: <><p className="dk-k">Your homework · {answers.length} {answers.length === 1 ? 'answer' : 'answers'}</p><h2 className="dk-h">You told us.</h2><div className="dk-told">
          {consumer && <div><small>The consumer you most want to win next</small><b>{consumer.v}</b></div>}
          {moment && <div><small>The moment TheraBreath is missing</small><b>{moment.v}</b></div>}
        </div>{vetoes.length > 0 && <div className="dk-vetoes"><small>Flavors you would never approve</small>{vetoes.map((v, i) => <q key={i}>{v}</q>)}</div>}</> } : null,
      { id: 'open-01', block: 'market', title: 'Objective 01: ' + TOPICS[0].title.replace(/\.$/, ''), notes: ['Ross\'s words first, then the talking points.', 'Open the questions to the room; the next slides are the evidence.'], body: <Opener i={0} /> },
      { id: 'portfolio', block: 'market', title: 'The portfolio today',
        notes: [`${PORTFOLIO.length} flavors across six formats; ${mint} of them are mint.`, 'TheraBreath has mastered mint.', 'Ross asked for opportunities beyond the current portfolio: the next chapter is everything mint makes possible.'],
        body: <><p className="dk-k">The portfolio today · {PORTFOLIO.length} flavors across {FORMAT_ORDER.length} formats</p><h2 className="dk-h">{mint} of {PORTFOLIO.length} are mint. <em>The next chapter is everything mint makes possible.</em></h2><div className="dk-pf">{FORMAT_ORDER.map((f) => <div key={f} className={f === 'Rinse' ? 'wide' : ''}><small>{f}</small><ul>{PORTFOLIO.filter((v) => v.format === f).map((v, j) => <li key={j} className={isMint(v.flavor) ? '' : 'other'}>{v.flavor}<span>{v.line}</span></li>)}</ul></div>)}</div><p className="dk-src">{clean(SOURCES.listings)}</p></> },
      { id: 'gap', block: 'market', title: '86 of every 100 households',
        notes: ['25.3% share of US mouthwash in Q2 2026, up 4.5 points: number 2.', '86 of every 100 US households have not met TheraBreath yet.', 'Flavor is how TheraBreath introduces itself.'],
        body: <><p className="dk-k">Why flavor, why now</p><h2 className="dk-big">86 of every 100 US households <em>have not met TheraBreath yet.</em></h2><div className="dk-facts"><div><b>{GAP.category}%</b><span>buy mouthwash</span></div><div><b>{GAP.tb}%</b><span>buy TheraBreath</span></div><div><b>25.3%</b><span>share of US mouthwash, Q2 2026, up 4.5 points. Number 2.</span></div></div><p className="dk-src">{SOURCES.q2call}</p></> },
      { id: 'shelf', block: 'market', title: 'The shelf is a flavor shelf',
        notes: ['Factual and neutral: the shelf is now a flavor shelf, one limited edition at a time.', 'TheraBreath started ahead of this race: alcohol-free, dye-free, OXYD-8, a kids line on shelf.', 'For the room: what keeps it ahead?'],
        body: <><p className="dk-k">The market</p><h2 className="dk-h">The shelf is now <em>a flavor shelf.</em></h2><ul className="dk-list">{MARKET.map((m) => <li key={m.what}><span>{m.when}</span><p><b>{m.who}.</b> {m.what}</p></li>)}</ul><p className="dk-src">{[...new Set(MARKET.map((m) => clean(SOURCES[m.src])))].join('; ')}</p></> },
      { id: 'signals', block: 'market', title: 'Seven signals',
        notes: ['One line each; the proofs are in the pre-brief.', 'For the room: which three matter most for TheraBreath? Write them down.'],
        body: <><p className="dk-k">What is changing</p><h2 className="dk-h">Seven signals. <em>Which three matter most?</em></h2><ol className="dk-signals">{SIGNALS.map((x) => <li key={x.id}><span>{String(x.n).padStart(2, '0')}</span><b>{x.title}</b><p>{x.so}</p></li>)}</ol></> },
      { id: 'open-02', block: 'school', title: 'Objective 02: ' + TOPICS[1].title.replace(/\.$/, ''), notes: ['Ross\'s words first, then the talking points.', 'Open the questions to the room; the next slides are the evidence.'], body: <Opener i={1} /> },
      { id: 'school', block: 'school', title: 'Flavor School',
        notes: ['Most of what we call flavor is smell; the rest is feeling.', 'Cooling has two jobs: the first impression and the last.', 'OXYD-8 is tough on odor-causing bacteria, which makes it a demanding home for flavor.', 'Public chemistry only, no formula details.'],
        body: <><p className="dk-k">Flavor School</p><h2 className="dk-h">Most of what we call flavor is smell. <em>The rest is feeling.</em></h2><div className="dk-three">{SENSES.map((x) => <div key={x.t}><b>{x.t}</b><small>{x.w}</small><p>{x.d}</p></div>)}</div><p className="dk-line">OXYD-8 is designed to be tough on odor-causing bacteria. That also makes it a demanding home for flavor. <em>We don&rsquo;t just make it taste good. We make it survive.</em></p></> },
      { id: 'platforms', block: 'school', title: 'Four opportunity platforms',
        notes: ['Two platforms carry today\'s samples; two are for discussion.', 'Keep the sample names for the reveal.', 'The difference: competitors add flavor one limited edition at a time; these start where TheraBreath is already ahead.'],
        body: <><p className="dk-k">Where flavor can go</p><h2 className="dk-h">Four opportunity platforms.</h2><div className="dk-four">{PLATFORMS.map((t) => <div key={t.id} style={{ borderTopColor: t.palette[1] }}><span>0{t.n}</span><b>{t.name}</b><p>{t.promise}</p><small>{SAMPLES.some((x) => x.territory === t.id) ? 'In today’s tasting' : 'For discussion'}</small></div>)}</div><p className="dk-line">The shelf adds flavor one limited edition at a time. These start where TheraBreath is already ahead: <em>alcohol-free, dye-free, built around OXYD-8.</em></p></> },
      { id: 'tasting', block: 'tasting', title: 'Blind tasting',
        notes: ['Scorecards out, one per person (print from /scorecard).', 'A and B in the Fresh Breath base, C and D in the Kids base.', 'D is the Mystery Flavor, tasted last: fruit guesses before the reveal.', 'Rinse and pause between samples. Workshop reactions, not consumer validation.'],
        body: <><p className="dk-k">The tasting</p><h2 className="dk-h">Taste first. <em>Names later.</em></h2><div className="dk-four dk-samples">{SAMPLES.map((x) => <div key={x.code}><span className="dk-code">{x.code}</span><p>{x.base}</p>{x.mystery && <small>Write down the fruits you taste</small>}</div>)}</div><p className="dk-line">Score each sample on your card: <b>appeal</b>, <b>feels like TheraBreath</b>, <b>newness</b>.</p></> },
      { id: 'reveal', block: 'tasting', title: 'The reveal',
        notes: ['For D, read the fruit guesses first, then the answer.', 'One word for each sample from the room.'],
        body: <><p className="dk-k">The reveal</p><h2 className="dk-h">What you just tasted.</h2><div className="dk-four dk-samples">{SAMPLES.map((x) => <div key={x.code}><span className="dk-code">{x.code}</span><b>{x.name}</b><p>{x.note}</p><small>{x.base}</small></div>)}</div><p className="dk-src">Development concepts made for this conversation: not products, claims or commercial formulations.</p></> },
      { id: 'open-03', block: 'concepts', title: 'Objective 03: ' + TOPICS[2].title.replace(/\.$/, ''), notes: ['Ross\'s words first, then the talking points.', 'Open the questions to the room; the next slides are the evidence.'], body: <Opener i={2} /> },
      { id: 'recipe', block: 'concepts', title: 'Five questions',
        notes: ['From the scorecards: which samples or platforms earned a next round?', 'Each becomes a concept by answering five questions.', 'The last is Ross\'s goal: loyal users, new consumers, or both?'],
        body: <><p className="dk-k">From samples to concepts</p><h2 className="dk-h">Five questions <em>turn a direction into a concept.</em></h2><ol className="dk-recipe">
          <li><b>Start from</b><p>{SAMPLES.map((x) => <span key={x.code}>{x.code}. {x.name}</span>)}{PLATFORMS.map((t) => <span key={t.id} className="alt">{t.name}</span>)}</p></li>
          <li><b><i>1</i>Who is it for?</b><p>{SURVEY.consumer.options.map((x) => <span key={x}>{x}</span>)}</p></li>
          <li><b><i>2</i>When?</b><p>{SURVEY.moment.options.map((x) => <span key={x}>{x}</span>)}</p></li>
          <li><b><i>3</i>What role?</b><p>{ROLES.map((r) => <span key={r.id}><strong>{r.id}</strong> {r.short}</span>)}</p></li>
          <li><b><i>4</i>What format?</b><p>{FORMATS.map((x) => <span key={x}>{x}</span>)}</p></li>
          <li><b><i>5</i>What does it grow?</b><p><span><strong>Loyal users</strong> {ROSS_GOAL.loyal}</span><span><strong>New consumers</strong> {ROSS_GOAL.fresh.replace(/\.$/, '')}</span><span><strong>Both</strong></span></p></li>
        </ol></> },
      { id: 'concepts', block: 'concepts', title: 'Three concepts',
        notes: ['Type each concept into a card as the room decides: a name, the direction, then the five answers.', 'Each box suggests the morning\'s own options; the deck saves as you type.', 'Three is the ceiling, not the target.'],
        body: <><p className="dk-k">Concepts</p><h2 className="dk-h">Three concepts. <em>Built by this room.</em></h2><div className="dk-cards">{[1, 2, 3].map((c) => <div key={c}><span>Concept {c}</span><input className="dk-name" value={concepts[`${c}-name`] || ''} onChange={(e) => type(`${c}-name`, e.target.value)} placeholder="Name it" aria-label={`Concept ${c} name`} />{FIELDS.map((x) => <label key={x.f}><small>{x.l}</small><input list={`dk-${x.f}`} value={concepts[`${c}-${x.f}`] || ''} onChange={(e) => type(`${c}-${x.f}`, e.target.value)} /></label>)}</div>)}</div>{FIELDS.map((x) => <datalist key={x.f} id={`dk-${x.f}`}>{x.opts.map((o) => <option key={o} value={o} />)}</datalist>)}</> },
      { id: 'open-04', block: 'pipeline', title: 'Objective 04: ' + TOPICS[3].title.replace(/\.$/, ''), notes: ['Ross\'s words first, then the talking points.', 'Open the questions to the room; the next slides are the evidence.'], body: <Opener i={3} /> },
      { id: 'whitespace', block: 'pipeline', title: 'White space',
        notes: ['Eight moments of the day across, the consumers from the pre-brief down.', 'Shaded is our read of where TheraBreath is today, there to be challenged: the sink, morning and night, and the dry mouth lozenge on the go.', 'Click a cell to mark where each concept lands.'],
        body: <><p className="dk-k">White space · our read, to challenge</p><h2 className="dk-h">The day happens <em>between the sinks.</em></h2><div className="dk-ws" style={{ ['--cols' as any]: WHITESPACE.moments.length }}>
          <div />{WHITESPACE.moments.map((m) => <div key={m} className={'dk-ws-m' + (moment?.v === m ? ' top' : '')}>{m}{count('moment', m) > 0 && <b>{count('moment', m)}</b>}</div>)}
          {WHITESPACE.segments.map((sg) => <Fragment key={sg}><div className={'dk-ws-s' + (consumer?.v === sg ? ' top' : '')}>{sg}{count('consumer', sg) > 0 && <b>{count('consumer', sg)}</b>}</div>{WHITESPACE.moments.map((m) => { const cell = `${sg}|${m}`; return <button key={m} className={'dk-ws-c' + (WHITESPACE.today(sg, m) ? ' today' : '') + (ws.includes(cell) ? ' on' : '')} onClick={() => mark(cell)} aria-label={`${sg}, ${m}`} />; })}</Fragment>)}
        </div><div className="dk-ws-key"><span><i className="today" />{WHITESPACE.read}</span><span><i className="on" />Where today&rsquo;s concepts land</span>{answers.length > 0 && <span><b>n</b>Pre-brief answers from this room</span>}</div></> },
      { id: 'nnl', block: 'pipeline', title: 'Now, Next, Later',
        notes: ['Place each concept and platform in Now, Next or Later as the room decides (click a column; one line per direction).', 'For each: a TFF owner, a C&D reviewer, the base and the next sample action.'],
        body: <><p className="dk-k">The pipeline</p><h2 className="dk-h">Now. Next. Later.</h2>{names.length > 0 && <p className="dk-names">Your concepts: {names.map((x) => <b key={x}>{x}</b>)}</p>}<div className="dk-nnl">{HORIZONS.map((h) => <label key={h.id}><b>{h.label}</b><small>{h.when}</small><textarea value={nnl[h.id] || ''} onChange={(e) => write(h.id, e.target.value)} placeholder="Type as the room decides" /></label>)}</div></> },
      { id: 'roadmap', block: 'close', title: 'Our innovation roadmap',
        notes: ['Read the roadmap back, column by column, with each owner.', 'This is what Ross asked for at the end of his invitation.'],
        body: <><p className="dk-k">Our innovation roadmap</p><h2 className="dk-h">The roadmap <em>we built together.</em></h2><div className="dk-road">{HORIZONS.map((h) => { const items = (nnl[h.id] || '').split('\n').map((x) => x.trim()).filter(Boolean); return <div key={h.id}><b>{h.label}</b><small>{h.when}</small>{items.length ? <ul>{items.map((x, j) => <li key={j}>{x}</li>)}</ul> : <p>Read back from the board</p>}</div>; })}</div><p className="dk-goal">&ldquo;&hellip;{ROSS_WORDS.roadmap}.&rdquo;</p><p className="dk-src">{SOURCES.ross}</p></> },
      { id: 'next', block: 'close', title: 'What happens next',
        notes: ['The three next steps, with dates (still to be confirmed before November 9).', 'Thank you for building this with us.'],
        body: <><p className="dk-k">What happens next</p><h2 className="dk-h">Three directions. <em>Clear owners. Agreed next steps.</em></h2><ol className="dk-steps">{NEXT_STEPS.map((n, i) => <li key={n.t}><span>{i + 1}</span><div><b>{n.t}</b><p>{n.d}</p></div></li>)}</ol></> },
      { id: 'film', block: 'close', title: 'THE FLAVOR RACE', dark: true,
        notes: ['The send-off: lights down, sound up. Two minutes twenty-six.', 'Nobody speaks until the rival has landed; then: see you at lunch.'],
        body: <FilmSlide /> },
    ];
    return list.filter(Boolean) as Slide[];
  }, [answers.length, s.survey, nnl, concepts, ws]);

  const [i, setI] = useState(0);
  const [notes, setNotes] = useState(false);
  const [hint, setHint] = useState(true);
  const [all, setAll] = useState(false);
  const [pres, setPres] = useState(false);
  const scale = useScale(1920, 1080);
  const n = slides.length;
  const go = useCallback((d: number) => setI((x) => Math.max(0, Math.min(n - 1, x + d))), [n]);

  useEffect(() => {
    const q = new URLSearchParams(location.search);
    if (q.has('reset')) { SAVED.forEach((k) => { try { localStorage.removeItem(key(k)); } catch {} }); location.replace(location.pathname); return; }
    setAll(q.has('all')); setPres(q.has('notes'));
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

  if (all && pres) return <Presenter slides={slides} told={answers.length > 0} />;
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
      {notes && <aside className="dk-notes" onClick={(e) => e.stopPropagation()}><b>{i + 1}. {sl.title}</b><ul>{sl.notes.map((x, k) => <li key={k}>{x}</li>)}</ul>{i + 1 < n && <small>Next: {slides[i + 1].title}</small>}</aside>}
      {hint && <div className="dk-hint">Right arrow or click to go on · Left arrow back · F full screen · N notes</div>}
    </main>
  );
}

// Each of Ross's four objectives opens with his words, our talking points and the questions for the room.
function Opener({ i }: { i: number }) {
  const o = OBJECTIVES[i], t = TOPICS[i];
  return <><p className="dk-k">In Ross&rsquo;s words</p><h2 className="dk-h">{t.title}</h2><p className="dk-ross">&ldquo;{o.ask}&rdquo;</p><div className="dk-tp"><div><small>Talking points</small><ul>{t.points.map((x) => <li key={x}>{x}</li>)}</ul></div><div><small>For discussion</small><ul>{t.questions.map((x) => <li key={x}>{x}</li>)}</ul></div></div></>;
}

// The presenter edition: what to send the team. A cover with the run of show, then every slide exactly as the room
// sees it, with its number, the time, the objective and the talking points. Without pre-brief answers yet, a page
// marks where "You told us" will appear.
function Presenter({ slides, told }: { slides: Slide[]; told: boolean }) {
  const n = slides.length;
  const range = (id: string) => { const ix = slides.map((s, j) => (s.block === id ? j + 1 : 0)).filter(Boolean); return ix.length > 1 ? `${ix[0]} to ${ix[ix.length - 1]}` : `${ix[0]}`; };
  const head = (sl: Slide) => { const b = RUN.find((x) => x.id === sl.block); return <>{b && <span>{b.t} to {b.end}</span>}{b?.obj && <span>Objective {b.obj}</span>}</>; };
  return (
    <main className="dk-print dk-pres-doc">
      <section className="dk-pres dk-pres-cover">
        <p className="dk-pres-k">Presenter edition · final · {EVENT.date} · {EVENT.room} room, Princeton</p>
        <h1>The Future <em>of Freshness</em></h1>
        <p className="dk-pres-sub">Every slide exactly as the room will see it on the TV, with the time and the talking points. It is a discussion: each objective opens with Ross’s words, our talking points and questions for the room. {n} slides{told ? '' : `, plus "You told us" once the pre-brief answers are in`}. The live deck is at /host (right arrow or click to go on, F for full screen, N for notes).</p>
        <table className="dk-pres-run"><thead><tr><th>Time</th><th>Part</th><th>Objective</th><th>Slides</th></tr></thead>
          <tbody>{RUN.map((b) => <tr key={b.id}><td>{b.t} to {b.end}</td><td>{b.title}</td><td>{b.obj || ''}</td><td>{range(b.id)}</td></tr>)}</tbody></table>
        <p className="dk-pres-foot">Confidential. For The Flavor Factory team; not for distribution.</p>
      </section>
      {slides.map((sl, j) => (
        <Fragment key={sl.id}>
          <section className="dk-pres">
            <header><b>{j + 1} / {n} · {sl.title}</b>{head(sl)}</header>
            <div className="dk-pres-slide"><div className="dk-pres-scale"><SlideView sl={sl} active={false} /></div></div>
            <ul className="dk-pres-notes">{sl.notes.map((x, k) => <li key={k}>{x}</li>)}</ul>
          </section>
          {!told && sl.id === 'agenda' && (
            <section className="dk-pres">
              <header><b>After {j + 1} · You told us</b></header>
              <div className="dk-pres-slide dk-pres-wait"><p>Appears here once the pre-brief answers are in (Ross sends the pre-brief on November 3): the consumer the room most wants to win, the moment TheraBreath is missing, and the flavors they would never approve, without names. The slides after it move up one.</p></div>
              <ul className="dk-pres-notes"><li>The consumer the room most wants to win, and the moment TheraBreath is missing.</li><li>Have some fun with the vetoes. No names on screen.</li></ul>
            </section>
          )}
        </Fragment>
      ))}
    </main>
  );
}

function SlideView({ sl, active }: { sl: Slide; active: boolean }) {
  const blk = RUN.find((b) => b.id === sl.block);
  return (
    <section className={'dk-slide' + (sl.dark ? ' dark' : '')} data-active={active ? '1' : undefined}>
      {sl.body}
      {!sl.dark && blk?.obj && <div className="dk-tag"><span>Objective {blk.obj}</span></div>}
      {!sl.dark && <footer className="dk-foot"><img src="/img/tff-logo.webp" alt="The Flavor Factory" /><span>× TheraBreath · Confidential</span></footer>}
    </section>
  );
}

// THE FLAVOR RACE fills the slide. It starts on the keypress that lands on it (a user gesture, so sound is allowed).
function FilmSlide() {
  const v = useRef<HTMLVideoElement>(null);
  // On paper the film is its poster, without the player's controls.
  const [still] = useState(() => new URLSearchParams(location.search).has('all'));
  useEffect(() => {
    const el = v.current; if (!el) return;
    const live = !!el.closest('[data-active]');
    if (live) el.play().catch(() => {});
    return () => { el.pause(); };
  }, []);
  if (still) return <img className="dk-film" src="/media/flavor-race-poster.jpg" alt="THE FLAVOR RACE" />;
  return <video ref={v} className="dk-film" controls playsInline preload="auto" poster="/media/flavor-race-poster.jpg"><source src="/media/flavor-race.mp4" type="video/mp4" /></video>;
}

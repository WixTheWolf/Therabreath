'use client';
// The presentation (/host). The Stage's look (the glass drop, the light, the signal colors, the platform worlds), run
// from the presenting laptop: no phones, no live session, no votes. Ross's four objectives are the spine. Each opens on
// one screen in his words and closes on a discussion; what the room decides is marked or typed in live (the three
// signals, the directions for a next round, the concept cards, the white space, Now, Next and Later), saved on this
// laptop, and assembled into the Playbook on the last scenes. The speaker notes are talking points, with no names.
// Keys: right, space or click to go on; left to go back; F full screen; N notes; B blank. ?reset=1 clears what the room
// typed; ?results=1 is a printable page of it. #12 or #12.3 jumps to a scene and build (used by the PDF export).
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSession } from '@/lib/useSession';
import { useScale, Clock } from './StageApp';
import type { Scene } from '@/lib/scenes';
import type { SceneProps } from './scenes/ui';
import { July, Prework, Thesis } from './scenes/Opening';
import { Gap, Portfolio, Market, Signals } from './scenes/ActI';
import { School, Cooling, Oxyd, Anatomy } from './scenes/School';
import { MapScene, Territory } from './scenes/Territories';
import { Next, Lunch } from './scenes/Close';
import {
  InputCtx, Inputs, ShowTitle, Team, ShowBrief, Opener, Talk1, Talk2, PaperTasting, ConceptCanvas, WhiteSpaceShow, Board, Playbook,
  ShowFilm, CHAPTER_NAMES, FIELDS, DIRECTIONS, directionName,
} from './show/ShowScenes';
import { EVENT, TOPICS, PORTFOLIO, SAMPLES, MYSTERY, PRIMARY_TERRITORIES as PLATFORMS, SIGNALS, HORIZONS, RUN } from '@/lib/content';

type View = (p: SceneProps) => React.ReactNode;
export type ShowScene = { id: string; title: string; theme: 'a' | 'b'; builds: number; ch: number; block: string; idx?: number; notes: string[]; View: View };

const MINT = PORTFOLIO.filter((v) => /mint/i.test(v.flavor)).length;
const FRESH = SAMPLES.filter((x) => x.base.startsWith('Fresh')).map((x) => x.code).join(' and ');
const KIDS = SAMPLES.filter((x) => x.base.startsWith('Kids')).map((x) => x.code).join(' and ');
const opener = (n: number, block: string): ShowScene => ({
  id: `open${n}`, title: `Objective 0${n}: ${TOPICS[n - 1].title.replace(/\.$/, '')}`, theme: 'b', builds: 0, ch: n - 1, block, idx: n, View: Opener,
  notes: ['Ross’s words on screen. Talking points:', ...TOPICS[n - 1].points],
});
const platform = (k: number): ShowScene => {
  const t = PLATFORMS[k - 1]; const tasted = SAMPLES.some((x) => x.territory === t.id);
  return { id: `platform${k}`, title: t.name, theme: k === 4 ? 'b' : 'a', builds: 1, ch: 1, block: 'school', idx: k, View: Territory,
    notes: [`${t.name}: ${t.promise}`, tasted ? 'Two of today’s samples come from this platform. Keep the names for the reveal.' : 'Not in today’s tasting: a direction to discuss on screen.', `For the room: ${t.q}`] };
};

export function buildScenes(told: boolean): ShowScene[] {
  const list: (ShowScene | null)[] = [
    { id: 'title', title: 'The Future of Freshness', theme: 'b', builds: 0, ch: -1, block: 'welcome', View: ShowTitle,
      notes: ['Welcome, and thank you to Ross for the invitation.', 'Two hours, built around your four objectives. A conversation, not a presentation: questions welcome throughout.', 'By noon: concepts, a roadmap, and owners and dates.'] },
    { id: 'team', title: 'Who we are', theme: 'a', builds: 0, ch: -1, block: 'welcome', View: Team,
      notes: ['Ross asked to see our creativity, technical expertise and innovation capabilities in depth. This morning is that, in practice.', 'Flavor is science (how a flavor survives the bottle) and imagination (why someone wants it).', 'Introduce the four of us.'] },
    { id: 'july', title: 'From July to today', theme: 'a', builds: 1, ch: -1, block: 'welcome', View: July,
      notes: ['In July you came to Norco: resiliency, innovation, operations, partnership.', 'Today is the fifth word: growth.'] },
    { id: 'brief', title: 'Your four objectives', theme: 'a', builds: 5, ch: -1, block: 'welcome', View: ShowBrief,
      notes: ['Ross’s four objectives, word for word, one per build. Each part of the morning answers one of them, in order.', 'Last build, his goal: new flavor experiences that strengthen appeal with loyal users and attract new consumers.'] },
    told ? { id: 'prework', title: 'You told us', theme: 'a', builds: 2, ch: -1, block: 'welcome', View: Prework,
      notes: ['The pre-brief homework: the consumer the room most wants to win, and the moment TheraBreath is missing.', 'Have some fun with the vetoes. No names on screen.'] } : null,
    { id: 'thesis', title: 'The thesis', theme: 'b', builds: 1, ch: -1, block: 'welcome', View: Thesis,
      notes: ['Pause between the lines.', 'TheraBreath took away the burn. Now let’s give more people a reason to want it.'] },

    opener(1, 'market'),
    { id: 'gap', title: '86 of every 100 households', theme: 'a', builds: 2, ch: 0, block: 'market', View: Gap,
      notes: ['One line of context: 25.3% share of US mouthwash in Q2 2026, up 4.5 points. Number 2.', 'Let the glasses fill in silence. 86 of every 100 US households have not met TheraBreath yet.', 'Pause. Flavor is how we introduce ourselves.'] },
    { id: 'portfolio', title: 'The portfolio today', theme: 'a', builds: 1, ch: 0, block: 'market', View: Portfolio,
      notes: [`${PORTFOLIO.length} flavors across six formats; ${MINT} of them are mint. Mint is mastered.`, 'Next build: zoom out. The next chapter is everything mint makes possible.'] },
    { id: 'market', title: 'The shelf is a flavor shelf', theme: 'a', builds: 6, ch: 0, block: 'market', View: Market,
      notes: ['Factual and neutral: the shelf is now a flavor shelf, one limited edition at a time.', 'Last build: TheraBreath started ahead of this race (alcohol-free, dye-free, OXYD-8, a kids line on shelf).', 'For the room: what keeps it ahead?'] },
    { id: 'signals', title: 'Seven signals', theme: 'a', builds: 7, ch: 0, block: 'market', View: Signals,
      notes: ['One build per signal: the headline, two public proofs, the so what. About forty seconds each.', 'Do not read every proof aloud. Ask which one surprises the R&D team.'] },
    { id: 'talk1', title: 'For discussion: the three signals', theme: 'a', builds: 1, ch: 0, block: 'market', View: Talk1,
      notes: ['Which three matter most for TheraBreath? Click a signal to mark it as the room agrees (three at most).', `Next build: ${TOPICS[0].questions[1]}`, 'The marked signals become Chapter 1 of the Playbook at the end.'] },

    opener(2, 'school'),
    { id: 'school', title: 'What flavor really is', theme: 'b', builds: 3, ch: 1, block: 'school', View: School,
      notes: ['Taste on the tongue, aroma through the nose (including from the back of the mouth), feel through the trigeminal nerve.', 'Most of what we call flavor is smell; the rest is feeling.'] },
    { id: 'cooling', title: 'How cool works', theme: 'b', builds: 3, ch: 1, block: 'school', View: Cooling,
      notes: ['Cooling has two jobs: the first impression and the last. We design both.', 'The curves are illustrative, for teaching, not measured data.'] },
    { id: 'oxyd', title: 'Flavor in an oxidizing world', theme: 'b', builds: 3, ch: 1, block: 'school', View: Oxyd,
      notes: ['OXYD-8 is designed to be tough on odor-causing bacteria, which makes it a demanding home for flavor.', 'Three levers: pH control, protective solubilization, materials that hold up.', 'Public chemistry only, no formula details.'] },
    { id: 'anatomy', title: 'Anatomy of a TheraBreath flavor', theme: 'b', builds: 4, ch: 1, block: 'school', View: Anatomy,
      notes: ['First impression, heart, finish, linger.', 'However adventurous it starts, it must finish fresh.'] },
    { id: 'map', title: 'Four opportunity platforms', theme: 'a', builds: 2, ch: 1, block: 'school', View: MapScene,
      notes: ['Four platforms on one map: character across, intensity up. Our perspective, illustrative.', 'The gentle, adventurous corner is our hypothesis for where new consumers come in.', 'Two platforms carry today’s samples; two are for discussion.'] },
    platform(1), platform(2), platform(3), platform(4),
    { id: 'tasting', title: 'Blind tasting', theme: 'b', builds: 1, ch: 1, block: 'tasting', View: PaperTasting,
      notes: ['Scorecards out, one per person.', `${FRESH} in the Fresh Breath base, ${KIDS} in the Kids base.`, `${MYSTERY} is the Mystery Flavor, tasted last: fruit guesses before the reveal.`, 'Rinse and pause between samples. Workshop reactions, not consumer validation.', 'Next build: the names, then one word for each from the room.'] },
    { id: 'talk2', title: 'For discussion: the directions', theme: 'a', builds: 1, ch: 1, block: 'tasting', View: Talk2,
      notes: [TOPICS[1].questions[0], 'Click each sample or platform the room wants in a next round.', `Next build: ${TOPICS[1].questions[1]}`, 'The marked directions become Chapter 2 of the Playbook.'] },

    opener(3, 'concepts'),
    { id: 'canvas', title: 'Concepts, built in the room', theme: 'a', builds: 0, ch: 2, block: 'concepts', View: ConceptCanvas,
      notes: ['From the scorecards and the marked directions: up to three concepts. Three is the ceiling, not the target.', 'For each: where it starts, who it is for, the moment, its role in the range, the format, and whether it grows loyal users, new consumers or both.', 'Type as the room decides. The boxes suggest the morning’s own options and save as you type.'] },

    opener(4, 'pipeline'),
    { id: 'whitespace', title: 'White space', theme: 'a', builds: 3, ch: 3, block: 'pipeline', View: WhiteSpaceShow,
      notes: ['Eight moments of the day across, the consumers from the pre-brief down.', 'Build 1: our read of where TheraBreath is today, there to be challenged: the sink, morning and night, and the dry mouth lozenge on the go.', 'Build 2: the room’s pre-brief answers. Build 3: the white space.', 'Click a cell to mark where each concept lands.'] },
    { id: 'board', title: 'Now, Next, Later', theme: 'a', builds: 0, ch: 3, block: 'pipeline', View: Board,
      notes: ['Each concept and direction goes into Now, Next or Later as the room decides: one line each.', 'For each: a TFF owner, a C&D reviewer, the base and the next sample action.', TOPICS[3].questions[1]] },

    { id: 'playbook', title: 'The Playbook you just built', theme: 'b', builds: 1, ch: -1, block: 'close', View: Playbook,
      notes: ['The morning, in four chapters: the signals, the directions, the concepts and the pipeline the room chose.', 'Read the roadmap back, Now, Next and Later, with owners.', 'Next build: the cover.'] },
    { id: 'next', title: 'What happens next', theme: 'b', builds: 3, ch: -1, block: 'close', View: Next,
      notes: ['The three next steps (dates to confirm before November 9).', 'Thank you for building this with us.'] },
    { id: 'film', title: 'THE FLAVOR RACE', theme: 'b', builds: 0, ch: -1, block: 'close', View: () => null,
      notes: ['The send-off: lights down, sound up. Two minutes twenty-six.', 'Nobody speaks until the rival has landed; then: see you at lunch.'] },
    { id: 'lunch', title: 'Lunch', theme: 'b', builds: 0, ch: -1, block: 'close', View: Lunch,
      notes: ['12:00. Lunch, hosted by Church & Dwight.'] },
  ];
  return list.filter(Boolean) as ShowScene[];
}

// What the room types or marks, saved on the presenting laptop.
const SAVED = ['picks', 'concepts', 'nnl', 'ws'] as const;
const skey = (k: string) => `fof-show-${k}-${EVENT.code}`;
function useSaved<T>(k: (typeof SAVED)[number], init: T): [T, (f: (v: T) => T) => void] {
  const [v, setV] = useState<T>(init);
  useEffect(() => { try { const x = localStorage.getItem(skey(k)); if (x) setV(JSON.parse(x)); } catch {} }, [k]);
  const set = useCallback((f: (v: T) => T) => setV((prev) => { const next = f(prev); try { localStorage.setItem(skey(k), JSON.stringify(next)); } catch {} return next; }), [k]);
  return [v, set];
}

const fakeScene = (sc: ShowScene, n: number): Scene => ({ id: sc.id, n, act: '', chapter: sc.ch, theme: sc.theme, builds: sc.builds, title: sc.title, notes: '', room: { kind: 'watch' } });
const ctx = { code: EVENT.code, k: '', joinUrl: '', origin: '' };

export default function ShowApp() {
  const { state: s } = useSession(EVENT.code, { interval: 15000 });
  const told = Object.keys(s.survey || {}).length > 0;
  const scenes = useMemo(() => buildScenes(told), [told]);
  const n = scenes.length;

  const [picks, setPicks] = useSaved<Record<string, string[]>>('picks', {});
  const [concepts, setConcepts] = useSaved<Record<string, string>>('concepts', {});
  const [nnl, setNnl] = useSaved<Record<string, string>>('nnl', {});
  const [ws, setWs] = useSaved<string[]>('ws', []);
  const inputs: Inputs = useMemo(() => ({
    picks, concepts, nnl, ws,
    pick: (k, id, max) => setPicks((p) => { const cur = p[k] || []; const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id].slice(-max); return { ...p, [k]: next }; }),
    type: (id, v) => setConcepts((c) => ({ ...c, [id]: v })),
    write: (id, v) => setNnl((x) => ({ ...x, [id]: v })),
    mark: (cell) => setWs((w) => (w.includes(cell) ? w.filter((x) => x !== cell) : [...w, cell])),
  }), [picks, concepts, nnl, ws, setPicks, setConcepts, setNnl, setWs]);

  const [pos, setPos] = useState({ i: 0, step: 0 });
  const [notes, setNotes] = useState(false);
  const [blank, setBlank] = useState(false);
  const [hint, setHint] = useState(true);
  const [mode, setMode] = useState<'' | 'results'>('');
  const [still, setStill] = useState(false);
  const scale = useScale(1920, 1080);

  // #12 or #12.3: scene 12 (counting from 1), build 3. A build past the last one lands on the last.
  const fromHash = useCallback(() => {
    const m = location.hash.match(/^#(\d+)(?:\.(\d+))?$/); if (!m) return;
    const i = Math.max(0, Math.min(n - 1, Number(m[1]) - 1));
    setPos({ i, step: Math.min(scenes[i].builds, Number(m[2] || 0)) });
  }, [n, scenes]);
  useEffect(() => {
    const q = new URLSearchParams(location.search);
    if (q.has('reset')) { SAVED.forEach((k) => { try { localStorage.removeItem(skey(k)); } catch {} }); location.replace(location.pathname); return; }
    if (q.has('results')) setMode('results');
    setStill(q.has('still'));
    fromHash();
    addEventListener('hashchange', fromHash);
    const t = setTimeout(() => setHint(false), 6000);
    return () => { clearTimeout(t); removeEventListener('hashchange', fromHash); };
  }, [fromHash]);
  useEffect(() => { if (pos.i > n - 1) setPos({ i: n - 1, step: 0 }); }, [n, pos.i]);
  useEffect(() => { history.replaceState(null, '', `#${pos.i + 1}${pos.step ? '.' + pos.step : ''}`); }, [pos]);
  // The export script (scripts/export-show.mjs) reads the run of show from here: titles, builds, notes and times.
  useEffect(() => { Object.assign(window, { __show: scenes.map(({ id, title, builds, block, notes, ch }) => ({ id, title, builds, block, notes, ch })), __run: RUN }); }, [scenes]);

  const posRef = useRef(pos); posRef.current = pos;
  const go = useCallback((d: number) => {
    const { i, step } = posRef.current, sc = scenes[i];
    if (d > 0) { if (step < sc.builds) setPos({ i, step: step + 1 }); else if (i < n - 1) setPos({ i: i + 1, step: 0 }); }
    else { if (step > 0) setPos({ i, step: step - 1 }); else if (i > 0) setPos({ i: i - 1, step: scenes[i - 1].builds }); }
  }, [scenes, n]);
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (el.closest('input, textarea')) { if (e.key === 'Escape') el.blur(); return; }
      if (['ArrowRight', 'PageDown', ' ', 'Enter'].includes(e.key)) { e.preventDefault(); go(1); }
      else if (['ArrowLeft', 'PageUp', 'Backspace'].includes(e.key)) { e.preventDefault(); go(-1); }
      else if (e.key === 'Home') setPos({ i: 0, step: 0 });
      else if (e.key === 'End') setPos({ i: n - 1, step: 0 });
      else if (e.key === 'n' || e.key === 'N') setNotes((x) => !x);
      else if (e.key === 'b' || e.key === 'B') setBlank((x) => !x);
      else if (e.key === 'f' || e.key === 'F') { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen?.(); }
    };
    addEventListener('keydown', k); return () => removeEventListener('keydown', k);
  }, [go, n]);

  const sc = scenes[Math.min(pos.i, n - 1)];
  useEffect(() => { document.documentElement.dataset.theme = mode === 'results' ? 'a' : sc.theme; }, [sc.theme, mode]);

  if (mode === 'results') return <Results inputs={inputs} />;

  const click = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('input, textarea, button, label, video, a, [data-nonav]')) return;
    go(e.clientX < innerWidth / 3 ? -1 : 1);
  };
  const View = sc.View;
  return (
    <InputCtx.Provider value={inputs}>
      <div className="stage-host show" style={{ display: 'flex' }} onClick={click}>
        <div className="stage-wrap" style={{ width: 1920 * scale, height: 1080 * scale }}>
          <div className="stage" data-theme={sc.theme} style={{ transform: `scale(${scale})` }}>
            <div className="stage-scene" key={sc.id} data-step={pos.step} data-scene={sc.id}>
              {sc.id === 'film' ? <ShowFilm still={still} /> : <View s={s} step={pos.step} scene={fakeScene(sc, pos.i)} idx={sc.idx || 0} ctx={ctx} send={() => {}} />}
            </div>
            {sc.ch >= 0 && <Chrome scenes={scenes} i={pos.i} clock={!still} />}
            <div className={'blank' + (blank ? ' on' : '')} />
            <div className="theme-veil" key={'v' + sc.theme} />
          </div>
        </div>
        {notes && (
          <aside className="show-notes" data-nonav onClick={(e) => e.stopPropagation()}>
            <span className="k">{pos.i + 1} of {n}{sc.builds ? ` · build ${pos.step} of ${sc.builds}` : ''}</span>
            <b>{sc.title}</b>
            <ul>{sc.notes.map((x, k) => <li key={k}>{x}</li>)}</ul>
            {pos.i + 1 < n && <small>Next: {scenes[pos.i + 1].title}</small>}
          </aside>
        )}
        {hint && <div className="show-hint">Right arrow or click to go on · Left arrow back · F full screen · N notes</div>}
      </div>
    </InputCtx.Provider>
  );
}

// The chapter bar: the four objectives, and how far through the current one the morning is. The clock is left off in
// the PDF export (?still=1).
function Chrome({ scenes, i, clock }: { scenes: ShowScene[]; i: number; clock: boolean }) {
  const ch = scenes[i].ch;
  const inCh = scenes.map((x, j) => (x.ch === ch ? j : -1)).filter((j) => j >= 0);
  const pct = Math.round(((inCh.indexOf(i) + 1) / inCh.length) * 100);
  return (
    <>
      <div className="chrome-top"><div className="brand"><i />The Future of Freshness</div><div className="act">Objective 0{ch + 1} <b>{CHAPTER_NAMES[ch]}</b></div><div className="live">{clock && <Clock />}</div></div>
      <div className="progress" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {CHAPTER_NAMES.map((c, j) => <div key={c} className={j === ch ? 'on' : j < ch ? 'done' : ''} style={{ ['--p' as any]: `${j < ch ? 100 : j === ch ? pct : 0}%` }}><span>0{j + 1}</span>{c}</div>)}
      </div>
    </>
  );
}

// What the room decided, on one printable page: open /host?results=1 before closing the laptop and print it to PDF.
function Results({ inputs }: { inputs: Inputs }) {
  const { picks, concepts, nnl, ws } = inputs;
  const lines = (id: string) => (nnl[id] || '').split('\n').map((x) => x.trim()).filter(Boolean);
  const cs = [1, 2, 3].filter((c) => FIELDS.some((f) => concepts[`${c}-${f.f}`]) || concepts[`${c}-name`]);
  return (
    <main className="show-results">
      <p className="k">The Flavor Playbook · from the room · {EVENT.date} · {EVENT.room} room, Princeton</p>
      <h1 className="h1">What we decided <span className="it">together.</span></h1>
      <section><h2 className="h3">The signals that matter most</h2><ul>{(picks.signals || []).map((id) => <li key={id}>{SIGNALS.find((x) => x.id === id)?.title}</li>)}{!(picks.signals || []).length && <li className="ghost">None marked</li>}</ul></section>
      <section><h2 className="h3">Directions for a next round</h2><ul>{(picks.directions || []).map((id) => <li key={id}>{directionName(id)}{DIRECTIONS.find((d) => d.id === id)?.sub.startsWith('Sample') ? ` (sample ${id})` : ''}</li>)}{!(picks.directions || []).length && <li className="ghost">None marked</li>}</ul></section>
      <section><h2 className="h3">Concepts</h2>{cs.length ? cs.map((c) => <div key={c} className="sr-concept"><b>{concepts[`${c}-name`] || `Concept ${c}`}</b><dl>{FIELDS.map((f) => concepts[`${c}-${f.f}`] ? <div key={f.f}><dt>{f.l}</dt><dd>{concepts[`${c}-${f.f}`]}</dd></div> : null)}</dl></div>) : <p className="ghost">None typed</p>}</section>
      <section><h2 className="h3">Now, Next, Later</h2><div className="sr-nnl">{HORIZONS.map((h) => <div key={h.id}><b>{h.label}</b><small>{h.when}</small><ul>{lines(h.id).map((x, j) => <li key={j}>{x}</li>)}{!lines(h.id).length && <li className="ghost">Nothing yet</li>}</ul></div>)}</div></section>
      <section><h2 className="h3">Where the concepts land</h2><ul>{ws.map((c) => <li key={c}>{c.replace('|', ' · ')}</li>)}{!ws.length && <li className="ghost">No cells marked</li>}</ul></section>
      <p className="src">Confidential. Development concepts made for this conversation: not products, claims or commercial formulations.</p>
      <button className="sr-print" onClick={() => print()}>Print or save as PDF</button>
    </main>
  );
}

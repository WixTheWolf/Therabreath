'use client';
// The presentation (/host), the simplified morning. The Stage's look (the glass drop, the light, the trend colors, the
// direction photographs), driving the shared session: when the presenter moves on, every phone moves too. People join by
// scanning the code on the arrival screen; they score the tasting and place chips on what gets a next round, and the
// results fill the screen as they land. What the room would keep and change, the one or two ideas we work on next and
// the explore-later list are typed here into the same session, and the Playbook scene near the end reads it all back.
// The backup slides (the seven trends and their vote, Flavor School, the directions one by one, the concept cards, the
// dots, white space and Now, Next, Later) sit after the thank-you card: the presenter view's Go to list opens them and
// Return (or Escape here) comes back to the main flow. The talking
// points (N) name nobody. ?code=REHEARSE runs a separate rehearsal session with its own code; ?results=1 is a printable
// page of what was decided; ?still=1 is for the PDF export (it never writes to the session); #12 or #12.3 jumps to a
// scene and build. P opens the presenter view (/host/presenter) in its own window for the laptop's screen: the talking
// points, the clock, the controls, and the hand votes and paper scorecards for anyone without a phone.
// Keys: right, space or click to go on (not on the scenes with boxes to type in); left to go back; F full screen;
// N talking points on this screen; P presenter view; B blank screen; Escape back from a backup slide.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSession } from '@/lib/useSession';
import { useSealed } from '@/lib/sealedClient';
import { useScale, Clock } from './StageApp';
import { SCENES, SECTIONS, MAIN, LAST_MAIN, Scene } from '@/lib/scenes';
import { pointsOf, titleOf } from '@/lib/sceneNotes';
import type { SceneProps } from './scenes/ui';
import { Arrival, July, Prework, Thesis } from './scenes/Opening';
import { Gap, Portfolio, Market, Signals } from './scenes/ActI';
import { School, Cooling, Oxyd, Anatomy } from './scenes/School';
import { MapScene, Territory, Matrix } from './scenes/Territories';
import { Next, Lunch } from './scenes/Close';
import {
  LiveCtx, Live, ShowTitle, Team, ShowBrief, Opener, SignalVoteShow, TastingLive, NextRound, ConceptCanvas, DotsShow, WhiteSpaceShow, Board,
  Playbook, ShowFilm, FilmCtl, JoinCorner, FIELDS, decided, markLabel, TrendTalks, Directions, Basics, Reactions, Develop,
} from './show/ShowScenes';
import { EVENT, TOPICS, RUN, CRITERIA } from '@/lib/content';
import { runTiming } from '@/lib/time';
import { PLAN_COLS, planCell } from './show/Plan';
import { showChannel, presenterUrl, ShowMsg } from '@/lib/showLink';

type View = (p: SceneProps) => React.ReactNode;
const VIEWS: Record<string, View> = {
  arrival: Arrival, title: ShowTitle, team: Team, july: July, brief: ShowBrief, prework: Prework, thesis: Thesis,
  open: Opener, gap: Gap, portfolio: Portfolio, market: Market, signals: Signals, signalvote: SignalVoteShow,
  school: School, cooling: Cooling, oxyd: Oxyd, anatomy: Anatomy, map: MapScene, platform: Territory,
  tasting: TastingLive, matrix: Matrix, nextround: NextRound, concepts: ConceptCanvas, dots: DotsShow,
  whitespace: WhiteSpaceShow, board: Board, playbook: Playbook, next: Next, lunch: Lunch,
  trends: TrendTalks, directions: Directions, basics: Basics, react: Reactions, develop: Develop,
};
// The scenes where phones are in use: the code stays in the corner for anyone who has not joined.
const VOTING = new Set(['signalvote', 'tasting', 'nextround', 'dots']);
// The scenes with boxes to type in or cells to mark: a click there never moves the room on.
const TYPING = new Set(['concepts', 'whitespace', 'board', 'react', 'develop']);
// Two copies of the sample names are the same when every sample has the same name and note, in any key order.
const sealKey = (x: { samples: Record<string, { name: string; note: string }> }) =>
  Object.keys(x.samples).sort().map((c) => `${c}:${x.samples[c]?.name}|${x.samples[c]?.note}`).join(';');

export default function ShowApp({ code, k }: { code: string; k: string }) {
  const [still, setStill] = useState(false);
  const [mode, setMode] = useState<'' | 'results'>('');
  const { state: s, send, status } = useSession(code, { admin: true, interval: 500 });
  // The team's own copy of the sample names (from the server): the scenes read them from the state they're handed, and the
  // room learns them only from the reveal this window sends when the tasting flips the names.
  const sealed = useSealed(s.revealed);
  // The team's copy always wins on this screen, so a reveal saved before the samples changed never shows the old names.
  const sv = useMemo(() => (sealed.data ? { ...s, revealed: sealed.data } : s), [s, sealed.data]);
  const told = Object.keys(s.survey || {}).length > 0;
  const n = SCENES.length;
  // "You told us" only appears once someone has answered the pre-brief. S (short) also skips the optional slides.
  const [short, setShort] = useState(false);
  const skip = useCallback((i: number) => (SCENES[i].id === 'prework' && !told) || (short && !!SCENES[i].optional), [told, short]);

  const [pos, setPos] = useState({ i: 0, step: 0 });
  const [notes, setNotes] = useState(false);
  const [blank, setBlank] = useState(false);
  const [hint, setHint] = useState(true);
  const [origin, setOrigin] = useState('');
  const scale = useScale(1920, 1080);

  // #12 or #12.3: scene 12 (counting from 1), build 3. A build past the last one lands on the last.
  const hashed = useRef(false);
  const fromHash = useCallback(() => {
    const m = location.hash.match(/^#(\d+)(?:\.(\d+))?$/); if (!m) return;
    hashed.current = true;
    const i = Math.max(0, Math.min(n - 1, Number(m[1]) - 1));
    setPos({ i, step: Math.min(SCENES[i].builds, Number(m[2] || 0)) });
  }, [n]);
  useEffect(() => {
    const q = new URLSearchParams(location.search);
    if (q.has('results')) setMode('results');
    setStill(q.has('still'));
    setOrigin(location.origin);
    fromHash();
    addEventListener('hashchange', fromHash);
    const t = setTimeout(() => setHint(false), 6000);
    return () => { clearTimeout(t); removeEventListener('hashchange', fromHash); };
  }, [fromHash]);

  // The presenter is the source of truth. After a reload, pick up where the session was, then send every move so the
  // phones follow. The PDF export (?still=1) never writes to the session.
  const live = useRef(false);
  useEffect(() => {
    if (live.current || !status.lastOk || still || mode) return;
    live.current = true;
    if (!hashed.current && s.scene > 0) setPos({ i: s.scene, step: s.step });
  }, [status.lastOk, still, mode, s.scene, s.step]);
  useEffect(() => { if (live.current && !still && !mode) send('goto', { scene: pos.i, step: pos.step }); }, [pos, still, mode, send]);
  // The reveal. The flip is build 2 of the tasting, and skipping past the tasting reveals too. Two repairs keep the phones
  // right: a reveal saved before the samples changed is sent again with the current names (a rehearsal on October 31 kept
  // the old A to D order after the swap), and a rehearsal that goes back before the flip is sealed again, so every
  // run-through tastes blind. The live session is never sealed again.
  const revealSent = useRef(false);
  const repair = useRef('');
  useEffect(() => {
    const ti = SCENES.findIndex((x) => x.id === 'tasting');
    if (!live.current || still || mode || !sealed.data) return;
    // A backup slide sits after the thank-you card in the list but can come up at any time: it neither reveals nor seals.
    if (SCENES[pos.i].backup) return;
    const past = pos.i > ti || (pos.i === ti && pos.step >= 2);
    if (s.revealed) {
      if (!past && code !== EVENT.code) {
        if (repair.current !== 'seal') { repair.current = 'seal'; revealSent.current = false; send('seal', {}); }
        return;
      }
      const want = sealKey(sealed.data);
      if (sealKey(s.revealed) !== want && repair.current !== want) { repair.current = want; send('reveal', sealed.data); }
      return;
    }
    repair.current = '';
    if (past && !revealSent.current) { revealSent.current = true; send('reveal', sealed.data); }
  }, [pos, still, mode, s.revealed, sealed.data, send, status.lastOk, code]);
  useEffect(() => { history.replaceState(null, '', `${location.search}#${pos.i + 1}${pos.step ? '.' + pos.step : ''}`); }, [pos]);

  const posRef = useRef(pos); posRef.current = pos;
  // Where the main flow was before a backup slide went up, so Return comes back to it.
  const mainPos = useRef({ i: 0, step: 0 });
  useEffect(() => { if (!SCENES[pos.i].backup) mainPos.current = pos; }, [pos]);
  const film = useRef<FilmCtl | null>(null); // set while THE FLAVOR RACE is on screen
  // The arrows stay in the main flow from a main slide, and among the backup slides from a backup slide.
  const out = useCallback((from: number, j: number) => skip(j) || (!SCENES[from].backup && !!SCENES[j].backup), [skip]);
  const go = useCallback((d: number) => {
    const { i, step } = posRef.current, sc = SCENES[i];
    if (d > 0) {
      if (step < sc.builds) return setPos({ i, step: step + 1 });
      let j = i + 1; while (j < n && out(i, j)) j++;
      if (j < n) setPos({ i: j, step: 0 });
    } else {
      if (step > 0) return setPos({ i, step: step - 1 });
      let j = i - 1; while (j > 0 && out(i, j)) j--;
      if (j >= 0) setPos({ i: j, step: SCENES[j].builds });
    }
  }, [n, out]);
  const back = useCallback(() => { if (SCENES[posRef.current.i].backup) setPos(mainPos.current); }, []);
  // ] and [ jump to the next or previous part (the map and the tasting count as their own stops).
  const jump = useCallback((d: number) => {
    const stops = SECTIONS.map((id) => SCENES.findIndex((x) => x.id === id)).filter((x) => x >= 0);
    const { i } = posRef.current;
    const j = d > 0 ? stops.find((x) => x > i) : [...stops].reverse().find((x) => x < i);
    if (j !== undefined) setPos({ i: j, step: 0 });
  }, []);
  useEffect(() => {
    const kd = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (el.closest('input, textarea')) { if (e.key === 'Escape') el.blur(); return; }
      if (e.key === 'Escape') { back(); return; }
      if (e.key === ' ' && el.closest('button')) return; // a button reached with Tab: Space presses it, nothing else
      // On the film: Space, Enter or K pauses and plays, R starts it again; the arrows still move on or back.
      if (film.current && [' ', 'Enter', 'k', 'K', 'r', 'R'].includes(e.key)) { e.preventDefault(); film.current.act(/r/i.test(e.key) ? 'restart' : 'toggle'); return; }
      if (['ArrowRight', 'PageDown', ' ', 'Enter'].includes(e.key)) { e.preventDefault(); go(1); }
      else if (['ArrowLeft', 'PageUp', 'Backspace'].includes(e.key)) { e.preventDefault(); go(-1); }
      else if (e.key === 'Home') setPos({ i: 0, step: 0 });
      else if (e.key === 'End') setPos({ i: LAST_MAIN, step: 0 });
      else if (e.key === ']') jump(1);
      else if (e.key === '[') jump(-1);
      else if (e.key === 's' || e.key === 'S') setShort((x) => !x);
      else if (e.key === 'n' || e.key === 'N') setNotes((x) => !x);
      else if (e.key === 'p' || e.key === 'P') window.open(presenterUrl(code), 'pb-presenter-' + code, 'popup,width=1280,height=820');
      else if (e.key === 'b' || e.key === 'B') setBlank((x) => !x);
      else if (e.key === 'f' || e.key === 'F') { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen?.(); }
    };
    addEventListener('keydown', kd); return () => removeEventListener('keydown', kd);
  }, [go, jump, back, n, code]);

  // The presenter view: tell it where we are on every move, and do what it asks.
  // The main flow as it will run (the numbers on the presenter view count these); backup slides count as 0.
  const shownList = useMemo(() => MAIN.filter((x) => !skip(x.n)), [skip]);
  const link = useRef<BroadcastChannel | null>(null);
  const posMsg = useCallback((): ShowMsg => {
    const { i, step } = posRef.current;
    const nx = SCENES.slice(i + 1).find((x) => !out(i, x.n)); const next = nx ? titleOf(nx) : '';
    const pv = SCENES.slice(0, i).reverse().find((x) => !out(i, x.n)); const prev = pv ? titleOf(pv) : '';
    const bk = SCENES[i].backup ? titleOf(SCENES[mainPos.current.i]) : undefined;
    return { t: 'pos', pos: { i, step, short, blank, at: shownList.indexOf(SCENES[i]) + 1, total: shownList.length, next, prev, film: film.current?.state(), back: bk } };
  }, [out, short, blank, shownList]);
  useEffect(() => {
    if (still || mode) return;
    const ch = showChannel(code); link.current = ch; if (!ch) return;
    ch.onmessage = (m) => {
      const x = m.data as ShowMsg;
      if (x.t === 'hello') ch.postMessage(posMsg());
      if (x.t !== 'cmd') return;
      const c = x.cmd;
      if (c.c === 'go') go(c.d);
      else if (c.c === 'jump') jump(c.d);
      else if (c.c === 'goto') setPos({ i: Math.max(0, Math.min(n - 1, c.i)), step: Math.min(SCENES[Math.max(0, Math.min(n - 1, c.i))].builds, c.step || 0) });
      else if (c.c === 'short') setShort((v) => !v);
      else if (c.c === 'blank') setBlank((v) => !v);
      else if (c.c === 'film') film.current?.act(c.a);
      else if (c.c === 'return') back();
    };
    return () => { ch.close(); link.current = null; };
  }, [code, still, mode, go, jump, back, n, posMsg]);
  useEffect(() => {
    link.current?.postMessage(posMsg());
    const iv = setInterval(() => link.current?.postMessage(posMsg()), 2000); // a heartbeat, so the presenter view knows we're here
    return () => clearInterval(iv);
  }, [pos, posMsg]);
  const filmChanged = useCallback(() => link.current?.postMessage(posMsg()), [posMsg]);

  const sc = SCENES[Math.min(pos.i, n - 1)];
  useEffect(() => { document.documentElement.dataset.theme = mode === 'results' ? 'a' : sc.theme; }, [sc.theme, mode]);
  const joinUrl = origin ? `${origin}/j/${code}?k=${k}` : '';
  const ctxLive: Live = useMemo(() => ({ send, still, joinUrl }), [send, still, joinUrl]);
  const ctx = useMemo(() => ({ code, k, origin, joinUrl }), [code, k, origin, joinUrl]);
  // The export script (scripts/export-show.mjs) reads the run of show from here, and rehearsal scripts read the join link.
  useEffect(() => { Object.assign(window, { __join: joinUrl, __run: RUN, __show: SCENES.filter((x, i) => x.backup || !skip(i)).map((x) => ({ id: x.id, title: titleOf(x), builds: x.builds, block: x.block, optional: !!x.optional, backup: x.backup || '', notes: pointsOf(x), ch: x.chapter, at: SCENES.findIndex((y) => y.id === x.id) + 1 })) }); }, [skip, joinUrl]);

  if (mode === 'results') return <Results s={sv} code={code} />;

  const click = (e: React.MouseEvent) => {
    if (TYPING.has(sc.id) || (e.target as HTMLElement).closest('input, textarea, button, label, video, a, [data-nonav]')) return;
    go(e.clientX < innerWidth / 3 ? -1 : 1);
  };
  const key = sc.id.replace(/\d+$/, '');
  const View = VIEWS[key];
  const idx = Number(sc.id.match(/\d+$/)?.[0] || 0);
  const shown = shownList;
  const nextStop = sc.backup ? undefined : SECTIONS.map((id) => SCENES.find((x) => x.id === id)!).find((x) => x.n > pos.i);
  const tm = runTiming(sc.block);
  const timing = tm ? `This part: ${tm.from} to ${tm.to} · now ${tm.now}${tm.over ? ` · ${tm.over} min over` : ''}` : sc.backup ? 'Backup slide · Escape goes back to the main flow' : '';
  const at = shown.indexOf(sc) + 1;
  return (
    <LiveCtx.Provider value={ctxLive}>
      <div className={'stage-host show' + (still ? ' still' : '')} style={{ display: 'flex' }} onClick={click} onMouseDown={(e) => { if ((e.target as HTMLElement).closest('button')) e.preventDefault(); }}>
        <div className="stage-wrap" style={{ width: 1920 * scale, height: 1080 * scale }}>
          <div className="stage" data-theme={sc.theme} style={{ transform: `scale(${scale})` }}>
            <div className="stage-scene" key={sc.id} data-step={pos.step} data-scene={sc.id}>
              {sc.id === 'film' ? <ShowFilm still={still} ctl={film} onChange={filmChanged} /> : View ? <View s={sv} step={pos.step} scene={sc} idx={idx} ctx={ctx} send={send} /> : null}
            </div>
            {sc.chapter >= 0 && <Chrome i={pos.i} clock={!still} />}
            {VOTING.has(sc.id) && joinUrl && <JoinCorner url={joinUrl} />}
            <div className="grain" />
            <div className={'blank' + (blank ? ' on' : '')} />
            <div className="theme-veil" key={'v' + sc.theme} />
          </div>
        </div>
        {notes && (
          <aside className="show-notes" data-nonav onClick={(e) => e.stopPropagation()}>
            <span className="k">{sc.backup ? `Backup · ${sc.backup}` : `${at} of ${shown.length}`}{sc.builds ? ` · build ${pos.step} of ${sc.builds}` : ''}{code !== EVENT.code ? ` · rehearsal ${code}` : ''} · {Object.keys(s.participants).length} joined</span>
            <b>{titleOf(sc)}</b>
            <ul>{pointsOf(sc).map((x, j) => <li key={j}>{x}</li>)}</ul>
            {pos.i + 1 < n && <small>Next: {(() => { const x = SCENES.slice(pos.i + 1).find((y) => !out(pos.i, y.n)); return x ? titleOf(x) : 'nothing after this one'; })()}{nextStop ? ` · ] jumps to ${nextStop.title}` : ''}</small>}
            <small>{timing}{short ? ' · Short version: optional slides skipped (S to undo)' : ''}</small>
          </aside>
        )}
        {hint && <div className="show-hint">Right arrow or click to go on · Left arrow back · ] next part · S short version · F full screen · P presenter view</div>}
        {code !== EVENT.code && !still && <div className="show-rehearse">Rehearsal session {code}. Votes here never reach the live session.</div>}
      </div>
    </LiveCtx.Provider>
  );
}

// The part bar: the three parts, and how far through the current one the morning is.
function Chrome({ i, clock }: { i: number; clock: boolean }) {
  const ch = SCENES[i].chapter;
  const inCh = MAIN.filter((x) => x.chapter === ch).map((x) => x.n);
  const pct = Math.round(((inCh.indexOf(i) + 1) / inCh.length) * 100);
  return (
    <>
      <div className="chrome-top"><div className="brand"><i />The Future of Freshness</div><div className="act">Part {ch + 1} <b>{TOPICS[ch].title}</b></div><div className="live">{clock && <Clock />}</div></div>
      <div className="progress" style={{ gridTemplateColumns: `repeat(${TOPICS.length}, 1fr)` }}>
        {TOPICS.map((t, j) => <div key={t.title} className={j === ch ? 'on' : j < ch ? 'done' : ''} style={{ ['--p' as any]: `${j < ch ? 100 : j === ch ? pct : 0}%` }}><span>0{j + 1}</span>{t.title}</div>)}
      </div>
    </>
  );
}

// What we decided, on one printable page: open /host?results=1 after the session and print it to PDF. The trend votes,
// the concept cards, the dots and the white-space marks only show if their backup slides were used.
function Results({ s, code }: { s: any; code: string }) {
  const d = decided(s);
  const cs = d.concepts;
  const marks: string[] = s.marks || [];
  return (
    <main className="show-results">
      <p className="k">The Flavor Playbook · draft · {EVENT.date} · {EVENT.room} room, Princeton{code !== EVENT.code ? ` · rehearsal ${code}` : ''}</p>
      <h1 className="h1">What we <span className="it">decided.</span></h1>
      <p className="sr-sub">{Object.keys(s.participants).length} people joined on their phones.</p>
      <section><h2 className="h3">The tasting</h2><table className="sr-taste"><thead><tr><th>Sample</th>{CRITERIA.map((c) => <th key={c.key}>{c.l}</th>)}<th>Scores</th><th>Keep</th><th>Change</th></tr></thead><tbody>{d.tasting.map((x) => <tr key={x.code}><td>{x.code}. {x.name}</td><td>{x.sum.n ? x.sum.appeal.toFixed(1) : ''}</td><td>{x.sum.n ? x.sum.feels.toFixed(1) : ''}</td><td>{x.sum.n ? x.sum.newness.toFixed(1) : ''}</td><td>{x.sum.n}</td><td>{x.keep}</td><td>{x.change}</td></tr>)}</tbody></table></section>
      <section><h2 className="h3">What gets a next round</h2><ul>{d.directions.map((x) => <li key={x.t}>{x.t} <em>{x.n} chips</em></li>)}{!d.directions.length && <li className="ghost">No chips placed</li>}</ul></section>
      <section><h2 className="h3">What we’ll work on next</h2>{d.work.length ? <table className="sr-plan"><thead><tr><th>Idea</th>{PLAN_COLS.map((c) => <th key={c.f}>{c.l}</th>)}</tr></thead><tbody>{d.work.map((r) => <tr key={r.id}><td><b>{r.what || 'Untitled'}</b></td>{PLAN_COLS.map((c) => <td key={c.f}>{planCell(r, c.f) || <span className="ghost">To agree</span>}</td>)}</tr>)}</tbody></table> : <p className="ghost">Nothing yet</p>}</section>
      <section><h2 className="h3">Explore later</h2><ul>{d.later.map((r) => <li key={r.id}>{r.what}</li>)}{!d.later.length && <li className="ghost">Nothing parked</li>}</ul></section>
      {d.signals.length > 0 && <section><h2 className="h3">The trend vote (backup)</h2><ul>{d.signals.map((x) => <li key={x.t}>{x.t} <em>{x.n} votes</em></li>)}</ul></section>}
      {(cs.length > 0 || d.ideas.length > 0) && <section><h2 className="h3">Concepts (backup)</h2>{cs.map((c: any) => <div key={c.id} className="sr-concept"><b>{c.name}</b><dl>{FIELDS.map((f) => c[f.key] ? <div key={f.f}><dt>{f.l}</dt><dd>{c[f.key]}</dd></div> : null)}</dl></div>)}
        {d.ideas.length > 0 && <p className="sr-dots">Dot vote: {d.ideas.map((x) => `${x.t} (${x.n})`).join(', ')}</p>}</section>}
      {marks.length > 0 && <section><h2 className="h3">Where the ideas could fit in a day (backup)</h2><ul>{marks.map((c) => <li key={c}>{markLabel(s, c)}</li>)}</ul></section>}
      <p className="src">Confidential. These are development samples and ideas made for this session. They aren’t finished products or claims, and the scores are this group’s reactions, not consumer research.</p>
      <div className="sr-actions"><button className="sr-print" onClick={() => print()}>Print or save as PDF</button><a href={code === EVENT.code ? '/host/writeup' : `/host/writeup?code=${code}`}>Open the Playbook write-up</a></div>
    </main>
  );
}

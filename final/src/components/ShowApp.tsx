'use client';
// The presentation (/host). The Stage's look (the glass drop, the light, the trend colors, the direction photographs),
// driving the shared session: when the presenter moves on, every phone moves too. People join by scanning the code on
// the arrival screen; they vote on the trends, score the tasting and place chips on what gets a next round, and the
// results fill the screen as they land (the tasting averages wait until everyone has scored). The white-space marks, the concept cards and Now, Next and Later go into the
// same session by tapping (nothing is typed on the day), and the Playbook slide near the end puts it all together. The
// talking points (N) name nobody. ?code=REHEARSE runs a separate rehearsal session with its own code; ?results=1 is a
// printable page of what was decided; ?still=1 is for the PDF export (it never writes to the session); #12 or #12.3
// jumps to a slide and build. P opens the presenter view (/host/presenter) in its own window for the laptop's screen:
// the talking points, the clock, the controls, the hand votes, the paper card count, the concept cards and the plan.
// Keys: right, space or click to go on (a click on the slides with things to tap never moves on); left to go back;
// ] and [ next and previous part; S short version; F full screen; N talking points on this screen; P presenter view;
// B blank screen.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSession } from '@/lib/useSession';
import { useSealed } from '@/lib/sealedClient';
import { useLiveSurvey } from '@/lib/liveSurvey';
import { useScale, Clock } from './StageApp';
import { SCENES, SECTIONS, Scene } from '@/lib/scenes';
import { pointsOf, titleOf } from '@/lib/sceneNotes';
import type { SceneProps } from './scenes/ui';
import { Arrival, Prework } from './scenes/Opening';
import { Gap } from './scenes/ActI';
import { Lunch } from './scenes/Close';
import {
  LiveCtx, Live, ShowBrief, Opener, TastingLive, ConceptCanvas, WhiteSpaceShow, Board, Playbook, ShowFilm, FilmCtl, JoinCorner, FIELDS, decided, markLabel,
} from './show/ShowScenes';
import { TeamSince, OurFlavors, Shelf, TrendVote, FlavorSchool, DirectionsMap, Landed } from './show/Deck';
import { starters } from './show/Concepts';
import { unconfirmed } from '@/lib/conceptLibrary';
import { EVENT, TOPICS, RUN, CRITERIA, JAR, JAR_OPTS, SAMPLES } from '@/lib/content';
import { runTiming } from '@/lib/time';
import { PLAN_COLS, planCell } from './show/Plan';
import { showChannel, presenterUrl, ShowMsg } from '@/lib/showLink';
import { tasters as tasterCounts, jarAll, tastingProgress } from '@/lib/state';

type View = (p: SceneProps) => React.ReactNode;
const VIEWS: Record<string, View> = {
  arrival: Arrival, team: TeamSince, ours: OurFlavors, brief: ShowBrief, prework: Prework,
  open: Opener,
  gap: Gap, market: Shelf, signals: TrendVote,
  school: FlavorSchool, map: DirectionsMap, tasting: TastingLive, nextround: Landed,
  whitespace: WhiteSpaceShow, concepts: ConceptCanvas, board: Board, playbook: Playbook, lunch: Lunch,
};
// The scenes where phones are in use: the code stays in the corner for anyone who has not joined.
const VOTING = new Set(['signals', 'tasting', 'nextround']);
// The votes that close when their results go up (see the effect in ShowApp): the vote's key and its slide.
const LOCKS = [{ key: 'signals', id: 'signals' }, { key: 'tasting', id: 'tasting' }, { key: 'directions', id: 'nextround' }]
  .map((l) => ({ ...l, opens: (SCENES.find((x) => x.id === l.id)?.room as { opens?: number } | undefined)?.opens || 0 }));
// The slides with things to tap (day-map cells, the board): a click there never moves the room on.
const STAY = new Set(['whitespace', 'concepts', 'board']);
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
  // A rehearsal with no pre-brief answers of its own shows the live session's (read only, without names), so "Your
  // pre-brief answers" can be rehearsed. The PDF export (?still=1) never reads them.
  const own = Object.keys(s.survey || {}).length > 0;
  const liveSurvey = useLiveSurvey(code, !own && !still);
  const sv = useMemo(() => {
    const x = sealed.data ? { ...s, revealed: sealed.data } : s;
    return own || !Object.keys(liveSurvey).length ? x : { ...x, survey: liveSurvey };
  }, [s, sealed.data, own, liveSurvey]);
  const told = Object.keys(sv.survey || {}).length > 0;
  const n = SCENES.length;
  // "You told us" only appears once someone has answered the pre-brief. S (short) also skips the optional slides and the
  // optional build (the July row). The two directions not in the tasting always show: the room can put chips on them.
  const [short, setShort] = useState(false);
  const skip = useCallback((i: number) => (SCENES[i].id === 'prework' && !told) || (short && !!SCENES[i].optional), [told, short]);
  const skipBuild = useCallback((i: number, b: number) => short && !!SCENES[i].skip?.includes(b), [short]);

  const [pos, setPos] = useState({ i: 0, step: 0 });
  const [notes, setNotes] = useState(false);
  const [blank, setBlank] = useState(false);
  const [hint, setHint] = useState(true);
  // A short message on the TV, such as the check before the tasting scores go up.
  const [toast, setToast] = useState('');
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(''), 8000); return () => clearTimeout(t); }, [toast]);
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
    // Only a move that names this slide resumes: positions saved before the 17-slide deck name nothing, so a session that
    // has them (the live one does) starts from the arrival screen.
    if (!hashed.current && s.scene > 0 && s.sceneId === SCENES[s.scene]?.id) setPos({ i: s.scene, step: s.step });
  }, [status.lastOk, still, mode, s.scene, s.step, s.sceneId]);
  useEffect(() => { if (live.current && !still && !mode) send('goto', { scene: pos.i, step: pos.step, id: SCENES[pos.i].id }); }, [pos, still, mode, send]);
  // Three things close when their results go up, and open again if we go back to the build before: the trend vote (the
  // top three start to open at build 1), the tasting scores (the averages show at build 1, so nobody still scoring sees
  // them and nobody changes a score once the names are out) and the chips. The chips also wait for the room to talk
  // about the chart: they open at build 1 (the slide's `opens`) and close when the top three show at build 2. Moving
  // past the slide closes it too. Hand votes and paper cards from the presenter view still count.
  // The tasting is one way: the build that puts the scores up marks them shown (the vote's `reveal`), and from then on
  // going back to the blind build doesn't reopen scoring, so nobody changes a first reaction after seeing the averages.
  // Only the presenter view's Reopen scoring opens it again (for someone who genuinely hadn't finished). Skipping past
  // the tasting without showing the scores only closes it, so coming back reopens it as before.
  const lockWant = useRef<Record<string, string>>({});
  useEffect(() => {
    if (!live.current || still || mode) return;
    for (const l of LOCKS) {
      const at = SCENES.findIndex((x) => x.id === l.id);
      if (at < 0 || pos.i < at) continue;
      const v = s.votes[l.key];
      let want = pos.i > at || pos.step < l.opens || pos.step >= l.opens + 1 ? 'lock' : 'open';
      if (l.key === 'tasting') {
        if (pos.i === at && pos.step >= 1 && !v?.revealed) want = 'reveal';
        else if (v?.revealed && want === 'open') { lockWant.current[l.key] = ''; continue; }
      }
      if (want === 'reveal' ? !!v?.revealed : (want === 'lock') === !!v?.locked) { lockWant.current[l.key] = ''; continue; }
      if (lockWant.current[l.key] === want) continue;
      lockWant.current[l.key] = want; send('vote', { key: l.key, action: want });
    }
  }, [pos, still, mode, s.votes, send, status.lastOk]);
  // The reveal. The flip is build 2 of the tasting, and skipping past the tasting reveals too. Two repairs keep the phones
  // right: a reveal saved before the samples changed is sent again with the current names (a rehearsal on October 31 kept
  // the old A to D order after the swap), and a rehearsal that goes back before the flip is sealed again, so every
  // run-through tastes blind. The live session is never sealed again.
  const revealSent = useRef(false);
  const repair = useRef('');
  useEffect(() => {
    const ti = SCENES.findIndex((x) => x.id === 'tasting');
    if (!live.current || still || mode || !sealed.data) return;
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
  // The concept slide starts its cards from the top three of the chips vote, once: only on a session that has never had a
  // concept card, so the team's changes (or a cleared card) are never written over.
  const started = useRef(false);
  useEffect(() => {
    if (!live.current || still || mode || started.current || SCENES[pos.i].id !== 'concepts' || !status.lastOk) return;
    if (Object.keys(s.concepts || {}).length) { started.current = true; return; }
    const cards = starters(sv); if (!cards.length) return;
    started.current = true;
    cards.forEach((fields, j) => send('concept', { team: j + 1, slot: 1, fields }));
  }, [pos, still, mode, s.concepts, sv, send, status.lastOk]);

  const posRef = useRef(pos); posRef.current = pos;
  const sRef = useRef(s); sRef.current = s;
  // The blind round closes when the scores go up (build 1 of the tasting). If some phones haven't scored all four, the
  // first press says how many and a second press within ten seconds goes on, so the scores never go up by accident.
  const held = useRef(0);
  const film = useRef<FilmCtl | null>(null); // set while THE FLAVOR RACE is on screen
  const go = useCallback((d: number) => {
    const { i, step } = posRef.current, sc = SCENES[i];
    if (d > 0 && sc.id === 'tasting' && step === 0 && live.current && !still) {
      const left = tastingProgress(sRef.current, SAMPLES.map((x) => x.code)).left;
      if (left > 0 && Date.now() - held.current > 10000) {
        held.current = Date.now();
        setToast(`${left} ${left === 1 ? 'person is' : 'people are'} still scoring. Press again to show the scores.`);
        return;
      }
      held.current = 0; setToast('');
    }
    if (d > 0) {
      let b = step + 1; while (b <= sc.builds && skipBuild(i, b)) b++;
      if (b <= sc.builds) return setPos({ i, step: b });
      let j = i + 1; while (j < n && skip(j)) j++;
      if (j < n) setPos({ i: j, step: 0 });
    } else {
      let b = step - 1; while (b > 0 && skipBuild(i, b)) b--;
      if (step > 0) return setPos({ i, step: Math.max(0, b) });
      let j = i - 1; while (j > 0 && skip(j)) j--;
      if (j >= 0) { let last = SCENES[j].builds; while (last > 0 && skipBuild(j, last)) last--; setPos({ i: j, step: last }); }
    }
  }, [n, skip, skipBuild, still]);
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
      if (e.key === ' ' && el.closest('button')) return; // a button reached with Tab: Space presses it, nothing else
      // On the film: Space, Enter or K pauses and plays, R starts it again; the arrows still move on or back.
      if (film.current && [' ', 'Enter', 'k', 'K', 'r', 'R'].includes(e.key)) { e.preventDefault(); film.current.act(/r/i.test(e.key) ? 'restart' : 'toggle'); return; }
      if (['ArrowRight', 'PageDown', ' ', 'Enter'].includes(e.key)) { e.preventDefault(); go(1); }
      else if (['ArrowLeft', 'PageUp', 'Backspace'].includes(e.key)) { e.preventDefault(); go(-1); }
      else if (e.key === 'Home') setPos({ i: 0, step: 0 });
      else if (e.key === 'End') setPos({ i: n - 1, step: 0 });
      else if (e.key === ']') jump(1);
      else if (e.key === '[') jump(-1);
      else if (e.key === 's' || e.key === 'S') setShort((x) => !x);
      else if (e.key === 'n' || e.key === 'N') setNotes((x) => !x);
      else if (e.key === 'p' || e.key === 'P') window.open(presenterUrl(code), 'pb-presenter-' + code, 'popup,width=1280,height=820');
      else if (e.key === 'b' || e.key === 'B') setBlank((x) => !x);
      else if (e.key === 'f' || e.key === 'F') { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen?.(); }
    };
    addEventListener('keydown', kd); return () => removeEventListener('keydown', kd);
  }, [go, jump, n, code]);

  // The presenter view: tell it where we are on every move, and do what it asks.
  const shownList = useMemo(() => SCENES.filter((_, i) => !skip(i)), [skip]);
  const link = useRef<BroadcastChannel | null>(null);
  const posMsg = useCallback((): ShowMsg => {
    const { i, step } = posRef.current;
    const nx = SCENES.slice(i + 1).find((_, j) => !skip(i + 1 + j)); const next = nx ? titleOf(nx) : '';
    const pv = SCENES.slice(0, i).reverse().find((x) => !skip(x.n)); const prev = pv ? titleOf(pv) : '';
    let nb = step + 1; while (nb <= SCENES[i].builds && skipBuild(i, nb)) nb++;
    return { t: 'pos', pos: { i, step, short, blank, at: shownList.indexOf(SCENES[i]) + 1, total: shownList.length, next, prev, build: nb <= SCENES[i].builds, film: film.current?.state(), told } };
  }, [skip, skipBuild, short, blank, shownList, told]);
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
    };
    return () => { ch.close(); link.current = null; };
  }, [code, still, mode, go, jump, n, posMsg]);
  useEffect(() => {
    link.current?.postMessage(posMsg());
    const iv = setInterval(() => link.current?.postMessage(posMsg()), 2000); // a heartbeat, so the presenter view knows we're here
    return () => clearInterval(iv);
  }, [pos, posMsg]);
  const filmChanged = useCallback(() => link.current?.postMessage(posMsg()), [posMsg]);

  const sc = SCENES[Math.min(pos.i, n - 1)];
  useEffect(() => { document.documentElement.dataset.theme = mode === 'results' ? 'a' : sc.theme; }, [sc.theme, mode]);
  const joinUrl = origin ? `${origin}/j/${code}?k=${k}` : '';
  const goStep = useCallback((b: number) => setPos((p) => ({ i: p.i, step: Math.max(0, Math.min(SCENES[p.i].builds, b)) })), []);
  const ctxLive: Live = useMemo(() => ({ send, still, joinUrl, goStep }), [send, still, joinUrl, goStep]);
  const ctx = useMemo(() => ({ code, k, origin, joinUrl }), [code, k, origin, joinUrl]);
  // The export script (scripts/export-show.mjs) reads the run of show from here, and rehearsal scripts read the join link.
  useEffect(() => { Object.assign(window, { __join: joinUrl, __run: RUN, __show: SCENES.filter((_, i) => !skip(i)).map((x) => ({ id: x.id, title: titleOf(x), builds: x.builds, skip: x.skip || [], block: x.block, optional: !!x.optional, notes: pointsOf(x), ch: x.chapter, at: SCENES.findIndex((y) => y.id === x.id) + 1 })) }); }, [skip, joinUrl]);

  if (mode === 'results') return <Results s={sv} code={code} />;

  const click = (e: React.MouseEvent) => {
    if (STAY.has(sc.id) || (e.target as HTMLElement).closest('input, textarea, button, label, video, a, [data-nonav]')) return;
    go(e.clientX < innerWidth / 3 ? -1 : 1);
  };
  const key = sc.id.replace(/\d+$/, '');
  const View = VIEWS[key];
  const idx = Number(sc.id.match(/\d+$/)?.[0] || 0);
  const shown = shownList;
  const nextStop = SECTIONS.map((id) => SCENES.find((x) => x.id === id)!).find((x) => x.n > pos.i);
  const tm = runTiming(sc.block);
  const timing = tm ? `This part: ${tm.from} to ${tm.to} · now ${tm.now}${tm.over ? ` · ${tm.over} min over` : ''}` : '';
  const at = shown.indexOf(sc) + 1;
  return (
    <LiveCtx.Provider value={ctxLive}>
      <div className={'stage-host show' + (still ? ' still' : '')} style={{ display: 'flex' }} onClick={click} onMouseDown={(e) => { if ((e.target as HTMLElement).closest('button')) e.preventDefault(); }}>
        <div className="stage-wrap" style={{ width: 1920 * scale, height: 1080 * scale }}>
          <div className="stage" data-theme={sc.theme} style={{ transform: `scale(${scale})` }}>
            <div className="stage-scene" key={sc.id} data-step={pos.step} data-scene={sc.id}>
              {sc.id === 'film' ? <ShowFilm still={still} ctl={film} onChange={filmChanged} /> : View ? <View s={sv} step={pos.step} scene={sc} idx={idx} ctx={ctx} send={send} /> : null}
            </div>
            {/* The film plays clean: no clock, part name or progress bars over the picture. */}
            {sc.chapter >= 0 && sc.id !== 'film' && <Chrome i={pos.i} clock={!still} />}
            {VOTING.has(sc.id) && joinUrl && <JoinCorner url={joinUrl} />}
            <div className="grain" />
            <div className={'blank' + (blank ? ' on' : '')} />
            <div className="theme-veil" key={'v' + sc.theme} />
          </div>
        </div>
        {notes && (
          <aside className="show-notes" data-nonav onClick={(e) => e.stopPropagation()}>
            <span className="k">{at} of {shown.length}{sc.builds ? ` · build ${pos.step} of ${sc.builds}` : ''}{code !== EVENT.code ? ` · rehearsal ${code}` : ''} · {Object.keys(s.participants).length} joined</span>
            <b>{titleOf(sc)}</b>
            <ul>{pointsOf(sc).map((x, j) => <li key={j}>{x}</li>)}</ul>
            {pos.i + 1 < n && <small>Next: {(() => { const x = SCENES.slice(pos.i + 1).find((_, j) => !skip(pos.i + 1 + j)); return x ? titleOf(x) : ''; })()}{nextStop ? ` · ] jumps to ${nextStop.title}` : ''}</small>}
            <small>{timing}{short ? ' · Short version: optional builds skipped (S to undo)' : ''}</small>
          </aside>
        )}
        {toast && <div className="show-toast" role="status">{toast}</div>}
        {hint && <div className="show-hint">Right arrow or click to go on · Left arrow back · ] next part · S short version · F full screen · P presenter view</div>}
        {code !== EVENT.code && !still && <div className="show-rehearse">Rehearsal session {code}. Votes here never reach the live session.{sc.id === 'prework' && !own && told ? ' These pre-brief answers are the live ones.' : ''}</div>}
      </div>
    </LiveCtx.Provider>
  );
}

// The part bar: the four objectives, and how far through the current one the morning is.
function Chrome({ i, clock }: { i: number; clock: boolean }) {
  const ch = SCENES[i].chapter;
  const inCh = SCENES.map((x, j) => (x.chapter === ch ? j : -1)).filter((j) => j >= 0);
  const pct = Math.round(((inCh.indexOf(i) + 1) / inCh.length) * 100);
  return (
    <>
      <div className="chrome-top"><div className="brand"><i />The Future of Freshness</div><div className="act">Part {ch + 1} <b>{TOPICS[ch].title}</b></div><div className="live">{clock && <Clock />}</div></div>
      <div className="progress" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {TOPICS.map((t, j) => <div key={t.title} className={j === ch ? 'on' : j < ch ? 'done' : ''} style={{ ['--p' as any]: `${j < ch ? 100 : j === ch ? pct : 0}%` }}><span>0{j + 1}</span>{t.title}</div>)}
      </div>
    </>
  );
}

// Paper cards counted on the day and not yet typed in, as a line under the tasting.
export const paperNote = (s: any) => {
  const left = Math.max(0, (s.paperCards || 0) - tasterCounts(s).cards);
  return left ? `Phone scores only so far: ${left} paper ${left === 1 ? 'card is' : 'cards are'} still to be typed in.` : '';
};

// What we decided, on one printable page: open /host?results=1 after the session and print it to PDF.
function Results({ s, code }: { s: any; code: string }) {
  const d = decided(s);
  const cs = d.concepts;
  const marks: string[] = s.marks || [];
  return (
    <main className="show-results">
      <p className="k">The Flavor Playbook · draft · {EVENT.date} · {EVENT.room} room, Princeton{code !== EVENT.code ? ` · rehearsal ${code}` : ''}</p>
      <h1 className="h1">What we <span className="it">decided.</span></h1>
      <p className="sr-sub">{Object.keys(s.participants).length} people joined on their phones.</p>
      <section><h2 className="h3">The three trends that matter most</h2><ul>{d.signals.map((x) => <li key={x.t}>{x.t} <em>{x.n} votes</em></li>)}{!d.signals.length && <li className="ghost">No votes yet</li>}</ul></section>
      <section><h2 className="h3">The tasting</h2>{paperNote(s) && <p className="sr-dots">{paperNote(s)}</p>}<table className="sr-taste"><thead><tr><th>Sample</th>{CRITERIA.map((c) => <th key={c.key}>{c.l}</th>)}{JAR.map((j) => <th key={j.key}>{j.l}</th>)}<th>Scores</th></tr></thead><tbody>{d.tasting.map((x) => <tr key={x.code}><td>{x.code}. {x.name}</td><td>{x.sum.n ? x.sum.appeal.toFixed(1) : ''}</td><td>{x.sum.n ? x.sum.feels.toFixed(1) : ''}</td><td>{x.sum.n ? x.sum.newness.toFixed(1) : ''}</td>{JAR.map((j) => <td key={j.key}>{jarAll(x.sum[j.key], JAR_OPTS)}</td>)}<td>{x.sum.n}</td></tr>)}</tbody></table></section>
      <section><h2 className="h3">What gets a next round</h2><ul>{d.directions.map((x) => <li key={x.t}>{x.t} <em>{x.n} chips</em></li>)}{!d.directions.length && <li className="ghost">No votes yet</li>}</ul></section>
      <section><h2 className="h3">Concepts</h2>{cs.length ? cs.map((c: any) => <div key={c.id} className="sr-concept"><b>{c.name} <em className={c.agreed ? '' : 'tbc'}>{c.agreed ? 'Agreed' : 'Proposed, not agreed yet'}</em></b><dl>{FIELDS.map((f) => <div key={f.f} className={f.key !== 'why' && unconfirmed(c[f.key]) ? 'tbc' : ''}><dt>{f.l}</dt><dd>{c[f.key] || <span className="ghost">To agree</span>}</dd></div>)}</dl></div>) : <p className="ghost">None yet</p>}</section>
      <section><h2 className="h3">Now, Next, Later</h2>{d.plan.length ? <table className="sr-plan"><thead><tr><th /><th>Direction</th>{PLAN_COLS.map((c) => <th key={c.f}>{c.l}</th>)}</tr></thead><tbody>{d.plan.map((r) => <tr key={r.id}><td>{r.label}</td><td><b>{r.what || 'Untitled'}</b></td>{PLAN_COLS.map((c) => { const v = planCell(r, c.f); return <td key={c.f} className={unconfirmed(v) ? 'tbc' : ''}>{v || <span className="ghost">To agree</span>}{c.f === 'brief' && r.draft && v ? <em className="ghost"> (draft, finalized in the write-up)</em> : null}</td>; })}</tr>)}</tbody></table> : <p className="ghost">Nothing yet</p>}</section>
      <section><h2 className="h3">Where the ideas could fit in a day</h2><ul>{marks.map((c) => <li key={c}>{markLabel(s, c)}</li>)}{!marks.length && <li className="ghost">No cells marked</li>}</ul></section>
      <p className="src">Confidential. These are development samples and concepts made for this session. They aren’t finished products or claims.</p>
      <div className="sr-actions"><button className="sr-print" onClick={() => print()}>Print or save as PDF</button><a href={code === EVENT.code ? '/host/writeup' : `/host/writeup?code=${code}`}>Open the Playbook write-up</a></div>
    </main>
  );
}


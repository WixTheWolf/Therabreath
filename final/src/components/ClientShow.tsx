'use client';
// The presentation for Church & Dwight after the morning (/cd/show): the same slides as /host, to look through at
// their own pace. It only reads the live session (the room's answers, and the follow-up scores and chips as they come
// in) and never writes to it: no slide moves, no votes opened or closed, no reveal, nothing tapped on the slides is
// sent. The talking points, the presenter view, the clock and the rehearsal tools aren't part of it, so this file
// imports nothing team-only (not ShowApp, StageApp or sceneNotes).
// Keys: right, space or click to go on; left to go back; Home and End; F full screen; 1 to 7 on the trends slide.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSession } from '@/lib/useSession';
import { SCENES } from '@/lib/scenes';
import { TOPICS } from '@/lib/content';
import type { SceneProps } from './scenes/ui';
import { Arrival, Prework } from './scenes/Opening';
import { Gap } from './scenes/ActI';
import { Lunch } from './scenes/Close';
import { LiveCtx, Live, ShowBrief, Opener, TastingLive, ConceptCanvas, WhiteSpaceShow, Board, Playbook, ShowFilm, FilmCtl } from './show/ShowScenes';
import { TeamSince, OurFlavors, Shelf, TrendVote, FlavorSchool, DirectionsMap, Landed } from './show/Deck';

type View = (p: SceneProps) => React.ReactNode;
const VIEWS: Record<string, View> = {
  arrival: Arrival, team: TeamSince, ours: OurFlavors, brief: ShowBrief, prework: Prework,
  open: Opener,
  gap: Gap, market: Shelf, signals: TrendVote,
  school: FlavorSchool, map: DirectionsMap, tasting: TastingLive, nextround: Landed,
  whitespace: WhiteSpaceShow, concepts: ConceptCanvas, board: Board, playbook: Playbook, lunch: Lunch,
};
// The slides with things to tap: a click there never moves on (and the taps themselves go nowhere here).
const STAY = new Set(['whitespace', 'concepts', 'board']);
const nothing = () => undefined; // every send from a slide lands here

function useScale(w = 1920, h = 1080) {
  const [s, setS] = useState(0.5);
  useEffect(() => { const f = () => setS(Math.min(window.innerWidth / w, window.innerHeight / h)); f(); addEventListener('resize', f); return () => removeEventListener('resize', f); }, [w, h]);
  return s;
}

export default function ClientShow({ code, k }: { code: string; k: string }) {
  const { state: s } = useSession(code, { k, interval: 4000 });
  const told = Object.keys(s.survey || {}).length > 0;
  const n = SCENES.length;
  // "You told us" shows once the pre-brief answers have loaded, as in the room.
  const skip = useCallback((i: number) => SCENES[i].id === 'prework' && !told, [told]);
  const [pos, setPos] = useState({ i: 0, step: 0 });
  const [pick, setPick] = useState(0);
  const [hint, setHint] = useState(true);
  const scale = useScale(1920, 1080);
  const film = useRef<FilmCtl | null>(null);
  const posRef = useRef(pos); posRef.current = pos;

  // #12 or #12.3: slide 12, build 3, so a slide can be linked to.
  const fromHash = useCallback(() => {
    const m = location.hash.match(/^#(\d+)(?:\.(\d+))?$/); if (!m) return;
    const i = Math.max(0, Math.min(n - 1, Number(m[1]) - 1));
    setPos({ i, step: Math.min(SCENES[i].builds, Number(m[2] || 0)) });
  }, [n]);
  useEffect(() => {
    fromHash(); addEventListener('hashchange', fromHash);
    const t = setTimeout(() => setHint(false), 7000);
    return () => { clearTimeout(t); removeEventListener('hashchange', fromHash); };
  }, [fromHash]);
  useEffect(() => { setPick(0); }, [pos.i, pos.step]);

  const go = useCallback((d: number) => {
    const { i, step } = posRef.current, sc = SCENES[i];
    if (d > 0) {
      if (step < sc.builds) return setPos({ i, step: step + 1 });
      let j = i + 1; while (j < n && skip(j)) j++;
      if (j < n) setPos({ i: j, step: 0 });
    } else {
      if (step > 0) return setPos({ i, step: step - 1 });
      let j = i - 1; while (j > 0 && skip(j)) j--;
      if (j >= 0) setPos({ i: j, step: SCENES[j].builds });
    }
  }, [n, skip]);
  useEffect(() => {
    const kd = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (el.closest('input, textarea')) return;
      if (e.key === ' ' && el.closest('button')) return;
      if (film.current && [' ', 'Enter', 'k', 'K', 'r', 'R'].includes(e.key)) { e.preventDefault(); film.current.act(/r/i.test(e.key) ? 'restart' : 'toggle'); return; }
      if (['ArrowRight', 'PageDown', ' ', 'Enter'].includes(e.key)) { e.preventDefault(); go(1); }
      else if (['ArrowLeft', 'PageUp', 'Backspace'].includes(e.key)) { e.preventDefault(); go(-1); }
      else if (e.key === 'Home') setPos({ i: 0, step: 0 });
      else if (e.key === 'End') setPos({ i: n - 1, step: 0 });
      else if (e.key === 'f' || e.key === 'F') { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen?.(); }
      else if (/^[0-7]$/.test(e.key) && SCENES[posRef.current.i]?.id === 'signals') { const x = Number(e.key); setPick((p) => (x === p ? 0 : x)); }
      else if (e.key === 'Escape') setPick(0);
    };
    addEventListener('keydown', kd); return () => removeEventListener('keydown', kd);
  }, [go, n]);

  const sc = SCENES[Math.min(pos.i, n - 1)];
  useEffect(() => { document.documentElement.dataset.theme = sc.theme; }, [sc.theme]);
  const goStep = useCallback((b: number) => setPos((p) => ({ i: p.i, step: Math.max(0, Math.min(SCENES[p.i].builds, b)) })), []);
  // No join link: the room is closed, so the arrival slide shows no code to scan.
  const ctxLive: Live = useMemo(() => ({ send: nothing, still: false, joinUrl: '', goStep }), [goStep]);
  const ctx = useMemo(() => ({ code, k, origin: '', joinUrl: '' }), [code, k]);
  const shown = useMemo(() => SCENES.filter((_, i) => !skip(i)), [skip]);

  const click = (e: React.MouseEvent) => {
    if (STAY.has(sc.id) || (e.target as HTMLElement).closest('input, textarea, button, label, video, a, [data-nonav]')) return;
    go(e.clientX < innerWidth / 3 ? -1 : 1);
  };
  const View = VIEWS[sc.id.replace(/\d+$/, '')];
  const idx = Number(sc.id.match(/\d+$/)?.[0] || 0);
  return (
    <LiveCtx.Provider value={ctxLive}>
      <div className="stage-host show cd-show" style={{ display: 'flex' }} onClick={click} onMouseDown={(e) => { if ((e.target as HTMLElement).closest('button')) e.preventDefault(); }}>
        <div className="stage-wrap" style={{ width: 1920 * scale, height: 1080 * scale }}>
          <div className="stage" data-theme={sc.theme} style={{ transform: `scale(${scale})` }}>
            <div className="stage-scene" key={sc.id} data-step={pos.step} data-scene={sc.id}>
              {sc.id === 'film' ? <ShowFilm still={false} ctl={film} /> : View ? <View s={s} step={pos.step} scene={sc} idx={idx} ctx={ctx} send={nothing as any} pick={pick} /> : null}
            </div>
            {sc.chapter >= 0 && sc.id !== 'film' && <Chrome i={pos.i} />}
            <div className="grain" />
            <div className="theme-veil" key={'v' + sc.theme} />
          </div>
        </div>
        <nav className="cd-nav" data-nonav aria-label="Slides">
          <button onClick={(e) => { e.stopPropagation(); go(-1); }} aria-label="Back">‹</button>
          <span className="num">{shown.indexOf(sc) + 1} / {shown.length}</span>
          <button onClick={(e) => { e.stopPropagation(); go(1); }} aria-label="Next">›</button>
        </nav>
        {hint && <div className="show-hint">Right arrow or click to go on · Left arrow back · F full screen</div>}
      </div>
    </LiveCtx.Provider>
  );
}

// The part bar: the four objectives, and how far through the current one the slide is.
function Chrome({ i }: { i: number }) {
  const ch = SCENES[i].chapter;
  const inCh = SCENES.map((x, j) => (x.chapter === ch ? j : -1)).filter((j) => j >= 0);
  const pct = Math.round(((inCh.indexOf(i) + 1) / inCh.length) * 100);
  return (
    <>
      <div className="chrome-top"><div className="brand"><i />The Future of Freshness</div><div className="act">Part {ch + 1} <b>{TOPICS[ch].title}</b></div><div className="live" /></div>
      <div className="progress" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {TOPICS.map((t, j) => <div key={t.title} className={j === ch ? 'on' : j < ch ? 'done' : ''} style={{ ['--p' as any]: `${j < ch ? 100 : j === ch ? pct : 0}%` }}><span>0{j + 1}</span>{t.title}</div>)}
      </div>
    </>
  );
}

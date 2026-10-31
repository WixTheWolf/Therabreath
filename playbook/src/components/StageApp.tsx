'use client';
// STAGE: the room display. A fixed 1920 x 1080 canvas scaled to any screen.
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSession } from '@/lib/useSession';
import { SCENES } from '@/lib/scenes';
import { CHAPTERS } from '@/lib/content';
import { SCENE_VIEWS } from './scenes';
import ConsolePanel from './ConsolePanel';

export type Ctx = { code: string; k: string; joinUrl: string; origin: string };

export function useScale(w = 1920, h = 1080) {
  const [s, setS] = useState(0.5);
  useEffect(() => { const f = () => setS(Math.min(window.innerWidth / w, window.innerHeight / h)); f(); window.addEventListener('resize', f); return () => window.removeEventListener('resize', f); }, [w, h]);
  return s;
}

export function Clock() {
  const [t, setT] = useState('');
  useEffect(() => { const f = () => setT(new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: false })); f(); const i = setInterval(f, 10000); return () => clearInterval(i); }, []);
  return <>{t}</>;
}

export default function StageApp({ code, k, withConsole }: { code: string; k: string; withConsole?: boolean }) {
  const sess = useSession(code, { admin: true, interval: 400 });
  const { state: s, send } = sess;
  const scale = useScale(withConsole ? 1920 + 560 : 1920, 1080);
  const scene = SCENES[s.scene];
  const [origin, setOrigin] = useState('');
  useEffect(() => setOrigin(location.origin), []);
  const ctx: Ctx = useMemo(() => ({ code, k, origin, joinUrl: `${origin}/j/${code}?k=${k}` }), [code, k, origin]);

  // keyboard: arrows and space step through builds and scenes; B blanks; F full screen
  const sref = useRef(s); sref.current = s;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest('input,textarea,select')) return;
      const st = sref.current, sc = SCENES[st.scene];
      if (['ArrowRight', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); if (st.step < sc.builds) send('goto', { scene: st.scene, step: st.step + 1 }); else if (st.scene < SCENES.length - 1) send('goto', { scene: st.scene + 1, step: 0 }); }
      if (['ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); if (st.step > 0) send('goto', { scene: st.scene, step: st.step - 1 }); else if (st.scene > 0) send('goto', { scene: st.scene - 1, step: SCENES[st.scene - 1].builds }); }
      if (e.key === 'b' || e.key === 'B') send('flag', { name: 'blank', value: !st.blank });
      if (e.key === 'f' || e.key === 'F') { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen?.(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [send]);

  const View = SCENE_VIEWS[scene.id.replace(/\d+$/, '')] || SCENE_VIEWS[scene.id];
  const idx = Number(scene.id.match(/\d+$/)?.[0] || 0);
  const theme = scene.theme;

  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);

  return (
    <div className="stage-host" style={{ display: 'flex' }}>
      <div className="stage-wrap" style={{ width: 1920 * scale, height: 1080 * scale }}>
        <div className="stage" data-theme={theme} style={{ transform: `scale(${scale})` }}>
          <div className="stage-scene" key={scene.id} data-step={s.step}>
            {View ? <View s={s} step={s.step} scene={scene} idx={idx} ctx={ctx} send={send} /> : <div className="missing">{scene.title}</div>}
          </div>
          {scene.chapter >= 0 && scene.id !== 'assemble' && <Chrome act={scene.act} chapter={scene.chapter} s={s} />}
          <TimerBadge s={s} />
          {s.spotlight && <Spotlight s={s} />}
          <div className={'blank' + (s.blank ? ' on' : '')} />
          <div className="theme-veil" key={'v' + theme} />
        </div>
      </div>
      {withConsole && <div className="stage-side" style={{ width: 560 * scale, height: 1080 * scale }}><div style={{ width: 560, height: 1080, transform: `scale(${scale})`, transformOrigin: '0 0' }}><ConsolePanel sess={sess} ctx={ctx} compact /></div></div>}
    </div>
  );
}

function Chrome({ act, chapter, s }: { act: string; chapter: number; s: any }) {
  const [a, b] = act.split(' · ');
  // progress within the chapter: share of that chapter's scenes already passed
  const inCh = SCENES.filter((x) => x.chapter === chapter);
  const pos = inCh.findIndex((x) => x.n === SCENES[s.scene].n);
  const pct = Math.round(((pos + 1) / inCh.length) * 100);
  return (
    <>
      <div className="chrome-top"><div className="brand"><i />The Flavor Playbook</div><div className="act">{a} {b && <b>{b}</b>}</div><div className="live"><Clock /></div></div>
      <div className="progress">{CHAPTERS.map((c, i) => <div key={c} className={i === chapter ? 'on' : i < chapter ? 'done' : ''} style={{ ['--p' as any]: `${i < chapter ? 100 : i === chapter ? pct : 0}%` }}><span>0{i + 1}</span>{c}</div>)}</div>
    </>
  );
}

function TimerBadge({ s }: { s: any }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const i = setInterval(() => setNow(Date.now()), 250); return () => clearInterval(i); }, []);
  const t = s.timer; if (!t.total) return null;
  const rem = t.running ? Math.max(0, (t.endsAt - now) / 1000) : t.remaining;
  if (SCENES[s.scene].id === 'canvas') return null; // the canvas scene draws its own glass timer
  const m = Math.floor(rem / 60), sec = Math.floor(rem % 60);
  return <div className={'timer-badge' + (rem < 60 ? ' low' : '')}><i style={{ ['--p' as any]: `${(rem / t.total) * 100}%` }} />{m}:{String(sec).padStart(2, '0')}</div>;
}

function Spotlight({ s }: { s: any }) {
  const { kind, ref } = s.spotlight;
  let body: React.ReactNode = ref;
  if (kind === 'concept') { const c = s.concepts[ref]; body = c ? <><div className="k">Team {c.team}</div><div className="h1">{c.name || 'Untitled concept'}</div><p className="lede">{[c.first, c.heart, c.finish].filter(Boolean).join(' · ')}</p></> : ref; }
  if (kind === 'word') body = <div className="h1 it">&ldquo;{ref}&rdquo;</div>;
  return <div className="spotlight"><div className="spot-in">{body}</div></div>;
}

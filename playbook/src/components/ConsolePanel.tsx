'use client';
// CONSOLE: the facilitators' remote. Scenes, builds, notes, votes, timers, placements, simulator.
import { useEffect, useState } from 'react';
import { SCENES, EXECUTIVE } from '@/lib/scenes';
import { MISSIONS, SIGNALS, TERRITORIES, SAMPLES, WHO_CHIPS, MOLECULES, SEEDS, CODE, HORIZONS, ROLES, SEGMENTS, SURVEY } from '@/lib/content';
import { people, uid } from '@/lib/state';
import { candidates, SEASONS } from './scenes/Build';
import type { Ctx } from './StageApp';

const NAMES = ['Ross', 'Priya', 'Dana', 'Marcus', 'Jen', 'Tom', 'Aisha', 'Luis', 'Kate', 'Sam', 'Nora', 'Ben'];
const pickN = <T,>(a: T[], n: number) => [...a].sort(() => Math.random() - 0.5).slice(0, n);
const rnd = (a: number, b: number) => Math.round(a + Math.random() * (b - a));

export default function ConsolePanel({ sess, ctx, compact }: { sess: any; ctx: Ctx; compact?: boolean }) {
  const { state: s, send, sendMany, status } = sess;
  const scene = SCENES[s.scene];
  const room = scene.room as any;
  const [exec, setExec] = useState(false);
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const i = setInterval(() => setNow(Date.now()), 500); return () => clearInterval(i); }, []);
  const list = exec ? SCENES.filter((x) => EXECUTIVE.includes(x.id)) : SCENES;
  const go = (i: number, step = 0) => send('goto', { scene: i, step });
  const next = () => (s.step < scene.builds ? go(s.scene, s.step + 1) : s.scene < SCENES.length - 1 && go(s.scene + 1));
  const prev = () => (s.step > 0 ? go(s.scene, s.step - 1) : s.scene > 0 && go(s.scene - 1, SCENES[s.scene - 1].builds));
  const voteKey = room.key as string | undefined;
  const v = voteKey ? s.votes[voteKey] : null;
  const t = s.timer; const rem = t.total ? (t.running ? Math.max(0, (t.endsAt - now) / 1000) : t.remaining) : 0;
  const ps = people(s);
  const age = status.lastOk ? Math.round((now - status.lastOk) / 1000) : null;

  // Rehearsal simulator: twelve phones that join and answer whatever the current scene asks.
  const simulate = () => {
    const sims = NAMES.map((n, i) => ({ pid: 'sim-' + i, name: n }));
    const evs: any[] = sims.filter((p) => !s.participants[p.pid]).map((p, i) => ({ kind: 'join', pid: p.pid, data: { name: p.name, sim: true }, t: Date.now() + i }));
    sims.forEach((p, i) => {
      if (!s.participants[p.pid]?.team) evs.push({ kind: 'team', pid: p.pid, data: { team: (i % 3) + 1 } });
      if (!s.survey[p.pid]) evs.push({ kind: 'survey', pid: p.pid, data: { name: p.name, consumer: pickN(SURVEY.consumer.options, 1)[0], moment: pickN(SURVEY.moment.options, 1)[0], veto: pickN(['Garlic', 'Pickle', 'Coffee', 'Bacon', 'Cilantro', 'Blue cheese'], 1)[0] } });
      if (room.kind === 'pick') evs.push({ kind: 'pick', pid: p.pid, data: { key: room.key, value: pickN(SIGNALS.map((x) => x.id), room.max) } });
      if (room.kind === 'chips') { const o: Record<string, number> = {}; for (let k = 0; k < room.total; k++) { const id = pickN(TERRITORIES.map((x) => x.id), 1)[0]; o[id] = (o[id] || 0) + 1; } evs.push({ kind: 'pick', pid: p.pid, data: { key: room.key, value: o } }); }
      if (room.kind === 'dots') { const ids = candidates(s).slice(0, 8).map((x) => x.id); const o: Record<string, number> = {}; for (let k = 0; k < room.total; k++) { const id = pickN(ids, 1)[0]; o[id] = (o[id] || 0) + 1; } evs.push({ kind: 'pick', pid: p.pid, data: { key: room.key, value: o } }); }
      if (room.kind === 'taste') SAMPLES.forEach((x) => evs.push({ kind: 'rate', pid: p.pid, data: { sample: x.code, appeal: rnd(2, 5), feels: rnd(2, 5), newness: rnd(1, 5), who: pickN(WHO_CHIPS, rnd(1, 2)), word: pickN(['Cozy', 'Bright', 'Clean', 'Surprising', 'Bold', 'Soft', 'Crisp', 'Warm', 'Grown-up', 'Fun'], 1)[0] } }));
      if (room.kind === 'guess') { const m = MOLECULES[Math.min(6, Math.floor(s.step / 2))]; evs.push({ kind: 'guess', pid: p.pid, data: { molecule: m.id, answer: Math.random() < 0.45 ? m.source : pickN(MOLECULES.map((x) => x.source), 1)[0] } }); }
      if (room.kind === 'code') CODE.forEach((c) => evs.push({ kind: 'react', pid: p.pid, data: { target: 'code' + c.n, value: Math.random() < 0.8 ? 'keep' : 'edit' } }));
    });
    if (room.kind === 'canvas' || scene.id === 'pitches') [1, 2, 3].forEach((team) => { const sd = SEEDS[team * 3]; evs.push({ kind: 'concept', data: { team, slot: 1, fields: { name: `${sd.name} (rehearsal)`, segment: SEGMENTS[team], occasion: sd.occasion, first: 'A bright opening', heart: sd.idea.split(':')[0].slice(0, 60), finish: 'A clean, cool finish', format: sd.format, incremental: sd.incremental, horizon: sd.horizon, sensation: ['Cooling linger'] } } }); });
    sendMany(evs);
  };

  const exportUrl = (fmt: string) => `/api/s/${ctx.code}/export${fmt === 'csv' ? '?format=csv' : ''}`;

  return (
    <div className={'console' + (compact ? ' compact' : '')} data-theme="b">
      <header className="cx-head">
        <div><b>Console</b> <code>{ctx.code}</code></div>
        <div className={'cx-health ' + (status.online ? 'ok' : 'bad')}><i />{status.online ? `${status.store || 'store'} · ${status.rtt}ms${status.realtime ? ' · realtime' : ''}` : `offline${age ? ` ${age}s` : ''}`}</div>
      </header>

      <section className="cx-now">
        <div className="k">{scene.act} · {s.scene} of {SCENES.length - 1}{scene.minutes ? ` · ${scene.minutes} min` : ''}</div>
        <h2>{scene.title}</h2>
        <div className="cx-steps">{Array.from({ length: scene.builds + 1 }, (_, i) => <button key={i} className={i === s.step ? 'on' : i < s.step ? 'done' : ''} onClick={() => go(s.scene, i)}>{i}</button>)}</div>
        <p className="cx-notes">{scene.notes}</p>
        <div className="cx-nav"><button onClick={prev}>Back</button><button className="primary" onClick={next}>Next</button></div>
      </section>

      {voteKey && (
        <section className="cx-box">
          <div className="k">Vote · {voteKey} · {Object.keys(v?.picks || {}).length} in</div>
          <div className="cx-row">
            <button className={v?.open ? 'on' : ''} onClick={() => send('vote', { key: voteKey, action: 'open' })}>Open</button>
            <button className={v?.locked && !v?.revealed ? 'on' : ''} onClick={() => send('vote', { key: voteKey, action: 'lock' })}>Lock</button>
            <button className={v?.revealed ? 'on' : ''} onClick={() => send('vote', { key: voteKey, action: 'reveal' })}>Reveal</button>
            <button onClick={() => confirm('Reset this vote?') && send('vote', { key: voteKey, action: 'reset' })}>Reset</button>
          </div>
        </section>
      )}

      <section className="cx-box">
        <div className="k">Timer {t.total ? `· ${Math.floor(rem / 60)}:${String(Math.floor(rem % 60)).padStart(2, '0')}` : ''}</div>
        <div className="cx-row">
          {[2, 3, 7, 15].map((m) => <button key={m} onClick={() => send('timer', { action: 'start', secs: m * 60 })}>{m}m</button>)}
          <button onClick={() => send('timer', { action: t.running ? 'pause' : 'resume' })}>{t.running ? 'Pause' : 'Resume'}</button>
          <button onClick={() => send('timer', { action: 'add', secs: 60 })}>+1m</button>
          <button onClick={() => send('timer', { action: 'stop' })}>Stop</button>
        </div>
      </section>

      {scene.id === 'missions' && (
        <section className="cx-box">
          <div className="k">Missions</div>
          {[1, 2, 3].map((team) => <label key={team} className="cx-sel"><span>Team {team}</span><select value={s.missions[team - 1]} onChange={(e) => send('mission', { team, mission: e.target.value })}>{MISSIONS.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}</select></label>)}
        </section>
      )}

      {(scene.id === 'pipeline' || scene.id === 'calendar') && (
        <section className="cx-box">
          <div className="k">{scene.id === 'pipeline' ? 'Place on the pipeline' : 'Drop windows'}</div>
          <div className="cx-place">
            {candidates(s).slice(0, 12).map((x) => (
              <div key={x.id} className="cx-item">
                <span>{x.name}{x.dots ? ` · ${x.dots}` : ''}</span>
                {scene.id === 'pipeline' ? (
                  <>
                    <select value={s.placements[x.id]?.horizon || ''} onChange={(e) => send('place', { ref: x.id, horizon: e.target.value, role: s.placements[x.id]?.role || 'Expanders' })}><option value="">Unplaced</option>{HORIZONS.map((h) => <option key={h.id}>{h.id}</option>)}</select>
                    <select value={s.placements[x.id]?.role || 'Expanders'} disabled={!s.placements[x.id]} onChange={(e) => send('place', { ref: x.id, horizon: s.placements[x.id].horizon, role: e.target.value })}>{ROLES.map((r) => <option key={r.id}>{r.id}</option>)}</select>
                  </>
                ) : (
                  <select value={s.calendar[x.id] || ''} onChange={(e) => send('season', { ref: x.id, season: e.target.value })}><option value="">None</option>{SEASONS.map((se) => <option key={se.id}>{se.id}</option>)}</select>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="cx-box">
        <div className="k">Room · {ps.length} joined · {ps.filter((p) => !p.sim).length} real</div>
        <div className="cx-people">{ps.map((p) => <span key={p.pid} className={p.sim ? 'sim' : ''} title={p.team ? `Team ${p.team}` : ''}>{p.name}{p.team ? <sup>{p.team}</sup> : null}</span>)}</div>
        <div className="cx-row">
          <button onClick={() => send('flag', { name: 'blank', value: !s.blank })} className={s.blank ? 'on' : ''}>Blank</button>
          <button onClick={() => send('flag', { name: 'paper', value: !s.paper })} className={s.paper ? 'on' : ''}>Paper mode</button>
          <button onClick={() => setExec(!exec)} className={exec ? 'on' : ''}>Executive</button>
          {s.spotlight && <button onClick={() => send('spotlight', { ref: '' })}>Clear spotlight</button>}
        </div>
      </section>

      <section className="cx-box">
        <div className="k">Rehearsal and data</div>
        <div className="cx-row">
          <button onClick={simulate}>Simulate 12</button>
          <a href={exportUrl('json')} target="_blank">JSON</a>
          <a href={exportUrl('csv')} target="_blank">CSV</a>
          <a href={`/playbook/${ctx.code}`} target="_blank">Playbook</a>
          <button className="danger" onClick={async () => { if (prompt(`Type ${ctx.code} to wipe this session`) === ctx.code) { await fetch(`/api/s/${ctx.code}/wipe`, { method: 'POST' }); location.reload(); } }}>Wipe</button>
        </div>
        <div className="cx-join">Join link: <code>{ctx.joinUrl}</code></div>
      </section>

      <section className="cx-list">
        {list.map((x) => { const i = SCENES.indexOf(x); return (
          <button key={x.id} className={i === s.scene ? 'on' : i < s.scene ? 'done' : ''} onClick={() => go(i)}>
            <span className="num">{String(x.n).padStart(2, '0')}</span><b>{x.title}</b><em>{x.act.split(' · ')[0]}</em>
          </button>
        ); })}
      </section>
    </div>
  );
}

'use client';
// ROOM: every phone in the room. One screen at a time, driven by the Stage scene.
import { useEffect, useState } from 'react';
import { useSession } from '@/lib/useSession';
import { SCENES } from '@/lib/scenes';
import { SIGNALS, TERRITORIES, SAMPLES, WHO_CHIPS, MOLECULES, MISSIONS, CODE, SENSORY, FORMATS, SEGMENTS, HORIZONS, EVENT } from '@/lib/content';
import { uid } from '@/lib/state';
import { candidates } from './scenes/Build';

type Me = { pid: string; name: string };
const KEY = (c: string) => `pb-me-${c}`;

export default function RoomApp({ code, k }: { code: string; k: string }) {
  const { state: s, send, status } = useSession(code, { k });
  const [me, setMe] = useState<Me | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => { try { const m = JSON.parse(localStorage.getItem(KEY(code)) || 'null'); if (m?.pid) setMe(m); } catch {} setReady(true); }, [code]);
  const scene = SCENES[s.scene];
  const theme = scene.theme;
  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);

  // Re-announce after a wipe or on a new device session so the Stage always knows who is here.
  useEffect(() => { if (me && status.lastOk && !s.participants[me.pid]) send('join', { name: me.name }, me.pid); }, [me, status.lastOk, s.participants, send]);

  if (!ready) return <main className="room" data-theme={theme} />;
  if (!me) return <JoinForm onJoin={(name) => { const m = { pid: uid(), name }; try { localStorage.setItem(KEY(code), JSON.stringify(m)); } catch {} setMe(m); send('join', { name }, m.pid); }} />;

  const room = scene.room as any;
  const p = (kind: string, data: any) => send(kind, data, me.pid);
  const props = { s, me, p, step: s.step };
  let body: React.ReactNode;
  switch (room.kind) {
    case 'pick': body = <Pick {...props} room={room} />; break;
    case 'chips': body = <Chips {...props} room={room} />; break;
    case 'taste': body = <Taste {...props} />; break;
    case 'guess': body = <Guess {...props} />; break;
    case 'team': body = <Team {...props} />; break;
    case 'canvas': body = <CanvasForm {...props} />; break;
    case 'dots': body = <DotsVote {...props} room={room} />; break;
    case 'placements': body = <Placements {...props} />; break;
    case 'code': body = <CodeReact {...props} />; break;
    case 'thanks': body = <div className="rm-center"><div className="rm-drop" /><h1 className="h2">Thank you, {me.name}.</h1><p className="rm-p">The Playbook v1.0 arrives within 8 business days.</p></div>; break;
    default: body = <div className="rm-center"><div className="rm-drop" /><div className="k">{scene.act}</div><h1 className="h3">{room.line || scene.title}</h1><p className="rm-p">Eyes up. Your phone lights up when the room needs you.</p></div>;
  }
  return (
    <main className="room" data-theme={theme}>
      <header className="rm-head"><span className="rm-brand"><i />The Flavor Playbook</span><span className={'rm-dot' + (status.online ? '' : ' off')} />{me.name}</header>
      <div className="rm-body" key={scene.id + (room.kind === 'guess' ? Math.floor(s.step / 2) : '')}>{body}</div>
    </main>
  );
}

function JoinForm({ onJoin }: { onJoin: (n: string) => void }) {
  const [n, setN] = useState('');
  return (
    <main className="room" data-theme="b">
      <form className="rm-center rm-join" onSubmit={(e) => { e.preventDefault(); if (n.trim()) onJoin(n.trim().split(/\s+/)[0].slice(0, 20)); }}>
        <div className="rm-drop" />
        <div className="k">{EVENT.lockup}</div>
        <h1 className="h2">The Flavor<br /><span className="it">Playbook</span></h1>
        <input autoFocus value={n} onChange={(e) => setN(e.target.value)} placeholder="Your first name" aria-label="Your first name" maxLength={20} />
        <button className="rm-btn" disabled={!n.trim()}>Join the room</button>
        <p className="rm-fine">First name only. Nothing is shared outside this session.</p>
      </form>
    </main>
  );
}

type P = { s: any; me: Me; p: (k: string, d: any) => void; step: number; room?: any };
const Lock = ({ v }: { v: any }) => (v?.locked ? <div className="rm-lock">Voting is closed. Look up.</div> : !v?.open ? <div className="rm-lock soft">The vote opens in a moment. You can choose now.</div> : null);

function Pick({ s, me, p, room }: P) {
  const v = s.votes[room.key]; const mine: string[] = v?.picks?.[me.pid] || [];
  const [sel, setSel] = useState<string[]>(mine);
  const toggle = (id: string) => setSel((x) => (x.includes(id) ? x.filter((y) => y !== id) : x.length < room.max ? [...x, id] : x));
  const sent = mine.length === room.max && sel.every((x) => mine.includes(x));
  return (
    <div className="rm-pad">
      <h2 className="h3">{room.prompt}</h2><Lock v={v} />
      <div className="rm-list">{SIGNALS.map((x) => <button key={x.id} className={'rm-opt' + (sel.includes(x.id) ? ' on' : '')} style={{ ['--h' as any]: x.hue }} onClick={() => toggle(x.id)} disabled={v?.locked}><span className="num">0{x.n}</span>{x.title}</button>)}</div>
      <button className="rm-btn sticky" disabled={sel.length !== room.max || v?.locked || sent} onClick={() => p('pick', { key: room.key, value: sel })}>{sent ? 'Sent. Change any time before the lock.' : `Send ${sel.length} of ${room.max}`}</button>
    </div>
  );
}

function Chips({ s, me, p, room }: P) {
  const v = s.votes[room.key]; const mine: Record<string, number> = v?.picks?.[me.pid] || {};
  const [o, setO] = useState<Record<string, number>>(mine);
  const used = Object.values(o).reduce((a, b) => a + b, 0);
  const add = (id: string, d: number) => setO((x) => { const n = Math.max(0, (x[id] || 0) + d); if (d > 0 && used >= room.total) return x; return { ...x, [id]: n }; });
  return (
    <div className="rm-pad">
      <h2 className="h3">{room.prompt}</h2><Lock v={v} />
      <div className="rm-chipsleft">{Array.from({ length: room.total }, (_, i) => <i key={i} className={i < used ? 'used' : ''} />)}</div>
      <div className="rm-list">{TERRITORIES.map((t) => (
        <div key={t.id} className="rm-chip" style={{ ['--c1' as any]: t.palette[0], ['--c2' as any]: t.palette[1] }}>
          <span className="sw" /><b>{t.name}</b>
          <button onClick={() => add(t.id, -1)} disabled={!o[t.id] || v?.locked}>-</button><em className="num">{o[t.id] || 0}</em><button onClick={() => add(t.id, 1)} disabled={used >= room.total || v?.locked}>+</button>
        </div>
      ))}</div>
      <button className="rm-btn sticky" disabled={used !== room.total || v?.locked} onClick={() => p('pick', { key: room.key, value: o })}>{JSON.stringify(o) === JSON.stringify(mine) && used === room.total ? 'Sent' : `Place ${used} of ${room.total} chips`}</button>
    </div>
  );
}

function Scale({ label, v, set }: { label: string; v: number; set: (n: number) => void }) {
  return <div className="rm-scale"><span>{label}</span><div>{[1, 2, 3, 4, 5].map((n) => <button key={n} className={n <= v ? 'on' : ''} onClick={() => set(n)}>{n}</button>)}</div></div>;
}
function Taste({ s, me, p, step }: P) {
  const [cur, setCur] = useState('A');
  const saved = s.ratings[cur]?.[me.pid];
  const [r, setR] = useState<any>(saved || { appeal: 0, feels: 0, newness: 0, who: [], word: '' });
  useEffect(() => { setR(s.ratings[cur]?.[me.pid] || { appeal: 0, feels: 0, newness: 0, who: [], word: '' }); }, [cur]);
  const done = (c: string) => !!s.ratings[c]?.[me.pid];
  const ok = r.appeal && r.feels && r.newness;
  return (
    <div className="rm-pad">
      <div className="rm-tabs">{SAMPLES.map((x) => <button key={x.code} className={(cur === x.code ? 'on' : '') + (done(x.code) ? ' done' : '')} onClick={() => setCur(x.code)}>{x.code}</button>)}</div>
      <h2 className="h3">Sample {cur}{step >= 2 ? <span className="it"> · {SAMPLES.find((x) => x.code === cur)!.name}</span> : null}</h2>
      <Scale label="Appeal" v={r.appeal} set={(n) => setR({ ...r, appeal: n })} />
      <Scale label="Feels like TheraBreath" v={r.feels} set={(n) => setR({ ...r, feels: n })} />
      <Scale label="Newness" v={r.newness} set={(n) => setR({ ...r, newness: n })} />
      <div className="k" style={{ margin: '18px 0 10px' }}>Who is it for</div>
      <div className="rm-tags">{WHO_CHIPS.map((w) => <button key={w} className={r.who.includes(w) ? 'on' : ''} onClick={() => setR({ ...r, who: r.who.includes(w) ? r.who.filter((x: string) => x !== w) : [...r.who, w] })}>{w}</button>)}</div>
      <input className="rm-input" value={r.word || ''} onChange={(e) => setR({ ...r, word: e.target.value.slice(0, 24) })} placeholder="One word for it" />
      <button className="rm-btn sticky" disabled={!ok} onClick={() => { p('rate', { sample: cur, ...r, word: (r.word || '').trim().split(/\s+/)[0] || undefined }); const nx = SAMPLES.find((x) => !done(x.code) && x.code !== cur); if (nx) setCur(nx.code); }}>{done(cur) ? 'Update' : 'Save'} sample {cur}</button>
    </div>
  );
}

function Guess({ s, me, p, step }: P) {
  const m = MOLECULES[Math.min(6, Math.floor(step / 2))];
  const mine = s.guesses[m.id]?.[me.pid];
  const reveal = step % 2 === 1;
  const opts = MOLECULES.map((x) => x.source);
  return (
    <div className="rm-pad">
      <div className="k">Vial {MOLECULES.indexOf(m) + 1} of 7</div>
      <h2 className="h3">Smell the strip. <span className="it">Where is it from?</span></h2>
      <div className="rm-grid">{opts.map((o) => <button key={o} disabled={reveal} className={'rm-opt' + (mine === o ? ' on' : '') + (reveal && o === m.source ? ' right' : '')} onClick={() => p('guess', { molecule: m.id, answer: o })}>{o}</button>)}</div>
      {reveal && <div className="rm-reveal"><b>{m.name}</b> from {m.source.toLowerCase()}. {mine === m.source ? 'You got it.' : mine ? 'Not this time.' : ''}</div>}
    </div>
  );
}

function Team({ s, me, p }: P) {
  const t = s.participants[me.pid]?.team;
  return (
    <div className="rm-pad">
      <h2 className="h3">Pick your team.</h2>
      <div className="rm-list">{[1, 2, 3].map((n) => { const m = MISSIONS.find((x) => x.id === s.missions[n - 1]); return <button key={n} className={'rm-opt tall' + (t === n ? ' on' : '')} onClick={() => p('team', { team: n })}><span className="num">{n}</span><div><b>Team {n}</b><small>{m?.title}</small></div></button>; })}</div>
    </div>
  );
}

function CanvasForm({ s, me, p }: P) {
  const team = s.participants[me.pid]?.team;
  const [tip, setTip] = useState('');
  if (!team) return <Team s={s} me={me} p={p} step={0} />;
  const c = s.concepts[`t${team}-1`] || {};
  const set = (k: string, v: any) => p('concept', { team, slot: 1, fields: { [k]: v } });
  const F = (x: { k: string; l: string; ph: string; area?: boolean }) => <Field {...x} c={c} set={set} />;
  const Sel = (x: { k: string; l: string; opts: string[] }) => <SelectField {...x} c={c} set={set} />;
  return (
    <div className="rm-pad">
      <div className="k">Team {team} · Concept Canvas</div>
      <h2 className="h3">{MISSIONS.find((x) => x.id === s.missions[team - 1])?.title}</h2>
      <p className="rm-fine">Everything saves as you move to the next field. One captain types; everyone can suggest below.</p>
      {F({ k: 'name', l: 'Concept name', ph: 'Give it a name you can taste', })}
      {Sel({ k: 'segment', l: 'For', opts: SEGMENTS })}
      {F({ k: 'occasion', l: 'When', ph: 'The moment it is for', })}
      {F({ k: 'first', l: 'First impression', ph: 'What hits first', })}
      {F({ k: 'heart', l: 'Heart', ph: 'The character', })}
      {F({ k: 'finish', l: 'Finish', ph: 'How it ends fresh', })}
      <div className="rm-field"><span>Sensation</span><div className="rm-tags">{SENSORY.map((x) => { const on = (c.sensation || []).includes(x); return <button key={x} className={on ? 'on' : ''} onClick={() => set('sensation', on ? c.sensation.filter((y: string) => y !== x) : [...(c.sensation || []), x])}>{x}</button>; })}</div></div>
      {Sel({ k: 'format', l: 'Format', opts: FORMATS })}
      {Sel({ k: 'horizon', l: 'Horizon', opts: HORIZONS.map((h) => h.id) })}
      {F({ k: 'incremental', l: 'Why it is incremental', ph: 'Who it brings in, or what it adds', area: true, })}
      {F({ k: 'why', l: 'Territory and why TheraBreath', ph: 'Which territory, and why it fits', area: true, })}
      <div className="rm-suggest"><input className="rm-input" value={tip} onChange={(e) => setTip(e.target.value)} placeholder="Suggest something to your captain" /><button className="rm-btn" disabled={!tip.trim()} onClick={() => { p('suggest', { team, slot: 1, text: tip.trim() }); setTip(''); }}>Send</button></div>
    </div>
  );
}

function Field({ k, l, ph, area, c, set }: { k: string; l: string; ph: string; area?: boolean; c: any; set: (k: string, v: any) => void }) {
  const save = (v: string) => v !== (c[k] || '') && set(k, v.slice(0, area ? 200 : 80));
  return <label className="rm-field"><span>{l}</span>{area ? <textarea defaultValue={c[k] || ''} placeholder={ph} onBlur={(e) => save(e.target.value)} rows={2} /> : <input defaultValue={c[k] || ''} placeholder={ph} onBlur={(e) => save(e.target.value)} />}</label>;
}
function SelectField({ k, l, opts, c, set }: { k: string; l: string; opts: string[]; c: any; set: (k: string, v: any) => void }) {
  return <label className="rm-field"><span>{l}</span><select value={c[k] || ''} onChange={(e) => set(k, e.target.value)}><option value="">Choose</option>{opts.map((o) => <option key={o}>{o}</option>)}</select></label>;
}

function DotsVote({ s, me, p, room }: P) {
  const v = s.votes[room.key]; const mine: Record<string, number> = v?.picks?.[me.pid] || {};
  const [o, setO] = useState<Record<string, number>>(mine);
  const used = Object.values(o).reduce((a, b) => a + b, 0);
  const items = candidates(s).filter((x) => x.kind === 'concept').concat(candidates(s).filter((x) => x.kind === 'seed'));
  return (
    <div className="rm-pad">
      <h2 className="h3">Three dots. <span className="it">Stack them if you love one.</span></h2><Lock v={v} />
      <div className="rm-chipsleft">{Array.from({ length: room.total }, (_, i) => <i key={i} className={i < used ? 'used' : ''} />)}</div>
      <div className="rm-list">{items.map((x) => (
        <div key={x.id} className="rm-chip" style={{ ['--c1' as any]: x.color, ['--c2' as any]: x.color }}>
          <span className="sw" /><b>{x.name}<small>{x.sub}</small></b>
          <button onClick={() => setO({ ...o, [x.id]: Math.max(0, (o[x.id] || 0) - 1) })} disabled={!o[x.id] || v?.locked}>-</button><em className="num">{o[x.id] || 0}</em><button onClick={() => used < room.total && setO({ ...o, [x.id]: (o[x.id] || 0) + 1 })} disabled={used >= room.total || v?.locked}>+</button>
        </div>
      ))}</div>
      <button className="rm-btn sticky" disabled={used !== room.total || v?.locked} onClick={() => p('pick', { key: room.key, value: o })}>{JSON.stringify(o) === JSON.stringify(mine) && used === room.total ? 'Sent' : `Place ${used} of ${room.total} dots`}</button>
    </div>
  );
}

function Placements({ s, me, p }: P) {
  const placed = candidates(s).filter((x) => s.placements[x.id]);
  return (
    <div className="rm-pad">
      <h2 className="h3">Agree or challenge <span className="it">each placement.</span></h2>
      {!placed.length && <p className="rm-p">Placements appear here as Matt places them.</p>}
      <div className="rm-list">{placed.map((x) => { const r = s.reactions['place-' + x.id]?.[me.pid]?.v; return (
        <div key={x.id} className="rm-place"><div><b>{x.name}</b><small>{s.placements[x.id].horizon} · {s.placements[x.id].role}</small></div>
          <button className={r === 'agree' ? 'on' : ''} onClick={() => p('react', { target: 'place-' + x.id, value: 'agree' })}>Agree</button>
          <button className={r === 'challenge' ? 'on warn' : ''} onClick={() => p('react', { target: 'place-' + x.id, value: 'challenge' })}>Challenge</button>
        </div>
      ); })}</div>
    </div>
  );
}

function CodeReact({ s, me, p }: P) {
  const [edit, setEdit] = useState<number | null>(null); const [txt, setTxt] = useState('');
  return (
    <div className="rm-pad">
      <h2 className="h3">The Flavor Code. <span className="it">Keep or edit each rule.</span></h2>
      <div className="rm-list">{CODE.map((c) => { const r = s.reactions['code' + c.n]?.[me.pid]; return (
        <div key={c.n} className="rm-rule">
          <div><span className="num">{c.n}</span><b>{c.t}</b><small>{c.d}</small></div>
          <div className="rm-row"><button className={r?.v === 'keep' ? 'on' : ''} onClick={() => p('react', { target: 'code' + c.n, value: 'keep' })}>Keep</button><button className={r?.v === 'edit' ? 'on warn' : ''} onClick={() => { setEdit(c.n); setTxt(r?.text || ''); }}>Edit</button></div>
          {edit === c.n && <div className="rm-suggest"><input className="rm-input" autoFocus value={txt} onChange={(e) => setTxt(e.target.value)} placeholder="How would you say it?" /><button className="rm-btn" onClick={() => { p('react', { target: 'code' + c.n, value: 'edit', text: txt.slice(0, 140) }); setEdit(null); }}>Send</button></div>}
        </div>
      ); })}</div>
      <div className="rm-suggest" style={{ marginTop: 20 }}><input className="rm-input" value={edit === 0 ? txt : ''} onFocus={() => { setEdit(0); setTxt(''); }} onChange={(e) => setTxt(e.target.value)} placeholder="Add a rule we missed" /><button className="rm-btn" disabled={edit !== 0 || !txt.trim()} onClick={() => { p('react', { target: 'code-add-' + me.pid.slice(0, 6) + Date.now().toString(36), value: 'add', text: txt.slice(0, 140) }); setEdit(null); setTxt(''); }}>Add</button></div>
    </div>
  );
}

'use client';
// PLAYBOOK: the document the room builds, live. Prints to A4 or US Letter as a clean PDF.
import { useEffect, useState } from 'react';
import { useSession } from '@/lib/useSession';
import { EVENT, SIGNALS, TERRITORIES, SAMPLES, SEEDS, HORIZONS, ROLES, CODE, NEXT_STEPS, SOURCES, OBJECTIVES } from '@/lib/content';
import { tallyPick, ranked, tasteSummary } from '@/lib/state';
import { teamConcepts } from './scenes/CoCreate';
import { candidates, SEASONS } from './scenes/Build';
import { decisions } from './scenes/Close';

export default function PlaybookDoc({ code, k }: { code: string; k: string }) {
  const { state: s, status } = useSession(code, { admin: true, interval: 2500 });
  const [size, setSize] = useState<'A4' | 'Letter'>('Letter');
  useEffect(() => { document.documentElement.dataset.theme = 'a'; }, []);
  const d = decisions(s);
  const sigT = tallyPick(s, 'signals'), terT = tallyPick(s, 'territories');
  const concepts = teamConcepts(s);
  const items = candidates(s);
  const codeRx = (n: number) => Object.values(s.reactions['code' + n] || {}) as { v: string; text?: string }[];
  const additions = Object.entries(s.reactions).filter(([t]) => t.startsWith('code-add-')).flatMap(([, r]) => Object.values(r as any).map((x: any) => x.text)).filter(Boolean);
  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="pb-host">
      <style>{`@page { size: ${size === 'A4' ? 'A4' : 'letter'}; margin: 0; }`}</style>
      <div className="pb-bar noprint">
        <b>The Flavor Playbook</b><span>{code} · {status.online ? 'live' : 'offline'}</span>
        <div className="pb-size">{(['Letter', 'A4'] as const).map((x) => <button key={x} className={size === x ? 'on' : ''} onClick={() => setSize(x)}>{x}</button>)}</div>
        <button className="pb-print" onClick={() => window.print()}>Save as PDF</button>
      </div>
      <div className={'pb-doc ' + size}>
        <section className="pb-page pb-cover">
          <div className="pb-cover-light" />
          <div className="k">TheraBreath × The Flavor Factory</div>
          <h1>The Flavor<br /><em>Playbook</em></h1>
          <p className="pb-sub">{EVENT.sub}</p>
          <div className="pb-built">Built live in the {EVENT.room} room, {EVENT.date}, by {d.names.length ? d.names.join(', ') : 'the workshop team'}.</div>
          <div className="pb-foot"><span>v0.9 · generated {today}</span><span>Confidential</span></div>
        </section>

        <section className="pb-page">
          <div className="k">Contents</div>
          <h2>Four objectives. <em>Five chapters.</em></h2>
          <ol className="pb-toc">{OBJECTIVES.map((o, i) => <li key={o.n}><span className="n">0{i + 1}</span><b>{['Signals', 'Territories', 'Concepts', 'Pipeline'][i]}</b><p>{o.ask}</p></li>)}<li><span className="n">05</span><b>The Flavor Code</b><p>Seven guardrails every TheraBreath flavor keeps.</p></li></ol>
          <div className="pb-thesis">TheraBreath took away the burn. <em>Now let&rsquo;s add the want.</em></div>
        </section>

        <section className="pb-page">
          <div className="k">Chapter 1 · Signals</div>
          <h2>What is changing</h2>
          <p className="pb-lede">The room chose the three signals that matter most for TheraBreath.</p>
          <div className="pb-sig">{SIGNALS.map((x) => { const top = d.sig.some((y) => y.id === x.id); return (
            <div key={x.id} className={top ? 'top' : ''}><span className="n">0{x.n}</span><div><b>{x.title}</b><p>{x.so}</p><small>{x.proofs.map((p) => SOURCES[p.src]).filter((v, i, a) => a.indexOf(v) === i).join('; ')}</small></div><em>{sigT[x.id] || 0}</em></div>
          ); })}</div>
        </section>

        <section className="pb-page">
          <div className="k">Chapter 2 · Territories</div>
          <h2>Where flavor can go</h2>
          <div className="pb-ter">{ranked(Object.fromEntries(TERRITORIES.map((t) => [t.id, terT[t.id] || 0]))).map(([id, n], i) => { const t = TERRITORIES.find((x) => x.id === id)!; return (
            <div key={id} className={i < 3 && n > 0 ? 'top' : ''} style={{ ['--c1' as any]: t.palette[0], ['--c2' as any]: t.palette[1] }}><i /><div><b>{t.name}</b><p>{t.promise}</p><small>{t.fit}{t.fitNote ? `: ${t.fitNote}` : ''}</small></div><em>{n}</em></div>
          ); })}</div>
          <h3>Blind tasting</h3>
          <table className="pb-table"><thead><tr><th>Sample</th><th>Appeal</th><th>Feels like TheraBreath</th><th>Newness</th><th>Tasters</th><th>Words</th></tr></thead>
            <tbody>{SAMPLES.map((x) => { const r = tasteSummary(s, x.code); return <tr key={x.code}><td><b>{x.code}</b> {x.name}</td><td>{r.n ? r.appeal.toFixed(1) : ''}</td><td>{r.n ? r.feels.toFixed(1) : ''}</td><td>{r.n ? r.newness.toFixed(1) : ''}</td><td>{r.n || ''}</td><td>{r.words.slice(0, 5).join(', ')}</td></tr>; })}</tbody></table>
          <p className="pb-note">Scores are 1 to 5, averaged across tasters in the room.</p>
        </section>

        <section className="pb-page">
          <div className="k">Chapter 3 · Concepts</div>
          <h2>What we could make</h2>
          {concepts.length ? concepts.map((c) => (
            <div key={c.id} className="pb-concept">
              <div className="pb-c-head"><b>{c.name || 'Untitled concept'}</b><span>Team {c.team}{c.horizon ? ` · ${c.horizon}` : ''}{tallyPick(s, 'concepts')[c.id] ? ` · ${tallyPick(s, 'concepts')[c.id]} dots` : ''}</span></div>
              <dl>{([['For', c.segment], ['When', c.occasion], ['First', c.first], ['Heart', c.heart], ['Finish', c.finish], ['Sensation', (c.sensation || []).join(', ')], ['Format', c.format], ['Why incremental', c.incremental], ['Why TheraBreath', c.why]] as [string, string][]).filter(([, v]) => v).map(([l, v]) => <div key={l}><dt>{l}</dt><dd>{v}</dd></div>)}</dl>
            </div>
          )) : <p className="pb-lede">Team concepts appear here as the canvases fill.</p>}
          <h3>Seed cards the room backed</h3>
          <ul className="pb-seeds">{items.filter((x) => x.kind === 'seed' && x.dots > 0).map((x) => { const sd = SEEDS.find((y) => y.id === x.id)!; return <li key={x.id}><b>{sd.name}</b> {sd.idea} <em>{x.dots} dots</em></li>; })}{!items.some((x) => x.kind === 'seed' && x.dots > 0) && <li className="ghost">None yet.</li>}</ul>
        </section>

        <section className="pb-page">
          <div className="k">Chapter 4 · Pipeline</div>
          <h2>What we do first, next and later</h2>
          <table className="pb-board"><thead><tr><th />{HORIZONS.map((h) => <th key={h.id}>{h.label}<small>{h.when}</small></th>)}</tr></thead>
            <tbody>{ROLES.map((r) => <tr key={r.id}><th>{r.id}<small>{r.job}</small></th>{HORIZONS.map((h) => <td key={h.id}>{d.placed.filter((x) => s.placements[x.id].horizon === h.id && s.placements[x.id].role === r.id).map((x) => { const rx = Object.values(s.reactions['place-' + x.id] || {}) as any[]; const ch = rx.filter((y) => y.v === 'challenge').length; return <div key={x.id} className="pb-pc">{x.name}{ch ? <small> {ch} challenged</small> : null}</div>; })}</td>)}</tr>)}</tbody></table>
          <h3>The 2027 flavor calendar</h3>
          <div className="pb-cal">{SEASONS.map((se) => <div key={se.id} style={{ ['--c' as any]: se.hue }}><b>{se.id}</b><small>{se.when}</small>{items.filter((x) => s.calendar[x.id] === se.id).map((x) => <span key={x.id}>{x.name}</span>)}</div>)}</div>
        </section>

        <section className="pb-page">
          <div className="k">Chapter 5 · The Flavor Code</div>
          <h2>Seven rules every flavor keeps</h2>
          <ol className="pb-code">{CODE.map((c) => { const r = codeRx(c.n); const edits = r.filter((x) => x.v === 'edit'); return <li key={c.n}><span className="n">{c.n}</span><div><b>{c.t}</b><p>{c.d}</p>{r.length > 0 && <small>{r.filter((x) => x.v === 'keep').length} keep · {edits.length} edit{edits.filter((x) => x.text).map((x, i) => <span key={i}> · &ldquo;{x.text}&rdquo;</span>)}</small>}</div></li>; })}</ol>
          {!!additions.length && <><h3>Rules the room added</h3><ul className="pb-seeds">{additions.map((a, i) => <li key={i}>{a}</li>)}</ul></>}
          <h3>What happens next</h3>
          <ol className="pb-next">{NEXT_STEPS.map((n) => <li key={n.t}><b>{n.t}</b> {n.d} <em>[CONFIRM date]</em></li>)}</ol>
        </section>

        <section className="pb-page pb-sources">
          <div className="k">Sources</div>
          <h2>Where every number comes from</h2>
          <ul>{Object.values(SOURCES).map((v) => <li key={v}>{v}</li>)}</ul>
          <p className="pb-note">Items marked [CONFIRM] are awaiting approval before this Playbook is final. No TheraBreath or The Flavor Factory formula details are included in this document.</p>
          <div className="pb-foot"><span>TheraBreath × The Flavor Factory</span><span>Confidential and private</span></div>
        </section>
      </div>
    </div>
  );
}

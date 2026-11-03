'use client';
import { R, Enter, SceneProps } from './ui';
import { SEEDS, HORIZONS, ROLES, CODE, TERRITORIES } from '@/lib/content';
import { SessionState, tallyPick, ranked } from '@/lib/state';
import { teamConcepts } from './CoCreate';

export type Item = { id: string; name: string; sub: string; dots: number; kind: 'concept' | 'seed'; color: string };

// Everything that can be placed on the pipeline: team concepts and seed cards, most dots first.
export function candidates(s: SessionState): Item[] {
  const t = tallyPick(s, 'concepts');
  const cs: Item[] = teamConcepts(s).map((c) => ({ id: c.id, name: c.name || `Team ${c.team} concept`, sub: `Team ${c.team}`, dots: t[c.id] || 0, kind: 'concept', color: TERRITORIES[(c.team + 1) % 7].palette[1] }));
  const sd: Item[] = SEEDS.map((x) => ({ id: x.id, name: x.name, sub: `Seed ${x.n}`, dots: t[x.id] || 0, kind: 'seed', color: TERRITORIES.find((tr) => tr.id === x.territory)!.palette[1] }));
  return [...cs, ...sd].sort((a, b) => b.dots - a.dots || (a.kind === 'concept' ? -1 : 1));
}

// 38. The pipeline board: Now, Next, Future by portfolio role.
export function Pipeline({ s }: SceneProps) {
  const items = candidates(s);
  const placed = items.filter((x) => s.placements[x.id]);
  const tray = items.filter((x) => !s.placements[x.id] && (x.dots > 0 || x.kind === 'concept')).slice(0, 8);
  return (
    <div className="pad pipeline">
      <Enter i={0}><div className="k">Build the Playbook · the pipeline</div></Enter>
      <Enter i={1}><h2 className="h2">First, next <span className="it">and later.</span></h2></Enter>
      <div className="board">
        <div className="brow head"><span />{HORIZONS.map((h) => <div key={h.id}><b>{h.label}</b><span>{h.when}</span></div>)}</div>
        {ROLES.map((r) => (
          <div key={r.id} className="brow">
            <div className="brole"><b>{r.id}</b><span>{r.job}</span></div>
            {HORIZONS.map((h) => (
              <div key={h.id} className="bcell">
                {placed.filter((x) => s.placements[x.id].horizon === h.id && s.placements[x.id].role === r.id).map((x) => (
                  <div key={x.id} className={'pcard ' + x.kind} style={{ ['--c' as any]: x.color }}><b>{x.name}</b><span>{x.sub}{x.dots ? ` · ${x.dots} dots` : ''}</span></div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
      {!!tray.length && <div className="tray"><span className="k">To place</span>{tray.map((x) => <span key={x.id} className="tchip" style={{ ['--c' as any]: x.color }}>{x.name}</span>)}</div>}
    </div>
  );
}

// 39. The 2027 flavor calendar: four seasonal drop windows.
export const SEASONS = [
  { id: 'Winter', when: 'January to March', hue: '#BFE9F2' },
  { id: 'Spring', when: 'April to June', hue: '#CFE8C6' },
  { id: 'Summer', when: 'July to September', hue: '#F4B860' },
  { id: 'Fall', when: 'October to December', hue: '#D98E3A' },
];
export function Calendar({ s, step }: SceneProps) {
  const items = candidates(s);
  return (
    <div className="pad calendar">
      <Enter i={0}><div className="k">Build the Playbook · the 2027 flavor calendar</div></Enter>
      <Enter i={1}><h2 className="h2">Four drop windows. <span className="it">A rhythm the shelf can count on.</span></h2></Enter>
      <div className="ring">
        {SEASONS.map((se, i) => {
          const here = items.filter((x) => s.calendar[x.id] === se.id);
          return (
            <R key={se.id} b={0} d={i * 160} step={step} className="season" style={{ ['--c' as any]: se.hue }}>
              <div className="se-arc" />
              <b className="h3">{se.id}</b><span className="k">{se.when}</span>
              <div className="se-items">{here.map((x) => <span key={x.id}>{x.name}</span>)}{!here.length && <em>Open window</em>}</div>
            </R>
          );
        })}
      </div>
      <R b={1} step={step} className="cal-note lede">Drops are placed from Console as the room agrees them.</R>
    </div>
  );
}

// 40. The Flavor Code: seven guardrails, keep, edit or add from the phones.
export function Code({ s, step }: SceneProps) {
  return (
    <div className="pad code">
      <div className="code-copy">
        <Enter i={0}><div className="k">Chapter 5 · The Flavor Code</div></Enter>
        <Enter i={1}><h2 className="h1">Seven rules<br /><span className="it">every flavor keeps.</span></h2></Enter>
      </div>
      <ol className="rules">
        {CODE.map((c, i) => {
          const r = Object.values(s.reactions['code' + c.n] || {});
          const n = (v: string) => r.filter((x) => x.v === v).length;
          return (
            <R key={c.n} as="li" b={i + 1} step={step} className="rule">
              <span className="num">{c.n}</span>
              <div><b>{c.t}</b><p>{c.d}</p></div>
              <div className="rx">{n('keep') > 0 && <em className="keep">Keep {n('keep')}</em>}{n('edit') > 0 && <em className="edit">Edit {n('edit')}</em>}</div>
            </R>
          );
        })}
      </ol>
    </div>
  );
}

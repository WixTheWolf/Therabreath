'use client';
// Now, Next, Later as rows: what goes forward, who it's for, the flavor brief, its TFF owner and C&D reviewer, the base and
// when the next sample is due, the next test and the agreed next step. On the day they're placed and filled in by
// tapping, on the board slide or in the presenter view; both write `plan` events to the same session, so the Playbook
// read-back, the results page and the write-up all show the same rows. Only the write-up, after the morning, types.
import { useEffect, useRef, useState } from 'react';
import { HORIZONS, SAMPLES, TEAM, PRIMARY_TERRITORIES } from '@/lib/content';
import { uid, SessionState, PlanRow, tallyPick, ranked, topIds, people } from '@/lib/state';
import { STARTS, WHO, WHEN, TESTS, OWNERS, BASES, DUES, STEPS, DUE_DEFAULT, TO_CONFIRM, cardFor, unconfirmed } from '@/lib/conceptLibrary';
import { teamConcepts } from '../scenes/CoCreate';

type Send = (kind: string, data?: any, pid?: string) => any;

// An input that writes to the session as you type (after a short pause) and picks up changes from elsewhere when idle.
export function Synced({ value, commit, area, ...rest }: { value: string; commit: (v: string) => void; area?: boolean } & Record<string, any>) {
  const [v, setV] = useState(value);
  const focused = useRef(false); const timer = useRef<any>(null);
  useEffect(() => { if (!focused.current) setV(value); }, [value]);
  const props = {
    ...rest, value: v, 'data-nonav': true,
    onFocus: () => { focused.current = true; },
    onBlur: () => { focused.current = false; clearTimeout(timer.current); if (v !== value) commit(v); },
    onChange: (e: any) => { const x = e.target.value; setV(x); clearTimeout(timer.current); timer.current = setTimeout(() => commit(x), 700); },
  };
  return area ? <textarea {...props} /> : <input {...props} />;
}

// What every direction leaves with: who it's for, the flavor brief, the next test, who takes it forward on each side, the
// base, when the next sample is due and the next step the room agreed. On the day every field is a tap on one of the
// options in conceptLibrary.ts; the flavor brief is drafted from the direction's profile and finished in the write-up.
export const PLAN_COLS = [
  { f: 'who', l: 'Consumer or occasion' },
  { f: 'brief', l: 'Flavor brief' },
  { f: 'test', l: 'Next test' },
  { f: 'owner', l: 'TFF owner' },
  { f: 'reviewer', l: 'C&D reviewer' },
  { f: 'base', l: 'Base' },
  { f: 'due', l: 'Next sample due' },
  { f: 'step', l: 'Agreed next step' },
] as const;
// The read-back on the TV shows the columns a room can read at a glance; the write-up and the results page show them all.
export const PLAN_READBACK = PLAN_COLS.filter((c) => ['who', 'test', 'owner', 'reviewer', 'due', 'step'].includes(c.f));
// "2026-12-04" (a date from before the options) as "Dec 4, 2026"; an option as it reads.
export const dueLabel = (d?: string) => (d && /^\d{4}-\d{2}-\d{2}$/.test(d) ? new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : d || '');
// A cell of the plan as it reads back: the date formatted, the flavor brief falling back to the older free-text step.
export const planCell = (r: Record<string, any>, f: string) => (f === 'due' ? dueLabel(r.due) : f === 'brief' ? r.brief || r.next || '' : r[f] || '');
const horizonOrder = (h: string) => Math.max(0, HORIZONS.findIndex((x) => x.id === h));

// The rows in reading order: Now, then Next, then Later, each in the order they were added. Free text typed on the
// board before it had rows still counts, one row per line.
export function planRows(s: SessionState): (Omit<PlanRow, 't'> & { label: string })[] {
  const rows = Object.values(s.plan || {}).filter((r) => r.what.trim() || r.owner || r.brief || r.next);
  const legacy = HORIZONS.flatMap((h) => (s.board?.[h.id] || '').split('\n').map((x) => x.trim()).filter(Boolean).map((what, j) => ({ id: `board-${h.id}-${j}`, h: h.id, what, t: Infinity })));
  return [...rows, ...legacy]
    .sort((a, b) => horizonOrder(a.h) - horizonOrder(b.h) || a.t - b.t)
    .map(({ t, ...r }) => ({ ...r, label: HORIZONS.find((x) => x.id === r.h)?.label || r.h }));
}

export function planActions(send: Send) {
  return {
    add: (h: string, what = '', fields: Record<string, string> = {}) => send('plan', { id: 'r-' + uid().slice(0, 12), h, fields: { what, ...fields } }),
    set: (id: string, fields: Partial<Record<string, string>>) => send('plan', { id, fields }),
    move: (id: string, h: string) => send('plan', { id, h }),
    remove: (id: string) => send('unplan', { id }),
  };
}

// What can be placed on the board: the concepts from the concept slide, then the top three from the chips vote (a
// direction that already has a concept of the same name shows once).
export type TrayItem = { ref: string; name: string; sub: string; kind: 'concept' | 'direction'; start: string };
const nameOf = (id: string, s: SessionState) => s.revealed?.samples[id]?.name || STARTS.find((x) => x.id === id)?.label || id;
export function trayItems(s: SessionState): TrayItem[] {
  const cs: TrayItem[] = teamConcepts(s).map((c: any) => ({ ref: c.id, name: c.name, sub: 'Concept', kind: 'concept', start: c.start || STARTS.find((x) => x.label === c.why || nameOf(x.id, s) === c.why)?.id || '' }));
  const tl = tallyPick(s, 'directions');
  const chips = topIds(tl).map((id) => [id, tl[id]] as const); // the top three, plus anything tied with the third
  const ds: TrayItem[] = chips.map(([id, n]) => ({ ref: id, name: nameOf(id, s), sub: `${n} ${n === 1 ? 'chip' : 'chips'}`, kind: 'direction', start: id }));
  const seen = new Set(cs.map((x) => x.name.trim().toLowerCase()));
  return [...cs, ...ds.filter((x) => !seen.has(x.name.trim().toLowerCase()))];
}
// The base a line starts in: a sample's own, a tasted direction's (both its samples share one), or none yet.
const baseFor = (start: string) => {
  const st = STARTS.find((x) => x.id === start); if (!st) return '';
  if (st.base) return st.base;
  const bs = [...new Set(SAMPLES.filter((x) => x.territory === st.territory).map((x) => x.base))];
  return bs.length === 1 ? bs[0] : '';
};
// The flavor brief, drafted from the direction's own profile on the map (its promise and flavor arc), never from the
// sealed notes. Labeled as a draft everywhere until the write-up finishes it.
export function draftBrief(start: string, s: SessionState) {
  const st = STARTS.find((x) => x.id === start); const t = PRIMARY_TERRITORIES.find((x) => x.id === st?.territory);
  if (!st || !t) return '';
  const from = st.kind === 'sample' ? `${nameOf(st.id, s)} (Sample ${st.id})` : t.name;
  const base = baseFor(start);
  return `Starts from ${from}${base ? `, in the ${base}` : ''}. ${t.promise} Flavor arc: ${t.arc.map((x) => x.toLowerCase()).join(', then ')}.`;
}
// A new line's defaults: who it's for and when from the concept (or the direction's starter card), the drafted brief,
// the base, and the January review for the next sample.
export function placeFields(item: TrayItem, s: SessionState): Record<string, string> {
  const c: any = item.kind === 'concept' ? s.concepts[item.ref] : null;
  const card = cardFor(item.start) || null;
  const who = c ? [c.segment, c.occasion] : card ? [card.segment, card.occasion] : [];
  return { ref: item.ref, who: who.filter(Boolean).join(' · '), brief: draftBrief(item.start, s), draft: '1', base: baseFor(item.start), due: DUE_DEFAULT };
}
// The C&D reviewer options: the first names that joined on phones and the pre-brief names, once each, then To confirm.
export function reviewers(s: SessionState) {
  const names = [...people(s).filter((p) => !p.paper).map((p) => p.name), ...Object.values(s.survey || {}).map((a) => a.name)]
    .map((n) => String(n || '').trim().split(/\s+/)[0]).filter(Boolean);
  const seen = new Set<string>(); const out: string[] = [];
  for (const n of names) { const k = n.toLowerCase(); if (!seen.has(k)) { seen.add(k); out.push(n); } }
  return [...out, TO_CONFIRM];
}

type Sel = { kind: 'tray'; ref: string } | { kind: 'row'; id: string } | null;
// Now, Next, Later by tapping: tap something in the tray (or a line already on the board), then tap Now, Next or Later
// to put it there. A selected line can be taken back. The TV and the presenter view each keep their own selection; with
// `edit`, the selected line's fields open as rows of options to tap.
export function PlanTap({ s, send, still, edit, onSelect }: { s: SessionState; send: Send; still?: boolean; edit?: boolean; onSelect?: (id: string | null) => void }) {
  const act = planActions(send);
  const [sel, setSel] = useState<Sel>(null);
  const tray = trayItems(s);
  const rows = Object.values(s.plan || {}).sort((a, b) => a.t - b.t);
  const placed = new Set(rows.flatMap((r) => [r.ref || '', r.what.trim().toLowerCase()]));
  const isPlaced = (x: TrayItem) => placed.has(x.ref) || placed.has(x.name.trim().toLowerCase());
  const legacy = (h: string) => (s.board?.[h] || '').split('\n').map((x) => x.trim()).filter(Boolean);
  const pick = (x: Sel) => { if (still) return; const same = JSON.stringify(x) === JSON.stringify(sel); setSel(same ? null : x); onSelect?.(!same && x?.kind === 'row' ? x.id : null); };
  const drop = (h: string) => {
    if (still || !sel) return;
    if (sel.kind === 'tray') { const it = tray.find((x) => x.ref === sel.ref); if (it) act.add(h, it.name, placeFields(it, s)); }
    else act.move(sel.id, h);
    setSel(null); onSelect?.(null);
  };
  const selRow = sel?.kind === 'row' ? rows.find((r) => r.id === sel.id) : undefined;
  const hint = !sel ? 'Tap a concept or direction, then tap Now, Next or Later.' : sel.kind === 'tray' ? 'Now tap Now, Next or Later to place it.' : 'Tap Now, Next or Later to move it, or take it back.';
  return (
    <div className={'pt' + (edit ? ' pt-edit' : '')}>
      <div className="pt-tray">
        <span className="k">To place</span>
        {tray.length ? tray.map((x) => (
          <button key={x.ref} type="button" data-nonav className={'tchip' + (sel?.kind === 'tray' && sel.ref === x.ref ? ' on' : '')} disabled={still || isPlaced(x)} aria-pressed={sel?.kind === 'tray' && sel.ref === x.ref} onClick={() => pick({ kind: 'tray', ref: x.ref })}>
            {x.name}<small>{isPlaced(x) ? 'On the board' : x.sub}</small>
          </button>
        )) : <em>The concepts and the top three from the chips vote show up here.</em>}
        {!still && <span className="pt-hint" role="status">{hint}</span>}
      </div>
      <div className="pt-cols">
        {HORIZONS.map((h) => (
          <section key={h.id} className={'pt-col ' + h.id.toLowerCase() + (sel ? ' ready' : '')}>
            <button type="button" data-nonav className="pt-head" disabled={still || !sel} onClick={() => drop(h.id)} aria-label={`Put it under ${h.label}`}>
              <b>{h.label}</b><span className="k">{h.when}</span>{sel && <em>{sel.kind === 'tray' ? 'Place here' : 'Move here'}</em>}
            </button>
            <div className="pt-rows">
              {legacy(h.id).map((x, j) => <div key={'l' + j} className="pt-row legacy"><b>{x}</b></div>)}
              {rows.filter((r) => r.h === h.id).map((r) => {
                const on = sel?.kind === 'row' && sel.id === r.id;
                return (
                  <div key={r.id} className={'pt-row' + (on ? ' on' : '')}>
                    <button type="button" data-nonav className="pt-pick" disabled={still} aria-pressed={on} onClick={() => pick({ kind: 'row', id: r.id })}>
                      <b>{r.what || 'Untitled'}</b>
                      <dl>{PLAN_COLS.filter((c) => c.f !== 'brief').map((c) => { const v = planCell(r, c.f); return <div key={c.f} className={unconfirmed(v) ? 'tbc' : ''}><dt>{c.l}</dt><dd>{v || 'To agree'}</dd></div>; })}</dl>
                      {planCell(r, 'brief') && <p className="pt-brief"><span className="k">Flavor brief{r.draft ? ', draft' : ''}</span>{planCell(r, 'brief')}</p>}
                    </button>
                    {on && !still && <button type="button" data-nonav className="pt-back" onClick={() => { act.remove(r.id); setSel(null); onSelect?.(null); }}>Take it back</button>}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
      {edit && selRow && <PlanFields r={selRow} s={s} send={send} />}
    </div>
  );
}

// The selected line's fields as options to tap: the presenter view only. The brief is drafted, not edited here.
const join = (a?: string, b?: string) => [a, b].filter(Boolean).join(' · ');
export function PlanFields({ r, s, send }: { r: PlanRow; s: SessionState; send: Send }) {
  const act = planActions(send);
  const [who, when] = (() => { const parts = (r.who || '').split(' · '); return [parts.find((x) => WHO.includes(x)) || '', parts.find((x) => WHEN.includes(x)) || '']; })();
  const groups: { f: string; l: string; opts: string[]; v: string; set: (v: string) => void }[] = [
    { f: 'who', l: 'Consumer', opts: WHO, v: who, set: (v) => act.set(r.id, { who: join(v === who ? '' : v, when) }) },
    { f: 'when', l: 'Occasion', opts: WHEN, v: when, set: (v) => act.set(r.id, { who: join(who, v === when ? '' : v) }) },
    ...([['test', 'Next test', TESTS], ['owner', 'TFF owner', OWNERS], ['reviewer', 'C&D reviewer', reviewers(s)], ['base', 'Base', BASES], ['due', 'Next sample due', DUES], ['step', 'Agreed next step', STEPS]] as [string, string, string[]][])
      .map(([f, l, opts]) => ({ f, l, opts, v: (r as any)[f] || '', set: (v: string) => act.set(r.id, { [f]: v === (r as any)[f] ? '' : v }) })),
  ];
  return (
    <section className="pt-fields" aria-label={`The fields for ${r.what || 'this line'}`}>
      <h3>{r.what || 'Untitled'}</h3>
      {groups.map((g) => (
        <div key={g.f} className="pt-group" role="group" aria-label={g.l}>
          <span>{g.l}</span>
          <div>{g.opts.map((o) => <button key={o} type="button" aria-pressed={g.v === o} className={/to confirm/i.test(o) ? 'tbc' : ''} onClick={() => g.set(o)}>{o}</button>)}</div>
        </div>
      ))}
      <p className="pt-briefnote"><span>Flavor brief</span>{planCell(r, 'brief') || 'None yet'}{r.draft ? ' (draft, finalized in the write-up)' : ''}</p>
    </section>
  );
}

// Removing a row asks once: the first click arms it for a few seconds.
export function RemoveRow({ onRemove, label, className = '' }: { onRemove: () => void; label: string; className?: string }) {
  const [armed, setArmed] = useState(false);
  useEffect(() => { if (!armed) return; const t = setTimeout(() => setArmed(false), 3500); return () => clearTimeout(t); }, [armed]);
  return (
    <button type="button" data-nonav className={'plan-remove' + (armed ? ' armed' : '') + (className ? ' ' + className : '')} aria-label={armed ? `Confirm: remove ${label}` : `Remove ${label}`} onClick={() => (armed ? onRemove() : setArmed(true))}>
      {armed ? 'Remove this line?' : <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>}
    </button>
  );
}

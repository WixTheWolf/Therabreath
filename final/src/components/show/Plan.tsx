'use client';
// Now, Next, Later as rows: what goes forward, who it's for, the flavor brief, its TFF owner and C&D reviewer, the base and
// when the next sample is due, the next test and the agreed next step. On the day they're placed and filled in by
// tapping, on the board slide or in the presenter view; both write `plan` events to the same session, so the Playbook
// read-back, the results page and the write-up all show the same rows. Only the write-up, after the morning, types.
import { useEffect, useRef, useState } from 'react';
import { HORIZONS, SAMPLES, TEAM, PRIMARY_TERRITORIES, JAR, JAR_OPTS } from '@/lib/content';
import { uid, SessionState, PlanRow, tallyPick, ranked, topIds, people, tasteSummary, jarAll } from '@/lib/state';
import { STARTS, WHO, WHEN, TESTS, OWNERS, BASES, DUES, STEPS, DUE_DEFAULT, TO_CONFIRM, OTHER, CHANGES, ROLE, roleId, cardFor, unconfirmed, toggleIn, hasOpt } from '@/lib/conceptLibrary';
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

// What every direction leaves with: who it's for, the flavor brief, what the next version changes or tests, the next
// test, who takes it forward on each side, the base, when the next sample is due and the next step the room agreed. On
// the day every field is a tap on one of the options in conceptLibrary.ts; the flavor brief is drafted (from the
// tasting for a sample, from the map for a direction) and stays a draft until the team reviews it in the write-up.
export const PLAN_COLS = [
  { f: 'who', l: 'Consumer or occasion' },
  { f: 'role', l: 'Role in the range' },
  { f: 'brief', l: 'Flavor brief' },
  { f: 'change', l: 'Next version or question to test' },
  { f: 'test', l: 'Next test' },
  { f: 'owner', l: 'TFF owner' },
  { f: 'reviewer', l: 'C&D reviewer' },
  { f: 'base', l: 'Base' },
  { f: 'due', l: 'Next sample due' },
  { f: 'step', l: 'Agreed next step' },
] as const;
// A line on the board, on the TV: what the next version changes or tests, the next test and the next step, large; then
// the owners and the date on one line.
const PLAN_KEY = PLAN_COLS.filter((c) => ['change', 'test', 'step'].includes(c.f));
const PLAN_META = [{ f: 'owner', short: 'TFF:' }, { f: 'reviewer', short: 'C&D:' }, { f: 'due', short: 'Due:' }];
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
// direction that already has a concept of the same name shows once), then, behind More ideas, every other sample and
// direction, so an idea the vote passed over can still be parked in Later.
export type TrayItem = { ref: string; name: string; sub: string; kind: 'concept' | 'direction'; start: string; more?: boolean };
const nameOf = (id: string, s: SessionState) => s.revealed?.samples[id]?.name || STARTS.find((x) => x.id === id)?.label || id;
export function trayItems(s: SessionState): TrayItem[] {
  const cs: TrayItem[] = teamConcepts(s).map((c: any) => ({ ref: c.id, name: c.name, sub: 'Concept', kind: 'concept', start: c.start || STARTS.find((x) => x.label === c.why || nameOf(x.id, s) === c.why)?.id || '' }));
  const tl = tallyPick(s, 'directions');
  const chips = topIds(tl).map((id) => [id, tl[id]] as const); // the top three, plus anything tied with the third
  const ds: TrayItem[] = chips.map(([id, n]) => ({ ref: id, name: nameOf(id, s), sub: `${n} ${n === 1 ? 'chip' : 'chips'}`, kind: 'direction', start: id }));
  const seen = new Set(cs.map((x) => x.name.trim().toLowerCase()));
  const main = [...cs, ...ds.filter((x) => !seen.has(x.name.trim().toLowerCase()))];
  const taken = new Set(main.flatMap((x) => [x.ref, x.start, x.name.trim().toLowerCase()]));
  const more: TrayItem[] = STARTS.filter((x) => !taken.has(x.id) && !taken.has(nameOf(x.id, s).trim().toLowerCase()))
    .map((x) => ({ ref: x.id, name: nameOf(x.id, s), sub: x.kind === 'sample' ? 'Tasted today' : 'A direction on the map', kind: 'direction', start: x.id, more: true }));
  return [...main, ...more];
}
// The base a line starts in: a sample's own, a tasted direction's (both its samples share one), or none yet.
const baseFor = (start: string) => {
  const st = STARTS.find((x) => x.id === start); if (!st) return '';
  if (st.base) return st.base;
  const bs = [...new Set(SAMPLES.filter((x) => x.territory === st.territory).map((x) => x.base))];
  return bs.length === 1 ? bs[0] : '';
};
// The flavor brief, drafted and labeled a draft everywhere until the team reviews it in the write-up. A sample starts
// from how the room tasted it (its sweetness and cooling checks); a direction nobody tasted starts from its promise on
// the map. Never from the sealed notes, and never a flavor instruction the room didn't give: what changes is its own
// field.
export function draftBrief(start: string, s: SessionState) {
  const st = STARTS.find((x) => x.id === start); const t = PRIMARY_TERRITORIES.find((x) => x.id === st?.territory);
  if (!st || !t) return '';
  const base = baseFor(start);
  if (st.kind === 'sample') {
    const sum = tasteSummary(s, st.id);
    const read = JAR.map((j) => { const v = jarAll(sum[j.key], JAR_OPTS); return v ? `${j.l.toLowerCase()} ${v}` : ''; }).filter(Boolean).join('; ');
    return `Starts from ${nameOf(st.id, s)} (Sample ${st.id}) as tasted${base ? `, in the ${base}` : ''}. ${read ? `In the tasting: ${read}.` : 'No sweetness or cooling checks came in.'}`;
  }
  return `Starts from the ${t.name} direction on the map${base ? `, in the ${base}` : ''}: ${t.promise}`;
}
// A new line's defaults: who it's for and when from the concept (or the direction's starter card), what the concept
// said the next version should do, the drafted brief and the base. The date stays To confirm until the room agrees one.
export function placeFields(item: TrayItem, s: SessionState): Record<string, string> {
  const c: any = item.kind === 'concept' ? s.concepts[item.ref] : null;
  const card = cardFor(item.start) || null;
  const who = c ? [c.segment, c.occasion] : card ? [card.segment, card.occasion] : [];
  return { ref: item.ref, who: who.filter(Boolean).join(' · '), role: c?.role || '', change: c?.change || '', brief: draftBrief(item.start, s), draft: '1', base: baseFor(item.start), due: DUE_DEFAULT };
}
// A line's role in the range (Core, Expanders, Explorers or Specialists): its own, else its concept card's (a line placed
// before November 6 has none of its own).
export const rowRole = (r: { role?: string; ref?: string }, s: SessionState) => r.role || (r.ref ? (s.concepts?.[r.ref] as any)?.role || '' : '');
export const roleCounts = (s: SessionState) => { const rows = Object.values(s.plan || {}); return Object.fromEntries(ROLE.map((o) => [roleId(o), rows.filter((r) => roleId(rowRole(r, s)) === roleId(o)).length])) as Record<string, number>; };
// The C&D reviewer shortlist: the pre-brief names first (that link went to Church & Dwight), then first names that
// joined on phones, leaving out names that match our own team's. It's a shortlist, not a record of who is responsible:
// the presenter confirms the person in the room before tapping. Then Other, in the notes, and To confirm.
export function reviewers(s: SessionState) {
  const first = (n: unknown) => String(n || '').trim().split(/\s+/)[0];
  const ours = new Set(TEAM.map((t) => first(t.name).toLowerCase()));
  const names = [...Object.values(s.survey || {}).map((a) => first(a.name)), ...people(s).filter((p) => !p.paper).map((p) => first(p.name)).filter((n) => !ours.has(n.toLowerCase()))].filter(Boolean);
  const seen = new Set<string>(); const out: string[] = [];
  for (const n of names) { const k = n.toLowerCase(); if (!seen.has(k)) { seen.add(k); out.push(n); } }
  return [...out, OTHER, TO_CONFIRM];
}

type Sel = { kind: 'tray'; ref: string } | { kind: 'row'; id: string } | null;
// Now, Next, Later by tapping: tap something in the tray (or a line already on the board), then tap Now, Next or Later
// to put it there. A selected line can be taken back. The TV and the presenter view each keep their own selection; with
// `edit`, the selected line's fields open as rows of options to tap.
export function PlanTap({ s, send, still, edit, onSelect }: { s: SessionState; send: Send; still?: boolean; edit?: boolean; onSelect?: (id: string | null) => void }) {
  const act = planActions(send);
  const [sel, setSel] = useState<Sel>(null);
  const [more, setMore] = useState(false); // the other samples and directions, behind More ideas
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
  const hint = !sel ? 'Place an idea when the group agrees: tap it, then Now, Next or Later.' : sel.kind === 'tray' ? 'Once the group agrees, tap Now, Next or Later.' : 'Tap Now, Next or Later to move it, or take it back.';
  const chip = (x: TrayItem) => (
    <button key={x.ref} type="button" data-nonav className={'tchip' + (x.more ? ' more' : '') + (sel?.kind === 'tray' && sel.ref === x.ref ? ' on' : '')} disabled={still || isPlaced(x)} aria-pressed={sel?.kind === 'tray' && sel.ref === x.ref} onClick={() => pick({ kind: 'tray', ref: x.ref })}>
      {x.name}<small>{isPlaced(x) ? 'On the board' : x.sub}</small>
    </button>
  );
  const main = tray.filter((x) => !x.more), extra = tray.filter((x) => x.more);
  const showMore = more || extra.some((x) => isPlaced(x) || (sel?.kind === 'tray' && sel.ref === x.ref));
  return (
    <div className={'pt' + (edit ? ' pt-edit' : '')}>
      <div className="pt-tray">
        <span className="k">To place</span>
        {main.length ? main.map(chip) : <em>The concepts and the top three from the chips vote show up here.</em>}
        {extra.length > 0 && !still && (showMore ? extra.map(chip) : <button type="button" data-nonav className="tchip more-toggle" onClick={() => setMore(true)}>More ideas<small>{extra.length} more to park</small></button>)}
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
                      {/* The TV leads with what the next round does and the next step; the rest is one line. The full
                          set is in the presenter view, the results page and the write-up. */}
                      <dl className="pt-key">{PLAN_KEY.map((c) => { const v = planCell(r, c.f); return <div key={c.f} className={unconfirmed(v) ? 'tbc' : ''}><dt>{c.l}</dt><dd>{v || 'To agree'}</dd></div>; })}</dl>
                      <p className="pt-meta">{PLAN_META.map((c) => { const v = planCell(r, c.f); return <span key={c.f} className={unconfirmed(v) ? 'tbc' : ''}>{c.short} {v || 'To agree'}</span>; })}</p>
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
    { f: 'role', l: 'Role in the range', opts: ROLE, v: rowRole(r, s), set: (v) => act.set(r.id, { role: v === rowRole(r, s) ? '' : v }) },
    ...([['test', 'Next test', TESTS], ['owner', 'TFF owner', OWNERS], ['reviewer', 'C&D reviewer (confirm the person in the room)', reviewers(s)], ['base', 'Base', BASES], ['due', 'Next sample due', DUES], ['step', 'Agreed next step', STEPS]] as [string, string, string[]][])
      .map(([f, l, opts]) => ({ f, l, opts, v: (r as any)[f] || '', set: (v: string) => act.set(r.id, { [f]: v === (r as any)[f] ? '' : v }) })),
  ];
  const change = r.change || '';
  return (
    <section className="pt-fields" aria-label={`The fields for ${r.what || 'this line'}`}>
      <h3>{r.what || 'Untitled'}</h3>
      <div className="pt-group" role="group" aria-label="Next version or question to test">
        <span>Next version or question to test <small>(one or more)</small></span>
        <div>{[...CHANGES, OTHER].map((o) => <button key={o} type="button" aria-pressed={hasOpt(change, o)} onClick={() => act.set(r.id, { change: toggleIn(change, o) })}>{o}</button>)}</div>
      </div>
      {groups.map((g) => (
        <div key={g.f} className="pt-group" role="group" aria-label={g.l}>
          <span>{g.l}</span>
          <div>{g.opts.map((o) => <button key={o} type="button" aria-pressed={g.v === o} className={/to confirm/i.test(o) ? 'tbc' : ''} onClick={() => g.set(o)}>{o}</button>)}</div>
        </div>
      ))}
      <p className="pt-briefnote"><span>Flavor brief{r.draft ? ', a draft until the team reviews it in the write-up' : ''}</span>{planCell(r, 'brief') || 'None yet'}</p>
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

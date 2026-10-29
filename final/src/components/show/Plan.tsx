'use client';
// Now, Next, Later as rows: what goes forward, who it's for, the flavor brief, its TFF owner and C&D reviewer, the base and
// when the next sample is due (the six fields the front door and the pre-brief promise). The
// board scene types them on the TV and the presenter view types them on the laptop; both write `plan` events to the
// same session, so the Playbook read-back, the last slides and the results page all show the same rows.
import { useEffect, useRef, useState } from 'react';
import { HORIZONS, SAMPLES, TEAM } from '@/lib/content';
import { uid, SessionState, PlanRow } from '@/lib/state';

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

// What every direction leaves with (the same six the front door and the pre-brief promise).
export const PLAN_COLS = [
  { f: 'who', l: 'Consumer or occasion' },
  { f: 'brief', l: 'Flavor brief' },
  { f: 'owner', l: 'TFF owner', list: 'plan-owner' },
  { f: 'reviewer', l: 'C&D reviewer' },
  { f: 'base', l: 'Base', list: 'plan-base' },
  { f: 'due', l: 'Next sample due', date: true },
] as const;
// "2026-12-04" as "Dec 4, 2026"; anything else as typed.
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
    add: (h: string, what = '') => send('plan', { id: 'r-' + uid().slice(0, 12), h, fields: { what } }),
    set: (id: string, fields: Partial<Record<string, string>>) => send('plan', { id, fields }),
    move: (id: string, h: string) => send('plan', { id, h }),
    remove: (id: string) => send('unplan', { id }),
  };
}

// The suggestions each box offers: the team for the owner, the two bases in the tasting (Fresh Breath, Kids).
export function PlanLists() {
  const bases = [...new Set(SAMPLES.map((x) => x.base.replace(/ base$/, '')))]; // the column already says Base
  return (
    <>
      <datalist id="plan-owner">{TEAM.map((t) => <option key={t.name} value={t.name} />)}</datalist>
      <datalist id="plan-base">{bases.map((b) => <option key={b} value={b} />)}</datalist>
    </>
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

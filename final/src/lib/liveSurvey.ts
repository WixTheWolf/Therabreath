'use client';
// A rehearsal has no pre-brief answers of its own, so "Your pre-brief answers" would never show in it. This reads the
// live session's answers (the team view: no names) so the slide can be rehearsed as the room will see it. Read only:
// a GET every 30 seconds, no outbox and no tab channel, so nothing is ever sent to the live session from a rehearsal.
import { useEffect, useMemo, useState } from 'react';
import { Ev, fold, SessionState } from './state';
import { EVENT } from './content';

const EMPTY: SessionState['survey'] = {};

export function useLiveSurvey(code: string, on: boolean): SessionState['survey'] {
  const [evs, setEvs] = useState<Ev[]>([]);
  useEffect(() => {
    if (!on || code === EVENT.code) return;
    let alive = true, seq = 0;
    const get = async () => {
      const ctl = new AbortController(); const cut = setTimeout(() => ctl.abort(), 8000);
      try {
        const r = await fetch(`/api/s/${EVENT.code}/events?after=${seq}`, { cache: 'no-store', signal: ctl.signal });
        if (!r.ok) return;
        const j = await r.json();
        const list: (Ev & { seq: number })[] = j.events || [];
        if (!alive || !list.length) return;
        seq = list[list.length - 1].seq;
        const keep = list.filter((e) => e.kind === 'survey' || e.kind === 'wipe');
        if (keep.length) setEvs((prev) => [...prev, ...keep]);
      } catch {} finally { clearTimeout(cut); }
    };
    get();
    const iv = setInterval(() => { if (document.visibilityState !== 'hidden') get(); }, 30000);
    return () => { alive = false; clearInterval(iv); };
  }, [code, on]);
  return useMemo(() => (on && code !== EVENT.code && evs.length ? fold(evs).survey : EMPTY), [on, code, evs]);
}

'use client';
// One hook for every surface. Folds the shared event log into state.
// Transport: HTTP polling (always), Supabase Realtime nudges (when configured), BroadcastChannel
// between tabs on the same machine (instant, and the offline path), and a localStorage outbox
// so nothing tapped during a network drop is lost.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Ev, fold, uid } from './state';

type Opts = { k?: string; admin?: boolean; interval?: number };
const OUTBOX = (code: string) => `pb-outbox-${code}`;

export function useSession(code: string, opts: Opts = {}) {
  const [events, setEvents] = useState<Ev[]>([]);
  const [pending, setPending] = useState<Ev[]>([]);
  const [status, setStatus] = useState({ online: true, store: '', realtime: false, lastOk: 0, rtt: 0 });
  const seq = useRef(0);
  const busy = useRef(false);
  const flushing = useRef(false);
  const chan = useRef<BroadcastChannel | null>(null);
  const kq = opts.k ? `&k=${encodeURIComponent(opts.k)}` : '';

  const pull = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    const t0 = performance.now();
    try {
      const r = await fetch(`/api/s/${code}/events?after=${seq.current}${kq}`, { cache: 'no-store' });
      if (!r.ok) throw new Error(String(r.status));
      const j = await r.json();
      if (j.events.length) {
        const maxSeq = j.events[j.events.length - 1].seq;
        const wiped = j.events.some((e: Ev) => e.kind === 'wipe');
        seq.current = maxSeq;
        setEvents((prev) => (wiped ? j.events.slice(j.events.findLastIndex((e: Ev) => e.kind === 'wipe')) : [...prev, ...j.events]));
        const ids = new Set(j.events.map((e: Ev) => e.id));
        setPending((p) => p.filter((e) => !ids.has(e.id)));
      }
      setStatus((s) => ({ ...s, online: true, store: j.store, realtime: j.realtime, lastOk: Date.now(), rtt: Math.round(performance.now() - t0), topic: j.topic } as any));
    } catch {
      setStatus((s) => ({ ...s, online: false }));
    } finally { busy.current = false; }
  }, [code, kq]);

  const flush = useCallback(async () => {
    let box: Ev[] = [];
    try { box = JSON.parse(localStorage.getItem(OUTBOX(code)) || '[]'); } catch {}
    if (!box.length || flushing.current) return;
    flushing.current = true;
    try {
      while (box.length) {
        const chunk = box.slice(0, 200);
        const r = await fetch(`/api/s/${code}/events`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ events: chunk, k: opts.k }) });
        if (!r.ok) break;
        const sent = new Set(chunk.map((e) => e.id));
        try { box = JSON.parse(localStorage.getItem(OUTBOX(code)) || '[]').filter((e: Ev) => !sent.has(e.id)); localStorage.setItem(OUTBOX(code), JSON.stringify(box)); } catch { box = []; }
      }
      chan.current?.postMessage({ t: 'nudge' }); pull();
    } catch {} finally { flushing.current = false; }
  }, [code, opts.k, pull]);

  const send = useCallback((kind: string, data: any = {}, pid?: string) => {
    const e: Ev = { id: uid(), t: Date.now(), kind, pid, data };
    setPending((p) => [...p, e]);
    chan.current?.postMessage({ t: 'ev', e });
    try { const box = JSON.parse(localStorage.getItem(OUTBOX(code)) || '[]'); box.push(e); localStorage.setItem(OUTBOX(code), JSON.stringify(box)); } catch {}
    flush();
    return e;
  }, [code, flush]);

  const sendMany = useCallback((evs: { kind: string; data?: any; pid?: string; t?: number }[]) => {
    const list: Ev[] = evs.map((x) => ({ id: uid(), t: x.t || Date.now(), kind: x.kind, pid: x.pid, data: x.data || {} }));
    setPending((p) => [...p, ...list]);
    list.forEach((e) => chan.current?.postMessage({ t: 'ev', e }));
    try { const box = JSON.parse(localStorage.getItem(OUTBOX(code)) || '[]'); localStorage.setItem(OUTBOX(code), JSON.stringify([...box, ...list])); } catch {}
    flush();
  }, [code, flush]);

  useEffect(() => {
    let alive = true;
    const bc = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('pb-' + code) : null;
    chan.current = bc;
    if (bc) bc.onmessage = (m) => {
      if (m.data?.t === 'ev') setPending((p) => (p.some((x) => x.id === m.data.e.id) ? p : [...p, m.data.e]));
      else pull();
    };
    pull(); flush();
    const every = opts.interval || (opts.admin ? 450 : 1100);
    const iv = setInterval(() => { if (alive && document.visibilityState !== 'hidden') { pull(); flush(); } }, every);
    return () => { alive = false; clearInterval(iv); bc?.close(); };
  }, [code, opts.admin, opts.interval, pull, flush]);

  // Supabase Realtime: subscribe once the server tells us the topic.
  const topic = (status as any).topic as string | undefined;
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key || !topic) return;
    let ch: any, client: any;
    import('@supabase/supabase-js').then(({ createClient }) => {
      client = createClient(url, key, { auth: { persistSession: false } });
      ch = client.channel(topic).on('broadcast', { event: 'ev' }, () => pull()).subscribe();
    }).catch(() => {});
    return () => { try { client?.removeChannel(ch); } catch {} };
  }, [topic, pull]);

  const all = useMemo(() => {
    const ids = new Set(events.map((e) => e.id));
    return [...events, ...pending.filter((e) => !ids.has(e.id))];
  }, [events, pending]);
  const state = useMemo(() => fold(all), [all]);
  return { state, events: all, send, sendMany, status, pull };
}

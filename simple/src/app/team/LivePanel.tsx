'use client';
// The live session at a glance, and the one way into it. How many pre-brief answers are in and who's on their phone
// come straight from FOF1109. Opening the live presentation takes two clicks, because it moves everyone's phones.
import { useEffect, useState } from 'react';
import { fold, type Ev } from '@/lib/state';

export default function LivePanel({ code }: { code: string }) {
  const [n, setN] = useState<{ answers: number; joined: number } | null>(null);
  const [armed, setArmed] = useState(false);
  const [err, setErr] = useState(false); // the last try failed; it tries again every 15 seconds
  useEffect(() => {
    let on = true;
    const load = async () => {
      try {
        const ctl = new AbortController(); const cut = setTimeout(() => ctl.abort(), 10000);
        const r = await fetch(`/api/s/${code}/events`, { cache: 'no-store', signal: ctl.signal }).finally(() => clearTimeout(cut));
        if (!r.ok) { if (on) setErr(true); return; }
        const s = fold((await r.json()).events as Ev[]);
        if (on) { setN({ answers: Object.keys(s.survey).length, joined: Object.keys(s.participants).length }); setErr(false); }
      } catch { if (on) setErr(true); }
    };
    load();
    const id = setInterval(load, 15000);
    return () => { on = false; clearInterval(id); };
  }, [code]);
  const count = (v: number | undefined, one: string, many: string) => (v === undefined ? '…' : `${v} ${v === 1 ? one : many}`);
  return (
    <section className="tm-live" aria-label="The live session">
      <div className="tm-live-stats" aria-live="polite">
        {!n && err ? <span>Couldn’t reach the live session just now. It tries again every 15 seconds.</span>
          : !n ? <span>Counting the pre-brief answers…</span> : <>
            <span><b>{count(n.answers, 'pre-brief answer', 'pre-brief answers')}</b> in so far</span>
            <span><b>{count(n.joined, 'phone', 'phones')}</b> joined the live session</span>
            {err && <span className="tm-live-stale">Last count shown; trying again.</span>}
          </>}
      </div>
      {!armed ? (
        <button type="button" className="tm-live-go" onClick={() => setArmed(true)}>Present on the day</button>
      ) : (
        <div className="tm-live-confirm" role="group" aria-label="Open the live presentation">
          <p>This is the live session, {code}. Anything you click there shows up on everyone’s phones, so open it on the presenting laptop only, on November 9.</p>
          <a className="tm-live-go armed" href="/host">Open the live presentation</a>
          <button type="button" className="tm-live-back" onClick={() => setArmed(false)}>Not now</button>
        </div>
      )}
    </section>
  );
}

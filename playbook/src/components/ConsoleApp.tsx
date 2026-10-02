'use client';
import { useEffect, useMemo, useState } from 'react';
import { useSession } from '@/lib/useSession';
import ConsolePanel from './ConsolePanel';
import type { Ctx } from './StageApp';

// Full-page Console for a phone, tablet or laptop, separate from the Stage.
export default function ConsoleApp({ code, k }: { code: string; k: string }) {
  const sess = useSession(code, { admin: true, interval: 450 });
  const [origin, setOrigin] = useState('');
  useEffect(() => { setOrigin(location.origin); document.documentElement.dataset.theme = 'b'; }, []);
  const ctx: Ctx = useMemo(() => ({ code, k, origin, joinUrl: `${origin}/j/${code}?k=${k}` }), [code, k, origin]);
  return <main className="console-page"><ConsolePanel sess={sess} ctx={ctx} /><Invites base={`${origin}/survey/${code}?k=${k}`} /></main>;
}

// Personal pre-brief links: one per attendee, so their first name greets them.
function Invites({ base }: { base: string }) {
  const [names, setNames] = useState('');
  const [copied, setCopied] = useState('');
  const list = names.split(/\n|,/).map((n) => n.trim()).filter(Boolean);
  const url = (n: string) => `${base}&n=${encodeURIComponent(n.split(/\s+/)[0])}`;
  const copy = async (t: string, id: string) => { try { await navigator.clipboard.writeText(t); setCopied(id); setTimeout(() => setCopied(''), 1400); } catch {} };
  return (
    <section className="cx-survey">
      <div className="k">Pre-brief links</div>
      <p>General link: <code>{base}</code></p>
      <label className="cx-invite"><span>Attendee names, one per line, for personal links</span><textarea rows={4} value={names} onChange={(e) => setNames(e.target.value)} placeholder={'Jane Smith\nSam Lee'} /></label>
      {list.length > 0 && <ul className="cx-links">{list.map((n) => <li key={n}><b>{n}</b><code>{url(n)}</code><button onClick={() => copy(url(n), n)}>{copied === n ? 'Copied' : 'Copy'}</button></li>)}</ul>}
      {list.length > 1 && <button className="cx-copyall" onClick={() => copy(list.map((n) => `${n}: ${url(n)}`).join('\n'), '*')}>{copied === '*' ? 'Copied' : 'Copy all'}</button>}
    </section>
  );
}

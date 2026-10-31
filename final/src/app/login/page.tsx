'use client';
import { useEffect, useState } from 'react';

// One gate. Church & Dwight's password opens the front door; the host password opens everything. ?team=1 marks a team
// page (the presentation, the run sheet, the PDFs), where the room password isn't enough, so the gate says so and points
// to the team link. ?host=1 marks the old Console, which also needs the host password.
export default function Login() {
  const [pw, setPw] = useState(''); const [err, setErr] = useState(false); const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<'' | 'team' | 'host'>('');
  useEffect(() => { const q = new URLSearchParams(location.search); setMode(q.get('host') === '1' ? 'host' : q.get('team') === '1' ? 'team' : ''); }, []);
  const host = mode !== '';
  const go = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setErr(false);
    const r = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: pw, host }) });
    setBusy(false);
    // A host with nowhere else to go lands on the team page; everyone else on the front door.
    if (r.ok) location.href = new URLSearchParams(location.search).get('next') || ((await r.json()).host ? '/team' : '/'); else setErr(true);
  };
  return (
    <main className="gate">
      <div className="gate-drop" aria-hidden />
      <form onSubmit={go} className="gate-card">
        <div className="k">TheraBreath × The Flavor Factory</div>
        <h1 className="h2">The Future<br /><span className="it">of Freshness</span></h1>
        <p>{mode === 'host' ? 'The old workshop Console. Enter the host password.' : mode === 'team' ? 'This page is for The Flavor Factory team. Open your team link, or enter the host password here.' : 'This is confidential. Please enter your password.'}</p>
        <input type="password" autoFocus autoComplete="current-password" autoCapitalize="none" autoCorrect="off" spellCheck={false} value={pw} onChange={(e) => setPw(e.target.value)} placeholder={host ? 'Host password' : 'Password'} aria-label={host ? 'Host password' : 'Password'} />
        {err && <div className="gate-err">{mode === 'team' ? 'That password doesn’t open the team pages. Church & Dwight’s password opens the front door only, so use your team link or the host password.' : 'That password didn’t work. Check it and try again.'}</div>}
        <button disabled={busy || !pw}>{busy ? 'Checking' : 'Enter'}</button>
      </form>
    </main>
  );
}

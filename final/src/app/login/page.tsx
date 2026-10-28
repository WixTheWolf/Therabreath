'use client';
import { useEffect, useState } from 'react';

// One gate. The password opens everything a team member needs; ?host=1 marks the old Console, which still needs the
// host password.
export default function Login() {
  const [pw, setPw] = useState(''); const [err, setErr] = useState(false); const [busy, setBusy] = useState(false); const [host, setHost] = useState(false);
  useEffect(() => { setHost(new URLSearchParams(location.search).get('host') === '1'); }, []);
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
        <p>{host ? 'The old workshop Console. Enter the host password.' : 'This is confidential. Please enter your password.'}</p>
        <input type="password" autoFocus autoComplete="current-password" autoCapitalize="none" autoCorrect="off" spellCheck={false} value={pw} onChange={(e) => setPw(e.target.value)} placeholder={host ? 'Host password' : 'Password'} aria-label="Password" />
        {err && <div className="gate-err">That’s not it. Please try again.</div>}
        <button disabled={busy || !pw}>{busy ? 'Checking' : 'Enter'}</button>
      </form>
    </main>
  );
}

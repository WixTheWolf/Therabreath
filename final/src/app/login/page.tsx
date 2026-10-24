'use client';
import { useEffect, useState } from 'react';

// One gate, two passwords: ?host=1 asks for the host password (Host tools, Console, export, wipe).
export default function Login() {
  const [pw, setPw] = useState(''); const [err, setErr] = useState(false); const [busy, setBusy] = useState(false); const [host, setHost] = useState(false);
  useEffect(() => { setHost(new URLSearchParams(location.search).get('host') === '1'); }, []);
  const go = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setErr(false);
    const r = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: pw, host }) });
    setBusy(false);
    if (r.ok) location.href = new URLSearchParams(location.search).get('next') || '/'; else setErr(true);
  };
  return (
    <main className="gate">
      <div className="gate-drop" aria-hidden />
      <form onSubmit={go} className="gate-card">
        <div className="k">TheraBreath × The Flavor Factory</div>
        <h1 className="h2">The Flavor<br /><span className="it">Playbook</span></h1>
        <p>{host ? 'Host tools. Enter the host password.' : 'Confidential. Enter the session password.'}</p>
        <input type="password" autoFocus autoComplete="current-password" autoCapitalize="none" autoCorrect="off" spellCheck={false} value={pw} onChange={(e) => setPw(e.target.value)} placeholder={host ? 'Host password' : 'Password'} aria-label="Password" />
        {err && <div className="gate-err">That is not it. Try again.</div>}
        <button disabled={busy || !pw}>{busy ? 'Checking' : 'Enter'}</button>
      </form>
    </main>
  );
}

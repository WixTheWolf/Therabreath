'use client';
// Host tools: open the live session or a rehearsal session, on each surface.
import { useState } from 'react';

export default function Home() {
  const [code, setCode] = useState('TB1109');
  const c = code.toUpperCase().replace(/[^A-Z0-9]/g, '') || 'TB1109';
  return (
    <main className="home" data-theme="b">
      <div className="home-in">
        <div className="k">TheraBreath × The Flavor Factory · November 9, 2026</div>
        <h1 className="hero" style={{ fontSize: 120 }}>The Flavor<br /><span className="it">Playbook</span></h1>
        <label className="home-code"><span>Session code</span><input value={code} onChange={(e) => setCode(e.target.value)} maxLength={12} /></label>
        <p className="home-note">Use <b>TB1109</b> on the day. Any other code is a clean rehearsal session.</p>
        <div className="home-grid">
          <a href={`/stage/${c}`}><b>Stage</b><span>The room display. Full screen on the projector or LED.</span></a>
          <a href={`/console/${c}`}><b>Console</b><span>Matt and Ryan. Scenes, votes, timers, notes, simulator.</span></a>
          <a href={`/playbook/${c}`}><b>Playbook</b><span>The document the room builds, as a web page and PDF.</span></a>
          <a href={`/stage/${c}?console=1`}><b>Stage + Console</b><span>Both in one window, for rehearsing on one screen.</span></a>
        </div>
        <button className="home-out" onClick={async () => { await fetch('/api/logout', { method: 'POST' }); location.href = '/login'; }}>Sign out</button>
      </div>
    </main>
  );
}

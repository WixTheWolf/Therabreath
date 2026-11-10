'use client';
// Refresh the rehearsal: clears the REHEARSE session (joins, votes, scores, concepts, the plan) so the next run starts
// from slide 1. The code is fixed here and never comes from the page, so this can only ever touch the rehearsal.
// Like every wipe, it keeps any pre-brief answers in that session. It asks once before it clears anything.
import { useState } from 'react';

const REHEARSAL = 'REHEARSE';

export default function RehearsalReset() {
  const [stage, setStage] = useState<'idle' | 'armed' | 'busy' | 'done' | 'failed'>('idle');
  const refresh = async () => {
    setStage('busy');
    try {
      const r = await fetch(`/api/s/${REHEARSAL}/wipe`, { method: 'POST' });
      setStage(r.ok ? 'done' : 'failed');
    } catch { setStage('failed'); }
  };
  return (
    <div className="tm-reset" aria-live="polite">
      {stage === 'idle' && <button type="button" className="tm-live-back" onClick={() => setStage('armed')}>Refresh the rehearsal</button>}
      {stage === 'armed' && (
        <div className="tm-live-confirm" role="group" aria-label="Refresh the rehearsal">
          <p>This clears the rehearsal’s phones, votes, scores, concepts and plan, and it starts again from slide 1. Any pre-brief answers in it stay. The live session isn’t touched.</p>
          <button type="button" className="tm-live-go" onClick={refresh}>Clear the rehearsal</button>
          <button type="button" className="tm-live-back" onClick={() => setStage('idle')}>Not now</button>
        </div>
      )}
      {stage === 'busy' && <p>Clearing the rehearsal…</p>}
      {stage === 'done' && <p>The rehearsal is fresh. Reload any rehearsal tab that’s open, and phones join again from the code. <button type="button" className="tm-reset-again" onClick={() => setStage('idle')}>OK</button></p>}
      {stage === 'failed' && <p>That didn’t work. Check you’re signed in with the team link, then try again. <button type="button" className="tm-reset-again" onClick={() => setStage('armed')}>Try again</button></p>}
    </div>
  );
}

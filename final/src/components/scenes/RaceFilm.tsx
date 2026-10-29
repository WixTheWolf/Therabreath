'use client';
// The old Stage's film scene (/stage, team only), on its own so that pages Church & Dwight can open never load it.
import { useEffect, useRef, useState } from 'react';
import { SceneProps } from './ui';

// THE FLAVOR RACE (V22, 2:26), the send-off at the end of the morning. Lights down, sound up.
export function Film({ ctx }: SceneProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(false); const [done, setDone] = useState(false);
  useEffect(() => {
    const v = ref.current!; v.muted = false;
    v.play().catch(() => { v.muted = true; setMuted(true); v.play().catch(() => {}); });
  }, []);
  return (
    <div className="film" onClick={() => { const v = ref.current!; v.muted = false; setMuted(false); v.play(); }}>
      <video ref={ref} playsInline preload="auto" poster="/media/flavor-race-poster.jpg" onEnded={() => setDone(true)}>
        <source src="/media/flavor-race.mp4" type="video/mp4" />
      </video>
      {muted && !done && <div className="film-sound">Click for sound</div>}
      <div className={'film-end' + (done ? ' on' : '')}><div className="k">TheraBreath × The Flavor Factory</div><h1 className="hero center">The Future<br /><span className="it">of Freshness</span></h1></div>
    </div>
  );
}


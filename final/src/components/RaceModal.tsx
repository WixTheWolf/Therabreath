'use client';
// THE FLAVOR RACE in a player for the team (HostBar). Escape, the Close button or a click outside closes it, and focus
// returns to the button that opened it. The file is team only (src/proxy.ts); this component is too.
import { useEffect, useRef } from 'react';

export default function RaceModal({ onClose }: { onClose: () => void }) {
  const box = useRef<HTMLDivElement>(null);
  const close = useRef(onClose); close.current = onClose;
  useEffect(() => {
    const back = document.activeElement as HTMLElement | null;
    box.current?.querySelector<HTMLElement>('.st-shut')?.focus();
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.preventDefault(); close.current(); } };
    addEventListener('keydown', k);
    return () => { removeEventListener('keydown', k); back?.focus?.({ preventScroll: true }); };
  }, []);
  return (
    <div className="st-modal" ref={box} onClick={onClose} role="dialog" aria-modal="true" aria-label="THE FLAVOR RACE">
      <div className="st-modal-in" onClick={(e) => e.stopPropagation()}>
        <video autoPlay controls playsInline poster="/media/flavor-race-poster.jpg" onEnded={onClose} aria-label="THE FLAVOR RACE"><source src="/media/flavor-race.mp4" type="video/mp4" /></video>
      </div>
      <div className="st-modal-bar" onClick={(e) => e.stopPropagation()}><button className="st-x st-shut" onClick={onClose}>Close<span aria-hidden="true"> · Esc</span></button></div>
    </div>
  );
}

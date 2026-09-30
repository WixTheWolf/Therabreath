'use client';
// The 30-second opening film, full screen with sound. Escape or a click outside closes it.
import { useEffect } from 'react';

export default function FilmModal({ onClose }: { onClose: () => void }) {
  useEffect(() => { const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose(); addEventListener('keydown', k); return () => removeEventListener('keydown', k); }, [onClose]);
  return (
    <div className="st-modal" onClick={onClose} role="dialog" aria-label="The opening film">
      <video autoPlay controls playsInline poster="/media/opening-poster.jpg" onClick={(e) => e.stopPropagation()} onEnded={onClose}>
        <source src="/media/opening.mp4" type="video/mp4" /><source src="/media/opening.webm" type="video/webm" />
      </video>
      <button className="st-x" onClick={onClose} aria-label="Close">Close</button>
    </div>
  );
}

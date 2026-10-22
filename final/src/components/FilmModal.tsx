'use client';
// The opening film (1:18), full screen with sound. Escape or a click outside closes it.
// `q` carries the pre-brief's signed link (c and k) so the film plays there without the password.
import { useEffect } from 'react';

export default function FilmModal({ onClose, q = '' }: { onClose: () => void; q?: string }) {
  useEffect(() => { const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose(); addEventListener('keydown', k); return () => removeEventListener('keydown', k); }, [onClose]);
  return (
    <div className="st-modal" onClick={onClose} role="dialog" aria-label="The opening film">
      <video autoPlay controls playsInline poster={`/media/film-poster.jpg${q}`} onClick={(e) => e.stopPropagation()} onEnded={onClose}>
        <source src={`/media/opening.mp4${q}`} type="video/mp4" /><source src={`/media/opening.webm${q}`} type="video/webm" />
      </video>
      <button className="st-x" onClick={onClose} aria-label="Close">Close</button>
    </div>
  );
}

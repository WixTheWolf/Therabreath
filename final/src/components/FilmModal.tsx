'use client';
// A film, full screen with sound: the opening film (1:27), or THE FLAVOR RACE for hosts on the front door. Escape or a
// click outside closes it. `q` carries the pre-brief's signed link (c and k) so the opening film plays there without the
// password; THE FLAVOR RACE has no signed link (it premieres in the room).
import { useEffect } from 'react';

export default function FilmModal({ onClose, q = '', race = false }: { onClose: () => void; q?: string; race?: boolean }) {
  useEffect(() => { const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose(); addEventListener('keydown', k); return () => removeEventListener('keydown', k); }, [onClose]);
  return (
    <div className="st-modal" onClick={onClose} role="dialog" aria-label={race ? 'THE FLAVOR RACE' : 'The opening film'}>
      <video autoPlay controls playsInline poster={race ? '/media/flavor-race-poster.jpg' : `/media/film-poster.jpg${q}`} onClick={(e) => e.stopPropagation()} onEnded={onClose}>
        {race ? <source src="/media/flavor-race.mp4" type="video/mp4" />
          : <><source src={`/media/opening.mp4${q}`} type="video/mp4" /><source src={`/media/opening.webm${q}`} type="video/webm" /></>}
      </video>
      <button className="st-x" onClick={onClose} aria-label="Close">Close</button>
    </div>
  );
}

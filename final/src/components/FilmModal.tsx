'use client';
// A film, full screen with sound: the opening film, or THE FLAVOR RACE for hosts on the front door. Escape or a click
// outside closes it. `q` carries the pre-brief's signed link (c and k) so the opening film plays there without the
// password; THE FLAVOR RACE has no signed link (it premieres in the room). `file` picks the cut of the opening film (see
// FILM in content.ts), which plays with its captions; `onEnd` runs when it finishes (the default closes it).
import { useEffect } from 'react';

export default function FilmModal({ onClose, onEnd, q = '', race = false, file = 'opening' }: { onClose: () => void; onEnd?: () => void; q?: string; race?: boolean; file?: string }) {
  useEffect(() => { const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose(); addEventListener('keydown', k); return () => removeEventListener('keydown', k); }, [onClose]);
  return (
    <div className="st-modal" onClick={onClose} role="dialog" aria-label={race ? 'THE FLAVOR RACE' : 'The opening film'}>
      <video autoPlay controls playsInline poster={race ? '/media/flavor-race-poster.jpg' : `/media/film-poster.jpg${q}`} onClick={(e) => e.stopPropagation()} onEnded={onEnd ?? onClose}>
        {race ? <source src="/media/flavor-race.mp4" type="video/mp4" />
          : <><source src={`/media/${file}.mp4${q}`} type="video/mp4" /><source src={`/media/${file}.webm${q}`} type="video/webm" /><track kind="captions" srcLang="en" label="English" src={`/media/${file}.vtt${q}`} /></>}
      </video>
      <button className="st-x" onClick={onClose} aria-label="Close">Close</button>
    </div>
  );
}

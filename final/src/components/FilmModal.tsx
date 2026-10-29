'use client';
// A film, full screen with sound: the opening film, or THE FLAVOR RACE for hosts on the front door. Escape, the Close
// button or a click outside closes it, and focus goes back to whatever opened it; while it's open, Tab stays inside.
// `q` carries the pre-brief's signed link (c and k) so the opening film plays there without the password; THE FLAVOR RACE
// has no signed link (it premieres in the room). `file` picks the cut of the opening film (see FILM in content.ts),
// which plays with its captions and offers its transcript, read from the same caption file so it's always the words she
// says; `onEnd` runs when it finishes (the default closes it).
import { useEffect, useRef, useState } from 'react';

// The caption file as paragraphs: the cues joined into sentences, with the timings and cue numbers dropped.
function transcriptOf(vtt: string) {
  const cues = vtt.replace(/\r/g, '').split(/\n\n+/).map((b) => b.split('\n').filter((l) => l && !/^WEBVTT/.test(l) && !/-->/.test(l) && !/^\d+$/.test(l)).join(' ')).filter(Boolean);
  const out: string[] = []; let cur = '';
  for (const c of cues) { cur = cur ? `${cur} ${c}` : c; if (/[.!?”"]$/.test(c)) { out.push(cur); cur = ''; } }
  if (cur) out.push(cur);
  return out;
}

export default function FilmModal({ onClose, onEnd, q = '', race = false, file = 'opening' }: { onClose: () => void; onEnd?: () => void; q?: string; race?: boolean; file?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const close = useRef(onClose); close.current = onClose;
  const [lines, setLines] = useState<string[] | null>(null);
  const [showText, setShowText] = useState(false);
  // Once, on open: focus the Close button, keep Tab inside, stop the page scrolling behind; undo it all on close.
  useEffect(() => {
    const back = document.activeElement as HTMLElement | null;
    box.current?.querySelector<HTMLElement>('.st-close')?.focus();
    const k = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); close.current(); return; }
      if (e.key !== 'Tab' || !box.current) return;
      const els = [...box.current.querySelectorAll<HTMLElement>('video, button, [href], [tabindex]:not([tabindex="-1"])')].filter((x) => x.offsetParent !== null);
      if (!els.length) return;
      const i = els.indexOf(document.activeElement as HTMLElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); els[els.length - 1].focus(); }
      else if (!e.shiftKey && (i === -1 || i === els.length - 1)) { e.preventDefault(); els[0].focus(); }
    };
    addEventListener('keydown', k);
    const scroll = document.documentElement.style.overflow; document.documentElement.style.overflow = 'hidden';
    return () => { removeEventListener('keydown', k); document.documentElement.style.overflow = scroll; back?.focus?.({ preventScroll: true }); };
  }, []);
  const toggleText = async () => {
    setShowText((x) => !x);
    if (lines) return;
    try { const r = await fetch(`/media/${file}.vtt${q}`); setLines(r.ok ? transcriptOf(await r.text()) : []); } catch { setLines([]); }
  };
  const title = race ? 'THE FLAVOR RACE' : 'The opening film';
  return (
    <div className={'st-modal' + (showText ? ' with-text' : '')} ref={box} onClick={onClose} role="dialog" aria-modal="true" aria-label={title}>
      <div className="st-modal-in" onClick={(e) => e.stopPropagation()}>
        <video autoPlay controls playsInline poster={race ? '/media/flavor-race-poster.jpg' : `/media/film-poster.jpg${q}`} onEnded={onEnd ?? onClose} aria-label={title}>
          {race ? <source src="/media/flavor-race.mp4" type="video/mp4" />
            : <><source src={`/media/${file}.mp4${q}`} type="video/mp4" /><source src={`/media/${file}.webm${q}`} type="video/webm" /><track kind="captions" srcLang="en" label="English" src={`/media/${file}.vtt${q}`} /></>}
        </video>
        {showText && (
          <section className="st-transcript" id="film-transcript" aria-label="Transcript of the opening film" tabIndex={0}>
            <h2>Transcript</h2>
            {lines === null ? <p className="st-tx-wait">Loading the transcript…</p> : lines.length ? lines.map((l, i) => <p key={i}>{l}</p>) : <p className="st-tx-wait">The transcript didn’t load. Turn on the captions in the player for the same words.</p>}
          </section>
        )}
      </div>
      <div className="st-modal-bar" onClick={(e) => e.stopPropagation()}>
        {!race && <button className="st-x" onClick={toggleText} aria-expanded={showText} aria-controls="film-transcript">{showText ? 'Hide transcript' : 'Transcript'}</button>}
        <button className="st-x st-close" onClick={onClose}>Close<span aria-hidden="true"> · Esc</span></button>
      </div>
    </div>
  );
}

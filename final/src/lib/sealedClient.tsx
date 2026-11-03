'use client';
// Who may see the sealed names: the team's pages get them from the server as props (SealedProvider), and everyone else
// gets them from the session once the presentation reveals them. Until then a sample is its letter.
import { createContext, useContext, useMemo } from 'react';
import type { Sealed } from './content';

const SealedCtx = createContext<Sealed | null>(null);
export function SealedProvider({ value, children }: { value: Sealed; children: React.ReactNode }) {
  return <SealedCtx.Provider value={value}>{children}</SealedCtx.Provider>;
}
/** The team's copy (from the server), else what the room has been shown (the session's `revealed`). */
export function useSealed(revealed?: Sealed | null) {
  const team = useContext(SealedCtx);
  const src = team || revealed || null;
  return useMemo(() => ({
    team: !!team,
    /** the copy to hand the room at the reveal (the team's pages only) */
    data: team,
    name: (code: string) => src?.samples[code]?.name,
    note: (code: string) => src?.samples[code]?.note,
    hero: (territory: string) => src?.heroes[territory],
    /** a direction's label: the sample's name once it's known, else its letter */
    label: (d: { id: string; label: string }) => src?.samples[d.id]?.name || d.label,
  }), [team, src]);
}

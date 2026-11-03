'use client';
// The team's bar on the front door, and THE FLAVOR RACE behind its first button. SiteApp loads this file only for the
// team (next/dynamic), so the film's name and path never reach Church & Dwight's browsers before it premieres.
import { useState } from 'react';
import RaceModal from './RaceModal';

export default function HostBar() {
  const [race, setRace] = useState(false);
  return (
    <>
      <nav className="st-hostbar" aria-label="For the team"><button onClick={() => setRace(true)}>Watch THE FLAVOR RACE</button><a href="/host?code=REHEARSE">Rehearse</a><a href="/host/run">Run sheet</a><a href="/team">Team page</a></nav>
      {race && <RaceModal onClose={() => setRace(false)} />}
    </>
  );
}

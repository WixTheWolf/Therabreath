import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { EpicTitle } from "./epic";
import { EndCard, Flash, Super, loadFonts } from "./FlavorRaceV12_2";

/* THE FLAVOR RACE V12.2's graphics on their own, with transparency, for the editable Premiere timeline. Every element
   plays back to back in FlavorRaceGraphics (GRAPHICS gives each one's frame range); premiere/build_graphics.sh renders
   it as PNG frames and cuts it into one QuickTime Animation file (with alpha) per element. FlavorRaceFrame is the
   film's vignette and letterbox as one still layer (the moving grain is not included). */
export const GRAPHICS: { id: string; frames: number; el: (dur: number) => React.ReactNode }[] = [
  { id: "title", frames: 75, el: (d) => <EpicTitle lines={["THE FLAVOR RACE"]} dur={d} size={230} over hold /> },
  { id: "super_norco", frames: 84, el: (d) => <Super dur={d} a="NORCO, CALIFORNIA" b="THE FLAVOR FACTORY · MISSION CONTROL" /> },
  { id: "card_partners", frames: 86, el: (d) => <EpicTitle lines={["THERABREATH + THE FLAVOR FACTORY", "ONE MISSION: WHAT'S NEXT."]} dur={d} size={104} /> },
  { id: "super_lab", frames: 78, el: (d) => <Super dur={d} a="THE FLAVOR FACTORY" b="FLAVOR LAB" /> },
  { id: "super_ewing", frames: 84, el: (d) => <Super dur={d} a="EWING, NEW JERSEY" b="1847 HOURS" /> },
  { id: "endcard", frames: 180, el: (d) => <EndCard dur={d} /> },
  { id: "flash_lights", frames: 9, el: () => <Flash k={0.35} /> },
  { id: "flash_ignition", frames: 9, el: () => <Flash /> },
  { id: "flash_relight", frames: 10, el: () => <Flash warm /> },
];
export const GRAPHICS_FRAMES = GRAPHICS.reduce((a, g) => a + g.frames, 0);

export const FlavorRaceGraphics: React.FC = () => {
  loadFonts();
  let at = 0;
  return (
    <AbsoluteFill>
      {GRAPHICS.map((g) => {
        const from = at;
        at += g.frames;
        return (
          <Sequence key={g.id} from={from} durationInFrames={g.frames} layout="none">
            {g.el(g.frames)}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

// The vignette and the 118 px letterbox from the film's Grain layer, without the grain
export const FlavorRaceFrame: React.FC = () => (
  <AbsoluteFill>
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,.38) 100%)" }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 118, background: "#000" }} />
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 118, background: "#000" }} />
  </AbsoluteFill>
);

import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { EpicTitle } from "./epic";
import { EndCard, Flash, Super, loadFonts } from "./FlavorRaceV12_2";
import { Super14 } from "./FlavorRaceV14";

/* THE FLAVOR RACE's graphics on their own, with transparency, for the editable Premiere timeline: V12.2's in
   FlavorRaceGraphics (GRAPHICS), V14's in FlavorRaceGraphicsV14 (GRAPHICS14). Every element plays back to back (the
   list gives each one's frame range); premiere/build_media.py renders it as PNG frames and cuts it into one file per
   element (QuickTime Animation with alpha over picture, H.264 for the two cards on black). FlavorRaceFrame is the
   film's vignette and letterbox as one still layer (the moving grain is not included). */
type Graphic = { id: string; frames: number; el: (dur: number) => React.ReactNode };
export const GRAPHICS: Graphic[] = [
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
export const GRAPHICS14: Graphic[] = [
  { id: "title", frames: 90, el: (d) => <EpicTitle lines={["THE FLAVOR RACE"]} dur={d} size={230} over hold /> },
  { id: "card_partners", frames: 86, el: (d) => <EpicTitle lines={["THERABREATH + THE FLAVOR FACTORY", "ONE MISSION: WHAT'S NEXT."]} dur={d} size={104} /> },
  { id: "super_lab", frames: 96, el: (d) => <Super14 dur={d} a="THE FLAVOR FACTORY" b="NORCO, CALIFORNIA · FLAVOR LAB" /> },
  { id: "super_ewing", frames: 90, el: (d) => <Super14 dur={d} a="EWING, NEW JERSEY" b="CHURCH & DWIGHT HEADQUARTERS" /> },
  { id: "endcard", frames: 180, el: (d) => <EndCard dur={d} /> },
  { id: "flash_lights", frames: 9, el: () => <Flash k={0.35} /> },
  { id: "flash_ignition", frames: 9, el: () => <Flash /> },
  { id: "flash_relight", frames: 10, el: () => <Flash warm /> },
];
export const GRAPHICS_FRAMES = GRAPHICS.reduce((a, g) => a + g.frames, 0);
export const GRAPHICS14_FRAMES = GRAPHICS14.reduce((a, g) => a + g.frames, 0);

const Graphics: React.FC<{ list: Graphic[] }> = ({ list }) => {
  loadFonts();
  let at = 0;
  return (
    <AbsoluteFill>
      {list.map((g) => {
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
export const FlavorRaceGraphics: React.FC = () => <Graphics list={GRAPHICS} />;
export const FlavorRaceGraphicsV14: React.FC = () => <Graphics list={GRAPHICS14} />;

// The vignette and the 118 px letterbox from the film's Grain layer, without the grain
export const FlavorRaceFrame: React.FC = () => (
  <AbsoluteFill>
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,.38) 100%)" }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 118, background: "#000" }} />
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 118, background: "#000" }} />
  </AbsoluteFill>
);

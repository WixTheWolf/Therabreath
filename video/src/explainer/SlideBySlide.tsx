import React from "react";
import { Audio } from "@remotion/media";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { AbsoluteFill, interpolate, staticFile, useVideoConfig } from "remotion";
import { SLIDE_CARDS, beats } from "./slideData";
import { SlideTitleScene } from "./SlideTitleScene";
import { SlideScene } from "./SlideScene";
import { EndScene } from "./EndScene";
import { FADE } from "./MorningExplainer";
import { s } from "./ui";

// Slide by slide, v2 of the explainer: every slide with why it's there, what to say and the question for the room.
// Each slide stays up as long as its lines take to read. Same score as v1, looped under the whole film.
export const V2_TITLE = s(8);
export const V2_END = s(6);
export const slideFrames = SLIDE_CARDS.map((c) => beats(c).total);
const all = [V2_TITLE, ...slideFrames, V2_END];
export const SLIDE_BY_SLIDE_FRAMES = all.reduce((a, b) => a + b, 0) - FADE * (all.length - 1);

export const SlideBySlide: React.FC = () => {
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: "#0B1622" }}>
      <TransitionSeries>
        <TransitionSeries.Sequence name="Slide by slide" durationInFrames={V2_TITLE}>
          <SlideTitleScene />
        </TransitionSeries.Sequence>
        {SLIDE_CARDS.map((c, i) => (
          <React.Fragment key={c.id}>
            <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: FADE })} />
            <TransitionSeries.Sequence name={`Slide ${c.n}: ${c.title}`} durationInFrames={slideFrames[i]}>
              <SlideScene i={i} />
            </TransitionSeries.Sequence>
          </React.Fragment>
        ))}
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: FADE })} />
        <TransitionSeries.Sequence name="By noon" durationInFrames={V2_END}>
          <EndScene />
        </TransitionSeries.Sequence>
      </TransitionSeries>
      <Audio
        name="Score"
        src={staticFile("fof4/audio/music_b.mp3")}
        loop
        volume={(f) => interpolate(f, [0, 30, durationInFrames - 75, durationInFrames - 5], [0, 0.32, 0.32, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
      />
    </AbsoluteFill>
  );
};

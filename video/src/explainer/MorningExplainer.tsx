import React from "react";
import { Audio } from "@remotion/media";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { AbsoluteFill, interpolate, staticFile, useVideoConfig } from "remotion";
import { BLOCKS } from "./data";
import { TitleScene } from "./TitleScene";
import { ShapeScene } from "./ShapeScene";
import { PhonesScene } from "./PhonesScene";
import { BlockScene } from "./BlockScene";
import { KeysScene } from "./KeysScene";
import { TipsScene } from "./TipsScene";
import { EndScene } from "./EndScene";
import { s } from "./ui";

// How the morning runs: a walkthrough of the presentation for the team. Silent apart from the V4 score (already
// generated, reused here), so it reads fine with the sound off.
export const FADE = 15;
export const SCENE_SEC = { title: 5.5, shape: 10, phones: 9, keys: 11, tips: 12, end: 6 };
const sceneFrames = [s(SCENE_SEC.title), s(SCENE_SEC.shape), s(SCENE_SEC.phones), ...BLOCKS.map((b) => s(b.sec)), s(SCENE_SEC.keys), s(SCENE_SEC.tips), s(SCENE_SEC.end)];
export const EXPLAINER_FRAMES = sceneFrames.reduce((a, b) => a + b, 0) - FADE * (sceneFrames.length - 1);

export const MorningExplainer: React.FC = () => {
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: "#0B1622" }}>
      <TransitionSeries>
        <TransitionSeries.Sequence name="Title" durationInFrames={165}>
          <TitleScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: FADE })} />
        <TransitionSeries.Sequence name="Two hours, seven blocks" durationInFrames={300}>
          <ShapeScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: FADE })} />
        <TransitionSeries.Sequence name="Phones" durationInFrames={270}>
          <PhonesScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: FADE })} />
        <TransitionSeries.Sequence name="Welcome" durationInFrames={420}>
          <BlockScene n={0} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: FADE })} />
        <TransitionSeries.Sequence name="Part 1: What's changing" durationInFrames={480}>
          <BlockScene n={1} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: FADE })} />
        <TransitionSeries.Sequence name="Part 2: Where flavor could go" durationInFrames={480}>
          <BlockScene n={2} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: FADE })} />
        <TransitionSeries.Sequence name="Part 2: The blind tasting" durationInFrames={510}>
          <BlockScene n={3} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: FADE })} />
        <TransitionSeries.Sequence name="Part 3: What we could make" durationInFrames={420}>
          <BlockScene n={4} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: FADE })} />
        <TransitionSeries.Sequence name="Part 4: What to do first" durationInFrames={420}>
          <BlockScene n={5} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: FADE })} />
        <TransitionSeries.Sequence name="What we decided" durationInFrames={450}>
          <BlockScene n={6} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: FADE })} />
        <TransitionSeries.Sequence name="Running it" durationInFrames={330}>
          <KeysScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: FADE })} />
        <TransitionSeries.Sequence name="Running late and before Monday" durationInFrames={360}>
          <TipsScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: FADE })} />
        <TransitionSeries.Sequence name="By noon" durationInFrames={180}>
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

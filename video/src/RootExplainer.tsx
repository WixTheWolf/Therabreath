import { Composition, Folder } from "remotion";
import { MorningExplainer, EXPLAINER_FRAMES, SCENE_SEC } from "./explainer/MorningExplainer";
import { TitleScene } from "./explainer/TitleScene";
import { ShapeScene } from "./explainer/ShapeScene";
import { PhonesScene } from "./explainer/PhonesScene";
import { BlockScene } from "./explainer/BlockScene";
import { KeysScene } from "./explainer/KeysScene";
import { TipsScene } from "./explainer/TipsScene";
import { EndScene } from "./explainer/EndScene";
import { BLOCKS } from "./explainer/data";
import { s } from "./explainer/ui";
import { SlideBySlide, SLIDE_BY_SLIDE_FRAMES, V2_TITLE, slideFrames } from "./explainer/SlideBySlide";
import { SlideTitleScene } from "./explainer/SlideTitleScene";
import { SlideScene } from "./explainer/SlideScene";
import { SLIDE_CARDS } from "./explainer/slideData";

/* How the morning runs, the team's walkthrough of the presentation, on its own entry point (src/indexExplainer.ts).
   Each scene is also its own composition, so it can be previewed and edited on its own in the Studio. */
export const RemotionRootExplainer: React.FC = () => (
  <>
    <Folder name="MorningExplainer-Scenes">
      <Composition id="ExplainerTitle" component={TitleScene} durationInFrames={s(SCENE_SEC.title)} fps={30} width={1920} height={1080} />
      <Composition id="ExplainerShape" component={ShapeScene} durationInFrames={s(SCENE_SEC.shape)} fps={30} width={1920} height={1080} />
      <Composition id="ExplainerPhones" component={PhonesScene} durationInFrames={s(SCENE_SEC.phones)} fps={30} width={1920} height={1080} />
      {BLOCKS.map((b, n) => (
        <Composition key={b.id} id={`ExplainerBlock-${b.id}`} component={BlockScene} defaultProps={{ n }} durationInFrames={s(b.sec)} fps={30} width={1920} height={1080} />
      ))}
      <Composition id="ExplainerKeys" component={KeysScene} durationInFrames={s(SCENE_SEC.keys)} fps={30} width={1920} height={1080} />
      <Composition id="ExplainerTips" component={TipsScene} durationInFrames={s(SCENE_SEC.tips)} fps={30} width={1920} height={1080} />
      <Composition id="ExplainerEnd" component={EndScene} durationInFrames={s(SCENE_SEC.end)} fps={30} width={1920} height={1080} />
    </Folder>
    <Composition id="MorningExplainer" component={MorningExplainer} durationInFrames={EXPLAINER_FRAMES} fps={30} width={1920} height={1080} />
    {/* v2: slide by slide, why each slide is there and what to say on it. */}
    <Folder name="SlideBySlide-Slides">
      <Composition id="SlideBySlideTitle" component={SlideTitleScene} durationInFrames={V2_TITLE} fps={30} width={1920} height={1080} />
      {SLIDE_CARDS.map((c, i) => (
        <Composition key={c.id} id={`SlideBySlide-${String(c.n).padStart(2, "0")}-${c.id}`} component={SlideScene} defaultProps={{ i }} durationInFrames={slideFrames[i]} fps={30} width={1920} height={1080} />
      ))}
    </Folder>
    <Composition id="SlideBySlide" component={SlideBySlide} durationInFrames={SLIDE_BY_SLIDE_FRAMES} fps={30} width={1920} height={1080} />
  </>
);

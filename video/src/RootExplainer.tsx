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
  </>
);

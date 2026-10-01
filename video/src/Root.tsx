import { Composition, Folder } from "remotion";
import { Reel, SCENES, TOTAL } from "./Reel";
import { Opening, OPENING_FRAMES, LOOP_FRAMES } from "./Opening";
import { FlavorRace, RACE_FRAMES } from "./FlavorRace";
import { FlavorRaceV2, RACE2_FRAMES } from "./FlavorRaceV2";
import "./index.css";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Opening" component={Opening} durationInFrames={OPENING_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="OpeningLoop" component={Opening} defaultProps={{ clean: true }} durationInFrames={LOOP_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="FlavorRace" component={FlavorRace} durationInFrames={RACE_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="FlavorRaceV2" component={FlavorRaceV2} durationInFrames={RACE2_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="PreReadReel" component={Reel} durationInFrames={TOTAL} fps={30} width={1920} height={1080} />
    <Folder name="Scenes">
      {SCENES.map(({ id, dur, C }) => (
        <Composition key={id} id={id} component={C} durationInFrames={dur} fps={30} width={1920} height={1080} />
      ))}
    </Folder>
  </>
);

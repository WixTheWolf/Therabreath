import { Composition, Folder } from "remotion";
import { Reel, SCENES, TOTAL } from "./Reel";
import { Opening, OPENING_FRAMES, LOOP_FRAMES } from "./Opening";
import { FlavorRace, RACE_FRAMES } from "./FlavorRace";
import { FlavorRaceV2, RACE2_FRAMES } from "./FlavorRaceV2";
import { FlavorRaceV3, RACE3_FRAMES } from "./FlavorRaceV3";
import { FlavorRaceV4, RACE4_FRAMES } from "./FlavorRaceV4";
import { FlavorRaceV5, RACE5_FRAMES } from "./FlavorRaceV5";
import { FlavorRaceV6, RACE6_FRAMES } from "./FlavorRaceV6";
import { FlavorRaceV7, RACE7_FRAMES } from "./FlavorRaceV7";
import { FlavorRaceV8, RACE8_FRAMES } from "./FlavorRaceV8";
import { FlavorRaceV9, RACE9_FRAMES } from "./FlavorRaceV9";
import { FlavorRaceV10, RACE10_FRAMES } from "./FlavorRaceV10";
import { FlavorRaceV11, RACE11_FRAMES } from "./FlavorRaceV11";
import { FlavorRaceV12, RACE12_FRAMES } from "./FlavorRaceV12";
import { FlavorTrailerV9, TRAILER9_FRAMES } from "./FlavorTrailerV9";
import { FlavorTrailerBlueSky, TRAILER_BLUESKY_FRAMES } from "./FlavorTrailerBlueSky";
import { FlavorTrailer, TRAILER_FRAMES } from "./FlavorTrailer";
import { MissionNext, MISSION_FRAMES } from "./MissionNext";
import "./index.css";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Opening" component={Opening} durationInFrames={OPENING_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="OpeningLoop" component={Opening} defaultProps={{ clean: true }} durationInFrames={LOOP_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="FlavorRace" component={FlavorRace} durationInFrames={RACE_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="FlavorRaceV3" component={FlavorRaceV3} durationInFrames={RACE3_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="FlavorRaceV4" component={FlavorRaceV4} durationInFrames={RACE4_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="FlavorRaceV5" component={FlavorRaceV5} durationInFrames={RACE5_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="FlavorRaceV6" component={FlavorRaceV6} durationInFrames={RACE6_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="FlavorRaceV7" component={FlavorRaceV7} durationInFrames={RACE7_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="FlavorRaceV8" component={FlavorRaceV8} durationInFrames={RACE8_FRAMES} fps={30} width={1920} height={1080} defaultProps={{ stem: "all" }} />
    <Composition id="FlavorRaceV9" component={FlavorRaceV9} durationInFrames={RACE9_FRAMES} fps={30} width={1920} height={1080} defaultProps={{ stem: "all" }} />
    <Composition id="FlavorRaceV10" component={FlavorRaceV10} durationInFrames={RACE10_FRAMES} fps={30} width={1920} height={1080} defaultProps={{ stem: "all" }} />
    <Composition id="FlavorRaceV11" component={FlavorRaceV11} durationInFrames={RACE11_FRAMES} fps={30} width={1920} height={1080} defaultProps={{ stem: "all" }} />
    <Composition id="FlavorRaceV12" component={FlavorRaceV12} durationInFrames={RACE12_FRAMES} fps={30} width={1920} height={1080} defaultProps={{ stem: "all" }} />
    <Composition id="FlavorTrailerV9" component={FlavorTrailerV9} durationInFrames={TRAILER9_FRAMES} fps={30} width={1920} height={1080} defaultProps={{ stem: "all" }} />
    <Composition id="FlavorTrailerBlueSky" component={FlavorTrailerBlueSky} durationInFrames={TRAILER_BLUESKY_FRAMES} fps={30} width={1920} height={1080} defaultProps={{ stem: "all" }} />
    <Composition id="MissionNext" component={MissionNext} durationInFrames={MISSION_FRAMES} fps={30} width={1920} height={1080} defaultProps={{ stem: "all" }} />
    <Composition id="FlavorTrailer" component={FlavorTrailer} durationInFrames={TRAILER_FRAMES} fps={30} width={1920} height={1080} defaultProps={{ stem: "all" }} />
    <Composition id="FlavorRaceV2" component={FlavorRaceV2} durationInFrames={RACE2_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="PreReadReel" component={Reel} durationInFrames={TOTAL} fps={30} width={1920} height={1080} />
    <Folder name="Scenes">
      {SCENES.map(({ id, dur, C }) => (
        <Composition key={id} id={id} component={C} durationInFrames={dur} fps={30} width={1920} height={1080} />
      ))}
    </Folder>
  </>
);

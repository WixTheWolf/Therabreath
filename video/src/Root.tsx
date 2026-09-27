import { Composition, Folder } from "remotion";
import { Reel, SCENES } from "./Reel";
import "./index.css";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="PreReadReel" component={Reel} durationInFrames={450} fps={30} width={1920} height={1080} />
    <Folder name="Scenes">
      {SCENES.map(({ id, dur, C }) => (
        <Composition key={id} id={id} component={C} durationInFrames={dur} fps={30} width={1920} height={1080} />
      ))}
    </Folder>
  </>
);

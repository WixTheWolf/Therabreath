import { Composition } from "remotion";
import { FutureOfFreshnessV5, fof5Frames } from "./FutureOfFreshnessV5";

/* The V5 opening film on its own entry point (src/index5.ts), so a render bundles only what it needs. */
export const RemotionRoot5: React.FC = () => (
  <>
    <Composition id="FutureOfFreshnessV5Brief" component={FutureOfFreshnessV5} defaultProps={{ ending: "brief" as const }} durationInFrames={fof5Frames("brief")} fps={30} width={1920} height={1080} />
    <Composition id="FutureOfFreshnessV5Site" component={FutureOfFreshnessV5} defaultProps={{ ending: "site" as const }} durationInFrames={fof5Frames("site")} fps={30} width={1920} height={1080} />
  </>
);

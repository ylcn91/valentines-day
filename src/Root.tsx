import React from "react";
import { Composition } from "remotion";
import { Valentine } from "./Valentine";

// 30fps, ~45 seconds total
const FPS = 30;
const DURATION = 45 * FPS;

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Valentine"
      component={Valentine}
      durationInFrames={DURATION}
      fps={FPS}
      width={1080}
      height={1920}
    />
  );
};

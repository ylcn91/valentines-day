import React from "react";
import {
  AbsoluteFill,
  useVideoConfig,
} from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { EnvelopeScene } from "./scenes/EnvelopeScene";
import { QuestionScene } from "./scenes/QuestionScene";
import { ReasonsScene } from "./scenes/ReasonsScene";
import { LetterScene } from "./scenes/LetterScene";
import { FinaleScene } from "./scenes/FinaleScene";
import { ParticleField } from "./scenes/ParticleField";

export const Valentine: React.FC = () => {
  const { fps } = useVideoConfig();

  const ENVELOPE_DUR = 6 * fps;    // 6s
  const QUESTION_DUR = 7 * fps;    // 7s
  const REASONS_DUR = 10 * fps;    // 10s
  const LETTER_DUR = 12 * fps;     // 12s
  const FINALE_DUR = 10 * fps;     // 10s
  const FADE_DUR = 1 * fps;        // 1s fade transitions

  return (
    <AbsoluteFill style={{ backgroundColor: "#060612" }}>
      {/* Particle field always visible in background */}
      <ParticleField />

      {/* Scene transitions */}
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={ENVELOPE_DUR} >
          <EnvelopeScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: FADE_DUR })}
        />

        <TransitionSeries.Sequence durationInFrames={QUESTION_DUR} >
          <QuestionScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: FADE_DUR })}
        />

        <TransitionSeries.Sequence durationInFrames={REASONS_DUR} >
          <ReasonsScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: FADE_DUR })}
        />

        <TransitionSeries.Sequence durationInFrames={LETTER_DUR} >
          <LetterScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: FADE_DUR })}
        />

        <TransitionSeries.Sequence durationInFrames={FINALE_DUR} >
          <FinaleScene />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};

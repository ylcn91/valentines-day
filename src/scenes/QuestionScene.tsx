import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/CormorantGaramond";
import { loadFont as loadBodyFont } from "@remotion/google-fonts/DMSans";

const { fontFamily: serifFont } = loadFont("normal", {
  weights: ["300"],
  subsets: ["latin", "latin-ext"],
});

const { fontFamily: bodyFont } = loadBodyFont("normal", {
  weights: ["400", "500"],
  subsets: ["latin"],
});

export const QuestionScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Title reveal
  const titleOpacity = interpolate(frame, [0, fps], [0, 1], {
    extrapolateRight: "clamp",
  });
  const titleY = interpolate(frame, [0, fps], [40, 0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  // Name glow
  const nameGlow = interpolate(
    Math.sin((frame / fps) * Math.PI * 0.8),
    [-1, 1],
    [0.3, 0.8]
  );

  // Yes button spring
  const yesSpring = spring({
    frame: frame - 1.5 * fps,
    fps,
    config: { damping: 12 },
  });

  // No button spring
  const noSpring = spring({
    frame: frame - 2 * fps,
    fps,
    config: { damping: 15 },
  });

  // No button dodging
  const dodgePhase = Math.max(0, frame - 3 * fps);
  const dodgeX = dodgePhase > 0
    ? Math.sin(dodgePhase * 0.15) * 180 + Math.cos(dodgePhase * 0.23) * 100
    : 0;
  const dodgeY = dodgePhase > 0
    ? Math.cos(dodgePhase * 0.12) * 250 + Math.sin(dodgePhase * 0.19) * 120
    : 0;

  const noScale = dodgePhase > 0
    ? interpolate(dodgePhase, [0, 3 * fps], [1, 0.2], { extrapolateRight: "clamp" })
    : 1;

  const yesScale = dodgePhase > 0
    ? interpolate(dodgePhase, [0, 3 * fps], [1, 1.4], { extrapolateRight: "clamp" })
    : 1;

  // Funny Turkish messages
  const messages = [
    "G\u00fczel deneme...",
    "O d\u00fc\u011fme senden korkuyor!",
    "Hay\u0131r yok hay\u0131r.",
    "Evet'e bas art\u0131k!",
    "Direnmek bo\u015funa...",
  ];
  const msgIndex = dodgePhase > 0
    ? Math.min(Math.floor(dodgePhase / (0.8 * fps)), messages.length - 1)
    : -1;

  const msgOpacity = dodgePhase > 0
    ? interpolate(dodgePhase % (0.8 * fps), [0, 5, 0.6 * fps, 0.8 * fps], [0, 1, 1, 0], {
        extrapolateRight: "clamp",
      })
    : 0;

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "transparent",
      }}
    >
      {/* Question */}
      <div
        style={{
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          fontFamily: serifFont,
          fontWeight: 300,
          fontSize: 60,
          textAlign: "center",
          color: "#f5e6d3",
          lineHeight: 1.3,
          maxWidth: 800,
          padding: "0 40px",
        }}
      >
        <span
          style={{
            color: "#f0c888",
            fontStyle: "italic",
            textShadow: `0 0 ${30 * nameGlow}px rgba(240, 200, 136, ${nameGlow})`,
          }}
        >
          {"I\u015f\u0131l"}
        </span>
        , sevgilim olur musun?
      </div>

      {/* Yes button */}
      <div
        style={{
          marginTop: 80,
          transform: `scale(${yesSpring * yesScale})`,
          opacity: yesSpring,
        }}
      >
        <div
          style={{
            fontFamily: bodyFont,
            fontWeight: 500,
            fontSize: 28,
            letterSpacing: "0.15em",
            textTransform: "uppercase" as const,
            padding: "22px 64px",
            background: "linear-gradient(135deg, #c4697a, #a05268)",
            color: "#f5e6d3",
            borderRadius: 6,
            boxShadow: `0 8px 40px rgba(196, 105, 122, ${0.3 + yesScale * 0.15})`,
          }}
        >
          EVET
        </div>
      </div>

      {/* No button (dodging) */}
      <div
        style={{
          position: "absolute",
          top: "62%",
          left: "60%",
          transform: `translate(${dodgeX}px, ${dodgeY}px) scale(${noSpring * noScale})`,
          opacity: noSpring * noScale,
        }}
      >
        <div
          style={{
            fontFamily: bodyFont,
            fontWeight: 400,
            fontSize: 20,
            letterSpacing: "0.1em",
            padding: "14px 36px",
            background: "rgba(255, 255, 255, 0.03)",
            color: "rgba(245, 230, 211, 0.3)",
            border: "1px solid rgba(245, 230, 211, 0.08)",
            borderRadius: 4,
          }}
        >
          Hay\u0131r
        </div>
      </div>

      {/* Funny message */}
      {msgIndex >= 0 && (
        <div
          style={{
            position: "absolute",
            bottom: "15%",
            fontFamily: serifFont,
            fontStyle: "italic",
            fontSize: 28,
            color: "#d4849a",
            opacity: msgOpacity,
            textAlign: "center",
          }}
        >
          {messages[msgIndex]}
        </div>
      )}
    </AbsoluteFill>
  );
};

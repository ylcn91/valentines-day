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

const { fontFamily: serifFont } = loadFont("normal", {
  weights: ["300"],
  subsets: ["latin", "latin-ext"],
});

export const EnvelopeScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Envelope entrance spring
  const envelopeScale = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 80 },
  });

  // Seal pulse
  const sealGlow = interpolate(
    Math.sin((frame / fps) * Math.PI * 1.2),
    [-1, 1],
    [0.3, 0.8]
  );

  // Flap opens after 3 seconds
  const flapRotation = interpolate(
    frame,
    [3 * fps, 4.5 * fps],
    [0, -180],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.quad) }
  );

  // Text reveal
  const textOpacity = interpolate(frame, [1 * fps, 2 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const textY = interpolate(frame, [1 * fps, 2 * fps], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  // Hint reveal
  const hintOpacity = interpolate(frame, [2.5 * fps, 3.5 * fps], [0, 0.4], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Exit scale
  const exitScale = interpolate(frame, [4 * fps, 5.5 * fps], [1, 1.1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "transparent",
      }}
    >
      {/* Envelope */}
      <div
        style={{
          transform: `scale(${envelopeScale * exitScale})`,
          position: "relative",
          width: 320,
          height: 220,
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            background: "linear-gradient(145deg, #c4697a, #a05268)",
            borderRadius: 8,
            boxShadow: `0 30px 80px rgba(196, 105, 122, 0.25), 0 10px 30px rgba(0, 0, 0, 0.4)`,
            position: "relative",
            overflow: "visible",
          }}
        >
          {/* Flap */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 110,
              background: "linear-gradient(145deg, #d4849a, #c4697a)",
              clipPath: "polygon(0 0, 50% 100%, 100% 0)",
              transformOrigin: "top center",
              transform: `rotateX(${flapRotation}deg)`,
              zIndex: 2,
            }}
          />

          {/* Wax seal */}
          <div
            style={{
              position: "absolute",
              top: "40%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "radial-gradient(circle, #f0c888, #d4a574)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 3,
              boxShadow: `0 4px ${20 + sealGlow * 30}px rgba(212, 165, 116, ${sealGlow})`,
            }}
          >
            <svg width="30" height="30" viewBox="0 0 24 24" fill="#5c3a24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Label */}
      <div
        style={{
          marginTop: 60,
          opacity: textOpacity,
          transform: `translateY(${textY}px)`,
          fontFamily: serifFont,
          fontWeight: 300,
          fontStyle: "italic",
          fontSize: 42,
          color: "#e8b4c8",
          textAlign: "center",
          letterSpacing: "0.02em",
        }}
      >
        {"Sana bir \u015feyim var, a\u015fk\u0131m..."}
      </div>

      {/* Hint */}
      <div
        style={{
          marginTop: 20,
          opacity: hintOpacity,
          fontSize: 18,
          letterSpacing: "0.25em",
          textTransform: "uppercase" as const,
          color: "#e8b4c8",
          fontFamily: "DM Sans, sans-serif",
        }}
      >
        {"sevgililer g\u00fcn\u00fcn kutlu olsun"}
      </div>
    </AbsoluteFill>
  );
};

import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
  random,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/CormorantGaramond";
import { loadFont as loadBodyFont } from "@remotion/google-fonts/DMSans";

const { fontFamily: serifFont } = loadFont("normal", {
  weights: ["300"],
  subsets: ["latin", "latin-ext"],
});

const { fontFamily: bodyFont } = loadBodyFont("normal", {
  weights: ["300"],
  subsets: ["latin"],
});

// Heart burst particles
const BURST_COUNT = 40;
const burstParticles = Array.from({ length: BURST_COUNT }, (_, i) => ({
  angle: (Math.PI * 2 * i) / BURST_COUNT + (random(`ba-${i}`) - 0.5) * 0.4,
  dist: 80 + random(`bd-${i}`) * 300,
  size: 4 + random(`bs-${i}`) * 8,
  isGold: random(`bc-${i}`) > 0.4,
  delay: random(`bdl-${i}`) * 8,
}));

export const FinaleScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Name entrance
  const nameScale = spring({
    frame,
    fps,
    config: { damping: 8, stiffness: 60 },
  });

  // Glow pulse
  const glowCycle = Math.sin((frame / fps) * Math.PI * 0.4);
  const glowIntensity = interpolate(glowCycle, [-1, 1], [0.5, 1]);

  // Sub reveals
  const valentineOpacity = interpolate(frame, [1 * fps, 2 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const valentineY = interpolate(frame, [1 * fps, 2 * fps], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  const subOpacity = interpolate(frame, [2.5 * fps, 3.5 * fps], [0, 0.4], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const lineWidth = interpolate(frame, [3.5 * fps, 4.5 * fps], [0, 80], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  const lineOpacity = interpolate(frame, [3.5 * fps, 4.5 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Family line reveal
  const familyOpacity = interpolate(frame, [5 * fps, 6 * fps], [0, 0.5], {
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
      {/* Burst particles */}
      {burstParticles.map((p, i) => {
        const progress = interpolate(
          frame - p.delay,
          [0, 1.5 * fps],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );
        const x = Math.cos(p.angle) * p.dist * progress;
        const y = Math.sin(p.angle) * p.dist * progress;
        const particleOpacity = interpolate(progress, [0, 0.2, 0.8, 1], [0, 1, 0.6, 0]);

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              backgroundColor: p.isGold
                ? `rgba(240, 200, 136, ${particleOpacity})`
                : `rgba(232, 180, 200, ${particleOpacity})`,
              boxShadow: p.isGold
                ? `0 0 ${p.size * 2}px rgba(240, 200, 136, ${particleOpacity * 0.5})`
                : `0 0 ${p.size * 2}px rgba(232, 180, 200, ${particleOpacity * 0.5})`,
              transform: `translate(${x - p.size / 2}px, ${y - p.size / 2}px)`,
            }}
          />
        );
      })}

      {/* Name */}
      <div
        style={{
          fontFamily: serifFont,
          fontWeight: 300,
          fontSize: 160,
          letterSpacing: "0.05em",
          color: "#f0c888",
          textShadow: `
            0 0 ${40 * glowIntensity}px rgba(240, 200, 136, ${0.6 * glowIntensity}),
            0 0 ${80 * glowIntensity}px rgba(240, 200, 136, ${0.3 * glowIntensity}),
            0 0 ${120 * glowIntensity}px rgba(240, 200, 136, ${0.15 * glowIntensity}),
            0 0 ${200 * glowIntensity}px rgba(240, 200, 136, ${0.08 * glowIntensity})
          `,
          transform: `scale(${nameScale})`,
          textAlign: "center",
        }}
      >
        {"I\u015f\u0131l"}
      </div>

      {/* Sevgililer Gunu */}
      <div
        style={{
          fontFamily: serifFont,
          fontWeight: 300,
          fontStyle: "italic",
          fontSize: 44,
          color: "#e8b4c8",
          letterSpacing: "0.1em",
          marginTop: 24,
          opacity: valentineOpacity,
          transform: `translateY(${valentineY}px)`,
        }}
      >
        {"Sevgililer G\u00fcn\u00fcn Kutlu Olsun"}
      </div>

      {/* Subtitle */}
      <div
        style={{
          fontFamily: bodyFont,
          fontWeight: 300,
          fontSize: 20,
          letterSpacing: "0.3em",
          textTransform: "uppercase" as const,
          color: "#e8b4c8",
          marginTop: 28,
          opacity: subOpacity,
        }}
      >
        {"bug\u00fcn, yar\u0131n ve sonsuza kadar"}
      </div>

      {/* Gold line */}
      <div
        style={{
          width: lineWidth,
          height: 1,
          marginTop: 48,
          opacity: lineOpacity,
          background: "linear-gradient(to right, transparent, #d4a574, transparent)",
        }}
      />

      {/* Family */}
      <div
        style={{
          fontFamily: serifFont,
          fontWeight: 300,
          fontStyle: "italic",
          fontSize: 24,
          color: "#d4849a",
          marginTop: 36,
          opacity: familyOpacity,
          textAlign: "center",
        }}
      >
        {"Alp Demir, Nil Dora ve ben \u2014 seni \u00e7ok seviyoruz"}
      </div>
    </AbsoluteFill>
  );
};

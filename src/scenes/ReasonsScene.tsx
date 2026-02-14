import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
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

const REASONS = [
  "Girdi\u011fin her oday\u0131 \u0131\u015f\u0131l \u0131\u015f\u0131l ayd\u0131nlat\u0131yorsun \u2014 t\u0131pk\u0131 ad\u0131n gibi",
  "Alp Demir ve Nil Dora'ya annelik yap\u0131\u015f\u0131n beni her seferinde hayran b\u0131rak\u0131yor",
  "Hem \u00e7elik gibi g\u00fc\u00e7l\u00fcs\u00fcn, hem ipek gibi \u015fefkatli",
  "Zekana hayran\u0131m \u2014 beni hep \u015fa\u015f\u0131rt\u0131yorsun",
  "Senin yan\u0131nda ev diye bir yere ihtiyac\u0131m yok, \u00e7\u00fcnk\u00fc evim sensin",
  "En s\u0131radan sabahlar\u0131 bile \u00f6zel k\u0131l\u0131yorsun",
];

export const ReasonsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Title entrance
  const titleOpacity = interpolate(frame, [0, 0.8 * fps], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "transparent",
        padding: 60,
      }}
    >
      {/* Heading */}
      <div
        style={{
          fontFamily: serifFont,
          fontWeight: 300,
          fontSize: 48,
          color: "#e8b4c8",
          letterSpacing: "0.05em",
          marginBottom: 60,
          opacity: titleOpacity,
        }}
      >
        {"Seni neden seviyorum"}
      </div>

      {/* Reasons grid */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          maxWidth: 900,
          borderTop: "1px solid rgba(196, 105, 122, 0.12)",
        }}
      >
        {REASONS.map((reason, i) => {
          const delay = 0.8 * fps + i * 0.9 * fps;
          const itemSpring = spring({
            frame: frame - delay,
            fps,
            config: { damping: 200 },
          });

          const itemOpacity = interpolate(itemSpring, [0, 1], [0, 1]);
          const itemY = interpolate(itemSpring, [0, 1], [20, 0]);

          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 24,
                padding: "26px 0",
                borderBottom: "1px solid rgba(196, 105, 122, 0.08)",
                opacity: itemOpacity,
                transform: `translateY(${itemY}px)`,
              }}
            >
              <span
                style={{
                  fontFamily: serifFont,
                  fontSize: 42,
                  fontWeight: 300,
                  color: "rgba(212, 165, 116, 0.4)",
                  lineHeight: 1,
                  flexShrink: 0,
                  width: 60,
                }}
              >
                0{i + 1}
              </span>
              <span
                style={{
                  fontFamily: bodyFont,
                  fontWeight: 300,
                  fontSize: 26,
                  color: "rgba(245, 230, 211, 0.75)",
                  lineHeight: 1.7,
                  paddingTop: 6,
                }}
              >
                {reason}
              </span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

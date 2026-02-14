import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/CormorantGaramond";

const { fontFamily: serifFont } = loadFont("normal", {
  weights: ["300", "400"],
  subsets: ["latin", "latin-ext"],
});

const LETTER_LINES = [
  "Seninle ge\u00e7en her g\u00fcn, evrenin",
  "g\u00f6steri\u015f yapmaya karar verdi\u011fi",
  "bir g\u00fcn gibi hissettiriyor.",
  "",
  "Alp Demir'in g\u00f6zlerinde senin",
  "kararl\u0131l\u0131\u011f\u0131n\u0131, Nil Dora'n\u0131n",
  "g\u00fcl\u00fc\u015f\u00fcnde senin s\u0131cakl\u0131\u011f\u0131n\u0131",
  "g\u00f6r\u00fcyorum her g\u00fcn.",
  "",
  "I\u015f\u0131l \u2014 \u0131\u015f\u0131l \u0131\u015f\u0131l parlayan.",
  "Annen sana ad\u0131n\u0131 verirken biliyormu\u015f:",
  "hayat\u0131ma par\u0131lt\u0131 getirecek biriydin.",
  "En karanl\u0131k g\u00fcnlerde bile s\u00f6nmeyen.",
  "",
  "Bu Sevgililer G\u00fcn\u00fc'nde b\u00fcy\u00fck",
  "\u015feylere ihtiyac\u0131m yok.",
  "Sadece sen \u2014 \u015fimdi, yar\u0131n",
  "ve sonsuza kadar.",
];

export const LetterScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Greeting reveal
  const greetingOpacity = interpolate(frame, [0, fps], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Name glow
  const nameGlow = interpolate(
    Math.sin((frame / fps) * Math.PI * 0.6),
    [-1, 1],
    [0.4, 0.9]
  );

  // Typewriter
  const CHARS_PER_FRAME = 1.8;
  const START_FRAME = 1.5 * fps;
  const fullText = LETTER_LINES.join("\n");
  const charsToShow = Math.min(
    fullText.length,
    Math.max(0, Math.floor((frame - START_FRAME) * CHARS_PER_FRAME))
  );
  const visibleText = fullText.slice(0, charsToShow);

  // Cursor blink
  const cursorOpacity =
    charsToShow < fullText.length
      ? interpolate(frame % 16, [0, 8, 16], [1, 0, 1])
      : 0;

  // Closing reveal
  const allTextFrame = START_FRAME + fullText.length / CHARS_PER_FRAME;
  const closingOpacity = interpolate(
    frame,
    [allTextFrame + 0.5 * fps, allTextFrame + 1.5 * fps],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Gold accent bar
  const barHeight = interpolate(frame, [0, 2 * fps], [0, 100], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "transparent",
        padding: 50,
      }}
    >
      <div
        style={{
          maxWidth: 880,
          width: "100%",
          position: "relative",
          padding: "60px 56px",
          background: "rgba(255, 255, 255, 0.015)",
          border: "1px solid rgba(232, 180, 200, 0.06)",
        }}
      >
        {/* Gold bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 3,
            height: `${barHeight}%`,
            background: "linear-gradient(to bottom, #d4a574, transparent)",
          }}
        />

        {/* Greeting */}
        <div
          style={{
            fontFamily: serifFont,
            fontWeight: 300,
            fontStyle: "italic",
            fontSize: 44,
            color: "#e8b4c8",
            marginBottom: 40,
            opacity: greetingOpacity,
          }}
        >
          {"Biricik "}
          <span
            style={{
              color: "#f0c888",
              fontWeight: 400,
              textShadow: `0 0 ${20 * nameGlow}px rgba(240, 200, 136, ${nameGlow * 0.6}), 0 0 ${60 * nameGlow}px rgba(240, 200, 136, ${nameGlow * 0.2})`,
            }}
          >
            {"I\u015f\u0131l"}
          </span>
          {"'\u0131m,"}
        </div>

        {/* Letter body */}
        <div
          style={{
            fontFamily: serifFont,
            fontWeight: 300,
            fontSize: 28,
            lineHeight: 2,
            color: "rgba(245, 230, 211, 0.7)",
            whiteSpace: "pre-wrap",
            minHeight: 500,
          }}
        >
          {visibleText}
          <span style={{ opacity: cursorOpacity, color: "#d4a574" }}>
            {"\u258C"}
          </span>
        </div>

        {/* Closing */}
        <div
          style={{
            fontFamily: serifFont,
            fontWeight: 400,
            fontStyle: "italic",
            fontSize: 34,
            color: "#d4849a",
            textAlign: "right",
            marginTop: 40,
            opacity: closingOpacity,
          }}
        >
          {"Sonsuza kadar senin"}
        </div>
      </div>
    </AbsoluteFill>
  );
};

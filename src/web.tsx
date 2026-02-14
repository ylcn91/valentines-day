import React, { useState, useEffect, useCallback, useRef } from "react";
import { createRoot } from "react-dom/client";
import { spring, interpolate } from "remotion";

// ═══════════════════════════════════════════
// CONSTANTS & FONTS
// ═══════════════════════════════════════════
const FPS = 60;

// Load fonts via CSS (Google Fonts)
const fontLink = document.createElement("link");
fontLink.href =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap";
fontLink.rel = "stylesheet";
document.head.appendChild(fontLink);

const SERIF = "'Cormorant Garamond', serif";
const SANS = "'DM Sans', sans-serif";

// ═══════════════════════════════════════════
// FRAME HOOK — drives all animations
// ═══════════════════════════════════════════
function useFrame() {
  const [frame, setFrame] = useState(0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    let raf: number;
    const tick = (time: number) => {
      if (startRef.current === null) startRef.current = time;
      const elapsed = time - startRef.current;
      setFrame(Math.floor((elapsed / 1000) * FPS));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const reset = useCallback(() => {
    startRef.current = null;
    setFrame(0);
  }, []);

  return { frame, reset };
}

// ═══════════════════════════════════════════
// PARTICLE FIELD
// ═══════════════════════════════════════════
const PARTICLES = Array.from({ length: 60 }, () => ({
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: 1 + Math.random() * 2.5,
  speed: 0.15 + Math.random() * 0.4,
  phase: Math.random() * Math.PI * 2,
  isGold: Math.random() > 0.4,
}));

const ParticleField: React.FC<{ intensity: number }> = ({ intensity }) => {
  const { frame } = useFrame();
  const time = frame / FPS;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
      {PARTICLES.map((p, i) => {
        const x = (p.x + Math.sin(time * p.speed + p.phase) * 3) % 100;
        const y = (p.y + time * p.speed * 1.5) % 100;
        const flicker = 0.4 + 0.6 * Math.sin(time * 2 + p.phase);
        const opacity = flicker * intensity;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${x}%`,
              top: `${y}%`,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              backgroundColor: p.isGold
                ? `rgba(240, 200, 136, ${opacity})`
                : `rgba(232, 180, 200, ${opacity})`,
              boxShadow: p.isGold
                ? `0 0 ${p.size * 3}px rgba(240, 200, 136, ${opacity * 0.5})`
                : `0 0 ${p.size * 3}px rgba(232, 180, 200, ${opacity * 0.5})`,
            }}
          />
        );
      })}
    </div>
  );
};

// ═══════════════════════════════════════════
// BURST EFFECT (on click / transitions)
// ═══════════════════════════════════════════
type BurstDot = { x: number; y: number; angle: number; dist: number; size: number; isGold: boolean; born: number };
let burstDots: BurstDot[] = [];

function spawnBurst(cx: number, cy: number, count: number) {
  const now = performance.now();
  for (let i = 0; i < count; i++) {
    burstDots.push({
      x: cx, y: cy,
      angle: (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5,
      dist: 60 + Math.random() * 140,
      size: 3 + Math.random() * 5,
      isGold: Math.random() > 0.4,
      born: now,
    });
  }
  // Trim old
  burstDots = burstDots.filter((d) => now - d.born < 1500);
}

const BurstLayer: React.FC = () => {
  useFrame(); // trigger re-render each frame
  const now = performance.now();

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, pointerEvents: "none" }}>
      {burstDots.map((d, i) => {
        const age = (now - d.born) / 1000;
        const progress = Math.min(1, age / 1.2);
        const x = d.x + Math.cos(d.angle) * d.dist * progress;
        const y = d.y + Math.sin(d.angle) * d.dist * progress;
        const opacity = progress < 0.2 ? progress / 0.2 : progress > 0.7 ? (1 - progress) / 0.3 : 1;
        const scale = 1.5 - progress;
        if (age > 1.3) return null;
        return (
          <div
            key={`${d.born}-${i}`}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: d.size * scale,
              height: d.size * scale,
              borderRadius: "50%",
              backgroundColor: d.isGold ? "#f0c888" : "#e8b4c8",
              opacity,
              transform: "translate(-50%, -50%)",
            }}
          />
        );
      })}
    </div>
  );
};

// ═══════════════════════════════════════════
// SCREEN 1 — ENVELOPE
// ═══════════════════════════════════════════
const EnvelopeScreen: React.FC<{ onOpen: () => void }> = ({ onOpen }) => {
  const { frame } = useFrame();
  const [opening, setOpening] = useState(false);

  const scale = spring({ frame: Math.min(frame, 60), fps: FPS, config: { damping: 12, stiffness: 80 } });
  const sealGlow = interpolate(Math.sin((frame / FPS) * Math.PI * 1.2), [-1, 1], [0.3, 0.8]);
  const textOp = interpolate(frame, [FPS * 0.6, FPS * 1.2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const textY = interpolate(frame, [FPS * 0.6, FPS * 1.2], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const hintOp = interpolate(frame, [FPS * 1.5, FPS * 2.5], [0, 0.4], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const handleClick = () => {
    if (opening) return;
    setOpening(true);
    spawnBurst(window.innerWidth / 2, window.innerHeight * 0.4, 20);
    setTimeout(onOpen, 900);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%" }}>
      <div onClick={handleClick} style={{ cursor: "pointer", transform: `scale(${scale})`, transition: opening ? "transform 0.8s ease" : undefined }}>
        <div style={{
          width: 260, height: 180, background: "linear-gradient(145deg, #c4697a, #a05268)",
          borderRadius: 8, position: "relative",
          boxShadow: "0 30px 80px rgba(196,105,122,0.25), 0 10px 30px rgba(0,0,0,0.4)",
        }}>
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 90,
            background: "linear-gradient(145deg, #d4849a, #c4697a)",
            clipPath: "polygon(0 0, 50% 100%, 100% 0)",
            transformOrigin: "top center",
            transform: opening ? "rotateX(-180deg)" : "rotateX(0deg)",
            transition: "transform 0.8s cubic-bezier(0.4,0,0.2,1)",
            zIndex: 2,
          }} />
          <div style={{
            position: "absolute", top: "40%", left: "50%", transform: "translate(-50%,-50%)",
            width: 56, height: 56, borderRadius: "50%",
            background: "radial-gradient(circle, #f0c888, #d4a574)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 3,
            boxShadow: `0 4px ${20 + sealGlow * 30}px rgba(212,165,116,${sealGlow})`,
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="#5c3a24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
        </div>
      </div>
      <p style={{ marginTop: 48, fontFamily: SERIF, fontWeight: 300, fontStyle: "italic", fontSize: "1.5rem", color: "#e8b4c8", opacity: textOp, transform: `translateY(${textY}px)` }}>
        Sana bir şeyim var, aşkım...
      </p>
      <p style={{ marginTop: 14, fontFamily: SANS, fontSize: "0.7rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "#e8b4c8", opacity: hintOp }}>
        dokun ve aç
      </p>
    </div>
  );
};

// ═══════════════════════════════════════════
// SCREEN 2 — QUESTION
// ═══════════════════════════════════════════
const QuestionScreen: React.FC<{ onYes: () => void }> = ({ onYes }) => {
  const { frame } = useFrame();
  const [noAttempts, setNoAttempts] = useState(0);
  const [noPos, setNoPos] = useState<{ x: number; y: number } | null>(null);

  const titleOp = interpolate(frame, [0, FPS], [0, 1], { extrapolateRight: "clamp" });
  const titleY = interpolate(frame, [0, FPS], [30, 0], { extrapolateRight: "clamp" });
  const nameGlow = interpolate(Math.sin((frame / FPS) * Math.PI * 0.8), [-1, 1], [0.3, 0.8]);
  const yesSpring = spring({ frame: Math.max(0, frame - FPS), fps: FPS, config: { damping: 12 } });
  const noSpring = spring({ frame: Math.max(0, frame - FPS * 1.3), fps: FPS, config: { damping: 15 } });

  const yesScale = 1 + noAttempts * 0.06;
  const noScale = Math.max(0.25, 1 - noAttempts * 0.09);

  const messages = [
    "Güzel deneme...",
    "O düğme senden korkuyor!",
    "Hayır yok hayır.",
    "Evet'e bas artık!",
    "Direnmek boşuna...",
    "HATA 404: Hayır bulunamadı",
    "Bu kadar inatçı olma!",
    "Düğme kaçtı bile...",
    "Sadece Evet'e bas, tamam mı?",
    "Son şansın!",
  ];

  const dodgeNo = () => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    setNoPos({
      x: 20 + Math.random() * (vw - 120),
      y: 20 + Math.random() * (vh - 80),
    });
    setNoAttempts((n) => n + 1);
  };

  const handleYes = (e: React.MouseEvent) => {
    spawnBurst(e.clientX, e.clientY, 30);
    setTimeout(onYes, 300);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", position: "relative" }}>
      <div style={{ opacity: titleOp, transform: `translateY(${titleY}px)`, fontFamily: SERIF, fontWeight: 300, fontSize: "clamp(2rem, 6vw, 3.2rem)", textAlign: "center", color: "#f5e6d3", lineHeight: 1.3, padding: "0 24px" }}>
        <span style={{ color: "#f0c888", fontStyle: "italic", textShadow: `0 0 ${30 * nameGlow}px rgba(240,200,136,${nameGlow})` }}>
          Işıl
        </span>
        , sevgilim olur musun?
      </div>

      <div style={{ display: "flex", gap: 20, marginTop: 50, alignItems: "center" }}>
        <button
          onClick={handleYes}
          style={{
            fontFamily: SANS, fontWeight: 500, fontSize: "1.1rem", letterSpacing: "0.15em",
            textTransform: "uppercase", padding: "18px 52px",
            background: "linear-gradient(135deg, #c4697a, #a05268)", color: "#f5e6d3",
            border: "none", borderRadius: 4, cursor: "pointer",
            transform: `scale(${yesSpring * Math.min(yesScale, 1.5)})`,
            boxShadow: `0 8px 40px rgba(196,105,122,${0.3 + yesScale * 0.1})`,
            transition: "box-shadow 0.3s",
          }}
        >
          EVET
        </button>

        {!noPos && (
          <button
            onMouseOver={dodgeNo}
            onClick={dodgeNo}
            style={{
              fontFamily: SANS, fontWeight: 400, fontSize: "0.85rem", letterSpacing: "0.1em",
              padding: "12px 32px", background: "rgba(255,255,255,0.03)",
              color: "rgba(245,230,211,0.3)", border: "1px solid rgba(245,230,211,0.08)",
              borderRadius: 4, cursor: "pointer", opacity: noSpring,
              transform: `scale(${noSpring})`,
            }}
          >
            Hayır
          </button>
        )}
      </div>

      {noPos && (
        <button
          onMouseOver={dodgeNo}
          onClick={dodgeNo}
          style={{
            position: "fixed", left: noPos.x, top: noPos.y,
            fontFamily: SANS, fontWeight: 400, fontSize: "0.85rem", letterSpacing: "0.1em",
            padding: "12px 32px", background: "rgba(255,255,255,0.03)",
            color: "rgba(245,230,211,0.3)", border: "1px solid rgba(245,230,211,0.08)",
            borderRadius: 4, cursor: "pointer", zIndex: 50,
            transform: `scale(${noScale})`, transition: "left 0.15s, top 0.15s, transform 0.15s",
          }}
        >
          Hayır
        </button>
      )}

      {noAttempts > 0 && (
        <p style={{ position: "absolute", bottom: "15%", fontFamily: SERIF, fontStyle: "italic", fontSize: "1.1rem", color: "#d4849a" }}>
          {messages[Math.min(noAttempts - 1, messages.length - 1)]}
        </p>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════
// SCREEN 3 — REASONS
// ═══════════════════════════════════════════
const REASONS = [
  "Girdiğin her odayı ışıl ışıl aydınlatıyorsun — tıpkı adın gibi",
  "Alp Demir ve Nil Dora'ya annelik yapışın beni hayran bırakıyor",
  "Hem çelik gibi güçlüsün, hem ipek gibi şefkatli",
  "Zekana hayranım — beni hep şaşırtıyorsun",
  "Senin yanında ev diye bir yere ihtiyacım yok, çünkü evim sensin",
  "En sıradan sabahları bile özel kılıyorsun",
];

const ReasonsScreen: React.FC<{ onNext: () => void }> = ({ onNext }) => {
  const { frame } = useFrame();
  const titleOp = interpolate(frame, [0, FPS * 0.8], [0, 1], { extrapolateRight: "clamp" });

  const allRevealed = frame > FPS * 0.8 + REASONS.length * FPS * 0.6 + FPS * 0.5;
  const btnOp = allRevealed ? interpolate(frame - (FPS * 0.8 + REASONS.length * FPS * 0.6 + FPS * 0.5), [0, FPS * 0.5], [0, 1], { extrapolateRight: "clamp" }) : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: "40px 20px", overflowY: "auto" }}>
      <div style={{ fontFamily: SERIF, fontWeight: 300, fontSize: "clamp(1.4rem, 4vw, 1.8rem)", color: "#e8b4c8", marginBottom: 40, opacity: titleOp }}>
        Seni neden seviyorum
      </div>
      <div style={{ display: "flex", flexDirection: "column", width: "100%", maxWidth: 520, borderTop: "1px solid rgba(196,105,122,0.12)" }}>
        {REASONS.map((r, i) => {
          const delay = FPS * 0.8 + i * FPS * 0.6;
          const s = spring({ frame: Math.max(0, frame - delay), fps: FPS, config: { damping: 200 } });
          return (
            <div key={i} style={{
              display: "flex", alignItems: "flex-start", gap: 16, padding: "20px 0",
              borderBottom: "1px solid rgba(196,105,122,0.08)",
              opacity: interpolate(s, [0, 1], [0, 1]),
              transform: `translateY(${interpolate(s, [0, 1], [16, 0])}px)`,
            }}>
              <span style={{ fontFamily: SERIF, fontSize: "1.8rem", fontWeight: 300, color: "rgba(212,165,116,0.4)", lineHeight: 1, flexShrink: 0, width: 40 }}>
                0{i + 1}
              </span>
              <span style={{ fontFamily: SANS, fontWeight: 300, fontSize: "0.95rem", color: "rgba(245,230,211,0.75)", lineHeight: 1.7, paddingTop: 4 }}>
                {r}
              </span>
            </div>
          );
        })}
      </div>
      <button onClick={onNext} style={{
        fontFamily: SANS, fontWeight: 400, fontSize: "0.75rem", letterSpacing: "0.2em",
        textTransform: "uppercase", padding: "14px 40px", marginTop: 40,
        background: "transparent", color: "#d4a574",
        border: "1px solid rgba(212,165,116,0.25)", borderRadius: 0, cursor: "pointer",
        opacity: btnOp, transition: "background 0.3s, border-color 0.3s",
      }}
        onMouseOver={(e) => { e.currentTarget.style.background = "rgba(212,165,116,0.08)"; e.currentTarget.style.borderColor = "rgba(212,165,116,0.5)"; }}
        onMouseOut={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(212,165,116,0.25)"; }}
      >
        Mektubunu oku
      </button>
    </div>
  );
};

// ═══════════════════════════════════════════
// SCREEN 4 — LETTER (typewriter)
// ═══════════════════════════════════════════
const LETTER_LINES = [
  "Seninle geçen her gün, evrenin",
  "gösteri\u015f yapmaya karar verdiği",
  "bir gün gibi hissettiriyor.",
  "",
  "Alp Demir'in gözlerinde senin",
  "kararlılığını, Nil Dora'nın",
  "gülüşünde senin sıcaklığını",
  "görüyorum her gün.",
  "",
  "Işıl — ışıl ışıl parlayan.",
  "Annen sana adını verirken biliyormuş:",
  "hayatıma parıltı getirecek biriydin.",
  "En karanlık günlerde bile sönmeyen.",
  "",
  "Bu Sevgililer Günü'nde büyük",
  "şeylere ihtiyacım yok.",
  "Sadece sen — şimdi, yarın",
  "ve sonsuza kadar.",
];

const LetterScreen: React.FC<{ onNext: () => void }> = ({ onNext }) => {
  const { frame } = useFrame();
  const fullText = LETTER_LINES.join("\n");
  const nameGlow = interpolate(Math.sin((frame / FPS) * Math.PI * 0.6), [-1, 1], [0.4, 0.9]);
  const greetOp = interpolate(frame, [0, FPS], [0, 1], { extrapolateRight: "clamp" });
  const barH = interpolate(frame, [0, FPS * 2], [0, 100], { extrapolateRight: "clamp" });

  const charsPerFrame = 1.2;
  const startFrame = FPS * 1.5;
  const chars = Math.min(fullText.length, Math.max(0, Math.floor((frame - startFrame) * charsPerFrame)));
  const visible = fullText.slice(0, chars);
  const cursorOp = chars < fullText.length ? interpolate(frame % 40, [0, 20, 40], [1, 0, 1]) : 0;
  const done = chars >= fullText.length;

  const closingOp = done ? interpolate(frame - (startFrame + fullText.length / charsPerFrame), [FPS * 0.3, FPS * 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;
  const btnOp = done ? interpolate(frame - (startFrame + fullText.length / charsPerFrame + FPS), [0, FPS * 0.5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: "30px 16px", overflowY: "auto" }}>
      <div style={{ maxWidth: 560, width: "100%", position: "relative", padding: "40px 32px", background: "rgba(255,255,255,0.015)", border: "1px solid rgba(232,180,200,0.06)" }}>
        <div style={{ position: "absolute", top: 0, left: 0, width: 3, height: `${barH}%`, background: "linear-gradient(to bottom, #d4a574, transparent)" }} />
        <div style={{ fontFamily: SERIF, fontWeight: 300, fontStyle: "italic", fontSize: "clamp(1.3rem, 4vw, 1.7rem)", color: "#e8b4c8", marginBottom: 28, opacity: greetOp }}>
          Biricik{" "}
          <span style={{ color: "#f0c888", fontWeight: 400, textShadow: `0 0 ${20 * nameGlow}px rgba(240,200,136,${nameGlow * 0.6})` }}>
            Işıl
          </span>
          'ım,
        </div>
        <div style={{ fontFamily: SERIF, fontWeight: 300, fontSize: "clamp(0.95rem, 2.5vw, 1.1rem)", lineHeight: 2, color: "rgba(245,230,211,0.7)", whiteSpace: "pre-wrap" }}>
          {visible}
          <span style={{ opacity: cursorOp, color: "#d4a574" }}>{"\u258C"}</span>
        </div>
        <div style={{ fontFamily: SERIF, fontWeight: 400, fontStyle: "italic", fontSize: "clamp(1.1rem, 3vw, 1.3rem)", color: "#d4849a", textAlign: "right", marginTop: 30, opacity: closingOp }}>
          Sonsuza kadar senin
        </div>
      </div>
      <button onClick={(e) => { spawnBurst(e.clientX, e.clientY, 25); setTimeout(onNext, 300); }} style={{
        marginTop: 30, width: 48, height: 48, background: "transparent",
        border: "1px solid rgba(212,165,116,0.2)", borderRadius: "50%",
        color: "#d4a574", fontSize: "1.2rem", cursor: "pointer", opacity: btnOp,
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "background 0.3s, border-color 0.3s, box-shadow 0.3s",
      }}
        onMouseOver={(e) => { e.currentTarget.style.background = "rgba(212,165,116,0.08)"; e.currentTarget.style.borderColor = "#d4a574"; e.currentTarget.style.boxShadow = "0 0 30px rgba(212,165,116,0.15)"; }}
        onMouseOut={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(212,165,116,0.2)"; e.currentTarget.style.boxShadow = "none"; }}
      >
        {"\u2192"}
      </button>
    </div>
  );
};

// ═══════════════════════════════════════════
// SCREEN 5 — FINALE
// ═══════════════════════════════════════════
const FinaleScreen: React.FC<{ onRestart: () => void }> = ({ onRestart }) => {
  const { frame } = useFrame();
  const nameScale = spring({ frame, fps: FPS, config: { damping: 8, stiffness: 60 } });
  const glowInt = interpolate(Math.sin((frame / FPS) * Math.PI * 0.4), [-1, 1], [0.5, 1]);
  const valOp = interpolate(frame, [FPS, FPS * 2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const valY = interpolate(frame, [FPS, FPS * 2], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const subOp = interpolate(frame, [FPS * 2.5, FPS * 3.5], [0, 0.4], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const lineW = interpolate(frame, [FPS * 3.5, FPS * 4.5], [0, 80], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const lineOp = interpolate(frame, [FPS * 3.5, FPS * 4.5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const famOp = interpolate(frame, [FPS * 5, FPS * 6], [0, 0.5], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const restartOp = interpolate(frame, [FPS * 7, FPS * 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%" }}>
      <h1 style={{
        fontFamily: SERIF, fontWeight: 300, fontSize: "clamp(3rem, 12vw, 6rem)", letterSpacing: "0.05em",
        color: "#f0c888", textAlign: "center",
        textShadow: `0 0 ${40 * glowInt}px rgba(240,200,136,${0.6 * glowInt}), 0 0 ${80 * glowInt}px rgba(240,200,136,${0.3 * glowInt}), 0 0 ${120 * glowInt}px rgba(240,200,136,${0.15 * glowInt})`,
        transform: `scale(${nameScale})`,
      }}>
        Işıl
      </h1>
      <p style={{ fontFamily: SERIF, fontWeight: 300, fontStyle: "italic", fontSize: "clamp(1.2rem, 3.5vw, 1.6rem)", color: "#e8b4c8", letterSpacing: "0.1em", marginTop: 20, opacity: valOp, transform: `translateY(${valY}px)` }}>
        Sevgililer Günün Kutlu Olsun
      </p>
      <p style={{ fontFamily: SANS, fontWeight: 300, fontSize: "0.7rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "#e8b4c8", marginTop: 24, opacity: subOp }}>
        bugün, yarın ve sonsuza kadar
      </p>
      <div style={{ width: lineW, height: 1, marginTop: 40, opacity: lineOp, background: "linear-gradient(to right, transparent, #d4a574, transparent)" }} />
      <p style={{ fontFamily: SERIF, fontWeight: 300, fontStyle: "italic", fontSize: "clamp(0.9rem, 2.5vw, 1.1rem)", color: "#d4849a", marginTop: 30, opacity: famOp, textAlign: "center" }}>
        Alp Demir, Nil Dora ve ben — seni çok seviyoruz
      </p>
      <button onClick={onRestart} style={{
        fontFamily: SANS, fontWeight: 300, fontSize: "0.65rem", letterSpacing: "0.2em",
        textTransform: "uppercase", marginTop: 36, padding: "10px 24px",
        background: "transparent", color: "rgba(232,180,200,0.25)",
        border: "1px solid rgba(232,180,200,0.1)", cursor: "pointer",
        opacity: restartOp, transition: "color 0.3s, border-color 0.3s",
      }}
        onMouseOver={(e) => { e.currentTarget.style.color = "#e8b4c8"; e.currentTarget.style.borderColor = "rgba(232,180,200,0.3)"; }}
        onMouseOut={(e) => { e.currentTarget.style.color = "rgba(232,180,200,0.25)"; e.currentTarget.style.borderColor = "rgba(232,180,200,0.1)"; }}
      >
        baştan başla
      </button>
    </div>
  );
};

// ═══════════════════════════════════════════
// APP — SCREEN ROUTER
// ═══════════════════════════════════════════
type Screen = "envelope" | "question" | "reasons" | "letter" | "finale";

const INTENSITY: Record<Screen, number> = {
  envelope: 0.15,
  question: 0.3,
  reasons: 0.5,
  letter: 0.7,
  finale: 1,
};

const App: React.FC = () => {
  const [screen, setScreen] = useState<Screen>("envelope");
  const [visible, setVisible] = useState(true);

  const transition = (next: Screen) => {
    setVisible(false);
    setTimeout(() => {
      setScreen(next);
      setVisible(true);
    }, 600);
  };

  // Click anywhere for sparkle
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      if (el.tagName !== "BUTTON") {
        spawnBurst(e.clientX, e.clientY, 4);
      }
    };
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#060612", overflow: "hidden", position: "relative" }}>
      <ParticleField intensity={INTENSITY[screen]} />
      <div style={{ position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none", opacity: 0.035, backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")", backgroundSize: "256px 256px" }} />
      <BurstLayer />
      <div style={{
        position: "relative", zIndex: 10, width: "100%", height: "100%",
        opacity: visible ? 1 : 0, transition: "opacity 0.6s ease",
      }}>
        {screen === "envelope" && <EnvelopeScreen onOpen={() => transition("question")} />}
        {screen === "question" && <QuestionScreen onYes={() => transition("reasons")} />}
        {screen === "reasons" && <ReasonsScreen onNext={() => transition("letter")} />}
        {screen === "letter" && <LetterScreen onNext={() => transition("finale")} />}
        {screen === "finale" && <FinaleScreen onRestart={() => transition("envelope")} />}
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById("root")!);
root.render(<App />);

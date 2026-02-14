import { COLORS, drawHeart, drawPlayer, drawPrincess } from "./renderer";
import { createPlayer } from "./player";

// ── Death Messages ──────────────────────────────────────────────────
export const DEATH_MESSAGES = [
  "Ahhh! Tekrar dene, a\u015Fk\u0131m bekliyor!",
  "Bu sefer olacak... belki.",
  "I\u015F\u0131l bunu g\u00F6rse g\u00FClmekten k\u0131r\u0131l\u0131rd\u0131.",
  "Pes etme! A\u015Fk engel tan\u0131maz... ama dikenler tan\u0131r.",
  "404: Hayatta kalma becerisi bulunamad\u0131",
  "Bir daha! A\u015Fk sab\u0131r ister...",
  "Bu oyun seni troll\u00FCyor ama a\u015Fk ger\u00E7ek!",
  "Merak etme, I\u015F\u0131l h\u00E2l\u00E2 bekliyor",
  "D\u00FC\u015Fmek normal, kalkmak a\u015Fk!",
];

// ── Total levels (for progress indicator) ───────────────────────────
const TOTAL_LEVELS = 5;

// ── Helper: draw a small pixel skull ─────────────────────────────────
function drawSkull(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
): void {
  ctx.fillStyle = color;
  // Head (5x4 block)
  ctx.fillRect(x + 1, y, 3, 1);
  ctx.fillRect(x, y + 1, 5, 1);
  // Eyes row
  ctx.fillRect(x, y + 2, 1, 1);
  ctx.fillRect(x + 2, y + 2, 1, 1);
  ctx.fillRect(x + 4, y + 2, 1, 1);
  // Jaw
  ctx.fillRect(x + 1, y + 3, 3, 1);
  // Teeth
  ctx.fillRect(x + 1, y + 4, 1, 1);
  ctx.fillRect(x + 3, y + 4, 1, 1);
}

// ── Helper: draw a small pixel star ─────────────────────────────────
function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  color: string,
): void {
  ctx.fillStyle = color;
  ctx.fillRect(cx, cy - size, 1, size * 2 + 1);
  ctx.fillRect(cx - size, cy, size * 2 + 1, 1);
  if (size >= 2) {
    ctx.fillRect(cx - 1, cy - 1, 1, 1);
    ctx.fillRect(cx + 1, cy - 1, 1, 1);
    ctx.fillRect(cx - 1, cy + 1, 1, 1);
    ctx.fillRect(cx + 1, cy + 1, 1, 1);
  }
}

// ── 1. Start Screen ─────────────────────────────────────────────────
export function drawStartScreen(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  frame: number,
): void {
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Title text - bigger and bolder
  ctx.fillStyle = COLORS.text;
  ctx.font = "bold 20px monospace";
  ctx.fillText("I\u015F\u0131l\u2019a Ula\u015F", w / 2, h / 2 - 50);

  // Minimal decorative line under title
  ctx.fillStyle = COLORS.playerHeart;
  ctx.fillRect(w / 2 - 40, h / 2 - 34, 80, 1);

  // Subtitle
  ctx.fillStyle = COLORS.textDim;
  ctx.font = "9px monospace";
  ctx.fillText(
    "Sana ula\u015Fmak bu kadar zor olmamal\u0131yd\u0131...",
    w / 2,
    h / 2 - 18,
  );

  // Single small heart below subtitle (minimal decoration)
  drawHeart(ctx, w / 2 - 4, h / 2 - 2, 3, COLORS.playerHeart);

  // Flashing prompt - pulsing opacity based on frame
  const pulse = Math.abs(Math.sin(frame * 0.05));
  ctx.globalAlpha = 0.3 + pulse * 0.7;
  ctx.fillStyle = COLORS.gold;
  ctx.font = "9px monospace";
  ctx.fillText("Ba\u015Flamak i\u00E7in bir tu\u015Fa bas", w / 2, h / 2 + 30);
  ctx.globalAlpha = 1;

  ctx.restore();
}

// ── 2. Death Screen ─────────────────────────────────────────────────
export function drawDeathScreen(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  message: string,
  deathCount: number,
): void {
  ctx.save();

  // Semi-transparent warm overlay
  ctx.fillStyle = "rgba(242, 232, 220, 0.85)";
  ctx.fillRect(0, 0, w, h);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Death message (centered)
  ctx.fillStyle = COLORS.text;
  ctx.font = "11px monospace";
  ctx.fillText(message, w / 2, h / 2 - 15);

  // Death count - clean, centered below message
  ctx.fillStyle = COLORS.playerHeart;
  ctx.font = "9px monospace";
  ctx.fillText("\u2620 " + deathCount, w / 2, h / 2 + 10);

  // Prompt to continue
  ctx.fillStyle = COLORS.textDim;
  ctx.font = "8px monospace";
  ctx.fillText(
    "Devam etmek i\u00E7in bir tu\u015Fa bas",
    w / 2,
    h / 2 + 35,
  );

  ctx.restore();
}

// ── 3. Level Intro ──────────────────────────────────────────────────
export function drawLevelIntro(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  levelNum: number,
  name: string,
  subtitle: string,
  progress: number,
): void {
  ctx.save();

  // Fade in based on progress (0-1)
  ctx.globalAlpha = Math.min(1, progress);

  // Background overlay
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, w, h);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Level progress squares at top
  const sqSize = 8;
  const sqGap = 4;
  const totalW = TOTAL_LEVELS * sqSize + (TOTAL_LEVELS - 1) * sqGap;
  const startX = (w - totalW) / 2;
  const sqY = h / 2 - 55;

  for (let i = 0; i < TOTAL_LEVELS; i++) {
    const sx = startX + i * (sqSize + sqGap);
    if (i < levelNum) {
      // Completed or current level = filled
      ctx.fillStyle = COLORS.gold;
      ctx.fillRect(sx, sqY, sqSize, sqSize);
    } else {
      // Future level = outline
      ctx.strokeStyle = COLORS.textDim;
      ctx.lineWidth = 1;
      ctx.strokeRect(sx + 0.5, sqY + 0.5, sqSize - 1, sqSize - 1);
    }
  }

  // Level name
  ctx.fillStyle = COLORS.text;
  ctx.font = "bold 13px monospace";
  ctx.fillText(name, w / 2, h / 2 - 10);

  // Subtitle
  ctx.fillStyle = COLORS.textDim;
  ctx.font = "9px monospace";
  ctx.fillText(subtitle, w / 2, h / 2 + 12);

  // Minimal decorative line
  ctx.fillStyle = COLORS.playerHeart;
  const lineW = 60 * progress;
  ctx.fillRect(w / 2 - lineW / 2, h / 2 - 22, lineW, 1);

  ctx.globalAlpha = 1;
  ctx.restore();
}

// ── 4. Level Clear ──────────────────────────────────────────────────
export function drawLevelClear(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  levelNum: number,
  progress: number,
): void {
  ctx.save();

  // Background overlay
  ctx.fillStyle = "rgba(242, 232, 220, 0.8)";
  ctx.fillRect(0, 0, w, h);

  ctx.globalAlpha = Math.min(1, progress);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Celebration text
  ctx.fillStyle = COLORS.playerHeart;
  ctx.font = "bold 13px monospace";
  ctx.fillText("B\u00D6L\u00DCM " + levelNum + " TAMAMLANDI!", w / 2, h / 2 - 10);

  // Sparkle / star decorations spreading out based on progress
  const numStars = 8;
  for (let i = 0; i < numStars; i++) {
    const angle = (i / numStars) * Math.PI * 2;
    const radius = 30 + progress * 40;
    const sx = w / 2 + Math.cos(angle) * radius;
    const sy = h / 2 + Math.sin(angle) * radius - 10;
    const starSize = 1 + Math.floor(progress * 2);
    const color = i % 2 === 0 ? COLORS.gold : COLORS.playerHeart;
    drawStar(ctx, Math.floor(sx), Math.floor(sy), starSize, color);
  }

  // Small hearts bursting outward
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const radius = 20 + progress * 30;
    const hx = w / 2 + Math.cos(angle) * radius - 3;
    const hy = h / 2 + Math.sin(angle) * radius - 12;
    drawHeart(ctx, Math.floor(hx), Math.floor(hy), 3, COLORS.playerHeart);
  }

  ctx.globalAlpha = 1;
  ctx.restore();
}

// ── 5. HUD ──────────────────────────────────────────────────────────
// Level Devil style: progress squares at top center, death count top-left.
export function drawHUD(
  ctx: CanvasRenderingContext2D,
  levelNum: number,
  deathCount: number,
): void {
  ctx.save();
  ctx.globalAlpha = 0.7;

  // ── TOP CENTER: Level progress as filled/empty squares ──
  const sqSize = 8;
  const sqGap = 4;
  const totalW = TOTAL_LEVELS * sqSize + (TOTAL_LEVELS - 1) * sqGap;
  const startX = (480 - totalW) / 2;
  const sqY = 6;

  for (let i = 0; i < TOTAL_LEVELS; i++) {
    const sx = startX + i * (sqSize + sqGap);
    if (i < levelNum) {
      // Completed or current level = filled square
      ctx.fillStyle = COLORS.gold;
      ctx.fillRect(sx, sqY, sqSize, sqSize);
    } else {
      // Future level = empty/outline square
      ctx.strokeStyle = COLORS.textDim;
      ctx.lineWidth = 1;
      ctx.strokeRect(sx + 0.5, sqY + 0.5, sqSize - 1, sqSize - 1);
    }
  }

  // ── TOP-LEFT: Death counter ──
  drawSkull(ctx, 8, 5, COLORS.text);
  ctx.fillStyle = COLORS.text;
  ctx.font = "8px monospace";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText("" + deathCount, 16, 6);

  ctx.globalAlpha = 1;
  ctx.restore();
}

// ── 6. Finale ───────────────────────────────────────────────────────
export function drawFinale(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  frame: number,
): void {
  ctx.save();

  // Dark romantic background
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, w, h);

  // Ground platform for characters to walk on
  const groundY = h / 2 + 40;
  ctx.fillStyle = COLORS.platform;
  ctx.fillRect(0, groundY, w, 4);

  // Character positions -- they walk toward center
  const centerX = w / 2;
  const charY = groundY - 16; // player sprite is 16px tall

  // Phase 1: frames 0-120 -- characters walk toward center
  if (frame <= 120) {
    const progress = Math.min(1, frame / 120);
    // Ease-out for smooth arrival
    const ease = 1 - Math.pow(1 - progress, 2);

    // Player starts from left edge, walks right
    const playerX = -14 + ease * (centerX - 20);
    // Princess starts from right edge, walks left
    const princessX = w + ease * (-(w - centerX) - 6);

    // Create a walking player for the animation
    const player = createPlayer(Math.floor(playerX), Math.floor(charY));
    player.facingRight = true;
    player.onGround = true;
    player.animFrame = Math.floor(frame / 8) % 4;
    drawPlayer(ctx, player);

    // Draw princess walking
    const princessFrame = Math.floor(frame / 10) % 4;
    drawPrincess(ctx, Math.floor(princessX), Math.floor(charY), princessFrame);
  }

  // Phase 2: frames 120-180 -- they meet, hearts burst
  if (frame > 120 && frame <= 180) {
    // Characters standing together in the center
    const player = createPlayer(
      Math.floor(centerX - 20),
      Math.floor(charY),
    );
    player.facingRight = true;
    player.onGround = true;
    player.animFrame = 0;
    drawPlayer(ctx, player);

    drawPrincess(
      ctx,
      Math.floor(centerX + 6),
      Math.floor(charY),
      1, // waving frame
    );

    // Hearts burst outward from center
    const burstProgress = (frame - 120) / 60;
    const numHearts = 10;
    for (let i = 0; i < numHearts; i++) {
      const angle = (i / numHearts) * Math.PI * 2;
      const radius = burstProgress * 60;
      const hx = centerX + Math.cos(angle) * radius - 3;
      const hy = charY - 5 + Math.sin(angle) * radius * 0.7;
      const heartAlpha = Math.max(0, 1 - burstProgress * 0.5);

      ctx.globalAlpha = heartAlpha;
      const heartSize = i % 3 === 0 ? 4 : 3;
      const heartColor = i % 2 === 0 ? COLORS.playerHeart : COLORS.princess;
      drawHeart(
        ctx,
        Math.floor(hx),
        Math.floor(hy),
        heartSize,
        heartColor,
      );
    }
    ctx.globalAlpha = 1;
  }

  // Phase 3: frame 180+ -- characters stay, text fades in
  if (frame > 180) {
    // Characters standing together
    const player = createPlayer(
      Math.floor(centerX - 20),
      Math.floor(charY),
    );
    player.facingRight = true;
    player.onGround = true;
    player.animFrame = 0;
    drawPlayer(ctx, player);

    drawPrincess(
      ctx,
      Math.floor(centerX + 6),
      Math.floor(charY),
      Math.floor(frame / 20) % 4,
    );

    // Lingering floating hearts (gentle, slow)
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 + frame * 0.01;
      const radius = 25 + Math.sin(frame * 0.03 + i) * 10;
      const hx = centerX + Math.cos(angle) * radius - 3;
      const hy = charY - 10 + Math.sin(angle) * radius * 0.5;
      ctx.globalAlpha = 0.5 + Math.sin(frame * 0.05 + i) * 0.3;
      drawHeart(
        ctx,
        Math.floor(hx),
        Math.floor(hy),
        2,
        COLORS.playerHeart,
      );
    }
    ctx.globalAlpha = 1;

    // Text fade-in
    const textProgress = Math.min(1, (frame - 180) / 60);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Big title - "You found your princess!"
    ctx.globalAlpha = textProgress;
    ctx.fillStyle = COLORS.playerHeart;
    ctx.font = "bold 14px monospace";
    ctx.fillText(
      "Prensesine kavu\u015Ftun!",
      w / 2,
      h / 2 + 65,
    );

    // Main message
    const msgProgress = Math.min(1, Math.max(0, (frame - 210) / 60));
    ctx.globalAlpha = msgProgress;
    ctx.fillStyle = COLORS.text;
    ctx.font = "10px monospace";
    ctx.fillText(
      "Her engeli a\u015Ft\u0131m, \u00E7\u00FCnk\u00FC sonunda sen vars\u0131n.",
      w / 2,
      h / 2 + 82,
    );

    // Sub message
    const subProgress = Math.min(1, Math.max(0, (frame - 250) / 60));
    ctx.globalAlpha = subProgress;
    ctx.fillStyle = COLORS.gold;
    ctx.font = "bold 11px monospace";
    ctx.fillText(
      "Sevgililer G\u00FCn\u00FCn Kutlu Olsun, I\u015F\u0131l'\u0131m \u2764",
      w / 2,
      h / 2 + 98,
    );

    // Play again / letter prompt
    const promptProgress = Math.min(1, Math.max(0, (frame - 310) / 60));
    ctx.globalAlpha = promptProgress;
    ctx.fillStyle = COLORS.textDim;
    ctx.font = "8px monospace";
    ctx.fillText(
      "Tekrar Oyna",
      w / 2,
      h / 2 + 118,
    );

    ctx.globalAlpha = 1;
  }

  ctx.restore();
}

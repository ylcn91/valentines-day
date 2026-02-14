import { Rect } from "./engine";
import { Player } from "./player";

// ── Color constants (Level Devil minimal + Valentine palette) ────────
export const COLORS = {
  bg: "#f2e8dc",
  platform: "#c4697a",
  platformLight: "#d4849a",
  player: "#2d2d3a",
  playerHeart: "#e05577",
  gold: "#d4a054",
  princess: "#d4849a",
  spike: "#8b3a4a",
  door: "#a0785a",
  doorFrame: "#8b6f4e",
  doorOpen: "#3a3028",
  text: "#2d2d3a",
  textDim: "rgba(45,45,58,0.5)",
};

// Pixel size: we use 2x2 "big pixels" for visibility at 480x270
const P = 2;

// ── Helper: draw a single "big pixel" ────────────────────────────────
function px(
  ctx: CanvasRenderingContext2D,
  baseX: number,
  baseY: number,
  col: number,
  row: number,
  color: string,
) {
  ctx.fillStyle = color;
  ctx.fillRect(baseX + col * P, baseY + row * P, P, P);
}

// ── Helper: draw a row of pixels from a string pattern ───────────────
// Each character maps to a color. " " or "." = transparent (skip).
type Palette = Record<string, string>;

function drawBitmap(
  ctx: CanvasRenderingContext2D,
  baseX: number,
  baseY: number,
  rows: string[],
  palette: Palette,
) {
  for (let r = 0; r < rows.length; r++) {
    for (let c = 0; c < rows[r].length; c++) {
      const ch = rows[r][c];
      if (ch === " " || ch === ".") continue;
      const color = palette[ch];
      if (color) px(ctx, baseX, baseY, c, r, color);
    }
  }
}

// ── drawPlayer ───────────────────────────────────────────────────────
// Minimal blocky silhouette. 7 big-pixels wide, 8 tall = 14x16 actual.
// B = body (light pink silhouette — visible against dark bg)
// H = heart accent on chest (small pink/red detail)

const PLAYER_PALETTE: Palette = {
  B: COLORS.player,
  H: COLORS.playerHeart,
};

// Standing frame — legs together, idle
const PLAYER_STAND: string[] = [
  "..BBB..",  // head
  "..BBB..",
  ".BBBBB.",  // body
  ".BBHBB.",  // chest with heart
  ".BBBBB.",  // torso
  "..BBB..",  // hips
  "..B.B..",  // legs
  "..B.B..",
];

// Walk frame 1 — left leg forward, right leg back
const PLAYER_WALK_L: string[] = [
  "..BBB..",
  "..BBB..",
  ".BBBBB.",
  ".BBHBB.",
  ".BBBBB.",
  "..BBB..",
  ".BB..B.",  // left leg forward
  "BB...BB",  // wide stride
];

// Walk frame 2 — legs passing (together)
const PLAYER_WALK_R: string[] = [
  "..BBB..",
  "..BBB..",
  ".BBBBB.",
  ".BBHBB.",
  ".BBBBB.",
  "..BBB..",
  "..B.BB.",  // right leg forward
  "..B..BB",  // wide stride
];

// Jump pose — legs tucked up
const PLAYER_JUMP: string[] = [
  "..BBB..",
  "..BBB..",
  ".BBBBB.",
  ".BBHBB.",
  ".BBBBB.",
  "..BBB..",
  "..BBB..",  // legs tucked together
  ".......",
];

function getPlayerFrame(p: Player): string[] {
  if (!p.onGround) return PLAYER_JUMP;
  switch (p.animFrame) {
    case 0: return PLAYER_STAND;
    case 1: return PLAYER_WALK_L;
    case 2: return PLAYER_STAND;
    case 3: return PLAYER_WALK_R;
    default: return PLAYER_STAND;
  }
}

function flipRows(rows: string[]): string[] {
  return rows.map((row) => row.split("").reverse().join(""));
}

export function drawPlayer(
  ctx: CanvasRenderingContext2D,
  player: Player,
): void {
  if (!player.alive) return;

  let frame = getPlayerFrame(player);

  // Flip horizontally if facing left
  if (!player.facingRight) {
    frame = flipRows(frame);
  }

  drawBitmap(ctx, player.x, player.y, frame, PLAYER_PALETTE);
}

// ── drawPrincess ─────────────────────────────────────────────────────
// Minimal silhouette with crown bump and dress shape.
// D = dress/body, G = gold crown accent

const PRINCESS_PALETTE: Palette = {
  D: COLORS.princess,
  G: COLORS.gold,
};

// Frame 0: hand down
const PRINCESS_F0: string[] = [
  "..GGG..",  // crown
  "..DDD..",  // head
  "..DDD..",
  ".DDDDD.",  // body
  ".DDDDD.",
  ".DDDDD.",  // dress widens
  "DDDDDDD",  // dress bottom (flared)
  ".......",
];

// Frame 1: hand waving up-right
const PRINCESS_F1: string[] = [
  "..GGG.D",
  "..DDD.D",
  "..DDD..",
  ".DDDDD.",
  ".DDDDD.",
  ".DDDDD.",
  "DDDDDDD",
  ".......",
];

// Frame 2: hand waving mid
const PRINCESS_F2: string[] = [
  "..GGG..",
  "..DDD..",
  "..DDDDD",
  ".DDDDD.",
  ".DDDDD.",
  ".DDDDD.",
  "DDDDDDD",
  ".......",
];

const PRINCESS_FRAMES = [PRINCESS_F0, PRINCESS_F1, PRINCESS_F2, PRINCESS_F1];

export function drawPrincess(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  frame: number,
): void {
  const f = PRINCESS_FRAMES[frame % PRINCESS_FRAMES.length];
  drawBitmap(ctx, x, y, f, PRINCESS_PALETTE);
}

// ── drawPlatform ─────────────────────────────────────────────────────
// Clean solid rectangle with 1px lighter top edge. No brick texture.

export function drawPlatform(
  ctx: CanvasRenderingContext2D,
  rect: Rect,
): void {
  // Solid fill
  ctx.fillStyle = COLORS.platform;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);

  // 1px lighter top edge for subtle depth
  ctx.fillStyle = COLORS.platformLight;
  ctx.fillRect(rect.x, rect.y, rect.w, 1);
}

// ── drawSpike ────────────────────────────────────────────────────────
// Simple solid triangle. No highlight.

export function drawSpike(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  up: boolean,
): void {
  ctx.fillStyle = COLORS.spike;

  const w = 12;
  const h = 10;
  const midX = x + w / 2;

  ctx.beginPath();
  if (up) {
    ctx.moveTo(midX, y);
    ctx.lineTo(x, y + h);
    ctx.lineTo(x + w, y + h);
  } else {
    ctx.moveTo(midX, y + h);
    ctx.lineTo(x, y);
    ctx.lineTo(x + w, y);
  }
  ctx.closePath();
  ctx.fill();
}

// ── drawDoor ─────────────────────────────────────────────────────────
// Minimal rectangle. Closed = lighter fill. Open = dark interior with frame.

export function drawDoor(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  open: boolean,
): void {
  const w = 16;
  const h = 24;

  if (open) {
    // Dark interior
    ctx.fillStyle = COLORS.doorOpen;
    ctx.fillRect(x, y, w, h);

    // Thin frame
    ctx.fillStyle = COLORS.doorFrame;
    ctx.fillRect(x, y, 1, h);         // left
    ctx.fillRect(x + w - 1, y, 1, h); // right
    ctx.fillRect(x, y, w, 1);         // top
  } else {
    // Solid door body
    ctx.fillStyle = COLORS.door;
    ctx.fillRect(x, y, w, h);

    // Slightly darker border
    ctx.fillStyle = COLORS.doorFrame;
    ctx.fillRect(x, y, w, 1);         // top
    ctx.fillRect(x, y, 1, h);         // left
    ctx.fillRect(x + w - 1, y, 1, h); // right
    ctx.fillRect(x, y + h - 1, w, 1); // bottom
  }
}

// ── drawHeart ────────────────────────────────────────────────────────
// A small pixel heart. Size controls the scale.

export function drawHeart(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
): void {
  ctx.fillStyle = color;

  if (size <= 2) {
    // Tiny 4x4 heart
    ctx.fillRect(x + 1, y, 2, 1);
    ctx.fillRect(x + 5, y, 2, 1);
    ctx.fillRect(x, y + 1, 8, 1);
    ctx.fillRect(x + 1, y + 2, 6, 1);
    ctx.fillRect(x + 2, y + 3, 4, 1);
    ctx.fillRect(x + 3, y + 4, 2, 1);
  } else if (size <= 4) {
    const s = 1;
    ctx.fillRect(x + 1 * s, y, 2 * s, s);
    ctx.fillRect(x + 4 * s, y, 2 * s, s);
    ctx.fillRect(x, y + 1 * s, 7 * s, s);
    ctx.fillRect(x, y + 2 * s, 7 * s, s);
    ctx.fillRect(x + 1 * s, y + 3 * s, 5 * s, s);
    ctx.fillRect(x + 2 * s, y + 4 * s, 3 * s, s);
    ctx.fillRect(x + 3 * s, y + 5 * s, 1 * s, s);
  } else {
    const s = Math.floor(size / 3);
    ctx.fillRect(x + 1 * s, y, 2 * s, s);
    ctx.fillRect(x + 4 * s, y, 2 * s, s);
    ctx.fillRect(x, y + 1 * s, 7 * s, s);
    ctx.fillRect(x, y + 2 * s, 7 * s, s);
    ctx.fillRect(x + 1 * s, y + 3 * s, 5 * s, s);
    ctx.fillRect(x + 2 * s, y + 4 * s, 3 * s, s);
    ctx.fillRect(x + 3 * s, y + 5 * s, 1 * s, s);
  }
}

// ── drawCRT ──────────────────────────────────────────────────────────
// Subtle CRT scanline overlay + vignette. Reduced opacity for cleaner look.

export function drawCRT(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
): void {
  // Scanlines: very subtle
  ctx.fillStyle = "rgba(0, 0, 0, 0.02)";
  for (let y = 0; y < h; y += 2) {
    ctx.fillRect(0, y, w, 1);
  }

  // Vignette: slightly reduced
  const gradient = ctx.createRadialGradient(
    w / 2, h / 2, Math.min(w, h) * 0.4,
    w / 2, h / 2, Math.max(w, h) * 0.7,
  );
  gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
  gradient.addColorStop(1, "rgba(0, 0, 0, 0.15)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);
}

import { Rect } from "./engine";
import { Player } from "./player";

// ── Color constants ──────────────────────────────────────────────────
export const COLORS = {
  bg: "#1a1a2e",
  platform: "#c4697a",
  platformDark: "#a05268",
  player: "#e8b4c8",
  playerHeart: "#c4697a",
  gold: "#f0c888",
  princess: "#d4849a",
  spike: "#a05268",
  text: "#f5e6d3",
  textDim: "rgba(245,230,211,0.5)",
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
// Player sprite: 7 big-pixels wide, 8 big-pixels tall = 14x16 actual.
// Palette:
//   B = body/skin (#e8b4c8)
//   H = hair/head darker (#b07090)
//   E = eye white (#ffffff)
//   P = pupil (#1a1a2e)
//   R = heart on chest (#c4697a)
//   S = shoe (#a05268)
//   L = leg/pants (#9e5c78)
//   . = transparent

const PLAYER_PALETTE: Palette = {
  B: COLORS.player,       // skin / body
  H: "#b07090",           // hair
  E: "#ffffff",           // eye whites
  P: "#1a1a2e",           // pupils
  R: COLORS.playerHeart,  // heart on chest
  S: COLORS.platformDark, // shoes
  L: "#9e5c78",           // legs / pants
  D: "#d4a0b8",           // body highlight
};

// Standing frame (frames 0 and 2)
const PLAYER_STAND: string[] = [
  "..HHH..",  // row 0: top of hair
  ".HHHHH.",  // row 1: hair
  ".BEPEB.",  // row 2: face — eyes
  ".BBBBB.",  // row 3: face — mouth area
  "..BRB..",  // row 4: chest with heart
  "..BBB..",  // row 5: torso
  "..L.L..",  // row 6: legs apart
  "..S.S..",  // row 7: shoes
];

// Walk frame 1 (left step)
const PLAYER_WALK_L: string[] = [
  "..HHH..",
  ".HHHHH.",
  ".BEPEB.",
  ".BBBBB.",
  "..BRB..",
  "..BBB..",
  ".L...L.",  // wider step left
  ".S...S.",
];

// Walk frame 3 (right step)
const PLAYER_WALK_R: string[] = [
  "..HHH..",
  ".HHHHH.",
  ".BEPEB.",
  ".BBBBB.",
  "..BRB..",
  "..BBB..",
  "...L...",  // legs together mid-step
  "...S...",
];

// Jump pose (in air)
const PLAYER_JUMP: string[] = [
  "..HHH..",
  ".HHHHH.",
  ".BEPEB.",
  ".BBBBB.",
  "..BRB..",
  "..BBB..",
  ".LL.LL.",  // legs tucked
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
// Princess sprite: 7 big-pixels wide, 8 big-pixels tall = 14x16 actual.
// Palette:
//   G = gold tiara (#f0c888)
//   K = hair (#b07090)
//   F = face/skin (#e8b4c8)
//   E = eye white (#ffffff)
//   P = pupil (#1a1a2e)
//   D = dress (#d4849a)
//   W = wave hand (#e8b4c8)
//   S = shoes (#a05268)

const PRINCESS_PALETTE: Palette = {
  G: COLORS.gold,
  K: "#b07090",
  F: COLORS.player,
  E: "#ffffff",
  P: "#1a1a2e",
  D: COLORS.princess,
  W: COLORS.player,
  S: COLORS.platformDark,
};

// Frame 0: hand down
const PRINCESS_F0: string[] = [
  "..GGG..",  // tiara
  ".GKGKG.",  // tiara + hair
  ".FEPEF.",  // face — eyes
  ".FFFFF.",  // face
  ".DDDDD.",  // dress top
  "..DDD..",  // dress mid
  ".DDDDD.",  // dress bottom (flared)
  "..S.S..",  // shoes
];

// Frame 1: hand waving up-right
const PRINCESS_F1: string[] = [
  "..GGG.W",
  ".GKGKGW",
  ".FEPEF.",
  ".FFFFF.",
  ".DDDDD.",
  "..DDD..",
  ".DDDDD.",
  "..S.S..",
];

// Frame 2: hand waving mid
const PRINCESS_F2: string[] = [
  "..GGG..",
  ".GKGKG.",
  ".FEPEF.W",
  ".FFFFF.W",
  ".DDDDD.",
  "..DDD..",
  ".DDDDD.",
  "..S.S..",
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
// Brick-textured tile. One tile = 16x10 pixels (8x5 big-pixels).
// We tile horizontally to fill the rect, and vertically too.

export function drawPlatform(
  ctx: CanvasRenderingContext2D,
  rect: Rect,
): void {
  // Fill base color
  ctx.fillStyle = COLORS.platform;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);

  // Draw brick mortar lines
  ctx.fillStyle = COLORS.platformDark;

  // Horizontal mortar lines every 5 pixels
  const rows = Math.ceil(rect.h / 5);
  for (let r = 0; r < rows; r++) {
    const ly = rect.y + r * 5;
    if (ly >= rect.y + rect.h) break;
    ctx.fillRect(rect.x, ly, rect.w, 1);
  }

  // Vertical mortar lines — offset every other row for brick pattern
  for (let r = 0; r < rows; r++) {
    const ly = rect.y + r * 5;
    const offset = r % 2 === 0 ? 0 : 8;
    for (let cx = rect.x + offset; cx < rect.x + rect.w; cx += 16) {
      const lineH = Math.min(5, rect.y + rect.h - ly);
      if (lineH > 0) {
        ctx.fillRect(cx, ly, 1, lineH);
      }
    }
  }

  // Top highlight edge
  ctx.fillStyle = "#d87a94";
  ctx.fillRect(rect.x, rect.y, rect.w, 1);
}

// ── drawSpike ────────────────────────────────────────────────────────
// Triangle spike, ~12x10 pixels. Points up or down.

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
    ctx.moveTo(midX, y);        // top point
    ctx.lineTo(x, y + h);      // bottom-left
    ctx.lineTo(x + w, y + h);  // bottom-right
  } else {
    ctx.moveTo(midX, y + h);   // bottom point
    ctx.lineTo(x, y);          // top-left
    ctx.lineTo(x + w, y);      // top-right
  }
  ctx.closePath();
  ctx.fill();

  // Add a lighter highlight line for depth
  ctx.fillStyle = "#c06a80";
  if (up) {
    // Small highlight on the left edge
    ctx.beginPath();
    ctx.moveTo(midX, y + 1);
    ctx.lineTo(x + 2, y + h - 1);
    ctx.lineTo(midX, y + h - 1);
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.moveTo(midX, y + h - 1);
    ctx.lineTo(x + 2, y + 1);
    ctx.lineTo(midX, y + 1);
    ctx.closePath();
    ctx.fill();
  }
}

// ── drawDoor ─────────────────────────────────────────────────────────
// ~16x24 pixels. Closed = wooden brown with gold heart handle.
// Open = dark interior.

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
    ctx.fillStyle = "#0d0d1a";
    ctx.fillRect(x, y, w, h);

    // Subtle arch at top
    ctx.fillStyle = "#161629";
    ctx.fillRect(x + 1, y, w - 2, 2);

    // Frame
    ctx.fillStyle = "#8b6f4e";
    ctx.fillRect(x, y, 2, h);       // left
    ctx.fillRect(x + w - 2, y, 2, h); // right
    ctx.fillRect(x, y, w, 2);       // top
  } else {
    // Wooden door body
    ctx.fillStyle = "#a0785a";
    ctx.fillRect(x, y, w, h);

    // Darker frame/border
    ctx.fillStyle = "#8b6f4e";
    ctx.fillRect(x, y, w, 2);       // top
    ctx.fillRect(x, y, 2, h);       // left
    ctx.fillRect(x + w - 2, y, 2, h); // right
    ctx.fillRect(x, y + h - 2, w, 2); // bottom

    // Wood grain lines
    ctx.fillStyle = "#907050";
    ctx.fillRect(x + 5, y + 3, 1, h - 5);
    ctx.fillRect(x + 10, y + 3, 1, h - 5);

    // Panel insets
    ctx.fillStyle = "#96704c";
    ctx.fillRect(x + 3, y + 4, 10, 7);
    ctx.fillRect(x + 3, y + 14, 10, 7);

    // Gold heart-shaped handle
    drawHeart(ctx, x + 10, y + 12, 3, COLORS.gold);
  }
}

// ── drawHeart ────────────────────────────────────────────────────────
// A small pixel heart. Size controls the scale.
// At size=3, it's a 6x5 pixel heart (nice and compact).
// At size=2, it's a 4x4 pixel heart.

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
    //  .XX.XX.
    //  XXXXXXX
    //  .XXXXX.
    //  ..XXX..
    //  ...X...
    ctx.fillRect(x + 1, y, 2, 1);
    ctx.fillRect(x + 5, y, 2, 1);
    ctx.fillRect(x, y + 1, 8, 1);
    ctx.fillRect(x + 1, y + 2, 6, 1);
    ctx.fillRect(x + 2, y + 3, 4, 1);
    ctx.fillRect(x + 3, y + 4, 2, 1);
  } else if (size <= 4) {
    // Small pixel heart (good for chest hearts / pickups)
    // Row 0:  .##.##.
    // Row 1:  #######
    // Row 2:  #######
    // Row 3:  .#####.
    // Row 4:  ..###..
    // Row 5:  ...#...
    const s = 1; // pixel unit
    ctx.fillRect(x + 1 * s, y, 2 * s, s);
    ctx.fillRect(x + 4 * s, y, 2 * s, s);
    ctx.fillRect(x, y + 1 * s, 7 * s, s);
    ctx.fillRect(x, y + 2 * s, 7 * s, s);
    ctx.fillRect(x + 1 * s, y + 3 * s, 5 * s, s);
    ctx.fillRect(x + 2 * s, y + 4 * s, 3 * s, s);
    ctx.fillRect(x + 3 * s, y + 5 * s, 1 * s, s);
  } else {
    // Bigger heart for decorations
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
// Subtle CRT scanline overlay + vignette.

export function drawCRT(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
): void {
  // Scanlines: semi-transparent dark lines every 2 pixels
  ctx.fillStyle = "rgba(0, 0, 0, 0.04)";
  for (let y = 0; y < h; y += 2) {
    ctx.fillRect(0, y, w, 1);
  }

  // Vignette: radial gradient darkening the corners
  const gradient = ctx.createRadialGradient(
    w / 2, h / 2, Math.min(w, h) * 0.3,  // inner circle
    w / 2, h / 2, Math.max(w, h) * 0.7,   // outer circle
  );
  gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
  gradient.addColorStop(1, "rgba(0, 0, 0, 0.25)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);
}

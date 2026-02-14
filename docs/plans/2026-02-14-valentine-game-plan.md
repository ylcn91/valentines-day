# "Işıl'a Ulaş" Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a 5-level Level Devil-style troll platformer as a Valentine's Day gift, served as a separate page alongside the existing card experience.

**Architecture:** Pure TypeScript + HTML5 Canvas game with no dependencies. Vite multi-page app with `game.html` as a second entry point. All pixel art and sound effects generated programmatically — no external assets.

**Tech Stack:** TypeScript, HTML5 Canvas, Web Audio API, Vite (existing)

**Design doc:** `docs/plans/2026-02-14-valentine-game-design.md`

---

### Task 1: Project Scaffolding

**Files:**
- Create: `game.html`
- Create: `src/game/main.ts`
- Modify: `vite.config.ts`

**Step 1: Create game.html**

```html
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
  <title>Işıl'a Ulaş</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body {
      width: 100%; height: 100%;
      background: #1a1a2e;
      overflow: hidden;
      touch-action: none;
    }
    canvas {
      display: block;
      margin: 0 auto;
      image-rendering: pixelated;
      image-rendering: crisp-edges;
    }
  </style>
</head>
<body>
  <canvas id="game"></canvas>
  <script type="module" src="/src/game/main.ts"></script>
</body>
</html>
```

**Step 2: Create src/game/main.ts skeleton**

```typescript
// Game constants
const GAME_W = 480;
const GAME_H = 270;

const canvas = document.getElementById("game") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;

function resize() {
  const scale = Math.min(window.innerWidth / GAME_W, window.innerHeight / GAME_H);
  canvas.width = GAME_W;
  canvas.height = GAME_H;
  canvas.style.width = `${GAME_W * scale}px`;
  canvas.style.height = `${GAME_H * scale}px`;
  canvas.style.marginTop = `${(window.innerHeight - GAME_H * scale) / 2}px`;
}

resize();
window.addEventListener("resize", resize);

// Placeholder — draw a colored background to verify setup
ctx.fillStyle = "#1a1a2e";
ctx.fillRect(0, 0, GAME_W, GAME_H);
ctx.fillStyle = "#e8b4c8";
ctx.font = "16px monospace";
ctx.textAlign = "center";
ctx.fillText("Işıl'a Ulaş — Yükleniyor...", GAME_W / 2, GAME_H / 2);
```

**Step 3: Update vite.config.ts for multi-page**

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  server: { host: true },
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        game: resolve(__dirname, "game.html"),
      },
    },
  },
});
```

**Step 4: Verify**

Run: `cd /Users/yalcindoksanbir/valentines-day && npx vite --open /game.html`

Expected: Browser shows dark background with "Işıl'a Ulaş — Yükleniyor..." centered text. Canvas scales to window.

**Step 5: Commit**

```bash
git add game.html src/game/main.ts vite.config.ts
git commit -m "feat: scaffold game entry point with canvas setup"
```

---

### Task 2: Game Loop + Input System

**Files:**
- Create: `src/game/engine.ts`
- Modify: `src/game/main.ts`

**Step 1: Create engine.ts with game loop and input**

```typescript
// --- Input ---
export const keys: Record<string, boolean> = {};

window.addEventListener("keydown", (e) => {
  keys[e.code] = true;
  // Prevent scroll on arrow/space
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.code)) {
    e.preventDefault();
  }
});
window.addEventListener("keyup", (e) => { keys[e.code] = false; });

// --- AABB Collision ---
export interface Rect {
  x: number; y: number; w: number; h: number;
}

export function rectsOverlap(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

// --- Game Loop ---
export type UpdateFn = (dt: number) => void;
export type DrawFn = (ctx: CanvasRenderingContext2D) => void;

export function startGameLoop(
  ctx: CanvasRenderingContext2D,
  update: UpdateFn,
  draw: DrawFn,
) {
  let last = performance.now();

  function frame(now: number) {
    const dt = Math.min((now - last) / 1000, 0.05); // cap at 50ms to avoid spiral
    last = now;
    update(dt);
    draw(ctx);
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}
```

**Step 2: Wire game loop into main.ts**

Replace the placeholder in main.ts with:
```typescript
import { startGameLoop, keys } from "./engine";

// ... canvas setup stays ...

// Temp: draw a moving square to verify input + loop
let px = GAME_W / 2;
let py = GAME_H / 2;

startGameLoop(ctx,
  (dt) => {
    const speed = 120;
    if (keys["ArrowLeft"] || keys["KeyA"]) px -= speed * dt;
    if (keys["ArrowRight"] || keys["KeyD"]) px += speed * dt;
    if (keys["ArrowUp"] || keys["KeyW"]) py -= speed * dt;
    if (keys["ArrowDown"] || keys["KeyS"]) py += speed * dt;
  },
  (ctx) => {
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 0, GAME_W, GAME_H);
    ctx.fillStyle = "#e8b4c8";
    ctx.fillRect(px - 8, py - 8, 16, 16);
  }
);
```

**Step 3: Verify**

Run dev server, navigate to /game.html. Arrow keys move a pink square smoothly at 60fps.

**Step 4: Commit**

```bash
git add src/game/engine.ts src/game/main.ts
git commit -m "feat: game loop, input system, and AABB collision"
```

---

### Task 3: Player Physics + Platformer Movement

**Files:**
- Create: `src/game/player.ts`
- Modify: `src/game/main.ts`

**Step 1: Create player.ts with gravity, jump, platform collision**

```typescript
import { keys, Rect, rectsOverlap } from "./engine";

export interface Player {
  x: number; y: number;
  vx: number; vy: number;
  w: number; h: number;
  onGround: boolean;
  alive: boolean;
  facingRight: boolean;
  gravityDir: 1 | -1; // 1 = normal, -1 = flipped
  animFrame: number;
  animTimer: number;
}

const SPEED = 130;
const JUMP_VEL = -280;
const GRAVITY = 800;
const MAX_FALL = 500;

export function createPlayer(x: number, y: number): Player {
  return {
    x, y, vx: 0, vy: 0,
    w: 14, h: 16,
    onGround: false, alive: true,
    facingRight: true,
    gravityDir: 1,
    animFrame: 0, animTimer: 0,
  };
}

export function updatePlayer(p: Player, dt: number, platforms: Rect[]) {
  if (!p.alive) return;

  // Horizontal input
  p.vx = 0;
  if (keys["ArrowLeft"] || keys["KeyA"]) { p.vx = -SPEED; p.facingRight = false; }
  if (keys["ArrowRight"] || keys["KeyD"]) { p.vx = SPEED; p.facingRight = true; }

  // Jump
  if ((keys["Space"] || keys["ArrowUp"] || keys["KeyW"]) && p.onGround) {
    p.vy = JUMP_VEL * p.gravityDir;
    p.onGround = false;
  }

  // Gravity
  p.vy += GRAVITY * p.gravityDir * dt;
  p.vy = Math.max(-MAX_FALL, Math.min(MAX_FALL, p.vy));

  // Move X then resolve collisions
  p.x += p.vx * dt;
  const pRect = (): Rect => ({ x: p.x, y: p.y, w: p.w, h: p.h });

  for (const plat of platforms) {
    if (rectsOverlap(pRect(), plat)) {
      if (p.vx > 0) p.x = plat.x - p.w;
      else if (p.vx < 0) p.x = plat.x + plat.w;
    }
  }

  // Move Y then resolve collisions
  p.y += p.vy * dt;
  p.onGround = false;

  for (const plat of platforms) {
    if (rectsOverlap(pRect(), plat)) {
      if (p.gravityDir === 1) {
        if (p.vy > 0) { p.y = plat.y - p.h; p.onGround = true; }
        else if (p.vy < 0) { p.y = plat.y + plat.h; }
      } else {
        if (p.vy < 0) { p.y = plat.y + plat.h; p.onGround = true; }
        else if (p.vy > 0) { p.y = plat.y - p.h; }
      }
      p.vy = 0;
    }
  }

  // Animation
  p.animTimer += dt;
  if (p.animTimer > 0.15) {
    p.animTimer = 0;
    p.animFrame = (p.animFrame + 1) % 4;
  }

  // Fall off screen = death
  if (p.y > 300 || p.y < -50) {
    p.alive = false;
  }
}
```

**Step 2: Integrate into main.ts**

Replace temp code: create player, use test platforms (floor + a floating platform), call updatePlayer in update loop, draw player as a colored rect for now.

**Step 3: Verify**

Player falls to floor, can run left/right, can jump onto floating platform. Falls off edges = death flag.

**Step 4: Commit**

```bash
git add src/game/player.ts src/game/main.ts
git commit -m "feat: player physics with gravity, jump, and platform collision"
```

---

### Task 4: Pixel Art Renderer — Sprites + Particles

**Files:**
- Create: `src/game/renderer.ts`
- Modify: `src/game/main.ts`

**Step 1: Create renderer.ts with pixel art drawing functions**

This file provides:
- `drawPlayer(ctx, player)` — pixel art character with heart on chest, walk animation, facing direction
- `drawPrincess(ctx, x, y)` — pixel character with tiara
- `drawPlatform(ctx, rect)` — brick-textured platform tiles
- `drawSpike(ctx, x, y)` — triangle spike
- `drawDoor(ctx, x, y, open)` — exit door
- `drawParticle(ctx, particles)` — pixel heart particles
- `drawCRT(ctx, w, h)` — subtle scanline overlay
- Color constants matching Valentine palette

Each sprite is drawn pixel-by-pixel using `ctx.fillRect` for individual pixels (no images). Player sprite is 14x16 logical pixels, rendered at game scale.

**Step 2: Replace rect drawing in main.ts with sprite calls**

**Step 3: Verify**

Player has visible pixel art sprite with walk animation. Platforms look like retro bricks. CRT scanlines visible.

**Step 4: Commit**

```bash
git add src/game/renderer.ts src/game/main.ts
git commit -m "feat: pixel art renderer with sprites, platforms, and CRT overlay"
```

---

### Task 5: Sound System

**Files:**
- Create: `src/game/sound.ts`

**Step 1: Create sound.ts with Web Audio API**

```typescript
let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  return audioCtx;
}

// Must call on first user interaction
export function initAudio() {
  const ctx = getCtx();
  if (ctx.state === "suspended") ctx.resume();
}

function playTone(freq: number, duration: number, type: OscillatorType = "square", volume = 0.15) {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration);
}

export function sfxJump() {
  playTone(300, 0.1); setTimeout(() => playTone(450, 0.1), 50);
}

export function sfxDeath() {
  playTone(400, 0.15); setTimeout(() => playTone(250, 0.15), 100);
  setTimeout(() => playTone(150, 0.3), 200);
}

export function sfxTrap() {
  playTone(200, 0.05, "sawtooth", 0.2);
  setTimeout(() => playTone(150, 0.05, "sawtooth", 0.2), 60);
}

export function sfxDoorReach() {
  [0, 80, 160, 240].forEach((d, i) =>
    setTimeout(() => playTone(400 + i * 100, 0.15), d)
  );
}

export function sfxLevelClear() {
  const notes = [523, 659, 784, 1047]; // C5 E5 G5 C6
  notes.forEach((f, i) => setTimeout(() => playTone(f, 0.2, "square", 0.12), i * 120));
}

export function sfxFinale() {
  const melody = [523, 659, 784, 659, 784, 1047];
  melody.forEach((f, i) => setTimeout(() => playTone(f, 0.3, "triangle", 0.1), i * 200));
}
```

**Step 2: Verify**

Import sound functions, call `sfxJump()` on spacebar. Hear retro beeps.

**Step 3: Commit**

```bash
git add src/game/sound.ts
git commit -m "feat: retro sound effects with Web Audio API"
```

---

### Task 6: UI System — Start Screen, Death Messages, Level Transitions

**Files:**
- Create: `src/game/ui.ts`

**Step 1: Create ui.ts**

Provides:
- `drawStartScreen(ctx)` — title "Işıl'a Ulaş", tagline, "Başlamak için bir tuşa bas" prompt, pixel art characters decorating the screen
- `drawDeathScreen(ctx, message)` — death message with "Tekrar dene" prompt, death count display
- `drawLevelIntro(ctx, levelNum, title, subtitle)` — level number + title with fade-in, brief pause before gameplay starts
- `drawLevelClear(ctx, levelNum)` — "Bölüm X Tamamlandı!" with sparkle particles
- `drawFinale(ctx, frame)` — the animated finale: characters running together, heart explosion, Valentine's message
- `DEATH_MESSAGES` array with all Turkish death messages
- `drawHUD(ctx, level, deaths)` — top-left level indicator, death counter with skull icon

**Step 2: Verify**

Wire start screen to main.ts. Shows title screen, press any key transitions to gameplay placeholder.

**Step 3: Commit**

```bash
git add src/game/ui.ts src/game/main.ts
git commit -m "feat: UI system with start screen, death messages, HUD, and finale"
```

---

### Task 7: Level Data Structure + Level 1

**Files:**
- Create: `src/game/levels.ts`
- Modify: `src/game/main.ts`

**Step 1: Create levels.ts with level data format**

```typescript
import { Rect } from "./engine";

export type TrapType = "collapse" | "spike" | "moveDoor" | "gravityFlip" | "closingWalls" | "invisibleBlock" | "fakeExit";

export interface TrapDef {
  type: TrapType;
  rect: Rect;          // trigger/placement area
  delay?: number;       // delay before activation (seconds)
  target?: { x: number; y: number }; // for moveDoor: where door moves to
}

export interface LevelDef {
  name: string;
  subtitle: string;
  playerStart: { x: number; y: number };
  doorPos: { x: number; y: number };
  platforms: Rect[];
  traps: TrapDef[];
  killZones?: Rect[];   // instant death areas (lava, spikes)
}

export const LEVELS: LevelDef[] = [
  // LEVEL 1: "Kolay, değil mi?" — Collapsing floors
  {
    name: "Kolay, değil mi?",
    subtitle: "Bu kadar kolay olamaz...",
    playerStart: { x: 20, y: 220 },
    doorPos: { x: 440, y: 206 },
    platforms: [
      // Floor - solid start section
      { x: 0, y: 250, w: 200, h: 20 },
      // Middle section - these will collapse!
      { x: 200, y: 250, w: 40, h: 20 },
      { x: 250, y: 250, w: 40, h: 20 },
      { x: 300, y: 250, w: 40, h: 20 },
      { x: 350, y: 250, w: 40, h: 20 },
      // End section - solid
      { x: 400, y: 250, w: 80, h: 20 },
      // Floating platform (safe)
      { x: 220, y: 190, w: 60, h: 10 },
      { x: 320, y: 160, w: 60, h: 10 },
      // Walls
      { x: 0, y: 0, w: 10, h: 270 },
      { x: 470, y: 0, w: 10, h: 270 },
      // Ceiling
      { x: 0, y: 0, w: 480, h: 10 },
    ],
    traps: [
      { type: "collapse", rect: { x: 200, y: 250, w: 40, h: 20 }, delay: 0.5 },
      { type: "collapse", rect: { x: 250, y: 250, w: 40, h: 20 }, delay: 0.5 },
      { type: "collapse", rect: { x: 300, y: 250, w: 40, h: 20 }, delay: 0.5 },
      { type: "collapse", rect: { x: 350, y: 250, w: 40, h: 20 }, delay: 0.5 },
    ],
    killZones: [],
  },
  // Levels 2-5 defined in later tasks
];
```

**Step 2: Wire Level 1 into main.ts**

Implement game state machine: `"start" | "levelIntro" | "playing" | "dead" | "levelClear" | "finale"`. Load Level 1's platforms, spawn player at `playerStart`, check door collision to trigger level clear.

**Step 3: Verify**

Level 1 loads. Player spawns left side, can run right, sees door on right. Platforms visible. Door collision = level complete message.

**Step 4: Commit**

```bash
git add src/game/levels.ts src/game/main.ts
git commit -m "feat: level data structure and Level 1 layout"
```

---

### Task 8: Trap System

**Files:**
- Create: `src/game/traps.ts`
- Modify: `src/game/main.ts`

**Step 1: Create traps.ts with all trap mechanics**

```typescript
import { Rect, rectsOverlap } from "./engine";
import { TrapDef, TrapType } from "./levels";
import { Player } from "./player";

export interface TrapState {
  def: TrapDef;
  active: boolean;
  timer: number;          // time since player first triggered it
  triggered: boolean;     // has player stepped on/near it
  collapsed: boolean;     // for collapse traps
  doorMoveProgress: number; // for moveDoor
  spikeOut: boolean;      // for spike traps
  gravityFlipped: boolean;
}

export function initTraps(defs: TrapDef[]): TrapState[] {
  return defs.map((def) => ({
    def, active: true, timer: 0,
    triggered: false, collapsed: false,
    doorMoveProgress: 0, spikeOut: false,
    gravityFlipped: false,
  }));
}

export function updateTraps(
  traps: TrapState[],
  player: Player,
  platforms: Rect[],  // mutable — traps can remove platforms
  doorPos: { x: number; y: number },
  dt: number,
): { killedPlayer: boolean; doorPos: { x: number; y: number } } {
  let killedPlayer = false;
  let currentDoor = { ...doorPos };

  for (const trap of traps) {
    if (!trap.active) continue;
    const pRect: Rect = { x: player.x, y: player.y, w: player.w, h: player.h };

    switch (trap.def.type) {
      case "collapse":
        // Trigger when player stands on the platform
        if (!trap.triggered && rectsOverlap(pRect, {
          x: trap.def.rect.x, y: trap.def.rect.y - 2,
          w: trap.def.rect.w, h: 4,
        })) {
          trap.triggered = true;
          trap.timer = 0;
        }
        if (trap.triggered) {
          trap.timer += dt;
          if (trap.timer > (trap.def.delay ?? 0.5) && !trap.collapsed) {
            trap.collapsed = true;
            // Remove platform from array
            const idx = platforms.findIndex((p) =>
              p.x === trap.def.rect.x && p.y === trap.def.rect.y
            );
            if (idx >= 0) platforms.splice(idx, 1);
          }
        }
        break;

      case "spike":
        // Pop up when player is near
        if (!trap.triggered) {
          const triggerZone: Rect = {
            x: trap.def.rect.x - 30, y: trap.def.rect.y - 40,
            w: trap.def.rect.w + 60, h: trap.def.rect.h + 40,
          };
          if (rectsOverlap(pRect, triggerZone)) {
            trap.triggered = true;
            trap.timer = 0;
          }
        }
        if (trap.triggered) {
          trap.timer += dt;
          if (trap.timer > 0.2) {
            trap.spikeOut = true;
            // Check if player is on spike
            if (rectsOverlap(pRect, trap.def.rect)) {
              killedPlayer = true;
            }
          }
        }
        break;

      case "moveDoor":
        // Door moves when player gets close
        if (!trap.triggered) {
          const doorZone: Rect = { x: currentDoor.x - 40, y: 0, w: 80, h: 270 };
          if (rectsOverlap(pRect, doorZone)) {
            trap.triggered = true;
            trap.timer = 0;
          }
        }
        if (trap.triggered && trap.def.target) {
          trap.doorMoveProgress = Math.min(1, trap.doorMoveProgress + dt * 3);
          const t = trap.doorMoveProgress;
          currentDoor = {
            x: doorPos.x + (trap.def.target.x - doorPos.x) * t,
            y: doorPos.y + (trap.def.target.y - doorPos.y) * t,
          };
          if (trap.doorMoveProgress >= 1) {
            trap.active = false; // Done moving
            doorPos.x = trap.def.target.x;
            doorPos.y = trap.def.target.y;
          }
        }
        break;

      case "gravityFlip":
        if (!trap.triggered && rectsOverlap(pRect, trap.def.rect)) {
          trap.triggered = true;
          player.gravityDir = player.gravityDir === 1 ? -1 : 1;
          player.vy = 0;
        }
        break;

      case "fakeExit":
        // Show fake victory, then collapse floor
        if (!trap.triggered && rectsOverlap(pRect, trap.def.rect)) {
          trap.triggered = true;
          trap.timer = 0;
        }
        if (trap.triggered) {
          trap.timer += dt;
          // After 1.5s of "Tebrikler!", collapse everything
          if (trap.timer > 1.5 && !trap.collapsed) {
            trap.collapsed = true;
            // Remove several platforms
            platforms.length = 0; // nuclear option for final fake
            killedPlayer = true; // player dies from fall
          }
        }
        break;
    }
  }

  return { killedPlayer, doorPos: currentDoor };
}
```

**Step 2: Integrate traps into game loop in main.ts**

Initialize trap states per level, call updateTraps each frame, pass mutable platforms array. Handle `killedPlayer` result.

**Step 3: Verify**

Level 1: walk over middle platforms — they shake briefly then collapse. Player falls to death. Death message appears. Press key to respawn.

**Step 4: Commit**

```bash
git add src/game/traps.ts src/game/main.ts
git commit -m "feat: trap system with collapse, spike, door move, gravity flip, and fake exit"
```

---

### Task 9: Levels 2–5

**Files:**
- Modify: `src/game/levels.ts`

**Step 1: Add Level 2 — "Kapıyı gördün mü?"**

Door visible on right. When player approaches, it teleports to a new location (3 times). On 4th approach, door stays. Uses `moveDoor` traps with sequential targets. Also has a few spike traps near fake safe platforms.

**Step 2: Add Level 3 — "Dikkat et!"**

Normal-looking level. Hidden spikes pop up from safe-looking ground tiles. Some platforms have invisible blocks above that bonk the player during jumps. Spike placement designed to punish the "obvious" path — the actual safe path is counterintuitive.

**Step 3: Add Level 4 — "Yukarısı aşağısı"**

Standard platforming for first half. At midpoint, a `gravityFlip` trap zone flips gravity. Level design has platforms on the ceiling for the second half. Player must navigate upside-down to reach the door (which is on the ceiling).

**Step 4: Add Level 5 — "Son adım"**

Combination level. Collapsing floors near start, spike traps mid-level, a `fakeExit` that shows "Tebrikler!" then collapses the floor. After respawning, the real exit appears in a different location. This is the climax — hardest level, uses multiple trap types.

**Step 5: Verify each level**

Play through all 5 levels. Each has unique troll mechanics. Deaths trigger funny messages. Completing each transitions to the next.

**Step 6: Commit**

```bash
git add src/game/levels.ts
git commit -m "feat: levels 2-5 with moving doors, spikes, gravity flip, and fake exits"
```

---

### Task 10: Complete Game Flow + Finale

**Files:**
- Modify: `src/game/main.ts`
- Modify: `src/game/ui.ts`

**Step 1: Wire full game state machine**

States: `start → levelIntro → playing → dead → (back to playing) → levelClear → (next levelIntro or finale)`

- Track current level index, death count
- Level intro shows for 2 seconds with level name/subtitle
- Death: show death message for 1.5s, respawn
- Level clear: show celebration for 2s, advance to next
- After Level 5: transition to finale state

**Step 2: Implement finale animation in ui.ts**

- Two pixel characters start at opposite edges, walk toward center
- Meet in middle → heart explosion (pixel heart particles burst outward)
- Text fades in: "Her engeli aştım, çünkü sonunda sen varsın."
- Subtitle: "Sevgililer Günün Kutlu Olsun, Işıl'ım"
- Show death count: "Bu yolda X kere düştüm ama hep kalktım"
- "Tekrar Oyna" and "Mektuba Git" buttons (keyboard: R to replay, M for letter)

**Step 3: Verify**

Complete full playthrough from start screen through all 5 levels to finale. Finale animation plays correctly. Buttons work.

**Step 4: Commit**

```bash
git add src/game/main.ts src/game/ui.ts
git commit -m "feat: complete game flow with level transitions and Valentine's finale"
```

---

### Task 11: Mobile Touch Controls

**Files:**
- Modify: `src/game/engine.ts`
- Modify: `src/game/renderer.ts`

**Step 1: Add touch input to engine.ts**

Detect touch device. Track virtual button state for left/right/jump. Touch event listeners on canvas — map touch position to button zones (bottom-left: L/R arrows, bottom-right: jump button).

**Step 2: Draw touch buttons in renderer.ts**

Semi-transparent on-screen buttons. Only visible on touch devices. Left arrow, right arrow (bottom-left), jump button (bottom-right). Simple pixel art style matching game aesthetic.

**Step 3: Verify**

Open on phone or use Chrome DevTools mobile emulation. Touch controls visible and responsive. Can play through Level 1 with touch only.

**Step 4: Commit**

```bash
git add src/game/engine.ts src/game/renderer.ts
git commit -m "feat: mobile touch controls with on-screen buttons"
```

---

### Task 12: Polish + Final Integration

**Files:**
- Modify: `src/game/renderer.ts` (particles, screen shake)
- Modify: `src/game/main.ts` (death animation, transitions)

**Step 1: Add death animation**

Player "explodes" into pixel heart particles on death. Brief screen shake (2-3 frames). Red flash overlay.

**Step 2: Add level clear animation**

Sparkle particles around door when reached. Player does a small victory jump animation.

**Step 3: Add trap visual feedback**

- Collapsing floors: shake before collapsing
- Spikes: brief flash before popping up
- Moving door: leave a dust trail
- Gravity flip: brief screen rotation effect

**Step 4: Add princess sprite at door**

Draw the princess character (pixel art with tiara) standing next to the door in each level. She waves.

**Step 5: Verify full game**

Complete playthrough. All animations smooth, sound effects trigger correctly, mobile works, finale looks great.

**Step 6: Final commit**

```bash
git add -A
git commit -m "feat: polish — death/clear animations, trap feedback, princess sprite"
```

---

## Execution Order Summary

| Task | What | Depends On |
|------|------|------------|
| 1 | Project scaffolding | — |
| 2 | Game loop + input | Task 1 |
| 3 | Player physics | Task 2 |
| 4 | Pixel art renderer | Task 2 |
| 5 | Sound system | Task 1 |
| 6 | UI system | Task 4 |
| 7 | Level 1 data | Task 3 |
| 8 | Trap system | Task 7 |
| 9 | Levels 2–5 | Task 8 |
| 10 | Game flow + finale | Task 9 + 6 |
| 11 | Mobile touch | Task 10 |
| 12 | Polish | Task 11 |

Tasks 4 and 5 can run in parallel with Task 3. Everything else is sequential.

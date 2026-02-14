import { startGameLoop, keys, Rect, rectsOverlap, setupTouchInput, isTouchDevice, touchButtons } from "./engine";
import { createPlayer, updatePlayer, Player } from "./player";
import { LEVELS } from "./levels";
import { drawPlayer, drawPlatform, drawDoor, drawPrincess, drawSpike, drawCRT, drawHeart, COLORS } from "./renderer";
import { drawStartScreen, drawDeathScreen, drawLevelIntro, drawLevelClear, drawHUD, drawFinale, DEATH_MESSAGES } from "./ui";
import { initAudio, sfxJump, sfxDeath, sfxDoorReach, sfxLevelClear } from "./sound";
import { initTraps, updateTraps, TrapState } from "./traps";

// ── Constants ────────────────────────────────────────────────────────
const GAME_W = 480;
const GAME_H = 270;

// ── Canvas setup ─────────────────────────────────────────────────────
const canvas = document.getElementById("game") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;

function resize() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const scale = Math.min(vw / GAME_W, vh / GAME_H);
  canvas.width = GAME_W;
  canvas.height = GAME_H;
  canvas.style.width = `${Math.floor(GAME_W * scale)}px`;
  canvas.style.height = `${Math.floor(GAME_H * scale)}px`;
}

resize();
window.addEventListener("resize", resize);
setupTouchInput(canvas, GAME_W, GAME_H);

// ── Game State ───────────────────────────────────────────────────────
type GameState = "start" | "levelIntro" | "playing" | "dead" | "levelClear" | "finale";

let state: GameState = "start";
let currentLevel = 0;
let deathCount = 0;
let stateTimer = 0;
let finaleFrame = 0;
let startFrame = 0;
let currentDeathMsg = "";
let audioInitialized = false;

let player: Player = createPlayer(0, 0);
let platforms: Rect[] = [];
let doorPos = { x: 0, y: 0 };
let trapStates: TrapState[] = [];

// Princess animation frame
let princessAnimTimer = 0;
let princessAnimFrame = 0;

// Jump sound tracking
let wasOnGround = false;

// Screen shake
let shakeTimer = 0;

// Death particles
interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  life: number;
  maxLife: number;
  color: string;
}
let particles: Particle[] = [];

// Track whether a keypress happened (for state transitions)
let anyKeyPressed = false;
let deathKeyReady = false;

window.addEventListener("keydown", () => {
  anyKeyPressed = true;
});

// ── Level Loading ────────────────────────────────────────────────────
function loadLevel(index: number) {
  const level = LEVELS[index];

  // Deep copy platforms so traps can mutate them
  platforms = level.platforms.map((p) => ({ ...p }));

  // Create player at start position
  player = createPlayer(level.playerStart.x, level.playerStart.y);

  // Copy door position
  doorPos = { ...level.doorPos };

  // Initialize traps
  trapStates = initTraps(LEVELS[index].traps);

  // Reset state timer
  stateTimer = 0;
}

// ── State Transitions ────────────────────────────────────────────────
function transitionTo(newState: GameState) {
  state = newState;
  stateTimer = 0;

  if (newState === "levelIntro") {
    loadLevel(currentLevel);
  }

  if (newState === "dead") {
    currentDeathMsg = DEATH_MESSAGES[Math.floor(Math.random() * DEATH_MESSAGES.length)];
    deathCount++;
    sfxDeath();
    deathKeyReady = false;
    shakeTimer = 0.3;

    // Spawn death particles at player position
    for (let i = 0; i < 8; i++) {
      particles.push({
        x: player.x + player.w / 2,
        y: player.y + player.h / 2,
        vx: (Math.random() - 0.5) * 60,
        vy: -30 - Math.random() * 50,
        life: 1.0 + Math.random() * 0.5,
        maxLife: 1.5,
        color: Math.random() > 0.5 ? "#e8b4c8" : "#f0c888",
      });
    }
  }

  if (newState === "levelClear") {
    sfxDoorReach();
    sfxLevelClear();
  }

  if (newState === "finale") {
    finaleFrame = 0;
  }
}

// ── Door collision rect ──────────────────────────────────────────────
function getDoorRect(): Rect {
  return { x: doorPos.x, y: doorPos.y, w: 16, h: 24 };
}

function getPlayerRect(): Rect {
  return { x: player.x, y: player.y, w: player.w, h: player.h };
}

// ── Game Loop ────────────────────────────────────────────────────────
startGameLoop(
  ctx,
  // UPDATE
  (dt) => {
    stateTimer += dt;

    switch (state) {
      case "start": {
        startFrame++;
        if (anyKeyPressed) {
          anyKeyPressed = false;
          if (!audioInitialized) {
            initAudio();
            audioInitialized = true;
          }
          currentLevel = 0;
          transitionTo("levelIntro");
        }
        break;
      }

      case "levelIntro": {
        if (stateTimer >= 2) {
          state = "playing";
          stateTimer = 0;
          anyKeyPressed = false;
        }
        break;
      }

      case "playing": {
        // Update player physics
        updatePlayer(player, dt, platforms);

        // Detect jump and play sound
        if (wasOnGround && !player.onGround && player.vy < 0) {
          sfxJump();
        }
        wasOnGround = player.onGround;

        // Update traps
        const trapResult = updateTraps(trapStates, player, platforms, doorPos, dt);
        doorPos = trapResult.doorPos;
        if (trapResult.killedPlayer) {
          player.alive = false;
        }

        // Update princess animation
        princessAnimTimer += dt;
        if (princessAnimTimer > 0.3) {
          princessAnimTimer = 0;
          princessAnimFrame = (princessAnimFrame + 1) % 4;
        }

        // Check if player died (fell off screen or killed)
        if (!player.alive) {
          transitionTo("dead");
          break;
        }

        // Check door collision
        if (rectsOverlap(getPlayerRect(), getDoorRect())) {
          transitionTo("levelClear");
          break;
        }

        // Consume anyKeyPressed so it doesn't bleed into other states
        anyKeyPressed = false;
        break;
      }

      case "dead": {
        // Brief delay before allowing keypress to respawn
        if (stateTimer > 0.3) {
          deathKeyReady = true;
        }
        if (deathKeyReady && anyKeyPressed) {
          anyKeyPressed = false;
          deathKeyReady = false;
          // Respawn: reload level and go back to playing
          loadLevel(currentLevel);
          state = "playing";
          stateTimer = 0;
        }
        break;
      }

      case "levelClear": {
        if (stateTimer >= 2) {
          // Advance to next level or finale
          if (currentLevel + 1 < LEVELS.length) {
            currentLevel++;
            transitionTo("levelIntro");
          } else {
            transitionTo("finale");
          }
        }
        break;
      }

      case "finale": {
        finaleFrame++;

        // R key → restart
        if (keys["KeyR"]) {
          currentLevel = 0;
          deathCount = 0;
          transitionTo("levelIntro");
        }

        // M key → go to letter page
        if (keys["KeyM"]) {
          window.location.href = "/";
        }

        anyKeyPressed = false;
        break;
      }
    }

    // Update screen shake timer (always, outside switch)
    if (shakeTimer > 0) shakeTimer -= dt;

    // Update death particles (always, outside switch)
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 40 * dt; // slight gravity
      p.life -= dt;
      if (p.life <= 0) particles.splice(i, 1);
    }
  },
  // DRAW
  (ctx) => {
    // Clear background
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, GAME_W, GAME_H);

    // Screen shake effect
    if (shakeTimer > 0) {
      const intensity = shakeTimer / 0.3 * 4;
      ctx.save();
      ctx.translate(
        (Math.random() - 0.5) * intensity,
        (Math.random() - 0.5) * intensity,
      );
    }

    switch (state) {
      case "start": {
        drawStartScreen(ctx, GAME_W, GAME_H, startFrame);
        break;
      }

      case "levelIntro": {
        const level = LEVELS[currentLevel];
        const progress = Math.min(1, stateTimer / 2);
        drawLevelIntro(
          ctx,
          GAME_W,
          GAME_H,
          currentLevel + 1,
          level.name,
          level.subtitle,
          progress,
        );
        break;
      }

      case "playing": {
        // Draw platforms
        for (const p of platforms) {
          drawPlatform(ctx, p);
        }

        // Draw spikes from traps
        for (const trap of trapStates) {
          if (trap.def.type === "spike" && trap.spikeOut) {
            drawSpike(ctx, trap.def.rect.x, trap.def.rect.y, true);
          }
          // Shaking platforms (collapse warning)
          if (trap.shaking && !trap.collapsed) {
            const shakeX = (Math.random() - 0.5) * 3;
            const shakeY = (Math.random() - 0.5) * 2;
            ctx.save();
            ctx.translate(shakeX, shakeY);
            drawPlatform(ctx, trap.def.rect);
            ctx.restore();
          }
          // Fake exit "Tebrikler!" text
          if (trap.def.type === "fakeExit" && trap.triggered && !trap.collapsed) {
            ctx.fillStyle = COLORS.gold;
            ctx.font = "bold 14px monospace";
            ctx.textAlign = "center";
            ctx.fillText("Tebrikler!", GAME_W / 2, GAME_H / 2 - 20);
          }
        }

        // Draw door (closed — opens on reach, but we transition away)
        drawDoor(ctx, doorPos.x, doorPos.y, false);

        // Draw princess near door
        drawPrincess(ctx, doorPos.x - 18, doorPos.y - 2, princessAnimFrame);

        // Draw player
        drawPlayer(ctx, player);

        // Draw HUD
        drawHUD(ctx, currentLevel + 1, deathCount);

        // Draw touch buttons for mobile (keyboard-key style like Level Devil)
        if (isTouchDevice) {
          for (const btn of touchButtons) {
            const bx = btn.x;
            const by = btn.y;
            const bw = btn.w;
            const bh = btn.h;

            // Dark key background
            ctx.fillStyle = "#2a2a35";
            ctx.fillRect(bx, by, bw, bh);

            // Lighter top edge (simulates key bevel / border-radius hint)
            ctx.fillStyle = "#3d3d4a";
            ctx.fillRect(bx, by, bw, 2);
            ctx.fillRect(bx, by, 2, bh);

            // Darker bottom-right edge (depth shadow)
            ctx.fillStyle = "#1a1a22";
            ctx.fillRect(bx, by + bh - 2, bw, 2);
            ctx.fillRect(bx + bw - 2, by, 2, bh);

            // Subtle border
            ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
            ctx.lineWidth = 1;
            ctx.strokeRect(bx + 0.5, by + 0.5, bw - 1, bh - 1);

            // Draw pixel arrow icons (white)
            ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
            const cx = bx + bw / 2;
            const cy = by + bh / 2;

            if (btn.keyCode === "ArrowLeft") {
              // Left arrow: simple triangle pointing left
              ctx.beginPath();
              ctx.moveTo(cx - 5, cy);
              ctx.lineTo(cx + 3, cy - 5);
              ctx.lineTo(cx + 3, cy + 5);
              ctx.closePath();
              ctx.fill();
            } else if (btn.keyCode === "ArrowRight") {
              // Right arrow: simple triangle pointing right
              ctx.beginPath();
              ctx.moveTo(cx + 5, cy);
              ctx.lineTo(cx - 3, cy - 5);
              ctx.lineTo(cx - 3, cy + 5);
              ctx.closePath();
              ctx.fill();
            } else if (btn.keyCode === "Space") {
              // Up arrow: simple triangle pointing up (jump)
              ctx.beginPath();
              ctx.moveTo(cx, cy - 6);
              ctx.lineTo(cx - 6, cy + 4);
              ctx.lineTo(cx + 6, cy + 4);
              ctx.closePath();
              ctx.fill();
            }
          }
        }

        // Draw CRT overlay on top
        drawCRT(ctx, GAME_W, GAME_H);
        break;
      }

      case "dead": {
        // Draw the level behind the death overlay
        for (const p of platforms) {
          drawPlatform(ctx, p);
        }
        // Draw traps in dead state so level stays visible
        for (const trap of trapStates) {
          if (trap.def.type === "spike" && trap.spikeOut) {
            drawSpike(ctx, trap.def.rect.x, trap.def.rect.y, true);
          }
          if (trap.shaking && !trap.collapsed) {
            const shakeX = (Math.random() - 0.5) * 3;
            const shakeY = (Math.random() - 0.5) * 2;
            ctx.save();
            ctx.translate(shakeX, shakeY);
            drawPlatform(ctx, trap.def.rect);
            ctx.restore();
          }
          if (trap.def.type === "fakeExit" && trap.triggered && !trap.collapsed) {
            ctx.fillStyle = COLORS.gold;
            ctx.font = "bold 14px monospace";
            ctx.textAlign = "center";
            ctx.fillText("Tebrikler!", GAME_W / 2, GAME_H / 2 - 20);
          }
        }
        drawDoor(ctx, doorPos.x, doorPos.y, false);
        drawPrincess(ctx, doorPos.x - 18, doorPos.y - 2, princessAnimFrame);
        drawHUD(ctx, currentLevel + 1, deathCount);
        drawCRT(ctx, GAME_W, GAME_H);

        // Death overlay on top
        drawDeathScreen(ctx, GAME_W, GAME_H, currentDeathMsg, deathCount);
        break;
      }

      case "levelClear": {
        // Draw level behind the clear overlay
        for (const p of platforms) {
          drawPlatform(ctx, p);
        }
        drawDoor(ctx, doorPos.x, doorPos.y, true);
        drawPrincess(ctx, doorPos.x - 18, doorPos.y - 2, princessAnimFrame);
        drawPlayer(ctx, player);
        drawCRT(ctx, GAME_W, GAME_H);

        // Level clear overlay
        const progress = Math.min(1, stateTimer / 2);
        drawLevelClear(ctx, GAME_W, GAME_H, currentLevel + 1, progress);
        break;
      }

      case "finale": {
        drawFinale(ctx, GAME_W, GAME_H, finaleFrame);
        drawCRT(ctx, GAME_W, GAME_H);
        break;
      }
    }

    // Draw death particles (on top of everything)
    for (const p of particles) {
      const alpha = Math.max(0, p.life / p.maxLife);
      ctx.globalAlpha = alpha;
      drawHeart(ctx, p.x - 4, p.y - 3, 2, p.color);
    }
    ctx.globalAlpha = 1;

    // Restore screen shake transform
    if (shakeTimer > 0) {
      ctx.restore();
    }
  },
);

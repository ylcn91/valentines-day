import { startGameLoop, keys, Rect, rectsOverlap } from "./engine";
import { createPlayer, updatePlayer, Player } from "./player";
import { LEVELS } from "./levels";
import { drawPlayer, drawPlatform, drawDoor, drawPrincess, drawHeart, drawCRT, COLORS } from "./renderer";
import { drawStartScreen, drawDeathScreen, drawLevelIntro, drawLevelClear, drawHUD, drawFinale, DEATH_MESSAGES } from "./ui";
import { initAudio, sfxJump, sfxDeath, sfxDoorReach, sfxLevelClear } from "./sound";

// ── Constants ────────────────────────────────────────────────────────
const GAME_W = 480;
const GAME_H = 270;

// ── Canvas setup ─────────────────────────────────────────────────────
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

// Princess animation frame
let princessAnimTimer = 0;
let princessAnimFrame = 0;

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
  },
  // DRAW
  (ctx) => {
    // Clear background
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, GAME_W, GAME_H);

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

        // Draw door (closed — opens on reach, but we transition away)
        drawDoor(ctx, doorPos.x, doorPos.y, false);

        // Draw princess near door
        drawPrincess(ctx, doorPos.x - 18, doorPos.y - 2, princessAnimFrame);

        // Draw player
        drawPlayer(ctx, player);

        // Draw HUD
        drawHUD(ctx, currentLevel + 1, deathCount);

        // Draw CRT overlay on top
        drawCRT(ctx, GAME_W, GAME_H);
        break;
      }

      case "dead": {
        // Draw the level behind the death overlay
        for (const p of platforms) {
          drawPlatform(ctx, p);
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
  },
);

import { startGameLoop, keys, Rect } from "./engine";
import { createPlayer, updatePlayer } from "./player";

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

// Test platforms
const platforms: Rect[] = [
  { x: 0, y: 250, w: GAME_W, h: 20 },       // floor
  { x: 180, y: 190, w: 80, h: 10 },           // floating platform
];

let player = createPlayer(50, 220);

// Listen for respawn keypress
let deathKeyReady = false;
window.addEventListener("keydown", () => {
  if (!player.alive && deathKeyReady) {
    player = createPlayer(50, 220);
    deathKeyReady = false;
  }
});

startGameLoop(ctx,
  (dt) => {
    updatePlayer(player, dt, platforms);

    // Allow respawn after a brief moment so the death key doesn't fire instantly
    if (!player.alive) {
      deathKeyReady = true;
    }
  },
  (ctx) => {
    // Clear
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 0, GAME_W, GAME_H);

    // Draw platforms
    ctx.fillStyle = "#c4697a";
    for (const p of platforms) {
      ctx.fillRect(p.x, p.y, p.w, p.h);
    }

    // Draw player
    if (player.alive) {
      ctx.fillStyle = "#e8b4c8";
      ctx.fillRect(player.x, player.y, player.w, player.h);
    } else {
      // Death screen
      ctx.fillStyle = "#e8b4c8";
      ctx.font = "16px monospace";
      ctx.textAlign = "center";
      ctx.fillText("Öldün! Bir tuşa bas", GAME_W / 2, GAME_H / 2);
    }
  }
);

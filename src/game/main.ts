import { startGameLoop, keys } from "./engine";

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

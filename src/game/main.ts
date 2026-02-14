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

ctx.fillStyle = "#1a1a2e";
ctx.fillRect(0, 0, GAME_W, GAME_H);
ctx.fillStyle = "#e8b4c8";
ctx.font = "16px monospace";
ctx.textAlign = "center";
ctx.fillText("Işıl'a Ulaş — Yükleniyor...", GAME_W / 2, GAME_H / 2);

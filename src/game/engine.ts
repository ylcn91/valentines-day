// --- Input ---
export const keys: Record<string, boolean> = {};

window.addEventListener("keydown", (e) => {
  keys[e.code] = true;
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
    const dt = Math.min((now - last) / 1000, 0.05); // cap at 50ms
    last = now;
    update(dt);
    draw(ctx);
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

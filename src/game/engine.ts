// --- Input ---
export const keys: Record<string, boolean> = {};

window.addEventListener("keydown", (e) => {
  keys[e.code] = true;
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.code)) {
    e.preventDefault();
  }
});
window.addEventListener("keyup", (e) => { keys[e.code] = false; });

// --- Touch Input ---
export let isTouchDevice = false;

export function setupTouchInput(canvas: HTMLCanvasElement) {
  // Detect touch and show HTML controls
  const controls = document.getElementById("touch-controls");

  function showControls() {
    isTouchDevice = true;
    if (controls) controls.style.display = "flex";
  }

  // Show controls on first touch anywhere
  canvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    showControls();
    // Signal anyKeyPressed for state transitions
    window.dispatchEvent(new KeyboardEvent("keydown", { code: "" }));
  }, { passive: false, once: true });

  // Also catch subsequent canvas touches for state transitions (start/death screens)
  canvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    window.dispatchEvent(new KeyboardEvent("keydown", { code: "" }));
  }, { passive: false });

  // Wire up HTML touch buttons
  if (controls) {
    const buttons = controls.querySelectorAll<HTMLButtonElement>(".touch-btn");
    buttons.forEach((btn) => {
      const keyCode = btn.dataset.key;
      if (!keyCode) return;

      btn.addEventListener("touchstart", (e) => {
        e.preventDefault();
        e.stopPropagation();
        showControls();
        keys[keyCode] = true;
        // Also signal anyKeyPressed for state transitions
        window.dispatchEvent(new KeyboardEvent("keydown", { code: keyCode }));
      }, { passive: false });

      btn.addEventListener("touchend", (e) => {
        e.preventDefault();
        e.stopPropagation();
        keys[keyCode] = false;
      }, { passive: false });

      btn.addEventListener("touchcancel", (e) => {
        e.preventDefault();
        keys[keyCode] = false;
      }, { passive: false });
    });
  }
}

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

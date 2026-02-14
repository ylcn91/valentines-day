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

export interface TouchButton {
  label: string;
  x: number; y: number; w: number; h: number;
  keyCode: string; // which key to simulate
}

export const touchButtons: TouchButton[] = [
  { label: "\u25C0", x: 10, y: 220, w: 40, h: 40, keyCode: "ArrowLeft" },
  { label: "\u25B6", x: 60, y: 220, w: 40, h: 40, keyCode: "ArrowRight" },
  { label: "\u25B2", x: 400, y: 210, w: 60, h: 50, keyCode: "Space" },
];

// Track which keys are being held by touch so we can clear them properly
const touchHeldKeys = new Set<string>();

export function setupTouchInput(
  canvas: HTMLCanvasElement,
  gameW: number,
  gameH: number,
) {
  function toCanvasCoords(touch: Touch): { cx: number; cy: number } {
    const rect = canvas.getBoundingClientRect();
    const cx = (touch.clientX - rect.left) / (rect.width / gameW);
    const cy = (touch.clientY - rect.top) / (rect.height / gameH);
    return { cx, cy };
  }

  function hitTest(cx: number, cy: number): TouchButton | null {
    for (const btn of touchButtons) {
      if (cx >= btn.x && cx <= btn.x + btn.w && cy >= btn.y && cy <= btn.y + btn.h) {
        return btn;
      }
    }
    return null;
  }

  canvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    isTouchDevice = true;

    // Signal anyKeyPressed for state transitions (dispatched as a keydown event)
    window.dispatchEvent(new KeyboardEvent("keydown", { code: "" }));

    for (let i = 0; i < e.changedTouches.length; i++) {
      const { cx, cy } = toCanvasCoords(e.changedTouches[i]);
      const btn = hitTest(cx, cy);
      if (btn) {
        keys[btn.keyCode] = true;
        touchHeldKeys.add(btn.keyCode);
      }
    }
  }, { passive: false });

  canvas.addEventListener("touchend", (e) => {
    e.preventDefault();
    // Clear all touch-simulated keys
    for (const keyCode of touchHeldKeys) {
      keys[keyCode] = false;
    }
    touchHeldKeys.clear();
  }, { passive: false });

  canvas.addEventListener("touchcancel", (e) => {
    e.preventDefault();
    // Clear all touch-simulated keys
    for (const keyCode of touchHeldKeys) {
      keys[keyCode] = false;
    }
    touchHeldKeys.clear();
  }, { passive: false });
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

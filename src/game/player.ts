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

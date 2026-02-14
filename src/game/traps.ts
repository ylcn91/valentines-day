import { Rect, rectsOverlap } from "./engine";
import { TrapDef } from "./levels";
import { Player } from "./player";
import { sfxTrap } from "./sound";

export interface TrapState {
  def: TrapDef;
  active: boolean;
  timer: number;
  triggered: boolean;
  collapsed: boolean;
  doorMoveProgress: number;
  spikeOut: boolean;
  gravityFlipped: boolean;
  shaking: boolean;  // visual feedback before collapse
}

export function initTraps(defs: TrapDef[]): TrapState[] {
  return defs.map((def) => ({
    def,
    active: true,
    timer: 0,
    triggered: false,
    collapsed: false,
    doorMoveProgress: 0,
    spikeOut: false,
    gravityFlipped: false,
    shaking: false,
  }));
}

export function updateTraps(
  traps: TrapState[],
  player: Player,
  platforms: Rect[],
  doorPos: { x: number; y: number },
  dt: number,
): { killedPlayer: boolean; doorPos: { x: number; y: number } } {
  let killedPlayer = false;
  let currentDoor = { ...doorPos };

  for (const trap of traps) {
    if (!trap.active) continue;
    const pRect: Rect = { x: player.x, y: player.y, w: player.w, h: player.h };

    switch (trap.def.type) {
      case "collapse": {
        // Trigger when player stands on the collapsing platform
        if (!trap.triggered) {
          const standZone: Rect = {
            x: trap.def.rect.x,
            y: trap.def.rect.y - 4,
            w: trap.def.rect.w,
            h: 6,
          };
          if (rectsOverlap(pRect, standZone) && player.onGround) {
            trap.triggered = true;
            trap.timer = 0;
            trap.shaking = true;
          }
        }
        if (trap.triggered && !trap.collapsed) {
          trap.timer += dt;
          if (trap.timer > (trap.def.delay ?? 0.5)) {
            trap.collapsed = true;
            trap.shaking = false;
            sfxTrap();
            // Remove the platform from the mutable array
            const idx = platforms.findIndex(
              (p) => p.x === trap.def.rect.x && p.y === trap.def.rect.y &&
                     p.w === trap.def.rect.w && p.h === trap.def.rect.h
            );
            if (idx >= 0) platforms.splice(idx, 1);
          }
        }
        break;
      }

      case "spike": {
        // Pop up spikes when player approaches
        if (!trap.triggered) {
          const triggerZone: Rect = {
            x: trap.def.rect.x - 30,
            y: trap.def.rect.y - 40,
            w: trap.def.rect.w + 60,
            h: trap.def.rect.h + 40,
          };
          if (rectsOverlap(pRect, triggerZone)) {
            trap.triggered = true;
            trap.timer = 0;
          }
        }
        if (trap.triggered) {
          trap.timer += dt;
          if (trap.timer > 0.2 && !trap.spikeOut) {
            trap.spikeOut = true;
            sfxTrap();
          }
          if (trap.spikeOut && rectsOverlap(pRect, trap.def.rect)) {
            killedPlayer = true;
          }
        }
        break;
      }

      case "moveDoor": {
        // Door slides away when player gets close
        if (!trap.triggered) {
          const doorZone: Rect = {
            x: currentDoor.x - 40, y: 0, w: 80, h: 270,
          };
          if (rectsOverlap(pRect, doorZone)) {
            trap.triggered = true;
            trap.timer = 0;
            sfxTrap();
          }
        }
        if (trap.triggered && trap.def.target) {
          trap.doorMoveProgress = Math.min(1, trap.doorMoveProgress + dt * 3);
          const t = easeOutQuad(trap.doorMoveProgress);
          // Interpolate from where door WAS to target
          currentDoor = {
            x: doorPos.x + (trap.def.target.x - doorPos.x) * t,
            y: doorPos.y + (trap.def.target.y - doorPos.y) * t,
          };
          if (trap.doorMoveProgress >= 1) {
            trap.active = false;
            // Update the canonical door position for next trap
            doorPos.x = trap.def.target.x;
            doorPos.y = trap.def.target.y;
            currentDoor = { ...doorPos };
          }
        }
        break;
      }

      case "gravityFlip": {
        if (!trap.triggered && rectsOverlap(pRect, trap.def.rect)) {
          trap.triggered = true;
          player.gravityDir = player.gravityDir === 1 ? -1 : 1;
          player.vy = 0;
          sfxTrap();
        }
        break;
      }

      case "fakeExit": {
        if (!trap.triggered && rectsOverlap(pRect, trap.def.rect)) {
          trap.triggered = true;
          trap.timer = 0;
          sfxTrap();
        }
        if (trap.triggered && !trap.collapsed) {
          trap.timer += dt;
          // After showing fake "Tebrikler!", collapse floor
          if (trap.timer > 1.5) {
            trap.collapsed = true;
            // Remove several platforms near the fake exit
            for (let i = platforms.length - 1; i >= 0; i--) {
              const p = platforms[i];
              // Remove platforms that are within range of the fake exit
              if (Math.abs(p.x - trap.def.rect.x) < 150 && p.y > 200) {
                platforms.splice(i, 1);
              }
            }
          }
        }
        break;
      }
    }
  }

  return { killedPlayer, doorPos: currentDoor };
}

// Helper for smooth door movement
function easeOutQuad(t: number): number {
  return t * (2 - t);
}

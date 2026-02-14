import { Rect } from "./engine";

export type TrapType = "collapse" | "spike" | "moveDoor" | "gravityFlip" | "closingWalls" | "invisibleBlock" | "fakeExit";

export interface TrapDef {
  type: TrapType;
  rect: Rect;
  delay?: number;
  target?: { x: number; y: number };
}

export interface LevelDef {
  name: string;
  subtitle: string;
  playerStart: { x: number; y: number };
  doorPos: { x: number; y: number };
  platforms: Rect[];
  traps: TrapDef[];
  killZones?: Rect[];
}

export const LEVELS: LevelDef[] = [
  // LEVEL 1: "Kolay, değil mi?" — Collapsing floors
  {
    name: "Kolay, değil mi?",
    subtitle: "Bu kadar kolay olamaz...",
    playerStart: { x: 20, y: 220 },
    doorPos: { x: 440, y: 222 },
    platforms: [
      // Floor - solid start section
      { x: 0, y: 250, w: 200, h: 20 },
      // Middle section - these will collapse!
      { x: 200, y: 250, w: 40, h: 20 },
      { x: 250, y: 250, w: 40, h: 20 },
      { x: 300, y: 250, w: 40, h: 20 },
      { x: 350, y: 250, w: 40, h: 20 },
      // End section - solid
      { x: 400, y: 250, w: 80, h: 20 },
      // Floating platforms (safe route)
      { x: 220, y: 190, w: 60, h: 10 },
      { x: 320, y: 160, w: 60, h: 10 },
      // Walls
      { x: 0, y: 0, w: 10, h: 270 },
      { x: 470, y: 0, w: 10, h: 270 },
      // Ceiling
      { x: 0, y: 0, w: 480, h: 10 },
    ],
    traps: [
      { type: "collapse", rect: { x: 200, y: 250, w: 40, h: 20 }, delay: 0.5 },
      { type: "collapse", rect: { x: 250, y: 250, w: 40, h: 20 }, delay: 0.5 },
      { type: "collapse", rect: { x: 300, y: 250, w: 40, h: 20 }, delay: 0.5 },
      { type: "collapse", rect: { x: 350, y: 250, w: 40, h: 20 }, delay: 0.5 },
    ],
    killZones: [],
  },
];

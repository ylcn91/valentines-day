import { Rect } from "./engine";

export type TrapType = "collapse" | "spike" | "moveDoor" | "gravityFlip" | "closingWalls" | "invisibleBlock" | "fakeExit" | "boost";

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

  // LEVEL 2: "Kapıyı gördün mü?" — Moving Door
  {
    name: "Dur, nereye?",
    subtitle: "Kapı nereye gitti?!",
    playerStart: { x: 20, y: 220 },
    doorPos: { x: 440, y: 222 },
    platforms: [
      // === Floor sections with gaps ===
      // Left floor (player starts here)
      { x: 0, y: 250, w: 120, h: 20 },
      // Gap — must jump
      // Middle floor section
      { x: 160, y: 250, w: 80, h: 20 },
      // Gap — must jump
      // Right floor section (door starts here)
      { x: 290, y: 250, w: 90, h: 20 },
      // Far right floor
      { x: 400, y: 250, w: 80, h: 20 },

      // === High platforms (for reaching door at position 2: upper-left) ===
      // Stepping stones going up-left
      { x: 100, y: 200, w: 50, h: 10 },
      { x: 40, y: 155, w: 60, h: 10 },
      // Upper-left platform where door moves first
      { x: 15, y: 110, w: 70, h: 10 },

      // === Mid-height platforms (for traversal) ===
      { x: 180, y: 170, w: 60, h: 10 },
      { x: 280, y: 140, w: 60, h: 10 },
      { x: 370, y: 170, w: 50, h: 10 },

      // === Lower-right platform (door position 3) ===
      { x: 340, y: 210, w: 70, h: 10 },

      // === Walls ===
      { x: 0, y: 0, w: 10, h: 270 },
      { x: 470, y: 0, w: 10, h: 270 },
      // Ceiling
      { x: 0, y: 0, w: 480, h: 10 },
    ],
    traps: [
      // Door moves 3 times! Each triggers sequentially.
      // Move 1: right floor → upper-left platform
      { type: "moveDoor", rect: { x: 420, y: 0, w: 60, h: 270 }, target: { x: 30, y: 86 } },
      // Move 2: upper-left → lower-right platform
      { type: "moveDoor", rect: { x: 10, y: 0, w: 80, h: 270 }, target: { x: 355, y: 186 } },
      // Move 3: lower-right → back near original position on far right floor
      { type: "moveDoor", rect: { x: 330, y: 0, w: 90, h: 270 }, target: { x: 440, y: 226 } },

      // Sneaky spikes in landing zones
      { type: "spike", rect: { x: 180, y: 240, w: 12, h: 10 } },
      { type: "spike", rect: { x: 310, y: 240, w: 12, h: 10 } },
    ],
    killZones: [],
  },

  // LEVEL 3: "Dikkat et!" — Hidden Spikes
  {
    name: "Dikkat et!",
    subtitle: "Görünen köy kılavuz istemez... mi?",
    playerStart: { x: 20, y: 220 },
    doorPos: { x: 440, y: 222 },
    platforms: [
      // === Floor — looks like one continuous path, but full of spike traps ===
      // Section 1: safe start
      { x: 0, y: 250, w: 60, h: 20 },
      // Section 2: spike zone floor
      { x: 60, y: 250, w: 40, h: 20 },
      // Section 3: brief safe
      { x: 100, y: 250, w: 30, h: 20 },
      // Section 4: spike zone
      { x: 130, y: 250, w: 50, h: 20 },
      // Section 5: spike zone
      { x: 180, y: 250, w: 40, h: 20 },
      // Section 6: looks safe, has spike
      { x: 220, y: 250, w: 40, h: 20 },
      // Section 7: spike zone
      { x: 260, y: 250, w: 50, h: 20 },
      // Section 8: small safe
      { x: 310, y: 250, w: 30, h: 20 },
      // Section 9: spike zone
      { x: 340, y: 250, w: 50, h: 20 },
      // Section 10: safe end with door
      { x: 400, y: 250, w: 80, h: 20 },

      // === Upper route — the ACTUAL safe path (less obvious) ===
      // Player must jump up to these to avoid floor spikes
      { x: 50, y: 200, w: 45, h: 10 },
      { x: 120, y: 170, w: 50, h: 10 },
      { x: 200, y: 145, w: 50, h: 10 },
      { x: 280, y: 165, w: 50, h: 10 },
      { x: 360, y: 190, w: 50, h: 10 },

      // === Decoy mid-platforms (some have spikes near edges!) ===
      { x: 155, y: 210, w: 50, h: 10 },
      { x: 300, y: 200, w: 50, h: 10 },

      // === Walls ===
      { x: 0, y: 0, w: 10, h: 270 },
      { x: 470, y: 0, w: 10, h: 270 },
      // Ceiling
      { x: 0, y: 0, w: 480, h: 10 },
    ],
    traps: [
      // === Floor spike traps — the "obvious" path is deadly ===
      // Walking along the floor triggers these hidden spikes
      { type: "spike", rect: { x: 70, y: 240, w: 12, h: 10 } },
      { type: "spike", rect: { x: 88, y: 240, w: 12, h: 10 } },
      { type: "spike", rect: { x: 140, y: 240, w: 12, h: 10 } },
      { type: "spike", rect: { x: 158, y: 240, w: 12, h: 10 } },
      { type: "spike", rect: { x: 190, y: 240, w: 12, h: 10 } },
      { type: "spike", rect: { x: 230, y: 240, w: 12, h: 10 } },
      { type: "spike", rect: { x: 275, y: 240, w: 12, h: 10 } },
      { type: "spike", rect: { x: 295, y: 240, w: 12, h: 10 } },
      { type: "spike", rect: { x: 350, y: 240, w: 12, h: 10 } },
      { type: "spike", rect: { x: 370, y: 240, w: 12, h: 10 } },

      // === Spikes on decoy mid-platforms — troll anyone who takes the "shortcut" ===
      { type: "spike", rect: { x: 160, y: 200, w: 12, h: 10 } },
      { type: "spike", rect: { x: 338, y: 190, w: 12, h: 10 } },
    ],
    killZones: [],
  },

  // LEVEL 4: "Acele et!" — Collapsing path + spikes
  {
    name: "Acele et!",
    subtitle: "Yavaş olan kaybeder...",
    playerStart: { x: 20, y: 220 },
    doorPos: { x: 440, y: 222 },
    platforms: [
      // Floor — collapses in sections, forcing speed
      { x: 0, y: 250, w: 80, h: 20 },
      { x: 80, y: 250, w: 60, h: 20 },
      { x: 140, y: 250, w: 60, h: 20 },
      { x: 200, y: 250, w: 60, h: 20 },
      { x: 260, y: 250, w: 60, h: 20 },
      // Safe end platform
      { x: 400, y: 250, w: 80, h: 20 },

      // Upper escape route (if floor collapses)
      { x: 120, y: 190, w: 60, h: 10 },
      { x: 260, y: 160, w: 60, h: 10 },

      // Walls
      { x: 0, y: 0, w: 10, h: 270 },
      { x: 470, y: 0, w: 10, h: 270 },
      // Ceiling
      { x: 0, y: 0, w: 480, h: 10 },
    ],
    traps: [
      // Floor collapses fast — run or fall!
      { type: "collapse", rect: { x: 80, y: 250, w: 60, h: 20 }, delay: 0.3 },
      { type: "collapse", rect: { x: 140, y: 250, w: 60, h: 20 }, delay: 0.3 },
      { type: "collapse", rect: { x: 200, y: 250, w: 60, h: 20 }, delay: 0.3 },
      { type: "collapse", rect: { x: 260, y: 250, w: 60, h: 20 }, delay: 0.3 },

      // Speed boost at the start to help outrun collapses
      { type: "boost", rect: { x: 55, y: 240, w: 20, h: 10 } },

      // Spikes guarding the end
      { type: "spike", rect: { x: 350, y: 240, w: 12, h: 10 } },
      { type: "spike", rect: { x: 375, y: 240, w: 12, h: 10 } },
    ],
    killZones: [],
  },

  // LEVEL 5: "Son adım" — Fake Exit + Real Path
  {
    name: "Son adım",
    subtitle: "Her şey burada bitiyor...",
    playerStart: { x: 20, y: 220 },
    doorPos: { x: 440, y: 222 },
    platforms: [
      // Floor — one continuous stretch
      { x: 0, y: 250, w: 480, h: 20 },

      // Mid platform with fake door
      { x: 300, y: 200, w: 60, h: 10 },

      // Upper path to real door (simple staircase)
      { x: 100, y: 180, w: 60, h: 10 },
      { x: 250, y: 140, w: 60, h: 10 },
      { x: 400, y: 100, w: 70, h: 10 },

      // Walls
      { x: 0, y: 0, w: 10, h: 270 },
      { x: 470, y: 0, w: 10, h: 270 },
      // Ceiling
      { x: 0, y: 0, w: 480, h: 10 },
    ],
    traps: [
      // Spikes along the floor to make walking risky
      { type: "spike", rect: { x: 180, y: 240, w: 12, h: 10 } },
      { type: "spike", rect: { x: 220, y: 240, w: 12, h: 10 } },

      // Fake exit on the mid platform
      { type: "fakeExit", rect: { x: 315, y: 203, w: 16, h: 24 } },

      // After fake exit, door moves up to top platform
      { type: "moveDoor", rect: { x: 410, y: 0, w: 70, h: 270 }, target: { x: 420, y: 76 } },
    ],
    killZones: [],
  },
];

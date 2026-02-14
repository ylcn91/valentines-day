# "Işıl'a Ulaş" — Valentine's Day Troll Platformer

## Overview

A 5-level Level Devil-style troll platformer where the player (Yalçın) must reach the door/princess (Işıl) at the end of each level. Levels actively betray the player with collapsing floors, moving doors, hidden spikes, gravity flips, and fake victories. Every death shows a funny Turkish message. After all 5 levels, a heartfelt Valentine's finale screen.

**Title:** "Işıl'a Ulaş" (Reach Işıl)
**Tagline:** "Sana ulaşmak bu kadar zor olmamalıydı..."
**Language:** All UI/text in Turkish

## Architecture

```
valentines-day/
├── game.html              ← Separate entry point
├── src/game/
│   ├── main.ts            ← Bootstrap, canvas setup, game loop init
│   ├── engine.ts          ← Game loop, physics, AABB collision
│   ├── player.ts          ← Player sprite, movement, animation states
│   ├── levels.ts          ← Level data (platforms, traps, triggers, door position)
│   ├── traps.ts           ← Trap mechanics (collapse, spike, move, gravity, fake)
│   ├── renderer.ts        ← Pixel art rendering, sprites, particles, CRT overlay
│   ├── sound.ts           ← Web Audio API retro sound effects
│   └── ui.ts              ← Start screen, death messages, level transitions, finale
```

- **Tech:** Pure TypeScript + HTML5 Canvas, no game engine
- **Build:** Vite multi-page app (game.html as second entry)
- **No image assets** — all sprites drawn programmatically with pixel art functions

## Game Mechanics

### Player
- Arrow keys / WASD to move, Space/Up to jump
- Touch controls for mobile (on-screen L/R buttons + jump)
- Simple AABB collision detection
- Instant respawn at level start on death

### Troll Trap Catalog

| Trap              | Description                                           |
|-------------------|-------------------------------------------------------|
| Çöken Zemin       | Floor tiles collapse 0.5s after player steps on them  |
| Sahte Kapı        | Door slides away as player approaches                 |
| Ani Dikenler      | Spikes pop up from seemingly safe ground              |
| Yer Çekimi Şakası | Gravity flips mid-level                               |
| Daralan Duvarlar  | Walls slowly close in, forcing speed                  |
| Görünmez Bloklar  | Invisible blocks appear only on collision             |
| Sahte Çıkış       | Fake "Tebrikler!" message then floor drops            |

## Level Design

| Lv | Theme               | Key Troll(s)                        | Subtitle                     |
|----|---------------------|-------------------------------------|------------------------------|
| 1  | "Kolay, değil mi?"  | Collapsing floors after midpoint    | "Bu kadar kolay olamaz..."   |
| 2  | "Kapıyı gördün mü?" | Door runs away 3 times              | "Kapı senden kaçıyor!"       |
| 3  | "Dikkat et!"         | Hidden spikes + fake safe zones     | "Güvenli yer yok!"           |
| 4  | "Yukarısı aşağısı"  | Gravity flip halfway through        | "Yer çekimi: bugün yok"      |
| 5  | "Son adım"          | All traps combined + fake victory   | "Neredeyse... ya da değil"   |

## Death Messages (rotating)

- "Ahhh! Tekrar dene, aşkım bekliyor!"
- "Bu sefer olacak... belki."
- "Işıl bunu görse gülmekten kırılırdı."
- "Pes etme! Aşk engel tanımaz... ama dikenler tanır."
- "404: Hayatta kalma becerisi bulunamadı"
- "Bir daha! Aşk sabır ister..."
- "Bu oyun seni trollüyor ama aşk gerçek!"
- "Merak etme, Işıl hâlâ bekliyor"
- "Düşmek normal, kalkmak aşk!"

## Visual Style

- **Pixel art:** 16-bit aesthetic (SNES era), 16x16 / 32x32 sprites
- **Palette:** Dark bg (#1a1a2e), Valentine pinks (#e8b4c8, #c4697a), gold (#f0c888)
- **Player:** Small pixel character with heart on chest
- **Princess:** Pixel character with tiara, waiting at exit door
- **Effects:** Pixel hearts on death, sparkles on level complete
- **CRT overlay:** Subtle scan-line effect for retro feel

## Sound Effects (Web Audio API)

All generated procedurally using Web Audio API oscillators — no audio files needed.

| Event         | Sound                              |
|---------------|------------------------------------|
| Jump          | Short ascending beep               |
| Death         | Descending wah-wah                 |
| Trap trigger  | Quick alert buzz                   |
| Door reach    | Victory jingle (ascending arpeggio)|
| Level clear   | 8-bit fanfare                      |
| Finale        | Longer celebratory melody          |

## Finale Screen

After beating Level 5:
1. Pixel characters run toward each other, meet in center
2. Heart explosion particle animation
3. Text: "Her engeli aştım, çünkü sonunda sen varsın."
4. Sub: "Sevgililer Günün Kutlu Olsun, Işıl'ım"
5. "Tekrar Oyna" button
6. Link back to the letter/card experience

## Mobile Support

- Canvas scales to viewport with aspect ratio preservation
- Touch controls: semi-transparent on-screen buttons (left, right, jump)
- Touch buttons appear automatically on touch devices

## Integration

- Separate `game.html` entry point in Vite multi-page config
- No shared code with existing Valentine card (independent)
- Can be deployed and shared as a standalone link

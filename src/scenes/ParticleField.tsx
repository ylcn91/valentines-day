import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  random,
} from "remotion";

const PARTICLE_COUNT = 80;

type Particle = {
  x: number;
  y: number;
  size: number;
  speed: number;
  phase: number;
  isGold: boolean;
};

const createParticles = (): Particle[] => {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    x: random(`px-${i}`) * 100,
    y: random(`py-${i}`) * 100,
    size: 1 + random(`ps-${i}`) * 3,
    speed: 0.2 + random(`psp-${i}`) * 0.5,
    phase: random(`pp-${i}`) * Math.PI * 2,
    isGold: random(`pg-${i}`) > 0.4,
  }));
};

const particles = createParticles();

export const ParticleField: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Particle intensity grows as the video progresses
  const progress = frame / durationInFrames;
  const intensity = interpolate(progress, [0, 0.3, 0.7, 1], [0.15, 0.3, 0.6, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ zIndex: 0 }}>
      {particles.map((p, i) => {
        const time = frame / fps;
        const x = (p.x + Math.sin(time * p.speed + p.phase) * 3) % 100;
        const y = (p.y + time * p.speed * 2) % 100;
        const flicker = 0.4 + 0.6 * Math.sin(time * 2 + p.phase);
        const opacity = flicker * intensity;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${x}%`,
              top: `${y}%`,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              backgroundColor: p.isGold
                ? `rgba(240, 200, 136, ${opacity})`
                : `rgba(232, 180, 200, ${opacity})`,
              boxShadow: p.isGold
                ? `0 0 ${p.size * 3}px rgba(240, 200, 136, ${opacity * 0.5})`
                : `0 0 ${p.size * 3}px rgba(232, 180, 200, ${opacity * 0.5})`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

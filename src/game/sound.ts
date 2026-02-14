let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  return audioCtx;
}

export function initAudio() {
  const ctx = getCtx();
  if (ctx.state === "suspended") ctx.resume();
}

function playTone(freq: number, duration: number, type: OscillatorType = "square", volume = 0.15) {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration);
}

export function sfxJump() {
  playTone(300, 0.1); setTimeout(() => playTone(450, 0.1), 50);
}

export function sfxDeath() {
  playTone(400, 0.15); setTimeout(() => playTone(250, 0.15), 100);
  setTimeout(() => playTone(150, 0.3), 200);
}

export function sfxTrap() {
  playTone(200, 0.05, "sawtooth", 0.2);
  setTimeout(() => playTone(150, 0.05, "sawtooth", 0.2), 60);
}

export function sfxDoorReach() {
  [0, 80, 160, 240].forEach((d, i) =>
    setTimeout(() => playTone(400 + i * 100, 0.15), d)
  );
}

export function sfxLevelClear() {
  const notes = [523, 659, 784, 1047]; // C5 E5 G5 C6
  notes.forEach((f, i) => setTimeout(() => playTone(f, 0.2, "square", 0.12), i * 120));
}

export function sfxFinale() {
  const melody = [523, 659, 784, 659, 784, 1047];
  melody.forEach((f, i) => setTimeout(() => playTone(f, 0.3, "triangle", 0.1), i * 200));
}

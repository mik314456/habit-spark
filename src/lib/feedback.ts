let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;
  if (!audioCtx) audioCtx = new Ctx();
  return audioCtx;
}

async function ensureRunning(ctx: AudioContext) {
  if (ctx.state === 'suspended') {
    try {
      await ctx.resume();
    } catch {
      // ignore
    }
  }
}

export async function playTick() {
  const ctx = getAudioContext();
  if (!ctx) return;
  await ensureRunning(ctx);

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'square';
  osc.frequency.setValueAtTime(1200, now);

  // Very quiet, very short.
  gain.gain.setValueAtTime(0.00001, now);
  gain.gain.exponentialRampToValueAtTime(0.02, now + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.00001, now + 0.03);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.04);
}

export async function playChime() {
  const ctx = getAudioContext();
  if (!ctx) return;
  await ensureRunning(ctx);

  const now = ctx.currentTime;
  const gain = ctx.createGain();
  const master = ctx.createGain();

  // Keep it soft.
  master.gain.setValueAtTime(0.12, now);
  gain.gain.setValueAtTime(0.00001, now);
  gain.gain.exponentialRampToValueAtTime(0.12, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.00001, now + 0.9);

  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();

  osc1.type = 'sine';
  osc2.type = 'triangle';

  // Soft “major” interval.
  osc1.frequency.setValueAtTime(523.25, now); // C5
  osc2.frequency.setValueAtTime(783.99, now); // G5

  // Gentle downward drift.
  osc1.frequency.exponentialRampToValueAtTime(500, now + 0.7);
  osc2.frequency.exponentialRampToValueAtTime(740, now + 0.7);

  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(master);
  master.connect(ctx.destination);

  osc1.start(now);
  osc2.start(now);
  osc1.stop(now + 1.0);
  osc2.stop(now + 1.0);
}


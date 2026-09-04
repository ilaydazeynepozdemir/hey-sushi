/**
 * Ufak, dosyasız ses katmanı. Cozy = yumuşak zarflar, tiz yok, kısa.
 * (İleride gerçek foley ile değiştirilecek; arayüz aynı kalır.)
 */
let ctx: AudioContext | null = null;
let acik = true;

/** Müzik katmanı da aynı bağlamı kullanır. */
export function audioContext(): AudioContext | null {
  return ctxOf();
}

function ctxOf(): AudioContext | null {
  if (!acik) return null;
  if (!ctx) {
    const C = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!C) return null;
    ctx = new C();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export function toggleSfx(): boolean {
  acik = !acik;
  return acik;
}

export function sfxEnabled(): boolean {
  return acik;
}

function tone(f: number, elapsed: number, kind: OscillatorType, kazanc = 0.08, gecikme = 0) {
  const c = ctxOf();
  if (!c) return;
  const t = c.currentTime + gecikme;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = kind;
  o.frequency.setValueAtTime(f, t);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(kazanc, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + elapsed);
  o.connect(g).connect(c.destination);
  o.start(t);
  o.stop(t + elapsed + 0.02);
}

/** Tahtaya dokunuş — kısa, tahta gibi. */
export function sfxTap(adim = 0) {
  tone(430 + adim * 70, 0.09, "triangle", 0.055);
}

export function sfxProduce() {
  tone(660, 0.14, "sine", 0.07);
  tone(880, 0.16, "sine", 0.05, 0.06);
}

export function sfxDrop() {
  tone(220, 0.12, "sine", 0.05);
}

export function sfxServe(perfect: boolean) {
  const akort = perfect ? [523.25, 659.25, 783.99, 1046.5] : [523.25, 659.25, 783.99];
  akort.forEach((f, i) => tone(f, 0.5, "sine", 0.06, i * 0.07));
}

export function sfxTogether() {
  [659.25, 987.77].forEach((f, i) => tone(f, 0.42, "triangle", 0.05, i * 0.09));
}

export function sfxError() {
  tone(196, 0.16, "sine", 0.045);
}

export function sfxGuest() {
  tone(392, 0.22, "sine", 0.045);
  tone(587.33, 0.26, "sine", 0.035, 0.1);
}

export function sfxDayEnd() {
  [523.25, 587.33, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, 0.7, "sine", 0.05, i * 0.13));
}

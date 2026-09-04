/**
 * Ufak, dosyasız ses katmanı. Cozy = yumuşak zarflar, tiz yok, kısa.
 * (İleride gerçek foley ile değiştirilecek; arayüz aynı kalır.)
 */
let ctx: AudioContext | null = null;
let acik = true;

/** Müzik katmanı da aynı bağlamı kullanır. */
export function sesBaglami(): AudioContext | null {
  return ac();
}

function ac(): AudioContext | null {
  if (!acik) return null;
  if (!ctx) {
    const C = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!C) return null;
    ctx = new C();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export function sesAcKapa(): boolean {
  acik = !acik;
  return acik;
}

export function sesAcikMi(): boolean {
  return acik;
}

function ton(f: number, sure: number, tip: OscillatorType, kazanc = 0.08, gecikme = 0) {
  const c = ac();
  if (!c) return;
  const t = c.currentTime + gecikme;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = tip;
  o.frequency.setValueAtTime(f, t);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(kazanc, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + sure);
  o.connect(g).connect(c.destination);
  o.start(t);
  o.stop(t + sure + 0.02);
}

/** Tahtaya dokunuş — kısa, tahta gibi. */
export function sesTik(adim = 0) {
  ton(430 + adim * 70, 0.09, "triangle", 0.055);
}

export function sesUretim() {
  ton(660, 0.14, "sine", 0.07);
  ton(880, 0.16, "sine", 0.05, 0.06);
}

export function sesBirak() {
  ton(220, 0.12, "sine", 0.05);
}

export function sesServis(mukemmel: boolean) {
  const akort = mukemmel ? [523.25, 659.25, 783.99, 1046.5] : [523.25, 659.25, 783.99];
  akort.forEach((f, i) => ton(f, 0.5, "sine", 0.06, i * 0.07));
}

export function sesBeraber() {
  [659.25, 987.77].forEach((f, i) => ton(f, 0.42, "triangle", 0.05, i * 0.09));
}

export function sesHata() {
  ton(196, 0.16, "sine", 0.045);
}

export function sesMisafir() {
  ton(392, 0.22, "sine", 0.045);
  ton(587.33, 0.26, "sine", 0.035, 0.1);
}

export function sesGunSonu() {
  [523.25, 587.33, 659.25, 783.99, 1046.5].forEach((f, i) => ton(f, 0.7, "sine", 0.05, i * 0.13));
}

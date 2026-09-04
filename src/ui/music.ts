/**
 * Arka plan müziği — dosya yok, tamamı çalışma anında üretiliyor.
 *
 * Neden böyle: telif riski sıfır (hiçbir kayıt kullanılmıyor), paket boyutuna
 * tek bayt eklemiyor ve asla birebir tekrar etmiyor. Müzik sonsuz uzunlukta.
 *
 * Müzikal seçimler:
 *  - **Yo gam dizisi** (D-E-G-A-B): Japon halk müziğinin parlak pentatonik
 *    dizisi. Suşi tezgâhı çağrışımı veriyor ama hüzünlü değil — cozy tona uygun.
 *  - Yavaş tempo (~64 BPM), uzun akor yastıkları, seyrek koto benzeri tıngırtı.
 *  - Notalar rastgele ama ağırlıklı seçiliyor; melodi cümleleri kök notada
 *    dinleniyor, böylece rastgelelik "kafa karıştırıcı" değil "sakin" duyuluyor.
 *  - Mevsime göre hafif renk değişimi (kış daha seyrek, yaz daha parlak).
 */
import { audioContext } from "./audio";

type SeasonId = "spring" | "summer" | "autumn" | "winter";

/** D Yo dizisi, Hz. Kök D3. */
const SCALE = [146.83, 164.81, 196.0, 220.0, 246.94];

/** Akor yastıkları — her biri dizinin içinden, modal ve gerilimsiz. */
const CHORDS = [
  [146.83, 220.0, 329.63], // D  A  E
  [196.0, 293.66, 493.88], // G  D  B
  [220.0, 329.63, 493.88], // A  E  B
  [146.83, 220.0, 246.94], // D  A  B
];

const LOOKAHEAD = 0.5; // saniye: bu kadar ilerisi zamanlanır
const TIK = 0.12; // zamanlayıcı aralığı

interface SeasonMood {
  tempo: number;
  yogunluk: number;
  parlaklik: number;
}

const SEASON_MOOD: Record<SeasonId, SeasonMood> = {
  spring: { tempo: 52, yogunluk: 0.24, parlaklik: 1150 },
  summer: { tempo: 56, yogunluk: 0.27, parlaklik: 1350 },
  autumn: { tempo: 48, yogunluk: 0.21, parlaklik: 980 },
  winter: { tempo: 44, yogunluk: 0.17, parlaklik: 820 },
};

let ana: GainNode | null = null;
let zamanlayici: number | null = null;
let siradakiVurus = 0;
let vurusNo = 0;
let color: SeasonMood = SEASON_MOOD.spring;
let acik = true;
let calisiyor = false;
let odaKaynagi: AudioBufferSourceNode | null = null;
/** Melodinin son durduğu derece — sıçrama yerine adım adım gezinmesi için. */
let sonDerece = 0;

export function musicEnabled() {
  return acik;
}

export function setMusicSeason(id: string) {
  color = SEASON_MOOD[id as SeasonId] ?? SEASON_MOOD.spring;
}

/** Koto benzeri tıngırtı: sert atak, uzun sönüm, hafif detune. */
function pluck(c: AudioContext, f: number, t: number, guc: number) {
  if (!ana) return;
  const elapsed = 3.4 + Math.random() * 2;
  const filtre = c.createBiquadFilter();
  filtre.type = "lowpass";
  filtre.frequency.setValueAtTime(color.parlaklik, t);
  filtre.frequency.exponentialRampToValueAtTime(420, t + elapsed);

  const zarf = c.createGain();
  zarf.gain.setValueAtTime(0, t);
  zarf.gain.linearRampToValueAtTime(guc, t + 0.05);
  zarf.gain.exponentialRampToValueAtTime(0.0001, t + elapsed);

  for (const kayma of [1, 1.0018]) {
    const o = c.createOscillator();
    o.type = "triangle";
    o.frequency.setValueAtTime(f * kayma, t);
    o.connect(filtre);
    o.start(t);
    o.stop(t + elapsed + 0.05);
  }
  filtre.connect(zarf).connect(ana);
}

/** Uzun, yumuşak akor yastığı. */
function pad(c: AudioContext, notes: number[], t: number, elapsed: number) {
  if (!ana) return;
  const filtre = c.createBiquadFilter();
  filtre.type = "lowpass";
  filtre.frequency.setValueAtTime(680, t);

  const zarf = c.createGain();
  zarf.gain.setValueAtTime(0, t);
  zarf.gain.linearRampToValueAtTime(0.035, t + elapsed * 0.45);
  zarf.gain.setValueAtTime(0.035, t + elapsed * 0.7);
  zarf.gain.exponentialRampToValueAtTime(0.0001, t + elapsed);

  for (const f of notes) {
    for (const kayma of [0.997, 1.003]) {
      const o = c.createOscillator();
      o.type = "sine";
      o.frequency.setValueAtTime(f * kayma, t);
      o.connect(filtre);
      o.start(t);
      o.stop(t + elapsed + 0.1);
    }
  }
  filtre.connect(zarf).connect(ana);
}

/** Alçak, yuvarlak bas. */
function bass(c: AudioContext, f: number, t: number) {
  if (!ana) return;
  const zarf = c.createGain();
  zarf.gain.setValueAtTime(0, t);
  zarf.gain.linearRampToValueAtTime(0.045, t + 0.25);
  zarf.gain.exponentialRampToValueAtTime(0.0001, t + 3.2);
  const o = c.createOscillator();
  o.type = "sine";
  o.frequency.setValueAtTime(f / 2, t);
  o.connect(zarf).connect(ana);
  o.start(t);
  o.stop(t + 3.3);
}

/** Ara sıra duyulan yüksek çan — rüzgâr çanı hissi. */
function bell(c: AudioContext, t: number) {
  if (!ana) return;
  const f = SCALE[Math.floor(Math.random() * SCALE.length)]! * 4;
  const zarf = c.createGain();
  zarf.gain.setValueAtTime(0, t);
  zarf.gain.linearRampToValueAtTime(0.012, t + 0.01);
  zarf.gain.exponentialRampToValueAtTime(0.0001, t + 4);
  const o = c.createOscillator();
  o.type = "sine";
  o.frequency.setValueAtTime(f, t);
  o.connect(zarf).connect(ana);
  o.start(t);
  o.stop(t + 4.1);
}

/** Çok kısık oda tonu: filtrelenmiş gürültü, deniz/yağmur hissi. */
function roomTone(c: AudioContext) {
  const uzunluk = c.sampleRate * 4;
  const tampon = c.createBuffer(1, uzunluk, c.sampleRate);
  const veri = tampon.getChannelData(0);
  let son = 0;
  for (let i = 0; i < uzunluk; i++) {
    // kahverengi gürültü: beyazdan daha yumuşak, "uğultu" gibi
    const beyaz = Math.random() * 2 - 1;
    son = (son + 0.02 * beyaz) / 1.02;
    veri[i] = son * 3.2;
  }
  const kaynak = c.createBufferSource();
  kaynak.buffer = tampon;
  kaynak.loop = true;

  const filtre = c.createBiquadFilter();
  filtre.type = "lowpass";
  filtre.frequency.value = 620;

  const g = c.createGain();
  g.gain.value = 0.032;

  // yavaş nefes alma
  const lfo = c.createOscillator();
  lfo.frequency.value = 0.05;
  const lfoG = c.createGain();
  lfoG.gain.value = 0.02;
  lfo.connect(lfoG).connect(g.gain);
  lfo.start();

  // ÖNEMLİ: doğrudan destination'a bağlanırsa LFO yüzünden sessize alınamıyor.
  // Ana çıkışa bağlanınca "kapat" gerçekten susturuyor.
  kaynak.connect(filtre).connect(g);
  if (ana) g.connect(ana);
  odaKaynagi = kaynak;
  return kaynak;
}

function schedule() {
  const c = audioContext();
  if (!c || !ana) return;
  const vurusSuresi = 60 / color.tempo;

  while (siradakiVurus < c.currentTime + LOOKAHEAD) {
    const t = Math.max(siradakiVurus, c.currentTime + 0.02);
    const olcuIci = vurusNo % 8;
    const akorNo = Math.floor(vurusNo / 8) % CHORDS.length;

    // her 8 vuruşta bir yeni akor + bas
    if (olcuIci === 0) {
      pad(c, CHORDS[akorNo]!, t, vurusSuresi * 8);
      bass(c, CHORDS[akorNo]![0]!, t);
    }
    if (olcuIci === 4 && Math.random() < 0.3) bass(c, CHORDS[akorNo]![0]!, t);

    // Melodi: rastgele sıçramak gergin duyuluyordu — komşu derecelere adımlıyor
    // ve cümle sonlarında köke dönüp dinleniyor.
    if (Math.random() < color.yogunluk) {
      const cumleSonu = olcuIci === 7;
      if (cumleSonu) {
        sonDerece = 0;
      } else {
        const adim = Math.random() < 0.72 ? (Math.random() < 0.5 ? -1 : 1) : 0;
        sonDerece = Math.max(0, Math.min(SCALE.length - 1, sonDerece + adim));
      }
      const oktav = Math.random() < 0.18 ? 4 : 2; // tiz sıçrama nadir
      pluck(c, SCALE[sonDerece]! * oktav, t, 0.03 + Math.random() * 0.014);
    }

    // çan: çok nadir ve kısık — vurgu değil, ara sıra duyulan bir detay
    if (Math.random() < 0.02) bell(c, t + vurusSuresi * 0.5);

    siradakiVurus += vurusSuresi;
    vurusNo++;
  }
}

/** İlk kullanıcı hareketinden sonra çağrılmalı (tarayıcı otomatik oynatmayı engeller). */
export function startMusic() {
  if (calisiyor || !acik) return;
  const c = audioContext();
  if (!c) return;

  ana = c.createGain();
  ana.gain.setValueAtTime(0, c.currentTime);
  ana.gain.linearRampToValueAtTime(0.5, c.currentTime + 5); // uzun ve yumuşak açılış
  ana.connect(c.destination);

  const oda = roomTone(c);
  oda.start();

  siradakiVurus = c.currentTime + 0.3;
  vurusNo = 0;
  calisiyor = true;
  zamanlayici = window.setInterval(schedule, TIK * 1000);
}

export function stopMusic() {
  const c = audioContext();
  if (zamanlayici !== null) {
    clearInterval(zamanlayici);
    zamanlayici = null;
  }
  if (c && ana) {
    ana.gain.cancelScheduledValues(c.currentTime);
    ana.gain.setValueAtTime(ana.gain.value, c.currentTime);
    ana.gain.linearRampToValueAtTime(0, c.currentTime + 0.6);
  }
  // Kaynakları gerçekten durdur: sessize almak yetmiyor, LFO değeri yükseltiyor.
  if (odaKaynagi) {
    try {
      odaKaynagi.stop((c?.currentTime ?? 0) + 0.7);
    } catch {
      /* zaten durmuş olabilir */
    }
    odaKaynagi = null;
  }
  calisiyor = false;
}

export function toggleMusic(): boolean {
  acik = !acik;
  if (acik) startMusic();
  else stopMusic();
  return acik;
}

/** Uygulama arka plana alındığında sussun. */
export function pauseMusic(duraklat: boolean) {
  if (!acik) return;
  if (duraklat) stopMusic();
  else startMusic();
}

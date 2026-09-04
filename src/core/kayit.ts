/**
 * Oyun kaydı. Gün, kalp, jeton ve dükkân eşyaları saklanır — tezgâhın anlık
 * hâli (masadaki misafirler) değil: gün ortasında çıkılırsa o gün baştan başlar.
 * Cozy bir oyunda bu, yarım kalmış bir günü geri yüklemekten daha az sinir bozucu.
 */
import { depoOku, depoSil, depoYaz } from "./depo";
import type { OyunDurumu } from "./types";

const ANAHTAR = "tsuki.kayit";

export interface Kayit {
  gun: number;
  kalp: number;
  jeton: number;
  dekor: string[];
  /** Tarif atölyesinde açılan istasyonlar. */
  ekstraIstasyon: string[];
}

export function kayitYaz(s: OyunDurumu) {
  const k: Kayit = {
    gun: s.gun,
    kalp: s.kalp,
    jeton: s.jeton,
    dekor: s.dekor,
    ekstraIstasyon: s.ekstraIstasyon,
  };
  depoYaz(ANAHTAR, JSON.stringify(k));
}

export function kayitOku(): Kayit | null {
  try {
    const ham = depoOku(ANAHTAR);
    if (!ham) return null;
    const k = JSON.parse(ham) as Partial<Kayit>;
    if (typeof k.gun !== "number") return null;
    return {
      gun: Math.max(1, Math.floor(k.gun)),
      kalp: Math.max(0, Math.floor(k.kalp ?? 0)),
      jeton: Math.max(0, Math.floor(k.jeton ?? 0)),
      dekor: Array.isArray(k.dekor) ? k.dekor.filter((d): d is string => typeof d === "string") : [],
      ekstraIstasyon: Array.isArray(k.ekstraIstasyon)
        ? k.ekstraIstasyon.filter((d): d is string => typeof d === "string")
        : [],
    };
  } catch {
    return null;
  }
}

export function kayitSil() {
  depoSil(ANAHTAR);
}

/** Kaydı duruma uygular (menüdeyken çağrılmalı). */
export function kayitUygula(s: OyunDurumu, k: Kayit) {
  s.gun = k.gun;
  s.kalp = k.kalp;
  s.jeton = k.jeton;
  s.dekor = [...k.dekor];
  s.ekstraIstasyon = [...k.ekstraIstasyon] as OyunDurumu["ekstraIstasyon"];
}

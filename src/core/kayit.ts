/**
 * Oyun kaydı. Gün, kalp, jeton ve dükkân eşyaları saklanır — tezgâhın anlık
 * hâli (masadaki misafirler) değil: gün ortasında çıkılırsa o gün baştan başlar.
 * Cozy bir oyunda bu, yarım kalmış bir günü geri yüklemekten daha az sinir bozucu.
 */
import { storageGet, storageRemove, storageSet } from "./depo";
import type { GameState } from "./types";

const ANAHTAR = "tsuki.kayit";

export interface SaveData {
  day: number;
  hearts: number;
  coins: number;
  decor: string[];
  /** Tarif atölyesinde açılan istasyonlar. */
  extraStations: string[];
}

export function writeSave(s: GameState) {
  const k: SaveData = {
    day: s.day,
    hearts: s.hearts,
    coins: s.coins,
    decor: s.decor,
    extraStations: s.extraStations,
  };
  storageSet(ANAHTAR, JSON.stringify(k));
}

export function readSave(): SaveData | null {
  try {
    const ham = storageGet(ANAHTAR);
    if (!ham) return null;
    const k = JSON.parse(ham) as Partial<SaveData>;
    if (typeof k.day !== "number") return null;
    return {
      day: Math.max(1, Math.floor(k.day)),
      hearts: Math.max(0, Math.floor(k.hearts ?? 0)),
      coins: Math.max(0, Math.floor(k.coins ?? 0)),
      decor: Array.isArray(k.decor) ? k.decor.filter((d): d is string => typeof d === "string") : [],
      extraStations: Array.isArray(k.extraStations)
        ? k.extraStations.filter((d): d is string => typeof d === "string")
        : [],
    };
  } catch {
    return null;
  }
}

export function clearSave() {
  storageRemove(ANAHTAR);
}

/** Kaydı duruma uygular (menüdeyken çağrılmalı). */
export function applySave(s: GameState, k: SaveData) {
  s.day = k.day;
  s.hearts = k.hearts;
  s.coins = k.coins;
  s.decor = [...k.decor];
  s.extraStations = [...k.extraStations] as GameState["ekstraIstasyon"];
}

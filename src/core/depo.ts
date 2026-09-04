/**
 * Kalıcı depolama.
 *
 * localStorage senkron ve her yerde çalışıyor, ama iOS WebView'inde yer
 * baskısı altında temizlenebiliyor. Bu yüzden native'de her yazma
 * Capacitor Preferences'a da aynalanır ve açılışta eksikler oradan geri yüklenir.
 * Böylece oyun kodu senkron kalır, veri de kalıcı olur.
 */
import { Preferences } from "@capacitor/preferences";
import { Capacitor } from "@capacitor/core";

const MIRRORED_KEYS = ["tsuki.avatar", "tsuki.tarifler", "tsuki.dil", "tsuki.rehber", "tsuki.kayit"];

function isNative() {
  return Capacitor.isNativePlatform();
}

export function storageGet(anahtar: string): string | null {
  try {
    return localStorage.getItem(anahtar);
  } catch {
    return null;
  }
}

export function storageSet(anahtar: string, deger: string) {
  try {
    localStorage.setItem(anahtar, deger);
  } catch {
    /* özel sekme / dolu depo */
  }
  if (isNative()) void Preferences.set({ key: anahtar, value: deger }).catch(() => {});
}

export function storageRemove(anahtar: string) {
  try {
    localStorage.removeItem(anahtar);
  } catch {
    /* yok say */
  }
  if (isNative()) void Preferences.remove({ key: anahtar }).catch(() => {});
}

/** Açılışta: localStorage boşsa Preferences'tan geri yükle. */
export async function restoreStorage() {
  if (!isNative()) return;
  for (const anahtar of MIRRORED_KEYS) {
    try {
      if (localStorage.getItem(anahtar) !== null) continue;
      const { value } = await Preferences.get({ key: anahtar });
      if (value !== null) localStorage.setItem(anahtar, value);
    } catch {
      /* tek bir anahtar kurtarılamazsa diğerlerine devam */
    }
  }
}

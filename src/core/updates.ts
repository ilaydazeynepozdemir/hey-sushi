/**
 * OTA (kablosuz) güncelleme.
 *
 * Mağaza build'i yalnızca native kabuğu taşır; oyunun kendisi (JS/CSS/görseller)
 * bir paket olarak indirilip değiştirilebilir. Böylece içerik ve denge
 * güncellemeleri mağaza incelemesi beklemeden çıkar.
 *
 * SINIR: OTA yalnızca web varlıklarını günceller. Yeni bir native eklenti
 * eklemek hâlâ yeni bir mağaza sürümü gerektirir — bu yüzden eklentiler
 * baştan kuruldu.
 *
 * Mağaza kuralları: hem App Store (2.5.2 / 3.3.2) hem Play, kodun uygulamanın
 * kendi WebView'inde çalışması ve uygulamanın amacını değiştirmemesi şartıyla
 * bu yönteme izin veriyor.
 */
import { Capacitor } from "@capacitor/core";
import { Network } from "@capacitor/network";
import { CapacitorUpdater } from "@capgo/capacitor-updater";

declare const __SURUM__: string;

/** Paketlerin ve manifestin barındığı yer (GitHub Pages yeter). */
const MANIFEST_URL = "https://ilaydazeynepozdemir.github.io/hey-sushi-updates/version.json";

export interface Manifest {
  /** Semver, örn. "0.3.0" */
  version: string;
  /** İndirilecek zip'in tam adresi. */
  url: string;
  /** Kullanıcıya gösterilecek kısa not (isteğe bağlı). */
  note?: { en: string; tr: string };
  /** true ise kullanıcıya sormadan bir sonraki açılışta uygulanır. */
  silent?: boolean;
}

export interface UpdateHooks {
  /** İndirme bitti, uygulanmaya hazır. */
  hazir(manifest: Manifest): void;
}

let bekleyen: { manifest: Manifest; id: string } | null = null;

function isNewerVersion(yeni: string, mevcut: string): boolean {
  const a = yeni.split(".").map((n) => parseInt(n, 10) || 0);
  const b = mevcut.split(".").map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const x = a[i] ?? 0;
    const g = b[i] ?? 0;
    if (x !== g) return x > g;
  }
  return false;
}

export function currentVersion(): string {
  return typeof __SURUM__ === "string" ? __SURUM__ : "0.0.0";
}

/** Açılışta çağrılır: paketin sağlam açıldığını bildirir ve güncelleme arar. */
export async function startUpdates(kanca: UpdateHooks) {
  if (!Capacitor.isNativePlatform()) return;

  // Bunu çağırmazsak capgo paketi bozuk sayıp bir öncekine geri döner.
  try {
    await CapacitorUpdater.notifyAppReady();
  } catch {
    /* eklenti yoksa sessizce geç */
  }

  try {
    const { connected } = await Network.getStatus();
    if (!connected) return;
  } catch {
    /* ağ durumu okunamadıysa yine de dene */
  }

  try {
    const cevap = await fetch(`${MANIFEST_URL}?t=${Date.now()}`, { cache: "no-store" });
    if (!cevap.ok) return;
    const manifest = (await cevap.json()) as Manifest;
    if (!manifest?.version || !manifest.url) return;
    if (!isNewerVersion(manifest.version, currentVersion())) return;

    const paket = await CapacitorUpdater.download({ url: manifest.url, version: manifest.version });
    bekleyen = { manifest, id: paket.id };

    if (manifest.silent) {
      // Sessiz mod: kullanıcı uygulamayı bir dahaki açışında yeni paket devrede.
      await CapacitorUpdater.next({ id: paket.id });
      return;
    }
    kanca.hazir(manifest);
  } catch {
    /* güncelleme bulunamadıysa oyun mevcut paketle devam eder */
  }
}

/** Kullanıcı "şimdi güncelle" dedi. */
export async function applyUpdate() {
  if (!bekleyen) return;
  try {
    await CapacitorUpdater.set({ id: bekleyen.id });
  } catch {
    /* uygulanamazsa mevcut paket kalır */
  }
}

/** Kullanıcı "sonra" dedi: bir sonraki açılışta devreye girsin. */
export async function deferUpdate() {
  if (!bekleyen) return;
  try {
    await CapacitorUpdater.next({ id: bekleyen.id });
  } catch {
    /* yok say */
  }
  bekleyen = null;
}

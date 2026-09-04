/**
 * Native kabuk entegrasyonu (Capacitor). Web'de çalışırken tüm çağrılar
 * sessizce atlanır — aynı kod hem tarayıcıda hem uygulamada çalışır.
 */
import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { SplashScreen } from "@capacitor/splash-screen";
import { StatusBar, Style } from "@capacitor/status-bar";

export function isNative(): boolean {
  return Capacitor.isNativePlatform();
}

export interface NativeHooks {
  /** Geri tuşuna basıldı; açık bir panel varsa kapatıp true dönmeli. */
  geriTusu(): boolean;
  /** Uygulama arka plana alındı ya da geri geldi. */
  gorunurluk(aktif: boolean): void;
}

export async function initNative(kanca: NativeHooks) {
  if (!isNative()) return;

  try {
    await StatusBar.setStyle({ style: Style.Light });
    // Oyun içeriği durum çubuğunun altına girmesin.
    await StatusBar.setOverlaysWebView({ overlay: false });
    if (Capacitor.getPlatform() === "android") {
      await StatusBar.setBackgroundColor({ color: "#FFF9F2" });
    }
  } catch {
    /* bazı cihazlarda durum çubuğu ayarlanamaz — oyun yine çalışır */
  }

  // Android donanım geri tuşu: önce paneli kapat, panel yoksa uygulamadan çık.
  void App.addListener("backButton", ({ canGoBack }) => {
    if (kanca.geriTusu()) return;
    if (!canGoBack) void App.exitApp();
  });

  void App.addListener("appStateChange", ({ isActive }) => kanca.gorunurluk(isActive));

  try {
    await SplashScreen.hide();
  } catch {
    /* splash zaten gizlenmiş olabilir */
  }
}

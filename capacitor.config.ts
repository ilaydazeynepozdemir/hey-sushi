import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.heysushi",
  appName: "Hey Sushi",
  webDir: "dist",
  // Oyun tamamen çevrimdışı çalışır; uzak sunucudan içerik yüklenmez.
  server: {
    androidScheme: "https",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 900,
      launchAutoHide: true,
      backgroundColor: "#FFF9F2",
      androidSplashResourceName: "splash",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: false,
    },
    CapacitorUpdater: {
      // Güncellemeyi biz yönetiyoruz: indirip kullanıcıya soruyoruz.
      autoUpdate: false,
      resetWhenUpdate: true,
    },
    StatusBar: {
      style: "LIGHT", // açık zemin → koyu ikonlar
      backgroundColor: "#FFF9F2",
      overlaysWebView: false,
    },
  },
  ios: {
    contentInset: "always",
  },
  android: {
    backgroundColor: "#FFF9F2",
  },
};

export default config;

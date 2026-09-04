import { defineConfig } from "vite";

export default defineConfig({
  // Capacitor kabuğu dosyaları kökten sunar (base "/").
  // GitHub Pages ise /hey-sushi/ alt yolundan sunar — PAGES=1 ile o mod.
  base: process.env.PAGES === "1" ? "/hey-sushi/" : "/",
  define: {
    __RELAY_URL__: JSON.stringify(process.env.RELAY_URL ?? ""),
    // OTA sürüm karşılaştırması için paket sürümü gömülür.
    __SURUM__: JSON.stringify(process.env.npm_package_version ?? "0.0.0"),
  },
  server: { port: 5180 },
  build: { target: "es2022" },
});

import { defineConfig } from "vite";

export default defineConfig({
  define: {
    __RELAY_URL__: JSON.stringify(process.env.RELAY_URL ?? ""),
    // OTA sürüm karşılaştırması için paket sürümü gömülür.
    __SURUM__: JSON.stringify(process.env.npm_package_version ?? "0.0.0"),
  },
  server: { port: 5180 },
  build: { target: "es2022" },
});

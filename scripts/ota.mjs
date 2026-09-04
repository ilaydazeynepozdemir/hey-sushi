/**
 * OTA paketi üretir.
 *
 *   npm run ota
 *
 * Çıktı: ota/hey-sushi-<surum>.zip  +  ota/version.json
 * Bu iki dosyayı barındırma yerine (GitHub Pages klasörü gibi) kopyalayın.
 * Uygulama açılışta version.json'a bakar, sürüm büyükse zip'i indirir.
 *
 * ÖNEMLİ: OTA yalnızca web varlıklarını (dist) günceller. Yeni bir native
 * eklenti eklediyseniz OTA yetmez, mağazaya yeni sürüm göndermeniz gerekir.
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const kok = resolve(import.meta.dirname, "..");
const pkg = JSON.parse(readFileSync(resolve(kok, "package.json"), "utf8"));
const surum = pkg.version;
const cikti = resolve(kok, "ota");

// Barındırma adresi — capacitor içindeki MANIFEST_URL ile aynı klasörü göstermeli.
const TABAN_URL = process.env.OTA_BASE_URL ?? "https://ilaydazeynepozdemir.github.io/hey-sushi-updates";

if (!existsSync(resolve(kok, "dist", "index.html"))) {
  console.error("dist yok — önce `npm run build` çalıştırın.");
  process.exit(1);
}

mkdirSync(cikti, { recursive: true });
const zipAdi = `hey-sushi-${surum}.zip`;
const zipYol = resolve(cikti, zipAdi);
rmSync(zipYol, { force: true });

// dist'in İÇERİĞİ zip'in kökünde olmalı (index.html en üstte).
execSync(`cd "${resolve(kok, "dist")}" && zip -r -q "${zipYol}" .`);

const manifest = {
  surum,
  url: `${TABAN_URL}/${zipAdi}`,
  not: {
    en: process.env.OTA_NOTE_EN ?? "Small improvements and fixes.",
    tr: process.env.OTA_NOTE_TR ?? "Küçük iyileştirmeler ve düzeltmeler.",
  },
  sessiz: process.env.OTA_SILENT === "1",
  tarih: new Date().toISOString(),
};
writeFileSync(resolve(cikti, "version.json"), JSON.stringify(manifest, null, 2) + "\n");

const boyut = (readFileSync(zipYol).length / 1024).toFixed(0);
console.log(`✔ ${zipAdi} (${boyut} KB)`);
console.log(`✔ version.json → sürüm ${surum}`);
console.log(`\nŞimdi ota/ içindeki iki dosyayı şuraya kopyalayın:\n  ${TABAN_URL}`);

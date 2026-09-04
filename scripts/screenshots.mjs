/**
 * Mağaza ekran görüntülerini üretir.
 *
 *   npm run dev            (ayrı terminalde)
 *   npm run ekran
 *
 * Çıktı: magaza/ altında her cihaz ve dil için PNG'ler.
 *
 * Neden betik: her mağaza güncellemesinde aynı kareleri iki dilde ve üç
 * boyutta yeniden üretmek gerekiyor. Elle almak hem yorucu hem tutarsız.
 *
 * Ölçüler: CSS boyutu × deviceScaleFactor = mağazanın istediği piksel.
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

const KOK = resolve(import.meta.dirname, "..");
const CIKTI = resolve(KOK, "magaza");
const ADRES = process.env.OYUN_URL ?? "http://localhost:5180";

const CIHAZLAR = [
  { ad: "play", en: 360, boy: 640, olcek: 3 },      // 1080×1920
  { ad: "ios67", en: 430, boy: 932, olcek: 3 },     // 1290×2796
  { ad: "ipad", en: 1032, boy: 1376, olcek: 2 },    // 2064×2752
];

const DILLER = ["en", "tr"];

/** Sayfayı belirli bir sahneye getirir. */
const SAHNELER = [
  {
    ad: "01-giris",
    async kur() {},
  },
  {
    ad: "02-tezgah",
    async kur(sayfa) {
      await sayfa.evaluate(async () => {
        const T = window.__tsuki;
        T.durum.gun = 4;
        T.durum.jeton = 320;
        T.durum.kalp = 128;
        T.durum.dekor = ["fener_dizisi", "bonsai", "maneki", "kedi_yatagi"];
        // Butonu metninden bul: konum tabanlı seçici yanlış düğmeye basıyordu.
        [...document.querySelectorAll("button")]
          .find((x) => /Open the Counter|Tezgâhı Aç|Start the Day|Güne Başla/.test(x.textContent))
          ?.click();
        await new Promise((r) => setTimeout(r, 300));
        // üç masayı da doldur
        for (let i = 0; i < 900 && T.durum.misafirler.length < 3; i++) T.tik(0.05);
        // tepsilere biraz malzeme koy ki dolu görünsün
        const m = T.durum.misafirler[0];
        if (m) m.tepsi.push({ malzeme: "pirinc", koyan: 0 });
        T.tik(0.05);
      });
      await sayfa.waitForTimeout(900);
    },
  },
  {
    ad: "03-atolye",
    async kur(sayfa) {
      await sayfa.evaluate(async () => {
        window.__tsuki.durum.gun = 8;
        const b = [...document.querySelectorAll("button")].find((x) =>
          /Atölye|Workshop/.test(x.textContent),
        );
        b?.click();
        await new Promise((r) => setTimeout(r, 400));
        const icler = document.querySelectorAll(".secim-sira")[1]?.querySelectorAll("button") ?? [];
        [...icler].slice(0, 3).forEach((x) => x.click());
        await new Promise((r) => setTimeout(r, 200));
        const gar = document.querySelectorAll(".secim-sira")[2]?.querySelectorAll("button") ?? [];
        [...gar].slice(0, 2).forEach((x) => x.click());
        const ad = document.querySelector(".atolye-giris");
        if (ad) {
          ad.value = document.documentElement.lang === "tr" ? "Ay Işığı" : "Moonlight";
          ad.dispatchEvent(new Event("input", { bubbles: true }));
        }
        document.querySelector(".atolye-pano").scrollTop = 0;
      });
      await sayfa.waitForTimeout(700);
    },
  },
  {
    ad: "04-garson",
    async kur(sayfa) {
      await sayfa.evaluate(async () => {
        const b = [...document.querySelectorAll("button")].find((x) =>
          /Garsonun|Your Server/.test(x.textContent),
        );
        b?.click();
        await new Promise((r) => setTimeout(r, 500));
        document.querySelector(".atolye-pano").scrollTop = 0;
      });
      await sayfa.waitForTimeout(600);
    },
  },
  {
    ad: "05-dukkan",
    async kur(sayfa) {
      await sayfa.evaluate(async () => {
        const T = window.__tsuki;
        T.durum.gun = 5;
        T.durum.jeton = 480;
        T.durum.kalp = 214;
        T.durum.gunKalp = 46;
        T.durum.dekor = ["bonsai", "noren"];
        T.durum.istatistik = { servis: 9, mukemmel: 6, beraber: 0, kacan: 0 };
        T.durum.faz = "gun_sonu";
        T.tik(0.016);
        await new Promise((r) => setTimeout(r, 300));
        const p = document.querySelector(".pano");
        if (p) p.scrollTop = p.scrollHeight * 0.45;
      });
      await sayfa.waitForTimeout(700);
    },
  },
];

mkdirSync(CIKTI, { recursive: true });

const tarayici = await chromium.launch();
let sayac = 0;

for (const cihaz of CIHAZLAR) {
  for (const dil of DILLER) {
    const baglam = await tarayici.newContext({
      viewport: { width: cihaz.en, height: cihaz.boy },
      deviceScaleFactor: cihaz.olcek,
      locale: dil === "tr" ? "tr-TR" : "en-US",
      reducedMotion: "reduce",
    });
    const sayfa = await baglam.newPage();

    for (const sahne of SAHNELER) {
      await sayfa.goto(ADRES, { waitUntil: "networkidle" });
      // dil tercihini sabitle ve kayıtları temizle
      await sayfa.evaluate((d) => {
        localStorage.clear();
        localStorage.setItem("tsuki.dil", d);
      }, dil);
      await sayfa.reload({ waitUntil: "networkidle" });
      await sayfa.waitForTimeout(1200); // sahne ve yazı tipleri otursun

      await sahne.kur(sayfa);

      const dosya = resolve(CIKTI, `${cihaz.ad}-${dil}-${sahne.ad}.png`);
      await sayfa.screenshot({ path: dosya });
      sayac++;
      process.stdout.write(`✔ ${cihaz.ad}/${dil}/${sahne.ad}\n`);
    }
    await baglam.close();
  }
}

await tarayici.close();
console.log(`\n${sayac} görüntü → magaza/`);

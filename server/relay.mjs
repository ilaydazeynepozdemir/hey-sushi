/**
 * Tsuki Suşi — oda röle sunucusu.
 *
 * Kasıtlı olarak "aptal": oyun mantığı burada YOK. Odayı ilk kuran istemci
 * ev sahibi olur ve oyunu kendi tarayıcısında (src/core) çalıştırır; sunucu
 * yalnızca mesajları taşır. Böylece tek bir kaynak kod hem tekli hem çok
 * oyunculu oyunu yürütür.
 *
 * Çalıştır: node server/relay.mjs   (varsayılan port 5181)
 */
import { WebSocketServer } from "ws";

// Not: preview harness PORT değişkenini uygulama portu için ayarlayabiliyor,
// bu yüzden röle kendi değişkenini kullanır.
const PORT = Number(process.env.RELAY_PORT ?? 5181);
const HARFLER = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // karışan harfler yok
const ODA_OMRU_MS = 1000 * 60 * 60 * 4;

/** kod -> { host, uyeler: Map<id, ws>, kuruldu } */
const odalar = new Map();
let sonrakiId = 1;

function kodUret() {
  let kod;
  do {
    kod = Array.from({ length: 4 }, () => HARFLER[Math.floor(Math.random() * HARFLER.length)]).join("");
  } while (odalar.has(kod));
  return kod;
}

function yolla(ws, mesaj) {
  if (ws && ws.readyState === 1) ws.send(JSON.stringify(mesaj));
}

function odaKapat(kod, sebep) {
  const oda = odalar.get(kod);
  if (!oda) return;
  for (const ws of oda.uyeler.values()) yolla(ws, { t: "oda_kapandi", sebep });
  odalar.delete(kod);
  console.log(`[oda ${kod}] kapandı (${sebep})`);
}

const wss = new WebSocketServer({ port: PORT });

wss.on("error", (e) => {
  console.error(`Röle ${PORT} portunu açamadı:`, e.message);
  process.exit(1);
});

wss.on("listening", () => console.log(`Tsuki Suşi röle sunucusu :${PORT} dinliyor`));

wss.on("connection", (ws) => {
  ws.oda = null;
  ws.rol = null;
  ws.id = null;

  ws.on("message", (ham) => {
    let m;
    try {
      m = JSON.parse(ham.toString());
    } catch {
      return;
    }

    switch (m.t) {
      case "kur": {
        if (ws.oda) return;
        const kod = kodUret();
        odalar.set(kod, { host: ws, uyeler: new Map(), kuruldu: Date.now() });
        ws.oda = kod;
        ws.rol = "host";
        ws.id = 0;
        yolla(ws, { t: "kuruldu", kod });
        console.log(`[oda ${kod}] kuruldu`);
        break;
      }

      case "katil": {
        const oda = odalar.get(String(m.kod ?? "").toUpperCase());
        if (!oda) return yolla(ws, { t: "hata", mesaj: "Böyle bir oda yok" });
        if (oda.uyeler.size >= 3) return yolla(ws, { t: "hata", mesaj: "Oda dolu" });
        const id = sonrakiId++;
        ws.oda = String(m.kod).toUpperCase();
        ws.rol = "uye";
        ws.id = id;
        oda.uyeler.set(id, ws);
        yolla(ws, { t: "katildi", kod: ws.oda, id });
        yolla(oda.host, { t: "uye_girdi", id, ad: String(m.ad ?? "Misafir").slice(0, 16) });
        console.log(`[oda ${ws.oda}] üye ${id} girdi`);
        break;
      }

      case "yolla": {
        const oda = odalar.get(ws.oda);
        if (!oda) return;
        if (ws.rol === "host") {
          for (const [id, uye] of oda.uyeler) {
            if (m.hedef === undefined || m.hedef === id) yolla(uye, { t: "veri", from: 0, veri: m.veri });
          }
        } else {
          yolla(oda.host, { t: "veri", from: ws.id, veri: m.veri });
        }
        break;
      }
    }
  });

  ws.on("close", () => {
    const oda = odalar.get(ws.oda);
    if (!oda) return;
    if (ws.rol === "host") odaKapat(ws.oda, "ev sahibi ayrıldı");
    else {
      oda.uyeler.delete(ws.id);
      yolla(oda.host, { t: "uye_cikti", id: ws.id });
      console.log(`[oda ${ws.oda}] üye ${ws.id} çıktı`);
    }
  });
});

// terk edilmiş odaları topla
setInterval(() => {
  const simdi = Date.now();
  for (const [kod, oda] of odalar) {
    if (simdi - oda.kuruldu > ODA_OMRU_MS) odaKapat(kod, "süre doldu");
  }
}, 60_000);


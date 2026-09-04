/**
 * Tsuki Suşi — oda röle sunucusu.
 *
 * Kasıtlı olarak "aptal": oyun mantığı burada YOK. Odayı ilk kuran istemci
 * ev sahibi olur ve oyunu kendi tarayıcısında (src/core) çalıştırır; sunucu
 * yalnızca mesajları taşır. Böylece single bir kaynak code hem tekli hem çok
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

/** code -> { host, members: Map<id, ws>, kuruldu } */
const odalar = new Map();
let sonrakiId = 1;

function makeCode() {
  let code;
  do {
    code = Array.from({ length: 4 }, () => HARFLER[Math.floor(Math.random() * HARFLER.length)]).join("");
  } while (odalar.has(code));
  return code;
}

function send(ws, onMessage) {
  if (ws && ws.readyState === 1) ws.send(JSON.stringify(onMessage));
}

function closeRoom(code, sebep) {
  const oda = odalar.get(code);
  if (!oda) return;
  for (const ws of oda.members.values()) send(ws, { t: "oda_kapandi", sebep });
  odalar.delete(code);
  console.log(`[oda ${code}] kapandı (${sebep})`);
}

const wss = new WebSocketServer({ port: PORT });

wss.on("error", (e) => {
  console.error(`Röle ${PORT} portunu açamadı:`, e.message);
  process.exit(1);
});

wss.on("listening", () => console.log(`Tsuki Suşi röle sunucusu :${PORT} dinliyor`));

wss.on("connection", (ws) => {
  ws.oda = null;
  ws.role = null;
  ws.id = null;

  ws.on("message", (ham) => {
    let m;
    try {
      m = JSON.parse(ham.toString());
    } catch {
      return;
    }

    switch (m.t) {
      case "create": {
        if (ws.oda) return;
        const code = makeCode();
        odalar.set(code, { host: ws, members: new Map(), kuruldu: Date.now() });
        ws.oda = code;
        ws.role = "host";
        ws.id = 0;
        send(ws, { t: "kuruldu", code });
        console.log(`[oda ${code}] kuruldu`);
        break;
      }

      case "join": {
        const oda = odalar.get(String(m.code ?? "").toUpperCase());
        if (!oda) return send(ws, { t: "hata", onMessage: "Böyle bir oda yok" });
        if (oda.members.size >= 3) return send(ws, { t: "hata", onMessage: "Oda filled" });
        const id = sonrakiId++;
        ws.oda = String(m.code).toUpperCase();
        ws.role = "uye";
        ws.id = id;
        oda.members.set(id, ws);
        send(ws, { t: "katildi", code: ws.oda, id });
        send(oda.host, { t: "uye_girdi", id, name: String(m.name ?? "Guest").slice(0, 16) });
        console.log(`[oda ${ws.oda}] üye ${id} girdi`);
        break;
      }

      case "send": {
        const oda = odalar.get(ws.oda);
        if (!oda) return;
        if (ws.role === "host") {
          for (const [id, uye] of oda.members) {
            if (m.target === undefined || m.target === id) send(uye, { t: "veri", from: 0, veri: m.veri });
          }
        } else {
          send(oda.host, { t: "veri", from: ws.id, veri: m.veri });
        }
        break;
      }
    }
  });

  ws.on("close", () => {
    const oda = odalar.get(ws.oda);
    if (!oda) return;
    if (ws.role === "host") closeRoom(ws.oda, "ev sahibi ayrıldı");
    else {
      oda.members.delete(ws.id);
      send(oda.host, { t: "uye_cikti", id: ws.id });
      console.log(`[oda ${ws.oda}] üye ${ws.id} çıktı`);
    }
  });
});

// terk edilmiş odaları topla
setInterval(() => {
  const simdi = Date.now();
  for (const [code, oda] of odalar) {
    if (simdi - oda.kuruldu > ODA_OMRU_MS) closeRoom(code, "süre doldu");
  }
}, 60_000);


/**
 * Oda istemcisi. Sunucu sadece mesaj taşır; oyunu ev sahibinin tarayıcısı
 * yürütür (host-authoritative). Bu yüzden burada oyun mantığı yok — sadece
 * bağlantı, kimlik ve mesaj taşıma.
 */
export type NetRol = "kapali" | "host" | "misafir";

export interface OdaOlaylari {
  onDurum(veri: unknown): void;
  onAksiyon(oyuncuId: number, veri: unknown): void;
  onUyeGirdi(id: number, ad: string): void;
  onUyeCikti(id: number): void;
  onKapandi(sebep: string): void;
  onHata(mesaj: string): void;
  onDegisti(): void;
}

declare const __RELAY_URL__: string | undefined;

const VARSAYILAN_URL =
  (typeof __RELAY_URL__ === "string" && __RELAY_URL__) ||
  `${location.protocol === "https:" ? "wss" : "ws"}://${location.hostname}:5181`;

export class Oda {
  rol: NetRol = "kapali";
  kod = "";
  /** Bu istemcinin oyuncu indeksi (host = 0). */
  benId = 0;
  baglaniyor = false;
  uyeler = new Map<number, string>();

  private ws: WebSocket | null = null;

  constructor(private olaylar: OdaOlaylari, private url = VARSAYILAN_URL) {}

  get bagli(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  private async ac(): Promise<WebSocket> {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) return this.ws;
    this.baglaniyor = true;
    this.olaylar.onDegisti();
    return new Promise((cozum, hata) => {
      const ws = new WebSocket(this.url);
      const zamanAsimi = setTimeout(() => {
        ws.close();
        hata(new Error("Sunucuya ulaşılamadı"));
      }, 6000);

      ws.onopen = () => {
        clearTimeout(zamanAsimi);
        this.ws = ws;
        this.baglaniyor = false;
        cozum(ws);
      };
      ws.onerror = () => {
        clearTimeout(zamanAsimi);
        this.baglaniyor = false;
        hata(new Error("Sunucuya ulaşılamadı"));
      };
      ws.onclose = () => {
        this.ws = null;
        if (this.rol !== "kapali") {
          this.rol = "kapali";
          this.kod = "";
          this.uyeler.clear();
          this.olaylar.onKapandi("bağlantı koptu");
          this.olaylar.onDegisti();
        }
      };
      ws.onmessage = (e) => this.mesaj(e.data);
    });
  }

  private mesaj(ham: unknown) {
    let m: Record<string, unknown>;
    try {
      m = JSON.parse(String(ham));
    } catch {
      return;
    }
    switch (m.t) {
      case "kuruldu":
        this.rol = "host";
        this.kod = String(m.kod);
        this.benId = 0;
        this.olaylar.onDegisti();
        break;
      case "katildi":
        this.rol = "misafir";
        this.kod = String(m.kod);
        this.olaylar.onDegisti();
        break;
      case "uye_girdi":
        this.uyeler.set(Number(m.id), String(m.ad));
        this.olaylar.onUyeGirdi(Number(m.id), String(m.ad));
        this.olaylar.onDegisti();
        break;
      case "uye_cikti":
        this.uyeler.delete(Number(m.id));
        this.olaylar.onUyeCikti(Number(m.id));
        this.olaylar.onDegisti();
        break;
      case "veri": {
        const veri = m.veri as { t?: string } | undefined;
        if (!veri) break;
        if (this.rol === "host") this.olaylar.onAksiyon(Number(m.from), veri);
        else this.olaylar.onDurum(veri);
        break;
      }
      case "oda_kapandi":
        this.rol = "kapali";
        this.kod = "";
        this.uyeler.clear();
        this.olaylar.onKapandi(String(m.sebep ?? "oda kapandı"));
        this.olaylar.onDegisti();
        break;
      case "hata":
        this.olaylar.onHata(String(m.mesaj));
        break;
    }
  }

  async kur(): Promise<void> {
    try {
      const ws = await this.ac();
      ws.send(JSON.stringify({ t: "kur" }));
    } catch (e) {
      this.olaylar.onHata((e as Error).message);
      this.olaylar.onDegisti();
    }
  }

  async katil(kod: string, ad: string): Promise<void> {
    try {
      const ws = await this.ac();
      ws.send(JSON.stringify({ t: "katil", kod: kod.trim().toUpperCase(), ad }));
    } catch (e) {
      this.olaylar.onHata((e as Error).message);
      this.olaylar.onDegisti();
    }
  }

  yolla(veri: unknown, hedef?: number) {
    if (!this.bagli) return;
    this.ws!.send(JSON.stringify({ t: "yolla", veri, hedef }));
  }

  ayril() {
    this.rol = "kapali";
    this.kod = "";
    this.uyeler.clear();
    this.ws?.close();
    this.ws = null;
    this.olaylar.onDegisti();
  }
}

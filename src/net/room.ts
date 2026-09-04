/**
 * Oda istemcisi. Sunucu sadece mesaj taşır; oyunu ev sahibinin tarayıcısı
 * yürütür (host-authoritative). Bu yüzden burada oyun mantığı yok — sadece
 * bağlantı, kimlik ve mesaj taşıma.
 */
export type NetRole = "off" | "host" | "guest";

export interface RoomCallbacks {
  onState(veri: unknown): void;
  onAction(playerId: number, veri: unknown): void;
  onMemberJoined(id: number, name: string): void;
  onMemberLeft(id: number): void;
  onClosed(sebep: string): void;
  onError(onMessage: string): void;
  onChanged(): void;
}

declare const __RELAY_URL__: string | undefined;

const VARSAYILAN_URL =
  (typeof __RELAY_URL__ === "string" && __RELAY_URL__) ||
  `${location.protocol === "https:" ? "wss" : "ws"}://${location.hostname}:5181`;

export class Oda {
  role: NetRole = "off";
  code = "";
  /** Bu istemcinin oyuncu indeksi (host = 0). */
  myPlayerId = 0;
  connecting = false;
  members = new Map<number, string>();

  private ws: WebSocket | null = null;

  constructor(private events: RoomCallbacks, private url = VARSAYILAN_URL) {}

  get connected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  private async ctxOf(): Promise<WebSocket> {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) return this.ws;
    this.connecting = true;
    this.events.onChanged();
    return new Promise((cozum, hata) => {
      const ws = new WebSocket(this.url);
      const zamanAsimi = setTimeout(() => {
        ws.close();
        hata(new Error("Sunucuya ulaşılamadı"));
      }, 6000);

      ws.onopen = () => {
        clearTimeout(zamanAsimi);
        this.ws = ws;
        this.connecting = false;
        cozum(ws);
      };
      ws.onerror = () => {
        clearTimeout(zamanAsimi);
        this.connecting = false;
        hata(new Error("Sunucuya ulaşılamadı"));
      };
      ws.onclose = () => {
        this.ws = null;
        if (this.role !== "off") {
          this.role = "off";
          this.code = "";
          this.members.clear();
          this.events.onClosed("bağlantı koptu");
          this.events.onChanged();
        }
      };
      ws.onmessage = (e) => this.onMessage(e.data);
    });
  }

  private onMessage(ham: unknown) {
    let m: Record<string, unknown>;
    try {
      m = JSON.parse(String(ham));
    } catch {
      return;
    }
    switch (m.t) {
      case "kuruldu":
        this.role = "host";
        this.code = String(m.code);
        this.myPlayerId = 0;
        this.events.onChanged();
        break;
      case "katildi":
        this.role = "guest";
        this.code = String(m.code);
        this.events.onChanged();
        break;
      case "uye_girdi":
        this.members.set(Number(m.id), String(m.name));
        this.events.onMemberJoined(Number(m.id), String(m.name));
        this.events.onChanged();
        break;
      case "uye_cikti":
        this.members.delete(Number(m.id));
        this.events.onMemberLeft(Number(m.id));
        this.events.onChanged();
        break;
      case "veri": {
        const veri = m.veri as { t?: string } | undefined;
        if (!veri) break;
        if (this.role === "host") this.events.onAction(Number(m.from), veri);
        else this.events.onState(veri);
        break;
      }
      case "oda_kapandi":
        this.role = "off";
        this.code = "";
        this.members.clear();
        this.events.onClosed(String(m.sebep ?? "oda kapandı"));
        this.events.onChanged();
        break;
      case "error":
        this.events.onError(String(m.onMessage));
        break;
    }
  }

  async create(): Promise<void> {
    try {
      const ws = await this.ctxOf();
      ws.send(JSON.stringify({ t: "kur" }));
    } catch (e) {
      this.events.onError((e as Error).message);
      this.events.onChanged();
    }
  }

  async join(code: string, name: string): Promise<void> {
    try {
      const ws = await this.ctxOf();
      ws.send(JSON.stringify({ t: "katil", code: code.trim().toUpperCase(), name }));
    } catch (e) {
      this.events.onError((e as Error).message);
      this.events.onChanged();
    }
  }

  send(veri: unknown, target?: number) {
    if (!this.connected) return;
    this.ws!.send(JSON.stringify({ t: "yolla", veri, target }));
  }

  leave() {
    this.role = "off";
    this.code = "";
    this.members.clear();
    this.ws?.close();
    this.ws = null;
    this.events.onChanged();
  }
}

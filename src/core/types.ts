import type { Avatar } from "./avatar";
import type { Localized } from "./i18n";

/**
 * Oyunun saf çekirdeği. Burada DOM, tarayıcı ya da render kodu YOK.
 * Sebep: aynı beyni ileride Phaser / Godot / sunucu tarafında da çalıştıracağız.
 */

export type PlayerId = 0 | 1 | 2 | 3;

export type IngredientId =
  | "rice"
  | "nori"
  | "tea"
  | "salmon_slice"
  | "tuna_slice"
  | "avocado"
  | "tamago"
  | "ikura"
  | "tofu"
  | "miso"
  | "mochi"
  | "shrimp"
  | "unagi"
  | "cucumber"
  | "mango"
  | "cream_cheese"
  | "tempura"
  | "treat"
  | "salmon_maki"
  | "avocado_maki"
  | "tuna_maki"
  | "tamago_maki"
  | "kappa_maki"
  | "mango_maki"
  | "shrimp_maki"
  | "cream_maki"
  | "tempura_maki";

/**
 * Yemek kimliği serbest string: oyuncunun atölyede tasarladığı tarifler de
 * aynı kayda ("YEMEKLER") eklenir ve menüde yerleşiklerle eşit davranır.
 */
export type DishId = string;

export type StationId =
  | "rice"
  | "nori"
  | "tea"
  | "cut_salmon"
  | "cut_tuna"
  | "cut_avocado"
  | "cut_tamago"
  | "ikura"
  | "tofu"
  | "miso"
  | "mochi"
  | "cut_shrimp"
  | "cut_unagi"
  | "cut_cucumber"
  | "cut_mango"
  | "cream_cheese"
  | "tempura"
  | "treat"
  | "mat"
  | "compost";

/** Etkileşim hedefi: bir station ya da bir misafirin tepsisi. */
export type TargetId = StationId | `guest:${string}`;

export interface Player {
  id: PlayerId;
  name: string;
  color: string;
  /** Kişiselleştirilmiş garson görünümü (online oyunda durumla birlikte yayılır). */
  avatar: Avatar;
  hand: IngredientId | null;
  /** Bu gün içinde kaç işe dokundu — gün sonu özeti için. */
  contributions: number;
}

export interface TrayItem {
  ingredient: IngredientId;
  placedBy: PlayerId;
}

export type GuestStatus = "pending" | "happy" | "leaving";

export interface Guest {
  id: string;
  characterId: string;
  seat: number;
  order: DishId[];
  tray: TrayItem[];
  waited: number;
  patience: number;
  state: GuestStatus;
  /** Servis sonrası / gidişte gösterilen replik. */
  line: Localized | null;
  lineTimer: number;
}

export type GamePhase = "menu" | "day" | "day_end";

export interface GameState {
  phase: GamePhase;
  day: number;
  hearts: number;
  dayHearts: number;
  coins: number;
  elapsed: number;
  players: Player[];
  guests: Guest[];
  seatCount: number;
  /** İstasyon ilerlemeleri (0..1 değil, tap sayısı). Paylaşımlı: iki oyuncu aynı anda hızlandırır. */
  progress: Partial<Record<StationId, number>>;
  matSlots: IngredientId[];
  matResult: IngredientId | null;
  guestsArrived: number;
  guestTarget: number;
  spawnTimer: number;
  seed: number;
  /** Satın alınmış dükkân eşyaları (bkz. content.ts DEKORLAR). */
  decor: string[];
  /** Atölyede tasarlanan tarifler yüzünden erken açılan istasyonlar. */
  extraStations: StationId[];
  /** Servis botunun bir sonraki ikramına kalan saniye. */
  botTimer: number;
  /** Gün istatistikleri */
  stats: {
    served: number;
    perfect: number;
    together: number;
    leftEarly: number;
  };
}

export type GameEvent =
  | { kind: "tick"; target: TargetId }
  | { kind: "produced"; ingredient: IngredientId; player: PlayerId }
  | { kind: "dropped"; player: PlayerId }
  | { kind: "placed_on_tray"; guestId: string; ingredient: IngredientId; player: PlayerId }
  | { kind: "taken_from_tray"; guestId: string; ingredient: IngredientId; player: PlayerId }
  | { kind: "placed_on_mat"; ingredient: IngredientId; player: PlayerId }
  | { kind: "treat"; guestId: string; player: PlayerId; bot: boolean }
  | { kind: "serve"; guzel: boolean; hearts: number; together: boolean; guestId: string }
  | { kind: "incomplete"; guestId: string }
  | { kind: "guest_arrived"; guestId: string }
  | { kind: "guest_left"; guestId: string }
  | { kind: "day_over" }
  | { kind: "decor_bought"; id: string }
  | { kind: "error"; onMessage: Localized; player: PlayerId };

export type Action =
  | { kind: "interact"; player: PlayerId; target: TargetId }
  | { kind: "serve"; player: PlayerId; guestId: string }
  | { kind: "tick"; dt: number }
  | { kind: "start_day" }
  | { kind: "next_day" }
  | { kind: "buy_decor"; id: string };

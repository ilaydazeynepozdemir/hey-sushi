import type { Avatar } from "./avatar";
import type { Localized } from "./i18n";

/**
 * Oyunun saf çekirdeği. Burada DOM, tarayıcı ya da render kodu YOK.
 * Sebep: aynı beyni ileride Phaser / Godot / sunucu tarafında da çalıştıracağız.
 */

export type PlayerId = 0 | 1 | 2 | 3;

export type IngredientId =
  | "pirinc"
  | "nori"
  | "cay"
  | "dilim_somon"
  | "dilim_ton"
  | "dilim_avokado"
  | "dilim_tamago"
  | "ikura"
  | "tofu"
  | "miso"
  | "mochi"
  | "dilim_karides"
  | "dilim_yilanbaligi"
  | "dilim_salatalik"
  | "dilim_mango"
  | "krem_peynir"
  | "tempura"
  | "ikram"
  | "maki_somon"
  | "maki_avokado"
  | "maki_ton"
  | "maki_tamago"
  | "maki_salatalik"
  | "maki_mango"
  | "maki_karides"
  | "maki_krem"
  | "maki_tempura";

/**
 * Yemek kimliği serbest string: oyuncunun atölyede tasarladığı tarifler de
 * aynı kayda ("YEMEKLER") eklenir ve menüde yerleşiklerle eşit davranır.
 */
export type DishId = string;

export type StationId =
  | "pirinc"
  | "nori"
  | "cay"
  | "kesim_somon"
  | "kesim_ton"
  | "kesim_avokado"
  | "kesim_tamago"
  | "ikura"
  | "tofu"
  | "miso"
  | "mochi"
  | "kesim_karides"
  | "kesim_yilanbaligi"
  | "kesim_salatalik"
  | "kesim_mango"
  | "krem_peynir"
  | "tempura"
  | "ikram"
  | "mat"
  | "atik";

/** Etkileşim hedefi: bir istasyon ya da bir misafirin tepsisi. */
export type TargetId = StationId | `misafir:${string}`;

export interface Player {
  id: PlayerId;
  ad: string;
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

export type GuestStatus = "bekliyor" | "mutlu" | "gidiyor";

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

export type GamePhase = "menu" | "gun" | "gun_sonu";

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
  | { kind: "uretildi"; ingredient: IngredientId; oyuncu: PlayerId }
  | { kind: "birakildi"; oyuncu: PlayerId }
  | { kind: "tepsiye_kondu"; guestId: string; ingredient: IngredientId; oyuncu: PlayerId }
  | { kind: "tepsiden_alindi"; guestId: string; ingredient: IngredientId; oyuncu: PlayerId }
  | { kind: "mata_kondu"; ingredient: IngredientId; oyuncu: PlayerId }
  | { kind: "ikram"; guestId: string; oyuncu: PlayerId; bot: boolean }
  | { kind: "servis"; guzel: boolean; hearts: number; together: boolean; guestId: string }
  | { kind: "eksik"; guestId: string }
  | { kind: "misafir_geldi"; guestId: string }
  | { kind: "misafir_gitti"; guestId: string }
  | { kind: "gun_bitti" }
  | { kind: "dekor_alindi"; id: string }
  | { kind: "hata"; onMessage: Localized; oyuncu: PlayerId };

export type Action =
  | { kind: "etkilesim"; oyuncu: PlayerId; target: TargetId }
  | { kind: "servis"; oyuncu: PlayerId; guestId: string }
  | { kind: "tick"; dt: number }
  | { kind: "gun_basla" }
  | { kind: "sonraki_gun" }
  | { kind: "dekor_al"; id: string };

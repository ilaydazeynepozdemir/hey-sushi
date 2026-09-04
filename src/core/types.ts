import type { Avatar } from "./avatar";
import type { Localized } from "./dil";

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

export interface Oyuncu {
  id: PlayerId;
  ad: string;
  renk: string;
  /** Kişiselleştirilmiş garson görünümü (online oyunda durumla birlikte yayılır). */
  avatar: Avatar;
  el: MalzemeId | null;
  /** Bu gün içinde kaç işe dokundu — gün sonu özeti için. */
  katki: number;
}

export interface TepsiParcasi {
  malzeme: MalzemeId;
  koyan: PlayerId;
}

export type MisafirDurum = "bekliyor" | "mutlu" | "gidiyor";

export interface Misafir {
  id: string;
  karakterId: string;
  koltuk: number;
  siparis: YemekId[];
  tepsi: TepsiParcasi[];
  bekledi: number;
  sabir: number;
  durum: MisafirDurum;
  /** Servis sonrası / gidişte gösterilen replik. */
  replik: Yerel | null;
  replikSure: number;
}

export type OyunFaz = "menu" | "gun" | "gun_sonu";

export interface OyunDurumu {
  faz: OyunFaz;
  gun: number;
  kalp: number;
  gunKalp: number;
  jeton: number;
  sure: number;
  oyuncular: Oyuncu[];
  misafirler: Misafir[];
  koltukSayisi: number;
  /** İstasyon ilerlemeleri (0..1 değil, tap sayısı). Paylaşımlı: iki oyuncu aynı anda hızlandırır. */
  ilerleme: Partial<Record<IstasyonId, number>>;
  matSlotlari: MalzemeId[];
  matSonuc: MalzemeId | null;
  gelenMisafir: number;
  gunMisafirHedefi: number;
  spawnSayaci: number;
  seed: number;
  /** Satın alınmış dükkân eşyaları (bkz. content.ts DEKORLAR). */
  dekor: string[];
  /** Atölyede tasarlanan tarifler yüzünden erken açılan istasyonlar. */
  ekstraIstasyon: IstasyonId[];
  /** Servis botunun bir sonraki ikramına kalan saniye. */
  botSayaci: number;
  /** Gün istatistikleri */
  istatistik: {
    servis: number;
    mukemmel: number;
    beraber: number;
    kacan: number;
  };
}

export type OyunOlayi =
  | { tip: "tik"; hedef: HedefId }
  | { tip: "uretildi"; malzeme: MalzemeId; oyuncu: PlayerId }
  | { tip: "birakildi"; oyuncu: PlayerId }
  | { tip: "tepsiye_kondu"; misafirId: string; malzeme: MalzemeId; oyuncu: PlayerId }
  | { tip: "tepsiden_alindi"; misafirId: string; malzeme: MalzemeId; oyuncu: PlayerId }
  | { tip: "mata_kondu"; malzeme: MalzemeId; oyuncu: PlayerId }
  | { tip: "ikram"; misafirId: string; oyuncu: PlayerId; bot: boolean }
  | { tip: "servis"; guzel: boolean; kalp: number; beraber: boolean; misafirId: string }
  | { tip: "eksik"; misafirId: string }
  | { tip: "misafir_geldi"; misafirId: string }
  | { tip: "misafir_gitti"; misafirId: string }
  | { tip: "gun_bitti" }
  | { tip: "dekor_alindi"; id: string }
  | { tip: "hata"; mesaj: Yerel; oyuncu: PlayerId };

export type Aksiyon =
  | { tip: "etkilesim"; oyuncu: PlayerId; hedef: HedefId }
  | { tip: "servis"; oyuncu: PlayerId; misafirId: string }
  | { tip: "tik"; dt: number }
  | { tip: "gun_basla" }
  | { tip: "sonraki_gun" }
  | { tip: "dekor_al"; id: string };

/**
 * Garson avatarı — oyuncunun kendini temsil ettiği karakter.
 * Oyuncu nesnesinin içinde durur, böylece online oyunda ev sahibinin
 * durum yayınıyla birlikte diğer oyunculara da otomatik ulaşır.
 */

import { storageGet, storageSet } from "./storage";
import { m, type Localized } from "./i18n";

export type AvatarKind = "kadin" | "erkek";

export interface Avatar {
  /** Garsonun üstünde görünen ad. */
  name: string;
  kind: AvatarKind;
  skin: number;
  /** Saç modeli ve rengi ayrı seçilir. */
  hair: number;
  hairColor: number;
  /** Kıyafet ve önlük rengi ayrı seçilir. */
  outfit: number;
  apron: number;
  /** Saç aksesuarı ile yüz aksesuarı ayrı slotlar — ikisi birden takılabilir. */
  hairAccessory: HairAccessoryId;
  faceAccessory: FaceAccessoryId;
}

export type HairAccessoryId =
  | "yok"
  | "chopstick"
  | "cift_chopstick"
  | "bandana"
  | "cicek"
  | "kedi_toka"
  | "kurdele";

export type FaceAccessoryId = "yok" | "gozluk" | "yuvarlak_gozluk" | "cil";

export const SKIN_TONES = ["#FBE3D0", "#F6D3BC", "#E8B99B", "#D2996F", "#AC7A53"];

export const HAIR_COLORS = ["#3B2F34", "#6B4A3A", "#A9744B", "#E0B25E", "#8B6BA8", "#E08A9B"];

export const OUTFIT_COLORS = [
  "#6D97E6",
  "#E8A33D",
  "#59B98A",
  "#C86FC9",
  "#F2778B",
  "#6FBFC9",
  "#8C7BC4",
  "#5E6B7A",
];

export const APRON_COLORS = ["#FFFDF7", "#FDF0DC", "#DFF0E4", "#FFE3E8", "#E6E9F2", "#F2E4CE"];

export interface HairStyle {
  id: string;
  name: Localized;
  /** Sadece bu tipte öneriliyor; ikisi de seçebilir. */
  onerilen?: AvatarKind;
}

export const HAIR_STYLES: HairStyle[] = [
  { id: "topuz", name: m("Bun", "Topuz"), onerilen: "kadin" },
  { id: "ikiz_topuz", name: m("Twin buns", "İkiz topuz"), onerilen: "kadin" },
  { id: "uzun", name: m("Long", "Uzun"), onerilen: "kadin" },
  { id: "at_kuyrugu", name: m("Ponytail", "At kuyruğu") },
  { id: "kisa", name: m("Short", "Kısa"), onerilen: "erkek" },
  { id: "dagitik", name: m("Messy", "Dağınık"), onerilen: "erkek" },
];

export const HAIR_ACCESSORIES: { id: HairAccessoryId; name: Localized }[] = [
  { id: "yok", name: m("None", "Yok") },
  { id: "chopstick", name: m("Hair stick", "Saç çubuğu") },
  { id: "cift_chopstick", name: m("Double stick", "Çift çubuk") },
  { id: "bandana", name: m("Bandana", "Bandana") },
  { id: "cicek", name: m("Flower", "Çiçek") },
  { id: "kedi_toka", name: m("Cat clip", "Kedi tokası") },
  { id: "kurdele", name: m("Ribbon", "Kurdele") },
];

export const FACE_ACCESSORIES: { id: FaceAccessoryId; name: Localized }[] = [
  { id: "yok", name: m("None", "Yok") },
  { id: "gozluk", name: m("Glasses", "Gözlük") },
  { id: "yuvarlak_gozluk", name: m("Round", "Yuvarlak") },
  { id: "cil", name: m("Freckles", "Çil") },
];

const DEPO = "tsuki.avatar";

export function defaultAvatar(sira = 0): Avatar {
  return {
    name: sira === 0 ? "Chef" : `Server ${sira + 1}`,
    kind: "kadin",
    skin: 1,
    hair: 0,
    hairColor: 0,
    outfit: sira % OUTFIT_COLORS.length,
    apron: 0,
    hairAccessory: "chopstick",
    faceAccessory: "yok",
  };
}

function normalize(a: Partial<Avatar> & { aksesuar?: string }, sira = 0): Avatar {
  const v = defaultAvatar(sira);
  // Eski kayıtlarda tek bir "aksesuar" alanı vardı; doğru slota taşı.
  const eski = a.aksesuar;
  const eskiSac = eski && eski !== "gozluk" ? (eski as HairAccessoryId) : undefined;
  const eskiYuz = eski === "gozluk" ? ("gozluk" as FaceAccessoryId) : undefined;

  // Eski kayıt taşınıyorsa boş kalan slot "yok" olmalı; varsayılan takı eklenmemeli.
  const eskiVar = typeof eski === "string";
  const sacAks = a.hairAccessory ?? eskiSac ?? (eskiVar ? "yok" : undefined);
  const yuzAks = a.faceAccessory ?? eskiYuz ?? (eskiVar ? "yok" : undefined);

  return {
    name: (typeof a.name === "string" && a.name.trim().slice(0, 14)) || v.name,
    kind: a.kind === "erkek" ? "erkek" : "kadin",
    skin: clampIndex(a.skin, SKIN_TONES.length, v.skin),
    hair: clampIndex(a.hair, HAIR_STYLES.length, v.hair),
    hairColor: clampIndex(a.hairColor, HAIR_COLORS.length, v.hairColor),
    outfit: clampIndex(a.outfit, OUTFIT_COLORS.length, v.outfit),
    apron: clampIndex(a.apron, APRON_COLORS.length, v.apron),
    hairAccessory: HAIR_ACCESSORIES.some((x) => x.id === sacAks) ? sacAks! : v.hairAccessory,
    faceAccessory: FACE_ACCESSORIES.some((x) => x.id === yuzAks) ? yuzAks! : v.faceAccessory,
  };
}

function clampIndex(deger: unknown, uzunluk: number, varsayilan: number): number {
  return typeof deger === "number" && deger >= 0 && deger < uzunluk ? Math.floor(deger) : varsayilan;
}

export function loadAvatar(): Avatar {
  try {
    const ham = storageGet(DEPO);
    if (!ham) return defaultAvatar();
    return normalize(JSON.parse(ham) as Partial<Avatar>);
  } catch {
    return defaultAvatar();
  }
}

export function saveAvatar(a: Avatar) {
  try {
    storageSet(DEPO, JSON.stringify(a));
  } catch {
    /* özel sekmede yazamayabiliriz */
  }
}

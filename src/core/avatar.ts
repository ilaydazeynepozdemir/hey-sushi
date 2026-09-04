/**
 * Garson avatarı — oyuncunun kendini temsil ettiği karakter.
 * Oyuncu nesnesinin içinde durur, böylece online oyunda ev sahibinin
 * durum yayınıyla birlikte diğer oyunculara da otomatik ulaşır.
 */

import { storageGet, storageSet } from "./depo";
import { m, type Localized } from "./dil";

export type AvatarKind = "kadin" | "erkek";

export interface Avatar {
  /** Garsonun üstünde görünen ad. */
  ad: string;
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
  ad: Localized;
  /** Sadece bu tipte öneriliyor; ikisi de seçebilir. */
  onerilen?: AvatarKind;
}

export const HAIR_STYLES: HairStyle[] = [
  { id: "topuz", ad: m("Bun", "Topuz"), onerilen: "kadin" },
  { id: "ikiz_topuz", ad: m("Twin buns", "İkiz topuz"), onerilen: "kadin" },
  { id: "uzun", ad: m("Long", "Uzun"), onerilen: "kadin" },
  { id: "at_kuyrugu", ad: m("Ponytail", "At kuyruğu") },
  { id: "kisa", ad: m("Short", "Kısa"), onerilen: "erkek" },
  { id: "dagitik", ad: m("Messy", "Dağınık"), onerilen: "erkek" },
];

export const HAIR_ACCESSORIES: { id: HairAccessoryId; ad: Localized }[] = [
  { id: "yok", ad: m("None", "Yok") },
  { id: "chopstick", ad: m("Hair stick", "Saç çubuğu") },
  { id: "cift_chopstick", ad: m("Double stick", "Çift çubuk") },
  { id: "bandana", ad: m("Bandana", "Bandana") },
  { id: "cicek", ad: m("Flower", "Çiçek") },
  { id: "kedi_toka", ad: m("Cat clip", "Kedi tokası") },
  { id: "kurdele", ad: m("Ribbon", "Kurdele") },
];

export const FACE_ACCESSORIES: { id: FaceAccessoryId; ad: Localized }[] = [
  { id: "yok", ad: m("None", "Yok") },
  { id: "gozluk", ad: m("Glasses", "Gözlük") },
  { id: "yuvarlak_gozluk", ad: m("Round", "Yuvarlak") },
  { id: "cil", ad: m("Freckles", "Çil") },
];

const DEPO = "tsuki.avatar";

export function defaultAvatar(sira = 0): Avatar {
  return {
    ad: sira === 0 ? "Chef" : `Server ${sira + 1}`,
    tip: "kadin",
    ten: 1,
    sac: 0,
    sacRenk: 0,
    uniforma: sira % UNIFORMALAR.length,
    onluk: 0,
    sacAksesuar: "chopstick",
    yuzAksesuar: "yok",
  };
}

function duzelt(a: Partial<Avatar> & { aksesuar?: string }, sira = 0): Avatar {
  const v = varsayilanAvatar(sira);
  // Eski kayıtlarda tek bir "aksesuar" alanı vardı; doğru slota taşı.
  const eski = a.aksesuar;
  const eskiSac = eski && eski !== "gozluk" ? (eski as SacAksesuarId) : undefined;
  const eskiYuz = eski === "gozluk" ? ("gozluk" as YuzAksesuarId) : undefined;

  // Eski kayıt taşınıyorsa boş kalan slot "yok" olmalı; varsayılan takı eklenmemeli.
  const eskiVar = typeof eski === "string";
  const sacAks = a.sacAksesuar ?? eskiSac ?? (eskiVar ? "yok" : undefined);
  const yuzAks = a.yuzAksesuar ?? eskiYuz ?? (eskiVar ? "yok" : undefined);

  return {
    ad: (typeof a.ad === "string" && a.ad.trim().slice(0, 14)) || v.ad,
    tip: a.tip === "erkek" ? "erkek" : "kadin",
    ten: sinirla(a.ten, TENLER.length, v.ten),
    sac: sinirla(a.sac, SACLAR.length, v.sac),
    sacRenk: sinirla(a.sacRenk, SAC_RENKLERI.length, v.sacRenk),
    uniforma: sinirla(a.uniforma, UNIFORMALAR.length, v.uniforma),
    onluk: sinirla(a.onluk, ONLUKLER.length, v.onluk),
    sacAksesuar: SAC_AKSESUARLARI.some((x) => x.id === sacAks) ? sacAks! : v.sacAksesuar,
    yuzAksesuar: YUZ_AKSESUARLARI.some((x) => x.id === yuzAks) ? yuzAks! : v.yuzAksesuar,
  };
}

function sinirla(deger: unknown, uzunluk: number, varsayilan: number): number {
  return typeof deger === "number" && deger >= 0 && deger < uzunluk ? Math.floor(deger) : varsayilan;
}

export function avatarYukle(): Avatar {
  try {
    const ham = depoOku(DEPO);
    if (!ham) return varsayilanAvatar();
    return duzelt(JSON.parse(ham) as Partial<Avatar>);
  } catch {
    return varsayilanAvatar();
  }
}

export function avatarKaydet(a: Avatar) {
  try {
    depoYaz(DEPO, JSON.stringify(a));
  } catch {
    /* özel sekmede yazamayabiliriz */
  }
}

/**
 * Tarif Atölyesi — oyuncunun kendi suşisini tasarlaması.
 * Şimdilik tamamen çevrimdışı (localStorage). Global menü oylaması bunun
 * üstüne, aynı veri şekliyle eklenecek (bkz. ROADMAP.md).
 */
import { depoOku, depoYaz } from "./depo";
import {
  MAKI_TARIFLERI,
  MALZEMELER,
  YEMEKLER,
  istasyonlarGun,
  malzemeIstasyonlari,
  yemekKaydet,
  yemekSil,
} from "./content";
import { m, y, type Yerel } from "./dil";
import { MALZEME_RENK, ozelTarifCizim, sanatEkle } from "../ui/art";
import type { IstasyonId, MalzemeId } from "./types";

export type TabanId = "nigiri" | "maki" | "gunkan";
export type GarniturId =
  | "susam"
  | "siyah_susam"
  | "yesil_sogan"
  | "wasabi"
  | "ikura"
  | "limon"
  | "nori_serit";

export interface Taban {
  id: TabanId;
  ad: Yerel;
  aciklama: Yerel;
  kalp: number;
  /** İç malzeme dışındaki sabit gereksinimler. */
  temel: MalzemeId[];
  /** Bu tabanda kullanılabilecek iç malzemeler. */
  izinli: MalzemeId[];
}

export const TABANLAR: Taban[] = [
  {
    id: "nigiri",
    ad: m("Nigiri", "Nigiri"),
    aciklama: m("A rice pillow with a topping.", "Pirinç yastığı, üstünde iç malzeme."),
    kalp: 3,
    temel: ["pirinc"],
    izinli: ["dilim_somon", "dilim_ton", "dilim_avokado", "dilim_tamago", "dilim_karides", "dilim_yilanbaligi", "dilim_mango", "dilim_salatalik", "krem_peynir", "tempura", "ikura", "tofu"],
  },
  {
    id: "maki",
    ad: m("Maki", "Maki"),
    aciklama: m("Rolled on the mat. Needs maki rolled beforehand.", "Sarma matında rulo. Matta sarılmış maki ister."),
    kalp: 6,
    temel: [],
    izinli: ["maki_somon", "maki_ton", "maki_avokado", "maki_tamago", "maki_salatalik", "maki_mango", "maki_karides", "maki_krem", "maki_tempura"],
  },
  {
    id: "gunkan",
    ad: m("Gunkan", "Gunkan"),
    aciklama: m("A nori boat, filled up.", "Nori kayığı, içi dolu."),
    kalp: 6,
    temel: ["pirinc", "nori"],
    izinli: ["ikura", "dilim_somon", "dilim_ton", "dilim_avokado", "dilim_karides", "dilim_mango", "krem_peynir", "tempura", "tofu"],
  },
];

export const TABAN_MAP: Record<TabanId, Taban> = Object.fromEntries(
  TABANLAR.map((t) => [t.id, t]),
) as Record<TabanId, Taban>;

export const GARNITURLER: { id: GarniturId; ad: Yerel; kalp: number }[] = [
  { id: "susam", ad: m("Sesame", "Susam"), kalp: 1 },
  { id: "siyah_susam", ad: m("Black sesame", "Siyah susam"), kalp: 1 },
  { id: "yesil_sogan", ad: m("Spring onion", "Yeşil soğan"), kalp: 1 },
  { id: "wasabi", ad: m("Wasabi", "Wasabi"), kalp: 1 },
  { id: "limon", ad: m("Lemon", "Limon"), kalp: 1 },
  { id: "nori_serit", ad: m("Nori strip", "Nori şeridi"), kalp: 2 },
  { id: "ikura", ad: m("Ikura beads", "İkura taneleri"), kalp: 2 },
];

/** Görselde dört garnitür yuvası var; seçim onunla sınırlı. */
export const GARNITUR_LIMIT = 4;
/** Bir tarifte en fazla dört iç malzeme. */
export const IC_LIMIT = 4;

export interface OzelTarif {
  id: string;
  ad: string;
  hikaye: string;
  taban: TabanId;
  ic: MalzemeId[];
  garnitur: GarniturId[];
  /** Kaçıncı günde tasarlandı — menüye o günden itibaren girer. */
  gun: number;
}

const DEPO = "tsuki.tarifler";

export function tarifKalp(t: Pick<OzelTarif, "taban" | "ic" | "garnitur">): number {
  const taban = TABAN_MAP[t.taban];
  const garnitur = t.garnitur.reduce(
    (toplam, id) => toplam + (GARNITURLER.find((g) => g.id === id)?.kalp ?? 0),
    0,
  );
  return taban.kalp + Math.max(0, t.ic.length - 1) * 2 + garnitur;
}

export function tarifGerek(t: Pick<OzelTarif, "taban" | "ic">): MalzemeId[] {
  return [...TABAN_MAP[t.taban].temel, ...t.ic];
}

export function tarifCizim(t: Pick<OzelTarif, "taban" | "ic" | "garnitur">): string {
  const renkler = t.ic.map((m) => MALZEME_RENK[m] ?? MALZEME_RENK.dilim_somon!) as [string, string][];
  return ozelTarifCizim(t.taban, renkler, t.garnitur);
}

/** Tarifi menüye ve sanat kaydına yazar. */
export function tarifiUygula(t: OzelTarif) {
  const cizimId = `ozel_${t.id}`;
  sanatEkle(cizimId, tarifCizim(t));
  yemekKaydet(t.id, {
    ad: m(t.ad, t.ad),
    ikon: cizimId,
    gerek: tarifGerek(t),
    kalp: tarifKalp(t),
    gun: t.gun,
    ozel: true,
    hikaye: t.hikaye,
  });
}

export function tarifiKaldir(id: string) {
  yemekSil(id);
  kaydet(hepsi().filter((t) => t.id !== id));
}

export function hepsi(): OzelTarif[] {
  try {
    const ham = depoOku(DEPO);
    if (!ham) return [];
    const liste = JSON.parse(ham) as OzelTarif[];
    if (!Array.isArray(liste)) return [];
    // v0.2 kayıtlarında garnitür tek bir stringdi — diziye taşı.
    return liste.map((t) => ({
      ...t,
      garnitur: Array.isArray(t.garnitur)
        ? t.garnitur
        : t.garnitur && t.garnitur !== ("yok" as unknown as GarniturId)
          ? [t.garnitur as GarniturId]
          : [],
    }));
  } catch {
    return [];
  }
}

function kaydet(liste: OzelTarif[]) {
  try {
    depoYaz(DEPO, JSON.stringify(liste));
  } catch {
    /* özel sekmede yazamayabiliriz — oyun yine çalışsın */
  }
}

export function tarifEkle(t: Omit<OzelTarif, "id">): OzelTarif {
  const tam: OzelTarif = { ...t, id: `ozel_${Date.now().toString(36)}` };
  kaydet([...hepsi(), tam]);
  tarifiUygula(tam);
  return tam;
}

/** Açılışta kayıtlı tarifleri menüye geri yükler. */
export function tarifleriYukle() {
  for (const t of hepsi()) tarifiUygula(t);
}

/** Bir malzemenin insan okunur adı (panelde kullanılıyor). */
export function malzemeAdi(id: MalzemeId): string {
  return y(MALZEMELER[id].ad);
}

export function tarifVarMi(ad: string): boolean {
  return Object.values(YEMEKLER).some((v) => y(v.ad).toLowerCase() === ad.trim().toLowerCase());
}


/** O gün üretilebilen malzemeler — atölyede sadece bunlar seçilebilir. */
export function uretilebilirMalzemeler(gun: number, ekstra: IstasyonId[] = []): Set<MalzemeId> {
  const acik = istasyonlarGun(gun, ekstra);
  const set = new Set<MalzemeId>();
  for (const i of acik) if (i.uretir) set.add(i.uretir);
  if (acik.some((i) => i.id === "mat")) {
    for (const t of MAKI_TARIFLERI) if (set.has(t.ic)) set.add(t.sonuc);
  }
  return set;
}

/**
 * Taban için seçilebilecek iç malzemeler. Artık hepsi listelenir: henüz açılmamış
 * olanlar `kilitli` işaretiyle gelir ve tarif kaydedilince istasyonları açılır —
 * böylece tasarlanan her tarif oyunda gerçekten yapılabilir olur.
 */
export function icSecenekleri(
  gun: number,
  taban: TabanId,
  ekstra: IstasyonId[] = [],
): { malzeme: MalzemeId; kilitli: boolean }[] {
  const uretilebilir = uretilebilirMalzemeler(gun, ekstra);
  return TABAN_MAP[taban].izinli.map((m) => ({ malzeme: m, kilitli: !uretilebilir.has(m) }));
}

/** Tarifin gerektirdiği ama henüz açık olmayan istasyonlar. */
export function tarifinAcacagiIstasyonlar(
  t: Pick<OzelTarif, "taban" | "ic">,
  gun: number,
  ekstra: IstasyonId[] = [],
): IstasyonId[] {
  const acik = new Set(istasyonlarGun(gun, ekstra).map((i) => i.id));
  const gerekli = new Set<IstasyonId>();
  for (const malzeme of tarifGerek(t)) {
    for (const ist of malzemeIstasyonlari(malzeme)) {
      if (!acik.has(ist)) gerekli.add(ist);
    }
  }
  return [...gerekli];
}

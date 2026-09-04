/**
 * Tarif Atölyesi — oyuncunun kendi suşisini tasarlaması.
 * Şimdilik tamamen çevrimdışı (localStorage). Global menü oylaması bunun
 * üstüne, aynı veri şekliyle eklenecek (bkz. ROADMAP.md).
 */
import { storageGet, storageSet } from "./storage";
import {
  MAKI_RECIPES,
  INGREDIENTS,
  DISHES,
  stationsForDay,
  stationsForIngredient,
  registerDish,
  unregisterDish,
} from "./content";
import { m, y, type Localized } from "./i18n";
import { INGREDIENT_COLORS, customRecipeArt, addArt } from "../ui/art";
import type { StationId, IngredientId } from "./types";

export type BaseId = "nigiri" | "maki" | "gunkan";
export type GarnishId =
  | "susam"
  | "siyah_susam"
  | "yesil_sogan"
  | "wasabi"
  | "ikura"
  | "limon"
  | "nori_serit";

export interface Base {
  id: BaseId;
  ad: Localized;
  description: Localized;
  hearts: number;
  /** İç malzeme dışındaki sabit gereksinimler. */
  basics: IngredientId[];
  /** Bu tabanda kullanılabilecek iç malzemeler. */
  allowed: IngredientId[];
}

export const BASES: Base[] = [
  {
    id: "nigiri",
    ad: m("Nigiri", "Nigiri"),
    description: m("A rice pillow with a topping.", "Pirinç yastığı, üstünde iç malzeme."),
    hearts: 3,
    basics: ["pirinc"],
    allowed: ["dilim_somon", "dilim_ton", "dilim_avokado", "dilim_tamago", "dilim_karides", "dilim_yilanbaligi", "dilim_mango", "dilim_salatalik", "krem_peynir", "tempura", "ikura", "tofu"],
  },
  {
    id: "maki",
    ad: m("Maki", "Maki"),
    description: m("Rolled on the mat. Needs maki rolled beforehand.", "Sarma matında rulo. Matta sarılmış maki ister."),
    hearts: 6,
    basics: [],
    allowed: ["maki_somon", "maki_ton", "maki_avokado", "maki_tamago", "maki_salatalik", "maki_mango", "maki_karides", "maki_krem", "maki_tempura"],
  },
  {
    id: "gunkan",
    ad: m("Gunkan", "Gunkan"),
    description: m("A nori boat, filled up.", "Nori kayığı, içi dolu."),
    hearts: 6,
    basics: ["pirinc", "nori"],
    allowed: ["ikura", "dilim_somon", "dilim_ton", "dilim_avokado", "dilim_karides", "dilim_mango", "krem_peynir", "tempura", "tofu"],
  },
];

export const BASE_MAP: Record<BaseId, Base> = Object.fromEntries(
  BASES.map((t) => [t.id, t]),
) as Record<BaseId, Base>;

export const GARNISHES: { id: GarnishId; ad: Localized; hearts: number }[] = [
  { id: "susam", ad: m("Sesame", "Susam"), hearts: 1 },
  { id: "siyah_susam", ad: m("Black sesame", "Siyah susam"), hearts: 1 },
  { id: "yesil_sogan", ad: m("Spring onion", "Yeşil soğan"), hearts: 1 },
  { id: "wasabi", ad: m("Wasabi", "Wasabi"), hearts: 1 },
  { id: "limon", ad: m("Lemon", "Limon"), hearts: 1 },
  { id: "nori_serit", ad: m("Nori strip", "Nori şeridi"), hearts: 2 },
  { id: "ikura", ad: m("Ikura beads", "İkura taneleri"), hearts: 2 },
];

/** Görselde dört garnitür yuvası var; seçim onunla sınırlı. */
export const GARNISH_LIMIT = 4;
/** Bir tarifte en fazla dört iç malzeme. */
export const FILLING_LIMIT = 4;

export interface CustomRecipe {
  id: string;
  ad: string;
  story: string;
  base: BaseId;
  filling: IngredientId[];
  garnish: GarnishId[];
  /** Kaçıncı günde tasarlandı — menüye o günden itibaren girer. */
  day: number;
}

const DEPO = "tsuki.tarifler";

export function recipeHearts(t: Pick<CustomRecipe, "base" | "filling" | "garnish">): number {
  const base = BASE_MAP[t.base];
  const garnish = t.garnish.reduce(
    (toplam, id) => toplam + (GARNISHES.find((g) => g.id === id)?.hearts ?? 0),
    0,
  );
  return base.hearts + Math.max(0, t.filling.length - 1) * 2 + garnish;
}

export function recipeNeeds(t: Pick<CustomRecipe, "base" | "filling">): IngredientId[] {
  return [...BASE_MAP[t.base].basics, ...t.filling];
}

export function recipeArt(t: Pick<CustomRecipe, "base" | "filling" | "garnish">): string {
  const renkler = t.filling.map((m) => INGREDIENT_COLORS[m] ?? INGREDIENT_COLORS.dilim_somon!) as [string, string][];
  return customRecipeArt(t.base, renkler, t.garnish);
}

/** Tarifi menüye ve sanat kaydına yazar. */
export function applyRecipe(t: CustomRecipe) {
  const artId = `ozel_${t.id}`;
  addArt(artId, recipeArt(t));
  registerDish(t.id, {
    ad: m(t.ad, t.ad),
    icon: artId,
    needs: recipeNeeds(t),
    hearts: recipeHearts(t),
    day: t.day,
    ozel: true,
    story: t.story,
  });
}

export function removeRecipe(id: string) {
  unregisterDish(id);
  kaydet(allRecipes().filter((t) => t.id !== id));
}

export function allRecipes(): CustomRecipe[] {
  try {
    const ham = storageGet(DEPO);
    if (!ham) return [];
    const liste = JSON.parse(ham) as CustomRecipe[];
    if (!Array.isArray(liste)) return [];
    // v0.2 kayıtlarında garnitür tek bir stringdi — diziye taşı.
    return liste.map((t) => ({
      ...t,
      garnish: Array.isArray(t.garnish)
        ? t.garnish
        : t.garnish && t.garnish !== ("yok" as unknown as GarnishId)
          ? [t.garnish as GarnishId]
          : [],
    }));
  } catch {
    return [];
  }
}

function kaydet(liste: CustomRecipe[]) {
  try {
    storageSet(DEPO, JSON.stringify(liste));
  } catch {
    /* özel sekmede yazamayabiliriz — oyun yine çalışsın */
  }
}

export function addRecipe(t: Omit<CustomRecipe, "id">): CustomRecipe {
  const tam: CustomRecipe = { ...t, id: `ozel_${Date.now().toString(36)}` };
  kaydet([...allRecipes(), tam]);
  applyRecipe(tam);
  return tam;
}

/** Açılışta kayıtlı tarifleri menüye geri yükler. */
export function loadRecipes() {
  for (const t of allRecipes()) applyRecipe(t);
}

/** Bir malzemenin insan okunur adı (panelde kullanılıyor). */
export function ingredientName(id: IngredientId): string {
  return y(INGREDIENTS[id].ad);
}

export function recipeNameTaken(ad: string): boolean {
  return Object.values(DISHES).some((v) => y(v.ad).toLowerCase() === ad.trim().toLowerCase());
}


/** O gün üretilebilen malzemeler — atölyede sadece bunlar seçilebilir. */
export function producibleIngredients(day: number, ekstra: StationId[] = []): Set<IngredientId> {
  const acik = stationsForDay(day, ekstra);
  const set = new Set<IngredientId>();
  for (const i of acik) if (i.produces) set.add(i.produces);
  if (acik.some((i) => i.id === "mat")) {
    for (const t of MAKI_RECIPES) if (set.has(t.filling)) set.add(t.sonuc);
  }
  return set;
}

/**
 * Taban için seçilebilecek iç malzemeler. Artık hepsi listelenir: henüz açılmamış
 * olanlar `kilitli` işaretiyle gelir ve tarif kaydedilince istasyonları açılır —
 * böylece tasarlanan her tarif oyunda gerçekten yapılabilir olur.
 */
export function fillingOptions(
  day: number,
  base: BaseId,
  ekstra: StationId[] = [],
): { ingredient: IngredientId; kilitli: boolean }[] {
  const uretilebilir = producibleIngredients(day, ekstra);
  return BASE_MAP[base].allowed.map((m) => ({ ingredient: m, kilitli: !uretilebilir.has(m) }));
}

/** Tarifin gerektirdiği ama henüz açık olmayan istasyonlar. */
export function stationsRecipeUnlocks(
  t: Pick<CustomRecipe, "base" | "filling">,
  day: number,
  ekstra: StationId[] = [],
): StationId[] {
  const acik = new Set(stationsForDay(day, ekstra).map((i) => i.id));
  const gerekli = new Set<StationId>();
  for (const ingredient of recipeNeeds(t)) {
    for (const ist of stationsForIngredient(ingredient)) {
      if (!acik.has(ist)) gerekli.add(ist);
    }
  }
  return [...gerekli];
}

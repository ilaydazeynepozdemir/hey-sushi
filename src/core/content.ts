import { m, type Localized } from "./i18n";
import type { StationId, IngredientId, DishId } from "./types";

export interface Ingredient {
  name: Localized;
  icon: string;
}

export const INGREDIENTS: Record<IngredientId, Ingredient> = {
  rice: { name: m("Rice ball", "Pirinç topu"), icon: "rice" },
  nori: { name: m("Nori", "Nori"), icon: "nori" },
  tea: { name: m("Green tea", "Yeşil çay"), icon: "tea" },
  salmon_slice: { name: m("Salmon slice", "Somon dilimi"), icon: "salmon_slice" },
  tuna_slice: { name: m("Tuna slice", "Ton dilimi"), icon: "tuna_slice" },
  avocado: { name: m("Avocado", "Avokado"), icon: "avocado" },
  tamago: { name: m("Tamago", "Tamago"), icon: "tamago" },
  ikura: { name: m("Ikura", "İkura"), icon: "ikura" },
  tofu: { name: m("Tofu pouch", "Tofu kesesi"), icon: "tofu" },
  miso: { name: m("Miso soup", "Miso çorbası"), icon: "miso" },
  mochi: { name: m("Mochi", "Mochi"), icon: "mochi" },
  salmon_maki: { name: m("Salmon maki", "Somon maki"), icon: "salmon_maki" },
  avocado_maki: { name: m("Avocado maki", "Avokado maki"), icon: "avocado_maki" },
  tuna_maki: { name: m("Tuna maki", "Ton maki"), icon: "tuna_maki" },
  tamago_maki: { name: m("Tamago maki", "Tamago maki"), icon: "tamago_maki" },
  shrimp: { name: m("Shrimp", "Karides"), icon: "shrimp" },
  unagi: { name: m("Unagi", "Unagi"), icon: "unagi" },
  cucumber: { name: m("Cucumber", "Salatalık"), icon: "cucumber" },
  mango: { name: m("Mango", "Mango"), icon: "mango" },
  cream_cheese: { name: m("Cream cheese", "Krem peynir"), icon: "cream_cheese" },
  tempura: { name: m("Tempura", "Tempura"), icon: "tempura" },
  kappa_maki: { name: m("Kappa maki", "Kappa maki"), icon: "kappa_maki" },
  mango_maki: { name: m("Mango maki", "Mango maki"), icon: "mango_maki" },
  shrimp_maki: { name: m("Shrimp maki", "Karides maki"), icon: "shrimp_maki" },
  cream_maki: { name: m("Cream cheese maki", "Krem peynirli maki"), icon: "cream_maki" },
  tempura_maki: { name: m("Tempura maki", "Tempura maki"), icon: "tempura_maki" },
  treat: { name: m("Welcome drink", "İkram içeceği"), icon: "treat" },
};

export interface Dish {
  name: Localized;
  icon: string;
  /** Tepsiye konması gereken malzemeler (çoklu küme). */
  needs: IngredientId[];
  hearts: number;
  /** Kaçıncı günden itibaren menüde. */
  day: number;
  /** Atölyede oyuncunun tasarladığı tarif mi? */
  ozel?: boolean;
  /** Özel tarifler için gömülü SVG (art.ts kaydına eklenir). */
  cizim?: string;
  /** Oyuncunun tarife yazdığı kısa not. */
  story?: string;
}

export const DISHES: Record<string, Dish> = {
  nigiri_salmon: { name: m("Salmon Nigiri", "Somon Nigiri"), icon: "dish_nigiri_salmon", needs: ["rice", "salmon_slice"], hearts: 3, day: 1 },
  tea: { name: m("Green Tea", "Yeşil Çay"), icon: "tea", needs: ["tea"], hearts: 1, day: 1 },
  nigiri_tuna: { name: m("Tuna Nigiri", "Ton Nigiri"), icon: "dish_nigiri_tuna", needs: ["rice", "tuna_slice"], hearts: 3, day: 2 },
  avocado_maki: { name: m("Avocado Maki", "Avokado Maki"), icon: "dish_maki_avocado", needs: ["avocado_maki"], hearts: 5, day: 2 },
  nigiri_tamago: { name: m("Tamago Nigiri", "Tamago Nigiri"), icon: "dish_nigiri_tamago", needs: ["rice", "tamago"], hearts: 4, day: 3 },
  salmon_maki: { name: m("Salmon Maki", "Somon Maki"), icon: "dish_maki_salmon", needs: ["salmon_maki"], hearts: 6, day: 3 },
  miso_soup: { name: m("Miso Soup", "Miso Çorbası"), icon: "miso", needs: ["miso"], hearts: 2, day: 2 },
  sashimi_salmon: { name: m("Salmon Sashimi", "Somon Sashimi"), icon: "dish_sashimi", needs: ["salmon_slice", "salmon_slice"], hearts: 4, day: 3 },
  inari: { name: m("Inari", "İnari"), icon: "dish_inari", needs: ["tofu", "rice"], hearts: 4, day: 3 },
  gunkan_ikura: { name: m("Ikura Gunkan", "İkura Gunkan"), icon: "dish_gunkan", needs: ["rice", "nori", "ikura"], hearts: 7, day: 4 },
  tuna_maki: { name: m("Tuna Maki", "Ton Maki"), icon: "dish_maki_tuna", needs: ["tuna_maki"], hearts: 6, day: 5 },
  mochi_dessert: { name: m("Mochi", "Mochi"), icon: "mochi", needs: ["mochi"], hearts: 3, day: 5 },
  tamago_maki: { name: m("Tamago Maki", "Tamago Maki"), icon: "dish_maki_tamago", needs: ["tamago_maki"], hearts: 5, day: 6 },
  nigiri_shrimp: { name: m("Shrimp Nigiri", "Karides Nigiri"), icon: "dish_nigiri_shrimp", needs: ["rice", "shrimp"], hearts: 4, day: 6 },
  kappa_maki: { name: m("Kappa Maki", "Kappa Maki"), icon: "dish_maki_cucumber", needs: ["kappa_maki"], hearts: 5, day: 6 },
  nigiri_unagi: { name: m("Unagi Nigiri", "Unagi Nigiri"), icon: "dish_nigiri_unagi", needs: ["rice", "unagi"], hearts: 6, day: 7 },
  philadelphia: { name: m("Philadelphia", "Philadelphia"), icon: "dish_maki_cream", needs: ["cream_maki", "salmon_slice"], hearts: 8, day: 7 },
  mango_maki: { name: m("Mango Maki", "Mango Maki"), icon: "dish_maki_mango", needs: ["mango_maki"], hearts: 6, day: 8 },
  tempura_roll: { name: m("Tempura Roll", "Tempura Roll"), icon: "dish_maki_tempura", needs: ["tempura_maki", "avocado"], hearts: 9, day: 9 },
  gunkan_shrimp: { name: m("Shrimp Gunkan", "Karides Gunkan"), icon: "dish_gunkan", needs: ["rice", "nori", "shrimp"], hearts: 7, day: 8 },
};

const UNKNOWN_DISH: Dish = { name: m("?", "?"), icon: "empty", needs: [], hearts: 1, day: 1 };

const UNKNOWN_INGREDIENT: Ingredient = { name: m("?", "?"), icon: "blank" };

/**
 * Güvenli malzeme erişimi. Eski bir kayıt artık var olmayan bir kimliğe
 * işaret edebilir (kimlikler sürüm 0.2'de İngilizceye çevrildi); bu durumda
 * oyun çökmek yerine boş bir simge gösterir.
 */
export function ingredient(id: string): Ingredient {
  return INGREDIENTS[id as IngredientId] ?? UNKNOWN_INGREDIENT;
}

/** Güvenli erişim: menü çalışma anında genişleyebildiği için indeksleme yerine bunu kullan. */
export function dish(id: string): Dish {
  return DISHES[id] ?? UNKNOWN_DISH;
}

/** Atölyede tasarlanan tarifi menüye kaydeder. */
export function registerDish(id: string, bilgi: Dish) {
  DISHES[id] = bilgi;
}

export function unregisterDish(id: string) {
  delete DISHES[id];
}

export interface Station {
  id: StationId;
  name: Localized;
  icon: string;
  /** Kaçıncı günden itibaren tezgâhta. Erken günler sade kalsın diye kademeli açılır. */
  day: number;
  /** Kaç dokunuşta üretir. Paylaşımlı ilerleme: iki oyuncu birlikte hızlandırır. */
  taps: number;
  produces?: IngredientId;
  description: Localized;
}

export const STATIONS: Station[] = [
  { id: "rice", name: m("Rice", "Pirinç"), icon: "st_rice", day: 1, taps: 3, produces: "rice", description: m("Press and roll", "Bastır, yuvarla") },
  { id: "nori", name: m("Nori", "Nori"), icon: "st_nori", day: 1, taps: 1, produces: "nori", description: m("Take a sheet", "Raftan al") },
  { id: "cut_salmon", name: m("Salmon", "Somon"), icon: "salmon_slice", day: 1, taps: 3, produces: "salmon_slice", description: m("Slice it", "Dilimle") },
  { id: "tea", name: m("Tea", "Çay"), icon: "st_tea", day: 1, taps: 2, produces: "tea", description: m("Steep it", "Demle") },
  { id: "cut_tuna", name: m("Tuna", "Ton"), icon: "tuna_slice", day: 2, taps: 3, produces: "tuna_slice", description: m("Slice it", "Dilimle") },
  { id: "cut_avocado", name: m("Avocado", "Avokado"), icon: "avocado", day: 2, taps: 2, produces: "avocado", description: m("Slice it", "Dilimle") },
  { id: "mat", name: m("Rolling Mat", "Sarma Matı"), icon: "st_mat", day: 2, taps: 3, description: m("Nori + rice + filling → roll", "Nori + pirinç + iç → sar") },
  { id: "miso", name: m("Miso", "Miso"), icon: "st_miso", day: 2, taps: 2, produces: "miso", description: m("Ladle it out", "Kâseye koy") },
  { id: "cut_tamago", name: m("Tamago", "Tamago"), icon: "tamago", day: 3, taps: 3, produces: "tamago", description: m("Cook and cut", "Pişir, kes") },
  { id: "tofu", name: m("Tofu", "Tofu"), icon: "st_tofu", day: 3, taps: 2, produces: "tofu", description: m("Open the pouch", "Keseyi aç") },
  { id: "ikura", name: m("Ikura", "İkura"), icon: "ikura", day: 4, taps: 2, produces: "ikura", description: m("Spoon it", "Kaşıkla") },
  { id: "mochi", name: m("Mochi", "Mochi"), icon: "st_mochi", day: 5, taps: 3, produces: "mochi", description: m("Knead and shape", "Yoğur, şekillendir") },
  { id: "cut_shrimp", name: m("Shrimp", "Karides"), icon: "shrimp", day: 6, taps: 3, produces: "shrimp", description: m("Peel and butterfly", "Ayıkla, aç") },
  { id: "cut_cucumber", name: m("Cucumber", "Salatalık"), icon: "cucumber", day: 6, taps: 2, produces: "cucumber", description: m("Slice thin", "İnce dilimle") },
  { id: "cut_unagi", name: m("Unagi", "Unagi"), icon: "unagi", day: 7, taps: 3, produces: "unagi", description: m("Glaze and grill", "Sosla, ızgara") },
  { id: "cream_cheese", name: m("Cream Cheese", "Krem Peynir"), icon: "cream_cheese", day: 7, taps: 2, produces: "cream_cheese", description: m("Spoon it", "Kaşıkla") },
  { id: "cut_mango", name: m("Mango", "Mango"), icon: "mango", day: 8, taps: 2, produces: "mango", description: m("Peel and slice", "Soy, dilimle") },
  { id: "tempura", name: m("Tempura", "Tempura"), icon: "tempura", day: 9, taps: 3, produces: "tempura", description: m("Batter and fry", "Bandır, kızart") },
  { id: "treat", name: m("Treat", "İkram"), icon: "st_treat", day: 2, taps: 2, produces: "treat", description: m("A drink on the house", "İkram içecek") },
  { id: "compost", name: m("Compost", "Kompost"), icon: "st_compost", day: 1, taps: 1, description: m("Drop what you hold", "Elindekini bırak") },
];

/**
 * O gün tezgâhta açık olan istasyonlar.
 * `ekstra`: atölyede tasarlanan bir tarif yüzünden erken açılanlar — tarifin
 * malzemesi oyunda üretilebilir olmalı, yoksa sipariş tamamlanamaz.
 */
export function stationsForDay(day: number, ekstra: StationId[] = []): Station[] {
  const acik = new Set(ekstra);
  return STATIONS.filter((i) => i.day <= day || acik.has(i.id));
}

/** Bir malzemeyi üreten station (maki için sarma matı + iç malzemenin istasyonu). */
export function stationsForIngredient(ingredient: IngredientId): StationId[] {
  const dogrudan = STATIONS.find((i) => i.produces === ingredient);
  if (dogrudan) return [dogrudan.id];
  const makiArt = MAKI_RECIPES.find((t) => t.sonuc === ingredient);
  if (makiArt) {
    const fillingStation = STATIONS.find((i) => i.produces === makiArt.filling);
    return fillingStation ? ["mat", fillingStation.id] : ["mat"];
  }
  return [];
}

export const STATION_MAP: Record<StationId, Station> = Object.fromEntries(
  STATIONS.map((i) => [i.id, i]),
) as Record<StationId, Station>;

/** Sarma matındaki üçlü → sonuç. */
export const MAKI_RECIPES: { filling: IngredientId; sonuc: IngredientId }[] = [
  { filling: "salmon_slice", sonuc: "salmon_maki" },
  { filling: "avocado", sonuc: "avocado_maki" },
  { filling: "tuna_slice", sonuc: "tuna_maki" },
  { filling: "tamago", sonuc: "tamago_maki" },
  { filling: "cucumber", sonuc: "kappa_maki" },
  { filling: "mango", sonuc: "mango_maki" },
  { filling: "shrimp", sonuc: "shrimp_maki" },
  { filling: "cream_cheese", sonuc: "cream_maki" },
  { filling: "tempura", sonuc: "tempura_maki" },
];

/** Sarma matına "iç" olarak konabilecek malzemeler. */
export const MAKI_FILLINGS = new Set<IngredientId>(MAKI_RECIPES.map((t) => t.filling));

export function isMakiFilling(m: IngredientId): boolean {
  return MAKI_FILLINGS.has(m);
}

export interface Character {
  id: string;
  name: Localized;
  face: string;
  favorite: DishId;
  patience: number;
  greeting: Localized[];
  happy: Localized[];
  favoriteLine: Localized;
  farewell: Localized;
  /** Küçük hikâye yayı — servis sayısı arttıkça açılan satırlar. */
  story: Localized[];
}

export const CHARACTERS: Character[] = [
  {
    id: "deniz",
    name: m("Uncle Deniz", "Deniz Amca"),
    face: "ch_deniz",
    favorite: "nigiri_salmon",
    patience: 46,
    greeting: [m("The nets came back empty this morning. I'm starving.", "Sabah ağları boş döndü, karnım aç."), m("The sea is calm today.", "Bugün deniz sakin.")],
    happy: [m("Bless your hands.", "Ellerine sağlık."), m("Now that's it.", "İşte bu.")],
    favoriteLine: m("Exactly how I like it. Your mother made it this way too.", "Tam istediğim gibi. Annen de böyle yapardı."),
    farewell: m("I'll drop by again. No hurry.", "Ben yine uğrarım, acelesi yok."),
    story: [m("I fished this shore for forty years.", "40 yıl bu kıyıda balık tuttum."), m("Sold the boat last year. Still not sure that was right.", "Tekneyi geçen sene sattım. İyi mi ettim bilmiyorum."), m("Now I come here in the mornings. Not bad at all.", "Artık sabahları buraya geliyorum. Fena değil.")],
  },
  {
    id: "summer",
    name: m("Yaz", "Yaz"),
    face: "ch_yaz",
    favorite: "avocado_maki",
    patience: 38,
    greeting: [m("Exam week... I should eat something.", "Sınav haftası... bir şeyler yesem iyi olacak."), m("My brain has stopped.", "Beynim durdu.")],
    happy: [m("That helped.", "Bu iyi geldi."), m("Thank you!", "Teşekkürler!")],
    favoriteLine: m("Avocado maki! I think I can pass now.", "Avokado maki! Bugün geçebilirim bence."),
    farewell: m("Back to the library.", "Kütüphaneye dönmem lazım."),
    story: [m("I study architecture. I think.", "Mimarlık okuyorum. Sanırım."), m("Honestly I like cooking more.", "Aslında yemek yapmayı daha çok seviyorum."), m("Maybe one day I'll open a place like yours.", "Belki bir gün senin gibi bir yer açarım.")],
  },
  {
    id: "mira",
    name: m("Mira", "Mira"),
    face: "ch_mira",
    favorite: "nigiri_tamago",
    patience: 42,
    greeting: [m("I couldn't draw a thing today.", "Bugün hiçbir şey çizemedim."), m("The light in here is lovely.", "Buranın ışığı güzel.")],
    happy: [m("The colours are beautiful.", "Renkleri güzelmiş."), m("Mmm.", "Mmm.")],
    favoriteLine: m("That yellow in the tamago... I'm going to paint it.", "Tamagonun o sarısı var ya... onu boyayacağım."),
    farewell: m("I need to grab my sketchbook.", "Defterimi almam lazım."),
    story: [m("I'm an illustrator. Or I was.", "İllüstratör'üm. Ya da öyleydim."), m("Six months without a single line.", "Altı aydır tek çizgi çizemiyorum."), m("I drew you yesterday, actually. I won't show you.", "Dün seni çizdim aslında. Göstermem ama.")],
  },
  {
    id: "kaptan",
    name: m("Captain Ho", "Kaptan Ho"),
    face: "ch_kaptan",
    favorite: "salmon_maki",
    patience: 34,
    greeting: [m("The ferry leaves in twenty minutes.", "Feribot 20 dakikaya kalkıyor."), m("Make it quick, but make it good.", "Hızlı olsun, ama güzel olsun.")],
    happy: [m("Right on time.", "Tam vaktinde."), m("I earned this.", "Bunu hak etmiştim.")],
    favoriteLine: m("Salmon maki. I can run on this all day.", "Somon maki. Bütün gün buna dayanırım."),
    farewell: m("Think the ferry waits for me?", "Vapur beni bekler mi sanıyorsun?"),
    story: [m("Six crossings a day.", "Günde altı sefer yapıyorum."), m("Same shore, same gulls.", "Aynı kıyı, aynı martılar."), m("But a different sky each time. That's what I watch.", "Ama her sefer başka bir gökyüzü. Ona bakıyorum.")],
  },
  {
    id: "nen",
    name: m("Nen", "Nen"),
    face: "ch_nen",
    favorite: "nigiri_tuna",
    patience: 60,
    greeting: [m("...", "..."), m("*settles onto the counter*", "*tezgâha kurulur*")],
    happy: [m("*purrs*", "*mırlar*"), m("*tail flick*", "*kuyruk sallar*")],
    favoriteLine: m("*closes both eyes and purrs for a long while*", "*gözlerini kapatıp uzun uzun mırlar*"),
    farewell: m("*leaves, yawning*", "*esneyerek gider*"),
    story: [m("*watching you*", "*seni izliyor*"), m("*comes by every day now*", "*artık her gün geliyor*"), m("*I think it lives here*", "*sanırım burada yaşıyor*")],
  },
  {
    id: "efe",
    name: m("Efe", "Efe"),
    face: "ch_efe",
    favorite: "tea",
    patience: 50,
    greeting: [m("One tea and a bit of quiet.", "Bir çay ve biraz sessizlik."), m("Deployed, then ran.", "Deploy ettim, kaçtım.")],
    happy: [m("Ah.", "Oh."), m("That hit the spot.", "İyi geldi bu.")],
    favoriteLine: m("I waited all day for this tea.", "Bu çayı içmek için bütün gün bekledim."),
    farewell: m("I have a meeting. I always have a meeting.", "Toplantım var. Hep var."),
    story: [m("I work remotely. So, everywhere.", "Uzaktan çalışıyorum. Yani her yerde çalışıyorum."), m("I've declared this table my office.", "Bu masayı ofisim ilan ettim."), m("Should I be paying rent?", "Kira ödemem gerekir mi?")],
  },
  {
    id: "poyraz",
    name: m("Poyraz", "Poyraz"),
    face: "ch_poyraz",
    favorite: "gunkan_ikura",
    patience: 44,
    greeting: [m("Playing tonight — food first.", "Akşam çalacağım, önce bir şeyler yiyeyim."), m("Left my guitar outside, keep an eye on it.", "Gitarı dışarıda bıraktım, göz kulak ol.")],
    happy: [m("This could be a song.", "Bu bir şarkı olur."), m("Wonderful.", "Harika.")],
    favoriteLine: m("Ikura gunkan. Every bead is its own note.", "İkura gunkan. Her tanesi ayrı bir nota."),
    farewell: m("Showtime.", "Sahne vakti geldi."),
    story: [m("I play on the pier. Started last summer.", "İskelede çalıyorum, geçen yaz başladım."), m("Nobody stops to listen, but the gulls love it.", "Kimse durup dinlemiyor ama martılar bayılıyor."), m("Three people stopped yesterday. Three!", "Dün üç kişi durdu. Üç kişi!")],
  },
  {
    id: "ada",
    name: m("Ada", "Ada"),
    face: "ch_ada",
    favorite: "mochi_dessert",
    patience: 30,
    greeting: [m("Mum's coming in a minute!", "Annem birazdan gelecek!"), m("Can I see behind the counter?", "Tezgâhın arkasını görebilir miyim?")],
    happy: [m("Yayy!", "Yaşasın!"), m("One more?", "Bir tane daha?")],
    favoriteLine: m("MOCHI! I knew it, I knew it!", "MOCHİ! Biliyordum, biliyordum!"),
    farewell: m("Mum's calling, I'm running.", "Annem çağırıyor, koşuyorum."),
    story: [m("I'm going to be a sushi chef when I grow up.", "Büyüyünce suşi ustası olacağım."), m("I tried with rice at home. The carpet got a bit sticky.", "Evde pirinçle denedim. Halı biraz yapış yapış oldu."), m("Will you get me an apron too? A small one.", "Bana da bir önlük alır mısın? Küçük olan.")],
  },
];

export const CHARACTER_MAP: Record<string, Character> = Object.fromEntries(
  CHARACTERS.map((k) => [k.id, k]),
);

export const PLAYER_COLORS = ["#5b8def", "#e8a33d", "#59b98a", "#c86fc9"];
export const PLAYER_NAMES = ["Mavi", "Sarı", "Yeşil", "Mor"];


// ---------------------------------------------------------------- mevsimler
export type SeasonId = "spring" | "summer" | "autumn" | "winter";

export interface Season {
  id: SeasonId;
  name: Localized;
  /** Gökyüzü gradyanı (üstten alta). */
  sky: [string, string, string];
  /** Uzak tepeler ve deniz. */
  hills: string;
  farHills: string;
  sea: string;
  /** Havada süzülen parçacık ("flower" | "yaprak" | "kar" | "atesbocegi"). */
  particle: "flower" | "yaprak" | "kar" | "atesbocegi";
  particleColors: string[];
  greeting: Localized;
}

export const SEASONS: Season[] = [
  {
    id: "spring",
    name: m("Spring", "İlkbahar"),
    sky: ["#FFF3F0", "#FFE6E4", "#FCE4D8"],
    hills: "#CDE3C4",
    farHills: "#DCEAD8",
    sea: "#CFE3EC",
    particle: "flower",
    particleColors: ["#FFC9D4", "#FFDCE3", "#FFB9C6"],
    greeting: m("Cherry blossoms have fallen; the town is pink.", "Kiraz çiçekleri döküldü, kasaba pembe."),
  },
  {
    id: "summer",
    name: m("Summer", "Yaz"),
    sky: ["#FFF8EC", "#FFEFD6", "#FFE3C8"],
    hills: "#BEDCA8",
    farHills: "#D4E8C6",
    sea: "#B9DDE4",
    particle: "atesbocegi",
    particleColors: ["#FFE9A8", "#FFF3CC", "#FFDC8A"],
    greeting: m("Long evenings, warm sea.", "Akşamlar uzun, deniz ılık."),
  },
  {
    id: "autumn",
    name: m("Autumn", "Sonbahar"),
    sky: ["#FFF1E4", "#FFE2CE", "#F7D6C4"],
    hills: "#E8C79B",
    farHills: "#F0DCC0",
    sea: "#CBDCE0",
    particle: "yaprak",
    particleColors: ["#F0A868", "#E88C5A", "#F5C48A"],
    greeting: m("The wind carries leaves all the way to the counter.", "Rüzgâr yaprakları tezgâha kadar getiriyor."),
  },
  {
    id: "winter",
    name: m("Winter", "Kış"),
    sky: ["#F4F6FB", "#EAEFF8", "#E4EAF4"],
    hills: "#E8EEF4",
    farHills: "#F2F5FA",
    sea: "#D2DEE8",
    particle: "kar",
    particleColors: ["#FFFFFF", "#EEF4FA", "#E2ECF6"],
    greeting: m("It is snowing. Inside looks warmer.", "Kar yağıyor. İçerisi daha sıcak görünüyor."),
  },
];

/** Her 5 gün bir mevsim döner. */
export function seasonForDay(day: number): Season {
  return SEASONS[Math.floor((day - 1) / 5) % SEASONS.length]!;
}

// ---------------------------------------------------------------- dükkân
export interface Decor {
  id: string;
  name: Localized;
  description: Localized;
  price: number;
  /** Misafir sabrına katkı (0.06 = %6 daha sabırlı). */
  warmth: number;
  icon: string;
  /** Sahnedeki yeri: sol duvar / sağ duvar / tezgâh / tavan. */
  spot: "sol" | "sag" | "counter" | "tavan";
  /** Pasif bir yeteneği varsa: "bot" düzenli aralıklarla ikram dağıtır. */
  effect?: "bot";
}

export const DECOR_ITEMS: Decor[] = [
  { id: "flower_vase", name: m("Flower Vase", "Çiçek Vazosu"), description: m("A little vase at the end of the counter.", "Tezgâhın ucunda küçük bir vazo."), price: 40, warmth: 0.05, icon: "dec_vase", spot: "counter" },
  { id: "noren", name: m("Noren Curtain", "Noren Perdesi"), description: m("Indigo cloth hung at the door.", "Kapıya asılan indigo bez."), price: 55, warmth: 0.05, icon: "dec_noren", spot: "tavan" },
  { id: "bonsai", name: m("Bonsai", "Bonsai"), description: m("A tiny tree, patiently pruned.", "Sabırla budanmış minik bir ağaç."), price: 70, warmth: 0.06, icon: "dec_bonsai", spot: "sol" },
  { id: "cat_bed", name: m("Cat Bed", "Kedi Yatağı"), description: m("For Nen. Nen earned this.", "Nen için. Nen bunu hak etti."), price: 85, warmth: 0.07, icon: "dec_cat_bed", spot: "sag" },
  { id: "lantern_string", name: m("String of Lanterns", "Fener Dizisi"), description: m("Paper lanterns strung from the ceiling.", "Tavandan sarkan kâğıt fenerler."), price: 100, warmth: 0.08, icon: "dec_lanterns", spot: "tavan" },
  { id: "maneki", name: m("Maneki Neko", "Maneki Neko"), description: m("The waving lucky cat.", "El sallayan uğur kedisi."), price: 120, warmth: 0.08, icon: "dec_maneki", spot: "counter" },
  { id: "sea_window", name: m("Sea Window", "Deniz Penceresi"), description: m("You cut the wall open to the sea.", "Duvarı kesip denize açtın."), price: 160, warmth: 0.10, icon: "dec_window", spot: "sol" },
  { id: "paper_lamp", name: m("Paper Lamp", "Kâğıt Lamba"), description: m("A soft, yellow light.", "Yumuşak, sarı bir ışık."), price: 140, warmth: 0.09, icon: "dec_lamp", spot: "sag" },
  {
    id: "service_bot",
    name: m("Service Bot", "Servis Botu"),
    description: m("Keeps handing out drinks so guests stay cheerful.", "Sürekli içecek dağıtır, misafirlerin keyfi yerinde kalır."),
    price: 260,
    warmth: 0.04,
    icon: "dec_bot",
    spot: "sag",
    effect: "bot",
  },
];

export const DECOR_MAP: Record<string, Decor> = Object.fromEntries(DECOR_ITEMS.map((d) => [d.id, d]));

/** Satın alınan dekorların toplam sıcaklığı → misafir sabrı çarpanı. */
export function warmthMultiplier(decor: string[]): number {
  return 1 + decor.reduce((t, id) => t + (DECOR_MAP[id]?.warmth ?? 0), 0);
}

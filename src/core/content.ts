import { m, type Localized } from "./i18n";
import type { StationId, IngredientId, DishId } from "./types";

export interface Ingredient {
  name: Localized;
  icon: string;
}

export const INGREDIENTS: Record<IngredientId, Ingredient> = {
  pirinc: { name: m("Rice ball", "Pirinç topu"), icon: "pirinc" },
  nori: { name: m("Nori", "Nori"), icon: "nori" },
  cay: { name: m("Green tea", "Yeşil çay"), icon: "cay" },
  dilim_somon: { name: m("Salmon slice", "Somon dilimi"), icon: "dilim_somon" },
  dilim_ton: { name: m("Tuna slice", "Ton dilimi"), icon: "dilim_ton" },
  dilim_avokado: { name: m("Avocado", "Avokado"), icon: "dilim_avokado" },
  dilim_tamago: { name: m("Tamago", "Tamago"), icon: "dilim_tamago" },
  ikura: { name: m("Ikura", "İkura"), icon: "ikura" },
  tofu: { name: m("Tofu pouch", "Tofu kesesi"), icon: "tofu" },
  miso: { name: m("Miso soup", "Miso çorbası"), icon: "miso" },
  mochi: { name: m("Mochi", "Mochi"), icon: "mochi" },
  maki_somon: { name: m("Salmon maki", "Somon maki"), icon: "maki_somon" },
  maki_avokado: { name: m("Avocado maki", "Avokado maki"), icon: "maki_avokado" },
  maki_ton: { name: m("Tuna maki", "Ton maki"), icon: "maki_ton" },
  maki_tamago: { name: m("Tamago maki", "Tamago maki"), icon: "maki_tamago" },
  dilim_karides: { name: m("Shrimp", "Karides"), icon: "dilim_karides" },
  dilim_yilanbaligi: { name: m("Unagi", "Unagi"), icon: "dilim_yilanbaligi" },
  dilim_salatalik: { name: m("Cucumber", "Salatalık"), icon: "dilim_salatalik" },
  dilim_mango: { name: m("Mango", "Mango"), icon: "dilim_mango" },
  krem_peynir: { name: m("Cream cheese", "Krem peynir"), icon: "krem_peynir" },
  tempura: { name: m("Tempura", "Tempura"), icon: "tempura" },
  maki_salatalik: { name: m("Kappa maki", "Kappa maki"), icon: "maki_salatalik" },
  maki_mango: { name: m("Mango maki", "Mango maki"), icon: "maki_mango" },
  maki_karides: { name: m("Shrimp maki", "Karides maki"), icon: "maki_karides" },
  maki_krem: { name: m("Cream cheese maki", "Krem peynirli maki"), icon: "maki_krem" },
  maki_tempura: { name: m("Tempura maki", "Tempura maki"), icon: "maki_tempura" },
  ikram: { name: m("Welcome drink", "İkram içeceği"), icon: "ikram" },
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
  nigiri_somon: { name: m("Salmon Nigiri", "Somon Nigiri"), icon: "yemek_nigiri_somon", needs: ["pirinc", "dilim_somon"], hearts: 3, day: 1 },
  cay: { name: m("Green Tea", "Yeşil Çay"), icon: "cay", needs: ["cay"], hearts: 1, day: 1 },
  nigiri_ton: { name: m("Tuna Nigiri", "Ton Nigiri"), icon: "yemek_nigiri_ton", needs: ["pirinc", "dilim_ton"], hearts: 3, day: 2 },
  maki_avokado: { name: m("Avocado Maki", "Avokado Maki"), icon: "yemek_maki_avokado", needs: ["maki_avokado"], hearts: 5, day: 2 },
  nigiri_tamago: { name: m("Tamago Nigiri", "Tamago Nigiri"), icon: "yemek_nigiri_tamago", needs: ["pirinc", "dilim_tamago"], hearts: 4, day: 3 },
  maki_somon: { name: m("Salmon Maki", "Somon Maki"), icon: "yemek_maki_somon", needs: ["maki_somon"], hearts: 6, day: 3 },
  miso_corba: { name: m("Miso Soup", "Miso Çorbası"), icon: "miso", needs: ["miso"], hearts: 2, day: 2 },
  sashimi_somon: { name: m("Salmon Sashimi", "Somon Sashimi"), icon: "yemek_sashimi", needs: ["dilim_somon", "dilim_somon"], hearts: 4, day: 3 },
  inari: { name: m("Inari", "İnari"), icon: "yemek_inari", needs: ["tofu", "pirinc"], hearts: 4, day: 3 },
  gunkan_ikura: { name: m("Ikura Gunkan", "İkura Gunkan"), icon: "yemek_gunkan", needs: ["pirinc", "nori", "ikura"], hearts: 7, day: 4 },
  maki_ton: { name: m("Tuna Maki", "Ton Maki"), icon: "yemek_maki_ton", needs: ["maki_ton"], hearts: 6, day: 5 },
  mochi_tatli: { name: m("Mochi", "Mochi"), icon: "mochi", needs: ["mochi"], hearts: 3, day: 5 },
  maki_tamago: { name: m("Tamago Maki", "Tamago Maki"), icon: "yemek_maki_tamago", needs: ["maki_tamago"], hearts: 5, day: 6 },
  nigiri_karides: { name: m("Shrimp Nigiri", "Karides Nigiri"), icon: "yemek_nigiri_karides", needs: ["pirinc", "dilim_karides"], hearts: 4, day: 6 },
  kappa_maki: { name: m("Kappa Maki", "Kappa Maki"), icon: "yemek_maki_salatalik", needs: ["maki_salatalik"], hearts: 5, day: 6 },
  unagi_nigiri: { name: m("Unagi Nigiri", "Unagi Nigiri"), icon: "yemek_nigiri_unagi", needs: ["pirinc", "dilim_yilanbaligi"], hearts: 6, day: 7 },
  philadelphia: { name: m("Philadelphia", "Philadelphia"), icon: "yemek_maki_krem", needs: ["maki_krem", "dilim_somon"], hearts: 8, day: 7 },
  mango_maki: { name: m("Mango Maki", "Mango Maki"), icon: "yemek_maki_mango", needs: ["maki_mango"], hearts: 6, day: 8 },
  tempura_roll: { name: m("Tempura Roll", "Tempura Roll"), icon: "yemek_maki_tempura", needs: ["maki_tempura", "dilim_avokado"], hearts: 9, day: 9 },
  karides_gunkan: { name: m("Shrimp Gunkan", "Karides Gunkan"), icon: "yemek_gunkan", needs: ["pirinc", "nori", "dilim_karides"], hearts: 7, day: 8 },
};

const UNKNOWN_DISH: Dish = { name: m("?", "?"), icon: "empty", needs: [], hearts: 1, day: 1 };

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
  { id: "pirinc", name: m("Rice", "Pirinç"), icon: "ist_pirinc", day: 1, taps: 3, produces: "pirinc", description: m("Press and roll", "Bastır, yuvarla") },
  { id: "nori", name: m("Nori", "Nori"), icon: "ist_nori", day: 1, taps: 1, produces: "nori", description: m("Take a sheet", "Raftan al") },
  { id: "kesim_somon", name: m("Salmon", "Somon"), icon: "dilim_somon", day: 1, taps: 3, produces: "dilim_somon", description: m("Slice it", "Dilimle") },
  { id: "cay", name: m("Tea", "Çay"), icon: "ist_cay", day: 1, taps: 2, produces: "cay", description: m("Steep it", "Demle") },
  { id: "kesim_ton", name: m("Tuna", "Ton"), icon: "dilim_ton", day: 2, taps: 3, produces: "dilim_ton", description: m("Slice it", "Dilimle") },
  { id: "kesim_avokado", name: m("Avocado", "Avokado"), icon: "dilim_avokado", day: 2, taps: 2, produces: "dilim_avokado", description: m("Slice it", "Dilimle") },
  { id: "mat", name: m("Rolling Mat", "Sarma Matı"), icon: "ist_mat", day: 2, taps: 3, description: m("Nori + rice + filling → roll", "Nori + pirinç + iç → sar") },
  { id: "miso", name: m("Miso", "Miso"), icon: "ist_miso", day: 2, taps: 2, produces: "miso", description: m("Ladle it out", "Kâseye koy") },
  { id: "kesim_tamago", name: m("Tamago", "Tamago"), icon: "dilim_tamago", day: 3, taps: 3, produces: "dilim_tamago", description: m("Cook and cut", "Pişir, kes") },
  { id: "tofu", name: m("Tofu", "Tofu"), icon: "ist_tofu", day: 3, taps: 2, produces: "tofu", description: m("Open the pouch", "Keseyi aç") },
  { id: "ikura", name: m("Ikura", "İkura"), icon: "ikura", day: 4, taps: 2, produces: "ikura", description: m("Spoon it", "Kaşıkla") },
  { id: "mochi", name: m("Mochi", "Mochi"), icon: "ist_mochi", day: 5, taps: 3, produces: "mochi", description: m("Knead and shape", "Yoğur, şekillendir") },
  { id: "kesim_karides", name: m("Shrimp", "Karides"), icon: "dilim_karides", day: 6, taps: 3, produces: "dilim_karides", description: m("Peel and butterfly", "Ayıkla, aç") },
  { id: "kesim_salatalik", name: m("Cucumber", "Salatalık"), icon: "dilim_salatalik", day: 6, taps: 2, produces: "dilim_salatalik", description: m("Slice thin", "İnce dilimle") },
  { id: "kesim_yilanbaligi", name: m("Unagi", "Unagi"), icon: "dilim_yilanbaligi", day: 7, taps: 3, produces: "dilim_yilanbaligi", description: m("Glaze and grill", "Sosla, ızgara") },
  { id: "krem_peynir", name: m("Cream Cheese", "Krem Peynir"), icon: "krem_peynir", day: 7, taps: 2, produces: "krem_peynir", description: m("Spoon it", "Kaşıkla") },
  { id: "kesim_mango", name: m("Mango", "Mango"), icon: "dilim_mango", day: 8, taps: 2, produces: "dilim_mango", description: m("Peel and slice", "Soy, dilimle") },
  { id: "tempura", name: m("Tempura", "Tempura"), icon: "tempura", day: 9, taps: 3, produces: "tempura", description: m("Batter and fry", "Bandır, kızart") },
  { id: "ikram", name: m("Treat", "İkram"), icon: "ist_ikram", day: 2, taps: 2, produces: "ikram", description: m("A drink on the house", "İkram içecek") },
  { id: "atik", name: m("Compost", "Kompost"), icon: "ist_atik", day: 1, taps: 1, description: m("Drop what you hold", "Elindekini bırak") },
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

/** Bir malzemeyi üreten istasyon (maki için sarma matı + iç malzemenin istasyonu). */
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
  { filling: "dilim_somon", sonuc: "maki_somon" },
  { filling: "dilim_avokado", sonuc: "maki_avokado" },
  { filling: "dilim_ton", sonuc: "maki_ton" },
  { filling: "dilim_tamago", sonuc: "maki_tamago" },
  { filling: "dilim_salatalik", sonuc: "maki_salatalik" },
  { filling: "dilim_mango", sonuc: "maki_mango" },
  { filling: "dilim_karides", sonuc: "maki_karides" },
  { filling: "krem_peynir", sonuc: "maki_krem" },
  { filling: "tempura", sonuc: "maki_tempura" },
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
    face: "kar_deniz",
    favorite: "nigiri_somon",
    patience: 46,
    greeting: [m("The nets came back empty this morning. I'm starving.", "Sabah ağları boş döndü, karnım aç."), m("The sea is calm today.", "Bugün deniz sakin.")],
    happy: [m("Bless your hands.", "Ellerine sağlık."), m("Now that's it.", "İşte bu.")],
    favoriteLine: m("Exactly how I like it. Your mother made it this way too.", "Tam istediğim gibi. Annen de böyle yapardı."),
    farewell: m("I'll drop by again. No hurry.", "Ben yine uğrarım, acelesi yok."),
    story: [m("I fished this shore for forty years.", "40 yıl bu kıyıda balık tuttum."), m("Sold the boat last year. Still not sure that was right.", "Tekneyi geçen sene sattım. İyi mi ettim bilmiyorum."), m("Now I come here in the mornings. Not bad at all.", "Artık sabahları buraya geliyorum. Fena değil.")],
  },
  {
    id: "yaz",
    name: m("Yaz", "Yaz"),
    face: "kar_yaz",
    favorite: "maki_avokado",
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
    face: "kar_mira",
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
    face: "kar_kaptan",
    favorite: "maki_somon",
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
    face: "kar_nen",
    favorite: "nigiri_ton",
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
    face: "kar_efe",
    favorite: "cay",
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
    face: "kar_poyraz",
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
    face: "kar_ada",
    favorite: "mochi_tatli",
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
export type SeasonId = "ilkbahar" | "yaz" | "sonbahar" | "kis";

export interface Season {
  id: SeasonId;
  name: Localized;
  /** Gökyüzü gradyanı (üstten alta). */
  sky: [string, string, string];
  /** Uzak tepeler ve deniz. */
  hills: string;
  farHills: string;
  sea: string;
  /** Havada süzülen parçacık ("cicek" | "yaprak" | "kar" | "atesbocegi"). */
  particle: "cicek" | "yaprak" | "kar" | "atesbocegi";
  particleColors: string[];
  greeting: Localized;
}

export const SEASONS: Season[] = [
  {
    id: "ilkbahar",
    name: m("Spring", "İlkbahar"),
    sky: ["#FFF3F0", "#FFE6E4", "#FCE4D8"],
    hills: "#CDE3C4",
    farHills: "#DCEAD8",
    sea: "#CFE3EC",
    particle: "cicek",
    particleColors: ["#FFC9D4", "#FFDCE3", "#FFB9C6"],
    greeting: m("Cherry blossoms have fallen; the town is pink.", "Kiraz çiçekleri döküldü, kasaba pembe."),
  },
  {
    id: "yaz",
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
    id: "sonbahar",
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
    id: "kis",
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
  { id: "cicek_vazo", name: m("Flower Vase", "Çiçek Vazosu"), description: m("A little vase at the end of the counter.", "Tezgâhın ucunda küçük bir vazo."), price: 40, warmth: 0.05, icon: "dek_vazo", spot: "counter" },
  { id: "noren", name: m("Noren Curtain", "Noren Perdesi"), description: m("Indigo cloth hung at the door.", "Kapıya asılan indigo bez."), price: 55, warmth: 0.05, icon: "dek_noren", spot: "tavan" },
  { id: "bonsai", name: m("Bonsai", "Bonsai"), description: m("A tiny tree, patiently pruned.", "Sabırla budanmış minik bir ağaç."), price: 70, warmth: 0.06, icon: "dek_bonsai", spot: "sol" },
  { id: "kedi_yatagi", name: m("Cat Bed", "Kedi Yatağı"), description: m("For Nen. Nen earned this.", "Nen için. Nen bunu hak etti."), price: 85, warmth: 0.07, icon: "dek_kedi_yatagi", spot: "sag" },
  { id: "fener_dizisi", name: m("String of Lanterns", "Fener Dizisi"), description: m("Paper lanterns strung from the ceiling.", "Tavandan sarkan kâğıt fenerler."), price: 100, warmth: 0.08, icon: "dek_fener_dizisi", spot: "tavan" },
  { id: "maneki", name: m("Maneki Neko", "Maneki Neko"), description: m("The waving lucky cat.", "El sallayan uğur kedisi."), price: 120, warmth: 0.08, icon: "dek_maneki", spot: "counter" },
  { id: "pencere", name: m("Sea Window", "Deniz Penceresi"), description: m("You cut the wall open to the sea.", "Duvarı kesip denize açtın."), price: 160, warmth: 0.10, icon: "dek_pencere", spot: "sol" },
  { id: "kagit_lamba", name: m("Paper Lamp", "Kâğıt Lamba"), description: m("A soft, yellow light.", "Yumuşak, sarı bir ışık."), price: 140, warmth: 0.09, icon: "dek_lamba", spot: "sag" },
  {
    id: "servis_botu",
    name: m("Service Bot", "Servis Botu"),
    description: m("Keeps handing out drinks so guests stay cheerful.", "Sürekli içecek dağıtır, misafirlerin keyfi yerinde kalır."),
    price: 260,
    warmth: 0.04,
    icon: "dek_bot",
    spot: "sag",
    effect: "bot",
  },
];

export const DECOR_MAP: Record<string, Decor> = Object.fromEntries(DECOR_ITEMS.map((d) => [d.id, d]));

/** Satın alınan dekorların toplam sıcaklığı → misafir sabrı çarpanı. */
export function warmthMultiplier(decor: string[]): number {
  return 1 + decor.reduce((t, id) => t + (DECOR_MAP[id]?.warmth ?? 0), 0);
}

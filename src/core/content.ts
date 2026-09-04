import { m, type Yerel } from "./dil";
import type { IstasyonId, MalzemeId, YemekId } from "./types";

export interface MalzemeBilgi {
  ad: Yerel;
  ikon: string;
}

export const MALZEMELER: Record<MalzemeId, MalzemeBilgi> = {
  pirinc: { ad: m("Rice ball", "Pirinç topu"), ikon: "pirinc" },
  nori: { ad: m("Nori", "Nori"), ikon: "nori" },
  cay: { ad: m("Green tea", "Yeşil çay"), ikon: "cay" },
  dilim_somon: { ad: m("Salmon slice", "Somon dilimi"), ikon: "dilim_somon" },
  dilim_ton: { ad: m("Tuna slice", "Ton dilimi"), ikon: "dilim_ton" },
  dilim_avokado: { ad: m("Avocado", "Avokado"), ikon: "dilim_avokado" },
  dilim_tamago: { ad: m("Tamago", "Tamago"), ikon: "dilim_tamago" },
  ikura: { ad: m("Ikura", "İkura"), ikon: "ikura" },
  tofu: { ad: m("Tofu pouch", "Tofu kesesi"), ikon: "tofu" },
  miso: { ad: m("Miso soup", "Miso çorbası"), ikon: "miso" },
  mochi: { ad: m("Mochi", "Mochi"), ikon: "mochi" },
  maki_somon: { ad: m("Salmon maki", "Somon maki"), ikon: "maki_somon" },
  maki_avokado: { ad: m("Avocado maki", "Avokado maki"), ikon: "maki_avokado" },
  maki_ton: { ad: m("Tuna maki", "Ton maki"), ikon: "maki_ton" },
  maki_tamago: { ad: m("Tamago maki", "Tamago maki"), ikon: "maki_tamago" },
  dilim_karides: { ad: m("Shrimp", "Karides"), ikon: "dilim_karides" },
  dilim_yilanbaligi: { ad: m("Unagi", "Unagi"), ikon: "dilim_yilanbaligi" },
  dilim_salatalik: { ad: m("Cucumber", "Salatalık"), ikon: "dilim_salatalik" },
  dilim_mango: { ad: m("Mango", "Mango"), ikon: "dilim_mango" },
  krem_peynir: { ad: m("Cream cheese", "Krem peynir"), ikon: "krem_peynir" },
  tempura: { ad: m("Tempura", "Tempura"), ikon: "tempura" },
  maki_salatalik: { ad: m("Kappa maki", "Kappa maki"), ikon: "maki_salatalik" },
  maki_mango: { ad: m("Mango maki", "Mango maki"), ikon: "maki_mango" },
  maki_karides: { ad: m("Shrimp maki", "Karides maki"), ikon: "maki_karides" },
  maki_krem: { ad: m("Cream cheese maki", "Krem peynirli maki"), ikon: "maki_krem" },
  maki_tempura: { ad: m("Tempura maki", "Tempura maki"), ikon: "maki_tempura" },
  ikram: { ad: m("Welcome drink", "İkram içeceği"), ikon: "ikram" },
};

export interface YemekBilgi {
  ad: Yerel;
  ikon: string;
  /** Tepsiye konması gereken malzemeler (çoklu küme). */
  gerek: MalzemeId[];
  kalp: number;
  /** Kaçıncı günden itibaren menüde. */
  gun: number;
  /** Atölyede oyuncunun tasarladığı tarif mi? */
  ozel?: boolean;
  /** Özel tarifler için gömülü SVG (art.ts kaydına eklenir). */
  cizim?: string;
  /** Oyuncunun tarife yazdığı kısa not. */
  hikaye?: string;
}

export const YEMEKLER: Record<string, YemekBilgi> = {
  nigiri_somon: { ad: m("Salmon Nigiri", "Somon Nigiri"), ikon: "yemek_nigiri_somon", gerek: ["pirinc", "dilim_somon"], kalp: 3, gun: 1 },
  cay: { ad: m("Green Tea", "Yeşil Çay"), ikon: "cay", gerek: ["cay"], kalp: 1, gun: 1 },
  nigiri_ton: { ad: m("Tuna Nigiri", "Ton Nigiri"), ikon: "yemek_nigiri_ton", gerek: ["pirinc", "dilim_ton"], kalp: 3, gun: 2 },
  maki_avokado: { ad: m("Avocado Maki", "Avokado Maki"), ikon: "yemek_maki_avokado", gerek: ["maki_avokado"], kalp: 5, gun: 2 },
  nigiri_tamago: { ad: m("Tamago Nigiri", "Tamago Nigiri"), ikon: "yemek_nigiri_tamago", gerek: ["pirinc", "dilim_tamago"], kalp: 4, gun: 3 },
  maki_somon: { ad: m("Salmon Maki", "Somon Maki"), ikon: "yemek_maki_somon", gerek: ["maki_somon"], kalp: 6, gun: 3 },
  miso_corba: { ad: m("Miso Soup", "Miso Çorbası"), ikon: "miso", gerek: ["miso"], kalp: 2, gun: 2 },
  sashimi_somon: { ad: m("Salmon Sashimi", "Somon Sashimi"), ikon: "yemek_sashimi", gerek: ["dilim_somon", "dilim_somon"], kalp: 4, gun: 3 },
  inari: { ad: m("Inari", "İnari"), ikon: "yemek_inari", gerek: ["tofu", "pirinc"], kalp: 4, gun: 3 },
  gunkan_ikura: { ad: m("Ikura Gunkan", "İkura Gunkan"), ikon: "yemek_gunkan", gerek: ["pirinc", "nori", "ikura"], kalp: 7, gun: 4 },
  maki_ton: { ad: m("Tuna Maki", "Ton Maki"), ikon: "yemek_maki_ton", gerek: ["maki_ton"], kalp: 6, gun: 5 },
  mochi_tatli: { ad: m("Mochi", "Mochi"), ikon: "mochi", gerek: ["mochi"], kalp: 3, gun: 5 },
  maki_tamago: { ad: m("Tamago Maki", "Tamago Maki"), ikon: "yemek_maki_tamago", gerek: ["maki_tamago"], kalp: 5, gun: 6 },
  nigiri_karides: { ad: m("Shrimp Nigiri", "Karides Nigiri"), ikon: "yemek_nigiri_karides", gerek: ["pirinc", "dilim_karides"], kalp: 4, gun: 6 },
  kappa_maki: { ad: m("Kappa Maki", "Kappa Maki"), ikon: "yemek_maki_salatalik", gerek: ["maki_salatalik"], kalp: 5, gun: 6 },
  unagi_nigiri: { ad: m("Unagi Nigiri", "Unagi Nigiri"), ikon: "yemek_nigiri_unagi", gerek: ["pirinc", "dilim_yilanbaligi"], kalp: 6, gun: 7 },
  philadelphia: { ad: m("Philadelphia", "Philadelphia"), ikon: "yemek_maki_krem", gerek: ["maki_krem", "dilim_somon"], kalp: 8, gun: 7 },
  mango_maki: { ad: m("Mango Maki", "Mango Maki"), ikon: "yemek_maki_mango", gerek: ["maki_mango"], kalp: 6, gun: 8 },
  tempura_roll: { ad: m("Tempura Roll", "Tempura Roll"), ikon: "yemek_maki_tempura", gerek: ["maki_tempura", "dilim_avokado"], kalp: 9, gun: 9 },
  karides_gunkan: { ad: m("Shrimp Gunkan", "Karides Gunkan"), ikon: "yemek_gunkan", gerek: ["pirinc", "nori", "dilim_karides"], kalp: 7, gun: 8 },
};

const BILINMEYEN_YEMEK: YemekBilgi = { ad: m("?", "?"), ikon: "bos", gerek: [], kalp: 1, gun: 1 };

/** Güvenli erişim: menü çalışma anında genişleyebildiği için indeksleme yerine bunu kullan. */
export function yemek(id: string): YemekBilgi {
  return YEMEKLER[id] ?? BILINMEYEN_YEMEK;
}

/** Atölyede tasarlanan tarifi menüye kaydeder. */
export function yemekKaydet(id: string, bilgi: YemekBilgi) {
  YEMEKLER[id] = bilgi;
}

export function yemekSil(id: string) {
  delete YEMEKLER[id];
}

export interface IstasyonBilgi {
  id: IstasyonId;
  ad: Yerel;
  ikon: string;
  /** Kaçıncı günden itibaren tezgâhta. Erken günler sade kalsın diye kademeli açılır. */
  gun: number;
  /** Kaç dokunuşta üretir. Paylaşımlı ilerleme: iki oyuncu birlikte hızlandırır. */
  tap: number;
  uretir?: MalzemeId;
  aciklama: Yerel;
}

export const ISTASYONLAR: IstasyonBilgi[] = [
  { id: "pirinc", ad: m("Rice", "Pirinç"), ikon: "ist_pirinc", gun: 1, tap: 3, uretir: "pirinc", aciklama: m("Press and roll", "Bastır, yuvarla") },
  { id: "nori", ad: m("Nori", "Nori"), ikon: "ist_nori", gun: 1, tap: 1, uretir: "nori", aciklama: m("Take a sheet", "Raftan al") },
  { id: "kesim_somon", ad: m("Salmon", "Somon"), ikon: "dilim_somon", gun: 1, tap: 3, uretir: "dilim_somon", aciklama: m("Slice it", "Dilimle") },
  { id: "cay", ad: m("Tea", "Çay"), ikon: "ist_cay", gun: 1, tap: 2, uretir: "cay", aciklama: m("Steep it", "Demle") },
  { id: "kesim_ton", ad: m("Tuna", "Ton"), ikon: "dilim_ton", gun: 2, tap: 3, uretir: "dilim_ton", aciklama: m("Slice it", "Dilimle") },
  { id: "kesim_avokado", ad: m("Avocado", "Avokado"), ikon: "dilim_avokado", gun: 2, tap: 2, uretir: "dilim_avokado", aciklama: m("Slice it", "Dilimle") },
  { id: "mat", ad: m("Rolling Mat", "Sarma Matı"), ikon: "ist_mat", gun: 2, tap: 3, aciklama: m("Nori + rice + filling → roll", "Nori + pirinç + iç → sar") },
  { id: "miso", ad: m("Miso", "Miso"), ikon: "ist_miso", gun: 2, tap: 2, uretir: "miso", aciklama: m("Ladle it out", "Kâseye koy") },
  { id: "kesim_tamago", ad: m("Tamago", "Tamago"), ikon: "dilim_tamago", gun: 3, tap: 3, uretir: "dilim_tamago", aciklama: m("Cook and cut", "Pişir, kes") },
  { id: "tofu", ad: m("Tofu", "Tofu"), ikon: "ist_tofu", gun: 3, tap: 2, uretir: "tofu", aciklama: m("Open the pouch", "Keseyi aç") },
  { id: "ikura", ad: m("Ikura", "İkura"), ikon: "ikura", gun: 4, tap: 2, uretir: "ikura", aciklama: m("Spoon it", "Kaşıkla") },
  { id: "mochi", ad: m("Mochi", "Mochi"), ikon: "ist_mochi", gun: 5, tap: 3, uretir: "mochi", aciklama: m("Knead and shape", "Yoğur, şekillendir") },
  { id: "kesim_karides", ad: m("Shrimp", "Karides"), ikon: "dilim_karides", gun: 6, tap: 3, uretir: "dilim_karides", aciklama: m("Peel and butterfly", "Ayıkla, aç") },
  { id: "kesim_salatalik", ad: m("Cucumber", "Salatalık"), ikon: "dilim_salatalik", gun: 6, tap: 2, uretir: "dilim_salatalik", aciklama: m("Slice thin", "İnce dilimle") },
  { id: "kesim_yilanbaligi", ad: m("Unagi", "Unagi"), ikon: "dilim_yilanbaligi", gun: 7, tap: 3, uretir: "dilim_yilanbaligi", aciklama: m("Glaze and grill", "Sosla, ızgara") },
  { id: "krem_peynir", ad: m("Cream Cheese", "Krem Peynir"), ikon: "krem_peynir", gun: 7, tap: 2, uretir: "krem_peynir", aciklama: m("Spoon it", "Kaşıkla") },
  { id: "kesim_mango", ad: m("Mango", "Mango"), ikon: "dilim_mango", gun: 8, tap: 2, uretir: "dilim_mango", aciklama: m("Peel and slice", "Soy, dilimle") },
  { id: "tempura", ad: m("Tempura", "Tempura"), ikon: "tempura", gun: 9, tap: 3, uretir: "tempura", aciklama: m("Batter and fry", "Bandır, kızart") },
  { id: "ikram", ad: m("Treat", "İkram"), ikon: "ist_ikram", gun: 2, tap: 2, uretir: "ikram", aciklama: m("A drink on the house", "İkram içecek") },
  { id: "atik", ad: m("Compost", "Kompost"), ikon: "ist_atik", gun: 1, tap: 1, aciklama: m("Drop what you hold", "Elindekini bırak") },
];

/**
 * O gün tezgâhta açık olan istasyonlar.
 * `ekstra`: atölyede tasarlanan bir tarif yüzünden erken açılanlar — tarifin
 * malzemesi oyunda üretilebilir olmalı, yoksa sipariş tamamlanamaz.
 */
export function istasyonlarGun(gun: number, ekstra: IstasyonId[] = []): IstasyonBilgi[] {
  const acik = new Set(ekstra);
  return ISTASYONLAR.filter((i) => i.gun <= gun || acik.has(i.id));
}

/** Bir malzemeyi üreten istasyon (maki için sarma matı + iç malzemenin istasyonu). */
export function malzemeIstasyonlari(malzeme: MalzemeId): IstasyonId[] {
  const dogrudan = ISTASYONLAR.find((i) => i.uretir === malzeme);
  if (dogrudan) return [dogrudan.id];
  const maki = MAKI_TARIFLERI.find((t) => t.sonuc === malzeme);
  if (maki) {
    const icIstasyon = ISTASYONLAR.find((i) => i.uretir === maki.ic);
    return icIstasyon ? ["mat", icIstasyon.id] : ["mat"];
  }
  return [];
}

export const ISTASYON_MAP: Record<IstasyonId, IstasyonBilgi> = Object.fromEntries(
  ISTASYONLAR.map((i) => [i.id, i]),
) as Record<IstasyonId, IstasyonBilgi>;

/** Sarma matındaki üçlü → sonuç. */
export const MAKI_TARIFLERI: { ic: MalzemeId; sonuc: MalzemeId }[] = [
  { ic: "dilim_somon", sonuc: "maki_somon" },
  { ic: "dilim_avokado", sonuc: "maki_avokado" },
  { ic: "dilim_ton", sonuc: "maki_ton" },
  { ic: "dilim_tamago", sonuc: "maki_tamago" },
  { ic: "dilim_salatalik", sonuc: "maki_salatalik" },
  { ic: "dilim_mango", sonuc: "maki_mango" },
  { ic: "dilim_karides", sonuc: "maki_karides" },
  { ic: "krem_peynir", sonuc: "maki_krem" },
  { ic: "tempura", sonuc: "maki_tempura" },
];

/** Sarma matına "iç" olarak konabilecek malzemeler. */
export const MAKI_ICLERI = new Set<MalzemeId>(MAKI_TARIFLERI.map((t) => t.ic));

export function makiIciMi(m: MalzemeId): boolean {
  return MAKI_ICLERI.has(m);
}

export interface Karakter {
  id: string;
  ad: Yerel;
  yuz: string;
  favori: YemekId;
  sabir: number;
  selam: Yerel[];
  mutlu: Yerel[];
  favoriReplik: Yerel;
  gidis: Yerel;
  /** Küçük hikâye yayı — servis sayısı arttıkça açılan satırlar. */
  hikaye: Yerel[];
}

export const KARAKTERLER: Karakter[] = [
  {
    id: "deniz",
    ad: m("Uncle Deniz", "Deniz Amca"),
    yuz: "kar_deniz",
    favori: "nigiri_somon",
    sabir: 46,
    selam: [m("The nets came back empty this morning. I'm starving.", "Sabah ağları boş döndü, karnım aç."), m("The sea is calm today.", "Bugün deniz sakin.")],
    mutlu: [m("Bless your hands.", "Ellerine sağlık."), m("Now that's it.", "İşte bu.")],
    favoriReplik: m("Exactly how I like it. Your mother made it this way too.", "Tam istediğim gibi. Annen de böyle yapardı."),
    gidis: m("I'll drop by again. No hurry.", "Ben yine uğrarım, acelesi yok."),
    hikaye: [m("I fished this shore for forty years.", "40 yıl bu kıyıda balık tuttum."), m("Sold the boat last year. Still not sure that was right.", "Tekneyi geçen sene sattım. İyi mi ettim bilmiyorum."), m("Now I come here in the mornings. Not bad at all.", "Artık sabahları buraya geliyorum. Fena değil.")],
  },
  {
    id: "yaz",
    ad: m("Yaz", "Yaz"),
    yuz: "kar_yaz",
    favori: "maki_avokado",
    sabir: 38,
    selam: [m("Exam week... I should eat something.", "Sınav haftası... bir şeyler yesem iyi olacak."), m("My brain has stopped.", "Beynim durdu.")],
    mutlu: [m("That helped.", "Bu iyi geldi."), m("Thank you!", "Teşekkürler!")],
    favoriReplik: m("Avocado maki! I think I can pass now.", "Avokado maki! Bugün geçebilirim bence."),
    gidis: m("Back to the library.", "Kütüphaneye dönmem lazım."),
    hikaye: [m("I study architecture. I think.", "Mimarlık okuyorum. Sanırım."), m("Honestly I like cooking more.", "Aslında yemek yapmayı daha çok seviyorum."), m("Maybe one day I'll open a place like yours.", "Belki bir gün senin gibi bir yer açarım.")],
  },
  {
    id: "mira",
    ad: m("Mira", "Mira"),
    yuz: "kar_mira",
    favori: "nigiri_tamago",
    sabir: 42,
    selam: [m("I couldn't draw a thing today.", "Bugün hiçbir şey çizemedim."), m("The light in here is lovely.", "Buranın ışığı güzel.")],
    mutlu: [m("The colours are beautiful.", "Renkleri güzelmiş."), m("Mmm.", "Mmm.")],
    favoriReplik: m("That yellow in the tamago... I'm going to paint it.", "Tamagonun o sarısı var ya... onu boyayacağım."),
    gidis: m("I need to grab my sketchbook.", "Defterimi almam lazım."),
    hikaye: [m("I'm an illustrator. Or I was.", "İllüstratör'üm. Ya da öyleydim."), m("Six months without a single line.", "Altı aydır tek çizgi çizemiyorum."), m("I drew you yesterday, actually. I won't show you.", "Dün seni çizdim aslında. Göstermem ama.")],
  },
  {
    id: "kaptan",
    ad: m("Captain Ho", "Kaptan Ho"),
    yuz: "kar_kaptan",
    favori: "maki_somon",
    sabir: 34,
    selam: [m("The ferry leaves in twenty minutes.", "Feribot 20 dakikaya kalkıyor."), m("Make it quick, but make it good.", "Hızlı olsun, ama güzel olsun.")],
    mutlu: [m("Right on time.", "Tam vaktinde."), m("I earned this.", "Bunu hak etmiştim.")],
    favoriReplik: m("Salmon maki. I can run on this all day.", "Somon maki. Bütün gün buna dayanırım."),
    gidis: m("Think the ferry waits for me?", "Vapur beni bekler mi sanıyorsun?"),
    hikaye: [m("Six crossings a day.", "Günde altı sefer yapıyorum."), m("Same shore, same gulls.", "Aynı kıyı, aynı martılar."), m("But a different sky each time. That's what I watch.", "Ama her sefer başka bir gökyüzü. Ona bakıyorum.")],
  },
  {
    id: "nen",
    ad: m("Nen", "Nen"),
    yuz: "kar_nen",
    favori: "nigiri_ton",
    sabir: 60,
    selam: [m("...", "..."), m("*settles onto the counter*", "*tezgâha kurulur*")],
    mutlu: [m("*purrs*", "*mırlar*"), m("*tail flick*", "*kuyruk sallar*")],
    favoriReplik: m("*closes both eyes and purrs for a long while*", "*gözlerini kapatıp uzun uzun mırlar*"),
    gidis: m("*leaves, yawning*", "*esneyerek gider*"),
    hikaye: [m("*watching you*", "*seni izliyor*"), m("*comes by every day now*", "*artık her gün geliyor*"), m("*I think it lives here*", "*sanırım burada yaşıyor*")],
  },
  {
    id: "efe",
    ad: m("Efe", "Efe"),
    yuz: "kar_efe",
    favori: "cay",
    sabir: 50,
    selam: [m("One tea and a bit of quiet.", "Bir çay ve biraz sessizlik."), m("Deployed, then ran.", "Deploy ettim, kaçtım.")],
    mutlu: [m("Ah.", "Oh."), m("That hit the spot.", "İyi geldi bu.")],
    favoriReplik: m("I waited all day for this tea.", "Bu çayı içmek için bütün gün bekledim."),
    gidis: m("I have a meeting. I always have a meeting.", "Toplantım var. Hep var."),
    hikaye: [m("I work remotely. So, everywhere.", "Uzaktan çalışıyorum. Yani her yerde çalışıyorum."), m("I've declared this table my office.", "Bu masayı ofisim ilan ettim."), m("Should I be paying rent?", "Kira ödemem gerekir mi?")],
  },
  {
    id: "poyraz",
    ad: m("Poyraz", "Poyraz"),
    yuz: "kar_poyraz",
    favori: "gunkan_ikura",
    sabir: 44,
    selam: [m("Playing tonight — food first.", "Akşam çalacağım, önce bir şeyler yiyeyim."), m("Left my guitar outside, keep an eye on it.", "Gitarı dışarıda bıraktım, göz kulak ol.")],
    mutlu: [m("This could be a song.", "Bu bir şarkı olur."), m("Wonderful.", "Harika.")],
    favoriReplik: m("Ikura gunkan. Every bead is its own note.", "İkura gunkan. Her tanesi ayrı bir nota."),
    gidis: m("Showtime.", "Sahne vakti geldi."),
    hikaye: [m("I play on the pier. Started last summer.", "İskelede çalıyorum, geçen yaz başladım."), m("Nobody stops to listen, but the gulls love it.", "Kimse durup dinlemiyor ama martılar bayılıyor."), m("Three people stopped yesterday. Three!", "Dün üç kişi durdu. Üç kişi!")],
  },
  {
    id: "ada",
    ad: m("Ada", "Ada"),
    yuz: "kar_ada",
    favori: "mochi_tatli",
    sabir: 30,
    selam: [m("Mum's coming in a minute!", "Annem birazdan gelecek!"), m("Can I see behind the counter?", "Tezgâhın arkasını görebilir miyim?")],
    mutlu: [m("Yayy!", "Yaşasın!"), m("One more?", "Bir tane daha?")],
    favoriReplik: m("MOCHI! I knew it, I knew it!", "MOCHİ! Biliyordum, biliyordum!"),
    gidis: m("Mum's calling, I'm running.", "Annem çağırıyor, koşuyorum."),
    hikaye: [m("I'm going to be a sushi chef when I grow up.", "Büyüyünce suşi ustası olacağım."), m("I tried with rice at home. The carpet got a bit sticky.", "Evde pirinçle denedim. Halı biraz yapış yapış oldu."), m("Will you get me an apron too? A small one.", "Bana da bir önlük alır mısın? Küçük olan.")],
  },
];

export const KARAKTER_MAP: Record<string, Karakter> = Object.fromEntries(
  KARAKTERLER.map((k) => [k.id, k]),
);

export const OYUNCU_RENKLERI = ["#5b8def", "#e8a33d", "#59b98a", "#c86fc9"];
export const OYUNCU_ADLARI = ["Mavi", "Sarı", "Yeşil", "Mor"];


// ---------------------------------------------------------------- mevsimler
export type MevsimId = "ilkbahar" | "yaz" | "sonbahar" | "kis";

export interface Mevsim {
  id: MevsimId;
  ad: Yerel;
  /** Gökyüzü gradyanı (üstten alta). */
  gok: [string, string, string];
  /** Uzak tepeler ve deniz. */
  tepe: string;
  tepeUzak: string;
  deniz: string;
  /** Havada süzülen parçacık ("cicek" | "yaprak" | "kar" | "atesbocegi"). */
  parcacik: "cicek" | "yaprak" | "kar" | "atesbocegi";
  parcacikRenk: string[];
  selam: Yerel;
}

export const MEVSIMLER: Mevsim[] = [
  {
    id: "ilkbahar",
    ad: m("Spring", "İlkbahar"),
    gok: ["#FFF3F0", "#FFE6E4", "#FCE4D8"],
    tepe: "#CDE3C4",
    tepeUzak: "#DCEAD8",
    deniz: "#CFE3EC",
    parcacik: "cicek",
    parcacikRenk: ["#FFC9D4", "#FFDCE3", "#FFB9C6"],
    selam: m("Cherry blossoms have fallen; the town is pink.", "Kiraz çiçekleri döküldü, kasaba pembe."),
  },
  {
    id: "yaz",
    ad: m("Summer", "Yaz"),
    gok: ["#FFF8EC", "#FFEFD6", "#FFE3C8"],
    tepe: "#BEDCA8",
    tepeUzak: "#D4E8C6",
    deniz: "#B9DDE4",
    parcacik: "atesbocegi",
    parcacikRenk: ["#FFE9A8", "#FFF3CC", "#FFDC8A"],
    selam: m("Long evenings, warm sea.", "Akşamlar uzun, deniz ılık."),
  },
  {
    id: "sonbahar",
    ad: m("Autumn", "Sonbahar"),
    gok: ["#FFF1E4", "#FFE2CE", "#F7D6C4"],
    tepe: "#E8C79B",
    tepeUzak: "#F0DCC0",
    deniz: "#CBDCE0",
    parcacik: "yaprak",
    parcacikRenk: ["#F0A868", "#E88C5A", "#F5C48A"],
    selam: m("The wind carries leaves all the way to the counter.", "Rüzgâr yaprakları tezgâha kadar getiriyor."),
  },
  {
    id: "kis",
    ad: m("Winter", "Kış"),
    gok: ["#F4F6FB", "#EAEFF8", "#E4EAF4"],
    tepe: "#E8EEF4",
    tepeUzak: "#F2F5FA",
    deniz: "#D2DEE8",
    parcacik: "kar",
    parcacikRenk: ["#FFFFFF", "#EEF4FA", "#E2ECF6"],
    selam: m("It is snowing. Inside looks warmer.", "Kar yağıyor. İçerisi daha sıcak görünüyor."),
  },
];

/** Her 5 gün bir mevsim döner. */
export function mevsimGun(gun: number): Mevsim {
  return MEVSIMLER[Math.floor((gun - 1) / 5) % MEVSIMLER.length]!;
}

// ---------------------------------------------------------------- dükkân
export interface Dekor {
  id: string;
  ad: Yerel;
  aciklama: Yerel;
  fiyat: number;
  /** Misafir sabrına katkı (0.06 = %6 daha sabırlı). */
  sicaklik: number;
  ikon: string;
  /** Sahnedeki yeri: sol duvar / sağ duvar / tezgâh / tavan. */
  yer: "sol" | "sag" | "tezgah" | "tavan";
  /** Pasif bir yeteneği varsa: "bot" düzenli aralıklarla ikram dağıtır. */
  etki?: "bot";
}

export const DEKORLAR: Dekor[] = [
  { id: "cicek_vazo", ad: m("Flower Vase", "Çiçek Vazosu"), aciklama: m("A little vase at the end of the counter.", "Tezgâhın ucunda küçük bir vazo."), fiyat: 40, sicaklik: 0.05, ikon: "dek_vazo", yer: "tezgah" },
  { id: "noren", ad: m("Noren Curtain", "Noren Perdesi"), aciklama: m("Indigo cloth hung at the door.", "Kapıya asılan indigo bez."), fiyat: 55, sicaklik: 0.05, ikon: "dek_noren", yer: "tavan" },
  { id: "bonsai", ad: m("Bonsai", "Bonsai"), aciklama: m("A tiny tree, patiently pruned.", "Sabırla budanmış minik bir ağaç."), fiyat: 70, sicaklik: 0.06, ikon: "dek_bonsai", yer: "sol" },
  { id: "kedi_yatagi", ad: m("Cat Bed", "Kedi Yatağı"), aciklama: m("For Nen. Nen earned this.", "Nen için. Nen bunu hak etti."), fiyat: 85, sicaklik: 0.07, ikon: "dek_kedi_yatagi", yer: "sag" },
  { id: "fener_dizisi", ad: m("String of Lanterns", "Fener Dizisi"), aciklama: m("Paper lanterns strung from the ceiling.", "Tavandan sarkan kâğıt fenerler."), fiyat: 100, sicaklik: 0.08, ikon: "dek_fener_dizisi", yer: "tavan" },
  { id: "maneki", ad: m("Maneki Neko", "Maneki Neko"), aciklama: m("The waving lucky cat.", "El sallayan uğur kedisi."), fiyat: 120, sicaklik: 0.08, ikon: "dek_maneki", yer: "tezgah" },
  { id: "pencere", ad: m("Sea Window", "Deniz Penceresi"), aciklama: m("You cut the wall open to the sea.", "Duvarı kesip denize açtın."), fiyat: 160, sicaklik: 0.10, ikon: "dek_pencere", yer: "sol" },
  { id: "kagit_lamba", ad: m("Paper Lamp", "Kâğıt Lamba"), aciklama: m("A soft, yellow light.", "Yumuşak, sarı bir ışık."), fiyat: 140, sicaklik: 0.09, ikon: "dek_lamba", yer: "sag" },
  {
    id: "servis_botu",
    ad: m("Service Bot", "Servis Botu"),
    aciklama: m("Keeps handing out drinks so guests stay cheerful.", "Sürekli içecek dağıtır, misafirlerin keyfi yerinde kalır."),
    fiyat: 260,
    sicaklik: 0.04,
    ikon: "dek_bot",
    yer: "sag",
    etki: "bot",
  },
];

export const DEKOR_MAP: Record<string, Dekor> = Object.fromEntries(DEKORLAR.map((d) => [d.id, d]));

/** Satın alınan dekorların toplam sıcaklığı → misafir sabrı çarpanı. */
export function sicaklikCarpani(dekor: string[]): number {
  return 1 + dekor.reduce((t, id) => t + (DEKOR_MAP[id]?.sicaklik ?? 0), 0);
}

/**
 * Dil katmanı. Oyun İngilizce önceliklidir; cihaz dili Türkçe ise Türkçeye düşer.
 * Oyuncu ayarlardan elle de değiştirebilir.
 *
 * Kullanıcıya görünen her metin `Yerel` tipindedir ({ en, tr }) ve `y()` ile okunur.
 * Böylece çeviri, metnin tanımlandığı yerde durur — ayrı bir anahtar tablosu
 * senkron tutma derdi olmaz.
 */

import { storageGet, storageSet } from "./storage";
export type LangCode = "en" | "tr";

export interface Localized {
  en: string;
  tr: string;
}

const DEPO = "tsuki.dil";
let aktif: LangCode = "en";

/** Cihaz dilinden başlangıç dilini seçer; kayıtlı tercih varsa o kazanır. */
export function initLang(): LangCode {
  let secim: LangCode | null = null;
  try {
    const kayitli = storageGet(DEPO);
    if (kayitli === "en" || kayitli === "tr") secim = kayitli;
  } catch {
    /* depoya erişilemiyorsa cihaz diline bak */
  }
  if (!secim) {
    const diller = navigator.languages?.length ? navigator.languages : [navigator.language];
    secim = diller.some((d) => d?.toLowerCase().startsWith("tr")) ? "tr" : "en";
  }
  aktif = secim;
  document.documentElement.lang = secim;
  return secim;
}

export function activeLang(): LangCode {
  return aktif;
}

export function setLang(d: LangCode) {
  aktif = d;
  document.documentElement.lang = d;
  try {
    storageSet(DEPO, d);
  } catch {
    /* yazamazsak da oturum boyunca geçerli */
  }
}

/** Yerel metni aktif dilde döndürür. */
export function y(m: Localized | string): string {
  return typeof m === "string" ? m : (m[aktif] ?? m.en);
}

/** Kısa yazım: metin tanımlarken. */
export function m(en: string, tr: string): Localized {
  return { en, tr };
}

/** `{name}` gibi yer tutucuları doldurur. */
export function format(text: Localized | string, degerler: Record<string, string | number>): string {
  return y(text).replace(/\{(\w+)\}/g, (_, anahtar: string) =>
    String(degerler[anahtar] ?? `{${anahtar}}`),
  );
}

// ---------------------------------------------------------------- arayüz metinleri
export const S = {
  // üst bar
  day: m("Day", "Gün"),
  guideOn: m("Guide on", "Rehber açık"),
  rehberKapali: m("Guide off", "Rehber kapalı"),
  sfxOn: m("Sound on", "Ses açık"),
  sesKapali: m("Sound off", "Ses kapalı"),

  // salon
  bosMasa: m("empty table", "boş masa"),
  tray: m("tray", "tray"),
  onServe: m("Serve", "Servis Et"),
  siparisEksik: m("The order isn't complete yet — they'll wait.", "Sipariş henüz tamam değil — misafir bekliyor."),
  birlikte: m("together!", "birlikte!"),

  // menü ekranı
  oyunAdi: m("Hey Sushi", "Hey Sushi"),
  girisAlt: m(
    "A tiny sushi counter in a small seaside town. No rush, no losing — just a nice evening.",
    "Küçük bir kıyı kasabasında minik bir suşi tezgâhı. Acele yok, kaybetmek yok — sadece güzel bir akşam.",
  ),
  gunAlt: m("Today's menu is a little fuller. Take your time.", "Bugünün menüsü biraz daha kalabalık. Yavaş yavaş."),
  adim1Baslik: m("1 · Make", "1 · Üret"),
  adim1: m(
    "Tap the stations along the bottom. Each tap is one step; when it fills, the ingredient is in your hands.",
    "Alt sıradaki istasyonlara dokun. Her dokunuş bir adım; dolunca malzeme eline gelir.",
  ),
  adim2Baslik: m("2 · Drag it over", "2 · Sürükle bırak"),
  adim2: m(
    "Drag the ingredient onto a guest's table — or just tap.",
    "Malzemeyi parmağınla misafirin tepsisine sürükle — ya da sadece dokun.",
  ),
  adim3Baslik: m("3 · Serve", "3 · Servis et"),
  adim3: m(
    "When the order chips turn green, hit Serve. Collect hearts.",
    "Sipariş çipleri yeşile dönünce Servis Et'e bas. Kalpleri topla.",
  ),
  kaybetmekYok: m(
    "You can't lose: guests only get a little less cheerful while waiting. Stuck? The <b>Guide</b> up top tells you what to do.",
    "Kaybetmek yok: misafirler beklerken sadece keyifleri azalır. Takıldığın anda üstteki <b>Rehber</b> sana ne yapacağını söyler.",
  ),
  tezgahiAc: m("Open the Counter", "Tezgâhı Aç"),
  guneBasla: m("Start the Day", "Güne Başla"),
  tarifAtolyesi: m("Recipe Workshop", "Tarif Atölyesi"),
  garsonun: m("Your Server", "Garsonun"),
  langSection: m("Language", "Dil"),

  // gün sonu
  gunKapandi: m("Day {day} is over", "Gün {day} kapandı"),
  gunSonuAlt: m(
    "You wiped the counter and dimmed the lanterns. Not a bad day.",
    "Tezgâhı sildin, fenerleri söndürdün. Fena bir gün değildi.",
  ),
  servisEdilen: m("Guests served", "Servis edilen misafir"),
  kusursuz: m("Perfect plates", "Kusursuz tabak"),
  birlikteHazir: m("Made together", "Birlikte hazırlanan"),
  vazgecen: m("Gave up waiting", "Beklemekten vazgeçen"),
  bugunKalp: m("Today's hearts", "Bugünün kalbi"),
  toplam: m("Total", "Toplam"),
  yarinaGec: m("On to Tomorrow", "Yarına Geç"),

  // dükkân
  shopSection: m("Shop", "Dükkân"),
  dukkanNot: m(
    "Every warm little thing makes guests a bit more patient.",
    "Dükkânı sıcaklaştıran her eşya misafirleri biraz daha sabırlı yapar.",
  ),
  alindi: m("owned", "alındı"),

  // atölye
  atolyeBaslik: m("Recipe Workshop", "Tarif Atölyesi"),
  atolyeAlt: m(
    "Design your own sushi. Saved recipes join the menu and guests start ordering them.",
    "Kendi suşini tasarla. Kaydettiğin tarif menüye girer ve misafirler sipariş etmeye başlar.",
  ),
  base: m("Base", "Taban"),
  icMalzeme: m("Filling (up to {n})", "İç malzeme (en fazla {n})"),
  garnish: m("Garnish (up to {n})", "Garnitür (en fazla {n})"),
  isimVeHikaye: m("Name and note", "İsim ve hikâye"),
  tarifAdiIpucu: m("Recipe name — e.g. Moonlight Nigiri", "Tarifin adı — örn. Ay Işığı Nigiri"),
  kisaNot: m("A short note (optional)", "Kısa bir not (isteğe bağlı)"),
  isimsizTarif: m("Untitled recipe", "İsimsiz tarif"),
  kalpBirimi: m("{n} hearts", "{n} kalp"),
  kayitliTarifler: m("Your recipes ({n})", "Kayıtlı tariflerin ({n})"),
  menuyeEkle: m("Add to Menu", "Menüye Ekle"),
  isimKullaniliyor: m("That name is taken", "Bu isim kullanılıyor"),
  malzemeYok: m(
    "No ingredients for this base yet — check back in a few days.",
    "Bu taban için henüz malzemen yok — birkaç gün sonra tekrar bak.",
  ),
  kilitliMalzeme: m("Not unlocked yet — saving this recipe opens its station", "Henüz açılmadı — bu tarifi kaydedince istasyonu açılır"),
  istasyonAcilacak: m("{n} new station will open on your counter", "Tezgâhına {n} yeni istasyon eklenecek"),
  menuyeEklendi: m('"{name}" added to the menu', '"{name}" menüye eklendi'),
  menudenKaldir: m("Remove from menu", "Menüden kaldır"),
  kapat: m("Close", "Kapat"),
  vazgec: m("Cancel", "Vazgeç"),
  kaydet: m("Save", "Kaydet"),

  // avatar
  avatarBaslik: m("Design Your Server", "Garsonunu Tasarla"),
  avatarAlt: m(
    "That's you behind the counter. Your name shows up beside the tables.",
    "Tezgâhın arkasındaki kişi sensin. Adın masaların yanında görünecek.",
  ),
  kullaniciAdi: m("Your name", "Kullanıcı adın"),
  adIpucu: m("Your name — shown above your server", "Adın — garsonun üstünde görünür"),
  karakter: m("Character", "Karakter"),
  kadin: m("Woman", "Kadın"),
  erkek: m("Man", "Erkek"),
  skin: m("Skin", "Ten"),
  sacBolum: m("Hair", "Saç"),
  sacRengi: m("Hair colour", "Saç rengi"),
  kiyafetRengi: m("Outfit colour", "Kıyafet rengi"),
  onlukRengi: m("Apron colour", "Önlük rengi"),
  sacAksesuari: m("Hair accessory", "Saç aksesuarı"),
  yuzAksesuari: m("Face accessory", "Yüz aksesuarı"),
  merhaba: m("Hi {name}", "Merhaba {name}"),

  // rehber cümleleri
  ipucuSakin: m(
    "The counter is quiet. Another guest will come along soon.",
    "Tezgâh sakin. Biraz sonra yeni bir misafir gelecek.",
  ),
  ipucuBirak: m("{ingredient} is ready — drop it on {name}'s tray.", "{ingredient} hazır — {name}'in tepsisine bırak."),
  ipucuMat: m("Put the {ingredient} on the rolling mat.", "{ingredient}'i sarma matına koy."),
  ipucuGereksiz: m(
    "{ingredient} isn't needed right now — you can compost it.",
    "{ingredient} şu an gerekmiyor — komposta bırakabilirsin.",
  ),
  ipucuServis: m("{name}'s order is complete — hit Serve!", "{name}'in siparişi tamam — Servis Et'e bas!"),
  ipucuMakiAl: m("Take the rolled maki off the mat.", "Sarılan makiyi mattan al."),
  ipucuMatSar: m("The mat is ready — tap {n} times to roll.", "Mat hazır — sarmak için {n} kez dokun."),
  ipucuUret: m(
    "{dish} needs {ingredient} — tap the {station} station.",
    "{dish} için {ingredient} lazım — {station} istasyonuna dokun.",
  ),
  ipucuUretKisi: m(
    "{name} needs {ingredient} — tap the {station} station {n} times.",
    "{name} için {ingredient} lazım — {station} istasyonuna {n} kez dokun.",
  ),
  ipucuKontrol: m("Check the orders.", "Siparişleri kontrol et."),

  // hatalar
  hataElDolu: m("Put down what you're holding first", "Önce elindekini bırak"),
  hataElBos: m("Your hands are already empty", "Elin zaten boş"),
  hataMatDolu: m("Take the rolled maki first", "Önce sarılan makiyi al"),
  hataMataGitmez: m("That doesn't go on the mat", "Bu mata gitmez"),
  hataMattaVar: m("That ingredient is already on the mat", "O malzeme matta var"),
  hataMakiOlmuyor: m("That filling doesn't make a maki", "Bu iç maki olmuyor"),
  hataMatBos: m("The mat is empty — add nori, rice and a filling", "Mat boş — nori, pirinç ve bir iç malzeme koy"),
  hataTepsiDolu: m("The tray is full", "Tepsi dolu"),
  hataTepsiBos: m("The tray is empty", "Tepsi boş"),
  musicOn: m("Sound on", "Ses açık"),
  muzikKapali: m("Sound off", "Ses kapalı"),
  muzik: m("Music", "Müzik"),
  efektler: m("Sound effects", "Ses efektleri"),
  kaydetCik: m("Save & Quit", "Kaydet ve Çık"),
  keyif: m("Mood", "Keyif"),
  ipucuIkram: m("{name} is getting restless — a welcome drink would help.", "{name} sıkılmaya başladı — bir ikram iyi gelir."),
  cikisBaslik: m("Save & Quit", "Kaydet ve Çık"),
  cikisAlt: m("Your progress is saved. The counter will be waiting.", "İlerlemen kaydedildi. Tezgâh seni bekliyor olacak."),
  toplamKalp: m("Total hearts", "Toplam kalp"),
  jetonlar: m("Coins", "Jetonlar"),
  dukkanEsyasi: m("Shop items", "Dükkân eşyası"),
  ozelTarifler: m("Your recipes", "Kendi tariflerin"),
  cikisOnay: m("Save & Quit", "Kaydet ve Çık"),
  kaydedildi: m("Saved", "Kaydedildi"),
  devamEt: m("Continue — Day {day}", "Devam et — Gün {day}"),
  yenidenBasla: m("Start over", "Yeniden başla"),
  guncellemeHazir: m("A new version is ready", "Yeni sürüm hazır"),
  guncelleSimdi: m("Update now", "Şimdi güncelle"),
  guncelleSonra: m("Later", "Sonra"),
  guncelleniyor: m("Updating…", "Güncelleniyor…"),
  misafirBekler: m("I think there's a bit more coming — I'll wait.", "Sanırım biraz daha var, ben beklerim."),
} as const;

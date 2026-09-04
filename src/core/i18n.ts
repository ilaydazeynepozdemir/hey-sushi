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
    const savedRecipes = storageGet(DEPO);
    if (savedRecipes === "en" || savedRecipes === "tr") secim = savedRecipes;
  } catch {
    /* depoya erişilemiyorsa cihaz diline bak */
  }
  if (!secim) {
    const langs = navigator.languages?.length ? navigator.languages : [navigator.language];
    secim = langs.some((d) => d?.toLowerCase().startsWith("tr")) ? "tr" : "en";
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
  guideOffLabel: m("Guide off", "Rehber kapalı"),
  sfxOn: m("Sound on", "Ses açık"),
  sfxOffLabel: m("Sound off", "Ses kapalı"),

  // salon
  emptyTable: m("empty table", "boş masa"),
  tray: m("tray", "tray"),
  onServe: m("Serve", "Servis Et"),
  orderIncomplete: m("The order isn't complete yet — they'll wait.", "Sipariş henüz tamam değil — misafir bekliyor."),
  togetherLabel: m("together!", "birlikte!"),

  // menü ekranı
  gameName: m("Hey Sushi", "Hey Sushi"),
  introSub: m(
    "A tiny sushi counter in a small seaside town. No rush, no losing — just a nice evening.",
    "Küçük bir kıyı kasabasında minik bir suşi tezgâhı. Acele yok, kaybetmek yok — sadece güzel bir akşam.",
  ),
  daySub: m("Today's menu is a little fuller. Take your time.", "Bugünün menüsü biraz daha kalabalık. Yavaş yavaş."),
  step1Title: m("1 · Make", "1 · Üret"),
  step1: m(
    "Tap the stations along the bottom. Each tap is one step; when it fills, the ingredient is in your hands.",
    "Alt sıradaki istasyonlara dokun. Her dokunuş bir adım; dolunca malzeme eline gelir.",
  ),
  step2Title: m("2 · Drag it over", "2 · Sürükle bırak"),
  step2: m(
    "Drag the ingredient onto a guest's table — or just tap.",
    "Malzemeyi parmağınla misafirin tepsisine sürükle — ya da sadece dokun.",
  ),
  step3Title: m("3 · Serve", "3 · Servis et"),
  step3: m(
    "When the order chips turn green, hit Serve. Collect hearts.",
    "Sipariş çipleri yeşile dönünce Servis Et'e bas. Kalpleri topla.",
  ),
  noLosing: m(
    "You can't lose: guests only get a little less cheerful while waiting. Stuck? The <b>Guide</b> up top tells you what to do.",
    "Kaybetmek yok: misafirler beklerken sadece keyifleri azalır. Takıldığın anda üstteki <b>Rehber</b> sana ne yapacağını söyler.",
  ),
  openCounter: m("Open the Counter", "Tezgâhı Aç"),
  startDay: m("Start the Day", "Güne Başla"),
  recipeWorkshop: m("Recipe Workshop", "Tarif Atölyesi"),
  yourServer: m("Your Server", "Garsonun"),
  langSection: m("Language", "Dil"),

  // gün sonu
  dayOver: m("Day {day} is over", "Gün {day} kapandı"),
  dayEndSub: m(
    "You wiped the counter and dimmed the lanterns. Not a bad day.",
    "Tezgâhı sildin, fenerleri söndürdün. Fena bir gün değildi.",
  ),
  guestsServed: m("Guests served", "Servis edilen misafir"),
  perfectPlates: m("Perfect plates", "Kusursuz tabak"),
  madeTogether: m("Made together", "Birlikte hazırlanan"),
  gaveUp: m("Gave up waiting", "Beklemekten vazgeçen"),
  todayHearts: m("Today's hearts", "Bugünün kalbi"),
  total: m("Total", "Toplam"),
  toTomorrow: m("On to Tomorrow", "Yarına Geç"),

  // dükkân
  shopSection: m("Shop", "Dükkân"),
  shopNote: m(
    "Every warm little thing makes guests a bit more patient.",
    "Dükkânı sıcaklaştıran her eşya misafirleri biraz daha sabırlı yapar.",
  ),
  owned: m("owned", "alındı"),

  // atölye
  workshopTitle: m("Recipe Workshop", "Tarif Atölyesi"),
  workshopSub: m(
    "Design your own sushi. Saved recipes join the menu and guests start ordering them.",
    "Kendi suşini tasarla. Kaydettiğin tarif menüye girer ve misafirler sipariş etmeye başlar.",
  ),
  base: m("Base", "Taban"),
  fillingLabel: m("Filling (up to {n})", "İç malzeme (en fazla {n})"),
  garnish: m("Garnish (up to {n})", "Garnitür (en fazla {n})"),
  nameAndNote: m("Name and note", "İsim ve hikâye"),
  recipeNamePlaceholder: m("Recipe name — e.g. Moonlight Nigiri", "Tarifin adı — örn. Ay Işığı Nigiri"),
  notePlaceholder: m("A short note (optional)", "Kısa bir not (isteğe bağlı)"),
  untitledRecipe: m("Untitled recipe", "İsimsiz tarif"),
  heartsCount: m("{n} hearts", "{n} kalp"),
  yourRecipes: m("Your recipes ({n})", "Kayıtlı tariflerin ({n})"),
  addToMenu: m("Add to Menu", "Menüye Ekle"),
  nameTaken: m("That name is taken", "Bu isim kullanılıyor"),
  noFillingsYet: m(
    "No ingredients for this base yet — check back in a few days.",
    "Bu taban için henüz malzemen yok — birkaç gün sonra tekrar bak.",
  ),
  lockedFilling: m("Not unlocked yet — saving this recipe opens its station", "Henüz açılmadı — bu tarifi kaydedince istasyonu açılır"),
  stationsWillOpen: m("{n} new station will open on your counter", "Tezgâhına {n} yeni station eklenecek"),
  addedToMenu: m('"{name}" added to the menu', '"{name}" menüye eklendi'),
  removeFromMenu: m("Remove from menu", "Menüden kaldır"),
  closeLabel: m("Close", "Kapat"),
  cancelLabel: m("Cancel", "Vazgeç"),
  saveLabel: m("Save", "Kaydet"),

  // avatar
  avatarTitle: m("Design Your Server", "Garsonunu Tasarla"),
  avatarSub: m(
    "That's you behind the counter. Your name shows up beside the tables.",
    "Tezgâhın arkasındaki kişi sensin. Adın masaların yanında görünecek.",
  ),
  yourName: m("Your name", "Kullanıcı adın"),
  namePlaceholder: m("Your name — shown above your server", "Adın — garsonun üstünde görünür"),
  characterLabel: m("Character", "Karakter"),
  woman: m("Woman", "Kadın"),
  man: m("Man", "Erkek"),
  skin: m("Skin", "Ten"),
  hairLabel: m("Hair", "Saç"),
  hairColorLabel: m("Hair colour", "Saç rengi"),
  outfitColorLabel: m("Outfit colour", "Kıyafet rengi"),
  apronColorLabel: m("Apron colour", "Önlük rengi"),
  hairAccessoryLabel: m("Hair accessory", "Saç aksesuarı"),
  faceAccessoryLabel: m("Face accessory", "Yüz aksesuarı"),
  greeting: m("Hi {name}", "Merhaba {name}"),

  // rehber cümleleri
  hintQuiet: m(
    "The counter is quiet. Another guest will come along soon.",
    "Tezgâh sakin. Biraz sonra yeni bir misafir gelecek.",
  ),
  hintDrop: m("{ingredient} is ready — drop it on {name}'s tray.", "{ingredient} hazır — {name}'in tepsisine bırak."),
  hintMat: m("Put the {ingredient} on the rolling mat.", "{ingredient}'i sarma matına koy."),
  hintNotNeeded: m(
    "{ingredient} isn't needed right now — you can compost it.",
    "{ingredient} şu an gerekmiyor — komposta bırakabilirsin.",
  ),
  hintServe: m("{name}'s order is complete — hit Serve!", "{name}'in siparişi tamam — Servis Et'e bas!"),
  hintTakeMaki: m("Take the rolled maki off the mat.", "Sarılan makiyi mattan al."),
  hintRollMat: m("The mat is ready — tap {n} times to roll.", "Mat hazır — sarmak için {n} kez dokun."),
  hintMake: m(
    "{dish} needs {ingredient} — tap the {station} station.",
    "{dish} için {ingredient} lazım — {station} istasyonuna dokun.",
  ),
  hintMakeFor: m(
    "{name} needs {ingredient} — tap the {station} station {n} times.",
    "{name} için {ingredient} lazım — {station} istasyonuna {n} kez dokun.",
  ),
  hintCheck: m("Check the orders.", "Siparişleri kontrol et."),

  // hatalar
  errHandsFull: m("Put down what you're holding first", "Önce elindekini bırak"),
  errHandsEmpty: m("Your hands are already empty", "Elin zaten boş"),
  errMatFull: m("Take the rolled maki first", "Önce sarılan makiyi al"),
  errNotForMat: m("That doesn't go on the mat", "Bu mata gitmez"),
  errAlreadyOnMat: m("That ingredient is already on the mat", "O malzeme matta var"),
  errNoMaki: m("That filling doesn't make a maki", "Bu iç maki olmuyor"),
  errMatEmpty: m("The mat is empty — add nori, rice and a filling", "Mat boş — nori, pirinç ve bir iç malzeme koy"),
  errTrayFull: m("The tray is full", "Tepsi dolu"),
  errTrayEmpty: m("The tray is empty", "Tepsi boş"),
  musicOn: m("Sound on", "Ses açık"),
  soundOff: m("Sound off", "Ses kapalı"),
  musicLabel: m("Music", "Müzik"),
  sfxLabel: m("Sound effects", "Ses efektleri"),
  saveQuit: m("Save & Quit", "Kaydet ve Çık"),
  moodLabelText: m("Mood", "Keyif"),
  hintTreat: m("{name} is getting restless — a welcome drink would help.", "{name} sıkılmaya başladı — bir ikram iyi gelir."),
  quitTitle: m("Save & Quit", "Kaydet ve Çık"),
  quitSub: m("Your progress is saved. The counter will be waiting.", "İlerlemen kaydedildi. Tezgâh seni bekliyor olacak."),
  totalHearts: m("Total hearts", "Toplam kalp"),
  coinsLabel: m("Coins", "Jetonlar"),
  shopItems: m("Shop items", "Dükkân eşyası"),
  yourCustom: m("Your recipes", "Kendi tariflerin"),
  confirmQuit: m("Save & Quit", "Kaydet ve Çık"),
  saved: m("Saved", "Kaydedildi"),
  continueDay: m("Continue — Day {day}", "Devam et — Gün {day}"),
  startOver: m("Start over", "Yeniden başla"),
  updateReady: m("A new version is ready", "Yeni sürüm hazır"),
  updateNow: m("Update now", "Şimdi güncelle"),
  updateLater: m("Later", "Sonra"),
  updating: m("Updating…", "Güncelleniyor…"),
  guestWillWait: m("I think there's a bit more coming — I'll wait.", "Sanırım biraz daha var, ben beklerim."),
} as const;

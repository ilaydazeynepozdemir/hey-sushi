import "./ui/styles.css";
import {
  hepsi as tumTarifler,
  tarifEkle,
  tarifinAcacagiIstasyonlar,
  tarifiKaldir,
  tarifiUygula,
  tarifleriYukle,
} from "./core/atolye";
import type { OzelTarif } from "./core/atolye";
import { avatarAta, istasyonAc, oyuncuCikar, oyuncuEkle, uygula, yeniOyun } from "./core/game";
import { avatarKaydet as avatarDepola, avatarYukle } from "./core/avatar";
import type { Avatar } from "./core/avatar";
import { S, bicim, dilBaslat, y } from "./core/dil";
import { sonrakiIpucu } from "./core/ipucu";
import { mevsimGun } from "./core/content";
import { kayitOku, kayitUygula, kayitYaz } from "./core/kayit";
import type { Aksiyon, OyunDurumu, OyunOlayi, PlayerId } from "./core/types";
import { Capacitor } from "@capacitor/core";
import { depoGeriYukle, depoYaz } from "./core/depo";
import { guncellemeBaslat, guncellemeyiErtele, guncellemeyiUygula } from "./core/guncelleme";
import { nativeBaslat } from "./core/native";
import { titresimBasari, titresimHafif } from "./core/titresim";
import { Oda } from "./net/oda";
import { muzikAcKapa, muzikAcikMi, muzikBaslat, muzikDuraklat, muzikMevsim } from "./ui/muzik";
import {
  sesAcKapa,
  sesBeraber,
  sesBirak,
  sesGunSonu,
  sesHata,
  sesMisafir,
  sesServis,
  sesTik,
  sesUretim,
} from "./ui/audio";
import { Arayuz, hedefListesi } from "./ui/view";

const kok = document.getElementById("app");
if (!kok) throw new Error("#app yok");

let durum: OyunDurumu = yeniOyun(1, undefined, avatarYukle());
let secim = 0;
let tikSayaci = 0;
let sonTikHedef: import("./core/types").HedefId | null = null;
let sonAksiyonOyuncu: PlayerId = 0;
let rehberAcik = localStorage.getItem("tsuki.rehber") !== "0";
let atolyeAcik = false;
let avatarAcik = false;
let sesAcik = true;
let cikisAcik = false;
let muzikBasladi = false;
let muzikMevsimi = "";
let benimAvatar: Avatar = avatarYukle();
let klavyeAktif = false;

/** Online oyunda bu istemcinin sürdüğü oyuncu. */
let benId: PlayerId = 0;
/** Host tarafında: röle üye kimliği → oyuncu indeksi. */
const uyeOyuncu = new Map<number, PlayerId>();
let sonYayin = 0;
let netUyari = "";

dilBaslat();
tarifleriYukle();

/** Kayıtlı ilerleme varsa geri yükle (gün, kalp, jeton, dükkân). */
const acilisKaydi = kayitOku();

if (acilisKaydi) kayitUygula(durum, acilisKaydi);

/** Kaydedip uygulamadan çık (web'de çıkış yok: menüye dön). */
async function cikisYap() {
  if (Capacitor.isNativePlatform()) {
    const { App: Uygulama } = await import("@capacitor/app");
    await Uygulama.exitApp();
    return;
  }
  durum.faz = "menu";
  arayuz.perdeYenile();
  ciz();
}

// ---------------------------------------------------------------- ağ
const oda = new Oda({
  onDurum(veri) {
    const v = veri as { t?: string; durum?: OyunDurumu; benId?: number; tarifler?: OzelTarif[] };
    if (v.t === "kimlik") {
      benId = (v.benId ?? 0) as PlayerId;
      for (const t of v.tarifler ?? []) tarifiUygula(t);
      oda.yolla({ t: "avatar", avatar: benimAvatar });
      arayuz.perdeYenile();
    } else if (v.t === "durum" && v.durum) {
      durum = v.durum;
    }
    ciz();
  },
  onAksiyon(uyeId, veri) {
    // Sadece ev sahibi burayı görür: gelen aksiyonu kendi durumuna uygular.
    const v = veri as { t?: string; aksiyon?: Aksiyon; avatar?: Avatar };
    const oyuncu = uyeOyuncu.get(uyeId);
    if (oyuncu === undefined) return;
    if (v.t === "avatar" && v.avatar) {
      avatarAta(durum, oyuncu, v.avatar);
      yayinla(true);
      ciz();
      return;
    }
    if (v.t !== "aksiyon" || !v.aksiyon) return;
    const a = v.aksiyon;
    if (a.tip !== "etkilesim" && a.tip !== "servis") return;
    sonAksiyonOyuncu = oyuncu;
    olaylariIsle(uygula(durum, { ...a, oyuncu }));
    yayinla(true);
    ciz();
  },
  onUyeGirdi(id, ad) {
    const oyuncu = oyuncuEkle(durum, ad);
    if (oyuncu === null) return;
    uyeOyuncu.set(id, oyuncu);
    oda.yolla({ t: "kimlik", benId: oyuncu, tarifler: tumTarifler() }, id);
    yayinla(true);
    arayuz.uyar(`${durum.oyuncular[oyuncu]?.ad ?? "?"} ${y({ en: "joined the room", tr: "odaya katıldı" })}`);
    arayuz.perdeYenile();
    ciz();
  },
  onUyeCikti(id) {
    const oyuncu = uyeOyuncu.get(id);
    if (oyuncu !== undefined) {
      oyuncuCikar(durum, oyuncu);
      uyeOyuncu.delete(id);
    }
    yayinla(true);
    arayuz.perdeYenile();
    ciz();
  },
  onKapandi(sebep) {
    netUyari = `${y({ en: "Room closed", tr: "Oda kapandı" })}: ${sebep}`;
    uyeOyuncu.clear();
    benId = 0;
    durum = tekBasinaDevam(durum);
    arayuz.uyar(netUyari);
    arayuz.perdeYenile();
    ciz();
  },
  onHata(mesaj) {
    netUyari = mesaj;
    arayuz.uyar(mesaj);
    arayuz.perdeYenile();
    ciz();
  },
  onDegisti() {
    arayuz.perdeYenile();
    ciz();
  },
});

/** Oda dağılınca tek kişilik oyuna düş. */
function tekBasinaDevam(eski: OyunDurumu): OyunDurumu {
  const yeni = yeniOyun(1, undefined, benimAvatar);
  yeni.gun = eski.gun;
  yeni.kalp = eski.kalp;
  yeni.jeton = eski.jeton;
  yeni.dekor = eski.dekor;
  return yeni;
}

function yayinla(zorla = false) {
  if (oda.rol !== "host" || !oda.bagli) return;
  const simdi = performance.now();
  if (!zorla && simdi - sonYayin < 80) return;
  sonYayin = simdi;
  oda.yolla({ t: "durum", durum });
}

// ---------------------------------------------------------------- arayüz
const arayuz = new Arayuz(kok, {
  hedefeTikla(hedef) {
    calistir({ tip: "etkilesim", oyuncu: benimId(), hedef });
  },
  servisEt(misafirId) {
    calistir({ tip: "servis", oyuncu: benimId(), misafirId });
  },
  gunBasla() {
    calistir({ tip: "gun_basla" });
  },
  sonrakiGun() {
    calistir({ tip: "sonraki_gun" });
  },
  dekorAl(id) {
    calistir({ tip: "dekor_al", id });
  },
  sesDegis() {
    sesAcik = sesAcKapa();
    ciz();
  },
  muzikDegis() {
    muzikAcKapa();
    ciz();
  },
  cikisAc() {
    cikisAcik = true;
    arayuz.perdeYenile();
    ciz();
  },
  cikisKapat() {
    cikisAcik = false;
    arayuz.perdeYenile();
    ciz();
  },
  cikisOnayla() {
    kayitYaz(durum);
    cikisAcik = false;
    void cikisYap();
  },
  dilDegis() {
    // Metinler her yerde yeniden okunmalı: arayüzü baştan kur.
    arayuz.yenidenKur();
    arayuz.perdeYenile();
    ciz();
  },
  avatarAc() {
    avatarAcik = true;
    arayuz.perdeYenile();
    ciz();
  },
  avatarKapat() {
    avatarAcik = false;
    arayuz.perdeYenile();
    ciz();
  },
  avatarKaydet(a) {
    benimAvatar = a;
    avatarDepola(a);
    avatarAcik = false;
    if (oda.rol === "misafir") {
      oda.yolla({ t: "avatar", avatar: a });
    } else {
      avatarAta(durum, benimId(), a);
      yayinla(true);
    }
    arayuz.uyar(bicim(S.merhaba, { ad: a.ad }));
    arayuz.perdeYenile();
    ciz();
  },
  atolyeAc() {
    atolyeAcik = true;
    arayuz.perdeYenile();
    ciz();
  },
  atolyeKapat() {
    atolyeAcik = false;
    arayuz.perdeYenile();
    ciz();
  },
  tarifKaydet(t) {
    // Tarifin malzemeleri oyunda üretilebilir olmalı: eksik istasyonları aç.
    const acilacak = tarifinAcacagiIstasyonlar(t, durum.gun, durum.ekstraIstasyon);
    if (acilacak.length) istasyonAc(durum, acilacak);
    const tam = tarifEkle(t);
    atolyeAcik = false;
    if (oda.rol === "host") oda.yolla({ t: "kimlik", benId: -1, tarifler: [tam] });
    arayuz.uyar(bicim(S.menuyeEklendi, { ad: t.ad }));
    arayuz.perdeYenile();
    ciz();
  },
  tarifSil(id) {
    tarifiKaldir(id);
    arayuz.perdeYenile();
    ciz();
  },
  rehberDegis() {
    rehberAcik = !rehberAcik;
    depoYaz("tsuki.rehber", rehberAcik ? "1" : "0");
    ciz();
  },
  oyuncuSayisiDegistir(n) {
    if (oda.rol !== "kapali") return;
    const kaydedilen = { gun: durum.gun, kalp: durum.kalp, jeton: durum.jeton, dekor: durum.dekor };
    durum = yeniOyun(n, undefined, benimAvatar);
    Object.assign(durum, kaydedilen);
    arayuz.perdeYenile();
    ciz();
  },
  odaKur() {
    netUyari = "";
    durum = yeniOyun(1, undefined, benimAvatar);
    uyeOyuncu.clear();
    benId = 0;
    void oda.kur();
  },
  odaKatil(kod: string) {
    netUyari = "";
    void oda.katil(kod, benimAvatar.ad);
  },
  odaAyril() {
    oda.ayril();
    uyeOyuncu.clear();
    benId = 0;
    durum = tekBasinaDevam(durum);
    arayuz.perdeYenile();
    ciz();
  },
});

/** Bu istemcinin sürdüğü oyuncu — çevrimdışıyken hep 0 (fare). */
function benimId(): PlayerId {
  return oda.rol === "kapali" ? 0 : benId;
}

/** Klavye: çevrimdışı iki kişilikte 2. oyuncu, diğer hâllerde kendi oyuncun. */
function klavyeOyuncusu(): PlayerId {
  if (oda.rol !== "kapali") return benId;
  return (durum.oyuncular.length - 1) as PlayerId;
}

function calistir(a: Aksiyon) {
  if (a.tip === "etkilesim" || a.tip === "servis") sonAksiyonOyuncu = a.oyuncu;
  if (oda.rol === "misafir") {
    if (a.tip === "etkilesim" || a.tip === "servis") {
      oda.yolla({ t: "aksiyon", aksiyon: { ...a, oyuncu: benId } });
      if (a.tip === "etkilesim") arayuz.carp(a.hedef);
    } else {
      arayuz.uyar({ en: "Only the host can do that", tr: "Bunu ev sahibi yapabilir" });
    }
    return;
  }
  olaylariIsle(uygula(durum, a));
  yayinla(true);
  ciz();
}

function olaylariIsle(olaylar: OyunOlayi[]) {
  for (const o of olaylar) {
    switch (o.tip) {
      case "tik":
        arayuz.carp(o.hedef);
        sonTikHedef = o.hedef;
        sesTik(tikSayaci++ % 3);
        if (!o.hedef.startsWith("misafir:")) arayuz.garsonIstasyonda(sonAksiyonOyuncu, o.hedef);
        break;
      case "uretildi":
        sesUretim();
        if (o.oyuncu === benimId()) titresimHafif();
        tikSayaci = 0;
        if (sonTikHedef) arayuz.patlama(sonTikHedef);
        // Parmak hâlâ basılıysa üretilen malzeme doğrudan sürüklenmeye başlar.
        if (o.oyuncu === benimId()) arayuz.uretimSurukle(o.malzeme);
        break;
      case "ikram":
        sesUretim();
        arayuz.ucur(o.misafirId, "", "ui_kalp");
        if (!o.bot && o.oyuncu === benimId()) titresimHafif();
        break;
      case "tepsiye_kondu": {
        // Işınlanma yok: garson malzemeyi masaya yürüyerek götürür.
        const misafir = durum.misafirler.find((m) => m.id === o.misafirId);
        const index = misafir ? misafir.tepsi.length - 1 : 0;
        arayuz.garsonTeslimat(o.oyuncu, o.misafirId, index, o.malzeme);
        break;
      }
      case "mata_kondu":
        sesBirak();
        arayuz.garsonIstasyonda(o.oyuncu, "mat");
        if (o.oyuncu === benimId()) arayuz.malzemeUcusu(o.malzeme, "mat");
        break;
      case "tepsiden_alindi":
        sesTik(0);
        break;
      case "birakildi":
        sesBirak();
        break;
      case "servis":
        sesServis(o.guzel);
        titresimBasari();
        if (o.beraber) setTimeout(sesBeraber, 180);
        arayuz.ucur(o.misafirId, `+${o.kalp}`);
        if (o.beraber) setTimeout(() => arayuz.ucur(o.misafirId, y(S.birlikte), "ui_parilti"), 260);
        break;
      case "eksik":
        arayuz.uyar(S.siparisEksik);
        break;
      case "misafir_geldi":
        sesMisafir();
        break;
      case "gun_bitti":
        sesGunSonu();
        kayitYaz(durum); // gün bitti: ilerleme otomatik kaydedilir
        break;
      case "hata":
        if (o.oyuncu === benimId()) {
          sesHata();
          arayuz.uyar(o.mesaj);
        }
        break;
      case "dekor_alindi":
      case "misafir_gitti":
        break;
    }
  }
}

function ciz() {
  // Mevsim değişince müziğin rengi de değişsin (tempo, yoğunluk, parlaklık).
  const mevsim = mevsimGun(durum.gun).id;
  if (mevsim !== muzikMevsimi) {
    muzikMevsimi = mevsim;
    muzikMevsim(mevsim);
  }
  const liste = hedefListesi(durum);
  if (secim >= liste.length) secim = Math.max(0, liste.length - 1);
  const kOyuncu = durum.oyuncular[klavyeOyuncusu()];
  const cokOyunculu = durum.oyuncular.length > 1 || oda.rol !== "kapali";
  arayuz.ciz(durum, {
    seciliHedef: cokOyunculu || klavyeAktif ? (liste[secim] ?? null) : null,
    seciliRenk: kOyuncu?.renk ?? "#ffb9a3",
    sesAcik,
    muzikAcik: muzikAcikMi(),
    ipucu: rehberAcik ? sonrakiIpucu(durum, benimId()) : null,
    rehberAcik,
    atolyeAcik,
    avatarAcik,
    cikisAcik,
    net: {
      rol: oda.rol,
      kod: oda.kod,
      baglaniyor: oda.baglaniyor,
      uyeler: [...oda.uyeler.values()],
      uyari: netUyari,
      benId,
    },
  });
}

// ---------------------------------------------------------------- klavye
window.addEventListener("keydown", (e) => {
  const yaziyor = document.activeElement instanceof HTMLInputElement;
  if (yaziyor) return;

  if (durum.faz !== "gun") {
    if ((e.code === "Space" || e.code === "Enter") && !atolyeAcik && oda.rol !== "misafir") {
      e.preventDefault();
      calistir(durum.faz === "menu" ? { tip: "gun_basla" } : { tip: "sonraki_gun" });
    }
    return;
  }
  const liste = hedefListesi(durum);
  const oyuncu = klavyeOyuncusu();

  switch (e.code) {
    case "ArrowLeft":
    case "KeyA":
      e.preventDefault();
      klavyeAktif = true;
      secim = (secim - 1 + liste.length) % liste.length;
      ciz();
      break;
    case "ArrowRight":
    case "KeyD":
      e.preventDefault();
      klavyeAktif = true;
      secim = (secim + 1) % liste.length;
      ciz();
      break;
    case "Space":
    case "Enter": {
      e.preventDefault();
      klavyeAktif = true;
      const hedef = liste[secim];
      if (hedef) calistir({ tip: "etkilesim", oyuncu, hedef });
      break;
    }
    case "ShiftLeft":
    case "ShiftRight": {
      e.preventDefault();
      klavyeAktif = true;
      const hedef = liste[secim];
      if (hedef?.startsWith("misafir:")) {
        calistir({ tip: "servis", oyuncu, misafirId: hedef.slice(8) });
      }
      break;
    }
    case "KeyM":
      sesAcik = sesAcKapa();
      arayuz.uyar(sesAcik ? S.sesAcik : S.sesKapali);
      ciz();
      break;
    case "KeyR":
      rehberAcik = !rehberAcik;
      depoYaz("tsuki.rehber", rehberAcik ? "1" : "0");
      arayuz.uyar(rehberAcik ? S.rehberAcik : S.rehberKapali);
      ciz();
      break;
  }
});

// ---------------------------------------------------------------- döngü
let sonZaman = performance.now();
function dongu(t: number) {
  // Not: sekme arka plandayken rAF durur — oyun kendiliğinden duraklar,
  // misafirler beklemez. Geri dönüldüğünde dt zaten 0.1 sn ile sınırlanıyor.
  const dt = Math.min(0.1, (t - sonZaman) / 1000);
  sonZaman = t;
  // Misafir istemciler simülasyonu çalıştırmaz; durumu ev sahibinden alır.
  if (durum.faz === "gun" && oda.rol !== "misafir") {
    const olaylar = uygula(durum, { tip: "tik", dt });
    if (olaylar.length) olaylariIsle(olaylar);
    yayinla();
    ciz();
  } else if (oda.rol === "misafir") {
    ciz();
  }
  requestAnimationFrame(dongu);
}

ciz();
requestAnimationFrame(dongu);

/**
 * Ev sahibi sekmeyi arka plana alırsa rAF durur ve odadaki HERKES donar.
 * Tek kişilik oyunda duraklamak istenen davranış, o yüzden bu yedek tik
 * yalnızca ev sahibiyken ve sekme gizliyken çalışır. Tarayıcı arka planda
 * zamanlayıcıyı ~1 sn'ye kısar; dt sınırlı olduğu için oyun donmak yerine yavaşlar.
 */
setInterval(() => {
  if (!document.hidden || oda.rol !== "host" || durum.faz !== "gun") return;
  const simdi = performance.now();
  const dt = Math.min(0.25, (simdi - sonZaman) / 1000);
  sonZaman = simdi;
  const olaylar = uygula(durum, { tip: "tik", dt });
  if (olaylar.length) olaylariIsle(olaylar);
  yayinla(true);
}, 100);

// Yalnızca geliştirmede: konsoldan durumu okuyup elle tik atabilmek için.
// Üretim derlemesinde bu blok tamamen elenir.
if (import.meta.env.DEV) {
  (window as unknown as { __tsuki?: unknown }).__tsuki = {
    get durum() {
      return durum;
    },
    tik(dt = 1 / 60) {
      olaylariIsle(uygula(durum, { tip: "tik", dt }));
      ciz();
    },
    calistir,
  };
}

// ---------------------------------------------------------------- açılış kurtarma
/**
 * Native'de localStorage temizlenmiş olabilir; Preferences'taki yedeği geri
 * yükleyip ayarları tazeliyoruz. Web'de bu bir no-op.
 */
void depoGeriYukle().then(() => {
  if (!Capacitor.isNativePlatform()) return;
  dilBaslat();
  benimAvatar = avatarYukle();
  tarifleriYukle();
  avatarAta(durum, 0, benimAvatar);
  arayuz.yenidenKur();
  arayuz.perdeYenile();
  ciz();
});

// ---------------------------------------------------------------- müzik
// Tarayıcılar otomatik oynatmayı engeller: ilk dokunuşu bekliyoruz.
function muzigiUyandir() {
  if (muzikBasladi) return;
  muzikBasladi = true;
  muzikMevsim(mevsimGun(durum.gun).id);
  muzikBaslat();
}
window.addEventListener("pointerdown", muzigiUyandir, { once: true });
window.addEventListener("keydown", muzigiUyandir, { once: true });

// ---------------------------------------------------------------- OTA güncelleme
void guncellemeBaslat({
  hazir(manifest) {
    arayuz.guncellemeSor(manifest.not, {
      simdi: () => void guncellemeyiUygula(),
      sonra: () => void guncellemeyiErtele(),
    });
  },
});

// ---------------------------------------------------------------- native kabuk
void nativeBaslat({
  geriTusu() {
    // Açık bir panel varsa geri tuşu onu kapatsın, uygulamadan çıkmasın.
    if (cikisAcik) {
      cikisAcik = false;
      arayuz.perdeYenile();
      ciz();
      return true;
    }
    if (avatarAcik) {
      avatarAcik = false;
      arayuz.perdeYenile();
      ciz();
      return true;
    }
    if (atolyeAcik) {
      atolyeAcik = false;
      arayuz.perdeYenile();
      ciz();
      return true;
    }
    return false;
  },
  gorunurluk(aktif) {
    // Arka plandan dönüşte zaman sıçramasın: saati şimdiye çek.
    if (aktif) sonZaman = performance.now();
    muzikDuraklat(!aktif);
    if (!aktif) kayitYaz(durum); // arka plana alınırken kaydet
  },
});

document.addEventListener("contextmenu", (e) => e.preventDefault());
document.addEventListener("gesturestart", (e) => e.preventDefault());

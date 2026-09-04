import {
  ISTASYON_MAP,
  KARAKTERLER,
  KARAKTER_MAP,
  MAKI_TARIFLERI,
  makiIciMi,
  OYUNCU_ADLARI,
  DEKOR_MAP,
  OYUNCU_RENKLERI,
  YEMEKLER,
  sicaklikCarpani,
  yemek,
} from "./content";
import { varsayilanAvatar } from "./avatar";
import type { Avatar } from "./avatar";
import { S, m as m2 } from "./dil";
import { mulberry32 } from "./rng";
import type {
  Aksiyon,
  IstasyonId,
  MalzemeId,
  Misafir,
  OyunDurumu,
  OyunOlayi,
  Oyuncu,
  PlayerId,
  YemekId,
} from "./types";

export const KOLTUK_TABAN = 3;
const TEPSI_LIMIT = 8;
/** İkram, misafirin beklemesinin bu oranını siler. */
const IKRAM_ETKISI = 0.45;
/** Servis botu kaç saniyede bir ikram dağıtır. */
const BOT_ARALIGI = 11;
/** Botun ikramı elle verilenden biraz zayıf. */
const BOT_ETKISI = 0.3;

let sayac = 0;
const yeniId = () => `m${++sayac}`;

export function yeniOyun(
  oyuncuSayisi = 1,
  seed = Date.now() % 1_000_000,
  avatar?: Avatar,
): OyunDurumu {
  const oyuncular: Oyuncu[] = [];
  for (let i = 0; i < oyuncuSayisi; i++) {
    oyuncular.push({
      id: i as PlayerId,
      // Ad avatardan gelir: el kartında ve garsonun altında aynı isim görünsün.
      ad: (i === 0 && avatar ? avatar.ad : undefined) ?? OYUNCU_ADLARI[i] ?? `Oyuncu ${i + 1}`,
      renk: OYUNCU_RENKLERI[i] ?? "#888",
      avatar: i === 0 && avatar ? avatar : varsayilanAvatar(i),
      el: null,
      katki: 0,
    });
  }
  return {
    faz: "menu",
    gun: 1,
    kalp: 0,
    gunKalp: 0,
    jeton: 0,
    sure: 0,
    oyuncular,
    misafirler: [],
    koltukSayisi: KOLTUK_TABAN,
    ilerleme: {},
    matSlotlari: [],
    matSonuc: null,
    gelenMisafir: 0,
    gunMisafirHedefi: 5,
    spawnSayaci: 1.2,
    seed,
    dekor: [],
    ekstraIstasyon: [],
    botSayaci: BOT_ARALIGI,
    istatistik: { servis: 0, mukemmel: 0, beraber: 0, kacan: 0 },
  };
}

export function menuGun(gun: number): YemekId[] {
  return (Object.keys(YEMEKLER) as YemekId[]).filter((y) => yemek(y).gun <= gun);
}

function gunHedefi(gun: number) {
  return Math.min(5 + gun, 12);
}

function koltukSayisi(gun: number) {
  return gun >= 4 ? 4 : KOLTUK_TABAN;
}

// ---------------------------------------------------------------- yardımcılar

function cokluKumeFark(a: MalzemeId[], b: MalzemeId[]): MalzemeId[] {
  const kalan = [...b];
  const eksik: MalzemeId[] = [];
  for (const x of a) {
    const i = kalan.indexOf(x);
    if (i === -1) eksik.push(x);
    else kalan.splice(i, 1);
  }
  return eksik;
}

export function siparisMalzemeleri(siparis: YemekId[]): MalzemeId[] {
  return siparis.flatMap((y) => yemek(y).gerek);
}

export function ruhHaliCarpani(m: Misafir): number {
  const r = m.bekledi / m.sabir;
  if (r < 0.5) return 1.5;
  if (r < 1) return 1.2;
  if (r < 1.6) return 1.0;
  return 0.7;
}

export function ruhHaliSanat(m: Misafir): string {
  const r = m.bekledi / m.sabir;
  if (m.durum === "mutlu") return "ruh_mutlu";
  if (m.durum === "gidiyor") return "ruh_giden";
  if (r < 1) return "ruh_iyi";
  if (r < 1.6) return "ruh_notr";
  return "ruh_uykulu";
}

// ---------------------------------------------------------------- misafir üretimi

function misafirUret(s: OyunDurumu, koltuk: number): Misafir {
  const rnd = mulberry32(s.seed + s.gelenMisafir * 7919 + s.gun * 104729);
  const doluKarakterler = new Set(s.misafirler.map((m) => m.karakterId));
  const havuz = KARAKTERLER.filter((k) => !doluKarakterler.has(k.id));
  const liste = havuz.length ? havuz : KARAKTERLER;
  const karakter = liste[Math.floor(rnd() * liste.length)] ?? KARAKTERLER[0]!;

  const menu = menuGun(s.gun);
  const siparis: YemekId[] = [];

  // Karakterin favorisi menüdeyse sık sık onu ister — hikâye bağı için.
  const favoriSansi = menu.length <= 2 ? 0.2 : 0.45;
  if (menu.includes(karakter.favori) && rnd() < favoriSansi) siparis.push(karakter.favori);

  // Aynı anda oturan misafirler mümkün olduğunca farklı şey istesin.
  const masadaOlanlar = new Set(s.misafirler.flatMap((x) => x.siparis));
  const taze = menu.filter((y) => !masadaOlanlar.has(y));
  const havuz2 = taze.length ? taze : menu;

  const adet = s.gun === 1 ? 1 : rnd() < (s.gun >= 4 ? 0.55 : 0.4) ? 2 : 1;
  while (siparis.length < adet) {
    const kaynak = siparis.length === 0 ? havuz2 : menu;
    const y = kaynak[Math.floor(rnd() * kaynak.length)];
    if (y) siparis.push(y);
  }
  // İkinci gün ve sonrası: ara sıra yanına çay.
  if (s.gun >= 2 && siparis.length < 3 && rnd() < 0.25 && !siparis.includes("cay")) {
    siparis.push("cay");
  }

  const selam = karakter.selam[Math.floor(rnd() * karakter.selam.length)] ?? null;

  return {
    id: yeniId(),
    karakterId: karakter.id,
    koltuk,
    siparis,
    tepsi: [],
    bekledi: 0,
    sabir: karakter.sabir * sicaklikCarpani(s.dekor),
    durum: "bekliyor",
    replik: selam,
    replikSure: 3,
  };
}

// ---------------------------------------------------------------- aksiyonlar

export function uygula(s: OyunDurumu, a: Aksiyon): OyunOlayi[] {
  switch (a.tip) {
    case "gun_basla":
      s.faz = "gun";
      s.sure = 0;
      s.gunKalp = 0;
      s.misafirler = [];
      s.gelenMisafir = 0;
      s.spawnSayaci = 1.2;
      s.botSayaci = BOT_ARALIGI;
      s.matSlotlari = [];
      s.matSonuc = null;
      s.ilerleme = {};
      s.koltukSayisi = koltukSayisi(s.gun);
      s.gunMisafirHedefi = gunHedefi(s.gun);
      s.istatistik = { servis: 0, mukemmel: 0, beraber: 0, kacan: 0 };
      for (const o of s.oyuncular) {
        o.el = null;
        o.katki = 0;
      }
      return [];

    case "dekor_al": {
      const d = DEKOR_MAP[a.id];
      if (!d || s.dekor.includes(a.id) || s.jeton < d.fiyat) return [];
      s.jeton -= d.fiyat;
      s.dekor.push(a.id);
      return [{ tip: "dekor_alindi", id: a.id }];
    }

    case "sonraki_gun":
      s.gun += 1;
      s.faz = "menu";
      return [];

    case "tik":
      return tik(s, a.dt);

    case "etkilesim":
      return etkilesim(s, a.oyuncu, a.hedef);

    case "servis":
      return servis(s, a.oyuncu, a.misafirId);
  }
}

function tik(s: OyunDurumu, dt: number): OyunOlayi[] {
  if (s.faz !== "gun") return [];
  const olaylar: OyunOlayi[] = [];
  s.sure += dt;

  for (const m of s.misafirler) {
    if (m.replik) {
      m.replikSure -= dt;
      if (m.replikSure <= 0) m.replik = null;
    }
    if (m.durum === "bekliyor") {
      m.bekledi += dt;
      // Yumuşak baskı: ceza yok, sadece çok uzarsa misafir tatlılıkla kalkar.
      if (m.bekledi > m.sabir * 2.4) {
        const k = KARAKTER_MAP[m.karakterId];
        m.durum = "gidiyor";
        m.replik = k?.gidis ?? m2("Some other time.", "Başka zaman.");
        m.replikSure = 2.5;
        s.istatistik.kacan += 1;
        olaylar.push({ tip: "misafir_gitti", misafirId: m.id });
      }
    } else {
      m.replikSure -= 0;
      if (m.replik === null) {
        m.bekledi += dt * 0; // dursun
      }
    }
  }

  // Repliği bitmiş mutlu/giden misafirler koltuğu boşaltır.
  s.misafirler = s.misafirler.filter((m) => m.durum === "bekliyor" || m.replik !== null);

  // Servis botu: en sabırsız misafire düzenli aralıklarla ikram götürür.
  if (s.dekor.some((d) => DEKOR_MAP[d]?.etki === "bot")) {
    s.botSayaci -= dt;
    if (s.botSayaci <= 0) {
      s.botSayaci = BOT_ARALIGI;
      const hedef = s.misafirler
        .filter((m) => m.durum === "bekliyor" && m.bekledi > m.sabir * 0.35)
        .sort((a, b) => b.bekledi / b.sabir - a.bekledi / a.sabir)[0];
      if (hedef) {
        hedef.bekledi = Math.max(0, hedef.bekledi - hedef.sabir * BOT_ETKISI);
        olaylar.push({ tip: "ikram", misafirId: hedef.id, oyuncu: 0, bot: true });
      }
    }
  }

  // Yeni misafir
  s.spawnSayaci -= dt;
  const doluKoltuklar = new Set(s.misafirler.map((m) => m.koltuk));
  if (s.spawnSayaci <= 0 && s.gelenMisafir < s.gunMisafirHedefi) {
    let bos = -1;
    for (let i = 0; i < s.koltukSayisi; i++) {
      if (!doluKoltuklar.has(i)) {
        bos = i;
        break;
      }
    }
    if (bos >= 0) {
      const m = misafirUret(s, bos);
      s.misafirler.push(m);
      s.gelenMisafir += 1;
      const rnd = mulberry32(s.seed + s.gelenMisafir * 31);
      s.spawnSayaci = 4 + rnd() * 5 - Math.min(2, s.gun * 0.3);
      olaylar.push({ tip: "misafir_geldi", misafirId: m.id });
    }
  }

  if (s.gelenMisafir >= s.gunMisafirHedefi && s.misafirler.length === 0) {
    s.faz = "gun_sonu";
    s.jeton += s.gunKalp;
    olaylar.push({ tip: "gun_bitti" });
  }

  return olaylar;
}

function etkilesim(s: OyunDurumu, oyuncuId: PlayerId, hedef: string): OyunOlayi[] {
  if (s.faz !== "gun") return [];
  const oyuncu = s.oyuncular.find((o) => o.id === oyuncuId);
  if (!oyuncu) return [];

  if (hedef.startsWith("misafir:")) {
    return tepsiEtkilesim(s, oyuncu, hedef.slice("misafir:".length));
  }

  const ist = ISTASYON_MAP[hedef as keyof typeof ISTASYON_MAP];
  if (!ist) return [];

  if (ist.id === "atik") {
    if (!oyuncu.el) return [{ tip: "hata", mesaj: S.hataElBos, oyuncu: oyuncuId }];
    oyuncu.el = null;
    return [{ tip: "birakildi", oyuncu: oyuncuId }];
  }

  if (ist.id === "mat") return matEtkilesim(s, oyuncu);

  // Üretim istasyonları
  if (oyuncu.el) {
    return [{ tip: "hata", mesaj: S.hataElDolu, oyuncu: oyuncuId }];
  }
  const su = (s.ilerleme[ist.id] ?? 0) + 1;
  oyuncu.katki += 1;
  if (su >= ist.tap && ist.uretir) {
    s.ilerleme[ist.id] = 0;
    oyuncu.el = ist.uretir;
    return [
      { tip: "tik", hedef: ist.id },
      { tip: "uretildi", malzeme: ist.uretir, oyuncu: oyuncuId },
    ];
  }
  s.ilerleme[ist.id] = su;
  return [{ tip: "tik", hedef: ist.id }];
}

function matEtkilesim(s: OyunDurumu, oyuncu: Oyuncu): OyunOlayi[] {
  const ist = ISTASYON_MAP.mat;

  if (oyuncu.el) {
    if (s.matSonuc) return [{ tip: "hata", mesaj: S.hataMatDolu, oyuncu: oyuncu.id }];
    const m = oyuncu.el;
    const gecerli = m === "nori" || m === "pirinc" || makiIciMi(m);
    if (!gecerli) return [{ tip: "hata", mesaj: S.hataMataGitmez, oyuncu: oyuncu.id }];
    const ayniTip = s.matSlotlari.some((x) => (makiIciMi(m) ? makiIciMi(x) : x === m));
    if (ayniTip) return [{ tip: "hata", mesaj: S.hataMattaVar, oyuncu: oyuncu.id }];
    s.matSlotlari.push(m);
    oyuncu.el = null;
    oyuncu.katki += 1;
    return [{ tip: "mata_kondu", malzeme: m, oyuncu: oyuncu.id }];
  }

  if (s.matSonuc) {
    oyuncu.el = s.matSonuc;
    s.matSonuc = null;
    return [{ tip: "uretildi", malzeme: oyuncu.el, oyuncu: oyuncu.id }];
  }

  const ic = s.matSlotlari.find((x) => makiIciMi(x));
  const tam = s.matSlotlari.includes("nori") && s.matSlotlari.includes("pirinc") && ic;
  if (tam) {
    const su = (s.ilerleme.mat ?? 0) + 1;
    oyuncu.katki += 1;
    if (su >= ist.tap) {
      const tarif = MAKI_TARIFLERI.find((t) => t.ic === ic);
      s.ilerleme.mat = 0;
      s.matSlotlari = [];
      if (!tarif) {
        return [{ tip: "hata", mesaj: S.hataMakiOlmuyor, oyuncu: oyuncu.id }];
      }
      oyuncu.el = tarif.sonuc;
      return [
        { tip: "tik", hedef: "mat" },
        { tip: "uretildi", malzeme: tarif.sonuc, oyuncu: oyuncu.id },
      ];
    }
    s.ilerleme.mat = su;
    return [{ tip: "tik", hedef: "mat" }];
  }

  const son = s.matSlotlari.pop();
  if (son) {
    oyuncu.el = son;
    return [{ tip: "tik", hedef: "mat" }];
  }
  return [{ tip: "hata", mesaj: S.hataMatBos, oyuncu: oyuncu.id }];
}

function tepsiEtkilesim(s: OyunDurumu, oyuncu: Oyuncu, misafirId: string): OyunOlayi[] {
  const m = s.misafirler.find((x) => x.id === misafirId);
  if (!m || m.durum !== "bekliyor") return [];

  if (oyuncu.el) {
    // İkram siparişin parçası değil: tepsiye girmez, misafirin keyfini tazeler.
    if (oyuncu.el === "ikram") {
      oyuncu.el = null;
      oyuncu.katki += 1;
      m.bekledi = Math.max(0, m.bekledi - m.sabir * IKRAM_ETKISI);
      return [{ tip: "ikram", misafirId, oyuncu: oyuncu.id, bot: false }];
    }
    if (m.tepsi.length >= TEPSI_LIMIT) {
      return [{ tip: "hata", mesaj: S.hataTepsiDolu, oyuncu: oyuncu.id }];
    }
    const malzeme = oyuncu.el;
    m.tepsi.push({ malzeme, koyan: oyuncu.id });
    oyuncu.el = null;
    oyuncu.katki += 1;
    return [{ tip: "tepsiye_kondu", misafirId, malzeme, oyuncu: oyuncu.id }];
  }

  const son = m.tepsi.pop();
  if (son) {
    oyuncu.el = son.malzeme;
    return [{ tip: "tepsiden_alindi", misafirId, malzeme: son.malzeme, oyuncu: oyuncu.id }];
  }
  return [{ tip: "hata", mesaj: S.hataTepsiBos, oyuncu: oyuncu.id }];
}

function servis(s: OyunDurumu, oyuncuId: PlayerId, misafirId: string): OyunOlayi[] {
  const m = s.misafirler.find((x) => x.id === misafirId);
  if (!m || m.durum !== "bekliyor") return [];

  const gerek = siparisMalzemeleri(m.siparis);
  const tepsi = m.tepsi.map((t) => t.malzeme);
  const eksik = cokluKumeFark(gerek, tepsi);

  if (eksik.length > 0) {
    // Ceza yok: misafir bekler, tepsi durur.
    m.replik = S.misafirBekler;
    m.replikSure = 2;
    return [{ tip: "eksik", misafirId }];
  }

  const fazla = cokluKumeFark(tepsi, gerek);
  const karakter = KARAKTER_MAP[m.karakterId];
  const ruh = ruhHaliCarpani(m);
  const koyanlar = new Set(m.tepsi.map((t) => t.koyan));
  const beraber = koyanlar.size >= 2;

  let kalp = m.siparis.reduce((t, y) => t + yemek(y).kalp, 0);
  kalp *= ruh;
  if (beraber) kalp *= 1.5;
  if (fazla.length) kalp *= 0.8;

  const favoriVar = karakter ? m.siparis.includes(karakter.favori) : false;
  if (favoriVar) kalp += 2;

  const toplam = Math.max(1, Math.round(kalp));
  s.kalp += toplam;
  s.gunKalp += toplam;
  s.istatistik.servis += 1;
  if (beraber) s.istatistik.beraber += 1;
  const mukemmel = fazla.length === 0 && ruh >= 1.2;
  if (mukemmel) s.istatistik.mukemmel += 1;

  m.durum = "mutlu";
  m.tepsi = [];
  if (karakter) {
    const hikayeSatiri = karakter.hikaye[Math.min(karakter.hikaye.length - 1, s.gun - 1)];
    m.replik = favoriVar
      ? karakter.favoriReplik
      : (karakter.mutlu[toplam % karakter.mutlu.length] ?? m2("Thank you.", "Teşekkürler."));
    if (s.gun >= 2 && hikayeSatiri && (s.istatistik.servis + s.gun) % 2 === 0) {
      m.replik = hikayeSatiri;
    }
  }
  m.replikSure = 3;

  const oyuncu = s.oyuncular.find((o) => o.id === oyuncuId);
  if (oyuncu) oyuncu.katki += 1;

  return [{ tip: "servis", guzel: mukemmel, kalp: toplam, beraber, misafirId }];
}

/** Tepsideki malzemelerle siparişteki hangi yemekler tamamlanmış? (sırayla, açgözlü eşleme) */
export function siparisDurumu(siparis: YemekId[], tepsi: MalzemeId[]): boolean[] {
  const havuz = [...tepsi];
  return siparis.map((y) => {
    const gerek = [...yemek(y).gerek];
    const bulunan: number[] = [];
    for (const g of gerek) {
      const i = havuz.findIndex((x, idx) => x === g && !bulunan.includes(idx));
      if (i === -1) return false;
      bulunan.push(i);
    }
    for (const i of bulunan.sort((a, b) => b - a)) havuz.splice(i, 1);
    return true;
  });
}

/** Tepsi siparişi karşılıyor mu? (servis butonunu yakmak için) */
export function servisHazir(siparis: YemekId[], tepsi: MalzemeId[]): boolean {
  return cokluKumeFark(siparisMalzemeleri(siparis), tepsi).length === 0;
}


/** Bir tarifin gerektirdiği istasyonları (kapalıysa) açar. */
export function istasyonAc(s: OyunDurumu, istasyonlar: IstasyonId[]) {
  for (const id of istasyonlar) {
    if (!s.ekstraIstasyon.includes(id)) s.ekstraIstasyon.push(id);
  }
}

/** Online oyunda odaya katılan için yeni oyuncu açar. Dolu ise null. */
export function oyuncuEkle(s: OyunDurumu, ad?: string, avatar?: Avatar): PlayerId | null {
  if (s.oyuncular.length >= 4) return null;
  const id = s.oyuncular.length as PlayerId;
  s.oyuncular.push({
    id,
    ad: avatar?.ad || ad?.slice(0, 12) || OYUNCU_ADLARI[id] || `Oyuncu ${id + 1}`,
    renk: OYUNCU_RENKLERI[id] ?? "#888",
    avatar: avatar ?? varsayilanAvatar(id),
    el: null,
    katki: 0,
  });
  return id;
}

/** Oyuncunun avatarını günceller (ad da avatardan gelir). */
export function avatarAta(s: OyunDurumu, id: PlayerId, avatar: Avatar) {
  const o = s.oyuncular.find((x) => x.id === id);
  if (!o) return;
  o.avatar = avatar;
  o.ad = avatar.ad;
}

/** Ayrılan oyuncuyu çıkarır; elindeki malzeme kaybolur, kalan indeksler korunur. */
export function oyuncuCikar(s: OyunDurumu, id: PlayerId) {
  s.oyuncular = s.oyuncular.filter((o) => o.id !== id);
  for (const m of s.misafirler) m.tepsi = m.tepsi.filter((t) => t.koyan !== id);
}

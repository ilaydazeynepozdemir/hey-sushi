/**
 * "Şimdi ne yapmalıyım?" rehberi.
 * Senaryolu bir tutorial değil: oyunun anlık durumundan bir sonraki en mantıklı
 * adımı türetir. Bu yüzden hem ilk gün öğretici, hem sonraki günlerde yardımcı olur.
 */
import { ISTASYON_MAP, KARAKTER_MAP, MAKI_TARIFLERI, MALZEMELER, makiIciMi, yemek } from "./content";
import { S, bicim, y } from "./dil";
import { servisHazir, siparisMalzemeleri } from "./game";
import type { HedefId, IstasyonId, MalzemeId, Misafir, OyunDurumu, PlayerId } from "./types";

export interface Ipucu {
  metin: string;
  hedef: HedefId | null;
  /** Servis butonunu vurgula. */
  servis?: boolean;
}

const MALZEME_ISTASYON: Partial<Record<MalzemeId, IstasyonId>> = {
  pirinc: "pirinc",
  nori: "nori",
  cay: "cay",
  dilim_somon: "kesim_somon",
  dilim_ton: "kesim_ton",
  dilim_avokado: "kesim_avokado",
  dilim_tamago: "kesim_tamago",
  dilim_karides: "kesim_karides",
  dilim_yilanbaligi: "kesim_yilanbaligi",
  dilim_salatalik: "kesim_salatalik",
  dilim_mango: "kesim_mango",
  krem_peynir: "krem_peynir",
  tempura: "tempura",
  ikura: "ikura",
  tofu: "tofu",
  miso: "miso",
  mochi: "mochi",
};

/** maki sonucu → gereken iç malzeme (content'teki tariflerden türetilir). */
const MAKI_ICI: Partial<Record<MalzemeId, MalzemeId>> = Object.fromEntries(
  MAKI_TARIFLERI.map((t) => [t.sonuc, t.ic]),
) as Partial<Record<MalzemeId, MalzemeId>>;

function eksikler(m: Misafir): MalzemeId[] {
  const kalan = m.tepsi.map((t) => t.malzeme);
  const eksik: MalzemeId[] = [];
  for (const g of siparisMalzemeleri(m.siparis)) {
    const i = kalan.indexOf(g);
    if (i === -1) eksik.push(g);
    else kalan.splice(i, 1);
  }
  return eksik;
}

function ad(m: Misafir): string {
  const k = KARAKTER_MAP[m.karakterId];
  return k ? y(k.ad) : y(S.ipucuKontrol);
}

export function sonrakiIpucu(s: OyunDurumu, oyuncuId: PlayerId): Ipucu | null {
  if (s.faz !== "gun") return null;
  const oyuncu = s.oyuncular.find((o) => o.id === oyuncuId);
  if (!oyuncu) return null;

  const bekleyen = s.misafirler
    .filter((m) => m.durum === "bekliyor")
    .sort((a, b) => b.bekledi / b.sabir - a.bekledi / a.sabir);

  if (bekleyen.length === 0) {
    return { metin: y(S.ipucuSakin), hedef: null };
  }

  // 1) Elinde bir şey varsa: nereye ait?
  if (oyuncu.el) {
    const el = oyuncu.el;
    const isim = y(MALZEMELER[el].ad);

    const isteyen = bekleyen.find((m) => eksikler(m).includes(el));
    if (isteyen) {
      return {
        metin: bicim(S.ipucuBirak, { malzeme: isim, ad: ad(isteyen) }),
        hedef: `misafir:${isteyen.id}`,
      };
    }

    // Maki için mata mı gitmeli?
    const makiIsteyen = bekleyen.find((m) =>
      eksikler(m).some((e) => {
        const ic = MAKI_ICI[e];
        return ic !== undefined && (el === "nori" || el === "pirinc" || el === ic);
      }),
    );
    if (makiIsteyen && !s.matSonuc) {
      const zatenVar = s.matSlotlari.some((x) => (makiIciMi(el) ? makiIciMi(x) : x === el));
      if (!zatenVar) {
        return { metin: bicim(S.ipucuMat, { malzeme: isim }), hedef: "mat" };
      }
    }

    return { metin: bicim(S.ipucuGereksiz, { malzeme: isim }), hedef: "atik" };
  }

  // 1.5) Keyfi çok düşen biri varsa ikram öncelikli — sipariş beklemeye devam eder.
  const sikilan = bekleyen.find((mm) => mm.bekledi > mm.sabir * 1.15);
  if (sikilan && ISTASYON_MAP.ikram) {
    if (oyuncu.el === "ikram") {
      return {
        metin: bicim(S.ipucuBirak, { malzeme: y(MALZEMELER.ikram.ad), ad: ad(sikilan) }),
        hedef: `misafir:${sikilan.id}`,
      };
    }
    if (!oyuncu.el) {
      return { metin: bicim(S.ipucuIkram, { ad: ad(sikilan) }), hedef: "ikram" };
    }
  }

  // 2) Elin boş: servise hazır bir tepsi var mı?
  const hazir = bekleyen.find((m) =>
    servisHazir(
      m.siparis,
      m.tepsi.map((t) => t.malzeme),
    ),
  );
  if (hazir) {
    return {
      metin: bicim(S.ipucuServis, { ad: ad(hazir) }),
      hedef: `misafir:${hazir.id}`,
      servis: true,
    };
  }

  // 3) Mattaki iş yarım mı?
  if (s.matSonuc) {
    return { metin: y(S.ipucuMakiAl), hedef: "mat" };
  }

  // 4) Eksik ilk malzemeyi üret
  for (const m of bekleyen) {
    const eksik = eksikler(m);
    const ilk = eksik[0];
    if (!ilk) continue;

    const ic = MAKI_ICI[ilk];
    if (ic) {
      const varNori = s.matSlotlari.includes("nori");
      const varPirinc = s.matSlotlari.includes("pirinc");
      const varIc = s.matSlotlari.some((x) => makiIciMi(x));
      if (varNori && varPirinc && varIc) {
        return {
          metin: bicim(S.ipucuMatSar, { n: ISTASYON_MAP.mat.tap }),
          hedef: "mat",
        };
      }
      const sirada: MalzemeId = !varNori ? "nori" : !varPirinc ? "pirinc" : ic;
      const ist = MALZEME_ISTASYON[sirada];
      const yemekAd = y(yemek(m.siparis.find((yy) => yemek(yy).gerek.includes(ilk)) ?? m.siparis[0]!).ad);
      return {
        metin: bicim(S.ipucuUret, {
          yemek: yemekAd,
          malzeme: y(MALZEMELER[sirada].ad),
          istasyon: ist ? y(ISTASYON_MAP[ist].ad) : "",
        }),
        hedef: ist ?? null,
      };
    }

    const ist = MALZEME_ISTASYON[ilk];
    if (ist) {
      const ib = ISTASYON_MAP[ist];
      const kalan = ib.tap - (s.ilerleme[ist] ?? 0);
      return {
        metin: bicim(S.ipucuUretKisi, {
          ad: ad(m),
          malzeme: y(MALZEMELER[ilk].ad),
          istasyon: y(ib.ad),
          n: kalan,
        }),
        hedef: ist,
      };
    }
  }

  return { metin: y(S.ipucuKontrol), hedef: null };
}

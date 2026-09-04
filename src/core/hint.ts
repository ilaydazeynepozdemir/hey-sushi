/**
 * "Şimdi ne yapmalıyım?" rehberi.
 * Senaryolu bir tutorial değil: oyunun anlık durumundan bir sonraki en mantıklı
 * adımı türetir. Bu yüzden hem ilk gün öğretici, hem sonraki günlerde yardımcı olur.
 */
import { STATION_MAP, CHARACTER_MAP, MAKI_RECIPES, INGREDIENTS, isMakiFilling, dish } from "./content";
import { S, format, y } from "./i18n";
import { readyToServe, orderIngredients } from "./game";
import type { TargetId, StationId, IngredientId, Guest, GameState, PlayerId } from "./types";

export interface Hint {
  text: string;
  target: TargetId | null;
  /** Servis butonunu vurgula. */
  served?: boolean;
}

const INGREDIENT_STATION: Partial<Record<IngredientId, StationId>> = {
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
const MAKI_FILLING_OF: Partial<Record<IngredientId, IngredientId>> = Object.fromEntries(
  MAKI_RECIPES.map((t) => [t.sonuc, t.filling]),
) as Partial<Record<IngredientId, IngredientId>>;

function eksikler(m: Guest): IngredientId[] {
  const kalan = m.tray.map((t) => t.ingredient);
  const eksik: IngredientId[] = [];
  for (const g of orderIngredients(m.order)) {
    const i = kalan.indexOf(g);
    if (i === -1) eksik.push(g);
    else kalan.splice(i, 1);
  }
  return eksik;
}

function ad(m: Guest): string {
  const k = CHARACTER_MAP[m.characterId];
  return k ? y(k.ad) : y(S.ipucuKontrol);
}

export function nextHint(s: GameState, playerId: PlayerId): Hint | null {
  if (s.phase !== "gun") return null;
  const oyuncu = s.players.find((o) => o.id === playerId);
  if (!oyuncu) return null;

  const bekleyen = s.guests
    .filter((m) => m.state === "bekliyor")
    .sort((a, b) => b.waited / b.patience - a.waited / a.patience);

  if (bekleyen.length === 0) {
    return { text: y(S.ipucuSakin), target: null };
  }

  // 1) Elinde bir şey varsa: nereye ait?
  if (oyuncu.hand) {
    const hand = oyuncu.hand;
    const isim = y(INGREDIENTS[hand].ad);

    const isteyen = bekleyen.find((m) => eksikler(m).includes(hand));
    if (isteyen) {
      return {
        text: format(S.ipucuBirak, { ingredient: isim, ad: ad(isteyen) }),
        target: `misafir:${isteyen.id}`,
      };
    }

    // Maki için mata mı gitmeli?
    const makiIsteyen = bekleyen.find((m) =>
      eksikler(m).some((e) => {
        const filling = MAKI_FILLING_OF[e];
        return filling !== undefined && (hand === "nori" || hand === "pirinc" || hand === filling);
      }),
    );
    if (makiIsteyen && !s.matResult) {
      const zatenVar = s.matSlots.some((x) => (isMakiFilling(hand) ? isMakiFilling(x) : x === hand));
      if (!zatenVar) {
        return { text: format(S.ipucuMat, { ingredient: isim }), target: "mat" };
      }
    }

    return { text: format(S.ipucuGereksiz, { ingredient: isim }), target: "atik" };
  }

  // 1.5) Keyfi çok düşen biri varsa ikram öncelikli — sipariş beklemeye devam eder.
  const sikilan = bekleyen.find((mm) => mm.waited > mm.patience * 1.15);
  if (sikilan && STATION_MAP.ikram) {
    if (oyuncu.hand === "ikram") {
      return {
        text: format(S.ipucuBirak, { ingredient: y(INGREDIENTS.ikram.ad), ad: ad(sikilan) }),
        target: `misafir:${sikilan.id}`,
      };
    }
    if (!oyuncu.hand) {
      return { text: format(S.ipucuIkram, { ad: ad(sikilan) }), target: "ikram" };
    }
  }

  // 2) Elin boş: servise hazır bir tepsi var mı?
  const hazir = bekleyen.find((m) =>
    readyToServe(
      m.order,
      m.tray.map((t) => t.ingredient),
    ),
  );
  if (hazir) {
    return {
      text: format(S.ipucuServis, { ad: ad(hazir) }),
      target: `misafir:${hazir.id}`,
      served: true,
    };
  }

  // 3) Mattaki iş yarım mı?
  if (s.matResult) {
    return { text: y(S.ipucuMakiAl), target: "mat" };
  }

  // 4) Eksik ilk malzemeyi üret
  for (const m of bekleyen) {
    const eksik = eksikler(m);
    const ilk = eksik[0];
    if (!ilk) continue;

    const filling = MAKI_FILLING_OF[ilk];
    if (filling) {
      const varNori = s.matSlots.includes("nori");
      const varPirinc = s.matSlots.includes("pirinc");
      const varIc = s.matSlots.some((x) => isMakiFilling(x));
      if (varNori && varPirinc && varIc) {
        return {
          text: format(S.ipucuMatSar, { n: STATION_MAP.mat.taps }),
          target: "mat",
        };
      }
      const sirada: IngredientId = !varNori ? "nori" : !varPirinc ? "pirinc" : filling;
      const ist = INGREDIENT_STATION[sirada];
      const dishName = y(dish(m.order.find((yy) => dish(yy).needs.includes(ilk)) ?? m.order[0]!).ad);
      return {
        text: format(S.ipucuUret, {
          dish: dishName,
          ingredient: y(INGREDIENTS[sirada].ad),
          istasyon: ist ? y(STATION_MAP[ist].ad) : "",
        }),
        target: ist ?? null,
      };
    }

    const ist = INGREDIENT_STATION[ilk];
    if (ist) {
      const ib = STATION_MAP[ist];
      const kalan = ib.taps - (s.progress[ist] ?? 0);
      return {
        text: format(S.ipucuUretKisi, {
          ad: ad(m),
          ingredient: y(INGREDIENTS[ilk].ad),
          istasyon: y(ib.ad),
          n: kalan,
        }),
        target: ist,
      };
    }
  }

  return { text: y(S.ipucuKontrol), target: null };
}

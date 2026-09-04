/**
 * "Şimdi ne yapmalıyım?" rehberi.
 * Senaryolu bir tutorial değil: oyunun anlık durumundan bir sonraki en mantıklı
 * adımı türetir. Bu yüzden hem ilk gün öğretici, hem sonraki günlerde yardımcı olur.
 */
import { STATION_MAP, CHARACTER_MAP, MAKI_RECIPES, ingredient, isMakiFilling, dish } from "./content";
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
  rice: "rice",
  nori: "nori",
  tea: "tea",
  salmon_slice: "cut_salmon",
  tuna_slice: "cut_tuna",
  avocado: "cut_avocado",
  tamago: "cut_tamago",
  shrimp: "cut_shrimp",
  unagi: "cut_unagi",
  cucumber: "cut_cucumber",
  mango: "cut_mango",
  cream_cheese: "cream_cheese",
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
  const remaining = m.tray.map((t) => t.ingredient);
  const eksik: IngredientId[] = [];
  for (const g of orderIngredients(m.order)) {
    const i = remaining.indexOf(g);
    if (i === -1) eksik.push(g);
    else remaining.splice(i, 1);
  }
  return eksik;
}

function guestName(m: Guest): string {
  const k = CHARACTER_MAP[m.characterId];
  return k ? y(k.name) : y(S.hintCheck);
}

export function nextHint(s: GameState, playerId: PlayerId): Hint | null {
  if (s.phase !== "day") return null;
  const player = s.players.find((o) => o.id === playerId);
  if (!player) return null;

  const waiting = s.guests
    .filter((m) => m.state === "pending")
    .sort((a, b) => b.waited / b.patience - a.waited / a.patience);

  if (waiting.length === 0) {
    return { text: y(S.hintQuiet), target: null };
  }

  // 1) Elinde bir şey varsa: nereye ait?
  if (player.hand) {
    const hand = player.hand;
    const label = y(ingredient(hand).name);

    const isteyen = waiting.find((m) => eksikler(m).includes(hand));
    if (isteyen) {
      return {
        text: format(S.hintDrop, { ingredient: label, name: guestName(isteyen) }),
        target: `guest:${isteyen.id}`,
      };
    }

    // Maki için mata mı gitmeli?
    const makiIsteyen = waiting.find((m) =>
      eksikler(m).some((e) => {
        const filling = MAKI_FILLING_OF[e];
        return filling !== undefined && (hand === "nori" || hand === "rice" || hand === filling);
      }),
    );
    if (makiIsteyen && !s.matResult) {
      const zatenVar = s.matSlots.some((x) => (isMakiFilling(hand) ? isMakiFilling(x) : x === hand));
      if (!zatenVar) {
        return { text: format(S.hintMat, { ingredient: label }), target: "mat" };
      }
    }

    return { text: format(S.hintNotNeeded, { ingredient: label }), target: "compost" };
  }

  // 1.5) Keyfi çok düşen biri varsa ikram öncelikli — sipariş beklemeye devam eder.
  const sikilan = waiting.find((mm) => mm.waited > mm.patience * 1.15);
  if (sikilan && STATION_MAP.treat) {
    if (player.hand === "treat") {
      return {
        text: format(S.hintDrop, { ingredient: y(ingredient("treat").name), name: guestName(sikilan) }),
        target: `guest:${sikilan.id}`,
      };
    }
    if (!player.hand) {
      return { text: format(S.hintTreat, { name: guestName(sikilan) }), target: "treat" };
    }
  }

  // 2) Elin boş: servise hazır bir tepsi var mı?
  const hazir = waiting.find((m) =>
    readyToServe(
      m.order,
      m.tray.map((t) => t.ingredient),
    ),
  );
  if (hazir) {
    return {
      text: format(S.hintServe, { name: guestName(hazir) }),
      target: `guest:${hazir.id}`,
      served: true,
    };
  }

  // 3) Mattaki iş yarım mı?
  if (s.matResult) {
    return { text: y(S.hintTakeMaki), target: "mat" };
  }

  // 4) Eksik ilk malzemeyi üret
  for (const m of waiting) {
    const eksik = eksikler(m);
    const ilk = eksik[0];
    if (!ilk) continue;

    const filling = MAKI_FILLING_OF[ilk];
    if (filling) {
      const varNori = s.matSlots.includes("nori");
      const varPirinc = s.matSlots.includes("rice");
      const varIc = s.matSlots.some((x) => isMakiFilling(x));
      if (varNori && varPirinc && varIc) {
        return {
          text: format(S.hintRollMat, { n: STATION_MAP.mat.taps }),
          target: "mat",
        };
      }
      const sirada: IngredientId = !varNori ? "nori" : !varPirinc ? "rice" : filling;
      const ist = INGREDIENT_STATION[sirada];
      const dishName = y(dish(m.order.find((yy) => dish(yy).needs.includes(ilk)) ?? m.order[0]!).name);
      return {
        text: format(S.hintMake, {
          dish: dishName,
          ingredient: y(ingredient(sirada).name),
          station: ist ? y(STATION_MAP[ist].name) : "",
        }),
        target: ist ?? null,
      };
    }

    const ist = INGREDIENT_STATION[ilk];
    if (ist) {
      const ib = STATION_MAP[ist];
      const remaining = ib.taps - (s.progress[ist] ?? 0);
      return {
        text: format(S.hintMakeFor, {
          name: guestName(m),
          ingredient: y(ingredient(ilk).name),
          station: y(ib.name),
          n: remaining,
        }),
        target: ist,
      };
    }
  }

  return { text: y(S.hintCheck), target: null };
}

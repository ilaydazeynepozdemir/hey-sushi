import {
  STATION_MAP,
  CHARACTERS,
  CHARACTER_MAP,
  MAKI_RECIPES,
  isMakiFilling,
  PLAYER_NAMES,
  DECOR_MAP,
  PLAYER_COLORS,
  DISHES,
  warmthMultiplier,
  dish,
} from "./content";
import { defaultAvatar } from "./avatar";
import type { Avatar } from "./avatar";
import { S, m as m2 } from "./i18n";
import { mulberry32 } from "./rng";
import type {
  Action,
  StationId,
  IngredientId,
  Guest,
  GameState,
  GameEvent,
  Player,
  PlayerId,
  DishId,
} from "./types";

export const BASE_SEATS = 3;
const TRAY_LIMIT = 8;
/** İkram, misafirin beklemesinin bu oranını siler. */
const TREAT_EFFECT = 0.45;
/** Servis botu kaç saniyede bir ikram dağıtır. */
const BOT_INTERVAL = 11;
/** Botun ikramı elle verilenden biraz zayıf. */
const BOT_EFFECT = 0.3;

let sayac = 0;
const nextId = () => `m${++sayac}`;

export function newGame(
  playerCount = 1,
  seed = Date.now() % 1_000_000,
  avatar?: Avatar,
): GameState {
  const players: Player[] = [];
  for (let i = 0; i < playerCount; i++) {
    players.push({
      id: i as PlayerId,
      // Ad avatardan gelir: el kartında ve garsonun altında aynı isim görünsün.
      name: (i === 0 && avatar ? avatar.name : undefined) ?? PLAYER_NAMES[i] ?? `Player ${i + 1}`,
      color: PLAYER_COLORS[i] ?? "#888",
      avatar: i === 0 && avatar ? avatar : defaultAvatar(i),
      hand: null,
      contributions: 0,
    });
  }
  return {
    phase: "menu",
    day: 1,
    hearts: 0,
    dayHearts: 0,
    coins: 0,
    elapsed: 0,
    players,
    guests: [],
    seatCount: BASE_SEATS,
    progress: {},
    matSlots: [],
    matResult: null,
    guestsArrived: 0,
    guestTarget: 5,
    spawnTimer: 1.2,
    seed,
    decor: [],
    extraStations: [],
    botTimer: BOT_INTERVAL,
    stats: { served: 0, perfect: 0, together: 0, leftEarly: 0 },
  };
}

export function menuForDay(day: number): DishId[] {
  return (Object.keys(DISHES) as DishId[]).filter((y) => dish(y).day <= day);
}

function guestsForDay(day: number) {
  return Math.min(5 + day, 12);
}

function seatCount(day: number) {
  return day >= 4 ? 4 : BASE_SEATS;
}

// ---------------------------------------------------------------- yardımcılar

function multisetDiff(a: IngredientId[], b: IngredientId[]): IngredientId[] {
  const kalan = [...b];
  const eksik: IngredientId[] = [];
  for (const x of a) {
    const i = kalan.indexOf(x);
    if (i === -1) eksik.push(x);
    else kalan.splice(i, 1);
  }
  return eksik;
}

export function orderIngredients(order: DishId[]): IngredientId[] {
  return order.flatMap((y) => dish(y).needs);
}

export function moodMultiplier(m: Guest): number {
  const r = m.waited / m.patience;
  if (r < 0.5) return 1.5;
  if (r < 1) return 1.2;
  if (r < 1.6) return 1.0;
  return 0.7;
}

export function moodArt(m: Guest): string {
  const r = m.waited / m.patience;
  if (m.state === "happy") return "ruh_mutlu";
  if (m.state === "leaving") return "ruh_giden";
  if (r < 1) return "ruh_iyi";
  if (r < 1.6) return "ruh_notr";
  return "ruh_uykulu";
}

// ---------------------------------------------------------------- misafir üretimi

function spawnGuest(s: GameState, seat: number): Guest {
  const rnd = mulberry32(s.seed + s.guestsArrived * 7919 + s.day * 104729);
  const seatedCharacters = new Set(s.guests.map((m) => m.characterId));
  const havuz = CHARACTERS.filter((k) => !seatedCharacters.has(k.id));
  const liste = havuz.length ? havuz : CHARACTERS;
  const karakter = liste[Math.floor(rnd() * liste.length)] ?? CHARACTERS[0]!;

  const menu = menuForDay(s.day);
  const order: DishId[] = [];

  // Karakterin favorisi menüdeyse sık sık onu ister — hikâye bağı için.
  const favoriSansi = menu.length <= 2 ? 0.2 : 0.45;
  if (menu.includes(karakter.favorite) && rnd() < favoriSansi) order.push(karakter.favorite);

  // Aynı anda oturan misafirler mümkün olduğunca farklı şey istesin.
  const masadaOlanlar = new Set(s.guests.flatMap((x) => x.order));
  const taze = menu.filter((y) => !masadaOlanlar.has(y));
  const havuz2 = taze.length ? taze : menu;

  const adet = s.day === 1 ? 1 : rnd() < (s.day >= 4 ? 0.55 : 0.4) ? 2 : 1;
  while (order.length < adet) {
    const kaynak = order.length === 0 ? havuz2 : menu;
    const y = kaynak[Math.floor(rnd() * kaynak.length)];
    if (y) order.push(y);
  }
  // İkinci gün ve sonrası: ara sıra yanına çay.
  if (s.day >= 2 && order.length < 3 && rnd() < 0.25 && !order.includes("cay")) {
    order.push("cay");
  }

  const greeting = karakter.greeting[Math.floor(rnd() * karakter.greeting.length)] ?? null;

  return {
    id: nextId(),
    characterId: karakter.id,
    seat,
    order,
    tray: [],
    waited: 0,
    patience: karakter.patience * warmthMultiplier(s.decor),
    state: "pending",
    line: greeting,
    lineTimer: 3,
  };
}

// ---------------------------------------------------------------- aksiyonlar

export function apply(s: GameState, a: Action): GameEvent[] {
  switch (a.kind) {
    case "gun_basla":
      s.phase = "gun";
      s.elapsed = 0;
      s.dayHearts = 0;
      s.guests = [];
      s.guestsArrived = 0;
      s.spawnTimer = 1.2;
      s.botTimer = BOT_INTERVAL;
      s.matSlots = [];
      s.matResult = null;
      s.progress = {};
      s.seatCount = seatCount(s.day);
      s.guestTarget = guestsForDay(s.day);
      s.stats = { served: 0, perfect: 0, together: 0, leftEarly: 0 };
      for (const o of s.players) {
        o.hand = null;
        o.contributions = 0;
      }
      return [];

    case "dekor_al": {
      const d = DECOR_MAP[a.id];
      if (!d || s.decor.includes(a.id) || s.coins < d.price) return [];
      s.coins -= d.price;
      s.decor.push(a.id);
      return [{ kind: "dekor_alindi", id: a.id }];
    }

    case "sonraki_gun":
      s.day += 1;
      s.phase = "menu";
      return [];

    case "tick":
      return tick(s, a.dt);

    case "etkilesim":
      return interact(s, a.oyuncu, a.target);

    case "servis":
      return served(s, a.oyuncu, a.guestId);
  }
}

function tick(s: GameState, dt: number): GameEvent[] {
  if (s.phase !== "gun") return [];
  const events: GameEvent[] = [];
  s.elapsed += dt;

  for (const m of s.guests) {
    if (m.line) {
      m.lineTimer -= dt;
      if (m.lineTimer <= 0) m.line = null;
    }
    if (m.state === "pending") {
      m.waited += dt;
      // Yumuşak baskı: ceza yok, sadece çok uzarsa misafir tatlılıkla kalkar.
      if (m.waited > m.patience * 2.4) {
        const k = CHARACTER_MAP[m.characterId];
        m.state = "leaving";
        m.line = k?.farewell ?? m2("Some other time.", "Başka zaman.");
        m.lineTimer = 2.5;
        s.stats.leftEarly += 1;
        events.push({ kind: "misafir_gitti", guestId: m.id });
      }
    } else {
      m.lineTimer -= 0;
      if (m.line === null) {
        m.waited += dt * 0; // dursun
      }
    }
  }

  // Repliği bitmiş mutlu/giden misafirler koltuğu boşaltır.
  s.guests = s.guests.filter((m) => m.state === "pending" || m.line !== null);

  // Servis botu: en sabırsız misafire düzenli aralıklarla ikram götürür.
  if (s.decor.some((d) => DECOR_MAP[d]?.effect === "bot")) {
    s.botTimer -= dt;
    if (s.botTimer <= 0) {
      s.botTimer = BOT_INTERVAL;
      const target = s.guests
        .filter((m) => m.state === "pending" && m.waited > m.patience * 0.35)
        .sort((a, b) => b.waited / b.patience - a.waited / a.patience)[0];
      if (target) {
        target.waited = Math.max(0, target.waited - target.patience * BOT_EFFECT);
        events.push({ kind: "ikram", guestId: target.id, oyuncu: 0, bot: true });
      }
    }
  }

  // Yeni misafir
  s.spawnTimer -= dt;
  const takenSeats = new Set(s.guests.map((m) => m.seat));
  if (s.spawnTimer <= 0 && s.guestsArrived < s.guestTarget) {
    let bos = -1;
    for (let i = 0; i < s.seatCount; i++) {
      if (!takenSeats.has(i)) {
        bos = i;
        break;
      }
    }
    if (bos >= 0) {
      const m = spawnGuest(s, bos);
      s.guests.push(m);
      s.guestsArrived += 1;
      const rnd = mulberry32(s.seed + s.guestsArrived * 31);
      s.spawnTimer = 4 + rnd() * 5 - Math.min(2, s.day * 0.3);
      events.push({ kind: "misafir_geldi", guestId: m.id });
    }
  }

  if (s.guestsArrived >= s.guestTarget && s.guests.length === 0) {
    s.phase = "gun_sonu";
    s.coins += s.dayHearts;
    events.push({ kind: "gun_bitti" });
  }

  return events;
}

function interact(s: GameState, playerId: PlayerId, target: string): GameEvent[] {
  if (s.phase !== "gun") return [];
  const oyuncu = s.players.find((o) => o.id === playerId);
  if (!oyuncu) return [];

  if (target.startsWith("misafir:")) {
    return trayInteract(s, oyuncu, target.slice("misafir:".length));
  }

  const ist = STATION_MAP[target as keyof typeof STATION_MAP];
  if (!ist) return [];

  if (ist.id === "atik") {
    if (!oyuncu.hand) return [{ kind: "hata", onMessage: S.hataElBos, oyuncu: playerId }];
    oyuncu.hand = null;
    return [{ kind: "birakildi", oyuncu: playerId }];
  }

  if (ist.id === "mat") return matInteract(s, oyuncu);

  // Üretim istasyonları
  if (oyuncu.hand) {
    return [{ kind: "hata", onMessage: S.hataElDolu, oyuncu: playerId }];
  }
  const su = (s.progress[ist.id] ?? 0) + 1;
  oyuncu.contributions += 1;
  if (su >= ist.taps && ist.produces) {
    s.progress[ist.id] = 0;
    oyuncu.hand = ist.produces;
    return [
      { kind: "tick", target: ist.id },
      { kind: "uretildi", ingredient: ist.produces, oyuncu: playerId },
    ];
  }
  s.progress[ist.id] = su;
  return [{ kind: "tick", target: ist.id }];
}

function matInteract(s: GameState, oyuncu: Player): GameEvent[] {
  const ist = STATION_MAP.mat;

  if (oyuncu.hand) {
    if (s.matResult) return [{ kind: "hata", onMessage: S.hataMatDolu, oyuncu: oyuncu.id }];
    const m = oyuncu.hand;
    const gecerli = m === "nori" || m === "pirinc" || isMakiFilling(m);
    if (!gecerli) return [{ kind: "hata", onMessage: S.hataMataGitmez, oyuncu: oyuncu.id }];
    const ayniTip = s.matSlots.some((x) => (isMakiFilling(m) ? isMakiFilling(x) : x === m));
    if (ayniTip) return [{ kind: "hata", onMessage: S.hataMattaVar, oyuncu: oyuncu.id }];
    s.matSlots.push(m);
    oyuncu.hand = null;
    oyuncu.contributions += 1;
    return [{ kind: "mata_kondu", ingredient: m, oyuncu: oyuncu.id }];
  }

  if (s.matResult) {
    oyuncu.hand = s.matResult;
    s.matResult = null;
    return [{ kind: "uretildi", ingredient: oyuncu.hand, oyuncu: oyuncu.id }];
  }

  const filling = s.matSlots.find((x) => isMakiFilling(x));
  const tam = s.matSlots.includes("nori") && s.matSlots.includes("pirinc") && filling;
  if (tam) {
    const su = (s.progress.mat ?? 0) + 1;
    oyuncu.contributions += 1;
    if (su >= ist.taps) {
      const tarif = MAKI_RECIPES.find((t) => t.filling === filling);
      s.progress.mat = 0;
      s.matSlots = [];
      if (!tarif) {
        return [{ kind: "hata", onMessage: S.hataMakiOlmuyor, oyuncu: oyuncu.id }];
      }
      oyuncu.hand = tarif.sonuc;
      return [
        { kind: "tick", target: "mat" },
        { kind: "uretildi", ingredient: tarif.sonuc, oyuncu: oyuncu.id },
      ];
    }
    s.progress.mat = su;
    return [{ kind: "tick", target: "mat" }];
  }

  const son = s.matSlots.pop();
  if (son) {
    oyuncu.hand = son;
    return [{ kind: "tick", target: "mat" }];
  }
  return [{ kind: "hata", onMessage: S.hataMatBos, oyuncu: oyuncu.id }];
}

function trayInteract(s: GameState, oyuncu: Player, guestId: string): GameEvent[] {
  const m = s.guests.find((x) => x.id === guestId);
  if (!m || m.state !== "pending") return [];

  if (oyuncu.hand) {
    // İkram siparişin parçası değil: tepsiye girmez, misafirin keyfini tazeler.
    if (oyuncu.hand === "ikram") {
      oyuncu.hand = null;
      oyuncu.contributions += 1;
      m.waited = Math.max(0, m.waited - m.patience * TREAT_EFFECT);
      return [{ kind: "ikram", guestId, oyuncu: oyuncu.id, bot: false }];
    }
    if (m.tray.length >= TRAY_LIMIT) {
      return [{ kind: "hata", onMessage: S.hataTepsiDolu, oyuncu: oyuncu.id }];
    }
    const ingredient = oyuncu.hand;
    m.tray.push({ ingredient, placedBy: oyuncu.id });
    oyuncu.hand = null;
    oyuncu.contributions += 1;
    return [{ kind: "tepsiye_kondu", guestId, ingredient, oyuncu: oyuncu.id }];
  }

  const son = m.tray.pop();
  if (son) {
    oyuncu.hand = son.ingredient;
    return [{ kind: "tepsiden_alindi", guestId, ingredient: son.ingredient, oyuncu: oyuncu.id }];
  }
  return [{ kind: "hata", onMessage: S.hataTepsiBos, oyuncu: oyuncu.id }];
}

function served(s: GameState, playerId: PlayerId, guestId: string): GameEvent[] {
  const m = s.guests.find((x) => x.id === guestId);
  if (!m || m.state !== "pending") return [];

  const needs = orderIngredients(m.order);
  const tray = m.tray.map((t) => t.ingredient);
  const eksik = multisetDiff(needs, tray);

  if (eksik.length > 0) {
    // Ceza yok: misafir bekler, tepsi durur.
    m.line = S.misafirBekler;
    m.lineTimer = 2;
    return [{ kind: "eksik", guestId }];
  }

  const fazla = multisetDiff(tray, needs);
  const karakter = CHARACTER_MAP[m.characterId];
  const ruh = moodMultiplier(m);
  const koyanlar = new Set(m.tray.map((t) => t.placedBy));
  const together = koyanlar.size >= 2;

  let hearts = m.order.reduce((t, y) => t + dish(y).hearts, 0);
  hearts *= ruh;
  if (together) hearts *= 1.5;
  if (fazla.length) hearts *= 0.8;

  const favoriVar = karakter ? m.order.includes(karakter.favorite) : false;
  if (favoriVar) hearts += 2;

  const toplam = Math.max(1, Math.round(hearts));
  s.hearts += toplam;
  s.dayHearts += toplam;
  s.stats.served += 1;
  if (together) s.stats.together += 1;
  const perfect = fazla.length === 0 && ruh >= 1.2;
  if (perfect) s.stats.perfect += 1;

  m.state = "happy";
  m.tray = [];
  if (karakter) {
    const hikayeSatiri = karakter.story[Math.min(karakter.story.length - 1, s.day - 1)];
    m.line = favoriVar
      ? karakter.favoriteLine
      : (karakter.happy[toplam % karakter.happy.length] ?? m2("Thank you.", "Teşekkürler."));
    if (s.day >= 2 && hikayeSatiri && (s.stats.served + s.day) % 2 === 0) {
      m.line = hikayeSatiri;
    }
  }
  m.lineTimer = 3;

  const oyuncu = s.players.find((o) => o.id === playerId);
  if (oyuncu) oyuncu.contributions += 1;

  return [{ kind: "servis", guzel: perfect, hearts: toplam, together, guestId }];
}

/** Tepsideki malzemelerle siparişteki hangi yemekler tamamlanmış? (sırayla, açgözlü eşleme) */
export function orderProgress(order: DishId[], tray: IngredientId[]): boolean[] {
  const havuz = [...tray];
  return order.map((y) => {
    const needs = [...dish(y).needs];
    const bulunan: number[] = [];
    for (const g of needs) {
      const i = havuz.findIndex((x, idx) => x === g && !bulunan.includes(idx));
      if (i === -1) return false;
      bulunan.push(i);
    }
    for (const i of bulunan.sort((a, b) => b - a)) havuz.splice(i, 1);
    return true;
  });
}

/** Tepsi siparişi karşılıyor mu? (servis butonunu yakmak için) */
export function readyToServe(order: DishId[], tray: IngredientId[]): boolean {
  return multisetDiff(orderIngredients(order), tray).length === 0;
}


/** Bir tarifin gerektirdiği istasyonları (kapalıysa) açar. */
export function unlockStations(s: GameState, istasyonlar: StationId[]) {
  for (const id of istasyonlar) {
    if (!s.extraStations.includes(id)) s.extraStations.push(id);
  }
}

/** Online oyunda odaya katılan için yeni oyuncu açar. Dolu ise null. */
export function addPlayer(s: GameState, name?: string, avatar?: Avatar): PlayerId | null {
  if (s.players.length >= 4) return null;
  const id = s.players.length as PlayerId;
  s.players.push({
    id,
    name: avatar?.name || name?.slice(0, 12) || PLAYER_NAMES[id] || `Player ${id + 1}`,
    color: PLAYER_COLORS[id] ?? "#888",
    avatar: avatar ?? defaultAvatar(id),
    hand: null,
    contributions: 0,
  });
  return id;
}

/** Oyuncunun avatarını günceller (ad da avatardan gelir). */
export function setAvatar(s: GameState, id: PlayerId, avatar: Avatar) {
  const o = s.players.find((x) => x.id === id);
  if (!o) return;
  o.avatar = avatar;
  o.name = avatar.name;
}

/** Ayrılan oyuncuyu çıkarır; elindeki malzeme kaybolur, kalan indeksler korunur. */
export function removePlayer(s: GameState, id: PlayerId) {
  s.players = s.players.filter((o) => o.id !== id);
  for (const m of s.guests) m.tray = m.tray.filter((t) => t.placedBy !== id);
}

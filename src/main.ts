import "./ui/styles.css";
import {
  allRecipes as tumTarifler,
  addRecipe,
  stationsRecipeUnlocks,
  removeRecipe,
  applyRecipe,
  loadRecipes,
} from "./core/workshop";
import type { CustomRecipe } from "./core/workshop";
import { setAvatar, unlockStations, removePlayer, addPlayer, apply, newGame } from "./core/game";
import { saveAvatar as avatarDepola, loadAvatar } from "./core/avatar";
import type { Avatar } from "./core/avatar";
import { S, format, initLang, y } from "./core/i18n";
import { nextHint } from "./core/hint";
import { seasonForDay } from "./core/content";
import { readSave, applySave, writeSave } from "./core/save";
import type { Action, GameState, GameEvent, PlayerId } from "./core/types";
import { Capacitor } from "@capacitor/core";
import { restoreStorage, storageSet } from "./core/storage";
import { startUpdates, deferUpdate, applyUpdate } from "./core/updates";
import { initNative } from "./core/native";
import { hapticSuccess, hapticLight } from "./core/haptics";
import { Oda } from "./net/room";
import { toggleMusic, musicEnabled, startMusic, pauseMusic, setMusicSeason } from "./ui/music";
import {
  toggleSfx,
  sfxTogether,
  sfxDrop,
  sfxDayEnd,
  sfxError,
  sfxGuest,
  sfxServe,
  sfxTap,
  sfxProduce,
} from "./ui/audio";
import { View, targetList } from "./ui/view";

const kok = document.getElementById("app");
if (!kok) throw new Error("#app yok");

let state: GameState = newGame(1, undefined, loadAvatar());
let secim = 0;
let tapCount = 0;
let lastTapTarget: import("./core/types").TargetId | null = null;
let lastActor: PlayerId = 0;
let guideOn = localStorage.getItem("tsuki.rehber") !== "0";
let workshopOpen = false;
let avatarOpen = false;
let sfxOn = true;
let quitOpen = false;
let musicStarted = false;
let musicSeason = "";
let myAvatar: Avatar = loadAvatar();
let keyboardActive = false;

/** Online oyunda bu istemcinin sürdüğü oyuncu. */
let myPlayerId: PlayerId = 0;
/** Host tarafında: röle üye kimliği → oyuncu indeksi. */
const memberToPlayer = new Map<number, PlayerId>();
let lastBroadcast = 0;
let netWarning = "";

initLang();
loadRecipes();

/** Kayıtlı ilerleme varsa geri yükle (gün, kalp, jeton, dükkân). */
const bootSave = readSave();

if (bootSave) applySave(state, bootSave);

/** Kaydedip uygulamadan çık (web'de çıkış yok: menüye dön). */
async function quitApp() {
  if (Capacitor.isNativePlatform()) {
    const { App: Uygulama } = await import("@capacitor/app");
    await Uygulama.exitApp();
    return;
  }
  state.phase = "menu";
  arayuz.invalidateOverlay();
  render();
}

// ---------------------------------------------------------------- ağ
const oda = new Oda({
  onState(veri) {
    const v = veri as { t?: string; state?: GameState; myPlayerId?: number; tarifler?: CustomRecipe[] };
    if (v.t === "kimlik") {
      myPlayerId = (v.myPlayerId ?? 0) as PlayerId;
      for (const t of v.tarifler ?? []) applyRecipe(t);
      oda.send({ t: "avatar", avatar: myAvatar });
      arayuz.invalidateOverlay();
    } else if (v.t === "durum" && v.state) {
      state = v.state;
    }
    render();
  },
  onAction(uyeId, veri) {
    // Sadece ev sahibi burayı görür: gelen aksiyonu kendi durumuna uygular.
    const v = veri as { t?: string; aksiyon?: Action; avatar?: Avatar };
    const player = memberToPlayer.get(uyeId);
    if (player === undefined) return;
    if (v.t === "avatar" && v.avatar) {
      setAvatar(state, player, v.avatar);
      broadcast(true);
      render();
      return;
    }
    if (v.t !== "aksiyon" || !v.aksiyon) return;
    const a = v.aksiyon;
    if (a.kind !== "interact" && a.kind !== "serve") return;
    lastActor = player;
    handleEvents(apply(state, { ...a, player }));
    broadcast(true);
    render();
  },
  onMemberJoined(id, name) {
    const player = addPlayer(state, name);
    if (player === null) return;
    memberToPlayer.set(id, player);
    oda.send({ t: "kimlik", myPlayerId: player, tarifler: tumTarifler() }, id);
    broadcast(true);
    arayuz.toast(`${state.players[player]?.name ?? "?"} ${y({ en: "joined the room", tr: "odaya katıldı" })}`);
    arayuz.invalidateOverlay();
    render();
  },
  onMemberLeft(id) {
    const player = memberToPlayer.get(id);
    if (player !== undefined) {
      removePlayer(state, player);
      memberToPlayer.delete(id);
    }
    broadcast(true);
    arayuz.invalidateOverlay();
    render();
  },
  onClosed(sebep) {
    netWarning = `${y({ en: "Room closed", tr: "Oda kapandı" })}: ${sebep}`;
    memberToPlayer.clear();
    myPlayerId = 0;
    state = continueSolo(state);
    arayuz.toast(netWarning);
    arayuz.invalidateOverlay();
    render();
  },
  onError(onMessage) {
    netWarning = onMessage;
    arayuz.toast(onMessage);
    arayuz.invalidateOverlay();
    render();
  },
  onChanged() {
    arayuz.invalidateOverlay();
    render();
  },
});

/** Oda dağılınca tek kişilik oyuna düş. */
function continueSolo(prev: GameState): GameState {
  const next = newGame(1, undefined, myAvatar);
  next.day = prev.day;
  next.hearts = prev.hearts;
  next.coins = prev.coins;
  next.decor = prev.decor;
  return next;
}

function broadcast(zorla = false) {
  if (oda.role !== "host" || !oda.connected) return;
  const simdi = performance.now();
  if (!zorla && simdi - lastBroadcast < 80) return;
  lastBroadcast = simdi;
  oda.send({ t: "durum", state });
}

// ---------------------------------------------------------------- arayüz
const arayuz = new View(kok, {
  onTarget(target) {
    dispatch({ kind: "interact", player: myId(), target });
  },
  onServe(guestId) {
    dispatch({ kind: "serve", player: myId(), guestId });
  },
  onStartDay() {
    dispatch({ kind: "start_day" });
  },
  onNextDay() {
    dispatch({ kind: "next_day" });
  },
  onBuyDecor(id) {
    dispatch({ kind: "buy_decor", id });
  },
  onToggleSfx() {
    sfxOn = toggleSfx();
    render();
  },
  onToggleMusic() {
    toggleMusic();
    render();
  },
  onOpenQuit() {
    quitOpen = true;
    arayuz.invalidateOverlay();
    render();
  },
  onCloseQuit() {
    quitOpen = false;
    arayuz.invalidateOverlay();
    render();
  },
  onConfirmQuit() {
    writeSave(state);
    quitOpen = false;
    void quitApp();
  },
  onChangeLang() {
    // Metinler her yerde yeniden okunmalı: arayüzü baştan kur.
    arayuz.rebuild();
    arayuz.invalidateOverlay();
    render();
  },
  onOpenAvatar() {
    avatarOpen = true;
    arayuz.invalidateOverlay();
    render();
  },
  onCloseAvatar() {
    avatarOpen = false;
    arayuz.invalidateOverlay();
    render();
  },
  saveAvatar(a) {
    myAvatar = a;
    avatarDepola(a);
    avatarOpen = false;
    if (oda.role === "guest") {
      oda.send({ t: "avatar", avatar: a });
    } else {
      setAvatar(state, myId(), a);
      broadcast(true);
    }
    arayuz.toast(format(S.greeting, { name: a.name }));
    arayuz.invalidateOverlay();
    render();
  },
  onOpenWorkshop() {
    workshopOpen = true;
    arayuz.invalidateOverlay();
    render();
  },
  onCloseWorkshop() {
    workshopOpen = false;
    arayuz.invalidateOverlay();
    render();
  },
  onSaveRecipe(t) {
    // Tarifin malzemeleri oyunda üretilebilir olmalı: eksik istasyonları aç.
    const acilacak = stationsRecipeUnlocks(t, state.day, state.extraStations);
    if (acilacak.length) unlockStations(state, acilacak);
    const tam = addRecipe(t);
    workshopOpen = false;
    if (oda.role === "host") oda.send({ t: "kimlik", myPlayerId: -1, tarifler: [tam] });
    arayuz.toast(format(S.addedToMenu, { name: t.name }));
    arayuz.invalidateOverlay();
    render();
  },
  onDeleteRecipe(id) {
    removeRecipe(id);
    arayuz.invalidateOverlay();
    render();
  },
  onToggleGuide() {
    guideOn = !guideOn;
    storageSet("tsuki.rehber", guideOn ? "1" : "0");
    render();
  },
  onSetPlayerCount(n) {
    if (oda.role !== "off") return;
    const kaydedilen = { day: state.day, hearts: state.hearts, coins: state.coins, decor: state.decor };
    state = newGame(n, undefined, myAvatar);
    Object.assign(state, kaydedilen);
    arayuz.invalidateOverlay();
    render();
  },
  onCreateRoom() {
    netWarning = "";
    state = newGame(1, undefined, myAvatar);
    memberToPlayer.clear();
    myPlayerId = 0;
    void oda.create();
  },
  onJoinRoom(code: string) {
    netWarning = "";
    void oda.join(code, myAvatar.name);
  },
  onLeaveRoom() {
    oda.leave();
    memberToPlayer.clear();
    myPlayerId = 0;
    state = continueSolo(state);
    arayuz.invalidateOverlay();
    render();
  },
});

/** Bu istemcinin sürdüğü oyuncu — çevrimdışıyken hep 0 (fare). */
function myId(): PlayerId {
  return oda.role === "off" ? 0 : myPlayerId;
}

/** Klavye: çevrimdışı iki kişilikte 2. oyuncu, diğer hâllerde kendi oyuncun. */
function keyboardPlayer(): PlayerId {
  if (oda.role !== "off") return myPlayerId;
  return (state.players.length - 1) as PlayerId;
}

function dispatch(a: Action) {
  if (a.kind === "interact" || a.kind === "serve") lastActor = a.player;
  if (oda.role === "guest") {
    if (a.kind === "interact" || a.kind === "serve") {
      oda.send({ t: "aksiyon", aksiyon: { ...a, player: myPlayerId } });
      if (a.kind === "interact") arayuz.bump(a.target);
    } else {
      arayuz.toast({ en: "Only the host can do that", tr: "Bunu ev sahibi yapabilir" });
    }
    return;
  }
  handleEvents(apply(state, a));
  broadcast(true);
  render();
}

function handleEvents(events: GameEvent[]) {
  for (const o of events) {
    switch (o.kind) {
      case "tick":
        arayuz.bump(o.target);
        lastTapTarget = o.target;
        sfxTap(tapCount++ % 3);
        if (!o.target.startsWith("guest:")) arayuz.serverToStation(lastActor, o.target);
        break;
      case "produced":
        sfxProduce();
        if (o.player === myId()) hapticLight();
        tapCount = 0;
        if (lastTapTarget) arayuz.burstAt(lastTapTarget);
        // Parmak hâlâ basılıysa üretilen malzeme doğrudan sürüklenmeye başlar.
        if (o.player === myId()) arayuz.dragProduced(o.ingredient);
        break;
      case "treat":
        sfxProduce();
        arayuz.floatText(o.guestId, "", "ui_kalp");
        if (!o.bot && o.player === myId()) hapticLight();
        break;
      case "placed_on_tray": {
        // Işınlanma yok: garson malzemeyi masaya yürüyerek götürür.
        const guest = state.guests.find((m) => m.id === o.guestId);
        const index = guest ? guest.tray.length - 1 : 0;
        arayuz.serverDeliver(o.player, o.guestId, index, o.ingredient);
        break;
      }
      case "placed_on_mat":
        sfxDrop();
        arayuz.serverToStation(o.player, "mat");
        if (o.player === myId()) arayuz.flyIngredient(o.ingredient, "mat");
        break;
      case "taken_from_tray":
        sfxTap(0);
        break;
      case "dropped":
        sfxDrop();
        break;
      case "serve":
        sfxServe(o.guzel);
        hapticSuccess();
        if (o.together) setTimeout(sfxTogether, 180);
        arayuz.floatText(o.guestId, `+${o.hearts}`);
        if (o.together) setTimeout(() => arayuz.floatText(o.guestId, y(S.togetherLabel), "ui_parilti"), 260);
        break;
      case "incomplete":
        arayuz.toast(S.orderIncomplete);
        break;
      case "guest_arrived":
        sfxGuest();
        break;
      case "day_over":
        sfxDayEnd();
        writeSave(state); // gün bitti: ilerleme otomatik kaydedilir
        break;
      case "error":
        if (o.player === myId()) {
          sfxError();
          arayuz.toast(o.onMessage);
        }
        break;
      case "decor_bought":
      case "guest_left":
        break;
    }
  }
}

function render() {
  // Mevsim değişince müziğin rengi de değişsin (tempo, yoğunluk, parlaklık).
  const season = seasonForDay(state.day).id;
  if (season !== musicSeason) {
    musicSeason = season;
    setMusicSeason(season);
  }
  const liste = targetList(state);
  if (secim >= liste.length) secim = Math.max(0, liste.length - 1);
  const kbPlayer = state.players[keyboardPlayer()];
  const multiplayer = state.players.length > 1 || oda.role !== "off";
  arayuz.render(state, {
    selectedTarget: multiplayer || keyboardActive ? (liste[secim] ?? null) : null,
    selectionColor: kbPlayer?.color ?? "#ffb9a3",
    sfxOn,
    musicOn: musicEnabled(),
    hint: guideOn ? nextHint(state, myId()) : null,
    guideOn,
    workshopOpen,
    avatarOpen,
    quitOpen,
    net: {
      role: oda.role,
      code: oda.code,
      connecting: oda.connecting,
      members: [...oda.members.values()],
      uyari: netWarning,
      myPlayerId,
    },
  });
}

// ---------------------------------------------------------------- klavye
window.addEventListener("keydown", (e) => {
  const typing = document.activeElement instanceof HTMLInputElement;
  if (typing) return;

  if (state.phase !== "day") {
    if ((e.code === "Space" || e.code === "Enter") && !workshopOpen && oda.role !== "guest") {
      e.preventDefault();
      dispatch(state.phase === "menu" ? { kind: "start_day" } : { kind: "next_day" });
    }
    return;
  }
  const liste = targetList(state);
  const player = keyboardPlayer();

  switch (e.code) {
    case "ArrowLeft":
    case "KeyA":
      e.preventDefault();
      keyboardActive = true;
      secim = (secim - 1 + liste.length) % liste.length;
      render();
      break;
    case "ArrowRight":
    case "KeyD":
      e.preventDefault();
      keyboardActive = true;
      secim = (secim + 1) % liste.length;
      render();
      break;
    case "Space":
    case "Enter": {
      e.preventDefault();
      keyboardActive = true;
      const target = liste[secim];
      if (target) dispatch({ kind: "interact", player, target });
      break;
    }
    case "ShiftLeft":
    case "ShiftRight": {
      e.preventDefault();
      keyboardActive = true;
      const target = liste[secim];
      if (target?.startsWith("guest:")) {
        dispatch({ kind: "serve", player, guestId: target.slice("guest:".length) });
      }
      break;
    }
    case "KeyM":
      sfxOn = toggleSfx();
      arayuz.toast(sfxOn ? S.sfxOn : S.sfxOffLabel);
      render();
      break;
    case "KeyR":
      guideOn = !guideOn;
      storageSet("tsuki.rehber", guideOn ? "1" : "0");
      arayuz.toast(guideOn ? S.guideOn : S.guideOffLabel);
      render();
      break;
  }
});

// ---------------------------------------------------------------- döngü
let lastTime = performance.now();
function loop(t: number) {
  // Not: sekme arka plandayken rAF durur — oyun kendiliğinden duraklar,
  // misafirler beklemez. Geri dönüldüğünde dt zaten 0.1 sn ile sınırlanıyor.
  const dt = Math.min(0.1, (t - lastTime) / 1000);
  lastTime = t;
  // Misafir istemciler simülasyonu çalıştırmaz; durumu ev sahibinden alır.
  if (state.phase === "day" && oda.role !== "guest") {
    const events = apply(state, { kind: "tick", dt });
    if (events.length) handleEvents(events);
    broadcast();
    render();
  } else if (oda.role === "guest") {
    render();
  }
  requestAnimationFrame(loop);
}

render();
requestAnimationFrame(loop);

/**
 * Ev sahibi sekmeyi arka plana alırsa rAF durur ve odadaki HERKES donar.
 * Tek kişilik oyunda duraklamak istenen davranış, o yüzden bu yedek tick
 * yalnızca ev sahibiyken ve sekme gizliyken çalışır. Tarayıcı arka planda
 * zamanlayıcıyı ~1 sn'ye kısar; dt sınırlı olduğu için oyun donmak yerine yavaşlar.
 */
setInterval(() => {
  if (!document.hidden || oda.role !== "host" || state.phase !== "day") return;
  const simdi = performance.now();
  const dt = Math.min(0.25, (simdi - lastTime) / 1000);
  lastTime = simdi;
  const events = apply(state, { kind: "tick", dt });
  if (events.length) handleEvents(events);
  broadcast(true);
}, 100);

// Yalnızca geliştirmede: konsoldan durumu okuyup elle tick atabilmek için.
// Üretim derlemesinde bu blok tamamen elenir.
if (import.meta.env.DEV) {
  (window as unknown as { __tsuki?: unknown }).__tsuki = {
    get state() {
      return state;
    },
    tick(dt = 1 / 60) {
      handleEvents(apply(state, { kind: "tick", dt }));
      render();
    },
    dispatch,
  };
}

// ---------------------------------------------------------------- açılış kurtarma
/**
 * Native'de localStorage temizlenmiş olabilir; Preferences'taki yedeği geri
 * yükleyip ayarları tazeliyoruz. Web'de bu bir no-op.
 */
void restoreStorage().then(() => {
  if (!Capacitor.isNativePlatform()) return;
  initLang();
  myAvatar = loadAvatar();
  loadRecipes();
  setAvatar(state, 0, myAvatar);
  arayuz.rebuild();
  arayuz.invalidateOverlay();
  render();
});

// ---------------------------------------------------------------- müzik
// Tarayıcılar otomatik oynatmayı engeller: ilk dokunuşu bekliyoruz.
function wakeMusic() {
  if (musicStarted) return;
  musicStarted = true;
  setMusicSeason(seasonForDay(state.day).id);
  startMusic();
}
window.addEventListener("pointerdown", wakeMusic, { once: true });
window.addEventListener("keydown", wakeMusic, { once: true });

// ---------------------------------------------------------------- OTA güncelleme
void startUpdates({
  hazir(manifest) {
    arayuz.askForUpdate(manifest.note, {
      simdi: () => void applyUpdate(),
      sonra: () => void deferUpdate(),
    });
  },
});

// ---------------------------------------------------------------- native kabuk
void initNative({
  geriTusu() {
    // Açık bir panel varsa geri tuşu onu kapatsın, uygulamadan çıkmasın.
    if (quitOpen) {
      quitOpen = false;
      arayuz.invalidateOverlay();
      render();
      return true;
    }
    if (avatarOpen) {
      avatarOpen = false;
      arayuz.invalidateOverlay();
      render();
      return true;
    }
    if (workshopOpen) {
      workshopOpen = false;
      arayuz.invalidateOverlay();
      render();
      return true;
    }
    return false;
  },
  gorunurluk(aktif) {
    // Arka plandan dönüşte zaman sıçramasın: saati şimdiye çek.
    if (aktif) lastTime = performance.now();
    pauseMusic(!aktif);
    if (!aktif) writeSave(state); // arka plana alınırken kaydet
  },
});

document.addEventListener("contextmenu", (e) => e.preventDefault());
document.addEventListener("gesturestart", (e) => e.preventDefault());

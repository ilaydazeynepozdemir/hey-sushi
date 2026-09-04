import {
  DISHES as YEMEK_KAYDI_HAM,
  DECOR_ITEMS,
  STATION_MAP,
  CHARACTER_MAP,
  INGREDIENTS,
  stationsForDay,
  seasonForDay,
  dish,
} from "../core/content";
import { menuForDay, moodArt, readyToServe, orderProgress } from "../core/game";
import type { Hint } from "../core/hint";
import type { TargetId, StationId, IngredientId, Guest, GameState, PlayerId } from "../core/types";
import { serverSvg, art } from "./art";
import { defaultAvatar } from "../core/avatar";
import { S, format, activeLang, setLang, y, type LangCode } from "../core/i18n";
import { FEATURES } from "../core/features";
import { Sahne } from "./scene";
import { hapticSelect } from "../core/haptics";
import { workshopPanel } from "./workshop-panel";
import { avatarPanel } from "./avatar-panel";
import type { Avatar } from "../core/avatar";
import type { CustomRecipe } from "../core/workshop";
import type { NetRole } from "../net/room";

const PASTEL_BLOBS = ["#ffd7c9", "#d8eed3", "#cbe7e2", "#fff0cf", "#d5cbe9"];

export interface ViewInput {
  selectedTarget: TargetId | null;
  selectionColor: string;
  sfxOn: boolean;
  musicOn: boolean;
  hint: Hint | null;
  guideOn: boolean;
  workshopOpen: boolean;
  avatarOpen: boolean;
  quitOpen: boolean;
  net: NetGirdi;
}

export interface NetGirdi {
  role: NetRole;
  code: string;
  connecting: boolean;
  members: string[];
  uyari: string;
  myPlayerId: number;
}

export interface ViewCallbacks {
  onTarget(target: TargetId): void;
  onBuyDecor(id: string): void;
  onOpenWorkshop(): void;
  onCloseWorkshop(): void;
  onSaveRecipe(t: Omit<CustomRecipe, "id">): void;
  onDeleteRecipe(id: string): void;
  onOpenAvatar(): void;
  onCloseAvatar(): void;
  saveAvatar(a: Avatar): void;
  onChangeLang(d: LangCode): void;
  onToggleSfx(): void;
  onToggleMusic(): void;
  onOpenQuit(): void;
  onCloseQuit(): void;
  onConfirmQuit(): void;
  onCreateRoom(): void;
  onJoinRoom(code: string): void;
  onLeaveRoom(): void;
  onServe(guestId: string): void;
  onStartDay(): void;
  onNextDay(): void;
  onSetPlayerCount(n: number): void;
  onToggleGuide(): void;
}

export class View {
  private kok: HTMLElement;
  private salon!: HTMLElement;
  private tezgah!: HTMLElement;
  private counterWrap!: HTMLElement;
  private eller!: HTMLElement;
  private guideBar!: HTMLElement;
  private guideBtn!: HTMLButtonElement;
  private langSwitch!: HTMLElement;
  private sfxBtn!: HTMLButtonElement;
  private musicBtn!: HTMLButtonElement;
  private quitBtn!: HTMLButtonElement;
  private topRight!: HTMLElement;
  private topBar!: HTMLElement;
  private badges!: { day: HTMLElement; hearts: HTMLElement; misafir: HTMLElement };
  private overlayHost!: HTMLElement;
  private stationEls = new Map<string, HTMLElement>();
  private seatEls = new Map<string, HTMLElement>();
  private lastOverlay = "";
  /** Arayüz baştan kurulurken açık bir panel var mıydı? (dil değişiminde solma olmasın) */
  private overlaySwap = false;
  private stationsKey = "";
  private sahne!: Sahne;
  private dragLayer!: HTMLElement;
  private dragGhost: HTMLElement | null = null;
  private dropTarget: HTMLElement | null = null;
  private pointerDown = false;
  private lastPointer = { x: 0, y: 0 };
  private myPlayer = 0;
  private garsonKatman!: HTMLElement;
  private servers = new Map<PlayerId, HTMLElement>();
  private serverHome = new Map<PlayerId, { x: number; y: number }>();
  private serverBusy = new Set<PlayerId>();
  /** Garsonun geçici olarak durduğu yer (çalıştığı istasyon) — süresi dolunca eve döner. */
  private serverFocus = new Map<PlayerId, number>();
  /** Garson masaya varana kadar gizlenecek tepsi parçaları. */
  private pendingPieces = new Map<string, Set<number>>();

  constructor(kok: HTMLElement, private cb: ViewCallbacks) {
    this.kok = kok;
    this.buildSkeleton();
  }

  private buildSkeleton() {
    this.kok.innerHTML = "";
    this.sahne = new Sahne(this.kok);

    const fenerler = hand("div", "lanterns");
    ([[8, 12], [72, 6], [30, 68], [88, 52], [52, 26]] as const).forEach(([x, y], i) => {
      const f = hand("div", "lantern");
      f.style.left = `${x}%`;
      f.style.top = `${y}%`;
      f.style.background = PASTEL_BLOBS[i % PASTEL_BLOBS.length]!;
      f.style.animationDelay = `${i * 1.3}s`;
      fenerler.appendChild(f);
    });
    this.kok.appendChild(fenerler);

    const ust = hand("div", "topbar");
    const marka = hand("div", "brand");
    marka.innerHTML = `${art("ui_fener", 22)}<span>Hey <b>Sushi</b></span>`;
    const day = hand("div", "badge");
    const hearts = hand("div", "rozet kalp");
    const misafir = hand("div", "badge guest-badge");
    this.guideBtn = hand("button", "guide-btn") as HTMLButtonElement;
    this.guideBtn.onclick = () => this.cb.onToggleGuide();
    // Sağ üstte dil değiştirici — girişte ve oyun sırasında hep erişilebilir.
    this.langSwitch = hand("div", "lang-switch");
    const langOptions: [LangCode, string][] = [
      ["en", "EN"],
      ["tr", "TR"],
    ];
    for (const [code, kisa] of langOptions) {
      const b = hand("button", "lang-btn") as HTMLButtonElement;
      b.dataset.dil = code;
      b.textContent = kisa;
      b.onclick = () => {
        if (activeLang() === code) return;
        setLang(code);
        this.cb.onChangeLang(code);
      };
      this.langSwitch.appendChild(b);
    }

    ust.append(marka, hand("div", "spacer"), this.guideBtn, misafir, day, hearts);
    this.badges = { day, hearts, misafir };
    this.topBar = ust;
    this.kok.appendChild(ust);
    // Perdenin de üstünde dursun: giriş ekranında da erişilebilir olmalı.
    this.musicBtn = hand("button", "round-btn") as HTMLButtonElement;
    this.musicBtn.onclick = () => this.cb.onToggleMusic();
    this.sfxBtn = hand("button", "round-btn") as HTMLButtonElement;
    this.sfxBtn.onclick = () => this.cb.onToggleSfx();
    this.quitBtn = hand("button", "round-btn quit") as HTMLButtonElement;
    this.quitBtn.innerHTML = art("ui_cikis", 15);
    this.quitBtn.onclick = () => this.cb.onOpenQuit();

    this.topRight = hand("div", "top-right");
    this.topRight.append(this.quitBtn, this.musicBtn, this.sfxBtn, this.langSwitch);
    this.kok.appendChild(this.topRight);

    this.salon = hand("div", "dining");
    this.kok.appendChild(this.salon);

    const sarma = hand("div", "counter-wrap");
    this.counterWrap = sarma;
    this.guideBar = hand("div", "guide-bar");
    this.tezgah = hand("div", "counter");
    this.eller = hand("div", "hands");
    sarma.append(this.guideBar, this.tezgah, this.eller);
    this.kok.appendChild(sarma);

    this.garsonKatman = hand("div", "server-layer");
    this.overlayHost = hand("div", "overlay-host");
    this.dragLayer = hand("div", "drag-layer");
    this.kok.append(this.garsonKatman, this.overlayHost, this.dragLayer);

    // Yakalama aşaması: istasyonun kendi pointerdown'ından ÖNCE çalışmalı ki
    // üretim tamamlandığında parmağın hâlâ basılı olduğunu bilelim.
    window.addEventListener(
      "pointerdown",
      (e) => {
        this.pointerDown = true;
        this.lastPointer = { x: e.clientX, y: e.clientY };
      },
      true,
    );
    window.addEventListener("pointermove", (e) => {
      this.lastPointer = { x: e.clientX, y: e.clientY };
      if (this.dragGhost) this.moveDrag(e.clientX, e.clientY);
    });
    window.addEventListener("pointerup", (e) => {
      this.pointerDown = false;
      if (this.dragGhost) this.endDrag(e.clientX, e.clientY);
    });
    window.addEventListener("pointercancel", () => {
      this.pointerDown = false;
      if (this.dragGhost) this.cancelDrag();
    });
  }

  // ------------------------------------------------------------- sürükle bırak
  /** Üretim tamamlandığında parmak/fare hâlâ basılıysa doğrudan sürüklemeye geç. */
  dragProduced(ingredient: IngredientId) {
    if (!this.pointerDown || this.dragGhost) return;
    this.startDrag(ingredient, this.lastPointer.x, this.lastPointer.y);
  }

  startDrag(ingredient: IngredientId, x: number, y: number) {
    if (this.dragGhost) return;
    const h = hand("div", "dragging");
    h.innerHTML = art(INGREDIENTS[ingredient].icon, 46);
    this.dragLayer.appendChild(h);
    this.dragGhost = h;
    this.kok.classList.add("is-dragging");
    this.moveDrag(x, y);
  }

  private moveDrag(x: number, y: number) {
    const h = this.dragGhost;
    if (!h) return;
    const kutu = this.kok.getBoundingClientRect();
    h.style.left = `${x - kutu.left}px`;
    h.style.top = `${y - kutu.top}px`;

    const altindaki = document.elementFromPoint(x, y);
    const target = altindaki?.closest<HTMLElement>("[data-drop]") ?? null;
    if (target !== this.dropTarget) {
      this.dropTarget?.classList.remove("drop-over");
      target?.classList.add("drop-over");
      this.dropTarget = target;
      if (target) hapticSelect();
    }
  }

  private clearDrag() {
    this.dragGhost?.remove();
    this.dragGhost = null;
    this.dropTarget?.classList.remove("drop-over");
    this.dropTarget = null;
    this.kok.classList.remove("is-dragging");
  }

  private cancelDrag() {
    this.clearDrag();
  }

  private endDrag(x: number, y: number) {
    const altindaki = document.elementFromPoint(x, y);
    const target = altindaki?.closest<HTMLElement>("[data-drop]") ?? null;
    const kimlik = target?.dataset.drop as TargetId | undefined;
    this.clearDrag();
    if (kimlik) this.cb.onTarget(kimlik);
  }

  render(s: GameState, g: ViewInput) {
    this.myPlayer = g.net.role === "off" ? 0 : g.net.myPlayerId;
    this.sahne.guncelle(seasonForDay(s.day), s.decor);
    this.badges.day.innerHTML = `${art("ui_takvim", 18)}<span>${y(S.day)}</span><b>${s.day}</b>`;
    this.badges.hearts.innerHTML = `${art("ui_kalp", 18)}<b>${s.hearts}</b>`;
    const guestsLeft = Math.max(0, s.guestTarget - s.guestsArrived + s.guests.length);
    this.badges.misafir.innerHTML = `${art("ui_tabak", 18)}<b>${guestsLeft}</b>`;
    this.guideBtn.innerHTML = `${art(g.guideOn ? "ui_parilti" : "ui_onay", 16)}<span>${y(g.guideOn ? S.guideOn : S.rehberKapali)}</span>`;
    this.guideBtn.classList.toggle("off", !g.guideOn);
    this.sfxBtn.innerHTML = art(g.sfxOn ? "ui_ses" : "ui_sessiz", 16);
    this.sfxBtn.classList.toggle("off", !g.sfxOn);
    this.sfxBtn.title = y(S.efektler);
    this.musicBtn.innerHTML = art(g.musicOn ? "ui_muzik" : "ui_muzik_kapali", 15);
    this.musicBtn.classList.toggle("off", !g.musicOn);
    this.musicBtn.title = y(S.muzik);
    this.quitBtn.title = y(S.kaydetCik);
    // Panel açıkken üst bardaki rozetler gizlenir: hem gereksiz hem çakışıyorlardı.
    const panelOpen = s.phase !== "gun" || g.workshopOpen || g.avatarOpen;
    this.topBar.classList.toggle("hidden", panelOpen);
    // Köşedeki küme kadar yer ayır ki rozetler altına girmesin.
    this.topBar.style.paddingRight = `${this.topRight.offsetWidth + 26}px`;
    for (const b of this.langSwitch.children) {
      b.classList.toggle("active", (b as HTMLElement).dataset.dil === activeLang());
    }

    this.renderDining(s, g);
    this.renderCounter(s, g);
    this.renderHands(s);
    this.renderGuide(s, g);
    this.syncServers(s);
    this.renderOverlay(s, g);
  }

  // ------------------------------------------------------------- salon
  private renderDining(s: GameState, g: ViewInput) {
    const koltuklar: (Guest | null)[] = Array.from({ length: s.seatCount }, () => null);
    for (const m of s.guests) if (m.seat < koltuklar.length) koltuklar[m.seat] = m;

    while (this.salon.children.length > koltuklar.length) this.salon.lastElementChild?.remove();
    while (this.salon.children.length < koltuklar.length) {
      this.salon.appendChild(hand("div", "seat empty"));
    }

    koltuklar.forEach((m, i) => {
      const kap = this.salon.children[i] as HTMLElement;
      kap.dataset.color = String(i);
      if (!m) {
        if (kap.dataset.mid) {
          this.seatEls.delete(kap.dataset.mid);
          kap.dataset.mid = "";
        }
        // dataset ile işaretle: "empty" sınıfı ilk oluşturmada zaten var olduğu için
        // sınıfa bakmak içeriğin hiç basılmamasına yol açıyordu.
        if (kap.dataset.emptyBuilt !== "1") {
          kap.dataset.emptyBuilt = "1";
          kap.className = "seat empty";
          kap.innerHTML = `${art("ui_tabak", 30)}<span>${y(S.bosMasa)}</span>`;
        }
        return;
      }
      if (kap.dataset.mid !== m.id) {
        kap.dataset.mid = m.id;
        kap.dataset.emptyBuilt = "";
        kap.innerHTML = "";
        this.buildGuestCard(kap, m);
        this.seatEls.set(m.id, kap);
      }
      this.updateGuestCard(kap, m, g);
    });
  }

  private buildGuestCard(kap: HTMLElement, m: Guest) {
    kap.className = "seat filled";
    const k = CHARACTER_MAP[m.characterId];
    const balon = hand("div", "bubble");
    balon.style.display = "none";
    const face = hand("div", "face");
    const name = hand("div", "name");
    name.textContent = k ? y(k.name) : "";
    const order = hand("div", "order");
    const patience = hand("div", "mood");
    const moodLabel = hand("span", "mood-label");
    moodLabel.textContent = y(S.keyif);
    const moodTrack = hand("div", "mood-track");
    moodTrack.appendChild(hand("i"));
    patience.append(moodLabel, moodTrack);
    const tray = hand("div", "tray");
    const btn = hand("button", "serve-btn") as HTMLButtonElement;
    btn.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.cb.onServe(m.id);
    });
    kap.append(balon, face, name, order, patience, tray, btn);
    kap.dataset.drop = `misafir:${m.id}`;
    kap.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      this.cb.onTarget(`misafir:${m.id}`);
    });
  }

  private updateGuestCard(kap: HTMLElement, m: Guest, g: ViewInput) {
    kap.classList.toggle("happy", m.state === "happy");
    kap.classList.toggle("leaving", m.state === "leaving");
    const secili = g.selectedTarget === `misafir:${m.id}`;
    kap.classList.toggle("selected", secili);
    if (secili) kap.style.setProperty("--secim-renk", g.selectionColor);
    const rehberBurada = g.guideOn && g.hint?.target === `misafir:${m.id}`;
    kap.classList.toggle("guide-target", !!rehberBurada && !g.hint?.served);

    const [balon, face, , order, patience, tray, btn] = Array.from(kap.children) as HTMLElement[];
    const k = CHARACTER_MAP[m.characterId];

    if (balon) {
      if (m.line) {
        const text = y(m.line);
        if (balon.textContent !== text) balon.textContent = text;
        balon.style.display = "";
      } else balon.style.display = "none";
    }

    const ruh = moodArt(m);
    if (face && face.dataset.ruh !== ruh) {
      face.dataset.ruh = ruh;
      face.innerHTML = `${art(k?.face ?? "kar_efe", 52)}<span class="mood-badge">${art(ruh, 22)}</span>`;
    }

    const trayItems = m.tray.map((t) => t.ingredient);
    if (order) {
      const state = orderProgress(m.order, trayItems);
      const imza = m.order.join(",") + "|" + state.join(",");
      if (order.dataset.imza !== imza) {
        order.dataset.imza = imza;
        order.innerHTML = m.order
          .map(
            (yid, i) =>
              `<div class="chip${state[i] ? " tamam" : ""}">${art(dish(yid).icon, 20)}<span>${y(dish(yid).name)}</span>${state[i] ? art("ui_onay", 13) : ""}</div>`,
          )
          .join("");
      }
    }

    if (patience) {
      const bar = patience.querySelector<HTMLElement>("i");
      const r = Math.min(1, m.waited / (m.patience * 2.4));
      const keyif = 1 - r;
      if (bar) {
        bar.style.width = `${keyif * 100}%`;
        bar.style.background =
          keyif > 0.6 ? "var(--avokado)" : keyif > 0.25 ? "var(--tamago)" : "var(--zencefil)";
      }
      patience.classList.toggle("low", keyif <= 0.25);
    }

    if (tray) {
      while (tray.children.length > m.tray.length) tray.lastElementChild?.remove();
      m.tray.forEach((p, i) => {
        let d = tray.children[i] as HTMLElement | undefined;
        if (!d) {
          d = hand("div", "piece");
          tray.appendChild(d);
        }
        if (d.dataset.m !== p.ingredient) {
          d.dataset.m = p.ingredient;
          d.innerHTML = art(INGREDIENTS[p.ingredient].icon, 24);
        }
        const bekliyor = this.pendingPieces.get(m.id)?.has(i) ?? false;
        d.className = `parca p${p.placedBy + 1}${bekliyor ? "pending" : ""}`;
      });
      tray.classList.toggle("empty", m.tray.length === 0);
      tray.dataset.etiket = y(S.tray);
    }

    if (btn instanceof HTMLButtonElement) {
      const hazir = m.state === "pending" && readyToServe(m.order, trayItems);
      btn.disabled = m.state !== "pending" || m.tray.length === 0;
      btn.classList.toggle("ready", hazir);
      btn.classList.toggle("guide-target", !!(rehberBurada && g.hint?.served));
      const imza = m.state === "happy" ? "happy" : hazir ? "ready" : "empty";
      if (btn.dataset.imza !== imza + y(S.onServe)) {
        btn.dataset.imza = imza + y(S.onServe);
        btn.innerHTML =
          imza === "happy"
            ? art("ui_kalp", 18)
            : imza === "ready"
              ? `<span>${y(S.onServe)}</span>${art("ui_onay", 15)}`
              : `<span>${y(S.onServe)}</span>`;
      }
    }
  }

  // ------------------------------------------------------------- tezgâh
  /** İstasyonlar günlere göre açıldığı için tezgâh gün değişince yeniden kurulur. */
  private buildStations(day: number, ekstra: StationId[]) {
    const imza = `${day}|${[...ekstra].sort().join(",")}`;
    if (this.stationsKey === imza) return;
    this.stationsKey = imza;
    this.tezgah.innerHTML = "";
    this.stationEls.clear();
    for (const ist of stationsForDay(day, ekstra)) {
      const d = hand("div", ist.id === "mat" ? "istasyon mat" : "station");
      d.dataset.t = ist.id;
      const icon = hand("div", "icon");
      icon.innerHTML = art(ist.icon, ist.id === "mat" ? 34 : 32);
      const etiket = hand("div", "label");
      etiket.textContent = y(ist.name);
      d.append(icon, etiket);
      if (ist.id === "mat") {
        const slotlar = hand("div", "mat-slots");
        for (let i = 0; i < 3; i++) slotlar.appendChild(hand("div", "mat-slot"));
        d.appendChild(slotlar);
      }
      const progress = hand("div", "progress");
      progress.style.width = "0%";
      d.appendChild(progress);
      if (ist.id === "mat" || ist.id === "atik") d.dataset.drop = ist.id;
      d.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        this.cb.onTarget(ist.id);
      });
      this.stationEls.set(ist.id, d);
      this.tezgah.appendChild(d);
    }
  }

  private renderCounter(s: GameState, g: ViewInput) {
    this.buildStations(s.day, s.extraStations);
    for (const ist of stationsForDay(s.day, s.extraStations)) {
      const d = this.stationEls.get(ist.id);
      if (!d) continue;
      const secili = g.selectedTarget === ist.id;
      d.classList.toggle("selected", secili);
      if (secili) d.style.setProperty("--secim-renk", g.selectionColor);
      d.classList.toggle("guide-target", g.guideOn && g.hint?.target === ist.id);

      const bar = d.querySelector<HTMLElement>(".progress");
      if (bar) {
        const p = (s.progress[ist.id] ?? 0) / ist.taps;
        bar.style.width = `${Math.min(1, p) * 100}%`;
      }
      if (ist.id === "mat") {
        const slotlar = d.querySelectorAll<HTMLElement>(".mat-slot");
        const icerik = s.matResult ? [s.matResult] : s.matSlots;
        slotlar.forEach((sl, i) => {
          const m = icerik[i];
          sl.classList.toggle("filled", !!m);
          const anahtar = m ?? "";
          if (sl.dataset.m !== anahtar) {
            sl.dataset.m = anahtar;
            sl.innerHTML = m ? art(INGREDIENTS[m].icon, 20) : "";
          }
        });
      }
    }
  }

  private renderHands(s: GameState) {
    while (this.eller.children.length > s.players.length) this.eller.lastElementChild?.remove();
    s.players.forEach((o, i) => {
      let kart = this.eller.children[i] as HTMLElement | undefined;
      if (!kart) {
        kart = hand("div", "hand-card");
        const kutu = hand("div", "hand-slot");
        const bilgi = hand("div", "hand-info");
        bilgi.append(hand("div", "hand-name"), hand("div", "hand-content"), hand("div", "hand-keys"));
        kart.append(kutu, bilgi);
        this.eller.appendChild(kart);
      }
      kart.style.setProperty("--renk", o.color);
      kart.classList.toggle("mine", o.id === this.myPlayer);
      kart.classList.toggle("has-item", !!o.hand);
      if (!kart.dataset.baglandi) {
        kart.dataset.baglandi = "1";
        kart.addEventListener("pointerdown", (e) => {
          const sahip = s.players[i];
          if (!sahip?.hand || sahip.id !== this.myPlayer) return;
          e.preventDefault();
          this.startDrag(sahip.hand, e.clientX, e.clientY);
        });
      }
      const kutu = kart.children[0] as HTMLElement;
      const bilgi = kart.children[1] as HTMLElement;
      const anahtar = o.hand ?? "-";
      if (kutu.dataset.m !== anahtar) {
        kutu.dataset.m = anahtar;
        kutu.innerHTML = o.hand ? art(INGREDIENTS[o.hand].icon, 28) : `<span class="empty-hand">·</span>`;
      }
      (bilgi.children[0] as HTMLElement).textContent = o.name;
      (bilgi.children[1] as HTMLElement).textContent = o.hand ? y(INGREDIENTS[o.hand].name) : "";
      (bilgi.children[2] as HTMLElement).textContent =
        s.players.length > 1 && i > 0 ? "← → · space · shift" : "";
    });
  }

  private renderGuide(s: GameState, g: ViewInput) {
    if (s.phase !== "gun" || !g.guideOn || !g.hint) {
      this.guideBar.style.display = "none";
      return;
    }
    this.guideBar.style.display = "";
    const text = g.hint.text;
    if (this.guideBar.dataset.text !== text) {
      this.guideBar.dataset.text = text;
      this.guideBar.innerHTML = `${art("ui_parilti", 20)}<span>${text}</span>`;
      this.guideBar.classList.remove("fresh");
      void this.guideBar.offsetWidth;
      this.guideBar.classList.add("fresh");
    }
  }

  // ------------------------------------------------------------- perdeler
  private renderOverlay(s: GameState, g: ViewInput) {
    const imza = `${s.phase}:${s.day}:${s.players.length}:${s.coins}:${s.decor.length}:${g.workshopOpen ? "a" : "-"}:${g.avatarOpen ? "v" : "-"}:${g.quitOpen ? "c" : "-"}`;
    if (g.quitOpen) {
      if (this.lastOverlay !== imza) {
        const oncedenAcikti = this.overlayHost.childElementCount > 0 || this.overlaySwap;
        this.overlaySwap = false;
        this.lastOverlay = imza;
        this.overlayHost.innerHTML = "";
        const p = this.quitPanel(s);
        if (oncedenAcikti) p.classList.add("no-anim");
        this.overlayHost.appendChild(p);
      }
      return;
    }
    if (g.avatarOpen) {
      if (this.lastOverlay !== imza) {
        const oncedenAcikti = this.overlayHost.childElementCount > 0 || this.overlaySwap;
        this.overlaySwap = false;
        this.lastOverlay = imza;
        this.overlayHost.innerHTML = "";
        const ben = s.players.find((o) => o.id === this.myPlayer) ?? s.players[0];
        if (ben) {
          const p = avatarPanel(ben.avatar, {
            kaydet: (a) => this.cb.saveAvatar(a),
            kapat: () => this.cb.onCloseAvatar(),
          });
          if (oncedenAcikti) p.classList.add("no-anim");
          this.overlayHost.appendChild(p);
        }
      }
      return;
    }
    if (g.workshopOpen) {
      if (this.lastOverlay !== imza) {
        const oncedenAcikti = this.overlayHost.childElementCount > 0 || this.overlaySwap;
        this.overlaySwap = false;
        this.lastOverlay = imza;
        this.overlayHost.innerHTML = "";
        const p = workshopPanel(s.day, s.extraStations, {
          kaydet: (t) => this.cb.onSaveRecipe(t),
          sil: (id) => this.cb.onDeleteRecipe(id),
          kapat: () => this.cb.onCloseWorkshop(),
        });
        if (oncedenAcikti) p.classList.add("no-anim");
        this.overlayHost.appendChild(p);
      }
      return;
    }
    if (s.phase === "gun") {
      if (this.lastOverlay !== "") {
        this.overlayHost.innerHTML = "";
        this.lastOverlay = "";
      }
      return;
    }
    if (this.lastOverlay === imza) return;
    // Zaten bir perde açıksa yenisi solarak gelmesin: dil değişiminde
    // bir kare boyunca arkadaki oyun ekranı görünüyordu.
    const oncedenAcikti = this.overlayHost.childElementCount > 0 || this.overlaySwap;
    this.overlaySwap = false;
    this.lastOverlay = imza;
    this.overlayHost.innerHTML = "";
    const yeni = s.phase === "menu" ? this.menuPanel(s, g) : this.dayEndPanel(s);
    if (oncedenAcikti) yeni.classList.add("no-anim");
    this.overlayHost.appendChild(yeni);
  }

  private menuPanel(s: GameState, g: ViewInput): HTMLElement {
    const perde = hand("div", "overlay");
    const pano = hand("div", "pano dikey");

    const h1 = hand("h1");
    h1.innerHTML = s.day === 1 ? "Hey <span>Sushi</span>" : `${y(S.day)} <span>${s.day}</span>`;
    const alt = hand("p", "sub tight");
    alt.textContent = y(s.day === 1 ? S.girisAlt : S.gunAlt);
    pano.append(h1, alt);

    if (s.day === 1) {
      const nasil = hand("div", "howto");
      const adimlar: [string, string, string][] = [
        ["ist_pirinc", y(S.adim1Baslik), y(S.adim1)],
        ["ui_tabak", y(S.adim2Baslik), y(S.adim2)],
        ["ui_kalp", y(S.adim3Baslik), y(S.adim3)],
      ];
      for (const [icon, baslik, text] of adimlar) {
        const a = hand("div", "howto-step");
        a.innerHTML = `<div class="howto-icon">${art(icon, 34)}</div><div><b>${baslik}</b><p>${text}</p></div>`;
        nasil.appendChild(a);
      }
      pano.appendChild(nasil);

      const note = hand("p", "sub small");
      note.innerHTML = y(S.kaybetmekYok);
      pano.appendChild(note);
    }

    const menu = hand("div", "menu-row");
    for (const yid of menuForDay(s.day)) {
      const c = hand("div", "chip");
      c.innerHTML = `${art(dish(yid).icon, 20)}<span>${y(dish(yid).name)}</span>`;
      menu.appendChild(c);
    }
    pano.appendChild(menu);

    // Çevrimdışı mod seçimi — online odadayken anlamsız, gizleniyor.
    if (FEATURES.coopYerel && g.net.role === "off") {
      const mod = hand("div", "mode-select");
      mod.appendChild(sectionLabel("Kaç kişi?"));
      const kutu = hand("div", "segment");
      const tek = hand("button", `segment-dugme${s.players.length === 1 ? "active" : ""}`) as HTMLButtonElement;
      tek.textContent = "Tek kişi";
      tek.onclick = () => this.cb.onSetPlayerCount(1);
      const cift = hand("button", `segment-dugme${s.players.length === 2 ? "active" : ""}`) as HTMLButtonElement;
      cift.textContent = "İki kişi · aynı ekran";
      cift.onclick = () => this.cb.onSetPlayerCount(2);
      kutu.append(tek, cift);
      mod.appendChild(kutu);
      pano.appendChild(mod);
    }

    if (FEATURES.coopOnline) pano.appendChild(this.roomSection(g));

    const sideRow = hand("div", "panel-actions");
    const serverBtn = hand("button", "btn ikincil") as HTMLButtonElement;
    serverBtn.innerHTML = `${serverSvg(s.players[0]?.avatar ?? defaultAvatar(), 26)}<span>${y(S.garsonun)}</span>`;
    serverBtn.onclick = () => this.cb.onOpenAvatar();
    const actionRow = hand("div", "panel-actions");
    const atolye = hand("button", "btn ikincil") as HTMLButtonElement;
    atolye.innerHTML = `${art("ui_parilti", 16)}<span>${y(S.tarifAtolyesi)}</span>`;
    atolye.onclick = () => this.cb.onOpenWorkshop();

    const basla = hand("button", "btn") as HTMLButtonElement;
    if (g.net.role === "misafir") {
      basla.className = "btn pending";
      basla.innerHTML = "<span>Ev sahibi başlatacak…</span>";
      basla.disabled = true;
    } else {
      basla.innerHTML = `<span>${y(s.day === 1 ? S.tezgahiAc : S.guneBasla)}</span>${art("ui_fener", 20)}`;
      basla.onclick = () => this.cb.onStartDay();
    }
    sideRow.appendChild(serverBtn);
    actionRow.append(atolye, basla);
    pano.append(sideRow, actionRow);

    perde.appendChild(pano);
    return perde;
  }

  private dayEndPanel(s: GameState): HTMLElement {
    const perde = hand("div", "overlay");
    const pano = hand("div", "pano dikey");

    const h2 = hand("h2");
    h2.innerHTML = `${art("ui_ay", 26)}<span>${format(S.gunKapandi, { day: s.day })}</span>`;
    const alt = hand("p", "sub tight");
    alt.textContent = y(S.gunSonuAlt);

    const satirlar = hand("div", "rows");
    const ekle = (etiket: string, deger: string, vurgu = false) => {
      const r = hand("div", vurgu ? "row highlight" : "row");
      r.innerHTML = `<span>${etiket}</span><b>${deger}</b>`;
      satirlar.appendChild(r);
    };
    ekle(y(S.servisEdilen), String(s.stats.served));
    ekle(y(S.kusursuz), String(s.stats.perfect));
    if (s.players.length > 1) ekle(y(S.birlikteHazir), String(s.stats.together), true);
    if (s.stats.leftEarly > 0) ekle(y(S.vazgecen), String(s.stats.leftEarly));
    ekle(y(S.bugunKalp), `${art("ui_kalp", 16)} ${s.dayHearts}`, true);
    ekle(y(S.toplam), `${art("ui_kalp", 16)} ${s.hearts}`);

    const eylemler = hand("div", "panel-actions single");
    const btn = hand("button", "btn") as HTMLButtonElement;
    btn.innerHTML = `<span>${y(S.yarinaGec)}</span>${art("ui_ok", 18)}`;
    btn.onclick = () => this.cb.onNextDay();
    eylemler.appendChild(btn);

    pano.append(h2, alt, satirlar, this.shopSection(s), eylemler);
    perde.appendChild(pano);
    return perde;
  }

  /** Kaydet ve çık onayı — puanı da gösterir. */
  private quitPanel(s: GameState): HTMLElement {
    const perde = hand("div", "overlay");
    const pano = hand("div", "pano dikey");

    const h2 = hand("h2");
    h2.innerHTML = `${art("ui_cikis", 24)}<span>${y(S.cikisBaslik)}</span>`;
    const alt = hand("p", "sub tight");
    alt.textContent = y(S.cikisAlt);

    const satirlar = hand("div", "rows");
    const ekle = (etiket: string, deger: string, vurgu = false) => {
      const r = hand("div", vurgu ? "row highlight" : "row");
      r.innerHTML = `<span>${etiket}</span><b>${deger}</b>`;
      satirlar.appendChild(r);
    };
    ekle(y(S.day), String(s.day));
    ekle(y(S.toplamKalp), `${art("ui_kalp", 16)} ${s.hearts}`, true);
    ekle(y(S.jetonlar), `${art("ui_jeton", 16)} ${s.coins}`);
    if (s.decor.length) ekle(y(S.dukkanEsyasi), String(s.decor.length));
    const customCount = customRecipeCount();
    if (customCount) ekle(y(S.ozelTarifler), String(customCount));

    const eylemler = hand("div", "panel-actions");
    const vazgec = hand("button", "btn ikincil") as HTMLButtonElement;
    vazgec.textContent = y(S.vazgec);
    vazgec.onclick = () => this.cb.onCloseQuit();
    const cik = hand("button", "btn") as HTMLButtonElement;
    cik.innerHTML = `<span>${y(S.cikisOnay)}</span>${art("ui_cikis", 17)}`;
    cik.onclick = () => this.cb.onConfirmQuit();
    eylemler.append(vazgec, cik);

    pano.append(h2, alt, satirlar, eylemler);
    perde.appendChild(pano);
    return perde;
  }

  /** Menüdeki online oda bölümü. */
  private roomSection(g: ViewInput): HTMLElement {
    const kap = hand("div", "room-section");
    const n = g.net;

    if (n.role === "off") {
      kap.appendChild(sectionLabel("Arkadaşınla oyna"));
      const sira = hand("div", "room-row");

      const create = hand("button", "btn ikincil") as HTMLButtonElement;
      create.textContent = n.connecting ? "Bağlanıyor…" : "Oda Kur";
      create.disabled = n.connecting;
      create.onclick = () => this.cb.onCreateRoom();

      const ayirac = hand("span", "room-or");
      ayirac.textContent = "ya da";

      const grup = hand("div", "room-join");
      const giris = hand("input", "room-code") as HTMLInputElement;
      giris.placeholder = "KOD";
      giris.maxLength = 4;
      giris.oninput = () => {
        giris.value = giris.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
        join.disabled = giris.value.length !== 4;
      };
      const join = hand("button", "btn ikincil") as HTMLButtonElement;
      join.textContent = "Katıl";
      join.disabled = true;
      join.onclick = () => this.cb.onJoinRoom(giris.value);
      giris.onkeydown = (e) => {
        if (e.key === "Enter" && giris.value.length === 4) this.cb.onJoinRoom(giris.value);
      };
      grup.append(giris, join);

      sira.append(create, ayirac, grup);
      kap.appendChild(sira);

      if (n.uyari) {
        const u = hand("p", "sub small room-warning");
        u.textContent = n.uyari;
        kap.appendChild(u);
      }
      return kap;
    }

    const kutu = hand("div", "room-box");
    const leftSide = hand("div");
    leftSide.innerHTML =
      `<div class="room-label">${n.role === "host" ? "Oda kodun" : "Odadasın"}</div>` +
      `<div class="room-code-big">${n.code}</div>`;
    const rightSide = hand("div", "room-right");
    const adlar = n.role === "host" ? ["Sen (ev sahibi)", ...n.members] : ["Sen", "ev sahibi"];
    rightSide.innerHTML = `<div class="room-players">${adlar.map((a) => `<span class="room-chip">${a}</span>`).join("")}</div>`;
    const leave = hand("button", "btn ikincil ufak") as HTMLButtonElement;
    leave.textContent = "Ayrıl";
    leave.onclick = () => this.cb.onLeaveRoom();
    rightSide.appendChild(leave);
    kutu.append(leftSide, rightSide);

    const hint = hand("p", "sub small");
    hint.textContent =
      n.role === "host"
        ? "Kodu arkadaşına ver. Aynı tepsiye ikiniz de malzeme koyarsanız birlikte bonusu kazanırsınız."
        : "Ev sahibi günü başlattığında tezgâh açılır.";

    kap.append(kutu, hint);
    return kap;
  }

  /** Gün sonu dükkânı: jetonla dekor al, misafirler daha sabırlı olsun. */
  private shopSection(s: GameState): HTMLElement {
    const kap = hand("div", "shop");
    const baslik = hand("div", "shop-title");
    baslik.innerHTML = `<b>${y(S.shopSection)}</b><span class="coin">${art("ui_jeton", 16)}${s.coins}</span>`;
    kap.appendChild(baslik);

    const note = hand("p", "sub small");
    note.textContent = y(S.dukkanNot);
    kap.appendChild(note);

    const izgara = hand("div", "shop-grid");
    for (const d of DECOR_ITEMS) {
      const sahip = s.decor.includes(d.id);
      const alinabilir = !sahip && s.coins >= d.price;
      const kart = hand("button", `decor-kart${sahip ? "owned" : alinabilir ? "" : "unaffordable"}`) as HTMLButtonElement;
      kart.disabled = sahip || !alinabilir;
      kart.innerHTML =
        `<div class="decor-art">${art(d.icon, 40)}</div>` +
        `<b>${y(d.name)}</b>` +
        `<small>${y(d.description)}</small>` +
        `<span class="price">${sahip ? y(S.alindi) : `${art("ui_jeton", 13)}${d.price}`}</span>`;
      kart.onclick = () => this.cb.onBuyDecor(d.id);
      izgara.appendChild(kart);
    }
    kap.appendChild(izgara);
    return kap;
  }

  /** Dil değişimi gibi köklü değişikliklerde tüm arayüzü baştan kurar. */
  rebuild() {
    // Kurulumdan önce panel açıksa yenisi solarak gelmemeli.
    this.overlaySwap = this.overlayHost?.childElementCount > 0;
    this.stationEls.clear();
    this.seatEls.clear();
    this.servers.clear();
    this.serverHome.clear();
    this.serverBusy.clear();
    this.serverFocus.clear();
    this.pendingPieces.clear();
    this.stationsKey = "";
    this.lastOverlay = "";
    this.buildSkeleton();
  }

  /** Perdeyi bir sonraki çizimde yeniden kurmaya zorlar. */
  invalidateOverlay() {
    this.lastOverlay = "__yenile__";
  }

  // ------------------------------------------------------------- geri bildirim
  floatText(guestId: string, yazi: string, icon = "ui_kalp") {
    const kap = this.seatEls.get(guestId);
    if (!kap) return;
    const kutu = kap.getBoundingClientRect();
    const kok = this.kok.getBoundingClientRect();
    const d = hand("div", "fly");
    d.innerHTML = `<span>${yazi}</span>${art(icon, 22)}`;
    d.style.left = `${kutu.left - kok.left + kutu.width / 2}px`;
    d.style.top = `${kutu.top - kok.top + 10}px`;
    this.kok.appendChild(d);
    setTimeout(() => d.remove(), 1200);
  }

  // ------------------------------------------------------------- garson
  private syncServers(s: GameState) {
    const mevcut = new Set(s.players.map((o) => o.id));
    for (const [id, e] of this.servers) {
      if (!mevcut.has(id)) {
        e.remove();
        this.servers.delete(id);
        this.serverHome.delete(id);
      }
    }
    const kok = this.kok.getBoundingClientRect();
    // Ev konumu tezgâh panelinin hemen ÜSTÜ: panel garsonun üstünü örtmesin.
    const sarma = this.counterWrap.getBoundingClientRect();
    const n = s.players.length;

    s.players.forEach((o, i) => {
      let e = this.servers.get(o.id);
      if (!e) {
        e = hand("div", "server");
        e.innerHTML =
          `<div class="server-carry"></div>` +
          `<div class="server-body"></div>` +
          `<div class="server-name"></div>`;
        this.garsonKatman.appendChild(e);
        this.servers.set(o.id, e);
      }
      e.style.setProperty("--renk", o.color);

      // Avatar yalnızca değiştiğinde yeniden çizilir.
      const imza = JSON.stringify(o.avatar);
      if (e.dataset.avatar !== imza) {
        e.dataset.avatar = imza;
        const govde = e.querySelector<HTMLElement>(".server-body");
        if (govde) govde.innerHTML = serverSvg(o.avatar, 80);
        const adEl = e.querySelector<HTMLElement>(".server-name");
        if (adEl) adEl.textContent = o.avatar.name;
      }

      const evX = kok.width / 2 + (i - (n - 1) / 2) * 96;
      const evY = sarma.top - kok.top - 4;
      this.serverHome.set(o.id, { x: evX, y: evY });
      const odakBitis = this.serverFocus.get(o.id) ?? 0;
      if (odakBitis && performance.now() > odakBitis) this.serverFocus.delete(o.id);
      // İstasyonda çalışıyorken ya da servise gitmişken konumu ezme.
      if (!this.serverBusy.has(o.id) && !this.serverFocus.has(o.id)) {
        this.placeAt(e, evX, evY, 0.4);
      }

      // elindeki malzeme garsonun tepsisinde görünsün
      const carrying = e.firstElementChild as HTMLElement;
      const anahtar = o.hand ?? "-";
      if (carrying.dataset.m !== anahtar) {
        carrying.dataset.m = anahtar;
        carrying.innerHTML = o.hand ? art(INGREDIENTS[o.hand].icon, 26) : "";
        carrying.classList.toggle("filled", !!o.hand);
      }
    });
  }

  private placeAt(e: HTMLElement, x: number, y: number, elapsed: number) {
    e.style.transitionDuration = `${elapsed}s`;
    e.style.transform = `translate(${x}px, ${y}px) translate(-50%, -100%)`;
  }

  /** Garsonu bir istasyonun önüne kaydırır (çalışırken orada durur). */
  serverToStation(oyuncu: PlayerId, istasyon: TargetId) {
    if (this.serverBusy.has(oyuncu)) return;
    const e = this.servers.get(oyuncu);
    const target = this.stationEls.get(istasyon);
    const ev = this.serverHome.get(oyuncu);
    if (!e || !target || !ev) return;
    const kok = this.kok.getBoundingClientRect();
    const r = target.getBoundingClientRect();
    const x = r.left - kok.left + r.width / 2;
    const elapsed = this.walkDuration(e, x, ev.y);
    this.serverFocus.set(oyuncu, performance.now() + 1500);
    this.placeAt(e, x, ev.y, elapsed);
    e.classList.add("walking");
    window.setTimeout(() => e.classList.remove("walking"), elapsed * 1000 + 80);
  }

  private walkDuration(e: HTMLElement, x: number, y: number): number {
    const eski = e.style.transform.match(/translate\(([-\d.]+)px, ([-\d.]+)px\)/);
    const ex = eski ? Number(eski[1]) : x;
    const ey = eski ? Number(eski[2]) : y;
    const mesafe = Math.hypot(x - ex, y - ey);
    return Math.min(0.95, 0.26 + mesafe * 0.0013);
  }

  /**
   * Garson malzemeyi masaya götürür. Tepsi parçası, garson masaya varana
   * kadar görünmez — böylece servis "ışınlanma" değil, gerçek bir yürüyüş olur.
   */
  serverDeliver(oyuncu: PlayerId, guestId: string, parcaIndex: number, ingredient: IngredientId) {
    const e = this.servers.get(oyuncu);
    const kart = this.seatEls.get(guestId);
    const ev = this.serverHome.get(oyuncu);
    if (!e || !kart || !ev) return;

    const kume = this.pendingPieces.get(guestId) ?? new Set<number>();
    kume.add(parcaIndex);
    this.pendingPieces.set(guestId, kume);

    const kok = this.kok.getBoundingClientRect();
    const r = kart.getBoundingClientRect();
    // Kartın altında dursun: masanın ya da Servis Et butonunun üstüne binmesin.
    const x = r.left - kok.left + r.width / 2;
    const y = r.bottom - kok.top + (e.offsetHeight || 80) + 8;

    this.serverBusy.add(oyuncu);
    this.serverFocus.delete(oyuncu);
    const farewell = this.walkDuration(e, x, y);
    this.placeAt(e, x, y, farewell);
    e.classList.add("walking");

    window.setTimeout(() => {
      e.classList.remove("walking");
      // masaya varıldı: parça görünür olur, tepsi zıplar
      kume.delete(parcaIndex);
      if (kume.size === 0) this.pendingPieces.delete(guestId);
      // Bir sonraki çizimi beklemeden doğrudan göster: çizim döngüsü
      // (sekme gizliyken) durmuş olabilir.
      kart.querySelectorAll<HTMLElement>(".tray .piece")[parcaIndex]?.classList.remove("pending");
      const tray = kart.querySelector<HTMLElement>(".tray");
      if (tray) {
        tray.classList.remove("landed");
        void tray.offsetWidth;
        tray.classList.add("landed");
      }
      this.sparkle(x, y - 26, ingredient);

      window.setTimeout(() => {
        const evYeri = this.serverHome.get(oyuncu) ?? ev;
        this.placeAt(e, evYeri.x, evYeri.y, this.walkDuration(e, evYeri.x, evYeri.y));
        e.classList.add("walking");
        window.setTimeout(() => {
          e.classList.remove("walking");
          this.serverBusy.delete(oyuncu);
        }, 700);
      }, 220);
    }, farewell * 1000);
  }

  /** Teslim anında küçük bir ışıltı. */
  private sparkle(x: number, y: number, ingredient: IngredientId) {
    const d = hand("div", "deliver-spark");
    d.innerHTML = art(INGREDIENTS[ingredient].icon, 26);
    d.style.left = `${x}px`;
    d.style.top = `${y}px`;
    this.kok.appendChild(d);
    window.setTimeout(() => d.remove(), 620);
  }

  /** Malzemenin kaynaktan tepsiye/mata uçuşu. */
  flyIngredient(ingredient: IngredientId, hedefAnahtar: TargetId) {
    const hedefEl =
      hedefAnahtar === "mat"
        ? this.stationEls.get("mat")
        : this.seatEls.get(hedefAnahtar.replace("misafir:", ""))?.querySelector<HTMLElement>(".tray");
    if (!hedefEl) return;

    const kok = this.kok.getBoundingClientRect();
    const target = hedefEl.getBoundingClientRect();
    const bx = this.lastPointer.x || target.left + target.width / 2;
    const by = this.lastPointer.y || target.top;

    const g = hand("div", "ingredient-fly");
    g.innerHTML = art(INGREDIENTS[ingredient].icon, 34);
    g.style.left = `${bx - kok.left}px`;
    g.style.top = `${by - kok.top}px`;
    this.kok.appendChild(g);

    const dx = target.left + target.width / 2 - bx;
    const dy = target.top + target.height / 2 - by;
    const animasyon = g.animate(
      [
        { transform: "translate(-50%, -50%) scale(1.2) rotate(-10deg)", opacity: 1 },
        {
          transform: `translate(calc(-50% + ${dx * 0.5}px), calc(-50% + ${dy * 0.5 - 46}px)) scale(1.05) rotate(8deg)`,
          opacity: 1,
          offset: 0.55,
        },
        {
          transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0.7) rotate(0deg)`,
          opacity: 0,
        },
      ],
      { duration: 430, easing: "cubic-bezier(.35,.9,.35,1)" },
    );
    animasyon.onfinish = () => g.remove();
    hedefEl.classList.remove("landed");
    void hedefEl.offsetWidth;
    hedefEl.classList.add("landed");
  }

  /** Üretim tamamlandığında istasyonda küçük bir halka. */
  burstAt(target: TargetId) {
    const d = this.stationEls.get(target);
    if (!d) return;
    const halka = hand("div", "burst");
    d.appendChild(halka);
    setTimeout(() => halka.remove(), 520);
  }

  /** OTA güncellemesi indirildiğinde alttan çıkan şerit. */
  askForUpdate(note: { en: string; tr: string } | undefined, secim: { simdi(): void; sonra(): void }) {
    this.kok.querySelector(".update-bar")?.remove();
    const d = hand("div", "update-bar");
    const text = hand("div", "update-text");
    text.innerHTML = `<b>${y(S.guncellemeHazir)}</b>${note ? `<span>${y(note)}</span>` : ""}`;
    const sonra = hand("button", "btn ikincil ufak") as HTMLButtonElement;
    sonra.textContent = y(S.guncelleSonra);
    sonra.onclick = () => {
      d.remove();
      secim.sonra();
    };
    const simdi = hand("button", "btn ufak") as HTMLButtonElement;
    simdi.textContent = y(S.guncelleSimdi);
    simdi.onclick = () => {
      simdi.disabled = true;
      simdi.textContent = y(S.guncelleniyor);
      secim.simdi();
    };
    d.append(text, sonra, simdi);
    this.kok.appendChild(d);
  }

  toast(onMessage: string | { en: string; tr: string }) {
    this.kok.querySelector(".toast")?.remove();
    const d = hand("div", "toast");
    d.textContent = y(onMessage);
    this.kok.appendChild(d);
    setTimeout(() => d.remove(), 1500);
  }

  bump(target: TargetId) {
    const d = target.startsWith("misafir:")
      ? this.seatEls.get(target.slice(8))
      : this.stationEls.get(target);
    if (!d) return;
    d.classList.remove("pulse");
    void d.offsetWidth;
    d.classList.add("pulse");
  }
}

export function targetList(s: GameState): TargetId[] {
  const liste: TargetId[] = stationsForDay(s.day, s.extraStations).map((i) => i.id);
  const sirali = [...s.guests].sort((a, b) => a.seat - b.seat);
  for (const m of sirali) if (m.state === "pending") liste.push(`misafir:${m.id}`);
  return liste;
}

export function targetName(h: TargetId, s: GameState): string {
  if (h.startsWith("misafir:")) {
    const m = s.guests.find((x) => x.id === h.slice(8));
    const k = m ? CHARACTER_MAP[m.characterId] : undefined;
    return k ? y(k.name) : "";
  }
  const ib = STATION_MAP[h as keyof typeof STATION_MAP];
  return ib ? y(ib.name) : h;
}

/** Menüdeki oyuncu yapımı tarif sayısı. */
function customRecipeCount(): number {
  return Object.values(YEMEK_KAYDI_HAM).filter((v) => v.ozel).length;
}

function sectionLabel(text: string): HTMLElement {
  const d = document.createElement("div");
  d.className = "section-label";
  d.textContent = text;
  return d;
}

function hand<K extends keyof HTMLElementTagNameMap>(tag: K, sinif = ""): HTMLElementTagNameMap[K] {
  const d = document.createElement(tag);
  if (sinif) d.className = sinif;
  return d;
}

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
import type { Hint } from "../core/ipucu";
import type { TargetId, StationId, IngredientId, Guest, GameState, PlayerId } from "../core/types";
import { serverSvg, art } from "./art";
import { defaultAvatar } from "../core/avatar";
import { S, format, activeLang, setLang, y, type LangCode } from "../core/dil";
import { FEATURES } from "../core/ozellikler";
import { Sahne } from "./sahne";
import { hapticSelect } from "../core/titresim";
import { workshopPanel } from "./atolye-panel";
import { avatarPanel } from "./avatar-panel";
import type { Avatar } from "../core/avatar";
import type { CustomRecipe } from "../core/atolye";
import type { NetRole } from "../net/oda";

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

    const fenerler = hand("div", "fenerler");
    ([[8, 12], [72, 6], [30, 68], [88, 52], [52, 26]] as const).forEach(([x, y], i) => {
      const f = hand("div", "fener");
      f.style.left = `${x}%`;
      f.style.top = `${y}%`;
      f.style.background = PASTEL_BLOB[i % PASTEL_BLOB.length]!;
      f.style.animationDelay = `${i * 1.3}s`;
      fenerler.appendChild(f);
    });
    this.kok.appendChild(fenerler);

    const ust = el("div", "ust");
    const marka = el("div", "marka");
    marka.innerHTML = `${art("ui_fener", 22)}<span>Hey <b>Sushi</b></span>`;
    const gun = el("div", "rozet");
    const kalp = el("div", "rozet kalp");
    const misafir = el("div", "rozet misafir-rozet");
    this.rehberBtn = el("button", "rehber-btn") as HTMLButtonElement;
    this.rehberBtn.onclick = () => this.cb.rehberDegis();
    // Sağ üstte dil değiştirici — girişte ve oyun sırasında hep erişilebilir.
    this.dilBtn = el("div", "dil-anahtar");
    const dilSecenekleri: [DilKodu, string][] = [
      ["en", "EN"],
      ["tr", "TR"],
    ];
    for (const [kod, kisa] of dilSecenekleri) {
      const b = el("button", "dil-dugme") as HTMLButtonElement;
      b.dataset.dil = kod;
      b.textContent = kisa;
      b.onclick = () => {
        if (dilAktif() === kod) return;
        dilAyarla(kod);
        this.cb.dilDegis(kod);
      };
      this.dilBtn.appendChild(b);
    }

    ust.append(marka, el("div", "bosluk"), this.rehberBtn, misafir, gun, kalp);
    this.rozetler = { gun, kalp, misafir };
    this.ustBar = ust;
    this.kok.appendChild(ust);
    // Perdenin de üstünde dursun: giriş ekranında da erişilebilir olmalı.
    this.muzikBtn = el("button", "yuvarlak-dugme") as HTMLButtonElement;
    this.muzikBtn.onclick = () => this.cb.muzikDegis();
    this.sesBtn = el("button", "yuvarlak-dugme") as HTMLButtonElement;
    this.sesBtn.onclick = () => this.cb.sesDegis();
    this.cikisBtn = el("button", "yuvarlak-dugme cikis") as HTMLButtonElement;
    this.cikisBtn.innerHTML = sanat("ui_cikis", 15);
    this.cikisBtn.onclick = () => this.cb.cikisAc();

    this.ustSag = el("div", "ust-sag");
    this.ustSag.append(this.cikisBtn, this.muzikBtn, this.sesBtn, this.dilBtn);
    this.kok.appendChild(this.ustSag);

    this.salon = el("div", "salon");
    this.kok.appendChild(this.salon);

    const sarma = el("div", "tezgah-sarma");
    this.tezgahSarma = sarma;
    this.rehberBar = el("div", "rehber-bar");
    this.tezgah = el("div", "tezgah");
    this.eller = el("div", "eller");
    sarma.append(this.rehberBar, this.tezgah, this.eller);
    this.kok.appendChild(sarma);

    this.garsonKatman = el("div", "garson-katman");
    this.perdeKap = el("div", "perde-kap");
    this.surukleKatman = el("div", "surukle-katman");
    this.kok.append(this.garsonKatman, this.perdeKap, this.surukleKatman);

    // Yakalama aşaması: istasyonun kendi pointerdown'ından ÖNCE çalışmalı ki
    // üretim tamamlandığında parmağın hâlâ basılı olduğunu bilelim.
    window.addEventListener(
      "pointerdown",
      (e) => {
        this.pointerBasili = true;
        this.sonPointer = { x: e.clientX, y: e.clientY };
      },
      true,
    );
    window.addEventListener("pointermove", (e) => {
      this.sonPointer = { x: e.clientX, y: e.clientY };
      if (this.surukleHayalet) this.surukleTasi(e.clientX, e.clientY);
    });
    window.addEventListener("pointerup", (e) => {
      this.pointerBasili = false;
      if (this.surukleHayalet) this.surukleBitir(e.clientX, e.clientY);
    });
    window.addEventListener("pointercancel", () => {
      this.pointerBasili = false;
      if (this.surukleHayalet) this.surukleIptal();
    });
  }

  // ------------------------------------------------------------- sürükle bırak
  /** Üretim tamamlandığında parmak/fare hâlâ basılıysa doğrudan sürüklemeye geç. */
  uretimSurukle(malzeme: MalzemeId) {
    if (!this.pointerBasili || this.surukleHayalet) return;
    this.surukleBaslat(malzeme, this.sonPointer.x, this.sonPointer.y);
  }

  surukleBaslat(malzeme: MalzemeId, x: number, y: number) {
    if (this.surukleHayalet) return;
    const h = el("div", "suruklenen");
    h.innerHTML = sanat(MALZEMELER[malzeme].ikon, 46);
    this.surukleKatman.appendChild(h);
    this.surukleHayalet = h;
    this.kok.classList.add("surukleniyor");
    this.surukleTasi(x, y);
  }

  private surukleTasi(x: number, y: number) {
    const h = this.surukleHayalet;
    if (!h) return;
    const kutu = this.kok.getBoundingClientRect();
    h.style.left = `${x - kutu.left}px`;
    h.style.top = `${y - kutu.top}px`;

    const altindaki = document.elementFromPoint(x, y);
    const hedef = altindaki?.closest<HTMLElement>("[data-drop]") ?? null;
    if (hedef !== this.surukleHedef) {
      this.surukleHedef?.classList.remove("drop-uzerinde");
      hedef?.classList.add("drop-uzerinde");
      this.surukleHedef = hedef;
      if (hedef) titresimSecim();
    }
  }

  private surukleTemizle() {
    this.surukleHayalet?.remove();
    this.surukleHayalet = null;
    this.surukleHedef?.classList.remove("drop-uzerinde");
    this.surukleHedef = null;
    this.kok.classList.remove("surukleniyor");
  }

  private surukleIptal() {
    this.surukleTemizle();
  }

  private surukleBitir(x: number, y: number) {
    const altindaki = document.elementFromPoint(x, y);
    const hedef = altindaki?.closest<HTMLElement>("[data-drop]") ?? null;
    const kimlik = hedef?.dataset.drop as HedefId | undefined;
    this.surukleTemizle();
    if (kimlik) this.cb.hedefeTikla(kimlik);
  }

  ciz(s: OyunDurumu, g: ArayuzGirdi) {
    this.benimOyuncu = g.net.rol === "kapali" ? 0 : g.net.benId;
    this.sahne.guncelle(mevsimGun(s.gun), s.dekor);
    this.rozetler.gun.innerHTML = `${art("ui_takvim", 18)}<span>${y(S.day)}</span><b>${s.day}</b>`;
    this.rozetler.kalp.innerHTML = `${art("ui_kalp", 18)}<b>${s.hearts}</b>`;
    const kalanMisafir = Math.max(0, s.gunMisafirHedefi - s.gelenMisafir + s.misafirler.length);
    this.rozetler.misafir.innerHTML = `${art("ui_tabak", 18)}<b>${guestsLeft}</b>`;
    this.rehberBtn.innerHTML = `${art(g.guideOn ? "ui_parilti" : "ui_onay", 16)}<span>${y(g.guideOn ? S.guideOn : S.rehberKapali)}</span>`;
    this.rehberBtn.classList.toggle("kapali", !g.rehberAcik);
    this.sesBtn.innerHTML = sanat(g.sesAcik ? "ui_ses" : "ui_sessiz", 16);
    this.sesBtn.classList.toggle("kapali", !g.sesAcik);
    this.sesBtn.title = y(S.efektler);
    this.muzikBtn.innerHTML = sanat(g.muzikAcik ? "ui_muzik" : "ui_muzik_kapali", 15);
    this.muzikBtn.classList.toggle("kapali", !g.muzikAcik);
    this.muzikBtn.title = y(S.muzik);
    this.cikisBtn.title = y(S.kaydetCik);
    // Panel açıkken üst bardaki rozetler gizlenir: hem gereksiz hem çakışıyorlardı.
    const panelAcik = s.faz !== "gun" || g.atolyeAcik || g.avatarAcik;
    this.ustBar.classList.toggle("gizli", panelAcik);
    // Köşedeki küme kadar yer ayır ki rozetler altına girmesin.
    this.ustBar.style.paddingRight = `${this.topRight.offsetWidth + 26}px`;
    for (const b of this.dilBtn.children) {
      b.classList.toggle("aktif", (b as HTMLElement).dataset.dil === dilAktif());
    }

    this.cizSalon(s, g);
    this.cizTezgah(s, g);
    this.cizEller(s);
    this.cizRehber(s, g);
    this.kurGarsonlar(s);
    this.cizPerde(s, g);
  }

  // ------------------------------------------------------------- salon
  private cizSalon(s: OyunDurumu, g: ArayuzGirdi) {
    const koltuklar: (Misafir | null)[] = Array.from({ length: s.koltukSayisi }, () => null);
    for (const m of s.misafirler) if (m.koltuk < koltuklar.length) koltuklar[m.koltuk] = m;

    while (this.salon.children.length > koltuklar.length) this.salon.lastElementChild?.remove();
    while (this.salon.children.length < koltuklar.length) {
      this.salon.appendChild(el("div", "koltuk bos"));
    }

    koltuklar.forEach((m, i) => {
      const kap = this.salon.children[i] as HTMLElement;
      kap.dataset.renk = String(i);
      if (!m) {
        if (kap.dataset.mid) {
          this.koltukEl.delete(kap.dataset.mid);
          kap.dataset.mid = "";
        }
        // dataset ile işaretle: "bos" sınıfı ilk oluşturmada zaten var olduğu için
        // sınıfa bakmak içeriğin hiç basılmamasına yol açıyordu.
        if (kap.dataset.bosKuruldu !== "1") {
          kap.dataset.bosKuruldu = "1";
          kap.className = "koltuk bos";
          kap.innerHTML = `${art("ui_tabak", 30)}<span>${y(S.bosMasa)}</span>`;
        }
        return;
      }
      if (kap.dataset.mid !== m.id) {
        kap.dataset.mid = m.id;
        kap.dataset.bosKuruldu = "";
        kap.innerHTML = "";
        this.misafirIskeleti(kap, m);
        this.koltukEl.set(m.id, kap);
      }
      this.misafirGuncelle(kap, m, g);
    });
  }

  private misafirIskeleti(kap: HTMLElement, m: Misafir) {
    kap.className = "koltuk dolu";
    const k = KARAKTER_MAP[m.karakterId];
    const balon = el("div", "balon");
    balon.style.display = "none";
    const yuz = el("div", "yuz");
    const ad = el("div", "ad");
    ad.textContent = k ? y(k.ad) : "";
    const siparis = el("div", "siparis");
    const sabir = el("div", "keyif");
    const keyifEtiket = el("span", "keyif-etiket");
    keyifEtiket.textContent = y(S.keyif);
    const keyifOluk = el("div", "keyif-oluk");
    keyifOluk.appendChild(el("i"));
    sabir.append(keyifEtiket, keyifOluk);
    const tepsi = el("div", "tepsi");
    const btn = el("button", "servis-btn") as HTMLButtonElement;
    btn.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.cb.servisEt(m.id);
    });
    kap.append(balon, yuz, ad, siparis, sabir, tepsi, btn);
    kap.dataset.drop = `misafir:${m.id}`;
    kap.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      this.cb.hedefeTikla(`misafir:${m.id}`);
    });
  }

  private misafirGuncelle(kap: HTMLElement, m: Misafir, g: ArayuzGirdi) {
    kap.classList.toggle("mutlu", m.durum === "mutlu");
    kap.classList.toggle("gidiyor", m.durum === "gidiyor");
    const secili = g.seciliHedef === `misafir:${m.id}`;
    kap.classList.toggle("secili", secili);
    if (secili) kap.style.setProperty("--secim-renk", g.seciliRenk);
    const rehberBurada = g.rehberAcik && g.ipucu?.hedef === `misafir:${m.id}`;
    kap.classList.toggle("rehber-hedef", !!rehberBurada && !g.ipucu?.servis);

    const [balon, yuz, , siparis, sabir, tepsi, btn] = Array.from(kap.children) as HTMLElement[];
    const k = KARAKTER_MAP[m.karakterId];

    if (balon) {
      if (m.replik) {
        const metin = y(m.replik);
        if (balon.textContent !== metin) balon.textContent = metin;
        balon.style.display = "";
      } else balon.style.display = "none";
    }

    const ruh = ruhHaliSanat(m);
    if (yuz && yuz.dataset.ruh !== ruh) {
      yuz.dataset.ruh = ruh;
      yuz.innerHTML = `${art(k?.face ?? "kar_efe", 52)}<span class="ruh">${art(ruh, 22)}</span>`;
    }

    const tepsiMalz = m.tepsi.map((t) => t.malzeme);
    if (siparis) {
      const durum = siparisDurumu(m.siparis, tepsiMalz);
      const imza = m.siparis.join(",") + "|" + durum.join(",");
      if (siparis.dataset.imza !== imza) {
        siparis.dataset.imza = imza;
        siparis.innerHTML = m.siparis
          .map(
            (yid, i) =>
              `<div class="cip${durum[i] ? " tamam" : ""}">${art(dish(yid).icon, 20)}<span>${y(dish(yid).ad)}</span>${state[i] ? art("ui_onay", 13) : ""}</div>`,
          )
          .join("");
      }
    }

    if (sabir) {
      const bar = sabir.querySelector<HTMLElement>("i");
      const r = Math.min(1, m.bekledi / (m.sabir * 2.4));
      const keyif = 1 - r;
      if (bar) {
        bar.style.width = `${keyif * 100}%`;
        bar.style.background =
          keyif > 0.6 ? "var(--avokado)" : keyif > 0.25 ? "var(--tamago)" : "var(--zencefil)";
      }
      sabir.classList.toggle("dusuk", keyif <= 0.25);
    }

    if (tepsi) {
      while (tepsi.children.length > m.tepsi.length) tepsi.lastElementChild?.remove();
      m.tepsi.forEach((p, i) => {
        let d = tepsi.children[i] as HTMLElement | undefined;
        if (!d) {
          d = el("div", "parca");
          tepsi.appendChild(d);
        }
        if (d.dataset.m !== p.malzeme) {
          d.dataset.m = p.malzeme;
          d.innerHTML = sanat(MALZEMELER[p.malzeme].ikon, 24);
        }
        const bekliyor = this.bekleyenParcalar.get(m.id)?.has(i) ?? false;
        d.className = `parca p${p.placedBy + 1}${bekliyor ? " bekliyor" : ""}`;
      });
      tepsi.classList.toggle("bos", m.tepsi.length === 0);
      tepsi.dataset.etiket = y(S.tepsi);
    }

    if (btn instanceof HTMLButtonElement) {
      const hazir = m.durum === "bekliyor" && servisHazir(m.siparis, tepsiMalz);
      btn.disabled = m.durum !== "bekliyor" || m.tepsi.length === 0;
      btn.classList.toggle("hazir", hazir);
      btn.classList.toggle("rehber-hedef", !!(rehberBurada && g.ipucu?.servis));
      const imza = m.durum === "mutlu" ? "mutlu" : hazir ? "hazir" : "bos";
      if (btn.dataset.imza !== imza + y(S.servisEt)) {
        btn.dataset.imza = imza + y(S.servisEt);
        btn.innerHTML =
          imza === "mutlu"
            ? sanat("ui_kalp", 18)
            : imza === "hazir"
              ? `<span>${y(S.onServe)}</span>${art("ui_onay", 15)}`
              : `<span>${y(S.onServe)}</span>`;
      }
    }
  }

  // ------------------------------------------------------------- tezgâh
  /** İstasyonlar günlere göre açıldığı için tezgâh gün değişince yeniden kurulur. */
  private kurTezgah(gun: number, ekstra: IstasyonId[]) {
    const imza = `${day}|${[...ekstra].sort().join(",")}`;
    if (this.tezgahImza === imza) return;
    this.tezgahImza = imza;
    this.tezgah.innerHTML = "";
    this.istasyonEl.clear();
    for (const ist of istasyonlarGun(gun, ekstra)) {
      const d = el("div", ist.id === "mat" ? "istasyon mat" : "istasyon");
      d.dataset.t = ist.id;
      const ikon = el("div", "ikon");
      ikon.innerHTML = sanat(ist.ikon, ist.id === "mat" ? 34 : 32);
      const etiket = el("div", "etiket");
      etiket.textContent = y(ist.ad);
      d.append(ikon, etiket);
      if (ist.id === "mat") {
        const slotlar = el("div", "mat-slotlar");
        for (let i = 0; i < 3; i++) slotlar.appendChild(el("div", "mat-slot"));
        d.appendChild(slotlar);
      }
      const ilerleme = el("div", "ilerleme");
      ilerleme.style.width = "0%";
      d.appendChild(ilerleme);
      if (ist.id === "mat" || ist.id === "atik") d.dataset.drop = ist.id;
      d.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        this.cb.hedefeTikla(ist.id);
      });
      this.istasyonEl.set(ist.id, d);
      this.tezgah.appendChild(d);
    }
  }

  private cizTezgah(s: OyunDurumu, g: ArayuzGirdi) {
    this.kurTezgah(s.gun, s.ekstraIstasyon);
    for (const ist of istasyonlarGun(s.gun, s.ekstraIstasyon)) {
      const d = this.istasyonEl.get(ist.id);
      if (!d) continue;
      const secili = g.seciliHedef === ist.id;
      d.classList.toggle("secili", secili);
      if (secili) d.style.setProperty("--secim-renk", g.seciliRenk);
      d.classList.toggle("rehber-hedef", g.rehberAcik && g.ipucu?.hedef === ist.id);

      const bar = d.querySelector<HTMLElement>(".ilerleme");
      if (bar) {
        const p = (s.ilerleme[ist.id] ?? 0) / ist.tap;
        bar.style.width = `${Math.min(1, p) * 100}%`;
      }
      if (ist.id === "mat") {
        const slotlar = d.querySelectorAll<HTMLElement>(".mat-slot");
        const icerik = s.matSonuc ? [s.matSonuc] : s.matSlotlari;
        slotlar.forEach((sl, i) => {
          const m = icerik[i];
          sl.classList.toggle("dolu", !!m);
          const anahtar = m ?? "";
          if (sl.dataset.m !== anahtar) {
            sl.dataset.m = anahtar;
            sl.innerHTML = m ? sanat(MALZEMELER[m].ikon, 20) : "";
          }
        });
      }
    }
  }

  private cizEller(s: OyunDurumu) {
    while (this.eller.children.length > s.oyuncular.length) this.eller.lastElementChild?.remove();
    s.oyuncular.forEach((o, i) => {
      let kart = this.eller.children[i] as HTMLElement | undefined;
      if (!kart) {
        kart = el("div", "el-kart");
        const kutu = el("div", "el-kutu");
        const bilgi = el("div", "el-bilgi");
        bilgi.append(el("div", "el-ad"), el("div", "el-icerik"), el("div", "el-tus"));
        kart.append(kutu, bilgi);
        this.eller.appendChild(kart);
      }
      kart.style.setProperty("--renk", o.renk);
      kart.classList.toggle("benim", o.id === this.benimOyuncu);
      kart.classList.toggle("dolu-el", !!o.el);
      if (!kart.dataset.baglandi) {
        kart.dataset.baglandi = "1";
        kart.addEventListener("pointerdown", (e) => {
          const sahip = s.oyuncular[i];
          if (!sahip?.el || sahip.id !== this.benimOyuncu) return;
          e.preventDefault();
          this.surukleBaslat(sahip.el, e.clientX, e.clientY);
        });
      }
      const kutu = kart.children[0] as HTMLElement;
      const bilgi = kart.children[1] as HTMLElement;
      const anahtar = o.el ?? "-";
      if (kutu.dataset.m !== anahtar) {
        kutu.dataset.m = anahtar;
        kutu.innerHTML = o.el ? sanat(MALZEMELER[o.el].ikon, 28) : `<span class="bos-el">·</span>`;
      }
      (bilgi.children[0] as HTMLElement).textContent = o.ad;
      (bilgi.children[1] as HTMLElement).textContent = o.el ? y(MALZEMELER[o.el].ad) : "";
      (bilgi.children[2] as HTMLElement).textContent =
        s.oyuncular.length > 1 && i > 0 ? "← → · space · shift" : "";
    });
  }

  private cizRehber(s: OyunDurumu, g: ArayuzGirdi) {
    if (s.faz !== "gun" || !g.rehberAcik || !g.ipucu) {
      this.rehberBar.style.display = "none";
      return;
    }
    this.rehberBar.style.display = "";
    const metin = g.ipucu.metin;
    if (this.rehberBar.dataset.metin !== metin) {
      this.rehberBar.dataset.metin = metin;
      this.rehberBar.innerHTML = `${art("ui_parilti", 20)}<span>${text}</span>`;
      this.rehberBar.classList.remove("yeni");
      void this.rehberBar.offsetWidth;
      this.rehberBar.classList.add("yeni");
    }
  }

  // ------------------------------------------------------------- perdeler
  private cizPerde(s: OyunDurumu, g: ArayuzGirdi) {
    const imza = `${s.phase}:${s.day}:${s.players.length}:${s.coins}:${s.decor.length}:${g.workshopOpen ? "a" : "-"}:${g.avatarOpen ? "v" : "-"}:${g.quitOpen ? "c" : "-"}`;
    if (g.cikisAcik) {
      if (this.sonPerde !== imza) {
        const oncedenAcikti = this.perdeKap.childElementCount > 0 || this.perdeGecisi;
        this.perdeGecisi = false;
        this.sonPerde = imza;
        this.perdeKap.innerHTML = "";
        const p = this.cikisPanosu(s);
        if (oncedenAcikti) p.classList.add("animasyonsuz");
        this.perdeKap.appendChild(p);
      }
      return;
    }
    if (g.avatarAcik) {
      if (this.sonPerde !== imza) {
        const oncedenAcikti = this.perdeKap.childElementCount > 0 || this.perdeGecisi;
        this.perdeGecisi = false;
        this.sonPerde = imza;
        this.perdeKap.innerHTML = "";
        const ben = s.oyuncular.find((o) => o.id === this.benimOyuncu) ?? s.oyuncular[0];
        if (ben) {
          const p = avatarPaneli(ben.avatar, {
            kaydet: (a) => this.cb.avatarKaydet(a),
            kapat: () => this.cb.avatarKapat(),
          });
          if (oncedenAcikti) p.classList.add("animasyonsuz");
          this.perdeKap.appendChild(p);
        }
      }
      return;
    }
    if (g.atolyeAcik) {
      if (this.sonPerde !== imza) {
        const oncedenAcikti = this.perdeKap.childElementCount > 0 || this.perdeGecisi;
        this.perdeGecisi = false;
        this.sonPerde = imza;
        this.perdeKap.innerHTML = "";
        const p = atolyePaneli(s.gun, s.ekstraIstasyon, {
          kaydet: (t) => this.cb.tarifKaydet(t),
          sil: (id) => this.cb.tarifSil(id),
          kapat: () => this.cb.atolyeKapat(),
        });
        if (oncedenAcikti) p.classList.add("animasyonsuz");
        this.perdeKap.appendChild(p);
      }
      return;
    }
    if (s.faz === "gun") {
      if (this.sonPerde !== "") {
        this.perdeKap.innerHTML = "";
        this.sonPerde = "";
      }
      return;
    }
    if (this.sonPerde === imza) return;
    // Zaten bir perde açıksa yenisi solarak gelmesin: dil değişiminde
    // bir kare boyunca arkadaki oyun ekranı görünüyordu.
    const oncedenAcikti = this.perdeKap.childElementCount > 0 || this.perdeGecisi;
    this.perdeGecisi = false;
    this.sonPerde = imza;
    this.perdeKap.innerHTML = "";
    const yeni = s.faz === "menu" ? this.menuPanosu(s, g) : this.gunSonuPanosu(s);
    if (oncedenAcikti) yeni.classList.add("animasyonsuz");
    this.perdeKap.appendChild(yeni);
  }

  private menuPanosu(s: OyunDurumu, g: ArayuzGirdi): HTMLElement {
    const perde = el("div", "perde");
    const pano = el("div", "pano dikey");

    const h1 = el("h1");
    h1.innerHTML = s.gun === 1 ? "Hey <span>Sushi</span>" : `${y(S.day)} <span>${s.day}</span>`;
    const alt = el("p", "alt bitisik");
    alt.textContent = y(s.gun === 1 ? S.girisAlt : S.gunAlt);
    pano.append(h1, alt);

    if (s.gun === 1) {
      const nasil = el("div", "nasil");
      const adimlar: [string, string, string][] = [
        ["ist_pirinc", y(S.adim1Baslik), y(S.adim1)],
        ["ui_tabak", y(S.adim2Baslik), y(S.adim2)],
        ["ui_kalp", y(S.adim3Baslik), y(S.adim3)],
      ];
      for (const [ikon, baslik, metin] of adimlar) {
        const a = el("div", "nasil-adim");
        a.innerHTML = `<div class="nasil-ikon">${art(icon, 34)}</div><div><b>${baslik}</b><p>${text}</p></div>`;
        nasil.appendChild(a);
      }
      pano.appendChild(nasil);

      const not = el("p", "alt kucuk");
      not.innerHTML = y(S.kaybetmekYok);
      pano.appendChild(not);
    }

    const menu = el("div", "menu-satiri");
    for (const yid of menuGun(s.gun)) {
      const c = el("div", "cip");
      c.innerHTML = `${art(dish(yid).icon, 20)}<span>${y(dish(yid).ad)}</span>`;
      menu.appendChild(c);
    }
    pano.appendChild(menu);

    // Çevrimdışı mod seçimi — online odadayken anlamsız, gizleniyor.
    if (OZELLIK.coopYerel && g.net.rol === "kapali") {
      const mod = el("div", "mod-secim");
      mod.appendChild(etiketli("Kaç kişi?"));
      const kutu = el("div", "segment");
      const tek = el("button", `segment-dugme${s.players.length === 1 ? " aktif" : ""}`) as HTMLButtonElement;
      tek.textContent = "Tek kişi";
      tek.onclick = () => this.cb.oyuncuSayisiDegistir(1);
      const cift = el("button", `segment-dugme${s.players.length === 2 ? " aktif" : ""}`) as HTMLButtonElement;
      cift.textContent = "İki kişi · aynı ekran";
      cift.onclick = () => this.cb.oyuncuSayisiDegistir(2);
      kutu.append(tek, cift);
      mod.appendChild(kutu);
      pano.appendChild(mod);
    }

    if (OZELLIK.coopOnline) pano.appendChild(this.odaBolumu(g));

    const yanSira = el("div", "pano-eylemler");
    const garsonBtn = el("button", "btn ikincil") as HTMLButtonElement;
    garsonBtn.innerHTML = `${serverSvg(s.players[0]?.avatar ?? defaultAvatar(), 26)}<span>${y(S.garsonun)}</span>`;
    garsonBtn.onclick = () => this.cb.avatarAc();
    const altSira = el("div", "pano-eylemler");
    const atolye = el("button", "btn ikincil") as HTMLButtonElement;
    atolye.innerHTML = `${art("ui_parilti", 16)}<span>${y(S.tarifAtolyesi)}</span>`;
    atolye.onclick = () => this.cb.atolyeAc();

    const basla = el("button", "btn") as HTMLButtonElement;
    if (g.net.rol === "misafir") {
      basla.className = "btn bekliyor";
      basla.innerHTML = "<span>Ev sahibi başlatacak…</span>";
      basla.disabled = true;
    } else {
      basla.innerHTML = `<span>${y(s.day === 1 ? S.tezgahiAc : S.guneBasla)}</span>${art("ui_fener", 20)}`;
      basla.onclick = () => this.cb.gunBasla();
    }
    yanSira.appendChild(garsonBtn);
    altSira.append(atolye, basla);
    pano.append(yanSira, altSira);

    perde.appendChild(pano);
    return perde;
  }

  private gunSonuPanosu(s: OyunDurumu): HTMLElement {
    const perde = el("div", "perde");
    const pano = el("div", "pano dikey");

    const h2 = el("h2");
    h2.innerHTML = `${art("ui_ay", 26)}<span>${format(S.gunKapandi, { day: s.day })}</span>`;
    const alt = el("p", "alt bitisik");
    alt.textContent = y(S.gunSonuAlt);

    const satirlar = el("div", "satirlar");
    const ekle = (etiket: string, deger: string, vurgu = false) => {
      const r = el("div", vurgu ? "satir vurgu" : "satir");
      r.innerHTML = `<span>${etiket}</span><b>${deger}</b>`;
      satirlar.appendChild(r);
    };
    ekle(y(S.servisEdilen), String(s.istatistik.servis));
    ekle(y(S.kusursuz), String(s.istatistik.mukemmel));
    if (s.oyuncular.length > 1) ekle(y(S.birlikteHazir), String(s.istatistik.beraber), true);
    if (s.istatistik.kacan > 0) ekle(y(S.vazgecen), String(s.istatistik.kacan));
    ekle(y(S.bugunKalp), `${art("ui_kalp", 16)} ${s.dayHearts}`, true);
    ekle(y(S.toplam), `${art("ui_kalp", 16)} ${s.hearts}`);

    const eylemler = el("div", "pano-eylemler tek");
    const btn = el("button", "btn") as HTMLButtonElement;
    btn.innerHTML = `<span>${y(S.yarinaGec)}</span>${art("ui_ok", 18)}`;
    btn.onclick = () => this.cb.sonrakiGun();
    eylemler.appendChild(btn);

    pano.append(h2, alt, satirlar, this.dukkan(s), eylemler);
    perde.appendChild(pano);
    return perde;
  }

  /** Kaydet ve çık onayı — puanı da gösterir. */
  private cikisPanosu(s: OyunDurumu): HTMLElement {
    const perde = el("div", "perde");
    const pano = el("div", "pano dikey");

    const h2 = el("h2");
    h2.innerHTML = `${art("ui_cikis", 24)}<span>${y(S.cikisBaslik)}</span>`;
    const alt = el("p", "alt bitisik");
    alt.textContent = y(S.cikisAlt);

    const satirlar = el("div", "satirlar");
    const ekle = (etiket: string, deger: string, vurgu = false) => {
      const r = el("div", vurgu ? "satir vurgu" : "satir");
      r.innerHTML = `<span>${etiket}</span><b>${deger}</b>`;
      satirlar.appendChild(r);
    };
    ekle(y(S.gun), String(s.gun));
    ekle(y(S.toplamKalp), `${art("ui_kalp", 16)} ${s.hearts}`, true);
    ekle(y(S.jetonlar), `${art("ui_jeton", 16)} ${s.coins}`);
    if (s.dekor.length) ekle(y(S.dukkanEsyasi), String(s.dekor.length));
    const ozelSayisi = ozelTarifSayisi();
    if (ozelSayisi) ekle(y(S.ozelTarifler), String(ozelSayisi));

    const eylemler = el("div", "pano-eylemler");
    const vazgec = el("button", "btn ikincil") as HTMLButtonElement;
    vazgec.textContent = y(S.vazgec);
    vazgec.onclick = () => this.cb.cikisKapat();
    const cik = el("button", "btn") as HTMLButtonElement;
    cik.innerHTML = `<span>${y(S.cikisOnay)}</span>${art("ui_cikis", 17)}`;
    cik.onclick = () => this.cb.cikisOnayla();
    eylemler.append(vazgec, cik);

    pano.append(h2, alt, satirlar, eylemler);
    perde.appendChild(pano);
    return perde;
  }

  /** Menüdeki online oda bölümü. */
  private odaBolumu(g: ArayuzGirdi): HTMLElement {
    const kap = el("div", "oda-bolum");
    const n = g.net;

    if (n.rol === "kapali") {
      kap.appendChild(etiketli("Arkadaşınla oyna"));
      const sira = el("div", "oda-sira");

      const kur = el("button", "btn ikincil") as HTMLButtonElement;
      kur.textContent = n.baglaniyor ? "Bağlanıyor…" : "Oda Kur";
      kur.disabled = n.baglaniyor;
      kur.onclick = () => this.cb.odaKur();

      const ayirac = el("span", "oda-ayirac");
      ayirac.textContent = "ya da";

      const grup = el("div", "oda-katil-grup");
      const giris = el("input", "oda-kod") as HTMLInputElement;
      giris.placeholder = "KOD";
      giris.maxLength = 4;
      giris.oninput = () => {
        giris.value = giris.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
        katil.disabled = giris.value.length !== 4;
      };
      const katil = el("button", "btn ikincil") as HTMLButtonElement;
      katil.textContent = "Katıl";
      katil.disabled = true;
      katil.onclick = () => this.cb.odaKatil(giris.value);
      giris.onkeydown = (e) => {
        if (e.key === "Enter" && giris.value.length === 4) this.cb.odaKatil(giris.value);
      };
      grup.append(giris, katil);

      sira.append(kur, ayirac, grup);
      kap.appendChild(sira);

      if (n.uyari) {
        const u = el("p", "alt kucuk oda-uyari");
        u.textContent = n.uyari;
        kap.appendChild(u);
      }
      return kap;
    }

    const kutu = el("div", "oda-kutu");
    const solTaraf = el("div");
    solTaraf.innerHTML =
      `<div class="oda-etiket">${n.role === "host" ? "Oda kodun" : "Odadasın"}</div>` +
      `<div class="oda-kod-buyuk">${n.code}</div>`;
    const sagTaraf = el("div", "oda-sag");
    const adlar = n.rol === "host" ? ["Sen (ev sahibi)", ...n.uyeler] : ["Sen", "ev sahibi"];
    sagTaraf.innerHTML = `<div class="oda-oyuncular">${adlar.map((a) => `<span class="oda-rozet">${a}</span>`).join("")}</div>`;
    const leave = hand("button", "btn ikincil ufak") as HTMLButtonElement;
    leave.textContent = "Ayrıl";
    leave.onclick = () => this.cb.onLeaveRoom();
    rightSide.appendChild(leave);
    kutu.append(leftSide, rightSide);

    const hint = hand("p", "alt kucuk");
    hint.textContent =
      n.role === "host"
        ? "Kodu arkadaşına ver. Aynı tepsiye ikiniz de malzeme koyarsanız birlikte bonusu kazanırsınız."
        : "Ev sahibi günü başlattığında tezgâh açılır.";

    kap.append(kutu, hint);
    return kap;
  }

  /** Gün sonu dükkânı: jetonla dekor al, misafirler daha sabırlı olsun. */
  private shopSection(s: GameState): HTMLElement {
    const kap = hand("div", "dukkan");
    const baslik = hand("div", "dukkan-baslik");
    baslik.innerHTML = `<b>${y(S.shopSection)}</b><span class="jeton">${art("ui_jeton", 16)}${s.coins}</span>`;
    kap.appendChild(baslik);

    const not = el("p", "alt kucuk");
    not.textContent = y(S.dukkanNot);
    kap.appendChild(not);

    const izgara = el("div", "dukkan-izgara");
    for (const d of DEKORLAR) {
      const sahip = s.dekor.includes(d.id);
      const alinabilir = !sahip && s.jeton >= d.fiyat;
      const kart = el("button", `decor-kart${sahip ? " sahip" : alinabilir ? "" : " pahali"}`) as HTMLButtonElement;
      kart.disabled = sahip || !alinabilir;
      kart.innerHTML =
        `<div class="dekor-gorsel">${art(d.icon, 40)}</div>` +
        `<b>${y(d.ad)}</b>` +
        `<small>${y(d.description)}</small>` +
        `<span class="fiyat">${sahip ? y(S.alindi) : `${art("ui_jeton", 13)}${d.price}`}</span>`;
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
    const d = hand("div", "ucus");
    d.innerHTML = `<span>${yazi}</span>${art(icon, 22)}`;
    d.style.left = `${kutu.left - kok.left + kutu.width / 2}px`;
    d.style.top = `${kutu.top - kok.top + 10}px`;
    this.kok.appendChild(d);
    setTimeout(() => d.remove(), 1200);
  }

  // ------------------------------------------------------------- garson
  private kurGarsonlar(s: OyunDurumu) {
    const mevcut = new Set(s.oyuncular.map((o) => o.id));
    for (const [id, e] of this.garsonlar) {
      if (!mevcut.has(id)) {
        e.remove();
        this.garsonlar.delete(id);
        this.garsonEv.delete(id);
      }
    }
    const kok = this.kok.getBoundingClientRect();
    // Ev konumu tezgâh panelinin hemen ÜSTÜ: panel garsonun üstünü örtmesin.
    const sarma = this.tezgahSarma.getBoundingClientRect();
    const n = s.oyuncular.length;

    s.oyuncular.forEach((o, i) => {
      let e = this.garsonlar.get(o.id);
      if (!e) {
        e = el("div", "garson");
        e.innerHTML =
          `<div class="garson-tasidigi"></div>` +
          `<div class="garson-govde"></div>` +
          `<div class="garson-ad"></div>`;
        this.garsonKatman.appendChild(e);
        this.garsonlar.set(o.id, e);
      }
      e.style.setProperty("--renk", o.renk);

      // Avatar yalnızca değiştiğinde yeniden çizilir.
      const imza = JSON.stringify(o.avatar);
      if (e.dataset.avatar !== imza) {
        e.dataset.avatar = imza;
        const govde = e.querySelector<HTMLElement>(".garson-govde");
        if (govde) govde.innerHTML = garsonSvg(o.avatar, 80);
        const adEl = e.querySelector<HTMLElement>(".garson-ad");
        if (adEl) adEl.textContent = o.avatar.ad;
      }

      const evX = kok.width / 2 + (i - (n - 1) / 2) * 96;
      const evY = sarma.top - kok.top - 4;
      this.garsonEv.set(o.id, { x: evX, y: evY });
      const odakBitis = this.garsonOdak.get(o.id) ?? 0;
      if (odakBitis && performance.now() > odakBitis) this.garsonOdak.delete(o.id);
      // İstasyonda çalışıyorken ya da servise gitmişken konumu ezme.
      if (!this.garsonMesgul.has(o.id) && !this.garsonOdak.has(o.id)) {
        this.konumla(e, evX, evY, 0.4);
      }

      // elindeki malzeme garsonun tepsisinde görünsün
      const tasidigi = e.firstElementChild as HTMLElement;
      const anahtar = o.el ?? "-";
      if (tasidigi.dataset.m !== anahtar) {
        tasidigi.dataset.m = anahtar;
        tasidigi.innerHTML = o.el ? sanat(MALZEMELER[o.el].ikon, 26) : "";
        tasidigi.classList.toggle("dolu", !!o.el);
      }
    });
  }

  private konumla(e: HTMLElement, x: number, y: number, sure: number) {
    e.style.transitionDuration = `${elapsed}s`;
    e.style.transform = `translate(${x}px, ${y}px) translate(-50%, -100%)`;
  }

  /** Garsonu bir istasyonun önüne kaydırır (çalışırken orada durur). */
  garsonIstasyonda(oyuncu: PlayerId, istasyon: HedefId) {
    if (this.garsonMesgul.has(oyuncu)) return;
    const e = this.garsonlar.get(oyuncu);
    const hedef = this.istasyonEl.get(istasyon);
    const ev = this.garsonEv.get(oyuncu);
    if (!e || !hedef || !ev) return;
    const kok = this.kok.getBoundingClientRect();
    const r = hedef.getBoundingClientRect();
    const x = r.left - kok.left + r.width / 2;
    const sure = this.yuruyusSuresi(e, x, ev.y);
    this.garsonOdak.set(oyuncu, performance.now() + 1500);
    this.konumla(e, x, ev.y, sure);
    e.classList.add("yuruyor");
    window.setTimeout(() => e.classList.remove("yuruyor"), sure * 1000 + 80);
  }

  private yuruyusSuresi(e: HTMLElement, x: number, y: number): number {
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
  garsonTeslimat(oyuncu: PlayerId, misafirId: string, parcaIndex: number, malzeme: MalzemeId) {
    const e = this.garsonlar.get(oyuncu);
    const kart = this.koltukEl.get(misafirId);
    const ev = this.garsonEv.get(oyuncu);
    if (!e || !kart || !ev) return;

    const kume = this.bekleyenParcalar.get(misafirId) ?? new Set<number>();
    kume.add(parcaIndex);
    this.bekleyenParcalar.set(misafirId, kume);

    const kok = this.kok.getBoundingClientRect();
    const r = kart.getBoundingClientRect();
    // Kartın altında dursun: masanın ya da Servis Et butonunun üstüne binmesin.
    const x = r.left - kok.left + r.width / 2;
    const y = r.bottom - kok.top + (e.offsetHeight || 80) + 8;

    this.garsonMesgul.add(oyuncu);
    this.garsonOdak.delete(oyuncu);
    const gidis = this.yuruyusSuresi(e, x, y);
    this.konumla(e, x, y, gidis);
    e.classList.add("yuruyor");

    window.setTimeout(() => {
      e.classList.remove("yuruyor");
      // masaya varıldı: parça görünür olur, tepsi zıplar
      kume.delete(parcaIndex);
      if (kume.size === 0) this.bekleyenParcalar.delete(misafirId);
      // Bir sonraki çizimi beklemeden doğrudan göster: çizim döngüsü
      // (sekme gizliyken) durmuş olabilir.
      kart.querySelectorAll<HTMLElement>(".tepsi .parca")[parcaIndex]?.classList.remove("bekliyor");
      const tepsi = kart.querySelector<HTMLElement>(".tepsi");
      if (tepsi) {
        tepsi.classList.remove("kondu");
        void tepsi.offsetWidth;
        tepsi.classList.add("kondu");
      }
      this.parlama(x, y - 26, malzeme);

      window.setTimeout(() => {
        const evYeri = this.garsonEv.get(oyuncu) ?? ev;
        this.konumla(e, evYeri.x, evYeri.y, this.yuruyusSuresi(e, evYeri.x, evYeri.y));
        e.classList.add("yuruyor");
        window.setTimeout(() => {
          e.classList.remove("yuruyor");
          this.garsonMesgul.delete(oyuncu);
        }, 700);
      }, 220);
    }, gidis * 1000);
  }

  /** Teslim anında küçük bir ışıltı. */
  private parlama(x: number, y: number, malzeme: MalzemeId) {
    const d = el("div", "teslim-parlama");
    d.innerHTML = sanat(MALZEMELER[malzeme].ikon, 26);
    d.style.left = `${x}px`;
    d.style.top = `${y}px`;
    this.kok.appendChild(d);
    window.setTimeout(() => d.remove(), 620);
  }

  /** Malzemenin kaynaktan tepsiye/mata uçuşu. */
  malzemeUcusu(malzeme: MalzemeId, hedefAnahtar: HedefId) {
    const hedefEl =
      hedefAnahtar === "mat"
        ? this.istasyonEl.get("mat")
        : this.koltukEl.get(hedefAnahtar.replace("misafir:", ""))?.querySelector<HTMLElement>(".tepsi");
    if (!hedefEl) return;

    const kok = this.kok.getBoundingClientRect();
    const hedef = hedefEl.getBoundingClientRect();
    const bx = this.sonPointer.x || hedef.left + hedef.width / 2;
    const by = this.sonPointer.y || hedef.top;

    const g = el("div", "malzeme-ucus");
    g.innerHTML = sanat(MALZEMELER[malzeme].ikon, 34);
    g.style.left = `${bx - kok.left}px`;
    g.style.top = `${by - kok.top}px`;
    this.kok.appendChild(g);

    const dx = hedef.left + hedef.width / 2 - bx;
    const dy = hedef.top + hedef.height / 2 - by;
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
    hedefEl.classList.remove("kondu");
    void hedefEl.offsetWidth;
    hedefEl.classList.add("kondu");
  }

  /** Üretim tamamlandığında istasyonda küçük bir halka. */
  patlama(hedef: HedefId) {
    const d = this.istasyonEl.get(hedef);
    if (!d) return;
    const halka = el("div", "patlama");
    d.appendChild(halka);
    setTimeout(() => halka.remove(), 520);
  }

  /** OTA güncellemesi indirildiğinde alttan çıkan şerit. */
  guncellemeSor(not: { en: string; tr: string } | undefined, secim: { simdi(): void; sonra(): void }) {
    this.kok.querySelector(".guncelleme-serit")?.remove();
    const d = el("div", "guncelleme-serit");
    const metin = el("div", "guncelleme-metin");
    metin.innerHTML = `<b>${y(S.guncellemeHazir)}</b>${note ? `<span>${y(note)}</span>` : ""}`;
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
    this.kok.querySelector(".uyari")?.remove();
    const d = hand("div", "uyari");
    d.textContent = y(onMessage);
    this.kok.appendChild(d);
    setTimeout(() => d.remove(), 1500);
  }

  bump(target: TargetId) {
    const d = target.startsWith("misafir:")
      ? this.seatEls.get(target.slice(8))
      : this.stationEls.get(target);
    if (!d) return;
    d.classList.remove("calisti");
    void d.offsetWidth;
    d.classList.add("calisti");
  }
}

export function targetList(s: GameState): TargetId[] {
  const liste: TargetId[] = stationsForDay(s.day, s.extraStations).map((i) => i.id);
  const sirali = [...s.guests].sort((a, b) => a.seat - b.seat);
  for (const m of sirali) if (m.state === "bekliyor") liste.push(`misafir:${m.id}`);
  return liste;
}

export function hedefAdi(h: HedefId, s: OyunDurumu): string {
  if (h.startsWith("misafir:")) {
    const m = s.misafirler.find((x) => x.id === h.slice(8));
    const k = m ? KARAKTER_MAP[m.karakterId] : undefined;
    return k ? y(k.ad) : "";
  }
  const ib = ISTASYON_MAP[h as keyof typeof ISTASYON_MAP];
  return ib ? y(ib.ad) : h;
}

/** Menüdeki oyuncu yapımı tarif sayısı. */
function ozelTarifSayisi(): number {
  return Object.values(YEMEK_KAYDI_HAM).filter((v) => v.ozel).length;
}

function etiketli(metin: string): HTMLElement {
  const d = document.createElement("div");
  d.className = "bolum-etiket";
  d.textContent = metin;
  return d;
}

function el<K extends keyof HTMLElementTagNameMap>(tag: K, sinif = ""): HTMLElementTagNameMap[K] {
  const d = document.createElement(tag);
  if (sinif) d.className = sinif;
  return d;
}

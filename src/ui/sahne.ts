/**
 * Arka plan sahnesi: mevsime göre gökyüzü, tepeler, deniz, havada süzülen
 * parçacıklar ve satın alınmış dükkân dekorları.
 * Tamamen dekoratif — oyun mantığına dokunmaz.
 */
import { DEKOR_MAP, type Mevsim } from "../core/content";
import { y } from "../core/dil";
import { sanat } from "./art";

const PARCACIK_SAYISI = 16;

export class Sahne {
  private kok: HTMLElement;
  private gok!: HTMLElement;
  private manzara!: HTMLElement;
  private parcaciklar!: HTMLElement;
  private dekorKatman!: HTMLElement;
  private sonMevsim = "";
  private sonDekor = "";

  constructor(ana: HTMLElement) {
    this.kok = document.createElement("div");
    this.kok.className = "sahne";
    this.gok = div("gok");
    this.manzara = div("manzara");
    this.parcaciklar = div("parcaciklar");
    this.dekorKatman = div("dekor-katman");
    this.kok.append(this.gok, this.manzara, this.parcaciklar, this.dekorKatman);
    ana.appendChild(this.kok);
  }

  guncelle(mevsim: Mevsim, dekor: string[]) {
    if (this.sonMevsim !== mevsim.id) {
      this.sonMevsim = mevsim.id;
      this.gok.style.background = `linear-gradient(180deg, ${mevsim.gok[0]} 0%, ${mevsim.gok[1]} 46%, ${mevsim.gok[2]} 100%)`;
      this.manzara.innerHTML = manzaraSvg(mevsim);
      this.kurParcaciklar(mevsim);
    }
    const imza = dekor.join(",");
    if (this.sonDekor !== imza) {
      this.sonDekor = imza;
      this.kurDekor(dekor);
    }
  }

  private kurParcaciklar(mevsim: Mevsim) {
    this.parcaciklar.innerHTML = "";
    this.parcaciklar.dataset.tip = mevsim.parcacik;
    for (let i = 0; i < PARCACIK_SAYISI; i++) {
      const p = div(`parcacik ${mevsim.parcacik}`);
      const boyut = mevsim.parcacik === "kar" ? 4 + Math.random() * 5 : 6 + Math.random() * 7;
      p.style.width = `${boyut}px`;
      p.style.height = `${mevsim.parcacik === "yaprak" ? boyut * 0.7 : boyut}px`;
      p.style.left = `${Math.random() * 100}%`;
      p.style.background = mevsim.parcacikRenk[i % mevsim.parcacikRenk.length]!;
      p.style.animationDuration = `${9 + Math.random() * 12}s`;
      p.style.animationDelay = `${-Math.random() * 20}s`;
      p.style.setProperty("--sapma", `${(Math.random() * 2 - 1) * 70}px`);
      this.parcaciklar.appendChild(p);
    }
  }

  private kurDekor(dekor: string[]) {
    this.dekorKatman.innerHTML = "";
    const sayac: Record<string, number> = { sol: 0, sag: 0, tavan: 0, tezgah: 0 };
    for (const id of dekor) {
      const d = DEKOR_MAP[id];
      if (!d) continue;
      const n = sayac[d.yer] ?? 0;
      sayac[d.yer] = n + 1;
      const e = div(`dekor dekor-${d.yer}`);
      e.style.setProperty("--sira", String(n));
      e.title = y(d.ad);
      e.innerHTML = sanat(d.ikon, d.yer === "tavan" ? 64 : 74);
      this.dekorKatman.appendChild(e);
    }
  }
}

function manzaraSvg(m: Mevsim): string {
  // Not: yolların yatay toplamı tam 100 olmalı, yoksa manzara viewBox'ın
  // sağ kenarına ulaşmaz ve ekranda dikey bir kesik olarak görünür.
  return `<svg viewBox="0 0 100 46" preserveAspectRatio="none" aria-hidden="true">
    <path d="M0 24c10-9 18-3 26-8s14 3 22-2 16 5 22 1 18-7 30-6V46H0Z" fill="${m.tepeUzak}"/>
    <path d="M0 30c9-6 15-1 23-6s15 4 23 0 15 3 22 1 22-6 32-4V46H0Z" fill="${m.tepe}"/>
    <path d="M0 36h100v10H0z" fill="${m.deniz}"/>
    <path d="M0 36c8 2 14-2 22 0s14 2 22 0 14 2 22 0 20 1 34 0V46H0Z" fill="${m.deniz}" opacity=".7"/>
  </svg>`;
}

function div(sinif: string): HTMLElement {
  const d = document.createElement("div");
  d.className = sinif;
  return d;
}

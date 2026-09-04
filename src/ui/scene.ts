/**
 * Arka plan sahnesi: mevsime göre gökyüzü, tepeler, deniz, havada süzülen
 * parçacıklar ve satın alınmış dükkân dekorları.
 * Tamamen dekoratif — oyun mantığına dokunmaz.
 */
import { DECOR_MAP, type Season } from "../core/content";
import { y } from "../core/i18n";
import { art } from "./art";

const PARTICLE_COUNT = 16;

export class Sahne {
  private kok: HTMLElement;
  private sky!: HTMLElement;
  private manzara!: HTMLElement;
  private parcaciklar!: HTMLElement;
  private decorLayer!: HTMLElement;
  private lastSeason = "";
  private lastDecor = "";

  constructor(ana: HTMLElement) {
    this.kok = document.createElement("div");
    this.kok.className = "scene";
    this.sky = div("sky");
    this.manzara = div("scenery");
    this.parcaciklar = div("particles");
    this.decorLayer = div("decor-layer");
    this.kok.append(this.sky, this.manzara, this.parcaciklar, this.decorLayer);
    ana.appendChild(this.kok);
  }

  update(season: Season, decor: string[]) {
    if (this.lastSeason !== season.id) {
      this.lastSeason = season.id;
      this.sky.style.background = `linear-gradient(180deg, ${season.sky[0]} 0%, ${season.sky[1]} 46%, ${season.sky[2]} 100%)`;
      this.manzara.innerHTML = sceneryScg(season);
      this.buildParticles(season);
    }
    const imza = decor.join(",");
    if (this.lastDecor !== imza) {
      this.lastDecor = imza;
      this.buildDecor(decor);
    }
  }

  private buildParticles(season: Season) {
    this.parcaciklar.innerHTML = "";
    this.parcaciklar.dataset.kind = season.particle;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = div(`particle ${season.particle}`);
      const boyut = season.particle === "kar" ? 4 + Math.random() * 5 : 6 + Math.random() * 7;
      p.style.width = `${boyut}px`;
      p.style.height = `${season.particle === "yaprak" ? boyut * 0.7 : boyut}px`;
      p.style.left = `${Math.random() * 100}%`;
      p.style.background = season.particleColors[i % season.particleColors.length]!;
      p.style.animationDuration = `${9 + Math.random() * 12}s`;
      p.style.animationDelay = `${-Math.random() * 20}s`;
      p.style.setProperty("--sapma", `${(Math.random() * 2 - 1) * 70}px`);
      this.parcaciklar.appendChild(p);
    }
  }

  private buildDecor(decor: string[]) {
    this.decorLayer.innerHTML = "";
    const sayac: Record<string, number> = { sol: 0, sag: 0, tavan: 0, counterRow: 0 };
    for (const id of decor) {
      const d = DECOR_MAP[id];
      if (!d) continue;
      const n = sayac[d.spot] ?? 0;
      sayac[d.spot] = n + 1;
      const e = div(`decor decor-${d.spot}`);
      e.style.setProperty("--sira", String(n));
      e.title = y(d.name);
      e.innerHTML = art(d.icon, d.spot === "tavan" ? 64 : 74);
      this.decorLayer.appendChild(e);
    }
  }
}

function sceneryScg(m: Season): string {
  // Not: yolların yatay toplamı tam 100 olmalı, yoksa manzara viewBox'ın
  // sağ kenarına ulaşmaz ve ekranda dikey bir kesik olarak görünür.
  return `<svg viewBox="0 0 100 46" preserveAspectRatio="none" aria-hidden="true">
    <path d="M0 24c10-9 18-3 26-8s14 3 22-2 16 5 22 1 18-7 30-6V46H0Z" fill="${m.farHills}"/>
    <path d="M0 30c9-6 15-1 23-6s15 4 23 0 15 3 22 1 22-6 32-4V46H0Z" fill="${m.hills}"/>
    <path d="M0 36h100v10H0z" fill="${m.sea}"/>
    <path d="M0 36c8 2 14-2 22 0s14 2 22 0 14 2 22 0 20 1 34 0V46H0Z" fill="${m.sea}" opacity=".7"/>
  </svg>`;
}

function div(sinif: string): HTMLElement {
  const d = document.createElement("div");
  d.className = sinif;
  return d;
}

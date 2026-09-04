/** Tarif Atölyesi paneli — oyuncunun kendi suşisini tasarladığı ekran. */
import { INGREDIENTS } from "../core/content";
import {
  GARNISHES,
  GARNISH_LIMIT,
  FILLING_LIMIT,
  BASES,
  BASE_MAP,
  type GarnishId,
  type CustomRecipe,
  type BaseId,
  allRecipes,
  fillingOptions,
  stationsRecipeUnlocks,
  recipeArt,
  recipeNeeds,
  recipeHearts,
  recipeNameTaken,
} from "../core/workshop";
import type { StationId, IngredientId } from "../core/types";
import { art } from "./art";
import { S, format, y } from "../core/i18n";

export interface WorkshopCallbacks {
  kaydet(t: Omit<CustomRecipe, "id">): void;
  sil(id: string): void;
  kapat(): void;
}

interface Draft {
  base: BaseId;
  filling: IngredientId[];
  garnish: GarnishId[];
  ad: string;
  story: string;
}

export function workshopPanel(
  day: number,
  extraStations: StationId[],
  cb: WorkshopCallbacks,
): HTMLElement {
  const taslak: Draft = { base: "nigiri", filling: [], garnish: [], ad: "", story: "" };

  const perde = hand("div", "perde");
  const pano = hand("div", "pano atolye-pano");

  const baslik = hand("h2");
  baslik.innerHTML = `${art("ui_parilti", 24)}<span>${y(S.atolyeBaslik)}</span>`;
  const alt = hand("p", "alt");
  alt.textContent = y(S.atolyeAlt);
  pano.append(baslik, alt);

  // --- önizleme
  const onizleme = hand("div", "atolye-onizleme");
  const gorsel = hand("div", "atolye-gorsel");
  const bilgi = hand("div", "atolye-bilgi");
  onizleme.append(gorsel, bilgi);
  pano.appendChild(onizleme);

  // --- taban
  pano.appendChild(sectionTitle(y(S.base)));
  const baseRow = hand("div", "secim-sira");
  for (const t of BASES) {
    const b = hand("button", "secim") as HTMLButtonElement;
    b.dataset.id = t.id;
    b.innerHTML = `<b>${y(t.ad)}</b><small>${y(t.description)}</small>`;
    b.onclick = () => {
      taslak.base = t.id;
      taslak.filling = [];
      render();
    };
    baseRow.appendChild(b);
  }
  pano.appendChild(baseRow);

  // --- iç malzeme
  const fillingTitle = sectionTitle(format(S.icMalzeme, { n: FILLING_LIMIT }));
  pano.appendChild(fillingTitle);
  const fillingRow = hand("div", "secim-sira sarmali");
  pano.appendChild(fillingRow);

  // --- garnitür
  pano.appendChild(sectionTitle(format(S.garnish, { n: GARNISH_LIMIT })));
  const garnishRow = hand("div", "secim-sira sarmali");
  for (const g of GARNISHES) {
    const b = hand("button", "secim kucuk") as HTMLButtonElement;
    b.dataset.id = g.id;
    b.innerHTML = `<b>${y(g.ad)}</b>${g.hearts ? `<small>+${g.hearts}</small>` : ""}`;
    b.onclick = () => {
      const secili = taslak.garnish.includes(g.id);
      if (secili) taslak.garnish = taslak.garnish.filter((x) => x !== g.id);
      else if (taslak.garnish.length < GARNISH_LIMIT) taslak.garnish.push(g.id);
      render();
    };
    garnishRow.appendChild(b);
  }
  pano.appendChild(garnishRow);

  // --- isim & hikâye
  pano.appendChild(sectionTitle(y(S.isimVeHikaye)));
  const nameInput = hand("input", "atolye-giris") as HTMLInputElement;
  nameInput.placeholder = y(S.tarifAdiIpucu);
  nameInput.maxLength = 28;
  nameInput.autocomplete = "off";
  nameInput.oninput = () => {
    taslak.ad = nameInput.value;
    render();
  };
  const storyInput = hand("input", "atolye-giris") as HTMLInputElement;
  storyInput.placeholder = y(S.kisaNot);
  storyInput.maxLength = 80;
  storyInput.autocomplete = "off";
  storyInput.oninput = () => {
    taslak.story = storyInput.value;
  };
  pano.append(nameInput, storyInput);

  const unlockNote = hand("div", "acilacak-bilgi");
  pano.appendChild(unlockNote);

  // --- kayıtlı tarifler
  const savedBox = hand("div", "atolye-kayitli");
  pano.appendChild(savedBox);

  // --- butonlar
  const sira = hand("div", "btn-sira");
  const saveBtn = hand("button", "btn") as HTMLButtonElement;
  saveBtn.textContent = y(S.menuyeEkle);
  saveBtn.onclick = () => {
    if (saveBtn.disabled) return;
    cb.kaydet({
      ad: taslak.ad.trim(),
      story: taslak.story.trim(),
      base: taslak.base,
      filling: [...taslak.filling],
      garnish: taslak.garnish,
      day,
    });
  };
  const closeBtn = hand("button", "btn ikincil") as HTMLButtonElement;
  closeBtn.textContent = y(S.kapat);
  closeBtn.onclick = () => cb.kapat();
  sira.append(closeBtn, saveBtn);
  pano.appendChild(sira);

  perde.appendChild(pano);

  function render() {
    // taban seçimi
    for (const b of baseRow.children) {
      b.classList.toggle("active", (b as HTMLElement).dataset.id === taslak.base);
    }

    // iç malzemeler tabana göre
    const secenekler = fillingOptions(day, taslak.base, extraStations);
    fillingRow.innerHTML = "";
    if (secenekler.length === 0) {
      const bos = hand("p", "alt kucuk");
      bos.textContent = y(S.malzemeYok);
      fillingRow.appendChild(bos);
    }
    for (const { ingredient: mid, kilitli } of secenekler) {
      const secili = taslak.filling.includes(mid);
      const dolu = !secili && taslak.filling.length >= FILLING_LIMIT;
      const b = hand("button", `secim kucuk${secili ? " aktif" : ""}${kilitli ? " kilitli" : ""}`) as HTMLButtonElement;
      b.disabled = dolu;
      if (kilitli) b.title = y(S.kilitliMalzeme);
      b.innerHTML = `${art(INGREDIENTS[mid].icon, 22)}<b>${y(INGREDIENTS[mid].ad)}</b>${kilitli ? `<span class="lock">${art("ui_kilit", 12)}</span>` : ""}`;
      b.onclick = () => {
        if (secili) taslak.filling = taslak.filling.filter((x) => x !== mid);
        else if (taslak.filling.length < FILLING_LIMIT) taslak.filling.push(mid);
        render();
      };
      fillingRow.appendChild(b);
    }

    for (const b of garnishRow.children) {
      const id = (b as HTMLElement).dataset.id as GarnishId;
      const secili = taslak.garnish.includes(id);
      b.classList.toggle("active", secili);
      (b as HTMLButtonElement).disabled = !secili && taslak.garnish.length >= GARNISH_LIMIT;
    }

    // önizleme
    const needs = recipeNeeds(taslak);
    const hearts = recipeHearts(taslak);
    gorsel.innerHTML = taslak.filling.length
      ? `<svg class="sv" viewBox="0 0 48 48" width="96" height="96">${recipeArt(taslak)}</svg>`
      : `<span class="workshop-empty">?</span>`;
    bilgi.innerHTML =
      `<b>${taslak.ad.trim() || y(S.isimsizTarif)}</b>` +
      `<div class="workshop-needs">${needs.map((g2) => `<span class="chip">${art(INGREDIENTS[g2].icon, 18)}<span>${y(INGREDIENTS[g2].ad)}</span></span>`).join("")}</div>` +
      `<div class="workshop-value">${art("ui_kalp", 16)}<span>${format(S.kalpBirimi, { n: hearts })}</span> · ${y(BASE_MAP[taslak.base].ad)}</div>`;

    // kayıtlı liste
    const liste = allRecipes();
    savedBox.innerHTML = "";
    if (liste.length) {
      savedBox.appendChild(sectionTitle(format(S.kayitliTarifler, { n: liste.length })));
      const izgara = hand("div", "kayitli-izgara");
      for (const t of liste) {
        const kart = hand("div", "kayitli-kart");
        kart.innerHTML =
          `<svg class="sv" viewBox="0 0 48 48" width="34" height="34">${recipeArt(t)}</svg>` +
          `<span>${t.ad}</span>`;
        const sil = hand("button", "kayitli-sil") as HTMLButtonElement;
        sil.textContent = "×";
        sil.title = y(S.menudenKaldir);
        sil.onclick = () => cb.sil(t.id);
        kart.appendChild(sil);
        izgara.appendChild(kart);
      }
      savedBox.appendChild(izgara);
    }

    // kaydet durumu
    const acilacak = stationsRecipeUnlocks(taslak, day, extraStations);
    unlockNote.innerHTML = acilacak.length
      ? `${art("ui_kilit", 13)}<span>${format(S.istasyonAcilacak, { n: acilacak.length })}</span>`
      : "";
    unlockNote.style.display = acilacak.length ? "" : "none";

    const adTamam = taslak.ad.trim().length >= 2;
    const cakisma = adTamam && recipeNameTaken(taslak.ad);
    saveBtn.disabled = !adTamam || taslak.filling.length === 0 || cakisma;
    saveBtn.textContent = y(cakisma ? S.isimKullaniliyor : S.menuyeEkle);
  }

  render();
  return perde;
}

function sectionTitle(text: string): HTMLElement {
  const d = hand("div", "atolye-bolum");
  d.textContent = text;
  return d;
}

function hand<K extends keyof HTMLElementTagNameMap>(tag: K, sinif = ""): HTMLElementTagNameMap[K] {
  const d = document.createElement(tag);
  if (sinif) d.className = sinif;
  return d;
}

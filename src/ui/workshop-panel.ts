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
  name: string;
  story: string;
}

export function workshopPanel(
  day: number,
  extraStations: StationId[],
  cb: WorkshopCallbacks,
): HTMLElement {
  const taslak: Draft = { base: "nigiri", filling: [], garnish: [], name: "", story: "" };

  const perde = hand("div", "overlay");
  const pano = hand("div", "panel workshop-panel");

  const baslik = hand("h2");
  baslik.innerHTML = `${art("ui_parilti", 24)}<span>${y(S.atolyeBaslik)}</span>`;
  const alt = hand("p", "sub");
  alt.textContent = y(S.atolyeAlt);
  pano.append(baslik, alt);

  // --- önizleme
  const onizleme = hand("div", "workshop-preview");
  const gorsel = hand("div", "workshop-art");
  const bilgi = hand("div", "workshop-info");
  onizleme.append(gorsel, bilgi);
  pano.appendChild(onizleme);

  // --- taban
  pano.appendChild(sectionTitle(y(S.base)));
  const baseRow = hand("div", "option-row");
  for (const t of BASES) {
    const b = hand("button", "option") as HTMLButtonElement;
    b.dataset.id = t.id;
    b.innerHTML = `<b>${y(t.name)}</b><small>${y(t.description)}</small>`;
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
  const fillingRow = hand("div", "option-row wrap");
  pano.appendChild(fillingRow);

  // --- garnitür
  pano.appendChild(sectionTitle(format(S.garnish, { n: GARNISH_LIMIT })));
  const garnishRow = hand("div", "option-row wrap");
  for (const g of GARNISHES) {
    const b = hand("button", "option small") as HTMLButtonElement;
    b.dataset.id = g.id;
    b.innerHTML = `<b>${y(g.name)}</b>${g.hearts ? `<small>+${g.hearts}</small>` : ""}`;
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
  const nameInput = hand("input", "workshop-input") as HTMLInputElement;
  nameInput.placeholder = y(S.tarifAdiIpucu);
  nameInput.maxLength = 28;
  nameInput.autocomplete = "off";
  nameInput.oninput = () => {
    taslak.name = nameInput.value;
    render();
  };
  const storyInput = hand("input", "workshop-input") as HTMLInputElement;
  storyInput.placeholder = y(S.kisaNot);
  storyInput.maxLength = 80;
  storyInput.autocomplete = "off";
  storyInput.oninput = () => {
    taslak.story = storyInput.value;
  };
  pano.append(nameInput, storyInput);

  const unlockNote = hand("div", "unlock-note");
  pano.appendChild(unlockNote);

  // --- kayıtlı tarifler
  const savedBox = hand("div", "workshop-saved");
  pano.appendChild(savedBox);

  // --- butonlar
  const sira = hand("div", "btn-row");
  const saveBtn = hand("button", "btn") as HTMLButtonElement;
  saveBtn.textContent = y(S.menuyeEkle);
  saveBtn.onclick = () => {
    if (saveBtn.disabled) return;
    cb.kaydet({
      name: taslak.name.trim(),
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
      const bos = hand("p", "sub small");
      bos.textContent = y(S.malzemeYok);
      fillingRow.appendChild(bos);
    }
    for (const { ingredient: mid, kilitli } of secenekler) {
      const secili = taslak.filling.includes(mid);
      const dolu = !secili && taslak.filling.length >= FILLING_LIMIT;
      const b = hand("button", `secim kucuk${secili ? "active" : ""}${kilitli ? "locked" : ""}`) as HTMLButtonElement;
      b.disabled = dolu;
      if (kilitli) b.title = y(S.kilitliMalzeme);
      b.innerHTML = `${art(INGREDIENTS[mid].icon, 22)}<b>${y(INGREDIENTS[mid].name)}</b>${kilitli ? `<span class="lock">${art("ui_kilit", 12)}</span>` : ""}`;
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
      `<b>${taslak.name.trim() || y(S.isimsizTarif)}</b>` +
      `<div class="workshop-needs">${needs.map((g2) => `<span class="chip">${art(INGREDIENTS[g2].icon, 18)}<span>${y(INGREDIENTS[g2].name)}</span></span>`).join("")}</div>` +
      `<div class="workshop-value">${art("ui_kalp", 16)}<span>${format(S.kalpBirimi, { n: hearts })}</span> · ${y(BASE_MAP[taslak.base].name)}</div>`;

    // kayıtlı liste
    const liste = allRecipes();
    savedBox.innerHTML = "";
    if (liste.length) {
      savedBox.appendChild(sectionTitle(format(S.kayitliTarifler, { n: liste.length })));
      const izgara = hand("div", "saved-grid");
      for (const t of liste) {
        const kart = hand("div", "saved-card");
        kart.innerHTML =
          `<svg class="sv" viewBox="0 0 48 48" width="34" height="34">${recipeArt(t)}</svg>` +
          `<span>${t.name}</span>`;
        const sil = hand("button", "saved-remove") as HTMLButtonElement;
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

    const adTamam = taslak.name.trim().length >= 2;
    const cakisma = adTamam && recipeNameTaken(taslak.name);
    saveBtn.disabled = !adTamam || taslak.filling.length === 0 || cakisma;
    saveBtn.textContent = y(cakisma ? S.isimKullaniliyor : S.menuyeEkle);
  }

  render();
  return perde;
}

function sectionTitle(text: string): HTMLElement {
  const d = hand("div", "workshop-section");
  d.textContent = text;
  return d;
}

function hand<K extends keyof HTMLElementTagNameMap>(tag: K, sinif = ""): HTMLElementTagNameMap[K] {
  const d = document.createElement(tag);
  if (sinif) d.className = sinif;
  return d;
}

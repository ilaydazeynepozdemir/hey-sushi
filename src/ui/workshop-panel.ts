/** Tarif Atölyesi paneli — oyuncunun kendi suşisini tasarladığı ekran. */
import { ingredient } from "../core/content";
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
  saveLabel(t: Omit<CustomRecipe, "id">): void;
  removeBtn(id: string): void;
  closeLabel(): void;
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
  const draft: Draft = { base: "nigiri", filling: [], garnish: [], name: "", story: "" };

  const overlay = hand("div", "overlay");
  const panel = hand("div", "panel workshop-panel");

  const baslik = hand("h2");
  baslik.innerHTML = `${art("ui_parilti", 24)}<span>${y(S.workshopTitle)}</span>`;
  const alt = hand("p", "sub");
  alt.textContent = y(S.workshopSub);
  panel.append(baslik, alt);

  // --- önizleme
  const onizleme = hand("div", "workshop-preview");
  const gorsel = hand("div", "workshop-art");
  const bilgi = hand("div", "workshop-info");
  onizleme.append(gorsel, bilgi);
  panel.appendChild(onizleme);

  // --- taban
  panel.appendChild(sectionTitle(y(S.base)));
  const baseRow = hand("div", "option-row");
  for (const t of BASES) {
    const b = hand("button", "option") as HTMLButtonElement;
    b.dataset.id = t.id;
    b.innerHTML = `<b>${y(t.name)}</b><small>${y(t.description)}</small>`;
    b.onclick = () => {
      draft.base = t.id;
      draft.filling = [];
      render();
    };
    baseRow.appendChild(b);
  }
  panel.appendChild(baseRow);

  // --- iç malzeme
  const fillingTitle = sectionTitle(format(S.fillingLabel, { n: FILLING_LIMIT }));
  panel.appendChild(fillingTitle);
  const fillingRow = hand("div", "option-row wrap");
  panel.appendChild(fillingRow);

  // --- garnitür
  panel.appendChild(sectionTitle(format(S.garnish, { n: GARNISH_LIMIT })));
  const garnishRow = hand("div", "option-row wrap");
  for (const g of GARNISHES) {
    const b = hand("button", "option small") as HTMLButtonElement;
    b.dataset.id = g.id;
    b.innerHTML = `<b>${y(g.name)}</b>${g.hearts ? `<small>+${g.hearts}</small>` : ""}`;
    b.onclick = () => {
      const secili = draft.garnish.includes(g.id);
      if (secili) draft.garnish = draft.garnish.filter((x) => x !== g.id);
      else if (draft.garnish.length < GARNISH_LIMIT) draft.garnish.push(g.id);
      render();
    };
    garnishRow.appendChild(b);
  }
  panel.appendChild(garnishRow);

  // --- isim & hikâye
  panel.appendChild(sectionTitle(y(S.nameAndNote)));
  const nameInput = hand("input", "workshop-input") as HTMLInputElement;
  nameInput.placeholder = y(S.recipeNamePlaceholder);
  nameInput.maxLength = 28;
  nameInput.autocomplete = "off";
  nameInput.oninput = () => {
    draft.name = nameInput.value;
    render();
  };
  const storyInput = hand("input", "workshop-input") as HTMLInputElement;
  storyInput.placeholder = y(S.notePlaceholder);
  storyInput.maxLength = 80;
  storyInput.autocomplete = "off";
  storyInput.oninput = () => {
    draft.story = storyInput.value;
  };
  panel.append(nameInput, storyInput);

  const unlockNote = hand("div", "unlock-note");
  panel.appendChild(unlockNote);

  // --- kayıtlı tarifler
  const savedBox = hand("div", "workshop-saved");
  panel.appendChild(savedBox);

  // --- butonlar
  const sira = hand("div", "btn-row");
  const saveBtn = hand("button", "btn") as HTMLButtonElement;
  saveBtn.textContent = y(S.addToMenu);
  saveBtn.onclick = () => {
    if (saveBtn.disabled) return;
    cb.saveLabel({
      name: draft.name.trim(),
      story: draft.story.trim(),
      base: draft.base,
      filling: [...draft.filling],
      garnish: draft.garnish,
      day,
    });
  };
  const closeBtn = hand("button", "btn ikincil") as HTMLButtonElement;
  closeBtn.textContent = y(S.closeLabel);
  closeBtn.onclick = () => cb.closeLabel();
  sira.append(closeBtn, saveBtn);
  panel.appendChild(sira);

  overlay.appendChild(panel);

  function render() {
    // taban seçimi
    for (const b of baseRow.children) {
      b.classList.toggle("active", (b as HTMLElement).dataset.id === draft.base);
    }

    // iç malzemeler tabana göre
    const secenekler = fillingOptions(day, draft.base, extraStations);
    fillingRow.innerHTML = "";
    if (secenekler.length === 0) {
      const blank = hand("p", "sub small");
      blank.textContent = y(S.noFillingsYet);
      fillingRow.appendChild(blank);
    }
    for (const { ingredient: mid, kilitli } of secenekler) {
      const secili = draft.filling.includes(mid);
      const full = !secili && draft.filling.length >= FILLING_LIMIT;
      const b = hand("button", `secim kucuk${secili ? "active" : ""}${kilitli ? "locked" : ""}`) as HTMLButtonElement;
      b.disabled = full;
      if (kilitli) b.title = y(S.lockedFilling);
      b.innerHTML = `${art(ingredient(mid).icon, 22)}<b>${y(ingredient(mid).name)}</b>${kilitli ? `<span class="lock">${art("ui_kilit", 12)}</span>` : ""}`;
      b.onclick = () => {
        if (secili) draft.filling = draft.filling.filter((x) => x !== mid);
        else if (draft.filling.length < FILLING_LIMIT) draft.filling.push(mid);
        render();
      };
      fillingRow.appendChild(b);
    }

    for (const b of garnishRow.children) {
      const id = (b as HTMLElement).dataset.id as GarnishId;
      const secili = draft.garnish.includes(id);
      b.classList.toggle("active", secili);
      (b as HTMLButtonElement).disabled = !secili && draft.garnish.length >= GARNISH_LIMIT;
    }

    // önizleme
    const needs = recipeNeeds(draft);
    const hearts = recipeHearts(draft);
    gorsel.innerHTML = draft.filling.length
      ? `<svg class="sv" viewBox="0 0 48 48" width="96" height="96">${recipeArt(draft)}</svg>`
      : `<span class="workshop-empty">?</span>`;
    bilgi.innerHTML =
      `<b>${draft.name.trim() || y(S.untitledRecipe)}</b>` +
      `<div class="workshop-needs">${needs.map((g2) => `<span class="chip">${art(ingredient(g2).icon, 18)}<span>${y(ingredient(g2).name)}</span></span>`).join("")}</div>` +
      `<div class="workshop-value">${art("ui_kalp", 16)}<span>${format(S.heartsCount, { n: hearts })}</span> · ${y(BASE_MAP[draft.base].name)}</div>`;

    // kayıtlı liste
    const liste = allRecipes();
    savedBox.innerHTML = "";
    if (liste.length) {
      savedBox.appendChild(sectionTitle(format(S.yourRecipes, { n: liste.length })));
      const izgara = hand("div", "saved-grid");
      for (const t of liste) {
        const kart = hand("div", "saved-card");
        kart.innerHTML =
          `<svg class="sv" viewBox="0 0 48 48" width="34" height="34">${recipeArt(t)}</svg>` +
          `<span>${t.name}</span>`;
        const removeBtn = hand("button", "saved-remove") as HTMLButtonElement;
        removeBtn.textContent = "×";
        removeBtn.title = y(S.removeFromMenu);
        removeBtn.onclick = () => cb.removeBtn(t.id);
        kart.appendChild(removeBtn);
        izgara.appendChild(kart);
      }
      savedBox.appendChild(izgara);
    }

    // kaydet durumu
    const acilacak = stationsRecipeUnlocks(draft, day, extraStations);
    unlockNote.innerHTML = acilacak.length
      ? `${art("ui_kilit", 13)}<span>${format(S.stationsWillOpen, { n: acilacak.length })}</span>`
      : "";
    unlockNote.style.display = acilacak.length ? "" : "none";

    const adTamam = draft.name.trim().length >= 2;
    const cakisma = adTamam && recipeNameTaken(draft.name);
    saveBtn.disabled = !adTamam || draft.filling.length === 0 || cakisma;
    saveBtn.textContent = y(cakisma ? S.nameTaken : S.addToMenu);
  }

  render();
  return overlay;
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

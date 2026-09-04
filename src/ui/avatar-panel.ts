/** Garson tasarım paneli — her seçenek kendi çizimiyle önizlenir. */
import {
  APRON_COLORS,
  HAIR_STYLES,
  HAIR_ACCESSORIES,
  HAIR_COLORS,
  SKIN_TONES,
  OUTFIT_COLORS,
  FACE_ACCESSORIES,
  type Avatar,
} from "../core/avatar";
import { serverHeadSvg, serverSvg } from "./art";
import { S, y } from "../core/i18n";

export interface AvatarCallbacks {
  kaydet(a: Avatar): void;
  kapat(): void;
}

export function avatarPanel(baslangic: Avatar, cb: AvatarCallbacks): HTMLElement {
  const a: Avatar = { ...baslangic };

  const perde = hand("div", "overlay");
  const pano = hand("div", "panel workshop-panel");

  const baslik = hand("h2");
  baslik.innerHTML = `<span>${y(S.avatarBaslik)}</span>`;
  const alt = hand("p", "sub");
  alt.textContent = y(S.avatarAlt);
  pano.append(baslik, alt);

  const onizleme = hand("div", "avatar-preview");
  pano.appendChild(onizleme);

  // --- ad
  pano.appendChild(bolum(y(S.kullaniciAdi)));
  const nameInput = hand("input", "workshop-input") as HTMLInputElement;
  nameInput.placeholder = y(S.adIpucu);
  nameInput.maxLength = 14;
  nameInput.autocomplete = "off";
  nameInput.value = a.name;
  nameInput.oninput = () => {
    a.name = nameInput.value;
    render();
  };
  pano.appendChild(nameInput);

  // --- tip
  pano.appendChild(bolum(y(S.karakter)));
  const kindBox = hand("div", "segment");
  const tipler: [Avatar["kind"], string][] = [
    ["kadin", y(S.kadin)],
    ["erkek", y(S.erkek)],
  ];
  for (const [id, name] of tipler) {
    const b = hand("button", "segment-btn") as HTMLButtonElement;
    b.dataset.kind = id;
    b.textContent = name;
    b.onclick = () => {
      a.kind = id;
      render();
    };
    kindBox.appendChild(b);
  }
  pano.appendChild(kindBox);

  // --- ten
  pano.appendChild(bolum(y(S.skin)));
  const skinRow = colorRow(SKIN_TONES, () => a.skin, (i) => {
    a.skin = i;
    render();
  });
  pano.appendChild(skinRow);

  // --- saç stili (her biri kendi çizimiyle)
  pano.appendChild(bolum(y(S.sacBolum)));
  const hairRow = hand("div", "avatar-grid");
  HAIR_STYLES.forEach((stil, i) => {
    const b = hand("button", "avatar-option") as HTMLButtonElement;
    b.dataset.i = String(i);
    b.title = y(stil.name);
    b.appendChild(hand("div", "avatar-thumb"));
    const etiket = hand("span");
    etiket.textContent = y(stil.name);
    b.appendChild(etiket);
    b.onclick = () => {
      a.hair = i;
      render();
    };
    hairRow.appendChild(b);
  });
  pano.appendChild(hairRow);

  // --- saç rengi
  pano.appendChild(bolum(y(S.sacRengi)));
  pano.appendChild(
    colorRow(HAIR_COLORS, () => a.hairColor, (i) => {
      a.hairColor = i;
      render();
    }),
  );

  // --- kıyafet rengi
  pano.appendChild(bolum(y(S.kiyafetRengi)));
  pano.appendChild(
    colorRow(OUTFIT_COLORS, () => a.outfit, (i) => {
      a.outfit = i;
      render();
    }),
  );

  // --- önlük rengi
  pano.appendChild(bolum(y(S.onlukRengi)));
  pano.appendChild(
    colorRow(APRON_COLORS, () => a.apron, (i) => {
      a.apron = i;
      render();
    }),
  );

  // --- saç aksesuarı (hepsi çizim önizlemeli)
  pano.appendChild(bolum(y(S.sacAksesuari)));
  const hairAccRow = hand("div", "avatar-grid");
  for (const aks of HAIR_ACCESSORIES) {
    const b = hand("button", "avatar-option") as HTMLButtonElement;
    b.dataset.saks = aks.id;
    b.title = y(aks.name);
    b.appendChild(hand("div", "avatar-thumb"));
    const etiket = hand("span");
    etiket.textContent = y(aks.name);
    b.appendChild(etiket);
    b.onclick = () => {
      a.hairAccessory = aks.id;
      render();
    };
    hairAccRow.appendChild(b);
  }
  pano.appendChild(hairAccRow);

  // --- yüz aksesuarı
  pano.appendChild(bolum(y(S.yuzAksesuari)));
  const faceAccRow = hand("div", "avatar-grid");
  for (const aks of FACE_ACCESSORIES) {
    const b = hand("button", "avatar-option") as HTMLButtonElement;
    b.dataset.yaks = aks.id;
    b.title = y(aks.name);
    b.appendChild(hand("div", "avatar-thumb"));
    const etiket = hand("span");
    etiket.textContent = y(aks.name);
    b.appendChild(etiket);
    b.onclick = () => {
      a.faceAccessory = aks.id;
      render();
    };
    faceAccRow.appendChild(b);
  }
  pano.appendChild(faceAccRow);

  // --- eylemler
  const sira = hand("div", "btn-row");
  const kapat = hand("button", "btn ikincil") as HTMLButtonElement;
  kapat.textContent = y(S.vazgec);
  kapat.onclick = () => cb.kapat();
  const kaydet = hand("button", "btn") as HTMLButtonElement;
  kaydet.textContent = y(S.kaydet);
  kaydet.onclick = () => cb.kaydet({ ...a, name: a.name.trim() || "Chef" });
  sira.append(kapat, kaydet);
  pano.appendChild(sira);

  perde.appendChild(pano);

  function render() {
    onizleme.innerHTML =
      `<div class="avatar-large">${serverSvg(a, 132)}</div>` +
      `<div class="avatar-name-tag">${(a.name.trim() || "Chef").replace(/[<>&]/g, "")}</div>`;

    for (const b of kindBox.children) {
      b.classList.toggle("active", (b as HTMLElement).dataset.kind === a.kind);
    }
    markActive(skinRow, a.skin);

    // saç seçenekleri: her biri güncel avatarla ama kendi saçıyla çizilir
    Array.from(hairRow.children).forEach((b, i) => {
      const kutu = b.querySelector(".avatar-thumb");
      if (kutu) kutu.innerHTML = serverHeadSvg({ ...a, hair: i }, 62);
      b.classList.toggle("active", i === a.hair);
    });
    Array.from(hairAccRow.children).forEach((b) => {
      const id = (b as HTMLElement).dataset.saks as Avatar["hairAccessory"];
      const kutu = b.querySelector(".avatar-thumb");
      if (kutu) kutu.innerHTML = serverHeadSvg({ ...a, hairAccessory: id }, 62);
      b.classList.toggle("active", id === a.hairAccessory);
    });
    Array.from(faceAccRow.children).forEach((b) => {
      const id = (b as HTMLElement).dataset.yaks as Avatar["faceAccessory"];
      const kutu = b.querySelector(".avatar-thumb");
      if (kutu) kutu.innerHTML = serverHeadSvg({ ...a, faceAccessory: id }, 62);
      b.classList.toggle("active", id === a.faceAccessory);
    });

    const colorRows = pano.querySelectorAll<HTMLElement>(".color-row");
    markActive(colorRows[1], a.hairColor);
    markActive(colorRows[2], a.outfit);
    markActive(colorRows[3], a.apron);
  }

  render();
  return perde;
}

function colorRow(renkler: string[], secili: () => number, sec: (i: number) => void): HTMLElement {
  const sira = hand("div", "color-row");
  renkler.forEach((color, i) => {
    const b = hand("button", "color-dot") as HTMLButtonElement;
    b.style.background = color;
    b.onclick = () => sec(i);
    sira.appendChild(b);
  });
  queueMicrotask(() => markActive(sira, secili()));
  return sira;
}

function markActive(sira: HTMLElement | undefined, index: number) {
  if (!sira) return;
  Array.from(sira.children).forEach((b, i) => b.classList.toggle("active", i === index));
}

function bolum(text: string): HTMLElement {
  const d = document.createElement("div");
  d.className = "workshop-section";
  d.textContent = text;
  return d;
}

function hand<K extends keyof HTMLElementTagNameMap>(tag: K, sinif = ""): HTMLElementTagNameMap[K] {
  const d = document.createElement(tag);
  if (sinif) d.className = sinif;
  return d;
}

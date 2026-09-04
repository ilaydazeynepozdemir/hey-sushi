/** Tarif Atölyesi paneli — oyuncunun kendi suşisini tasarladığı ekran. */
import { MALZEMELER } from "../core/content";
import {
  GARNITURLER,
  GARNITUR_LIMIT,
  IC_LIMIT,
  TABANLAR,
  TABAN_MAP,
  type GarniturId,
  type OzelTarif,
  type TabanId,
  hepsi,
  icSecenekleri,
  tarifinAcacagiIstasyonlar,
  tarifCizim,
  tarifGerek,
  tarifKalp,
  tarifVarMi,
} from "../core/atolye";
import type { IstasyonId, MalzemeId } from "../core/types";
import { sanat } from "./art";
import { S, bicim, y } from "../core/dil";

export interface AtolyeCallbacks {
  kaydet(t: Omit<OzelTarif, "id">): void;
  sil(id: string): void;
  kapat(): void;
}

interface Taslak {
  taban: TabanId;
  ic: MalzemeId[];
  garnitur: GarniturId[];
  ad: string;
  hikaye: string;
}

export function atolyePaneli(
  gun: number,
  ekstraIstasyon: IstasyonId[],
  cb: AtolyeCallbacks,
): HTMLElement {
  const taslak: Taslak = { taban: "nigiri", ic: [], garnitur: [], ad: "", hikaye: "" };

  const perde = el("div", "perde");
  const pano = el("div", "pano atolye-pano");

  const baslik = el("h2");
  baslik.innerHTML = `${sanat("ui_parilti", 24)}<span>${y(S.atolyeBaslik)}</span>`;
  const alt = el("p", "alt");
  alt.textContent = y(S.atolyeAlt);
  pano.append(baslik, alt);

  // --- önizleme
  const onizleme = el("div", "atolye-onizleme");
  const gorsel = el("div", "atolye-gorsel");
  const bilgi = el("div", "atolye-bilgi");
  onizleme.append(gorsel, bilgi);
  pano.appendChild(onizleme);

  // --- taban
  pano.appendChild(bolumBasligi(y(S.taban)));
  const tabanSira = el("div", "secim-sira");
  for (const t of TABANLAR) {
    const b = el("button", "secim") as HTMLButtonElement;
    b.dataset.id = t.id;
    b.innerHTML = `<b>${y(t.ad)}</b><small>${y(t.aciklama)}</small>`;
    b.onclick = () => {
      taslak.taban = t.id;
      taslak.ic = [];
      ciz();
    };
    tabanSira.appendChild(b);
  }
  pano.appendChild(tabanSira);

  // --- iç malzeme
  const icBaslik = bolumBasligi(bicim(S.icMalzeme, { n: IC_LIMIT }));
  pano.appendChild(icBaslik);
  const icSira = el("div", "secim-sira sarmali");
  pano.appendChild(icSira);

  // --- garnitür
  pano.appendChild(bolumBasligi(bicim(S.garnitur, { n: GARNITUR_LIMIT })));
  const garSira = el("div", "secim-sira sarmali");
  for (const g of GARNITURLER) {
    const b = el("button", "secim kucuk") as HTMLButtonElement;
    b.dataset.id = g.id;
    b.innerHTML = `<b>${y(g.ad)}</b>${g.kalp ? `<small>+${g.kalp}</small>` : ""}`;
    b.onclick = () => {
      const secili = taslak.garnitur.includes(g.id);
      if (secili) taslak.garnitur = taslak.garnitur.filter((x) => x !== g.id);
      else if (taslak.garnitur.length < GARNITUR_LIMIT) taslak.garnitur.push(g.id);
      ciz();
    };
    garSira.appendChild(b);
  }
  pano.appendChild(garSira);

  // --- isim & hikâye
  pano.appendChild(bolumBasligi(y(S.isimVeHikaye)));
  const adGiris = el("input", "atolye-giris") as HTMLInputElement;
  adGiris.placeholder = y(S.tarifAdiIpucu);
  adGiris.maxLength = 28;
  adGiris.autocomplete = "off";
  adGiris.oninput = () => {
    taslak.ad = adGiris.value;
    ciz();
  };
  const hikayeGiris = el("input", "atolye-giris") as HTMLInputElement;
  hikayeGiris.placeholder = y(S.kisaNot);
  hikayeGiris.maxLength = 80;
  hikayeGiris.autocomplete = "off";
  hikayeGiris.oninput = () => {
    taslak.hikaye = hikayeGiris.value;
  };
  pano.append(adGiris, hikayeGiris);

  const acilacakBilgi = el("div", "acilacak-bilgi");
  pano.appendChild(acilacakBilgi);

  // --- kayıtlı tarifler
  const kayitliKap = el("div", "atolye-kayitli");
  pano.appendChild(kayitliKap);

  // --- butonlar
  const sira = el("div", "btn-sira");
  const kaydetBtn = el("button", "btn") as HTMLButtonElement;
  kaydetBtn.textContent = y(S.menuyeEkle);
  kaydetBtn.onclick = () => {
    if (kaydetBtn.disabled) return;
    cb.kaydet({
      ad: taslak.ad.trim(),
      hikaye: taslak.hikaye.trim(),
      taban: taslak.taban,
      ic: [...taslak.ic],
      garnitur: taslak.garnitur,
      gun,
    });
  };
  const kapatBtn = el("button", "btn ikincil") as HTMLButtonElement;
  kapatBtn.textContent = y(S.kapat);
  kapatBtn.onclick = () => cb.kapat();
  sira.append(kapatBtn, kaydetBtn);
  pano.appendChild(sira);

  perde.appendChild(pano);

  function ciz() {
    // taban seçimi
    for (const b of tabanSira.children) {
      b.classList.toggle("aktif", (b as HTMLElement).dataset.id === taslak.taban);
    }

    // iç malzemeler tabana göre
    const secenekler = icSecenekleri(gun, taslak.taban, ekstraIstasyon);
    icSira.innerHTML = "";
    if (secenekler.length === 0) {
      const bos = el("p", "alt kucuk");
      bos.textContent = y(S.malzemeYok);
      icSira.appendChild(bos);
    }
    for (const { malzeme: mid, kilitli } of secenekler) {
      const secili = taslak.ic.includes(mid);
      const dolu = !secili && taslak.ic.length >= IC_LIMIT;
      const b = el("button", `secim kucuk${secili ? " aktif" : ""}${kilitli ? " kilitli" : ""}`) as HTMLButtonElement;
      b.disabled = dolu;
      if (kilitli) b.title = y(S.kilitliMalzeme);
      b.innerHTML = `${sanat(MALZEMELER[mid].ikon, 22)}<b>${y(MALZEMELER[mid].ad)}</b>${kilitli ? `<span class="kilit">${sanat("ui_kilit", 12)}</span>` : ""}`;
      b.onclick = () => {
        if (secili) taslak.ic = taslak.ic.filter((x) => x !== mid);
        else if (taslak.ic.length < IC_LIMIT) taslak.ic.push(mid);
        ciz();
      };
      icSira.appendChild(b);
    }

    for (const b of garSira.children) {
      const id = (b as HTMLElement).dataset.id as GarniturId;
      const secili = taslak.garnitur.includes(id);
      b.classList.toggle("aktif", secili);
      (b as HTMLButtonElement).disabled = !secili && taslak.garnitur.length >= GARNITUR_LIMIT;
    }

    // önizleme
    const gerek = tarifGerek(taslak);
    const kalp = tarifKalp(taslak);
    gorsel.innerHTML = taslak.ic.length
      ? `<svg class="sv" viewBox="0 0 48 48" width="96" height="96">${tarifCizim(taslak)}</svg>`
      : `<span class="atolye-bos">?</span>`;
    bilgi.innerHTML =
      `<b>${taslak.ad.trim() || y(S.isimsizTarif)}</b>` +
      `<div class="atolye-gerek">${gerek.map((g2) => `<span class="cip">${sanat(MALZEMELER[g2].ikon, 18)}<span>${y(MALZEMELER[g2].ad)}</span></span>`).join("")}</div>` +
      `<div class="atolye-deger">${sanat("ui_kalp", 16)}<span>${bicim(S.kalpBirimi, { n: kalp })}</span> · ${y(TABAN_MAP[taslak.taban].ad)}</div>`;

    // kayıtlı liste
    const liste = hepsi();
    kayitliKap.innerHTML = "";
    if (liste.length) {
      kayitliKap.appendChild(bolumBasligi(bicim(S.kayitliTarifler, { n: liste.length })));
      const izgara = el("div", "kayitli-izgara");
      for (const t of liste) {
        const kart = el("div", "kayitli-kart");
        kart.innerHTML =
          `<svg class="sv" viewBox="0 0 48 48" width="34" height="34">${tarifCizim(t)}</svg>` +
          `<span>${t.ad}</span>`;
        const sil = el("button", "kayitli-sil") as HTMLButtonElement;
        sil.textContent = "×";
        sil.title = y(S.menudenKaldir);
        sil.onclick = () => cb.sil(t.id);
        kart.appendChild(sil);
        izgara.appendChild(kart);
      }
      kayitliKap.appendChild(izgara);
    }

    // kaydet durumu
    const acilacak = tarifinAcacagiIstasyonlar(taslak, gun, ekstraIstasyon);
    acilacakBilgi.innerHTML = acilacak.length
      ? `${sanat("ui_kilit", 13)}<span>${bicim(S.istasyonAcilacak, { n: acilacak.length })}</span>`
      : "";
    acilacakBilgi.style.display = acilacak.length ? "" : "none";

    const adTamam = taslak.ad.trim().length >= 2;
    const cakisma = adTamam && tarifVarMi(taslak.ad);
    kaydetBtn.disabled = !adTamam || taslak.ic.length === 0 || cakisma;
    kaydetBtn.textContent = y(cakisma ? S.isimKullaniliyor : S.menuyeEkle);
  }

  ciz();
  return perde;
}

function bolumBasligi(metin: string): HTMLElement {
  const d = el("div", "atolye-bolum");
  d.textContent = metin;
  return d;
}

function el<K extends keyof HTMLElementTagNameMap>(tag: K, sinif = ""): HTMLElementTagNameMap[K] {
  const d = document.createElement(tag);
  if (sinif) d.className = sinif;
  return d;
}

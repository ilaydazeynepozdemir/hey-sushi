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
import { S, y } from "../core/dil";

export interface AvatarCallbacks {
  kaydet(a: Avatar): void;
  kapat(): void;
}

export function avatarPanel(baslangic: Avatar, cb: AvatarCallbacks): HTMLElement {
  const a: Avatar = { ...baslangic };

  const perde = hand("div", "perde");
  const pano = hand("div", "pano atolye-pano");

  const baslik = hand("h2");
  baslik.innerHTML = `<span>${y(S.avatarBaslik)}</span>`;
  const alt = el("p", "alt");
  alt.textContent = y(S.avatarAlt);
  pano.append(baslik, alt);

  const onizleme = el("div", "avatar-onizleme");
  pano.appendChild(onizleme);

  // --- ad
  pano.appendChild(bolum(y(S.kullaniciAdi)));
  const adGiris = el("input", "atolye-giris") as HTMLInputElement;
  adGiris.placeholder = y(S.adIpucu);
  adGiris.maxLength = 14;
  adGiris.autocomplete = "off";
  adGiris.value = a.ad;
  adGiris.oninput = () => {
    a.ad = adGiris.value;
    ciz();
  };
  pano.appendChild(adGiris);

  // --- tip
  pano.appendChild(bolum(y(S.karakter)));
  const tipKutu = el("div", "segment");
  const tipler: [Avatar["tip"], string][] = [
    ["kadin", y(S.kadin)],
    ["erkek", y(S.erkek)],
  ];
  for (const [id, ad] of tipler) {
    const b = el("button", "segment-dugme") as HTMLButtonElement;
    b.dataset.tip = id;
    b.textContent = ad;
    b.onclick = () => {
      a.tip = id;
      ciz();
    };
    tipKutu.appendChild(b);
  }
  pano.appendChild(tipKutu);

  // --- ten
  pano.appendChild(bolum(y(S.ten)));
  const tenSira = renkSirasi(TENLER, () => a.ten, (i) => {
    a.ten = i;
    ciz();
  });
  pano.appendChild(tenSira);

  // --- saç stili (her biri kendi çizimiyle)
  pano.appendChild(bolum(y(S.sacBolum)));
  const sacSira = el("div", "avatar-izgara");
  SACLAR.forEach((stil, i) => {
    const b = el("button", "avatar-secim") as HTMLButtonElement;
    b.dataset.i = String(i);
    b.title = y(stil.ad);
    b.appendChild(el("div", "avatar-mini"));
    const etiket = el("span");
    etiket.textContent = y(stil.ad);
    b.appendChild(etiket);
    b.onclick = () => {
      a.sac = i;
      ciz();
    };
    sacSira.appendChild(b);
  });
  pano.appendChild(sacSira);

  // --- saç rengi
  pano.appendChild(bolum(y(S.sacRengi)));
  pano.appendChild(
    renkSirasi(SAC_RENKLERI, () => a.sacRenk, (i) => {
      a.sacRenk = i;
      ciz();
    }),
  );

  // --- kıyafet rengi
  pano.appendChild(bolum(y(S.kiyafetRengi)));
  pano.appendChild(
    renkSirasi(UNIFORMALAR, () => a.uniforma, (i) => {
      a.uniforma = i;
      ciz();
    }),
  );

  // --- önlük rengi
  pano.appendChild(bolum(y(S.onlukRengi)));
  pano.appendChild(
    renkSirasi(ONLUKLER, () => a.onluk, (i) => {
      a.onluk = i;
      ciz();
    }),
  );

  // --- saç aksesuarı (hepsi çizim önizlemeli)
  pano.appendChild(bolum(y(S.sacAksesuari)));
  const sacAksSira = el("div", "avatar-izgara");
  for (const aks of SAC_AKSESUARLARI) {
    const b = el("button", "avatar-secim") as HTMLButtonElement;
    b.dataset.saks = aks.id;
    b.title = y(aks.ad);
    b.appendChild(el("div", "avatar-mini"));
    const etiket = el("span");
    etiket.textContent = y(aks.ad);
    b.appendChild(etiket);
    b.onclick = () => {
      a.sacAksesuar = aks.id;
      ciz();
    };
    sacAksSira.appendChild(b);
  }
  pano.appendChild(sacAksSira);

  // --- yüz aksesuarı
  pano.appendChild(bolum(y(S.yuzAksesuari)));
  const yuzAksSira = el("div", "avatar-izgara");
  for (const aks of YUZ_AKSESUARLARI) {
    const b = el("button", "avatar-secim") as HTMLButtonElement;
    b.dataset.yaks = aks.id;
    b.title = y(aks.ad);
    b.appendChild(el("div", "avatar-mini"));
    const etiket = el("span");
    etiket.textContent = y(aks.ad);
    b.appendChild(etiket);
    b.onclick = () => {
      a.yuzAksesuar = aks.id;
      ciz();
    };
    yuzAksSira.appendChild(b);
  }
  pano.appendChild(yuzAksSira);

  // --- eylemler
  const sira = el("div", "btn-sira");
  const kapat = el("button", "btn ikincil") as HTMLButtonElement;
  kapat.textContent = y(S.vazgec);
  kapat.onclick = () => cb.kapat();
  const kaydet = el("button", "btn") as HTMLButtonElement;
  kaydet.textContent = y(S.kaydet);
  kaydet.onclick = () => cb.kaydet({ ...a, ad: a.ad.trim() || "Chef" });
  sira.append(kapat, kaydet);
  pano.appendChild(sira);

  perde.appendChild(pano);

  function ciz() {
    onizleme.innerHTML =
      `<div class="avatar-buyuk">${serverSvg(a, 132)}</div>` +
      `<div class="avatar-ad-etiket">${(a.ad.trim() || "Chef").replace(/[<>&]/g, "")}</div>`;

    for (const b of tipKutu.children) {
      b.classList.toggle("aktif", (b as HTMLElement).dataset.tip === a.tip);
    }
    isaretle(tenSira, a.ten);

    // saç seçenekleri: her biri güncel avatarla ama kendi saçıyla çizilir
    Array.from(sacSira.children).forEach((b, i) => {
      const kutu = b.querySelector(".avatar-mini");
      if (kutu) kutu.innerHTML = garsonKafaSvg({ ...a, sac: i }, 62);
      b.classList.toggle("aktif", i === a.sac);
    });
    Array.from(sacAksSira.children).forEach((b) => {
      const id = (b as HTMLElement).dataset.saks as Avatar["sacAksesuar"];
      const kutu = b.querySelector(".avatar-mini");
      if (kutu) kutu.innerHTML = garsonKafaSvg({ ...a, sacAksesuar: id }, 62);
      b.classList.toggle("aktif", id === a.sacAksesuar);
    });
    Array.from(yuzAksSira.children).forEach((b) => {
      const id = (b as HTMLElement).dataset.yaks as Avatar["yuzAksesuar"];
      const kutu = b.querySelector(".avatar-mini");
      if (kutu) kutu.innerHTML = garsonKafaSvg({ ...a, yuzAksesuar: id }, 62);
      b.classList.toggle("aktif", id === a.yuzAksesuar);
    });

    const renkSiralari = pano.querySelectorAll<HTMLElement>(".renk-sira");
    isaretle(renkSiralari[1], a.sacRenk);
    isaretle(renkSiralari[2], a.uniforma);
    isaretle(renkSiralari[3], a.onluk);
  }

  ciz();
  return perde;
}

function renkSirasi(renkler: string[], secili: () => number, sec: (i: number) => void): HTMLElement {
  const sira = el("div", "renk-sira");
  renkler.forEach((renk, i) => {
    const b = el("button", "renk-nokta") as HTMLButtonElement;
    b.style.background = renk;
    b.onclick = () => sec(i);
    sira.appendChild(b);
  });
  queueMicrotask(() => isaretle(sira, secili()));
  return sira;
}

function isaretle(sira: HTMLElement | undefined, index: number) {
  if (!sira) return;
  Array.from(sira.children).forEach((b, i) => b.classList.toggle("aktif", i === index));
}

function bolum(metin: string): HTMLElement {
  const d = document.createElement("div");
  d.className = "atolye-bolum";
  d.textContent = metin;
  return d;
}

function el<K extends keyof HTMLElementTagNameMap>(tag: K, sinif = ""): HTMLElementTagNameMap[K] {
  const d = document.createElement(tag);
  if (sinif) d.className = sinif;
  return d;
}

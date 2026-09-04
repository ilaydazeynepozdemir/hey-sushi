import type { Avatar, HairAccessoryId, FaceAccessoryId } from "../core/avatar";
import { APRON_COLORS, HAIR_STYLES, HAIR_COLORS, SKIN_TONES, OUTFIT_COLORS } from "../core/avatar";

/**
 * Tsuki Suşi — el çizimi SVG ikon seti.
 * Emoji yok: her şey aynı pastel palette göre çizilmiş, 48x48 viewBox.
 */

const R = {
  rice: "#FFFCF6",
  riceShade: "#F0E4D3",
  nori: "#7CBFAF",
  noriDark: "#5FA394",
  salmon: "#FFAD93",
  salmonDark: "#EC8768",
  salmonStripe: "#FFF1EA",
  tone: "#F896A4",
  tunaDark: "#DC7484",
  tunaStripe: "#FFE3E6",
  avocado: "#86C77C",
  avocadoFlesh: "#DCF0D4",
  avocadoMid: "#A8DF9B",
  pit: "#C8A78F",
  tamago: "#FFD989",
  tamagoDark: "#F5BF63",
  matcha: "#A2D46F",
  ceramic: "#FFF6EA",
  ceramicShade: "#EFE2D2",
  wood: "#E3C3A5",
  woodDark: "#C8A78F",
  woodLight: "#F1DCC6",
  hearts: "#F5849B",
  ginger: "#F7CBC2",
  wasabi: "#C7EA92",
  lavender: "#CDC0EE",
  skyBlue: "#9FB4D6",
  ink: "#6D5B60",
  skin1: "#F6D3BC",
  skin2: "#E8B99B",
  skin3: "#D9A184",
  hairDark: "#3F3237",
  hairBrown: "#7A5A4A",
  hairWhite: "#F2ECE6",
  shrimp: "#FFB3AE",
  shrimpDark: "#F58F8A",
  shrimpStripe: "#FF7C72",
  unagi: "#C98A54",
  unagiDark: "#A96E3E",
  unagiGlaze: "#7A4A28",
  cucumber: "#BCE79E",
  cucumberDark: "#96CC77",
  mango: "#FFC66B",
  mangoDark: "#F5A83E",
  cream: "#FFE7BE",
  creamDark: "#E5C79A",
  tempura: "#F2C685",
  tempuraDark: "#DFA85B",
  blush: "#FFC9D4",
} as const;

/** nigiri: pirinç yastığı + üstünde balık */
const nigiriArt = (ust: string, ustKoyu: string) => `
  <ellipse cx="24" cy="33" rx="15.5" ry="7.5" fill="${R.riceShade}"/>
  <ellipse cx="24" cy="31.5" rx="15.5" ry="7.5" fill="${R.rice}"/>
  <path d="M9.5 28.5c0-5.6 6.5-9.8 14.5-9.8s14.5 4.2 14.5 9.8c0 2.1-1.6 3.4-3.9 3.4H13.4c-2.3 0-3.9-1.3-3.9-3.4z" fill="${ustKoyu}"/>
  <path d="M9.8 27c0-5.4 6.4-9.4 14.2-9.4S38.2 21.6 38.2 27c0 1.9-1.5 3-3.7 3H13.5c-2.2 0-3.7-1.1-3.7-3z" fill="${ust}"/>
  <path d="M15 24.6c3.4-1.6 8-2.3 12.6-1.9" stroke="#fff" stroke-opacity=".55" stroke-width="1.6" stroke-linecap="round" fill="none"/>
  <circle cx="16.5" cy="34" r="1" fill="#fff" opacity=".8"/>
  <circle cx="30" cy="35" r=".9" fill="#fff" opacity=".7"/>`;

/** maki: üstten görünüm rulo */
const makiArt = (filling: string, icKoyu: string) => `
  <circle cx="24" cy="24" r="16" fill="${R.noriDark}"/>
  <circle cx="24" cy="23.2" r="16" fill="${R.nori}"/>
  <circle cx="24" cy="23.2" r="12.6" fill="${R.riceShade}"/>
  <circle cx="24" cy="22.6" r="12.6" fill="${R.rice}"/>
  <circle cx="24" cy="23" r="6.2" fill="${icKoyu}"/>
  <circle cx="24" cy="22.4" r="6.2" fill="${filling}"/>
  <circle cx="18.5" cy="17.5" r="1.1" fill="${R.riceShade}"/>
  <circle cx="30" cy="18.5" r="1" fill="${R.riceShade}"/>
  <circle cx="20" cy="29" r="1" fill="${R.riceShade}"/>`;

/** kesim istasyonu: tahta + üstünde dilimler */
const boardArt = (filling: string) => `
  <rect x="4" y="29" width="40" height="10" rx="5" fill="${R.woodDark}"/>
  <rect x="4" y="27.5" width="40" height="9" rx="4.5" fill="${R.wood}"/>
  <rect x="7" y="29.5" width="34" height="2" rx="1" fill="${R.woodLight}" opacity=".7"/>
  ${filling}`;

const ART: Record<string, string> = {
  blank: `<circle cx="24" cy="24" r="3" fill="${R.ink}" opacity=".25"/>`,

  // ---------------------------------------------------------- malzemeler
  rice: `
    <ellipse cx="24" cy="32" rx="14" ry="8" fill="${R.riceShade}"/>
    <path d="M10 30c0-8.5 6.3-14 14-14s14 5.5 14 14c0 2.6-2 4-5 4H15c-3 0-5-1.4-5-4z" fill="${R.rice}"/>
    <path d="M15 24c2.5-3.4 6-5 9-5" stroke="#fff" stroke-width="2" stroke-linecap="round" fill="none" opacity=".9"/>
    <circle cx="18" cy="31" r="1.2" fill="${R.riceShade}"/>
    <circle cx="27" cy="30" r="1" fill="${R.riceShade}"/>
    <circle cx="32" cy="32" r="1.1" fill="${R.riceShade}"/>
    <ellipse cx="14.5" cy="29.5" rx="2.6" ry="1.7" fill="${R.blush}" opacity=".55"/>
    <ellipse cx="33.5" cy="29.5" rx="2.6" ry="1.7" fill="${R.blush}" opacity=".55"/>`,

  nori: `
    <rect x="9" y="11" width="30" height="27" rx="6" fill="${R.noriDark}"/>
    <rect x="9" y="10" width="30" height="26" rx="6" fill="${R.nori}"/>
    <path d="M14 16h20M14 22h20M14 28h14" stroke="${R.noriDark}" stroke-width="1.6" stroke-linecap="round" opacity=".55"/>
    <path d="M13 14c3-1.5 6-1.5 9 0" stroke="#fff" stroke-opacity=".35" stroke-width="1.6" stroke-linecap="round" fill="none"/>`,

  tea: `
    <path d="M35 22h3.5a4.5 4.5 0 0 1 0 9H35" stroke="${R.ceramicShade}" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M12 19h24l-2.4 15.4A6 6 0 0 1 27.7 39h-7.4a6 6 0 0 1-5.9-4.6z" fill="${R.ceramicShade}"/>
    <path d="M12.6 18.6h22.8l-2.3 14.6a5.4 5.4 0 0 1-5.3 4.4h-7.6a5.4 5.4 0 0 1-5.3-4.4z" fill="${R.ceramic}"/>
    <ellipse cx="24" cy="19" rx="12" ry="4.2" fill="${R.matcha}"/>
    <ellipse cx="24" cy="18.4" rx="9.5" ry="3" fill="#BBDC96"/>
    <path d="M20 12c1.6-1.6 1.6-3.4 0-5M27 12c1.6-1.6 1.6-3.4 0-5" stroke="${R.matcha}" stroke-width="1.8" stroke-linecap="round" fill="none" opacity=".75"/>`,

  salmon_slice: `
    <path d="M10.5 30.8c0-7.2 8.4-14.6 18.6-14.6 5.3 0 8.4 2.2 8.4 5.5 0 7.2-8.4 14.6-18.6 14.6-5.3 0-8.4-2.2-8.4-5.5z" fill="${R.salmonDark}"/>
    <path d="M10.5 29.6c0-7.2 8.4-14.6 18.6-14.6 5.3 0 8.4 2.2 8.4 5.5 0 7.2-8.4 14.6-18.6 14.6-5.3 0-8.4-2.2-8.4-5.5z" fill="${R.salmon}"/>
    <path d="M14.6 30.5c4-4.6 9-8.6 14.4-11M17 34.6c4-4.6 9-8.6 14.4-11M12.9 25.6c4-4.6 9-8.6 14.4-11" stroke="${R.salmonStripe}" stroke-width="2.1" stroke-linecap="round" fill="none"/>`,

  tuna_slice: `
    <path d="M11 31c0-7.4 8-14.4 18-14.4 5.2 0 8 2.2 8 5.4 0 7.4-8 14.4-18 14.4-5.2 0-8-2.2-8-5.4z" fill="${R.tunaDark}"/>
    <path d="M11 29.8c0-7.4 8-14.4 18-14.4 5.2 0 8 2.2 8 5.4 0 7.4-8 14.4-18 14.4-5.2 0-8-2.2-8-5.4z" fill="${R.tone}"/>
    <path d="M15 31c3.8-4.4 8.6-8.2 13.8-10.6M17.6 35c3.8-4.4 8.6-8.2 13.8-10.6" stroke="${R.tunaStripe}" stroke-width="1.9" stroke-linecap="round" fill="none"/>`,

  avocado: `
    <ellipse cx="24" cy="24.8" rx="13" ry="16" fill="${R.avocado}"/>
    <ellipse cx="24" cy="24" rx="13" ry="16" fill="${R.avocadoMid}"/>
    <ellipse cx="24" cy="24" rx="10" ry="13" fill="${R.avocadoFlesh}"/>
    <circle cx="24" cy="26" r="5.6" fill="#B99378"/>
    <circle cx="24" cy="25.4" r="5.6" fill="${R.pit}"/>
    <path d="M21.5 22.8c1.2-1 2.6-1.4 3.9-1.2" stroke="#fff" stroke-opacity=".5" stroke-width="1.5" stroke-linecap="round" fill="none"/>`,

  tamago: `
    <rect x="9" y="16" width="30" height="19" rx="5" fill="${R.tamagoDark}"/>
    <rect x="9" y="15" width="30" height="18" rx="5" fill="${R.tamago}"/>
    <path d="M12 21h24M12 26h24" stroke="${R.tamagoDark}" stroke-width="1.6" stroke-linecap="round" opacity=".8"/>
    <rect x="20" y="15" width="8" height="18" fill="${R.nori}" opacity=".85"/>
    <path d="M13 18.4c2.4-1 5-1.2 7.4-.7" stroke="#fff" stroke-opacity=".6" stroke-width="1.6" stroke-linecap="round" fill="none"/>`,

  salmon_maki: makiArt(R.salmon, R.salmonDark),
  avocado_maki: makiArt(R.avocadoMid, R.avocado),

  // ---------------------------------------------------------- yemekler
  dish_nigiri_salmon: nigiriArt(R.salmon, R.salmonDark),
  dish_nigiri_tuna: nigiriArt(R.tone, R.tunaDark),
  dish_nigiri_tamago: nigiriArt(R.tamago, R.tamagoDark),
  dish_maki_salmon: makiArt(R.salmon, R.salmonDark),
  dish_maki_avocado: makiArt(R.avocadoMid, R.avocado),

  // ---------------------------------------------------------- istasyonlar
  st_rice: `
    <path d="M11 25c0-7.5 5.8-12 13-12s13 4.5 13 12z" fill="${R.riceShade}"/>
    <path d="M11.6 24c0-7 5.5-11.2 12.4-11.2S36.4 17 36.4 24z" fill="${R.rice}"/>
    <path d="M17 19.5c2.2-2.8 5-4.2 7.6-4.2" stroke="#fff" stroke-width="2" stroke-linecap="round" fill="none"/>
    <path d="M7 25h34c0 8.5-6.6 14-17 14S7 33.5 7 25z" fill="${R.ceramicShade}"/>
    <path d="M7.5 24.6h33c0 8.2-6.4 13.4-16.5 13.4S7.5 32.8 7.5 24.6z" fill="${R.ceramic}"/>
    <path d="M13 30c1.6 3.4 5.2 5.4 9 5.6" stroke="${R.ceramicShade}" stroke-width="2" stroke-linecap="round" fill="none"/>`,

  ist_kesim_somon: boardArt(`
    <path d="M12 24.4c0-4.6 5.4-9.4 12-9.4 3.4 0 5.4 1.4 5.4 3.6 0 4.6-5.4 9.4-12 9.4-3.4 0-5.4-1.4-5.4-3.6z" fill="${R.salmon}"/>
    <path d="M15 24.6c2.6-3 5.8-5.6 9.2-7M17 27.4c2.6-3 5.8-5.6 9.2-7" stroke="${R.salmonStripe}" stroke-width="1.7" stroke-linecap="round" fill="none"/>
    <path d="M30 26l9-11.5" stroke="${R.woodDark}" stroke-width="3.4" stroke-linecap="round"/>
    <path d="M30.5 25.2l7.6-9.8" stroke="#DCE3EA" stroke-width="2.2" stroke-linecap="round"/>`),

  ist_kesim_ton: boardArt(`
    <path d="M12 24.4c0-4.6 5.4-9.4 12-9.4 3.4 0 5.4 1.4 5.4 3.6 0 4.6-5.4 9.4-12 9.4-3.4 0-5.4-1.4-5.4-3.6z" fill="${R.tone}"/>
    <path d="M15 24.6c2.6-3 5.8-5.6 9.2-7M17 27.4c2.6-3 5.8-5.6 9.2-7" stroke="${R.tunaStripe}" stroke-width="1.7" stroke-linecap="round" fill="none"/>
    <path d="M30 26l9-11.5" stroke="${R.woodDark}" stroke-width="3.4" stroke-linecap="round"/>
    <path d="M30.5 25.2l7.6-9.8" stroke="#DCE3EA" stroke-width="2.2" stroke-linecap="round"/>`),

  ist_kesim_avokado: boardArt(`
    <ellipse cx="19" cy="20" rx="8.4" ry="10.4" fill="${R.avocadoMid}"/>
    <ellipse cx="19" cy="20" rx="6.4" ry="8.4" fill="${R.avocadoFlesh}"/>
    <circle cx="19" cy="21.4" r="3.6" fill="${R.pit}"/>
    <path d="M30 26l9-11.5" stroke="${R.woodDark}" stroke-width="3.4" stroke-linecap="round"/>
    <path d="M30.5 25.2l7.6-9.8" stroke="#DCE3EA" stroke-width="2.2" stroke-linecap="round"/>`),

  ist_kesim_tamago: boardArt(`
    <rect x="11" y="14" width="21" height="13" rx="4" fill="${R.tamago}"/>
    <path d="M14 18.6h15M14 22.6h15" stroke="${R.tamagoDark}" stroke-width="1.5" stroke-linecap="round"/>
    <rect x="19" y="14" width="5.5" height="13" fill="${R.nori}" opacity=".85"/>
    <path d="M32 26l7-9.5" stroke="${R.woodDark}" stroke-width="3.2" stroke-linecap="round"/>`),

  st_nori: `
    <rect x="8" y="19" width="30" height="21" rx="5" fill="${R.noriDark}" opacity=".55"/>
    <rect x="10" y="15" width="30" height="21" rx="5" fill="${R.noriDark}"/>
    <rect x="10" y="14" width="30" height="20" rx="5" fill="${R.nori}"/>
    <path d="M15 20h20M15 25h20M15 30h13" stroke="${R.noriDark}" stroke-width="1.5" stroke-linecap="round" opacity=".6"/>`,

  st_tea: `
    <path d="M37 22h3a4 4 0 0 1 0 8h-3" stroke="${R.ceramicShade}" stroke-width="3" fill="none" stroke-linecap="round"/>
    <ellipse cx="21" cy="28" rx="14" ry="11" fill="${R.ceramicShade}"/>
    <ellipse cx="21" cy="27" rx="14" ry="11" fill="${R.ceramic}"/>
    <path d="M7 26c2 3 8 5 14 5s12-2 14-5" stroke="${R.ceramicShade}" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <ellipse cx="21" cy="16" rx="6" ry="2.6" fill="${R.matcha}"/>
    <circle cx="21" cy="13.6" r="2.2" fill="${R.matcha}"/>
    <path d="M13 11c1.4-1.4 1.4-3 0-4.4M28 11c1.4-1.4 1.4-3 0-4.4" stroke="${R.matcha}" stroke-width="1.7" stroke-linecap="round" fill="none" opacity=".7"/>`,

  st_mat: `
    <rect x="5" y="17" width="38" height="16" rx="4" fill="${R.woodDark}"/>
    <rect x="5" y="16" width="38" height="15" rx="4" fill="#EBD3A8"/>
    <path d="M11 16.5v14M16 16.5v14M21 16.5v14M26 16.5v14M31 16.5v14M36 16.5v14" stroke="${R.woodDark}" stroke-width="1.5" opacity=".55"/>
    <circle cx="38" cy="24" r="8" fill="${R.nori}"/>
    <circle cx="38" cy="23.4" r="5.4" fill="${R.rice}"/>
    <circle cx="38" cy="23.4" r="2.4" fill="${R.salmon}"/>`,

  st_compost: `
    <path d="M12 26h24l-2 12a4 4 0 0 1-4 3.4H18A4 4 0 0 1 14 38z" fill="${R.woodDark}"/>
    <path d="M12.6 25.6h22.8l-1.9 11.6a3.6 3.6 0 0 1-3.6 3H18.1a3.6 3.6 0 0 1-3.6-3z" fill="${R.wood}"/>
    <path d="M24 26c0-6 3.5-9.5 9-10-.5 6-3.5 9.5-9 10z" fill="${R.avocadoMid}"/>
    <path d="M24 26c0-5-3-8-8-8.5.5 5 3 8 8 8.5z" fill="${R.avocado}"/>
    <path d="M24 26v-6" stroke="${R.avocado}" stroke-width="2" stroke-linecap="round"/>`,

  // ---------------------------------------------------------- karakterler
  ch_deniz: `
    <circle cx="24" cy="26" r="14" fill="${R.skin2}"/>
    <path d="M11 27c0 9.4 5.8 14 13 14s13-4.6 13-14c0-2.5-26-2.5-26 0z" fill="${R.hairWhite}"/>
    <path d="M10 20c0-7.7 6.3-12 14-12s14 4.3 14 12z" fill="${R.skyBlue}"/>
    <rect x="7" y="19" width="34" height="4" rx="2" fill="#8AA2C9"/>
    <circle cx="19" cy="25" r="1.7" fill="${R.ink}"/>
    <circle cx="29" cy="25" r="1.7" fill="${R.ink}"/>
    <path d="M20.5 30.5c2 1.6 5 1.6 7 0" stroke="${R.ink}" stroke-width="1.7" stroke-linecap="round" fill="none"/>`,

  ch_yaz: `
    <circle cx="24" cy="26" r="14" fill="${R.skin1}"/>
    <path d="M24 9c-9 0-15 6.6-15 15.6V31h4.6V22h20.8v9H39v-6.4C39 15.6 33 9 24 9z" fill="${R.hairDark}"/>
    <circle cx="19" cy="26" r="4" fill="none" stroke="${R.ink}" stroke-width="1.5" opacity=".8"/>
    <circle cx="29" cy="26" r="4" fill="none" stroke="${R.ink}" stroke-width="1.5" opacity=".8"/>
    <path d="M23 26h2" stroke="${R.ink}" stroke-width="1.4" opacity=".8"/>
    <circle cx="19" cy="26" r="1.5" fill="${R.ink}"/>
    <circle cx="29" cy="26" r="1.5" fill="${R.ink}"/>
    <path d="M21.5 32c1.6 1.2 4 1.2 5.6 0" stroke="${R.ink}" stroke-width="1.6" stroke-linecap="round" fill="none"/>`,

  ch_mira: `
    <circle cx="24" cy="26" r="14" fill="${R.skin1}"/>
    <path d="M10 25c0-9 6.2-14.6 14-14.6S38 16 38 25c-3-6-8-8.4-14-8.4S13 19 10 25z" fill="${R.hairBrown}"/>
    <circle cx="24" cy="8.4" r="5.4" fill="${R.hairBrown}"/>
    <path d="M18 6l8 4.4" stroke="${R.tamago}" stroke-width="2.2" stroke-linecap="round"/>
    <circle cx="19" cy="26" r="1.7" fill="${R.ink}"/>
    <circle cx="29" cy="26" r="1.7" fill="${R.ink}"/>
    <circle cx="15.5" cy="29" r="2.2" fill="${R.salmon}" opacity=".5"/>
    <circle cx="32.5" cy="29" r="2.2" fill="${R.salmon}" opacity=".5"/>
    <path d="M22 31.5c1.3 1.1 3.4 1.1 4.7 0" stroke="${R.ink}" stroke-width="1.6" stroke-linecap="round" fill="none"/>`,

  ch_kaptan: `
    <circle cx="24" cy="27" r="14" fill="${R.skin3}"/>
    <path d="M10.5 20c0-7.2 6-11.4 13.5-11.4S37.5 12.8 37.5 20z" fill="${R.ceramic}"/>
    <rect x="7" y="19.4" width="34" height="4.4" rx="2.2" fill="${R.skyBlue}"/>
    <circle cx="24" cy="14.6" r="3" fill="${R.skyBlue}"/>
    <circle cx="19" cy="27" r="1.7" fill="${R.ink}"/>
    <circle cx="29" cy="27" r="1.7" fill="${R.ink}"/>
    <path d="M20.5 32.5h7" stroke="${R.ink}" stroke-width="1.7" stroke-linecap="round"/>`,

  ch_nen: `
    <path d="M11 18l1-9 8 5z" fill="#FFE7CC"/>
    <path d="M37 18l-1-9-8 5z" fill="#FFE7CC"/>
    <path d="M13.5 16.6l.6-4.8 4.3 2.7z" fill="${R.salmon}" opacity=".7"/>
    <path d="M34.5 16.6l-.6-4.8-4.3 2.7z" fill="${R.salmon}" opacity=".7"/>
    <circle cx="24" cy="26" r="14" fill="#FFEFD9"/>
    <path d="M16.4 25c1.6 1.8 4 1.8 5.6 0M26 25c1.6 1.8 4 1.8 5.6 0" stroke="${R.ink}" stroke-width="1.7" stroke-linecap="round" fill="none"/>
    <path d="M24 29.6l-1.8-1.6h3.6z" fill="${R.salmon}"/>
    <path d="M24 29.6v1.6M24 31.2c-1 1.2-2.6 1.2-3.4 0M24 31.2c1 1.2 2.6 1.2 3.4 0" stroke="${R.ink}" stroke-width="1.4" stroke-linecap="round" fill="none"/>
    <path d="M9 26h5M9 29.5h5M34 26h5M34 29.5h5" stroke="${R.ink}" stroke-width="1.2" stroke-linecap="round" opacity=".45"/>`,

  ch_efe: `
    <circle cx="24" cy="26" r="14" fill="${R.skin1}"/>
    <path d="M11 22c0-8.4 5.8-13 13-13s13 4.6 13 13c-2.6-4.6-7.4-6.6-13-6.6S13.6 17.4 11 22z" fill="${R.hairDark}"/>
    <path d="M9.5 26v-3a14.5 14.5 0 0 1 29 0v3" stroke="${R.lavender}" stroke-width="3" fill="none" stroke-linecap="round"/>
    <rect x="6.5" y="24" width="6.5" height="10" rx="3.2" fill="${R.lavender}"/>
    <rect x="35" y="24" width="6.5" height="10" rx="3.2" fill="${R.lavender}"/>
    <circle cx="19.5" cy="26.5" r="1.7" fill="${R.ink}"/>
    <circle cx="28.5" cy="26.5" r="1.7" fill="${R.ink}"/>
    <path d="M21 31.6c1.4 1 3.6 1 5 0" stroke="${R.ink}" stroke-width="1.6" stroke-linecap="round" fill="none"/>`,


  // ---------------------------------------------------------- yeni malzemeler
  ikura: `
    <ellipse cx="24" cy="30" rx="14" ry="8" fill="${R.noriDark}"/>
    <ellipse cx="24" cy="29" rx="14" ry="8" fill="${R.nori}"/>
    <circle cx="17" cy="25" r="4.6" fill="#F3894F"/><circle cx="15.6" cy="23.6" r="1.5" fill="#FFC79A"/>
    <circle cx="26" cy="23" r="4.6" fill="#FF9A5C"/><circle cx="24.6" cy="21.6" r="1.5" fill="#FFD6B0"/>
    <circle cx="33" cy="26" r="4.4" fill="#F3894F"/><circle cx="31.7" cy="24.7" r="1.4" fill="#FFC79A"/>
    <circle cx="21" cy="30.5" r="4.2" fill="#FF9A5C"/><circle cx="19.8" cy="29.3" r="1.3" fill="#FFD6B0"/>
    <circle cx="29.5" cy="31" r="4" fill="#F3894F"/><circle cx="28.4" cy="29.9" r="1.3" fill="#FFC79A"/>`,

  tofu: `
    <path d="M10 20l14-7 14 7v13l-14 7-14-7z" fill="#E8D3A8"/>
    <path d="M10 20l14 7 14-7-14-7z" fill="#F5E6C4"/>
    <path d="M24 27v13l-14-7V20z" fill="#DCC496" opacity=".85"/>
    <path d="M15 21.5l9 4.4 9-4.4" stroke="#C9AE7C" stroke-width="1.4" fill="none" stroke-linecap="round"/>
    <ellipse cx="24" cy="20" rx="5" ry="2.2" fill="${R.rice}" opacity=".9"/>`,

  miso: `
    <path d="M10 22h28l-2.6 13.6A6 6 0 0 1 29.5 40h-11a6 6 0 0 1-5.9-4.4z" fill="${R.woodDark}"/>
    <path d="M10.6 21.6h26.8l-2.5 13a5.4 5.4 0 0 1-5.3 4.4h-11a5.4 5.4 0 0 1-5.3-4.4z" fill="${R.wood}"/>
    <ellipse cx="24" cy="22" rx="14" ry="4.8" fill="#C98F4E"/>
    <ellipse cx="24" cy="21.4" rx="11.5" ry="3.6" fill="#DCA765"/>
    <rect x="18" y="19.4" width="4" height="4" rx="1" fill="#F5E6C4"/>
    <rect x="25" y="20.6" width="3.4" height="3.4" rx="1" fill="#F5E6C4"/>
    <path d="M18 14c1.4-1.4 1.4-3 0-4.4M29 14c1.4-1.4 1.4-3 0-4.4" stroke="#DCA765" stroke-width="1.7" stroke-linecap="round" fill="none" opacity=".6"/>`,

  mochi: `
    <ellipse cx="24" cy="30" rx="14" ry="10" fill="#FFE2E8"/>
    <ellipse cx="24" cy="28.6" rx="14" ry="10" fill="#FFF0F3"/>
    <ellipse cx="18.5" cy="24" rx="4.6" ry="3" fill="#fff" opacity=".95"/>
    <path d="M18 33c3.4 2 8.6 2 12 0" stroke="#F5C9D4" stroke-width="1.8" stroke-linecap="round" fill="none"/>
    <ellipse cx="13.5" cy="29" rx="2.4" ry="1.6" fill="${R.blush}" opacity=".7"/>
    <ellipse cx="34.5" cy="29" rx="2.4" ry="1.6" fill="${R.blush}" opacity=".7"/>
    <path d="M24 18.6c0-2.4 1.8-4.2 4-4.2-.4 2.6-1.8 4-4 4.2z" fill="${R.avocadoMid}"/>`,

  tuna_maki: makiArt(R.tone, R.tunaDark),
  tamago_maki: makiArt(R.tamago, R.tamagoDark),

  st_miso: `
    <path d="M8 21h32l-3 15.6A7 7 0 0 1 30 42H18a7 7 0 0 1-7-5.4z" fill="${R.woodDark}"/>
    <path d="M8.6 20.6h30.8l-2.9 15A6.4 6.4 0 0 1 30 41H18a6.4 6.4 0 0 1-6.3-5.4z" fill="${R.wood}"/>
    <ellipse cx="24" cy="21" rx="16" ry="5.4" fill="#C98F4E"/>
    <ellipse cx="24" cy="20.2" rx="13" ry="4" fill="#DCA765"/>
    <rect x="17" y="18" width="4.4" height="4.4" rx="1.2" fill="#F5E6C4"/>
    <rect x="25" y="19.4" width="3.8" height="3.8" rx="1.2" fill="#F5E6C4"/>
    <path d="M16 13c1.6-1.6 1.6-3.4 0-5M31 13c1.6-1.6 1.6-3.4 0-5" stroke="#DCA765" stroke-width="1.8" stroke-linecap="round" fill="none" opacity=".6"/>`,

  st_tofu: `
    <rect x="6" y="28" width="36" height="9" rx="4.5" fill="${R.woodDark}"/>
    <rect x="6" y="26.5" width="36" height="8.5" rx="4.2" fill="${R.wood}"/>
    <path d="M9 18l11-6 11 6v9l-11 6-11-6z" fill="#E8D3A8"/>
    <path d="M9 18l11 5.6L31 18l-11-6z" fill="#F5E6C4"/>
    <path d="M20 23.6V33L9 27v-9z" fill="#DCC496" opacity=".85"/>
    <path d="M32 24l7-4.4" stroke="${R.woodDark}" stroke-width="3" stroke-linecap="round"/>`,

  st_mochi: `
    <ellipse cx="24" cy="33" rx="17" ry="7" fill="${R.wood}"/>
    <ellipse cx="16" cy="27" rx="8.4" ry="6.4" fill="#FFE2E8"/>
    <ellipse cx="16" cy="26" rx="8.4" ry="6.4" fill="#FFF0F3"/>
    <ellipse cx="31" cy="27" rx="7.4" ry="5.8" fill="#DCF0D4"/>
    <ellipse cx="31" cy="26" rx="7.4" ry="5.8" fill="#EAF7E4"/>
    <ellipse cx="13" cy="23.5" rx="2.8" ry="1.8" fill="#fff"/>
    <ellipse cx="28.6" cy="23.6" rx="2.4" ry="1.6" fill="#fff"/>
    <path d="M24 14l3 5h-6z" fill="${R.salmon}" opacity=".8"/>`,

  dish_sashimi: `
    <ellipse cx="24" cy="32" rx="18" ry="8" fill="${R.ceramicShade}"/>
    <ellipse cx="24" cy="30.6" rx="18" ry="8" fill="${R.ceramic}"/>
    <path d="M8 27c0-4.4 5.4-9 12-9 3.4 0 5.4 1.4 5.4 3.6 0 4.4-5.4 9-12 9C10 30.6 8 29.2 8 27z" fill="${R.salmonDark}"/>
    <path d="M8 26c0-4.4 5.4-9 12-9 3.4 0 5.4 1.4 5.4 3.6 0 4.4-5.4 9-12 9C10 29.6 8 28.2 8 26z" fill="${R.salmon}"/>
    <path d="M11 26c2.6-3 5.8-5.4 9-6.8" stroke="${R.salmonStripe}" stroke-width="1.8" stroke-linecap="round" fill="none"/>
    <path d="M22 29c0-4.2 5-8.6 11.2-8.6 3.2 0 5 1.4 5 3.4 0 4.2-5 8.6-11.2 8.6-3.2 0-5-1.4-5-3.4z" fill="${R.salmonDark}"/>
    <path d="M22 28c0-4.2 5-8.6 11.2-8.6 3.2 0 5 1.4 5 3.4 0 4.2-5 8.6-11.2 8.6-3.2 0-5-1.4-5-3.4z" fill="${R.salmon}"/>
    <path d="M25 28c2.4-2.8 5.4-5 8.4-6.4" stroke="${R.salmonStripe}" stroke-width="1.7" stroke-linecap="round" fill="none"/>
    <path d="M40 34c-2-2-3-4.4-3-7" stroke="${R.avocado}" stroke-width="2" stroke-linecap="round" fill="none"/>`,

  dish_inari: `
    <path d="M9 31c0-8 6.8-14 15-14s15 6 15 14c0 2.4-1.8 3.8-4.4 3.8H13.4C10.8 34.8 9 33.4 9 31z" fill="#D9BE86"/>
    <path d="M9.6 30c0-7.6 6.6-13.2 14.4-13.2S38.4 22.4 38.4 30c0 2.2-1.6 3.4-4 3.4H13.6c-2.4 0-4-1.2-4-3.4z" fill="#E8D3A8"/>
    <path d="M14 25c2.6-3.4 6-5.4 10-6" stroke="#F5E6C4" stroke-width="2" stroke-linecap="round" fill="none"/>
    <path d="M15 22c3 1.6 6.4 2.4 9 2.4s6-.8 9-2.4" stroke="#C9AE7C" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    <ellipse cx="24" cy="21" rx="7" ry="2.6" fill="${R.rice}"/>
    <circle cx="21" cy="20.6" r="1" fill="${R.riceShade}"/><circle cx="26" cy="21.2" r="1" fill="${R.riceShade}"/>`,

  dish_gunkan: `
    <ellipse cx="24" cy="36" rx="14" ry="5" fill="${R.riceShade}"/>
    <rect x="10" y="18" width="28" height="18" rx="6" fill="${R.noriDark}"/>
    <rect x="10" y="17" width="28" height="18" rx="6" fill="${R.nori}"/>
    <rect x="12.4" y="19.6" width="23.2" height="13" rx="4" fill="${R.rice}" opacity=".25"/>
    <circle cx="18" cy="19" r="4.2" fill="#F3894F"/><circle cx="16.8" cy="17.8" r="1.3" fill="#FFC79A"/>
    <circle cx="26" cy="17.6" r="4.2" fill="#FF9A5C"/><circle cx="24.8" cy="16.4" r="1.3" fill="#FFD6B0"/>
    <circle cx="32.6" cy="19.4" r="3.8" fill="#F3894F"/><circle cx="31.5" cy="18.3" r="1.2" fill="#FFC79A"/>
    <circle cx="22" cy="21.6" r="3.6" fill="#FF9A5C"/><circle cx="21" cy="20.6" r="1.1" fill="#FFD6B0"/>`,

  dish_maki_tuna: makiArt(R.tone, R.tunaDark),
  dish_maki_tamago: makiArt(R.tamago, R.tamagoDark),


  // ---------------------------------------------------------- zengin malzemeler
  shrimp: `
    <path d="M33 13.6c3.6.4 5.8 2.4 6.6 6-2.8-1.6-5-2.2-6.6-1.8z" fill="${R.shrimpDark}"/>
    <path d="M12 26c0-7.2 6.8-13 15.4-13 4.4 0 6.8 2 6.8 5.4 0 2.6-1.4 5.4-3.8 7.8 3 .6 4.8 2.4 5 5.2-3.4-2-6.6-2.6-9.6-1.8-2.6 2-5.6 3.2-8.6 3.2-3.4 0-5.2-2.2-5.2-6.8z" fill="${R.shrimpDark}"/>
    <path d="M12 24.8c0-7.2 6.8-13 15.4-13 4.4 0 6.8 2 6.8 5.4 0 2.6-1.4 5.4-3.8 7.8 3 .6 4.8 2.4 5 5.2-3.4-2-6.6-2.6-9.6-1.8-2.6 2-5.6 3.2-8.6 3.2-3.4 0-5.2-2.2-5.2-6.8z" fill="${R.shrimp}"/>
    <path d="M16.6 17.6c1.6 3.4 1.8 7 .6 10.8M21.8 14.6c1.8 3.8 2 7.8.8 11.8M27 13.2c1.8 3.6 2 7.2.8 10.8" stroke="${R.shrimpStripe}" stroke-width="2" stroke-linecap="round" fill="none"/>
    <circle cx="14.8" cy="23.4" r="1.8" fill="#fff" opacity=".75"/>
    <circle cx="31" cy="16" r="1.1" fill="#fff" opacity=".6"/>`,

  unagi: `
    <path d="M9 27.6c0-5.6 7-11.6 17-11.6 5.4 0 8.4 2 8.4 5 0 5.6-7 11.6-17 11.6-5.4 0-8.4-2-8.4-5z" fill="${R.unagiDark}"/>
    <path d="M9 26.4c0-5.6 7-11.6 17-11.6 5.4 0 8.4 2 8.4 5 0 5.6-7 11.6-17 11.6-5.4 0-8.4-2-8.4-5z" fill="${R.unagi}"/>
    <path d="M11.6 24.6c4.4-3.8 9.6-6.6 15.2-8M13.4 28.6c4.4-3.8 9.6-6.6 15.2-8M15.6 31.6c4-3.4 8.6-6 13.6-7.4" stroke="${R.unagiGlaze}" stroke-width="2.2" stroke-linecap="round" fill="none" opacity=".55"/>
    <path d="M12 20.8c4.6-3.2 10.4-5 16.4-4.8" stroke="#F0C48A" stroke-width="2" stroke-linecap="round" fill="none" opacity=".8"/>
    <circle cx="21" cy="21.4" r="1.3" fill="#FFF4E0"/><circle cx="26.6" cy="18.6" r="1.2" fill="#FFF4E0"/>
    <circle cx="16.4" cy="25.4" r="1.1" fill="#FFF4E0"/>`,

  cucumber: `
    <circle cx="17" cy="27" r="9.6" fill="${R.cucumberDark}"/>
    <circle cx="17" cy="26.2" r="9.6" fill="${R.cucumber}"/>
    <circle cx="17" cy="26.2" r="6.8" fill="#E4F6D4"/>
    <path d="M17 20.6v11M12 24.4l10 3.6M22 24.4l-10 3.6" stroke="${R.cucumberDark}" stroke-width="1.2" stroke-linecap="round" opacity=".7"/>
    <circle cx="32" cy="22" r="8" fill="${R.cucumberDark}"/>
    <circle cx="32" cy="21.2" r="8" fill="${R.cucumber}"/>
    <circle cx="32" cy="21.2" r="5.6" fill="#E4F6D4"/>
    <path d="M32 16.6v9.2M28 19.2l8 3M36 19.2l-8 3" stroke="${R.cucumberDark}" stroke-width="1.1" stroke-linecap="round" opacity=".7"/>`,

  mango: `
    <path d="M11 28c0-6.4 6.6-12.4 15-12.4 5 0 8 2.4 8 5.8 0 6.4-6.6 12.4-15 12.4-5 0-8-2.4-8-5.8z" fill="${R.mangoDark}"/>
    <path d="M11 26.8c0-6.4 6.6-12.4 15-12.4 5 0 8 2.4 8 5.8 0 6.4-6.6 12.4-15 12.4-5 0-8-2.4-8-5.8z" fill="${R.mango}"/>
    <path d="M14.6 27c3.2-3.6 7-6.4 11.2-8.2" stroke="#FFE0A8" stroke-width="2.2" stroke-linecap="round" fill="none"/>
    <path d="M17 30.6c3.2-3.6 7-6.4 11.2-8.2" stroke="#FFE0A8" stroke-width="1.8" stroke-linecap="round" fill="none" opacity=".8"/>
    <circle cx="30.5" cy="18.5" r="1.5" fill="#FFF3D6" opacity=".85"/>`,

  cream_cheese: `
    <path d="M11 21.4l13-6.4 13 6.4v11.2l-13 6.4-13-6.4z" fill="${R.creamDark}"/>
    <path d="M11 21.4l13 6.4 13-6.4-13-6.4z" fill="#FFFDF6"/>
    <path d="M24 27.8v11.2l-13-6.4V21.4z" fill="${R.cream}"/>
    <path d="M37 21.4v11.2l-13 6.4V27.8z" fill="#F3E4CC"/>
    <path d="M15.4 22.6c3 2 5.8 3 8.6 3s5.6-1 8.6-3" stroke="${R.creamDark}" stroke-width="1.2" fill="none" stroke-linecap="round"/>
    <ellipse cx="19" cy="19.6" rx="3.4" ry="1.7" fill="#fff" opacity=".9"/>
    <ellipse cx="16" cy="30" rx="2.2" ry="1.5" fill="${R.blush}" opacity=".5"/>
    <ellipse cx="32" cy="30" rx="2.2" ry="1.5" fill="${R.blush}" opacity=".45"/>`,

  tempura: `
    <path d="M31.4 15.4c2.8-2 5.4-1.6 7.6 1.2-2.8.6-5 1.4-6.6 2.6z" fill="${R.shrimp}"/>
    <path d="M13 27.4c-.4-3 .6-5.6 3-7.8-.6-3 .6-5.2 3.6-6.4 1.6-2.4 3.8-3.2 6.6-2.4 2.8-1 5-.4 6.6 2 3 .8 4.4 2.8 4.2 5.8 2 2.2 2.4 4.6 1.2 7.2.8 3-.2 5.2-3 6.6-1 2.8-3 4-6 3.6-2.4 1.8-4.8 1.8-7.2 0-3 .4-5-.8-6-3.6-2.6-1.4-3.6-3.4-3-5z" fill="${R.tempuraDark}"/>
    <path d="M13.8 26.4c-.4-2.8.6-5.2 2.8-7.2-.6-2.8.6-4.8 3.4-6 1.4-2.2 3.4-3 6-2.2 2.6-.8 4.6-.2 6.2 2 2.8.8 4 2.6 3.8 5.4 1.8 2 2.2 4.2 1.2 6.6.8 2.8-.2 4.8-2.8 6.2-1 2.6-2.8 3.6-5.6 3.2-2.2 1.6-4.4 1.6-6.6 0-2.8.4-4.6-.8-5.6-3.4-2.4-1.2-3.2-3-2.8-4.6z" fill="${R.tempura}"/>
    <circle cx="19.4" cy="24.6" r="2.3" fill="#FFE9C4"/><circle cx="25.4" cy="19.6" r="2.1" fill="#FFF0D6"/>
    <circle cx="30" cy="24" r="1.9" fill="#FFE9C4"/><circle cx="22.6" cy="30" r="1.8" fill="#FFF0D6"/>
    <circle cx="29" cy="30" r="1.5" fill="#FFE9C4"/><circle cx="16.6" cy="19.6" r="1.4" fill="#FFF0D6"/>
    <circle cx="10.5" cy="34" r="1.6" fill="${R.tempura}"/><circle cx="38" cy="33" r="1.3" fill="${R.tempura}"/>`,

  kappa_maki: makiArt(R.cucumber, R.cucumberDark),
  mango_maki: makiArt(R.mango, R.mangoDark),
  shrimp_maki: makiArt(R.shrimp, R.shrimpDark),
  cream_maki: makiArt(R.cream, R.creamDark),
  tempura_maki: makiArt(R.tempura, R.tempuraDark),

  dish_nigiri_shrimp: nigiriArt(R.shrimp, R.shrimpDark),
  dish_nigiri_unagi: nigiriArt(R.unagi, R.unagiDark),
  dish_maki_cucumber: makiArt(R.cucumber, R.cucumberDark),
  dish_maki_mango: makiArt(R.mango, R.mangoDark),
  dish_maki_cream: makiArt(R.cream, R.creamDark),
  dish_maki_tempura: makiArt(R.tempura, R.tempuraDark),

  treat: `
    <path d="M15 16h18l-1.6 4.4H16.6z" fill="#CFE3EC"/>
    <path d="M16.4 20.4h15.2l-2 15.2a4.2 4.2 0 0 1-4.2 3.6h-2.8a4.2 4.2 0 0 1-4.2-3.6z" fill="#A9CFDE"/>
    <path d="M17.6 20.4h5l-1.4 18.4a4.2 4.2 0 0 1-3.2-3.2z" fill="#D6EBF3"/>
    <path d="M18.6 30.4c3.4 1.4 7.4 1.4 10.8 0l-.8 5.6a4 4 0 0 1-3.9 3.2h-1.4a4 4 0 0 1-3.9-3.2z" fill="#8FBBD0"/>
    <ellipse cx="24" cy="16" rx="9" ry="2.4" fill="#E4F0F6"/>
    <circle cx="20.4" cy="24.4" r="1.6" fill="#fff" opacity=".7"/>
    <circle cx="27" cy="27.4" r="1.2" fill="#fff" opacity=".55"/>
    <path d="M30 12.6c2.6-1.4 4.6-1 6 1.2-2.6.2-4.6.6-6 1.2z" fill="#A8DF9B"/>
    <rect x="22.6" y="6" width="2" height="10" rx="1" fill="#F5BF63" transform="rotate(14 23.6 11)"/>`,

  st_treat: `
    <ellipse cx="24" cy="39.6" rx="16" ry="3.2" fill="#E3C3A5"/>
    <ellipse cx="24" cy="38.2" rx="16" ry="3.2" fill="#F1DCC6"/>
    <g transform="translate(-8 -2) scale(0.82)">
      <path d="M16.4 20.4h15.2l-2 15.2a4.2 4.2 0 0 1-4.2 3.6h-2.8a4.2 4.2 0 0 1-4.2-3.6z" fill="#A9CFDE"/>
      <path d="M17.6 20.4h5l-1.4 18.4a4.2 4.2 0 0 1-3.2-3.2z" fill="#D6EBF3"/>
      <ellipse cx="24" cy="20.4" rx="7.6" ry="2.2" fill="#E4F0F6"/>
    </g>
    <g transform="translate(11 -1) scale(0.82)">
      <path d="M16.4 20.4h15.2l-2 15.2a4.2 4.2 0 0 1-4.2 3.6h-2.8a4.2 4.2 0 0 1-4.2-3.6z" fill="#C7E4B8"/>
      <path d="M17.6 20.4h5l-1.4 18.4a4.2 4.2 0 0 1-3.2-3.2z" fill="#E4F4DA"/>
      <ellipse cx="24" cy="20.4" rx="7.6" ry="2.2" fill="#EEF8E6"/>
    </g>
    <path d="M20 9c1.4-1.4 1.4-3 0-4.4M30 9c1.4-1.4 1.4-3 0-4.4" stroke="#A9CFDE" stroke-width="1.6" stroke-linecap="round" fill="none" opacity=".7"/>`,

  dec_bot: `
    <ellipse cx="24" cy="43.2" rx="10" ry="2" fill="#6B565C" opacity=".13"/>
    <path d="M24 8V4.6" stroke="#9AA8BE" stroke-width="1.8" stroke-linecap="round"/>
    <circle cx="24" cy="4" r="2.2" fill="#FFAD93"/>
    <rect x="12.6" y="8.4" width="22.8" height="17" rx="7" fill="#B9C5D6"/>
    <rect x="12.6" y="7.6" width="22.8" height="17" rx="7" fill="#DCE4EE"/>
    <rect x="16" y="11.6" width="16" height="9.6" rx="4.8" fill="#5A6B80"/>
    <circle cx="20.6" cy="16.2" r="1.9" fill="#8FE0D2"/>
    <circle cx="27.4" cy="16.2" r="1.9" fill="#8FE0D2"/>
    <path d="M21.6 19.6c1.4 1.1 3.4 1.1 4.8 0" stroke="#8FE0D2" stroke-width="1.2" stroke-linecap="round" fill="none"/>
    <rect x="15.6" y="25.6" width="16.8" height="13" rx="4.4" fill="#B9C5D6"/>
    <rect x="15.6" y="24.8" width="16.8" height="13" rx="4.4" fill="#DCE4EE"/>
    <rect x="19.4" y="28.4" width="9.2" height="5.4" rx="2.2" fill="#9AA8BE"/>
    <circle cx="24" cy="31.1" r="1.5" fill="#FFAD93"/>
    <path d="M10.4 28.6h5.2v3.4h-5.2zM32.4 28.6h5.2v3.4h-5.2z" fill="#B9C5D6"/>
    <g transform="translate(30 22) scale(0.42)">
      <path d="M16.4 20.4h15.2l-2 15.2a4.2 4.2 0 0 1-4.2 3.6h-2.8a4.2 4.2 0 0 1-4.2-3.6z" fill="#A9CFDE"/>
      <ellipse cx="24" cy="20.4" rx="7.6" ry="2.2" fill="#E4F0F6"/>
    </g>
    <path d="M18 38.6h3.2v3.4H18zM26.8 38.6H30v3.4h-3.2z" fill="#9AA8BE"/>`,

  // ---------------------------------------------------------- yeni karakterler
  ch_poyraz: `
    <circle cx="24" cy="26" r="14" fill="${R.skin2}"/>
    <path d="M10.6 23c0-8.6 6-13.6 13.4-13.6S37.4 14.4 37.4 23c-1.6-3.4-4-5.4-7-6.2-2 2.6-5.6 3.6-9.4 3-2.6 1-4.6 3-5.4 6.2z" fill="#2F2A33"/>
    <path d="M36 20c3 1 4.4 3.4 4 6.4-1.6-2-2.8-3.6-4-4.4z" fill="#2F2A33"/>
    <circle cx="19" cy="26.5" r="1.7" fill="${R.ink}"/>
    <circle cx="29" cy="26.5" r="1.7" fill="${R.ink}"/>
    <path d="M20.6 32c2 1.7 4.8 1.7 6.8 0" stroke="${R.ink}" stroke-width="1.7" stroke-linecap="round" fill="none"/>
    <path d="M33 33l6 6" stroke="${R.woodDark}" stroke-width="3" stroke-linecap="round"/>
    <ellipse cx="39.5" cy="40" rx="4" ry="3.4" fill="${R.wood}"/>`,

  ch_ada: `
    <circle cx="24" cy="27" r="13" fill="${R.skin1}"/>
    <path d="M11.5 25c0-8.4 5.6-13.4 12.5-13.4S36.5 16.6 36.5 25c-2.4-4.6-7-6.6-12.5-6.6S13.9 20.4 11.5 25z" fill="${R.hairBrown}"/>
    <circle cx="11" cy="22" r="4" fill="${R.hairBrown}"/><circle cx="37" cy="22" r="4" fill="${R.hairBrown}"/>
    <circle cx="11" cy="22" r="2" fill="${R.salmon}"/><circle cx="37" cy="22" r="2" fill="${R.salmon}"/>
    <circle cx="19.5" cy="27" r="2" fill="${R.ink}"/>
    <circle cx="28.5" cy="27" r="2" fill="${R.ink}"/>
    <circle cx="20" cy="26.3" r=".7" fill="#fff"/><circle cx="29" cy="26.3" r=".7" fill="#fff"/>
    <path d="M21 32.4c1.6 2 4.4 2 6 0" stroke="${R.ink}" stroke-width="1.7" stroke-linecap="round" fill="none"/>
    <circle cx="15.5" cy="30.5" r="2.2" fill="${R.salmon}" opacity=".55"/>
    <circle cx="32.5" cy="30.5" r="2.2" fill="${R.salmon}" opacity=".55"/>`,

  // ---------------------------------------------------------- dekor
  dec_vase: `
    <ellipse cx="24" cy="43.2" rx="9.5" ry="2" fill="#6B565C" opacity=".13"/>
    <path d="M18.6 12.4c-1.2 4.8-3.4 6.6-6.6 7.4" stroke="#8FBF86" stroke-width="1.6" stroke-linecap="round" fill="none"/>
    <path d="M29.4 13.2c1.4 4.4 3.6 6 6.6 6.8" stroke="#A8DF9B" stroke-width="1.6" stroke-linecap="round" fill="none"/>
    <path d="M24 24V9" stroke="#8FBF86" stroke-width="1.7" stroke-linecap="round"/>
    <path d="M24 18c-3.2-1.2-5-3.4-5.4-6.6 3 .8 4.8 3 5.4 6.6z" fill="#A8DF9B"/>
    <path d="M24 20c2.8-1.4 4.4-3.6 4.6-6.8-2.8 1-4.2 3.2-4.6 6.8z" fill="#8FBF86"/>
    <g>
      <circle cx="17.4" cy="10.4" r="3.1" fill="#FFB3C2"/><circle cx="17.4" cy="10.4" r="1.3" fill="#FFE0A8"/>
      <circle cx="30.6" cy="11.4" r="2.7" fill="#F896A4"/><circle cx="30.6" cy="11.4" r="1.1" fill="#FFE0A8"/>
      <circle cx="24" cy="7.4" r="3.4" fill="#FFC9D4"/><circle cx="24" cy="7.4" r="1.4" fill="#FFDF9E"/>
    </g>
    <path d="M18.6 23.6h10.8l-1.5 13.8a4.6 4.6 0 0 1-4.6 4.2h-.1a4.6 4.6 0 0 1-4.6-4.2z" fill="#B8A6DC"/>
    <path d="M19.8 23.6h4l-1.2 17.8a4.6 4.6 0 0 1-3.9-4z" fill="#CDC0EE"/>
    <path d="M28.2 25.6c.4 4.4.1 8.8-1 13.2" stroke="#fff" stroke-opacity=".35" stroke-width="1.6" stroke-linecap="round" fill="none"/>
    <rect x="17.8" y="22.4" width="12.4" height="2.6" rx="1.3" fill="#A996D2"/>`,

  dec_noren: `
    <rect x="5" y="10.6" width="38" height="3.2" rx="1.6" fill="#8A6A4E"/>
    <rect x="5" y="10.6" width="38" height="1.3" rx="0.65" fill="#B08D6B"/>
    <path d="M6.6 13.8h10.2v22.4a1 1 0 0 1-1 1H7.6a1 1 0 0 1-1-1z" fill="#7A93C4"/>
    <path d="M18.9 13.8h10.2v24.2a1 1 0 0 1-1 1h-8.2a1 1 0 0 1-1-1z" fill="#8AA3D2"/>
    <path d="M31.2 13.8h10.2v22.4a1 1 0 0 1-1 1h-8.2a1 1 0 0 1-1-1z" fill="#7A93C4"/>
    <path d="M6.6 13.8h10.2v3.4H6.6zM18.9 13.8h10.2v3.4H18.9zM31.2 13.8h10.2v3.4H31.2z" fill="#5F7BAE" opacity=".55"/>
    <circle cx="24" cy="25.6" r="4.4" fill="#FFFDF7" opacity=".9"/>
    <path d="M21.4 25.6h5.2M24 23v5.2" stroke="#7A93C4" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M9.4 22h4.6M9.4 26h4.6M34 22h4.6M34 26h4.6" stroke="#FFFDF7" stroke-opacity=".5" stroke-width="1.5" stroke-linecap="round"/>`,

  dec_bonsai: `
    <ellipse cx="24" cy="43.4" rx="11" ry="2" fill="#6B565C" opacity=".13"/>
    <path d="M14.6 31.4h18.8l-1.6 8.4a3.4 3.4 0 0 1-3.3 2.8h-9a3.4 3.4 0 0 1-3.3-2.8z" fill="#A2603E"/>
    <path d="M14.6 31.4h6l-1 11.2a3.4 3.4 0 0 1-3.7-2.8z" fill="#C2794F"/>
    <rect x="13.4" y="29.6" width="21.2" height="2.8" rx="1.4" fill="#8A4F32"/>
    <path d="M24 31V17" stroke="#8A6A4E" stroke-width="3.2" stroke-linecap="round"/>
    <path d="M24 24.6c-3.6-1-5.8-2.8-6.6-5.6" stroke="#8A6A4E" stroke-width="2.4" stroke-linecap="round" fill="none"/>
    <path d="M24 21c3-1.2 5-3 6-5.4" stroke="#8A6A4E" stroke-width="2.2" stroke-linecap="round" fill="none"/>
    <ellipse cx="14.6" cy="17.6" rx="7.4" ry="4.6" fill="#6FA867"/>
    <ellipse cx="14.6" cy="16.6" rx="7.4" ry="4.6" fill="#8FC486"/>
    <ellipse cx="32" cy="14.4" rx="8.6" ry="5.4" fill="#6FA867"/>
    <ellipse cx="32" cy="13.4" rx="8.6" ry="5.4" fill="#A8DF9B"/>
    <ellipse cx="23.4" cy="9.6" rx="6.4" ry="4.2" fill="#8FC486"/>
    <ellipse cx="23.4" cy="8.8" rx="6.4" ry="4.2" fill="#BEEAB2"/>
    <ellipse cx="20.6" cy="7.6" rx="2.4" ry="1.4" fill="#DAF5D2" opacity=".8"/>`,

  dec_cat_bed: `
    <ellipse cx="24" cy="42.6" rx="16" ry="2.4" fill="#6B565C" opacity=".12"/>
    <ellipse cx="24" cy="33.6" rx="17" ry="8.4" fill="#E8A0A8"/>
    <ellipse cx="24" cy="32.2" rx="17" ry="8.4" fill="#F7C0C6"/>
    <ellipse cx="24" cy="31.6" rx="12.4" ry="5.6" fill="#D98F98"/>
    <ellipse cx="24" cy="31" rx="12.4" ry="5.6" fill="#FFEDEF"/>
    <path d="M13.6 26.4l.7-5.4 4.6 3.2z" fill="#FFE7CC"/>
    <path d="M14.2 25.4l.4-3 2.6 1.8z" fill="#FFB3C2"/>
    <path d="M28.4 25.2l.6-5.2 4.4 3.2z" fill="#FFE7CC"/>
    <path d="M29 24.3l.3-2.9 2.5 1.8z" fill="#FFB3C2"/>
    <ellipse cx="23.6" cy="27.4" rx="8.6" ry="6" fill="#FFE7CC"/>
    <ellipse cx="20.8" cy="24.6" rx="3" ry="2" fill="#FFF6E8" opacity=".8"/>
    <path d="M19.4 27.2c1 1.3 2.6 1.3 3.6 0M25 27.2c1 1.3 2.6 1.3 3.6 0" stroke="#6D5B60" stroke-width="1.4" stroke-linecap="round" fill="none"/>
    <path d="M23.6 30.4l-1.5-1.4h3z" fill="#F896A4"/>
    <path d="M15 28.4h-3.6M15 30.4h-3.6M32.2 28.4h3.6M32.2 30.4h3.6" stroke="#6D5B60" stroke-width="1" stroke-linecap="round" opacity=".4"/>`,

  dec_lanterns: `
    <path d="M3 8.6c7 2.6 14 3.8 21 3.8s14-1.2 21-3.8" stroke="#8A6A4E" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <g>
      <ellipse cx="11" cy="20.4" rx="6.2" ry="8" fill="#EC8768"/>
      <ellipse cx="11" cy="19.6" rx="6.2" ry="8" fill="#FFAD93"/>
      <path d="M6 16.6h10M5.2 20.4h11.6M6 24.2h10" stroke="#EC8768" stroke-width="1.2" opacity=".7"/>
      <ellipse cx="8.8" cy="16.2" rx="1.8" ry="2.6" fill="#FFD8C9" opacity=".7"/>
      <rect x="7.6" y="11.2" width="6.8" height="1.8" rx=".9" fill="#8A6A4E"/>
      <rect x="7.6" y="26.6" width="6.8" height="1.8" rx=".9" fill="#8A6A4E"/>
    </g>
    <g>
      <ellipse cx="24" cy="23.6" rx="6.8" ry="8.8" fill="#F5BF63"/>
      <ellipse cx="24" cy="22.8" rx="6.8" ry="8.8" fill="#FFD989"/>
      <path d="M18.6 19.4h10.8M17.4 23.4h13.2M18.6 27.4h10.8" stroke="#F5BF63" stroke-width="1.2" opacity=".7"/>
      <ellipse cx="21.6" cy="19" rx="2" ry="2.8" fill="#FFF0C8" opacity=".75"/>
      <rect x="20.4" y="13.6" width="7.2" height="1.9" rx=".95" fill="#8A6A4E"/>
      <rect x="20.4" y="30.4" width="7.2" height="1.9" rx=".95" fill="#8A6A4E"/>
    </g>
    <g>
      <ellipse cx="37" cy="19.4" rx="5.6" ry="7.2" fill="#B8A6DC"/>
      <ellipse cx="37" cy="18.6" rx="5.6" ry="7.2" fill="#CDC0EE"/>
      <path d="M32.4 15.6h9.2M31.8 19h10.4M32.4 22.4h9.2" stroke="#B8A6DC" stroke-width="1.1" opacity=".7"/>
      <ellipse cx="35.2" cy="15.4" rx="1.6" ry="2.3" fill="#EDE6FB" opacity=".7"/>
      <rect x="33.8" y="10.8" width="6.4" height="1.7" rx=".85" fill="#8A6A4E"/>
      <rect x="33.8" y="24.8" width="6.4" height="1.7" rx=".85" fill="#8A6A4E"/>
    </g>`,

  dec_maneki: `
    <ellipse cx="24" cy="42.6" rx="12" ry="2.2" fill="#6B565C" opacity=".13"/>
    <path d="M12.6 40.6c0-10.4 5.1-17 11.4-17s11.4 6.6 11.4 17c0 1.4-1 2.2-2.6 2.2H15.2c-1.6 0-2.6-.8-2.6-2.2z" fill="#EFE4D6"/>
    <path d="M13.4 40c0-9.8 4.8-16 10.6-16v18.8H15.4c-1.4 0-2-.6-2-2.8z" fill="#FFFDF7"/>
    <path d="M14.8 17.4l.8-6.4 5.2 3.6z" fill="#FFFDF7"/>
    <path d="M15.4 16.4l.5-3.8 3 2.1z" fill="#FFC9D4"/>
    <path d="M33.2 17.4l-.8-6.4-5.2 3.6z" fill="#EFE4D6"/>
    <path d="M32.6 16.4l-.5-3.8-3 2.1z" fill="#FFC9D4"/>
    <circle cx="24" cy="19.6" r="9.6" fill="#EFE4D6"/>
    <circle cx="23.2" cy="19" r="9.6" fill="#FFFDF7"/>
    <circle cx="20" cy="18.4" r="1.6" fill="#5A4A50"/>
    <circle cx="27" cy="18.4" r="1.6" fill="#5A4A50"/>
    <circle cx="20.5" cy="17.8" r=".5" fill="#fff"/><circle cx="27.5" cy="17.8" r=".5" fill="#fff"/>
    <path d="M23.5 22.4l-1.3-1.2h2.6z" fill="#F896A4"/>
    <path d="M23.5 22.4v1.2M23.5 23.6c-.9 1-2.2 1-2.9 0M23.5 23.6c.9 1 2.2 1 2.9 0" stroke="#8A6A6F" stroke-width="1.1" stroke-linecap="round" fill="none"/>
    <ellipse cx="16.8" cy="21.4" rx="2.2" ry="1.4" fill="#FFB3C2" opacity=".55"/>
    <ellipse cx="30.2" cy="21.4" rx="2.2" ry="1.4" fill="#FFB3C2" opacity=".55"/>
    <path d="M34.4 26.6c3.6-2.2 5-5.6 4.2-9.6-3.2 1.6-5 4.4-5.2 8z" fill="#FFFDF7"/>
    <path d="M35.2 25.4c2.6-1.8 3.6-4.2 3.2-7-2.2 1.4-3.4 3.6-3.6 6.2z" fill="#EFE4D6"/>
    <rect x="17.4" y="31.6" width="13.2" height="6.6" rx="3.3" fill="#EC8768"/>
    <rect x="17.4" y="31" width="13.2" height="6.6" rx="3.3" fill="#FFAD93"/>
    <circle cx="24" cy="34.2" r="2.2" fill="#FFD989"/>
    <circle cx="24" cy="34.2" r="1" fill="#F5BF63"/>`,

  dec_window: `
    <rect x="4" y="8" width="40" height="31" rx="4" fill="#8A6A4E"/>
    <rect x="4" y="8" width="40" height="31" rx="4" fill="none" stroke="#6E5238" stroke-width="1.2"/>
    <rect x="7.2" y="11.2" width="33.6" height="24.6" rx="2" fill="#CFE3EC"/>
    <path d="M7.2 11.2h33.6v9.6H7.2z" fill="#E4F0F6"/>
    <circle cx="15" cy="17.4" r="3.6" fill="#FFF3D6"/>
    <circle cx="15" cy="17.4" r="5.6" fill="#FFF3D6" opacity=".28"/>
    <path d="M7.2 24.4c5.6-2.4 9.4 1.4 14 0s9-1.6 14 .4c2.4 1.2 4 .8 5.6-.4v11.4H7.2z" fill="#A9CFDE"/>
    <path d="M7.2 28.6c5-1.6 8.6 1 13 0s8.4-1 13 .6c2 .8 3.4.6 4.6-.2v6.8H7.2z" fill="#8FBBD0"/>
    <path d="M11 26.6h5M20 30.4h6M31 27.4h5" stroke="#E4F0F6" stroke-opacity=".7" stroke-width="1.2" stroke-linecap="round"/>
    <path d="M24 11.2v24.6M7.2 22.4h33.6" stroke="#8A6A4E" stroke-width="2.4"/>
    <rect x="4" y="36.6" width="40" height="3.4" rx="1.7" fill="#6E5238"/>`,

  dec_lamp: `
    <ellipse cx="24" cy="43.4" rx="8" ry="1.8" fill="#6B565C" opacity=".12"/>
    <path d="M24 5v4.4" stroke="#8A6A4E" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M13.6 30.6c0-10.4 4.8-18 10.4-18s10.4 7.6 10.4 18z" fill="#F5BF63"/>
    <path d="M14.4 29.8c0-9.6 4.4-16.6 9.6-16.6v16.6z" fill="#FFF0CF"/>
    <path d="M24 13.2c5.2 0 9.6 7 9.6 16.6H24z" fill="#FFE2A6"/>
    <path d="M16.2 19.6h15.6M14.8 24.4h18.4" stroke="#F5BF63" stroke-width="1.2" opacity=".8"/>
    <ellipse cx="19.4" cy="18.4" rx="2" ry="3.2" fill="#FFF8E4" opacity=".7"/>
    <rect x="12.4" y="30" width="23.2" height="3.4" rx="1.7" fill="#8A6A4E"/>
    <rect x="12.4" y="30" width="23.2" height="1.4" rx=".7" fill="#B08D6B"/>
    <path d="M18.6 33.4h10.8l-1 6.6a2.6 2.6 0 0 1-2.6 2.2h-3.6a2.6 2.6 0 0 1-2.6-2.2z" fill="#6E5238"/>
    <path d="M19.8 33.4h3.4l-.7 8.8a2.6 2.6 0 0 1-2.3-2.2z" fill="#8A6A4E"/>`,

  // ---------------------------------------------------------- ruh hali
  ruh_mutlu: `<path d="M24 40S6 29 6 18.4A9.4 9.4 0 0 1 24 14a9.4 9.4 0 0 1 18 4.4C42 29 24 40 24 40z" fill="${R.hearts}"/>`,
  ruh_iyi: `<circle cx="24" cy="24" r="18" fill="${R.avocadoMid}"/><circle cx="18" cy="21" r="2.4" fill="#4E6B47"/><circle cx="30" cy="21" r="2.4" fill="#4E6B47"/><path d="M17 29c3.4 3.4 10.6 3.4 14 0" stroke="#4E6B47" stroke-width="2.6" stroke-linecap="round" fill="none"/>`,
  ruh_notr: `<circle cx="24" cy="24" r="18" fill="${R.tamago}"/><circle cx="18" cy="21" r="2.4" fill="#8A6C36"/><circle cx="30" cy="21" r="2.4" fill="#8A6C36"/><path d="M18 30h12" stroke="#8A6C36" stroke-width="2.6" stroke-linecap="round"/>`,
  ruh_uykulu: `<circle cx="24" cy="24" r="18" fill="${R.lavender}"/><path d="M14 22c2-2 5-2 7 0M27 22c2-2 5-2 7 0" stroke="#5E5178" stroke-width="2.4" stroke-linecap="round" fill="none"/><path d="M18 32h8l-8 6h8" stroke="#5E5178" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`,
  ruh_giden: `<path d="M38 10C22 10 10 18 10 30c0 4 2 8 2 8s10-2 16-8 10-14 10-20z" fill="${R.avocadoMid}"/><path d="M34 14C26 20 18 28 13 37" stroke="${R.avocado}" stroke-width="2" stroke-linecap="round" fill="none"/>`,

  // ---------------------------------------------------------- arayüz
  server_art: `
    <ellipse cx="24" cy="44" rx="9" ry="2.6" fill="#6B565C" opacity=".12"/>
    <path d="M17 43V33h14v10z" fill="currentColor" opacity=".85"/>
    <path d="M13.5 26.5c0-5 4.6-8.4 10.5-8.4s10.5 3.4 10.5 8.4V36c0 1.4-1 2.2-2.6 2.2H16.1c-1.6 0-2.6-.8-2.6-2.2z" fill="currentColor"/>
    <path d="M18.5 38.2V27c0-1 .8-1.6 2-1.6h7c1.2 0 2 .6 2 1.6v11.2z" fill="#FFFDF7" opacity=".92"/>
    <path d="M20.4 25.6h7.2l-1.2 3.2h-4.8z" fill="#FFFDF7"/>
    <circle cx="24" cy="12.6" r="7.4" fill="#F6D3BC"/>
    <path d="M16.8 11c0-4.6 3-7.4 7.2-7.4s7.2 2.8 7.2 7.4c-1.6-2.6-4.2-3.8-7.2-3.8s-5.6 1.2-7.2 3.8z" fill="#4A3A3F"/>
    <circle cx="21.4" cy="13" r="1.2" fill="#6D5B60"/>
    <circle cx="26.6" cy="13" r="1.2" fill="#6D5B60"/>
    <path d="M22.4 16c1 .9 2.2.9 3.2 0" stroke="#6D5B60" stroke-width="1.2" stroke-linecap="round" fill="none"/>
    <ellipse cx="18.6" cy="15.4" rx="1.7" ry="1.2" fill="#FFC9D4" opacity=".6"/>
    <ellipse cx="29.4" cy="15.4" rx="1.7" ry="1.2" fill="#FFC9D4" opacity=".6"/>
    <path d="M11 22.6h5.4v2H11z" fill="#F6D3BC"/>
    <path d="M31.6 22.6H37v2h-5.4z" fill="#F6D3BC"/>`,
  ui_kalp: `<path d="M24 40S6 29 6 18.4A9.4 9.4 0 0 1 24 14a9.4 9.4 0 0 1 18 4.4C42 29 24 40 24 40z" fill="${R.hearts}"/>`,
  ui_fener: `
    <path d="M24 4v4.4" stroke="${R.woodDark}" stroke-width="2" stroke-linecap="round"/>
    <rect x="15" y="7.6" width="18" height="3.6" rx="1.8" fill="${R.woodDark}"/>
    <path d="M24 11c8.2 0 13.4 5.6 13.4 13.2S32.2 37.4 24 37.4 10.6 31.8 10.6 24.2 15.8 11 24 11z" fill="${R.tamagoDark}"/>
    <path d="M24 11.8c7.7 0 12.6 5.3 12.6 12.4S31.7 36.6 24 36.6s-12.6-5.3-12.6-12.4S16.3 11.8 24 11.8z" fill="${R.tamago}"/>
    <path d="M17.6 14.6c-1.5 2.6-2.3 5.8-2.3 9.6s.8 7 2.3 9.6M30.4 14.6c1.5 2.6 2.3 5.8 2.3 9.6s-.8 7-2.3 9.6" stroke="${R.salmonDark}" stroke-width="1.7" fill="none" opacity=".8"/>
    <ellipse cx="24" cy="24" rx="4.2" ry="6" fill="#FFF3D6"/>
    <rect x="15" y="36" width="18" height="3.6" rx="1.8" fill="${R.woodDark}"/>
    <path d="M22 40h4l-1 4.4h-2z" fill="${R.salmon}"/>`,
  ui_takvim: `
    <rect x="7" y="11" width="34" height="30" rx="6" fill="${R.lavender}"/>
    <rect x="7" y="11" width="34" height="9" rx="4" fill="#B9AAD8"/>
    <rect x="14" y="6" width="4" height="9" rx="2" fill="#8E7DB4"/>
    <rect x="30" y="6" width="4" height="9" rx="2" fill="#8E7DB4"/>
    <circle cx="17" cy="27" r="2.6" fill="#fff"/><circle cx="24" cy="27" r="2.6" fill="#fff"/>
    <circle cx="31" cy="27" r="2.6" fill="#fff"/><circle cx="17" cy="34" r="2.6" fill="#fff"/>
    <circle cx="24" cy="34" r="2.6" fill="${R.salmon}"/>`,
  ui_tabak: `
    <ellipse cx="24" cy="28" rx="17" ry="9" fill="${R.ceramicShade}"/>
    <ellipse cx="24" cy="26.6" rx="17" ry="9" fill="${R.ceramic}"/>
    <ellipse cx="24" cy="26.2" rx="11" ry="5.4" fill="${R.ceramicShade}" opacity=".6"/>
    <path d="M9 14l4 8M15 12l2 9" stroke="${R.woodDark}" stroke-width="2.2" stroke-linecap="round"/>`,
  ui_ay: `
    <path d="M30 6a18 18 0 1 0 12 30A20 20 0 0 1 30 6z" fill="${R.tamago}"/>
    <circle cx="15" cy="19" r="2.4" fill="${R.tamagoDark}" opacity=".6"/>
    <circle cx="21" cy="30" r="1.8" fill="${R.tamagoDark}" opacity=".5"/>`,
  ui_jeton: `
    <circle cx="24" cy="25" r="17" fill="#E8B85C"/>
    <circle cx="24" cy="23.6" r="17" fill="#FFD98A"/>
    <circle cx="24" cy="23.6" r="12.6" fill="#F5C86A"/>
    <path d="M24 15.6l2.6 5.4 5.8.8-4.2 4.2 1 5.8-5.2-2.8-5.2 2.8 1-5.8-4.2-4.2 5.8-.8z" fill="#FFF0C4"/>`,
  ui_kilit: `
    <rect x="12" y="21" width="24" height="19" rx="4.5" fill="currentColor"/>
    <path d="M17 21v-4.5a7 7 0 0 1 14 0V21" stroke="currentColor" stroke-width="3.4" fill="none" stroke-linecap="round"/>
    <circle cx="24" cy="29" r="2.6" fill="#fff"/>
    <rect x="22.8" y="29" width="2.4" height="5.4" rx="1.2" fill="#fff"/>`,
  ui_onay: `<path d="M11 25l9 9 17-19" stroke="#5C7F4C" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`,
  ui_parilti: `
    <path d="M24 5l4.4 12.2L41 22l-12.6 4.8L24 39l-4.4-12.2L7 22l12.6-4.8z" fill="${R.tamago}"/>
    <path d="M38 32l1.8 4.4L44 38l-4.2 1.6L38 44l-1.8-4.4L32 38l4.2-1.6z" fill="${R.salmon}"/>`,
  ui_ok: `<path d="M10 24h26M28 15l9 9-9 9" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`,
  ui_muzik: `
    <path d="M20 34V12l16-3.4v22" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <ellipse cx="15.5" cy="34.5" rx="5.5" ry="4.6" fill="currentColor"/>
    <ellipse cx="31.5" cy="30.6" rx="5" ry="4.2" fill="currentColor"/>`,
  ui_muzik_kapali: `
    <path d="M20 34V12l16-3.4v22" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity=".45"/>
    <ellipse cx="15.5" cy="34.5" rx="5.5" ry="4.6" fill="currentColor" opacity=".45"/>
    <ellipse cx="31.5" cy="30.6" rx="5" ry="4.2" fill="currentColor" opacity=".45"/>
    <path d="M9 39L39 9" stroke="currentColor" stroke-width="3.4" stroke-linecap="round"/>`,
  ui_cikis: `
    <path d="M27 9H13a3 3 0 0 0-3 3v24a3 3 0 0 0 3 3h14" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" fill="none"/>
    <path d="M23 24h16M32 17l7 7-7 7" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`,
  ui_ses: `
    <path d="M8 19h7l9-7v24l-9-7H8z" fill="currentColor"/>
    <path d="M30 18c2.6 2.6 2.6 9.4 0 12M35 14c5 5 5 15 0 20" stroke="currentColor" stroke-width="3" stroke-linecap="round" fill="none"/>`,
  ui_sessiz: `
    <path d="M8 19h7l9-7v24l-9-7H8z" fill="currentColor"/>
    <path d="M31 18l11 12M42 18L31 30" stroke="currentColor" stroke-width="3.4" stroke-linecap="round"/>`,
};

export type ArtId = keyof typeof ART | string;

/** Atölyede üretilen tarif görsellerini kayda ekler. */
export function addArt(id: string, icerik: string) {
  ART[id] = icerik;
}

/** Malzemenin "üst kısım" rengi — özel tarif görseli buradan üretilir. */
export const INGREDIENT_COLORS: Record<string, [string, string]> = {
  salmon_slice: [R.salmon, R.salmonDark],
  tuna_slice: [R.tone, R.tunaDark],
  avocado: [R.avocadoMid, R.avocado],
  tamago: [R.tamago, R.tamagoDark],
  ikura: ["#FF9A5C", "#E8783F"],
  tofu: ["#F5E6C4", "#D9BE86"],
  mochi: ["#FFF0F3", "#F5C9D4"],
  rice: [R.rice, R.riceShade],
  nori: [R.nori, R.noriDark],
  tea: [R.matcha, "#8FB868"],
  miso: ["#DCA765", "#C98F4E"],
  shrimp: [R.shrimp, R.shrimpDark],
  unagi: [R.unagi, R.unagiDark],
  cucumber: [R.cucumber, R.cucumberDark],
  mango: [R.mango, R.mangoDark],
  cream_cheese: [R.cream, R.creamDark],
  tempura: [R.tempura, R.tempuraDark],
  salmon_maki: [R.salmon, R.salmonDark],
  tuna_maki: [R.tone, R.tunaDark],
  avocado_maki: [R.avocadoMid, R.avocado],
  tamago_maki: [R.tamago, R.tamagoDark],
  kappa_maki: [R.cucumber, R.cucumberDark],
  mango_maki: [R.mango, R.mangoDark],
  shrimp_maki: [R.shrimp, R.shrimpDark],
  cream_maki: [R.cream, R.creamDark],
  tempura_maki: [R.tempura, R.tempuraDark],
};

/** Garnitür motifleri — merkezi (0,0) olacak şekilde çizilir, sonra yuvaya taşınır. */
const GARNISH_MOTIF: Record<string, string> = {
  sesame: `<circle cx="-5" cy="0.4" r="1.6" fill="#FFF6E4"/><circle cx="0" cy="-1.6" r="1.6" fill="#F3E4C6"/><circle cx="5" cy="0.6" r="1.6" fill="#FFF6E4"/>`,
  black_sesame: `<ellipse cx="-4.6" cy="0.4" rx="1.7" ry="1.3" fill="#5C4A50"/><ellipse cx="0.4" cy="-1.6" rx="1.7" ry="1.3" fill="#6D5B60"/><ellipse cx="5" cy="0.8" rx="1.7" ry="1.3" fill="#5C4A50"/>`,
  spring_onion: `<path d="M-6.5 1.4c3-2.4 6-2.6 9 0" stroke="${R.avocado}" stroke-width="2.1" stroke-linecap="round" fill="none"/><path d="M-4 -2c2.6-1.6 5.4-1.6 7.6.4" stroke="${R.avocadoMid}" stroke-width="2" stroke-linecap="round" fill="none"/>`,
  wasabi: `<circle cx="0" cy="0" r="4.6" fill="${R.wasabi}"/><circle cx="-1.4" cy="-1.4" r="1.6" fill="#EAF5D2"/>`,
  ikura: `<circle cx="-4.4" cy="0.6" r="2.6" fill="#FF9A5C"/><circle cx="-5.2" cy="-0.2" r=".9" fill="#FFD6B0"/><circle cx="0.6" cy="-1.4" r="2.6" fill="#F3894F"/><circle cx="-0.2" cy="-2.2" r=".9" fill="#FFC79A"/><circle cx="5" cy="0.8" r="2.4" fill="#FF9A5C"/>`,
  lemon: `<path d="M-4.6 2.4A5.4 5.4 0 0 1 4.6 2.4z" fill="#FFE9A0"/><path d="M-3.4 2.2A4.2 4.2 0 0 1 3.4 2.2z" fill="#FFF4CE"/><path d="M0 2.2v-4M0 2.2l-2.6-3M0 2.2l2.6-3" stroke="#F2CF74" stroke-width=".8" stroke-linecap="round"/>`,
  nori_strip: `<rect x="-7" y="-2.6" width="14" height="5.2" rx="1.4" fill="${R.nori}"/><rect x="-7" y="-2.6" width="14" height="1.6" rx=".8" fill="#A3D0C7"/>`,
};

/**
 * Garnitürler parçanın üstünde tek bir sıraya diziliyor: sayı arttıkça
 * hem aralık hem ölçek küçülüyor, böylece hiçbiri diğerinin üstüne binmiyor
 * ve hepsi tabağın içinde kalıyor.
 */
function garnishLayout(adet: number, y: number): { x: number; y: number; olcek: number }[] {
  const aralik = adet <= 1 ? 0 : adet === 2 ? 15 : adet === 3 ? 11.5 : 9.4;
  const olcek = adet <= 2 ? 1 : adet === 3 ? 0.78 : 0.66;
  return Array.from({ length: adet }, (_, i) => ({
    x: 24 + (i - (adet - 1) / 2) * aralik,
    y,
    olcek,
  }));
}

export const MAX_GARNISHES = 4;
export const MAX_FILLINGS = 4;

/** Özel tarif çizimi: taban + iç renkler + garnitürler.
 *  İç malzemeler yan yana değil, gerçek bir suşi gibi ÜST ÜSTE katmanlanır. */
export function customRecipeArt(
  base: "nigiri" | "maki" | "gunkan",
  renkler: [string, string][],
  garniturler: string[],
): string {
  const katmanlar = renkler.length ? renkler : [[R.salmon, R.salmonDark] as [string, string]];
  let govde: string;
  let garniturY: number;

  if (base === "nigiri") {
    // Pirinç yastığı en altta, malzemeler üstüne tek tek istifleniyor.
    govde = `
      <ellipse cx="24" cy="35" rx="15.5" ry="7" fill="${R.riceShade}"/>
      <ellipse cx="24" cy="33.6" rx="15.5" ry="7" fill="${R.rice}"/>
      <circle cx="17" cy="35.4" r="1" fill="${R.riceShade}"/>
      <circle cx="29.5" cy="36" r=".9" fill="${R.riceShade}"/>`;

    const kat = 4.6;
    katmanlar.forEach(([color, koyu], i) => {
      const y = 29.5 - i * kat;
      const genislik = 30 - i * 1.8;
      const x = 24 - genislik / 2;
      const egim = i === 0 ? 0 : i % 2 ? 2.2 : -2.2;
      govde += `<g transform="rotate(${egim} 24 ${y.toFixed(1)})">
        <path d="M${x.toFixed(1)} ${(y + 4.6).toFixed(1)}a${(genislik / 2).toFixed(1)} 5.2 0 0 1 ${genislik.toFixed(1)} 0z" fill="${koyu}"/>
        <path d="M${x.toFixed(1)} ${(y + 4).toFixed(1)}a${(genislik / 2).toFixed(1)} 5 0 0 1 ${genislik.toFixed(1)} 0z" fill="${color}"/>
        <path d="M${(x + 3).toFixed(1)} ${(y + 1.8).toFixed(1)}q${(genislik / 3).toFixed(1)} -2.4 ${(genislik / 1.9).toFixed(1)} -.6" stroke="#fff" stroke-opacity=".45" stroke-width="1.4" stroke-linecap="round" fill="none"/>
      </g>`;
    });
    garniturY = Math.max(7, 29.5 - (katmanlar.length - 1) * kat - 3.4);
  } else if (base === "maki") {
    // Kesitte iç içe halkalar: her malzeme bir katman.
    const merkez = katmanlar
      .map(([color], i) => {
        const r = (6.6 * (katmanlar.length - i)) / katmanlar.length;
        return `<circle cx="24" cy="22.6" r="${r.toFixed(2)}" fill="${color}"/>`;
      })
      .join("");
    govde = `
      <circle cx="24" cy="24" r="16" fill="${R.noriDark}"/>
      <circle cx="24" cy="23.2" r="16" fill="${R.nori}"/>
      <circle cx="24" cy="23.2" r="12.6" fill="${R.riceShade}"/>
      <circle cx="24" cy="22.6" r="12.6" fill="${R.rice}"/>
      ${merkez}
      <circle cx="18.5" cy="17.5" r="1.1" fill="${R.riceShade}"/>
      <circle cx="30" cy="18.5" r="1" fill="${R.riceShade}"/>
      <circle cx="20" cy="29" r="1" fill="${R.riceShade}"/>`;
    garniturY = 8.5;
  } else {
    // Nori kayığı; dolgu katmanları kayığın içinden yukarı doğru yığılıyor.
    let dolgu = "";
    const kat = 3.9;
    katmanlar.forEach(([color, koyu], i) => {
      const cy = 18.4 - i * kat;
      const rx = 11.6 - i * 1.3;
      dolgu += `<ellipse cx="24" cy="${(cy + 0.7).toFixed(1)}" rx="${rx.toFixed(1)}" ry="4.2" fill="${koyu}"/>
        <ellipse cx="24" cy="${cy.toFixed(1)}" rx="${rx.toFixed(1)}" ry="4.2" fill="${color}"/>`;
    });
    govde = `
      <ellipse cx="24" cy="36" rx="14" ry="5" fill="${R.riceShade}"/>
      <rect x="10" y="19" width="28" height="17" rx="6" fill="${R.noriDark}"/>
      <rect x="10" y="18" width="28" height="17" rx="6" fill="${R.nori}"/>
      ${dolgu}
      <path d="M10 24v5a6 6 0 0 0 6 6h16a6 6 0 0 0 6-6v-5" fill="${R.nori}"/>`;
    garniturY = Math.max(7, 18.4 - (katmanlar.length - 1) * kat - 3.6);
  }

  const secilen = garniturler.slice(0, MAX_GARNISHES).filter((g) => GARNISH_MOTIF[g]);
  const yerler = garnishLayout(secilen.length, garniturY);
  const susler = secilen
    .map((g, i) => {
      const spot = yerler[i];
      if (!spot) return "";
      return `<g transform="translate(${spot.x.toFixed(2)} ${spot.y.toFixed(1)}) scale(${spot.olcek})">${GARNISH_MOTIF[g]}</g>`;
    })
    .join("");

  return govde + susler;
}

/** SVG markup döndürür (innerHTML için). */
export function art(id: ArtId, boyut = 28): string {
  const filling = ART[id] ?? ART.blank;
  // Ortak yumuşak dış hat: kendi stroke'u olan şekiller etkilenmez, sadece
  // düz dolgular hafif bir kontur kazanır — pastel zeminde "sticker" hissi verir.
  return (
    `<svg class="sv" viewBox="0 0 48 48" width="${boyut}" height="${boyut}" aria-hidden="true" focusable="false">` +
    `<g stroke="#6B565C" stroke-opacity="0.13" stroke-width="0.75" stroke-linejoin="round">${filling}</g>` +
    `</svg>`
  );
}

export function hasArt(id: string): boolean {
  return id in ART;
}


// ================================================================= garson avatarı
const HAIR_BACK: Record<string, (sc: string) => string> = {
  bun: () => "",
  twin_buns: () => "",
  long: (sc) => `<path d="M11 14c0-8 5.6-12.6 13-12.6S37 6 37 14v16c0 2-1.4 3-3.4 3H14.4c-2 0-3.4-1-3.4-3z" fill="${sc}"/>`,
  ponytail: (sc) => `<path d="M32 12c4.6 1.6 6.6 5.4 6 11.4-.6 5.6-3 8.6-7.2 9 2.6-3.4 3.6-6.8 3-10.2-.6-3.4-1.2-6.8-1.8-10.2z" fill="${sc}"/>`,
  short: () => "",
  messy: () => "",
};

const HAIR_FRONT: Record<string, (sc: string) => string> = {
  bun: (sc) =>
    `<circle cx="24" cy="4.2" r="4.4" fill="${sc}"/>` +
    `<path d="M15.4 12.6c0-5.6 3.7-8.8 8.6-8.8s8.6 3.2 8.6 8.8c-1.8-3.4-4.9-4.8-8.6-4.8s-6.8 1.4-8.6 4.8z" fill="${sc}"/>`,
  twin_buns: (sc) =>
    `<circle cx="13.6" cy="7.4" r="3.8" fill="${sc}"/><circle cx="34.4" cy="7.4" r="3.8" fill="${sc}"/>` +
    `<path d="M15.4 12.6c0-5.6 3.7-8.8 8.6-8.8s8.6 3.2 8.6 8.8c-1.8-3.4-4.9-4.8-8.6-4.8s-6.8 1.4-8.6 4.8z" fill="${sc}"/>`,
  long: (sc) =>
    `<path d="M15 13.4c0-6 3.9-9.4 9-9.4s9 3.4 9 9.4c-1.6-3.6-4.2-5.4-7-5.4-1.2 2.6-3.6 4-7 4.2-1.4.2-2.4.6-4 1.2z" fill="${sc}"/>`,
  ponytail: (sc) =>
    `<path d="M15.4 12.8c0-5.8 3.8-9 8.6-9s8.6 3.2 8.6 9c-1.8-3.6-4.9-5-8.6-5s-6.8 1.4-8.6 5z" fill="${sc}"/>` +
    `<circle cx="33.4" cy="12" r="2.2" fill="${sc}"/>`,
  short: (sc) =>
    `<path d="M15.2 13.6c0-6.2 3.9-9.6 8.8-9.6s8.8 3.4 8.8 9.6c-2-3.4-5-4.8-8.8-4.8s-6.8 1.4-8.8 4.8z" fill="${sc}"/>`,
  messy: (sc) =>
    `<path d="M15 13.8c0-6.2 4-9.8 9-9.8s9 3.6 9 9.8c-1.4-2.6-3.2-4-5.2-4.4l1.6-3-3.6 2.6-1.8-3.4-1.4 3.6-3.4-2.4 1.4 3c-2.4.4-4.4 1.6-5.6 4z" fill="${sc}"/>`,
};

const HAIR_ACCESSORY_ART: Record<HairAccessoryId, string> = {
  none: "",
  chopstick: `
    <g transform="rotate(-26 24 4.2)">
      <rect x="17" y="3.2" width="15" height="2" rx="1" fill="#D9B48C"/>
      <rect x="17" y="3.2" width="15" height=".8" rx=".4" fill="#F0DCC0"/>
      <rect x="30.4" y="3" width="2.4" height="2.4" rx="1" fill="#C08A5A"/>
    </g>`,
  double_chopstick: `
    <g transform="rotate(-30 24 4.2)">
      <rect x="16.6" y="2.4" width="15" height="1.9" rx=".95" fill="#D9B48C"/>
      <rect x="30" y="2.2" width="2.3" height="2.3" rx="1" fill="#C08A5A"/>
    </g>
    <g transform="rotate(-14 24 5)">
      <rect x="16.6" y="5.4" width="15" height="1.9" rx=".95" fill="#E8CBA4"/>
      <rect x="30" y="5.2" width="2.3" height="2.3" rx="1" fill="#C08A5A"/>
    </g>`,
  bandana: `
    <path d="M14.6 11.6c2.6-2 5.8-3 9.4-3s6.8 1 9.4 3l-.8 3c-2.6-1.8-5.4-2.6-8.6-2.6s-6 .8-8.6 2.6z" fill="#F2778B"/>
    <path d="M14.6 11.6c2.6-2 5.8-3 9.4-3" stroke="#FFB3BF" stroke-width="1.2" fill="none" stroke-linecap="round"/>
    <path d="M12.6 11.4l-4 1.6 4.4 1.2z" fill="#F2778B"/>
    <path d="M12.4 13.6l-3.4 3.2 4.6-.8z" fill="#E0637A"/>`,
  flower: `
    <g transform="translate(33.6 8.6)">
      <circle cx="0" cy="-3.2" r="2.5" fill="#FFC9D4"/><circle cx="3" cy="-1" r="2.5" fill="#FFC9D4"/>
      <circle cx="1.9" cy="2.6" r="2.5" fill="#FFB3C2"/><circle cx="-1.9" cy="2.6" r="2.5" fill="#FFB3C2"/>
      <circle cx="-3" cy="-1" r="2.5" fill="#FFC9D4"/>
      <circle cx="0" cy="0" r="1.9" fill="#FFDF9E"/>
    </g>`,
  cat_clip: `
    <path d="M14.4 8.2l-.6-4.6 4 2.4z" fill="#FFC9D4"/>
    <path d="M14.6 7.4l-.3-2.6 2.2 1.4z" fill="#FF9FB4"/>
    <path d="M20.6 6.2l1-4.4 2.8 3.4z" fill="#FFC9D4"/>
    <path d="M21.4 6l.5-2.5 1.6 1.9z" fill="#FF9FB4"/>`,
  ribbon: `
    <g transform="translate(32.4 7.4)">
      <path d="M0 0l-4.6-2.6v5.2z" fill="#F2778B"/>
      <path d="M0 0l4.6-2.6v5.2z" fill="#F2778B"/>
      <path d="M-4.6-2.6l1.6 2.6-1.6 2.6z" fill="#E0637A"/>
      <path d="M4.6-2.6l-1.6 2.6 1.6 2.6z" fill="#E0637A"/>
      <circle cx="0" cy="0" r="1.5" fill="#FFB3C2"/>
    </g>`,
};

const FACE_ACCESSORY_ART: Record<FaceAccessoryId, string> = {
  none: "",
  glasses: `
    <rect x="16.2" y="11.6" width="7.4" height="5.4" rx="1.6" fill="#FFFDF7" fill-opacity=".3" stroke="#6D5B60" stroke-width="1.1"/>
    <rect x="24.4" y="11.6" width="7.4" height="5.4" rx="1.6" fill="#FFFDF7" fill-opacity=".3" stroke="#6D5B60" stroke-width="1.1"/>
    <path d="M23.6 14.1h.8" stroke="#6D5B60" stroke-width="1.1"/>
    <path d="M16.2 13.6l-2.4-.8M31.8 13.6l2.4-.8" stroke="#6D5B60" stroke-width="1.1" stroke-linecap="round"/>`,
  round_glasses: `
    <circle cx="20.2" cy="14.3" r="4.1" fill="#FFFDF7" fill-opacity=".3" stroke="#8A6A6F" stroke-width="1.1"/>
    <circle cx="27.8" cy="14.3" r="4.1" fill="#FFFDF7" fill-opacity=".3" stroke="#8A6A6F" stroke-width="1.1"/>
    <path d="M24.3 14h-.6" stroke="#8A6A6F" stroke-width="1.1"/>
    <path d="M16.1 13.8l-2.2-.7M31.9 13.8l2.2-.7" stroke="#8A6A6F" stroke-width="1.1" stroke-linecap="round"/>`,
  freckles: `
    <circle cx="19.4" cy="17.2" r=".6" fill="#C98A6E"/><circle cx="21.4" cy="18.2" r=".55" fill="#C98A6E"/>
    <circle cx="17.8" cy="18.4" r=".5" fill="#C98A6E"/>
    <circle cx="28.6" cy="17.2" r=".6" fill="#C98A6E"/><circle cx="26.6" cy="18.2" r=".55" fill="#C98A6E"/>
    <circle cx="30.2" cy="18.4" r=".5" fill="#C98A6E"/>`,
};

/** Oyuncunun garson avatarını çizer. */
export function serverArt(a: Avatar): string {
  const skin = SKIN_TONES[a.skin] ?? SKIN_TONES[1]!;
  const sc = HAIR_COLORS[a.hairColor] ?? HAIR_COLORS[0]!;
  const uni = OUTFIT_COLORS[a.outfit] ?? OUTFIT_COLORS[0]!;
  const onlukRenk = APRON_COLORS[a.apron] ?? APRON_COLORS[0]!;
  const sacId = HAIR_STYLES[a.hair]?.id ?? "bun";
  const woman = a.kind === "woman";

  // Silüetler bilerek belirgin farklı: kadın dar omuz + kloş etek,
  // erkek geniş omuz + düz pantolon (bacak ayrımıyla).
  const govde = woman
    ? `<path d="M18.6 23.6h10.8l5.2 19.4H13.4z" fill="${uni}"/>`
    : `<path d="M16 23.6h16l1.2 19.4h-6.4l-.8-7.6-.8 7.6h-6.4z" fill="${uni}"/>`;

  const kollar = woman
    ? `<path d="M14.6 25h3.6v10.6h-3.6zM29.8 25h3.6v10.6h-3.6z" fill="${uni}"/>
       <circle cx="16.4" cy="36.4" r="2.3" fill="${skin}"/>
       <circle cx="31.6" cy="36.4" r="2.3" fill="${skin}"/>`
    : `<path d="M11.8 24.6h4.6v11.4h-4.6zM31.6 24.6h4.6v11.4h-4.6z" fill="${uni}"/>
       <circle cx="14.1" cy="36.8" r="2.7" fill="${skin}"/>
       <circle cx="33.9" cy="36.8" r="2.7" fill="${skin}"/>`;

  const apron = woman
    ? `<path d="M20 26.2h8l2.6 14.8H17.4z" fill="${onlukRenk}"/>`
    : `<path d="M19.4 26.2h9.2l.7 14.8H18.7z" fill="${onlukRenk}"/>`;

  // Yüz: kadın oval, erkek daha köşeli çene.
  const bass = woman
    ? `<circle cx="24" cy="14" r="8.4" fill="${skin}"/>`
    : `<path d="M15.4 12.2c0-4.9 3.7-8.2 8.6-8.2s8.6 3.3 8.6 8.2v3.2c0 4.6-3.7 7.6-8.6 7.6s-8.6-3-8.6-7.6z" fill="${skin}"/>`;

  const kaslar = woman
    ? `<path d="M17.8 12.5q2.3-1.3 4.4-.2" stroke="${sc}" stroke-width="1" stroke-linecap="round" fill="none" opacity=".7"/>
       <path d="M25.8 12.3q2.1-1.1 4.4.2" stroke="${sc}" stroke-width="1" stroke-linecap="round" fill="none" opacity=".7"/>`
    : `<path d="M17.4 12.1q2.6-1.5 4.8-.3" stroke="${sc}" stroke-width="1.7" stroke-linecap="round" fill="none"/>
       <path d="M25.8 11.8q2.2-1.2 4.8.3" stroke="${sc}" stroke-width="1.7" stroke-linecap="round" fill="none"/>`;

  // Kadında kirpik, erkekte daha kalın çekik göz.
  const gozler = woman
    ? `<path d="M17.8 15.1q2.5-3.1 5-.7-2.5 2.5-5 .7z" fill="#4A3A3F"/>
       <path d="M30.2 15.1q-2.5-3.1-5-.7 2.5 2.5 5 .7z" fill="#4A3A3F"/>
       <path d="M17.5 13.6l-1.6-1.2M30.5 13.6l1.6-1.2" stroke="#4A3A3F" stroke-width="1.1" stroke-linecap="round"/>`
    : `<path d="M17.6 15.2q2.7-3.3 5.3-.7-2.7 2.7-5.3 .7z" fill="#3B2F34"/>
       <path d="M30.4 15.2q-2.7-3.3-5.3-.7 2.7 2.7 5.3 .7z" fill="#3B2F34"/>`;

  const agiz = woman
    ? `<path d="M22.6 18.6q1.4 1.4 2.8 0" stroke="#8A6A6F" stroke-width="1.1" stroke-linecap="round" fill="none"/>`
    : `<path d="M22.2 18.8q1.8 1.5 3.6 0" stroke="#8A6A6F" stroke-width="1.2" stroke-linecap="round" fill="none"/>`;

  return `
    <ellipse cx="24" cy="45" rx="${woman ? 10 : 11}" ry="2.4" fill="#6B565C" opacity=".13"/>
    ${HAIR_BACK[sacId]?.(sc) ?? ""}
    ${govde}
    ${kollar}
    ${apron}
    <path d="M20.4 24.4h7.2l-1 2.6h-5.2z" fill="${onlukRenk}"/>
    <rect x="21.6" y="20.2" width="4.8" height="4.4" rx="1.6" fill="${skin}"/>
    ${bass}
    <ellipse cx="15.7" cy="15" rx="1.5" ry="2" fill="${skin}"/>
    <ellipse cx="32.3" cy="15" rx="1.5" ry="2" fill="${skin}"/>
    ${HAIR_FRONT[sacId]?.(sc) ?? ""}
    ${kaslar}
    ${gozler}
    <circle cx="20.1" cy="14.1" r=".7" fill="#fff" opacity=".9"/>
    <circle cx="27.9" cy="14.1" r=".7" fill="#fff" opacity=".9"/>
    ${agiz}
    <ellipse cx="17.8" cy="17.4" rx="2" ry="1.3" fill="#FFB3C2" opacity="${woman ? ".55" : ".38"}"/>
    <ellipse cx="30.2" cy="17.4" rx="2" ry="1.3" fill="#FFB3C2" opacity="${woman ? ".55" : ".38"}"/>
    ${FACE_ACCESSORY_ART[a.faceAccessory] ?? ""}
    ${HAIR_ACCESSORY_ART[a.hairAccessory] ?? ""}`;
}

/** Seçim butonları için baş çerçevesi — gövde kırpılmadan sadece kafa görünür. */
export function serverHeadSvg(a: Avatar, boyut = 54): string {
  return (
    `<svg class="sv sv-clip" viewBox="7 -2 34 28" width="${boyut}" height="${(boyut * 28) / 34}" aria-hidden="true">` +
    `<g stroke="#6B565C" stroke-opacity="0.11" stroke-width="0.7" stroke-linejoin="round">${serverArt(a)}</g>` +
    `</svg>`
  );
}

/** Panelde küçük önizleme için sarmalayıcı. */
export function serverSvg(a: Avatar, boyut = 72): string {
  return (
    `<svg class="sv" viewBox="0 0 48 48" width="${boyut}" height="${boyut}" aria-hidden="true">` +
    `<g stroke="#6B565C" stroke-opacity="0.11" stroke-width="0.7" stroke-linejoin="round">${serverArt(a)}</g>` +
    `</svg>`
  );
}

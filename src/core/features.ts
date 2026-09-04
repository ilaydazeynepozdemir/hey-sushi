/**
 * Özellik anahtarları. İlk mobil sürüm yalnızca tek kişilik oynanışla çıkıyor;
 * co-op kodu yerinde duruyor ama arayüzden gizli. Sunucu (röle) TLS ile
 * yayına alındığında `coopOnline` açılacak.
 */
export const FEATURES = {
  /** Aynı ekranda iki oyuncu (fare + klavye). */
  coopYerel: false,
  /** Oda koduyla online co-op — yayın için TLS'li röle gerekir. */
  coopOnline: false,
  /** Dil seçimi arayüzde görünsün mü? */
  languageToggle: true,
} as const;

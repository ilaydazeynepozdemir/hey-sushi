# Hey Sushi

Cozy bir suşi tezgâhı oyunu. Süre baskısı yok, kaybetmek yok.
Web (Vite + TypeScript), mobil kabuk Capacitor.

## Arkadaşınla denemek — kendi bilgisayarında çalıştır

Gereken: **Node 20+**

```bash
git clone https://github.com/ilaydazeynepozdemir/hey-sushi.git
cd hey-sushi
npm install
npm run dev
```

Terminalde çıkan adresi açın (`http://localhost:5180`).
Oyun tamamen çevrimdışı çalışır, hesap gerekmez.

> `npm run dev` ağa da açar. Aynı Wi-Fi'daki bir telefondan denemek için
> terminalde görünen **Network** adresini kullanın (`http://192.168.x.x:5180`).

## Kontroller

- **Fare / dokunmatik** — istasyona dokun, malzemeyi misafirin masasına sürükle
- **Ok tuşları** — hedef seç · **boşluk** — çalış · **shift** — servis
- **M** ses efektleri · **R** rehber

Dil sağ üstteki **EN / TR** düğmesinden; ilk açılışta cihaz diline göre seçilir.

## Komutlar

| Komut | Ne yapar |
|---|---|
| `npm run dev` | Geliştirme sunucusu (ağa açık) |
| `npm run build` | Tip kontrolü + web derlemesi |
| `npm run android` | Derle, senkronize et, Android cihazda çalıştır |
| `npm run ios` | Aynısı iOS için (Xcode gerekir) |
| `npm run screenshots` | Mağaza ekran görüntülerini üretir |
| `npm run version` | Sürüm ve versionCode artırır |
| `npm run ota` | OTA güncelleme paketi hazırlar |

## Proje yapısı

```
src/core/    Oyun mantığı — DOM yok, saf durum makinesi
src/ui/      Çizim katmanı (DOM + el çizimi SVG)
src/net/     Online co-op istemcisi (v1'de kapalı)
server/      Oda röle sunucusu (yalnız mesaj taşır)
android/     Capacitor Android projesi
magaza/      Mağaza metinleri, ekran görüntüleri, gizlilik politikası
```

Ayrıntılar: [MOBIL.md](MOBIL.md) (yayın adımları) · [ROADMAP.md](ROADMAP.md) (yol haritası)

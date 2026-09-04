# Hey Sushi — mobil yayın hazırlığı

Web tarafı Vite + TypeScript; mobil kabuk **Capacitor**. Oyun tamamen çevrimdışı
çalışır, sunucuya bağlanmaz (OTA güncelleme kontrolü hariç).

- **appId:** `app.heysushi`
- **appName:** Hey Sushi
- **Yön:** dikey + yatay
- **Dil:** İngilizce varsayılan, cihaz dili Türkçe ise Türkçe. Sağ üstteki
  EN/TR düğmesiyle her an değiştirilebilir, tercih kaydedilir.
- **v1 kapsamı:** yalnızca tek kişilik. Co-op kodu duruyor ama arayüzden gizli
  (`src/core/ozellikler.ts`).

---

## Durum

| | Durum |
|---|---|
| Android projesi | ✅ eklendi, ikon + splash üretildi, 9 eklenti bağlı |
| iOS projesi | ⛔ **eklenemedi** — tam Xcode ve CocoaPods gerekiyor (aşağıya bakın) |
| OTA altyapısı | ✅ kuruldu (capgo), paketleme betiği hazır |
| İkon / splash | ✅ `assets/` içinde 1024 ikon + 2732 splash |
| Kalıcı depolama | ✅ localStorage + native Preferences aynası |
| Oyun kaydı | ✅ gün/kalp/jeton/dükkân; gün sonunda, arka plana geçişte ve "Kaydet ve Çık"ta |
| Müzik | ✅ gerçek zamanlı üretiliyor (telifsiz, dosyasız) |

---

## iOS için gerekenler (sizin yapmanız gerekiyor)

Şu an makinede sadece Command Line Tools var. Sırasıyla:

1. **Xcode**'u App Store'dan kurun (tam sürüm, ~7 GB).
2. Xcode'u geliştirici araçları olarak seçin — parola ister, ben çalıştıramam:
   ```bash
   sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
   ```
3. **CocoaPods** kurun:
   ```bash
   brew install cocoapods
   ```
4. Sonra iOS projesi eklenebilir:
   ```bash
   npx cap add ios && npx capacitor-assets generate --ios
   ```

---

## Günlük akış

```bash
npm run dev          # tarayıcıda geliştir (vite 5180)
npm run mobil        # build + cap sync (native projeleri tazeler)
npx cap open android # Android Studio'da aç
npx cap open ios     # Xcode'da aç (iOS kurulduktan sonra)
```

---

## OTA (kablosuz güncelleme)

Mağaza build'i yalnızca native kabuğu taşır. Oyunun kendisi (JS/CSS/görseller)
bir zip olarak indirilip değiştirilebilir — içerik ve denge güncellemeleri
mağaza incelemesi beklemeden çıkar.

### Paket üretme
```bash
npm version patch          # sürümü artır
npm run build && npm run ota
```
Çıktı: `ota/hey-sushi-<surum>.zip` ve `ota/version.json`.

### Yayınlama
Bu iki dosyayı bir statik barındırmaya koyun. **GitHub Pages yeter ve bedava** —
sizde zaten github.io kurulumu var. Varsayılan adres:

```
https://ilaydazeynepozdemir.github.io/hey-sushi-updates/version.json
```

Adres `src/core/guncelleme.ts` içindeki `MANIFEST_URL` ve `scripts/ota.mjs`
içindeki `OTA_BASE_URL` ile aynı olmalı.

### Kullanıcı deneyimi
Açılışta manifest kontrol edilir. Yeni sürüm varsa paket sessizce indirilir ve
alttan bir şerit çıkar: **"Yeni sürüm hazır — Şimdi güncelle / Sonra"**.
"Sonra" derse bir sonraki açılışta devreye girer. `version.json` içine
`"sessiz": true` koyarsanız hiç sormadan sonraki açılışta uygulanır.

### ⚠️ OTA'nın sınırı
OTA **yalnızca web varlıklarını** günceller. Yeni bir native eklenti eklerseniz
OTA yetmez; mağazaya yeni bir sürüm göndermeniz gerekir. Bu yüzden ihtiyaç
duyulabilecek eklentiler baştan kuruldu:

`app`, `haptics`, `keyboard`, `network`, `preferences`, `share`,
`splash-screen`, `status-bar`, `capgo/capacitor-updater`

Yeni bir native yetenek gerekirse (kamera, bildirim, satın alma) **önce onu
kurup bir mağaza sürümü çıkarın**, sonra OTA ile besleyin.

### Mağaza kuralları
App Store (2.5.2 / 3.3.2) ve Play, kodun uygulamanın kendi WebView'inde
çalışması ve uygulamanın amacını değiştirmemesi şartıyla bu yönteme izin verir.
Yani denge/içerik güncellemesi serbest; "oyunu bambaşka bir uygulamaya
çevirmek" değil.

---

## iOS'u Xcode olmadan derlemek

Xcode makinede kurulu değil (7 GB indirme). **EAS Build bu projede kullanılamaz** —
EAS, Expo/React Native projeleri için; bu proje Vite + Capacitor. Oyunu React
Native'e taşımak tüm arayüzü yeniden yazmak demek, buna değmez.

Ama iOS'u **bulutta** derlemek mümkün, yerel Xcode gerekmez:

| Seçenek | Not |
|---|---|
| **GitHub Actions (macOS runner)** | En esnek ve ucuz. Zaten GitHub kullanıyorsunuz. `xcodebuild` + App Store Connect API anahtarı ile imzalama. |
| **Codemagic** | Capacitor desteği iyi, ücretsiz katmanı var, kurulumu en kolayı. |
| **Ionic Appflow** | Capacitor'ın kendi servisi, doğrudan muadili — ücretli. |

Her hâlükârda **Apple Developer üyeliği (yıllık $99)** ve imzalama sertifikaları
gerekiyor; bulut servisleri sertifikaları yönetebiliyor, yani Xcode'u hiç
kurmadan mağazaya çıkabilirsiniz. Yalnız `npx cap add ios` bir kez çalışmalı —
bu da CI üzerinde yapılabilir.

## Build aşamaları

### Sürüm artırma (her mağaza yüklemesinden önce)
```bash
npm run surum            # 0.1.0 → 0.1.1, versionCode +1
npm run surum -- minor   # 0.1.0 → 0.2.0
```
`package.json` ve `android/version.properties` birlikte güncellenir.
**Play aynı `versionCode`'u ikinci kez kabul etmez**, o yüzden her yüklemede artmalı.

---

### Android

**Durum: çalışıyor.** `.aab` üretiliyor (8,7 MB). Şu an *debug* imzalı —
Play'e yüklemek için önce yükleme anahtarı gerekiyor.

**1. Yükleme anahtarını siz oluşturun** (parola sizin olmalı, ben üretmemeliyim —
kaybederseniz uygulamayı bir daha güncelleyemezsiniz):
```bash
cd android
keytool -genkeypair -v -keystore hey-sushi-upload.keystore \
  -alias hey-sushi -keyalg RSA -keysize 2048 -validity 10000
```
Sonra `keystore.properties.example` dosyasını `keystore.properties` olarak
kopyalayıp parolaları yazın. İkisi de `.gitignore`'da — depoya girmezler.

> Anahtarı ve parolayı bir parola yöneticisinde yedekleyin. Play'in
> "App Signing" özelliğini açarsanız Google imzalama anahtarını saklar,
> sizde yalnızca yükleme anahtarı kalır — kaybı telafi edilebilir olur.

**2. Bundle üretin:**
```bash
npm run android:release
# → android/app/build/outputs/bundle/release/app-release.aab
```

**3. Play Console:** uygulama oluştur → kapalı test → `.aab` yükle.
(Hesap açma ve yükleme sizde; ben o adımları yapmıyorum.)

---

### iOS

**Durum: yerelde derlenemiyor** — Xcode kurulu değil. İki yol var:

**Yol A — bulutta derle (önerilen, Xcode gerekmez)**
`.github/workflows/ios.yml` hazır. macOS koşucusunda `ios/` klasörünü üretir,
CocoaPods kurar, arşivler ve `.ipa` çıkarır.

Depo sırları (Settings → Secrets and variables → Actions):

| Sır | Nereden |
|---|---|
| `APPLE_TEAM_ID` | Apple Developer → Membership |
| `ASC_KEY_ID` | App Store Connect → Users and Access → Integrations → App Store Connect API |
| `ASC_ISSUER_ID` | Aynı sayfa |
| `ASC_PRIVATE_KEY` | İndirilen `.p8` dosyasının içeriği (BEGIN/END dahil) |

Sırlar yoksa iş yine çalışır ama **imzasız doğrulama derlemesi** yapar: kodun
bozulmadığını gösterir, TestFlight'a yükleyemez.

**Yol B — yerelde Xcode**
```bash
# 1) App Store'dan Xcode kurun (~7 GB)
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
brew install cocoapods
npx cap add ios && npx capacitor-assets generate --ios
npx cap open ios
```

Her iki yolda da **Apple Developer üyeliği ($99/yıl)** gerekiyor.

> Not: hesap sistemi olmadığı için "Sign in with Apple" (kural 4.8) gerekmiyor.

---

### Android CI
`.github/workflows/android.yml` — etiket atınca (`git tag v0.1.1 && git push --tags`)
ya da elle tetiklenince `.aab` üretip artifact olarak yükler. İmza sırları:
`ANDROID_KEYSTORE_BASE64` (anahtar dosyasının base64'ü), `ANDROID_STORE_PASSWORD`,
`ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`.

```bash
base64 -i android/hey-sushi-upload.keystore | pbcopy   # sırra yapıştırın
```

---

## Mağaza öncesi kalan işler

## Sonraki sürümde açılacaklar

`src/core/ozellikler.ts` içindeki anahtarlar:

- `coopYerel` — aynı ekranda iki kişi. Kod hazır, sadece anahtarı açmak yeter.
- `coopOnline` — oda kodlu online co-op. **Önce röleyi TLS ile bir sunucuya
  kurmak gerekiyor**; iOS düz `ws://` bağlantısını engeller (App Transport
  Security). Ayrıca ev sahibi ayrılınca odanın dağılması sorunu çözülmeli.

Global tarif oylaması geldiğinde Supabase (Postgres + Auth + Storage) mantıklı
olur; şu anki kapsam için gereksiz.

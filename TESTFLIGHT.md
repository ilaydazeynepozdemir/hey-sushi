# TestFlight ile dağıtım

Xcode kurmadan, App Store incelemesi beklemeden arkadaşlarına dağıtmanın yolu.
Sırayla; her adımın kimde olduğu yazıyor.

---

## 1. Bundle ID'yi kaydet — **sen** (bir kez)

developer.apple.com → **Certificates, Identifiers & Profiles → Identifiers → +**

- Tür: **App IDs** → **App**
- Description: `Hey Sushi`
- Bundle ID: **Explicit** → `app.heysushi`
- Capabilities: hiçbirine dokunma (oyun hiçbir özel yetenek kullanmıyor)

## 2. App Store Connect'te uygulama kaydı — **sen** (bir kez)

appstoreconnect.apple.com → **My Apps → + → New App**

| Alan | Değer |
|---|---|
| Platforms | iOS |
| Name | `Hey Sushi` |
| Primary Language | English (U.S.) |
| Bundle ID | `app.heysushi` (1. adımda oluşturdun) |
| SKU | `heysushi-001` |
| User Access | Full Access |

> TestFlight için mağaza metinleri ve ekran görüntüleri **gerekmiyor** — onlar
> yalnız App Store'a çıkarken lazım. Hazırı `magaza/METIN.md` içinde.

## 3. API anahtarı oluştur — **sen** (bir kez)

App Store Connect → **Users and Access → Integrations → App Store Connect API**

- **+** ile yeni anahtar: Name `github-ci`, Access **App Manager**
- **`.p8` dosyası yalnız bir kez indirilir** — kaybedersen yeni anahtar üretmen gerekir
- Aynı sayfadan not al: **Key ID** ve **Issuer ID**

## 4. GitHub sırlarını ekle — **sen** (bir kez)

github.com/ilaydazeynepozdemir/hey-sushi → **Settings → Secrets and variables →
Actions → New repository secret**

| Sır | Değer |
|---|---|
| `APPLE_TEAM_ID` | Developer → Membership'teki 10 karakterlik Team ID |
| `ASC_KEY_ID` | 3. adımdaki Key ID |
| `ASC_ISSUER_ID` | 3. adımdaki Issuer ID |
| `ASC_PRIVATE_KEY` | `.p8` dosyasının **tüm içeriği**, `-----BEGIN`/`-----END` satırları dahil |

`.p8` içeriğini panoya almak için:
```bash
pbcopy < ~/Downloads/AuthKey_XXXXXXXXXX.p8
```

## 5. Derlemeyi çalıştır — **ben ya da sen**

github.com/ilaydazeynepozdemir/hey-sushi → **Actions → iOS → Run workflow**
→ "TestFlight'a yükle" işaretli → **Run**

Ya da etiket atarak:
```bash
npm run version && git commit -am "sürüm" && git tag v$(node -p "require('./package.json').version") && git push --tags
```

Koşu ~15-25 dakika sürer: iOS projesini üretir, pod'ları kurar, arşivler,
imzalar ve App Store Connect'e yükler. Build numarası koşu numarasından gelir,
yani her yüklemede farklı olur (Apple aynısını ikinci kez kabul etmez).

## 6. TestFlight'ta dağıt — **sen**

App Store Connect → uygulaman → **TestFlight** sekmesi.
Build "Processing" durumundan çıkınca (5-15 dk):

### Dahili test — anında, inceleme yok
- **Internal Testing → +** ile grup oluştur
- Test edecek kişileri önce **Users and Access**'ten hesabına ekle
- 100 kişiye kadar, davet e-postası anında gider

### Harici test — arkadaşların için
- **External Testing → +** ile grup oluştur (örn. "Arkadaşlar")
- Build'i gruba ata
- İlk build için Apple kısa bir **Beta App Review** yapar (genelde < 24 saat)
- Onaylanınca iki seçenek:
  - E-posta ile tek tek davet
  - **Public Link** aç → linki paylaş, 10.000 kişiye kadar kendileri katılır

### Arkadaşların ne yapacak
1. App Store'dan **TestFlight** uygulamasını kur
2. Gönderdiğin linke/davete dokun
3. Hey Sushi'yi kur — normal bir uygulama gibi ana ekrana iner

---

## Bilinmesi gerekenler

- **Build'ler 90 gün sonra dolar.** Süresi geçince yeni bir build yüklemen gerekir.
- Beta App Review yalnız **ilk** harici build için; sonraki build'ler doğrudan gider.
- "Export Compliance" sorusu çıkarsa: oyun şifreleme kullanmıyor → **No**.
- Gizlilik: veri toplanmıyor → App Privacy'de **Data Not Collected**
  (metni `magaza/gizlilik.md` içinde).

## Yapamadıklarım

3. ve 4. adımlar senin hesabının kimlik bilgileri — API anahtarı üretmek ve
GitHub sırlarına yazmak sende olmalı. 1., 2. ve 6. adımlar da Apple hesabına
girip senin adına beyan onaylamayı gerektiriyor. Sırları ekledikten sonra
5. adımı ben çalıştırabilirim.

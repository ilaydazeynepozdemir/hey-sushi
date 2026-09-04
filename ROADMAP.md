# Tsuki Suşi — yol haritası

Cozy, co-op, suşi. Web önce → Steam → mobil.

## Şu an ne var (v0.2, oynanabilir)

**Oynanış**
- Çekirdek döngü: üret → tepsiye koy → servis et → kalp
- **19 istasyon ve 22 yemek**, güne göre kademeli açılıyor (1. gün 5 istasyon, 9. günde hepsi).
  Karides, unagi, salatalık, mango, krem peynir, tempura 6–9. günlerde geliyor.
- 8 hikâyeli misafir karakteri; her birinin favorisi ve günlere yayılan küçük hikâye yayı
- "Yumuşak baskı": kaybetmek yok, süre görünmez, misafir sabırsızlanınca sadece bahşiş azalır
- **Mevsimler** — her 5 günde bir döner; gökyüzü, tepeler, deniz ve havadaki parçacıklar değişir
  (kiraz çiçeği → ateşböceği → yaprak → kar)
- **Dükkân**: jetonla 8 dekor; her biri misafirleri biraz daha sabırlı yapar
- **Rehber**: oyunun anlık durumundan "şimdi ne yapmalıyım"ı türetir, hedefi ekranda vurgular

**Tarif Atölyesi (çevrimdışı)**
- Taban (nigiri / maki / gunkan) + **en fazla 4 iç malzeme** + **en fazla 4 garnitür**
- İç malzemeler **üst üste katmanlanır**: nigiri'de pirincin üstüne dilim dilim yığılır,
  gunkan'da nori kayığından yukarı taşar, maki'de kesitte iç içe halka olur
- Görsel seçilen parçalardan otomatik üretilir — serbest çizim yok, moderasyon bu yüzden kolay.
  Garnitürler parçanın üstünde tek sıraya dizilir; sayı arttıkça aralık ve ölçek küçülür,
  katman yüksekliğine göre yukarı kayar.
- İsim + kısa not; kaydedilen tarif menüye girer ve misafirler sipariş etmeye başlar
- localStorage'da saklanır (eski tek-garnitürlü kayıtlar otomatik taşınır)

**Co-op**
- Yerel: aynı ekranda 2 oyuncu (fare + klavye)
- **Online: 4 harfli oda kodu, 4 oyuncuya kadar.** Ev sahibinin tarayıcısı otoriter;
  `server/relay.mjs` yalnızca mesaj taşıyan ~120 satırlık bir röle. Ev sahibi kendi özel
  tariflerini katılanlara gönderir. Oda dağılırsa oyun tek kişiliğe düşer, veri kaybolmaz.
- "Birlikte hazırlandı" bonusu: aynı tepsiye iki oyuncu katkı verirse kalp ×1.5

**Garson**
- Servis "ışınlanma" değil: malzemeyi bırakınca **garson tezgâhtan masaya yürür**, tepsiye
  koyar ve geri döner. Tepsideki parça garson varana kadar görünmez.
- Çalıştığın istasyonun önüne kayar; co-op'ta partnerinin nerede olduğu bir bakışta belli olur.
- **Kişiselleştirme**: kullanıcı adı, kadın/erkek, 5 ten tonu, 6 saç stili, 6 saç rengi,
  6 üniforma rengi ve 7 aksesuar (saç çubuğu, çift çubuk, bandana, çiçek, gözlük, kedi tokası).
  Hepsi çizim; seçim butonları da avatarın o seçenekle önizlemesini gösterir.
- Avatar oyuncu nesnesinin içinde durur, bu yüzden online oyunda durum yayınıyla birlikte
  diğer oyunculara otomatik ulaşır. Ad, masaların yanında garsonun altında görünür.

**Etkileşim**
- **Sürükle bırak**: istasyonda son dokunuşu basılı tutunca malzeme doğrudan parmağa yapışır;
  elindeki malzemeyi el kartından da sürükleyebilirsin. Geçerli hedefler sürükleme sırasında
  kesikli çerçeveyle işaretlenir. Dokunarak yerleştirme de aynen çalışmaya devam ediyor.
- Yerleştirme animasyonları: malzeme kavis çizerek tepsiye uçar, tepsi zıplar, üretim
  tamamlanınca istasyonda halka patlar.

**Görsel / ses**
- Tüm görseller el çizimi SVG (emoji yok), soft pastel suşi paleti; ikonlarda ortak yumuşak
  kontur ve pirinç/mochi gibi karakterli malzemelerde allık
- Mobil düzen: yatay kaydırmalı misafir ve istasyon şeritleri, büyük dokunma hedefleri
- Dosyasız WebAudio ses katmanı

### Mimari not
`src/core/` içinde DOM yok. Oyun saf bir **durum makinesi + aksiyon reducer**'ı:
`uygula(durum, aksiyon) → olaylar`. Online co-op tam olarak bunun üstüne kuruldu —
istemciler aksiyon yollar, ev sahibi aynı reducer'ı çalıştırır. Aynı sebeple 3D'ye ya da
başka bir motora geçiş sadece `src/ui/` değiştirir.

### Çalıştırma
```
npm install
npm run dev:all     # vite (5180) + röle sunucusu (5181)
```

---

## Sonraki adımlar

### 1. Online co-op (oda kodu) — en yüksek öncelik
4 harflik kod, 2–4 oyuncu, hesap zorunlu değil.

- Host-authoritative, 10–15 Hz — cozy oyun, rekabetçi netcode gerekmiyor
- İstemci `etkilesim` / `servis` aksiyonu yollar, sunucu `uygula()` çalıştırıp state yayınlar
- Sunucu: **Colyseus** (TS, `core/` doğrudan çalışır) ya da Nakama
- Tahmini: 1–2 hafta

### 2. Sohbet (yazılı + sesli)
- **Yazılı**: oda kanalı + hazır cozy ifadeler ("sen pirinç yap", "çok iyiydi", kalp).
  Hazır ifadeler önemli: mobilde klavye açmak akışı bozar, ayrıca moderasyon yükü sıfır.
- **Sesli**: WebRTC mesh (4 kişiye kadar sorunsuz), bas-konuş + otomatik seviye.
  Steam sürümünde Steam Voice de kullanılabilir.
- **Moderasyon şart**: sustur/engelle/bildir, oda sahibine sesli kapatma yetkisi.
  Yaş derecelendirmesi (Play/App Store/Steam) açık sohbet varsa değişir — planlamaya dahil et.

### 3. Suşi Randevusu (sushi date)
İki kişilik özel mod. Rekabet değil, birlikte olma hissi.

- Tek masa, tek misafir, süre baskısı yok — akşam yavaş akar
- Ortak tarif: iki kişinin de dokunması gereken adımlar (biri pirinci tutar, diğeri sarar)
- Sonunda **birlikte yapılan tabağın kartpostalı**: tarih, iki oyuncunun adı, tabağın görseli.
  Kaydedilir ve paylaşılabilir → organik pazarlama.
- Ambiyans seçimi: yağmur, kar, dolunay, fener; müzik yavaşlar
- Not: özel bir mod olarak konumla, "flört uygulaması" gibi değil — oyunun tonu bu.

### 4. Global menü oylaması  *(atölye hazır, sosyal katman kaldı)*
Tarif atölyesi çevrimdışı çalışıyor. Eksik olan paylaşım ve oylama.

**Tasarım**
1. ~~**Tarif atölyesi**~~ — yapıldı: taban + 1–2 iç malzeme + garnitür, görsel otomatik üretiliyor.
2. **Gönderim**: kişi başı haftada 1 tarif. Spam engeli.
3. **Oylama turu**: 2 haftalık pencere. Oyuncu güne başlarken küçük bir popup görür:
   3 aday tarif, birini seçer (ikili karşılaştırma değil, tek oy — hızlı ve az sürtünme).
   Popup günde 1 kez, atlanabilir olmalı — yoksa cozy hissi bozulur.
4. **Kapanış**: 2 hafta sonunda en yüksek oyu alan 1–3 tarif **Mevsim Menüsü**'ne girer,
   yaratıcısının adıyla. Kalıcı menüye değil, mevsim menüsüne — böylece menü şişmez
   ve her sezon yenilenme sebebi olur.

**Gerekenler (küçümsenmemeli)**
- Sunucu: tarif deposu, oy sayımı, tur zamanlayıcı, sonuç yayını
- **Moderasyon**: isim ve hikâye serbest metin → küfür/nefret filtresi + bildir/gözden geçir kuyruğu.
  Sabit parça sistemi görseli güvenli kılar, asıl risk metinde.
- Oy manipülasyonu: hesap başına tek oy, yeni hesap ağırlığı düşük
- Bölgesel/dil bazlı turlar (aksi halde tek dil baskın gelir)
- Yasal: UGC lisansı (kullanım hakkı) kullanım şartlarına eklenmeli

**Tahmini**: online co-op'tan sonra 3–4 hafta. Önce çevrimdışı "kendi tarifin" olarak
çıkar, sosyal katmanı sonra aç — böylece atölye tasarımını oyuncuyla test edersin.

---

## 3D kararı

Şu anki prototip 2D/DOM. 3D'ye geçmenin gerçek maliyeti kod değil, **sanat yönetimi**:
model, materyal, ışık, animasyon. Cozy hissi 3D'de ışıktan ve materyalden gelir; oraya
zaman gider.

Üç yol:

| Yol | Artı | Eksi |
|---|---|---|
| **Three.js + sabit 3/4 kamera** | `core/` aynen kalır, web önce devam, Steam Tauri/Electron, mobil Capacitor | Kendi ışık/gölge kurulumunu yazarsın |
| **Godot 4** | Gerçek oyun motoru, ışık/animasyon/particle hazır, Steam+mobil export | `core/` GDScript'e taşınır, yeni dil |
| **2D kal, sanatı yükselt** | En ucuz, en hızlı; cozy oyunların çoğu 2D | "3D" hissi yok |

**Karar (2026-09-04): 2D kalındı, sanat yükseltiliyor.** Mevsimlik sahne katmanı, el çizimi
SVG seti ve dekor sistemi bu kararın ilk adımı. 3D tekrar gündeme gelirse Three.js yolu
geçerliliğini koruyor — `core/` tek satır değişmeden çalışır.

---

## Sıradaki iş

1. **Online co-op'u sağlamlaştır** — ev sahipliği devri, yeniden bağlanma, yayına hazır röle
2. **Yazılı sohbet** — hazır ifadelerle başla (moderasyon yükü sıfır, mobilde akışı bozmaz)
3. **Suşi Randevusu** — co-op çalıştığına göre üstüne ucuz gelir
4. **Global tarif oylaması** — sunucu + moderasyon; en son, çünkü en pahalısı

Bilinen eksikler:
- Ev sahibi ayrılınca oda dağılıyor
- Yeniden bağlanma yok
- Röle yalnız yerel geliştirme için ayarlı (TLS ve oran sınırlama yok)
- Ses katmanı sentetik; gerçek foley ile değiştirilecek

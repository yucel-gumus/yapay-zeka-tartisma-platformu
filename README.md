# 🎭 Yapay Zeka Tartışma Platformu (AI Debate Platform)

Bu proje, farklı uzmanlık alanlarına sahip yapay zeka ajanlarının (Gemini AI) belirli bir konu üzerinde gerçek zamanlı olarak tartıştığı ve sürecin sonunda daha güçlü bir "Hakem Ajan" tarafından değerlendirilip karara bağlandığı interaktif ve çok sesli bir tartışma simülasyonu platformudur. 

Proje, tartışma oturumlarının kaydedilmesi ve paylaşılabilmesi için **Firebase Firestore** entegrasyonuna sahiptir.

---

## 🌟 Öne Çıkan Özellikler

### 🎯 **Çoklu Ajan Tartışma Mimarisi**
* **4 Farklı Uzman Ajan:** Tartışmaya katılan 4 yapay zeka ajanı, kendi uzmanlık profillerine göre argümanlar üretir (Örn: Astrofizik Profesörü, Soyut Matematikçi, Teorik Fizikçi, İslam İlimleri Uzmanı vb.).
* **Dinamik Tur Sistemi (12 Tur):** Ajanlar sırayla konuşur ve bir önceki konuşmacının argümanlarını çürütmeye veya kendi fikirlerini güçlendirmeye çalışır.
* **Canlı Yanıt Akışı (Streaming):** Yanıtlar kullanıcıya kelime kelime gerçek zamanlı olarak akar.
* **Hakem Kararı (Decision Maker):** Tartışmanın sonunda 5. ve en güçlü model olan bir **Hakem Ajan (Gemini 2.5 Pro)** devreye girerek tartışmayı özetler, kazanan argümanı açıklar ve nihai kararı verir.

### ⚡ **Özelleştirilmiş Uzman Yönetimi**
* **Kendi Uzmanını Yarat:** Sisteme yeni uzmanlık alanları ekleyebilir, bunları düzenleyebilir ve silebilirsiniz.
* **AI Destekli Profil Oluşturma:** Yeni bir uzman eklerken, yapay zeka otomatik olarak o uzman için uygun bir biyografi ve yaklaşım stili tasarlar.
* **Kalıcı Yerel Depolama:** Eklediğiniz özel uzmanlar `localStorage` üzerinde saklanır.

### 🔗 **Firebase & Paylaşım Altyapısı**
* **Paylaşılabilir Tartışma Linkleri:** Tamamlanan tartışmaları **Firebase Firestore** üzerine tek tıkla kaydedebilirsiniz.
* **Dinamik Oturum Yükleme (`/d/[id]`):** Sistem size benzersiz bir paylaşım linki oluşturur. Bu linki alan diğer kullanıcılar, tartışmanın tüm turlarını ve hakem kararını birebir olarak görüntüleyebilir.

---

## 🛠️ Teknoloji Stack

* **Frontend:** Next.js 15 (Turbopack), React 19, TypeScript.
* **Tasarım & UI/UX:** TailwindCSS v4, Glassmorphism blur efektleri, Gradient animasyonlar.
* **Veritabanı & Paylaşım:** Firebase 12 (Firestore Client SDK).
* **Yapay Zeka:** Google Gemini API (Gemini 2.5/2.0 Flash ve Gemini 2.5 Pro).
* **Durum & Akış Yönetimi:** Custom React Hooks (`useDebateLogic`, `useBranchManagement`).

---

## 📂 Proje Yapısı

```
src/
├── app/
│   ├── api/
│   │   ├── chat/route.ts          # Uzman ajanların promptlarını yöneten API geçidi
│   │   ├── judge/route.ts         # Hakem kararlarını yöneten API
│   │   └── generate-description/  # Yeni uzman profilleri için AI açıklama üreteci
│   ├── d/[id]/                    # Firebase üzerinden paylaşılan tartışmaların yüklendiği dinamik sayfa
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                 # Ana tartışma kurulum ve izleme sayfası
├── components/                  # AddBranchModal, ChatDisplay, ChatMessage, ShareModal, JudgePopup
├── hooks/                       # Tartışma mantığı ve uzman yönetimi state kancaları
├── lib/                         # Firebase istemcisi ve Gemini istemcisi konfigürasyonları
└── utils/                       # shareUtils.ts (Firebase veri kaydetme/yükleme araçları)
```

---

## 🚀 Kurulum ve Çalıştırma

### 1. Bağımlılıkları Yükleyin
```bash
git clone https://github.com/yucel-gumus/yapay-zeka-tartisma-platformu.git
cd yapay-zeka-tartisma-platformu
npm install
```

### 2. Ortam Değişkenleri (`.env.local`)
Projenin çalışması için Gemini ve Firebase anahtarlarını tanımlamanız gerekir. Kök dizinde `.env.local` oluşturun:

```env
# Google Gemini API Key
NEXT_PUBLIC_GEMINI_API_KEY=AIzaSy...your_gemini_key

# Firebase Web App Config
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...your_firebase_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=app-id
```

### 3. Geliştirme Modunda Çalıştırma
```bash
npm run dev
```
Uygulama `http://localhost:3000` adresinde başlayacaktır.

---

## 🔗 Canlı Bağlantılar
* **Canlı Demo:** [https://yapay-zeka-tartisma-platformu.vercel.app/](https://yapay-zeka-tartisma-platformu.vercel.app/)
* **Geliştirici LinkedIn:** [https://linkedin.com/in/yucel-gumus](https://linkedin.com/in/yucel-gumus)

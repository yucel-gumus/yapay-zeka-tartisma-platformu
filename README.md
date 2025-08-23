# 🎭 yapay-zeka-tartisma-platformu - AI Debate Platform

**Yapay Zeka Destekli Tartışma Platformu** - Farklı uzmanlık alanlarından AI karakterlerin gerçek zamanlı tartışma yaptığı interaktif platform.

![Next.js](https://img.shields.io/badge/Next.js-15.4.6-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.1.0-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=for-the-badge&logo=tailwind-css)
![Google Gemini](https://img.shields.io/badge/Google_Gemini-AI-4285F4?style=for-the-badge&logo=google)

## 🌟 Özellikler

### 🎯 **Akıllı Tartışma Sistemi**
- **4 farklı uzman** aynı anda tartışmaya katılır
- **12 tur** boyunca devam eden dinamik tartışma
- **Gerçek zamanlı streaming** ile canlı yanıtlar
- **Hakem sistemi** ile objektif sonuç değerlendirmesi

### 🧠 **Önceden Tanımlı Uzmanlar**
- **Uzay Bilimleri Profesörü** - Astrofizik ve kozmoloji uzmanı
- **Matematikçi** - Soyut yapılar ve algoritmalar uzmanı  
- **Fizikçi** - Doğa yasaları ve teorik fizik uzmanı
- **İslam İlimleri Uzmanı** - Kur'an, hadis ve fıkıh uzmanı

### ⚡ **Özel Uzmanlık Alanları**
- **Kendi uzmanını oluştur** - Özel uzmanlık alanları ekle
- **AI destekli açıklamalar** - Otomatik uzman profili oluşturma
- **Düzenleme ve silme** - Özel uzmanları yönet
- **Kalıcı saklama** - LocalStorage ile veri saklama

### 🎨 **Modern Kullanıcı Arayüzü**
- **Responsive tasarım** - Tüm cihazlarda mükemmel görünüm
- **Blur efektleri** - Modern glassmorphism tasarım
- **Gradient animasyonlar** - Dinamik görsel efektler
- **Gerçek zamanlı göstergeler** - Tartışma durumu takibi

## 🚀 Kurulum

### Gereksinimler
- Node.js 18+ 
- npm veya yarn
- Google Gemini API Key

### 1. Projeyi Klonlayın
```bash
git clone https://github.com/yucel-gumus/yapay-zeka-tartisma-platformu.git
cd yapay-zeka-tartisma-platformu
```

### 2. Bağımlılıkları Yükleyin
```bash
npm install
# veya
yarn install
```

### 3. Ortam Değişkenlerini Ayarlayın
`.env.local` dosyası oluşturun:
```env
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. Geliştirme Sunucusunu Başlatın
```bash
npm run dev
# veya
yarn dev
```

[http://localhost:3000](http://localhost:3000) adresini ziyaret edin.

## 🏗️ Proje Yapısı

```
src/
├── app/
│   ├── api/
│   │   ├── chat/route.ts          # Uzman yanıtları API
│   │   ├── judge/route.ts         # Hakem kararı API
│   │   └── generate-description/  # AI açıklama oluşturma
│   ├── globals.css               # Global stiller
│   ├── layout.tsx               # Ana layout
│   └── page.tsx                 # Ana sayfa
├── components/
│   ├── AddBranchModal.tsx       # Uzman ekleme modalı
│   ├── ChatDisplay.tsx          # Tartışma görüntüleme
│   ├── ChatMessage.tsx          # Mesaj bileşeni
│   ├── DebateSetup.tsx          # Tartışma kurulum
│   └── JudgePopup.tsx           # Hakem sonucu popup
├── hooks/
│   ├── useBranchManagement.ts   # Uzman yönetimi hook
│   └── useDebateLogic.ts        # Tartışma mantığı hook
├── data/
│   └── branches.json            # Varsayılan uzmanlar
└── lib/
    └── gemini.ts                # Google Gemini konfigürasyonu
```

## 🎮 Kullanım

### 1. **Tartışma Konusu Belirleyin**
- Ana sayfada tartışma konunuzu yazın
- Örnek: "Yapay zeka teknolojisinin toplum üzerindeki etkisi"

### 2. **Uzmanları Seçin**
- 4 farklı uzman seçin (varsayılan veya özel)
- Her uzman farklı perspektif sunacak

### 3. **Özel Uzman Oluşturun** (İsteğe bağlı)
- "Yeni Uzmanlık Alanı Ekle" butonuna tıklayın
- Uzman adı ve açıklamasını girin
- AI ile otomatik açıklama oluşturabilirsiniz

### 4. **Tartışmayı Başlatın**
- "Tartışmayı Başlat" butonuna tıklayın
- 12 tur boyunca uzmanlar sırayla konuşacak
- Gerçek zamanlı yanıtları izleyin

### 5. **Hakem Kararını Alın**
- Tartışma bittiğinde "Hakem Kararını Göster" butonuna tıklayın
- AI hakem objektif bir değerlendirme yapacak

## 🔧 Teknik Detaylar

### **AI Modelleri**
- **Uzman Yanıtları**: Gemini 2.5 Flash, 2.0 Flash (çeşitli modeller)
- **Hakem Kararı**: Gemini 2.5 Pro (daha güçlü analiz)
- **Açıklama Oluşturma**: Gemini 2.5 Flash

### **Öne Çıkan Teknolojiler**
- **Next.js 15** - App Router ile modern React framework
- **TypeScript** - Tip güvenliği ve geliştirici deneyimi
- **Tailwind CSS 4** - Utility-first CSS framework
- **Google Gemini AI** - Gelişmiş dil modeli entegrasyonu
- **React Hooks** - Modern state yönetimi
- **Streaming API** - Gerçek zamanlı yanıt akışı

### **Performans Optimizasyonları**
- **Turbopack** - Hızlı geliştirme sunucusu
- **Component lazy loading** - İhtiyaç anında yükleme
- **Debounced API calls** - Gereksiz istek önleme
- **LocalStorage caching** - Hızlı veri erişimi

## 🎨 Tasarım Sistemi

### **Renk Paleti**
- **Primary**: Blue-Indigo gradient
- **Secondary**: Purple-Pink gradient  
- **Success**: Green tones
- **Warning**: Orange-Yellow gradient
- **Neutral**: Gray scale

### **Tipografi**
- **Headings**: Bold, modern sans-serif
- **Body**: Clean, readable text
- **Code**: Monospace font

### **Animasyonlar**
- **Hover effects**: Smooth transitions
- **Loading states**: Spinning indicators
- **Modal transitions**: Fade and scale
- **Gradient animations**: Dynamic backgrounds

## 🔐 Güvenlik

- **API Key güvenliği** - Environment variables kullanımı
- **Input validation** - Kullanıcı girdi doğrulama
- **Error handling** - Kapsamlı hata yönetimi
- **Rate limiting** - API çağrı sınırlaması (önerilir)

## 🚀 Deployment

### **Vercel (Önerilen)**
```bash
npm run build
vercel --prod
```

### **Diğer Platformlar**
```bash
npm run build
npm start
```

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için `LICENSE` dosyasına bakın.

## 👨‍💻 Geliştirici

**Yücel Gümüş**
- GitHub: [@yucel-gumus](https://github.com/yucel-gumus)
- LinkedIn: [Yücel Gümüş](https://linkedin.com/in/yucel-gumus)

## 🙏 Teşekkürler

- **Google Gemini AI** - Güçlü dil modeli desteği
- **Next.js Team** - Harika framework
- **Tailwind CSS** - Muhteşem styling sistemi
- **Vercel** - Kolay deployment platform

---

**⭐ Projeyi beğendiyseniz yıldız vermeyi unutmayın!**

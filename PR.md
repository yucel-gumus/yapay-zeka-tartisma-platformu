✨ Feature: Gemini AI ile Dinamik Tartışma Platformu
Bu PR, kullanıcıların belirlediği bir konu üzerinde, farklı uzmanlık alanlarına (branşlara) sahip yapay zeka modellerinin canlı bir tartışma yürüttüğü yeni bir Next.js uygulamasını içerir. Tartışma sonunda tarafsız bir yapay zeka hakemi, tüm argümanları değerlendirerek nihai bir karar verir.
🎯 Amaç
Bu projenin temel amacı, Gemini API'nin aşağıdaki yeteneklerini sergilemektir:
Çoklu Model Etkileşimi: Birden fazla yapay zeka modelinin sıralı ve mantıksal bir diyalog içinde nasıl çalışabileceğini göstermek.
Rol ve Kişilik Atama (Persona): Sistem talimatları (system prompts) ile yapay zeka modellerine belirli bir uzmanlık alanı ve tartışma stili kazandırmak.
Gerçek Zamanlı Streaming: Cevapların canlı olarak, kelime kelime ekrana yazdırılarak kullanıcı deneyimini dinamik hale getirmek.
Gelişmiş Analiz ve Özetleme: Büyük bir metin bloğunu (tüm tartışma geçmişi) analiz edip tarafsız ve net bir sonuç çıkarabilen bir modelin gücünü göstermek.
🚀 Yapılan Değişiklikler ve Uygulama Mimarisi
1. Proje Yapısı
Proje, modern web geliştirme standartlarına uygun olarak Next.js App Router kullanılarak yapılandırılmıştır.
code
Code
.
├── public/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/        # Tartışmacı modeller için streaming API rotası
│   │   │   │   └── route.ts
│   │   │   └── judge/       # Hakem model için API rotası
│   │   │       └── route.ts
│   │   ├── layout.tsx
│   │   └── page.tsx         # Ana sayfa ve tüm kullanıcı arayüzü
│   ├── components/
│   │   └── ChatMessage.tsx  # Sohbet mesajlarını göstermek için bileşen
│   ├── data/
│   │   └── branches.json    # 20 farklı uzmanlık alanı verisi
│   └── lib/
│       └── gemini.ts        # Gemini API istemcisini yapılandırma
├── .env.local               # API anahtarı burada saklanacak
├── package.json
└── tailwind.config.ts
2. Veri Kaynağı: branches.json
Kullanıcının seçebileceği 20 farklı uzmanlık alanı, detaylı açıklamalarıyla birlikte src/data/branches.json dosyasına eklendi. Bu açıklamalar, modelin rolünü daha iyi anlamasına yardımcı olacaktır.
Örnek src/data/branches.json içeriği:
code
JSON
[
  {
    "id": "tarihci",
    "name": "Tarihçi",
    "description": "Olayları tarihsel bağlamda, geçmişteki neden-sonuç ilişkileriyle analiz eder. İnsanlık tarihinden dersler çıkararak yorum yapar."
  },
  {
    "id": "ekonomist",
    "name": "Ekonomist",
    "description": "Konuları arz-talep, maliyet-fayda analizi, kıt kaynakların dağılımı ve ekonomik teşvikler penceresinden değerlendirir."
  },
e  {
    "id": "sosyolog",
    "name": "Sosyolog",
    "description": "Toplumsal yapılar, kültürel normlar, sosyal eşitsizlikler ve insan davranışlarının kolektif boyutları üzerinden argümanlar geliştirir."
  },
  {
    "id": "muhendis",
    "name": "Mühendis",
    "description": "Pragmatik ve çözüm odaklıdır. Tartışma konusunu bir problem olarak görür ve verimlilik, sistem tasarımı ve uygulanabilirlik açısından ele alır."
  },
  // ... 16 tane daha branş eklenecek ...
  {
    "id": "filozof",
    "name": "Filozof",
    "description": "Konunun etik, mantıksal ve varoluşsal temellerini sorgular. Soyut kavramlar üzerinden derinlemesine düşünür ve temel varsayımları sorgular."
  }
]
3. Frontend Geliştirmeleri (app/page.tsx)
Arayüz üç ana bölümden oluşur: Kurulum, Tartışma ve Sonuç.
Kurulum Aşaması:
branches.json dosyasından gelen 20 branş listelenir.
Kullanıcı checkbox'lar aracılığıyla tam olarak 4 branş seçebilir.
Kullanıcı tartışma konusunu bir input alanına girer.
"Tartışmayı Başlat" butonu, seçimler tamamlandığında aktif olur.
Tartışma Aşaması:
Butona tıklandığında, seçilen 4 branş rastgele olarak 4 Gemini modeline atanır.
Arayüz, canlı sohbet görünümüne geçer.
Modellerin cevapları, ChatMessage bileşeni kullanılarak sırayla ve kelime kelime ekrana yazdırılır.
"Tartışmayı Durdur" butonu bu aşamada görünürdür.
Sonuç Aşaması:
Kullanıcı tartışmayı durdurduğunda, hakem model devreye girer.
Hakem modelin nihai kararı ekranda belirgin bir şekilde gösterilir.
Durum Yönetimi (State Management):
React'in useState ve useEffect hook'ları ile yönetilir. Örnek state'ler:
selectedBranches, topic, chatHistory, isDebating, currentTurn, finalVerdict.
4. Backend API Rotaları
Bu rota, streaming cevaplar üretmek için kullanılır.
İstemciden (frontend) chatHistory, currentModel, personaDescription gibi verileri alır.
Sistem Talimatı (System Prompt) Mantığı: Her modelin tutarlı bir şekilde kendi rolünü oynaması için dinamik bir sistem talimatı oluşturulur. Bu, tartışmanın kalitesi için kritik öneme sahiptir.
Örnek Sistem Talimatı (Prompt Template):
code
Code
Sen bir {{branş_adı}}'sın. Senin görevin, {{branş_aciklamasi}} bakış açısıyla tartışmaya katılmak.
KURALLAR:
1.  Sadece kendi branşının perspektifinden konuş.
2.  Cümlelerin kısa, net ve anlaşılır olsun. Uzun paragraflar kurma.
3.  Senden önceki konuşmacının argümanını doğrudan ele al. Ona karşı bir görüş sun, argümanını çürüt veya farklı bir açıdan yaklaş. Sadece destekleyici olma, bir tartışma ortamı yarat.
4.  Tartışma konusu: "{{tartisma_konusu}}"
Bu rota, @google/generative-ai kütüphanesini kullanarak ilgili modelden (gemini-2.5-flash vb.) streaming bir yanıt alır ve bu stream'i doğrudan istemciye iletir.
Bu rota, streaming olmayan, tek seferlik bir istek-cevap rotasıdır.
İstemciden tüm chatHistory'yi ve orijinal topic'i alır.
Güçlü analiz yeteneği olan gemini-2.5-pro modelini kullanır.
Hakem modelin tarafsız ve adil olması için özel bir sistem talimatı ile beslenir.
Örnek Hakem Sistem Talimatı:
code
Code
Sen tarafsız bir hakemsin. Aşağıda, farklı uzmanların bir konu hakkındaki tartışmasının tamamı bulunmaktadır. Senin görevin bu tartışmayı analiz etmek ve sunulan tüm argümanları adil bir şekilde değerlendirmektir.
Kendi fikrini katma. Sadece tartışmada sunulan bilgilere dayanarak, başlangıçtaki tartışma konusuna en mantıklı, dengeli ve net cevabı ver.
Cevabın KISA, ÖZ ve NET olmalı. Tek bir paragrafı geçmemelidir.

Tartışma Konusu: "{{tartisma_konusu}}"
Tartışma Geçmişi:
{{tartisma_gecmisi}}

Kullanılacak modeller : 

model_id="gemini-2.5-flash", model_id="gemini-2.5-flash-lite", model_id="gemini-2.0-flash", model_id="gemini-2.0-flash-lite", model_id="gemini-2.5-pro",

GEMINI_API_KEY=AIzaSyBqr7GTcjAJlSdQyYjBi6-2lQfnz7WmQuA
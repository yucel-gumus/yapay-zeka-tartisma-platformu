# Yapay Zeka Tartışma Platformu

Farklı uzmanlıkların bir konuyu tartıştığı, argümanların AI hakem tarafından değerlendirildiği ve sonuçların bağlantıyla paylaşılabildiği bir Next.js uygulaması.

## Tartışma akışı

1. Konuyu yazın, 2–4 uzman seçin ve her uzmana bir görev verin: **savunan**, **karşı çıkan**, **varsayımları sorgulayan**, **kanıtları denetleyen**.
   **AI ile çerçeve oluştur** düğmesiyle tartışılacak tez/soru, kavram tanımları, alt iddialar ve kapsam önerisi alın. Alanları düzenleyip **Çerçeveyi onayla ve başlat** ile onaylayın. Öneri tartışmayı kendiliğinden başlatmaz; konu değiştiğinde çerçeve sıfırlanır. Öneri alınamazsa **Kendim netleştireceğim** ile aynı alanları doldurabilirsiniz. Tüm uzmanlar ve hakem aynı onaylanan çerçeveyi kullanır; ilk konu metni ayrıca korunur.
2. İsteğe bağlı kaynak bağlantılarını ve kanıt notlarını ekleyin. Bağlantıların içeriği otomatik okunmaz veya doğrulanmaz.
3. Tartışma uzunluğunu seçin: **Kısa** kişi başına 3, **Standart** 4 (varsayılan), **Derin** 6 konuşma. Bir tam turda her uzman seçim sırasıyla bir kez konuşur. Standart akış açılış → karşı argüman → çapraz sorgulama → kapanış şeklindedir. Kısa akışta sorgulama karşı argüman ve kapanışa dahil edilir; derin akışta ayrıca kanıt denetimi ve cevap turu vardır. Tartışmayı duraklatabilir, kaldığı yerden sürdürebilir veya yeni bir oturum başlatabilirsiniz.
4. En az bir uzman yanıtından sonra hakem değerlendirmesi alabilirsiniz. Başarısız istekler uzman argümanı olarak kaydedilmez.
5. Hakem önce nihai hükmü verir: tez desteklendi, çürütüldü, kanıtlanamadı veya kısmen desteklendi. Argümanı daha güçlü olan katılımcıyı ve sonucu belirleyen gerekçeyi açıklar. Ardından tutarlılık, kanıt, karşı argümana cevap ve belirsizliği kabul ölçütlerini 0–10 arasında değerlendirir; ortaklaşmalar, anlaşmazlıklar ve doğrulanması gereken iddiaları belirtir. Mevcut konuşmaları koruyarak hakemi yeniden değerlendirebilirsiniz.
6. Sonuç Firebase Firestore'a kaydedilerek `/d/[id]` bağlantısıyla paylaşılır. Kayıt hatasında oturumu kaybetmeden tekrar deneyebilirsiniz.

Hakem puanları doğruluk garantisi değildir. Yeni değerlendirmeler Python backend’de zorunlu JSON şeması ve konuşmacı listesiyle doğrulanır. Geçersiz çıktıda backend bir kez yeniden üretim dener; yine geçersizse oturum korunarak hata gösterilir. Önceden kaydedilmiş metin biçimindeki raporlar okunmaya devam eder.

Tamamlanan konuşmalar, konu, görevler, tur planı ve değerlendirme mevcut tarayıcının `localStorage` alanına otomatik kaydedilir. Yenilemeden sonra oturum duraklatılmış olarak açılır; yarım kalan konuşma aynı aşamadan yeniden istenir. Eski kayıtlı oturumların toplam 12 konuşmalık bütçesi korunur. Yeni plan ve konuşma aşamaları paylaşım kaydına da dahil edilir. Özel uzmanlar aynı tarayıcıda saklanır. Yerel kayıt, cihazlar arası senkronizasyon veya özel/veri şifreli depolama sağlamaz.

Çerçeve taslağı düzenleme sırasında da otomatik kaydedilir. Onaylanan çerçeve canlı tartışmada ve paylaşım sayfasında gösterilir. Önceki sürümden kalan, çerçevesiz oturumlar kendi konu metinleriyle devam edebilir; yeni tartışmalar çerçeve tamamlanmadan başlatılmaz.

## Teknolojiler

Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 4 ve Firebase Firestore. AI çağrıları sunucudan ayrı Python/FastAPI backend’e yapılır. Yerel backend deposu: `/Volumes/hayabusa/github_projelerim/python_backend`. Bu frontend’in mevcut `.env.local` yapılandırması `AI_API_URL=http://127.0.0.1:8000` kullanır. Backend’i bu portta çalıştırın; canlı ortamda adresi yayınlanan backend URL’siyle değiştirin.

## Kurulum

Node.js 20.9 veya üstü kullanın.

```bash
npm ci
npm run dev
```

`.env.local` dosyasına aşağıdaki yapılandırmayı ekleyin:

```env
AI_API_URL=https://your-ai-gateway.example
GATEWAY_CLIENT_API_KEY=your_gateway_client_key
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

`GEMINI_GATEWAY_URL` ve `CLIENT_API_KEY` eski isimleri de desteklenir. `GEMINI_API_KEY` bu uygulama tarafından doğrudan kullanılmaz; model seçimi ve sağlayıcı anahtarları gateway tarafındadır. Üretimde gateway adresi ve istemci anahtarı gereklidir.

## Gateway sözleşmesi

- `POST /api/debate/clarify`: `{ topic }` → `{ frame: { thesis, definitions: [{ term, meaning }], claims: ["alt iddia"], scope } }`. Frontend rotası `/api/clarify-topic` üzerinden çağrılır. Öneri, sadeleştirilmiş JSON çıktı şemasıyla üretilir ve tam alan sınırları backend’de doğrulanır. Geçersiz çıktıda bir kez yeniden üretim denenir.
- Uzman ve hakem istekleri ayrıca `debate_frame` alanını kabul eder. Yeni frontend oturumları bu onaylanan veriyi her iki isteğe de ekler; eski istemciler için alan isteğe bağlıdır. Tez/kapsam 2.000, kavram adı 150, kavram anlamı/alt iddia 1.000 karakter; en fazla 6 tanım ve 1–6 alt iddia kabul edilir.
- `POST /api/debate/turn`: `{ topic, persona: { name, description }, debate_role, sources, round_number, total_rounds, participating_experts, chat_history: [{ role, content, branch_name, debate_role, round_number, stage }] }`. `round_number` (1–6) ve `total_rounds` (3, 4 veya 6) birlikte gönderilir; eski istemciler bu alanları atlayabilir. Tüm katılımcılar ilk konuşmada da modele bildirilir. Konuşma aşamasını backend tur planından belirler. Görev ve kaynak notları ayrı alanlarla Python backend’e aktarılır; uzman istemi backend’de oluşturulur. `text/plain` yanıtı doğrudan akış olarak aktarılır. `{ "text": "..." }` JSON yanıtı tamamlandıktan sonra gösterilir. SSE bu sözleşmede desteklenmez.
- `POST /api/debate/judge`: `{ topic, sources, chat_history }` → `{ verdict, report }`. Python backend, Gemini’ye JSON çıktı şeması ve hakem system instruction verir. Rapor şeması ve katılımcı listesi iki tarafta da doğrulanır. Eski backend yalnızca `verdict` döndürürse güncel backend’in çalıştırılması gerektiği bildirilir. Backend rapor üretiminin toplam süre bütçesi 110, frontend isteğinin süre bütçesi 115 saniyedir.
- `POST /api/generate`: `{ prompt }` → `{ "text": "..." }`.

Yapılandırılmış hakem çıktısı:

```json
{
  "decision": {
    "outcome": "not_established",
    "ruling": "Bu oturumda tez kanıtlanamadı.",
    "winner": null,
    "rationale": "İddianın ispat yükü karşılanmadı. Tek konuşmacı olduğu için argüman üstünlüğü karşılaştırılamıyor."
  },
  "summary": "Gerekçeli sonuç ve sınırlar",
  "scores": [
    {
      "name": "Uzman",
      "consistency": 8,
      "evidence": 4,
      "rebuttal": 7,
      "uncertainty": 9,
      "reasoning": "Somut gerekçe"
    }
  ],
  "agreements": ["Ortaklaşılan nokta"],
  "disagreements": ["Çözülemeyen anlaşmazlık"],
  "claimsToVerify": ["Doğrulanacak iddia ve yöntem"]
}
```

## İstek ve paylaşım sınırları

API gövdesi en fazla 150 KB; konu 2.000, kaynak notları ve uzman açıklaması 4.000, uzman adı 150 karakter olabilir. Geçmiş en fazla 30 mesaj ve mesaj başına 12.000 karakter kabul eder. Gateway çağrıları 115 saniye sonra zaman aşımına uğrar. Geçici HTTP hatalarında istemci sınırlı sayıda tekrar dener; diğer hatalarda oturum korunur.

API rotaları süreç belleğinde IP başına dakikada 30 istek sınırı uygular. **Bu sınır tek süreç içindir; dağıtık/serverless kurulumda global kota sağlamaz.** `x-forwarded-for` yalnızca güvenilir ters proxy tarafından belirlenmelidir. Üretimde gateway veya hosting katmanında dağıtık limit ve bütçe kontrolü gerekir. Bu uygulama kullanıcı kimlik doğrulaması içermez.

Firestore'a yazma/okuma istemci SDK'sıyla yapılır. Firebase güvenlik kuralları bu depoda yönetilmez; üretim projesinde veri boyutu, izin verilen alanlar ve yazma yetkileri ayrıca sınırlandırılmalıdır. Paylaşılan tartışmalar herkese açık olmak üzere tasarlanmıştır. Yeni kayıtlar UUID belge kimliği kullanır; eski kısa bağlantılar sorgu ile okunmaya devam eder. Yeniden denemeler aynı belge kimliğine yazar; Firebase kuralları aynı kaydın tekrar yazılmasına uygun olmalıdır.

## Kontroller

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

Testler rapor şemasını, eski çıktı uyumluluğunu, girdi ve kota sınırlarını, görevlerin gateway'e aktarımını ve gerçek metin akışını sahte gateway yanıtlarıyla denetler. Gerçek AI ve Firebase hizmetlerini çağırmaz.

## Dizinler

- `src/hooks`: tartışma ve özel uzman yönetimi
- `src/components`: kurulum, tartışma, hakem raporu ve paylaşım arayüzleri
- `src/lib/debateProtocol.ts`: görev etiketleri ve hakem çıktısı doğrulaması; asıl üretim istemleri Python backend’in `app/core/debate_prompts.py` dosyasındadır
- `src/lib/apiGuard.ts`: API girdi ve istek sınırları
- `src/lib/gateway.ts`: gateway bağlantısı
- `src/utils/shareUtils.ts`: Firestore paylaşımı
- `tests`: davranış kontrolleri

Geliştirici: [Yücel Gümüş](https://www.yucelgumus.dev/) · [GitHub](https://github.com/yucel-gumus/yapay-zeka-tartisma-platformu)

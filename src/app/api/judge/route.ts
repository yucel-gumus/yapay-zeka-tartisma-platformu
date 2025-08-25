import { getModel, judgeModel } from '@/lib/gemini';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { chatHistory, topic } = await request.json();

    if (!chatHistory || !topic) {
      return new Response('Gerekli parametreler eksik', { status: 400 });
    }

    const model = getModel(judgeModel);
    const fallbackModel = getModel('gemini-2.5-flash');

    // Sadece uzman bot yanıtlarını al (assistant role)
    const expertOpinions = chatHistory
      .filter((msg: { role: string; branchName?: string; content: string }) => 
        msg.role === 'assistant' && msg.branchName
      )
      .map((msg: { role: string; branchName?: string; content: string }) => 
        `${msg.branchName} Uzmanı:\n${msg.content}`
      )
      .join('\n\n---\n\n');

    if (!expertOpinions.trim()) {
      return Response.json({ verdict: 'Henüz uzman görüşü bulunmadığı için karar verilemedi.' });
    }

    const judgePrompt = `Sen tarafsız bir hakemsin. Aşağıdaki uzmanların "${topic}" konusundaki görüşlerini analiz et ve NET bir karar ver.

UZMAN GÖRÜŞLERİ:
${expertOpinions}

HAKEM KARARI:
Kısa ve net cevap ver. Maksimum 3-4 cümle. Formatın şöyle olsun:

"[Hangi uzmanlara katıldığın] argümanları daha güçlü. [Kısa gerekçe]. SONUÇ: [Net cevap - Evet/Hayır/Belirsiz]"

Örnek: "Çevre ve Kimya uzmanlarının argümanları daha güçlü. CFC gazlarının ozon tabakasını incelttiği bilimsel olarak kanıtlanmış. SONUÇ: Evet, ozon tabakası delik."`;

    try {
      const result = await model.generateContent(judgePrompt);
      const response = await result.response;
      const verdict = response.text();
      
      if (verdict && verdict.trim()) {
        return Response.json({ verdict });
      }
    } catch {
    }

    try {
      const result = await fallbackModel.generateContent(judgePrompt);
      const response = await result.response;
      const verdict = response.text();
      
      if (verdict && verdict.trim()) {
        return Response.json({ verdict });
      }
    } catch {
    }
    
    return Response.json({ 
      verdict: 'Hakem sistemi geçici olarak kullanılamıyor. Uzmanların görüşleri kaydedildi ve tartışma devam edebilir.' 
    });

  } catch {
    return new Response('Internal server error', { status: 500 });
  }
}

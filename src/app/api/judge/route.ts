import { getModel, judgeModel } from '@/lib/gemini';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { chatHistory, topic } = await request.json();
    console.log('Judge API called with topic:', topic);
    console.log('Chat history length:', chatHistory?.length);

    if (!chatHistory || !topic) {
      return new Response('Gerekli parametreler eksik', { status: 400 });
    }

    const model = getModel(judgeModel);
    const fallbackModel = getModel('gemini-2.5-flash'); // Fallback model

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

    // Ana model ile deneme
    try {
      console.log('Trying primary model (gemini-2.5-pro)');
      const result = await model.generateContent(judgePrompt);
      const response = await result.response;
      const verdict = response.text();
      
      if (verdict && verdict.trim()) {
        console.log('Primary model success');
        return Response.json({ verdict });
      }
    } catch (error) {
      console.log('Primary model failed, trying fallback:', error instanceof Error ? error.message : String(error));
    }

    // Fallback model ile deneme
    try {
      console.log('Trying fallback model (gemini-2.5-flash)');
      const result = await fallbackModel.generateContent(judgePrompt);
      const response = await result.response;
      const verdict = response.text();
      
      if (verdict && verdict.trim()) {
        console.log('Fallback model success');
        return Response.json({ verdict });
      }
    } catch (error) {
      console.log('Fallback model also failed:', error instanceof Error ? error.message : String(error));
    }
    
    // Her iki model de başarısız olursa
    console.error('Both models failed, using static fallback');
    return Response.json({ 
      verdict: 'Hakem sistemi geçici olarak kullanılamıyor. Uzmanların görüşleri kaydedildi ve tartışma devam edebilir.' 
    });

  } catch (error) {
    console.error('Judge API error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}

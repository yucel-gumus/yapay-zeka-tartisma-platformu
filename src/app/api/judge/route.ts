import { getModel, judgeModel } from '@/lib/gemini';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { chatHistory, topic } = await request.json();
    console.log('Judge API called with topic:', topic);
    console.log('Chat history length:', chatHistory?.length);

    if (!chatHistory || !topic) {
      console.log('Missing parameters - chatHistory:', !!chatHistory, 'topic:', !!topic);
      return new Response('Missing required parameters', { status: 400 });
    }

    const model = getModel(judgeModel);

    // Sadece uzman bot yanıtlarını al (assistant role)
    const expertOpinions = chatHistory
      .filter((msg: { role: string; branchName?: string; content: string }) => 
        msg.role === 'assistant' && msg.branchName
      )
      .map((msg: { role: string; branchName?: string; content: string }) => 
        `${msg.branchName} Uzmanı:\n${msg.content}`
      )
      .join('\n\n---\n\n');

    console.log('Expert opinions length:', expertOpinions.length);
    console.log('Expert opinions:', expertOpinions.substring(0, 200) + '...');

    if (!expertOpinions.trim()) {
      console.log('No expert opinions found!');
      return Response.json({ verdict: 'Henüz uzman görüşü bulunmadığı için karar verilemedi.' });
    }

    const judgePrompt = `Sen tarafsız bir hakemsin. Aşağıdaki uzmanların "${topic}" konusundaki görüşlerini analiz et ve NET bir karar ver.

UZMAN GÖRÜŞLERİ:
${expertOpinions}

HAKEM KARARI:
Kısa ve net cevap ver. Maksimum 3-4 cümle. Formatın şöyle olsun:

"[Hangi uzmanlara katıldığın] argümanları daha güçlü. [Kısa gerekçe]. SONUÇ: [Net cevap - Evet/Hayır/Belirsiz]"

Örnek: "Çevre ve Kimya uzmanlarının argümanları daha güçlü. CFC gazlarının ozon tabakasını incelttiği bilimsel olarak kanıtlanmış. SONUÇ: Evet, ozon tabakası delik."`;

    const result = await model.generateContent(judgePrompt);
    const response = await result.response;
    const verdict = response.text();
    
    console.log('Generated verdict:', verdict);

    return Response.json({ verdict });

  } catch (error) {
    console.error('Judge API error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}

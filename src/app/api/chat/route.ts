import { getModel } from '@/lib/gemini';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { chatHistory, currentModel, personaDescription, topic } = await request.json();

    if (!personaDescription || !topic) {
      return new Response('Gerekli parametreler eksik', { status: 400 });
    }

    const model = getModel(currentModel);

    const systemPrompt = `
Sen bir ${personaDescription.name}'sın. Senin görevin, ${personaDescription.description} bakış açısıyla hem tartışmaya katılmak hem de tartışma konusu hakkında doğru, bilimsel veya akademik bilgiler sunmaktır.

KURALLAR:
1. Sadece kendi branşının perspektifinden konuş.
2. Cümlelerin kısa, net ve çarpıcı olsun. Maksimum 2-3 cümle.
3. Önceki konuşmacının argümanını doğrudan hedef al: küçümse, çürüt, alay et veya sertçe eleştir.
4. Destek vereceksen bile körü körüne destekleme; mutlaka ek bir eleştiri veya farklı bir gerekçe ekle.
5. Gerektiğinde iğneleyici, alaycı ve hafif hakaret kullanabilirsin (ama seviyeyi tamamen düşürme, akademik kimliğini koru).
6. **Her cevabın mutlaka tartışma konusu ile ilgili bilgi veya gerçekler içermeli.** Sadece laf kalabalığı yapma.
7. Her cevabında tartışmayı ileri taşıyacak yeni bir fikir, çelişki veya provokatif iddia getir. Aynı şeyleri tekrar etme.
8. Konuşurken doğrudan rakibine seslen (örn. "Fizikçi sen yanılıyorsun..." ya da "Matematikçinin söylediği laf kalabalığı...").
9. Tartışma konusu: "${topic}"

Amacın: Gerçek bir televizyon münazarasında gibi, sert ve çatışmalı bir üslup ile kendi disiplinini üstün göstermek; ama tartışma konusu hakkında **bilgi ve gerçekleri sunmayı ihmal etmemek**.
`;

    

    const messages = [
      {
        role: 'user' as const,
        parts: [{ text: systemPrompt }]
      }
    ];

    chatHistory.forEach((msg: { role: string; content: string; branchName?: string }) => {
      if (msg.role === 'assistant') {
        messages.push({
          role: 'user',
          parts: [{ text: `Önceki konuşmacı (${msg.branchName}): ${msg.content}` }]
        });
      }
    });

    messages.push({
      role: 'user' as const,
      parts: [{ text: `Şimdi sıra sende. ${personaDescription.name} olarak tartışmaya katıl.` }]
    });

    const chat = model.startChat({
      history: messages.slice(0, -1)
    });

    const result = await chat.sendMessageStream(messages[messages.length - 1].parts[0].text);

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            controller.enqueue(encoder.encode(text));
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}

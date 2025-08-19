import { getModel } from '@/lib/gemini';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { chatHistory, currentModel, personaDescription, topic } = await request.json();

    if (!personaDescription || !topic) {
      return new Response('Missing required parameters', { status: 400 });
    }

    const model = getModel(currentModel);

    const systemPrompt = `Sen bir ${personaDescription.name}'sın. Senin görevin, ${personaDescription.description} bakış açısıyla tartışmaya katılmak.

KURALLAR:
1. Sadece kendi branşının perspektifinden konuş.
2. Cümlelerin kısa, net ve anlaşılır olsun. Uzun paragraflar kurma.
3. Senden önceki konuşmacının argümanını doğrudan ele al. Ona karşı bir görüş sun, argümanını çürüt veya farklı bir açıdan yaklaş. Sadece destekleyici olma, bir tartışma ortamı yarat.
4. Maksimum 2-3 cümle ile cevap ver.
5. Tartışma konusu: "${topic}"

Geçmiş konuşmaları dikkate alarak, kendi branşının bakış açısından güçlü bir argüman sun.`;

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

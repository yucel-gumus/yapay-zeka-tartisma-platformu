import { gatewayHeaders, gatewayUrl } from '@/lib/gateway';
import { NextRequest } from 'next/server';

export const maxDuration = 120;
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { chatHistory, personaDescription, topic } = await request.json();

    if (!personaDescription || !topic) {
      return new Response('Gerekli parametreler eksik', { status: 400 });
    }

    const upstream = await fetch(gatewayUrl('/api/debate/turn'), {
      method: 'POST',
      headers: gatewayHeaders(),
      signal: AbortSignal.timeout(115_000),
      body: JSON.stringify({
        topic,
        persona: {
          name: personaDescription.name,
          description: personaDescription.description,
        },
        chat_history: (chatHistory || [])
          .filter((msg: { role?: string; content?: string }) => msg && typeof msg.content === 'string' && msg.content.trim().length > 0)
          .map(
            (msg: { role: string; content: string; branchName?: string; branch?: string }) => ({
              role: msg.role,
              content: msg.content.trim(),
              branch_name: msg.branchName || msg.branch || null,
            })
          ),
      }),
    });

    if (!upstream.ok || !upstream.body) {
      const detail = await upstream.text().catch(() => '');
      return new Response(detail || 'Gateway debate turn failed', {
        status: upstream.status || 502,
      });
    }

    const upstreamBody = upstream.body;
    const stream = new ReadableStream({
      async start(controller) {
        const reader = upstreamBody.getReader();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            controller.enqueue(value);
          }
        } catch (e) {
          controller.error(e);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
      },
    });
  } catch {
    return new Response('Internal server error', { status: 500 });
  }
}
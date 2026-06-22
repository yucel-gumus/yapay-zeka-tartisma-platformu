import { gatewayHeaders, gatewayUrl } from '@/lib/gateway';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { chatHistory, personaDescription, topic } = await request.json();

    if (!personaDescription || !topic) {
      return new Response('Gerekli parametreler eksik', { status: 400 });
    }

    const upstream = await fetch(gatewayUrl('/api/debate/turn'), {
      method: 'POST',
      headers: gatewayHeaders(),
      body: JSON.stringify({
        topic,
        persona: {
          name: personaDescription.name,
          description: personaDescription.description,
        },
        chat_history: (chatHistory || []).map(
          (msg: { role: string; content: string; branchName?: string }) => ({
            role: msg.role,
            content: msg.content,
            branch_name: msg.branchName ?? null,
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

    return new Response(upstream.body, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch {
    return new Response('Internal server error', { status: 500 });
  }
}
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
            (msg: { role: string; content: string; branchName?: string; branch?: string }) => {
              const r = (msg.role || 'assistant').toLowerCase();
              const role = (r === 'user' || r === 'judge') ? r : 'assistant';
              return {
                role,
                content: msg.content.trim(),
                branch_name: msg.branchName || msg.branch || null,
              };
            }
          ),
      }),
    });

    if (!upstream.ok) {
      const detail = await upstream.text().catch(() => '');
      return new Response(detail || 'Gateway debate turn failed', {
        status: upstream.status || 502,
      });
    }

    const text = await upstream.text();
    return new Response(text, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    });
  } catch {
    return new Response('Internal server error', { status: 500 });
  }
}
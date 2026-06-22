import { gatewayHeaders, gatewayUrl } from '@/lib/gateway';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { chatHistory, topic } = await request.json();

    if (!chatHistory || !topic) {
      return new Response('Gerekli parametreler eksik', { status: 400 });
    }

    const upstream = await fetch(gatewayUrl('/api/debate/judge'), {
      method: 'POST',
      headers: gatewayHeaders(),
      body: JSON.stringify({
        topic,
        chat_history: (chatHistory || []).map(
          (msg: { role: string; content: string; branchName?: string }) => ({
            role: msg.role,
            content: msg.content,
            branch_name: msg.branchName ?? null,
          })
        ),
      }),
    });

    if (!upstream.ok) {
      const detail = await upstream.text().catch(() => '');
      return new Response(detail || 'Gateway judge failed', {
        status: upstream.status || 502,
      });
    }

    const data = await upstream.json();
    return Response.json({ verdict: data.verdict ?? data.detail ?? '' });
  } catch {
    return new Response('Internal server error', { status: 500 });
  }
}
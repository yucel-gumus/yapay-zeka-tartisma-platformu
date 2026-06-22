import { gatewayHeaders, gatewayUrl } from '@/lib/gateway';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();

    if (!name) {
      return new Response('Uzmanlık alanı adı gerekli', { status: 400 });
    }

    const prompt = `
    "${name}" alanı için açıklama yaz.
    Açıklama:
    - Türkçe olacak
    - 2-3 cümle uzunluğunda olacak
    - Akademik ve teknik üslup kullanılacak
    - Bu alanın hangi konuları incelediğini, hangi yöntemleri kullandığını ve nasıl katkı sağladığını net biçimde açıklayacak
    - Metaforik veya kişiselleştirilmiş ifadeler olmayacak
    Çıktıyı sadece açıklama metni olarak ver.
    `;

    const upstream = await fetch(gatewayUrl('/api/generate'), {
      method: 'POST',
      headers: gatewayHeaders(),
      body: JSON.stringify({ prompt }),
    });

    if (!upstream.ok) {
      return new Response('Açıklama oluşturulurken hata oluştu', {
        status: upstream.status,
      });
    }

    const data = await upstream.json();
    return Response.json({ description: (data.text || '').trim() });
  } catch {
    return new Response('Açıklama oluşturulurken hata oluştu', { status: 500 });
  }
}
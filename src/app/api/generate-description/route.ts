import { NextRequest } from 'next/server';
import { getModel } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();

    if (!name) {
      return new Response('Uzmanlık alanı adı gerekli', { status: 400 });
    }

    const model = getModel('gemini-2.5-flash');

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
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const description = response.text();

    return Response.json({ description: description.trim() });

  } catch {
    return new Response('Açıklama oluşturulurken hata oluştu', { status: 500 });
  }
}

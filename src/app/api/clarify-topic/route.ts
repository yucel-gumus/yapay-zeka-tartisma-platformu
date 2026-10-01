import { gatewayHeaders, gatewayUrl } from "@/lib/gateway";
import { readInput, textField, apiFailure, upstreamFailure, ApiError } from "@/lib/apiGuard";
import { parseDebateFrame } from "@/lib/debateFrame";

export const maxDuration = 120;
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const input = await readInput(request);
    const topic = textField(input.topic, "Konu", 2000);
    const upstream = await fetch(gatewayUrl("/api/debate/clarify"), {
      method: "POST", headers: gatewayHeaders(),
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(115_000)]),
      body: JSON.stringify({ topic }),
    });
    if (!upstream.ok) upstreamFailure(upstream);
    const data = await upstream.json();
    const frame = parseDebateFrame(data.frame);
    if (!frame) throw new ApiError(502, "Geçerli çerçeve alınamadı. Yeniden deneyin veya kendiniz düzenleyin.");
    return Response.json({ frame });
  } catch (error) {
    return apiFailure(error);
  }
}

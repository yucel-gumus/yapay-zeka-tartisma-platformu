import type { ChatMessageType } from "@/types/debate";
import { parseDebateFrame } from "@/lib/debateFrame";
import { parseChatHistory } from "@/lib/debateState";
import type { DebateFrame } from "@/types/debate";
const buckets = new Map<string, { count: number; expires: number }>();
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public retryAfter?: number,
  ) {
    super(message);
  }
}
export async function readInput(
  request: Request,
): Promise<Record<string, unknown>> {
  // Browsers always send Origin on POST. A missing Origin means a non-browser
  // client calling the AI proxy directly; reject it before any upstream work.
  const origin = request.headers.get("origin");
  if (!origin)
    throw new ApiError(403, "Bu kaynaktan gelen isteğe izin verilmiyor.");
  const expected = new URL(request.url);
  // Next.js may normalize the request URL to localhost in development.
  // Host is the browser's actual destination; do not trust forwarded host headers.
  const host = request.headers.get("host");
  if (host) expected.host = host;
  if (origin !== expected.origin)
    throw new ApiError(403, "Bu kaynaktan gelen isteğe izin verilmiyor.");
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const now = Date.now();
  for (const [key, value] of buckets)
    if (value.expires <= now) buckets.delete(key);
  const key = ip;
  const bucket = buckets.get(key) || { count: 0, expires: now + 60_000 };
  if (++bucket.count > 30)
    throw new ApiError(
      429,
      "Çok fazla istek gönderildi. Biraz bekleyip yeniden deneyin.",
      Math.ceil((bucket.expires - now) / 1000),
    );
  buckets.set(key, bucket);
  if (!request.headers.get("content-type")?.includes("application/json"))
    throw new ApiError(415, "JSON gövdesi gerekli.");
  const reader = request.body?.getReader();
  if (!reader) throw new ApiError(400, "İstek gövdesi gerekli.");
  let size = 0;
  let body = "";
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 150_000) {
      await reader.cancel();
      throw new ApiError(413, "Tartışma içeriği çok büyük.");
    }
    body += decoder.decode(value, { stream: true });
  }
  body += decoder.decode();
  try {
    const data = JSON.parse(body);
    if (!data || typeof data !== "object" || Array.isArray(data))
      throw new Error();
    return data;
  } catch {
    throw new ApiError(400, "Geçersiz JSON gövdesi.");
  }
}
export function textField(
  value: unknown,
  name: string,
  max: number,
  optional = false,
): string {
  if (optional && (value === undefined || value === "")) return "";
  if (typeof value !== "string" || !value.trim() || value.length > max)
    throw new ApiError(
      400,
      `${name} boş olamaz ve en fazla ${max} karakter olabilir.`,
    );
  return value.trim();
}
export function historyField(value: unknown): ChatMessageType[] {
  const history = parseChatHistory(value);
  if (!history) throw new ApiError(400, "Geçersiz tartışma geçmişi.");
  return history.filter((m) => !m.failed);
}
export function frameField(value: unknown): DebateFrame | null {
  if (value === undefined || value === null) return null;
  const frame = parseDebateFrame(value);
  if (!frame) throw new ApiError(400, "Tez, kavram tanımları, alt iddialar ve kapsam eksiksiz olmalı.");
  return frame;
}
export function apiFailure(error: unknown): Response {
  if (error instanceof ApiError)
    return Response.json(
      { error: error.message },
      {
        status: error.status,
        headers: error.retryAfter
          ? { "Retry-After": String(error.retryAfter) }
          : {},
      },
    );
  if (
    error instanceof Error &&
    ["TimeoutError", "AbortError"].includes(error.name)
  )
    return Response.json(
      {
        error:
          "Yanıt süresi aşıldı veya istek durduruldu. Yeniden deneyebilirsiniz.",
      },
      { status: 504 },
    );
  console.error(
    "Debate API failed:",
    error instanceof Error ? error.name : "Unknown error",
  );
  return Response.json(
    {
      error:
        "AI hizmetine ulaşılamadı. Yapılandırmayı kontrol edip yeniden deneyin.",
    },
    { status: 502 },
  );
}
export function upstreamFailure(response: Response): never {
  const retry = Number(response.headers.get("Retry-After"));
  throw new ApiError(
    response.status === 429 ? 429 : 502,
    response.status === 429
      ? "AI hizmeti şu anda yoğun. Biraz bekleyip yeniden deneyin."
      : "AI hizmetinden geçerli yanıt alınamadı.",
    response.status === 429
      ? Number.isFinite(retry) && retry > 0
        ? Math.min(retry, 60)
        : 10
      : undefined,
  );
}

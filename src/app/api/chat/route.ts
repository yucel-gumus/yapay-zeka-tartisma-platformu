import { gatewayHeaders, gatewayUrl } from "@/lib/gateway";
import {
  readInput,
  textField,
  historyField,
  apiFailure,
  upstreamFailure,
  ApiError,
  frameField,
} from "@/lib/apiGuard";
import { DEBATE_ROLES } from "@/lib/debateProtocol";
import type { DebateRole } from "@/types/debate";
import { isDebateRounds } from "@/lib/debateSchedule";
export const maxDuration = 120;
export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  try {
    const input = await readInput(request);
    const topic = textField(input.topic, "Konu", 2000);
    const debateFrame = frameField(input.debateFrame);
    const sources = textField(input.sources, "Kaynaklar", 4000, true);
    const history = historyField(input.chatHistory);
    const persona = input.personaDescription as
      | Record<string, unknown>
      | undefined;
    if (!persona || typeof persona !== "object")
      throw new ApiError(400, "Uzman gerekli.");
    const name = textField(persona.name, "Uzman adı", 150);
    const description = textField(
      persona.description,
      "Uzman açıklaması",
      4000,
    );
    const role = input.debateRole as DebateRole;
    if (!Object.prototype.hasOwnProperty.call(DEBATE_ROLES, role))
      throw new ApiError(400, "Geçerli bir tartışma görevi seçin.");
    const { roundNumber, totalRounds, participatingExperts } = input;
    if (roundNumber !== undefined || totalRounds !== undefined) {
      if (!isDebateRounds(totalRounds) || typeof roundNumber !== "number" ||
          !Number.isInteger(roundNumber) || roundNumber < 1 || roundNumber > totalRounds)
        throw new ApiError(400, "Geçersiz tur planı.");
    }
    const participants = participatingExperts === undefined ? [] : participatingExperts;
    if (!Array.isArray(participants) || participants.length > 4 ||
        !participants.every((p) => typeof p === "string" && p.trim().length > 0 && p.length <= 150) ||
        (participants.length > 0 && !participants.includes(name)))
      throw new ApiError(400, "Geçersiz katılımcı listesi.");
    const upstream = await fetch(gatewayUrl("/api/debate/turn"), {
      method: "POST",
      headers: gatewayHeaders(),
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(115_000)]),
      body: JSON.stringify({
        topic,
        debate_frame: debateFrame,
        sources,
        debate_role: role,
        ...(roundNumber !== undefined ? { round_number: roundNumber, total_rounds: totalRounds } : {}),
        participating_experts: participants,
        persona: {
          name,
          description,
        },
        chat_history: history.map((m) => ({
          role: m.role,
          content: m.content,
          branch_name: m.branchName || null,
          debate_role: m.debateRole || null,
          round_number: m.roundNumber || null,
          stage: m.stage || null,
        })),
      }),
    });
    if (!upstream.ok) upstreamFailure(upstream);
    const headers = {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    };
    // Plain text can flow directly. JSON responses preserve the existing gateway contract.
    if (upstream.headers.get("content-type")?.includes("text/plain"))
      return new Response(upstream.body, { headers });
    const raw = await upstream.text();
    let text = raw;
    try {
      const data = JSON.parse(raw);
      text =
        typeof data === "string"
          ? data
          : typeof data.text === "string"
            ? data.text
            : "";
    } catch {
      /* Legacy raw text response. */
    }
    if (!text.trim() || text.length > 12_000)
      throw new ApiError(502, "AI hizmeti boş veya çok uzun yanıt verdi.");
    return new Response(text, { headers });
  } catch (error) {
    return apiFailure(error);
  }
}

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
import { parseJudgeReport, formatJudgeReport } from "@/lib/debateProtocol";
export const maxDuration = 120;
export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  try {
    const input = await readInput(request);
    const topic = textField(input.topic, "Konu", 2000);
    const debateFrame = frameField(input.debateFrame);
    const sources = textField(input.sources, "Kaynaklar", 4000, true);
    const history = historyField(input.chatHistory).filter(
      (m) => m.role !== "judge",
    );
    const speakers = [
      ...new Set(
        history
          .filter((m) => m.role === "assistant")
          .map((m) => m.branchName || "Uzman"),
      ),
    ];
    if (!speakers.length)
      throw new ApiError(
        400,
        "Değerlendirme için en az bir uzman yanıtı gerekli.",
      );
    const upstream = await fetch(gatewayUrl("/api/debate/judge"), {
      method: "POST",
      headers: gatewayHeaders(),
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(115_000)]),
      body: JSON.stringify({
        topic,
        debate_frame: debateFrame,
        sources,
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
    const data = await upstream.json();
    const report = parseJudgeReport(data.report);
    if (
      !report ||
      !report.decision ||
      report.scores.length !== speakers.length ||
      new Set(report.scores.map((s) => s.name)).size !== speakers.length ||
      !report.scores.every((s) => speakers.includes(s.name))
    ) {
      throw new ApiError(
        502,
        "Backend geçerli hakem raporu döndürmedi. Python backend'in güncel sürümünü çalıştırıp yeniden deneyin; tartışmanız korundu.",
      );
    }
    return Response.json({ verdict: formatJudgeReport(report), report });
  } catch (error) {
    return apiFailure(error);
  }
}

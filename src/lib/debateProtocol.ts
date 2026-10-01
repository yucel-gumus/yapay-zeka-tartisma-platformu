import type { DebateRole, JudgeReport } from "@/types/debate";
export const DEBATE_ROLES: Record<
  DebateRole,
  { label: string; instruction: string }
> = {
  advocate: {
    label: "Savunan",
    instruction:
      "Tezin en güçlü savunulabilir yorumunu savun; gerekçelerini ve sınırlarını açıkla.",
  },
  critic: {
    label: "Karşı çıkan",
    instruction:
      "Tezin güçlü bir karşı argümanını geliştir; önceki savunmanın somut bir noktasına cevap ver.",
  },
  assumptions: {
    label: "Varsayımları sorgulayan",
    instruction:
      "Gizli varsayımları, kavram belirsizliklerini ve sonucun geçerli olmadığı koşulları sorgula.",
  },
  evidence: {
    label: "Kanıtları denetleyen",
    instruction:
      "İddiaların kanıtlarını ve doğrulanabilirliğini incele; doğrulanmamış iddiaları açıkça işaretle.",
  },
};
export const ROLE_ORDER = Object.keys(DEBATE_ROLES) as DebateRole[];
export const DECISION_LABELS = {
  supported: "Tez desteklendi",
  refuted: "Tez çürütüldü",
  not_established: "Tez kanıtlanamadı",
  mixed: "Tez kısmen desteklendi",
} as const;
export function parseJudgeReport(value: unknown): JudgeReport | null {
  try {
    const data =
      typeof value === "string"
        ? JSON.parse(
            value
              .replace(/^\s*```(?:json)?\s*/i, "")
              .replace(/\s*```$/, "")
              .trim(),
          )
        : value;
    const list = (v: unknown): v is string[] =>
      Array.isArray(v) && v.every((x) => typeof x === "string");
    if (
      !data ||
      typeof data.summary !== "string" ||
      !data.summary.trim() ||
      !Array.isArray(data.scores) ||
      data.scores.length === 0 ||
      !list(data.agreements) ||
      !list(data.disagreements) ||
      !list(data.claimsToVerify)
    )
      return null;
    if (
      !data.scores.every(
        (s: JudgeReport["scores"][number]) =>
          s &&
          typeof s.name === "string" &&
          s.name.trim().length > 0 &&
          typeof s.reasoning === "string" &&
          s.reasoning.trim().length > 0 &&
          [s.consistency, s.evidence, s.rebuttal, s.uncertainty].every(
            (n) =>
              typeof n === "number" && Number.isFinite(n) && n >= 0 && n <= 10,
          ),
      )
    )
      return null;
    if (data.decision !== undefined) {
      const d = data.decision;
      if (
        !d ||
        typeof d.outcome !== "string" ||
        !Object.prototype.hasOwnProperty.call(DECISION_LABELS, d.outcome) ||
        typeof d.ruling !== "string" || !d.ruling.trim() ||
        typeof d.rationale !== "string" || !d.rationale.trim() ||
        (d.winner !== null &&
          (typeof d.winner !== "string" ||
            !data.scores.some((s: JudgeReport["scores"][number]) => s.name === d.winner)))
      ) return null;
    }
    return data as JudgeReport;
  } catch {
    return null;
  }
}
export function formatJudgeReport(r: JudgeReport): string {
  return [
    ...(r.decision ? [
      `Nihai hakem hükmü · ${DECISION_LABELS[r.decision.outcome]}\n${r.decision.ruling}\nArgüman üstünlüğü: ${r.decision.winner || "Belirgin üstünlük yok"}\n${r.decision.rationale}`,
    ] : []),
    r.summary,
    ...r.scores.map(
      (s) =>
        `${s.name}: Tutarlılık ${s.consistency}/10 · Kanıt ${s.evidence}/10 · Karşı argümana cevap ${s.rebuttal}/10 · Belirsizlik ${s.uncertainty}/10\n${s.reasoning}`,
    ),
    `Ortaklaşılan noktalar\n${r.agreements.join("\n")}`,
    `Çözülemeyen anlaşmazlıklar\n${r.disagreements.join("\n")}`,
    `Doğrulanması gereken iddialar\n${r.claimsToVerify.join("\n")}`,
  ].join("\n\n");
}

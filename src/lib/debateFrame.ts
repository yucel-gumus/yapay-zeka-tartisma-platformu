import type { DebateFrame } from "@/types/debate";

export function parseDebateFrame(value: unknown, allowEmptyDraft = false): DebateFrame | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const data = value as Record<string, unknown>;
  const text = (v: unknown, limit: number): v is string =>
    typeof v === "string" && v.length <= limit && (allowEmptyDraft || !!v.trim());
  if (!text(data.thesis, 2000) || !text(data.scope, 2000) ||
      !Array.isArray(data.claims) || !data.claims.length || data.claims.length > 6 ||
      !data.claims.every((claim) => text(claim, 1000)) ||
      !Array.isArray(data.definitions) || data.definitions.length > 6 ||
      !data.definitions.every((d) => d && text(d.term, 150) && text(d.meaning, 1000))) return null;
  return {
    thesis: data.thesis, scope: data.scope,
    claims: [...data.claims],
    definitions: data.definitions.map((d) => ({ term: d.term, meaning: d.meaning })),
  };
}

export function createManualFrame(topic: string): DebateFrame {
  return { thesis: topic, definitions: [], claims: [topic], scope: "Tartışma bu tez ve aşağıdaki alt iddialarla sınırlıdır." };
}

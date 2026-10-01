export type DebateRounds = 3 | 4 | 6;
export type DebateStage = "opening" | "rebuttal" | "cross_examination" | "evidence" | "response" | "closing";
export const DEBATE_LENGTHS = [
  { rounds: 3, label: "Kısa", description: "Açılış, karşı argüman ve kapanış" },
  { rounds: 4, label: "Standart", description: "Çapraz sorgulama dahil dört tam tur" },
  { rounds: 6, label: "Derin", description: "Kanıt denetimi ve ek cevap turu" },
] as const;
export const STAGE_LABELS: Record<DebateStage, string> = {
  opening: "Açılış", rebuttal: "Karşı argüman", cross_examination: "Çapraz sorgulama",
  evidence: "Kanıt denetimi", response: "Sorulara ve itirazlara cevap", closing: "Kapanış",
};
export function isDebateRounds(value: unknown): value is DebateRounds {
  return value === 3 || value === 4 || value === 6;
}
export function restoreDebateRounds(value: unknown, expertCount: number, hasHistory: boolean): DebateRounds {
  if (isDebateRounds(value)) return value;
  const legacyRounds = 12 / expertCount;
  return hasHistory && isDebateRounds(legacyRounds) ? legacyRounds : 4;
}
export function getDebateStage(round: number, rounds: DebateRounds): DebateStage {
  if (round === 1) return "opening";
  if (round >= rounds) return "closing";
  if (round === 2) return "rebuttal";
  if (round === 3) return "cross_examination";
  return round === 4 ? "evidence" : "response";
}
export function getTurnContext(turn: number, expertCount: number, rounds: DebateRounds) {
  const roundNumber = Math.floor(turn / expertCount) + 1;
  return { roundNumber, totalRounds: rounds, stage: getDebateStage(roundNumber, rounds) };
}

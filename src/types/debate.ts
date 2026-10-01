import type { DebateRounds, DebateStage } from "@/lib/debateSchedule";
export type DebateRole = "advocate" | "critic" | "assumptions" | "evidence";
export interface Branch {
  id: string;
  name: string;
  description: string;
}
export interface ChatMessageType {
  role: "user" | "assistant" | "judge";
  content: string;
  branch?: string;
  branchName?: string;
  debateRole?: DebateRole;
  failed?: boolean;
  roundNumber?: number;
  stage?: DebateStage;
}
export interface JudgeDecision {
  outcome: "supported" | "refuted" | "not_established" | "mixed";
  ruling: string;
  winner: string | null;
  rationale: string;
}
export interface JudgeReport {
  // Optional only for saved reports produced before explicit rulings.
  decision?: JudgeDecision;
  summary: string;
  scores: {
    name: string;
    consistency: number;
    evidence: number;
    rebuttal: number;
    uncertainty: number;
    reasoning: string;
  }[];
  agreements: string[];
  disagreements: string[];
  claimsToVerify: string[];
}
export interface DebateFrame {
  thesis: string;
  definitions: { term: string; meaning: string }[];
  claims: string[];
  scope: string;
}
export interface SharedDebateData {
  debateFrame?: DebateFrame | null;
  roundsPerExpert?: DebateRounds;
  topic: string;
  chatHistory: ChatMessageType[];
  selectedBranches: string[];
  branchDetails: Branch[];
  finalVerdict: string;
  timestamp: number;
  branchRoles?: Record<string, DebateRole>;
  judgeReport?: JudgeReport | null;
  sources?: string;
}

import type {
  Branch,
  ChatMessageType,
  DebateRole,
  SharedDebateData,
} from "@/types/debate";
import { ROLE_ORDER, parseJudgeReport } from "@/lib/debateProtocol";
import { STAGE_LABELS, restoreDebateRounds } from "@/lib/debateSchedule";
import { parseDebateFrame } from "@/lib/debateFrame";

// Single source of truth for data shapes coming from untrusted places:
// localStorage drafts, Firestore documents and API request bodies.
export const MAX_MESSAGE_LENGTH = 12_000;
const MAX_MESSAGES = 30;

const isRole = (value: unknown): value is DebateRole =>
  ROLE_ORDER.includes(value as DebateRole);

function isMessage(value: unknown): value is ChatMessageType {
  if (!value || typeof value !== "object") return false;
  const m = value as Record<string, unknown>;
  return (
    (m.role === "user" || m.role === "assistant" || m.role === "judge") &&
    typeof m.content === "string" &&
    m.content.length <= MAX_MESSAGE_LENGTH &&
    (m.roundNumber === undefined ||
      (Number.isInteger(m.roundNumber) &&
        (m.roundNumber as number) >= 1 &&
        (m.roundNumber as number) <= 6)) &&
    (m.stage === undefined ||
      (typeof m.stage === "string" &&
        Object.prototype.hasOwnProperty.call(STAGE_LABELS, m.stage))) &&
    (m.debateRole === undefined || isRole(m.debateRole)) &&
    (m.branchName === undefined ||
      (typeof m.branchName === "string" && m.branchName.length <= 150))
  );
}

export function parseChatHistory(value: unknown): ChatMessageType[] | null {
  return Array.isArray(value) &&
    value.length <= MAX_MESSAGES &&
    value.every(isMessage)
    ? value
    : null;
}

export function parseBranches(value: unknown): Branch[] | null {
  return Array.isArray(value) &&
    value.every(
      (b) =>
        b &&
        typeof b.id === "string" &&
        typeof b.name === "string" &&
        typeof b.description === "string",
    )
    ? value
    : null;
}

export function parseStringList(value: unknown): string[] | null {
  return Array.isArray(value) && value.every((x) => typeof x === "string")
    ? value
    : null;
}

export function parseSharedDebate(value: unknown): SharedDebateData | null {
  if (!value || typeof value !== "object") return null;
  const d = value as Record<string, unknown>;
  const chatHistory = parseChatHistory(d.chatHistory);
  const branchDetails = parseBranches(d.branchDetails);
  const selectedBranches = parseStringList(d.selectedBranches);
  if (
    typeof d.topic !== "string" ||
    !d.topic.trim() ||
    !chatHistory ||
    !branchDetails ||
    !selectedBranches
  )
    return null;
  const roles =
    d.branchRoles && typeof d.branchRoles === "object" ? d.branchRoles : {};
  return {
    topic: d.topic,
    chatHistory,
    branchDetails,
    selectedBranches,
    debateFrame: parseDebateFrame(d.debateFrame),
    roundsPerExpert: restoreDebateRounds(
      d.roundsPerExpert,
      selectedBranches.length,
      true,
    ),
    sources: typeof d.sources === "string" ? d.sources : "",
    branchRoles: Object.fromEntries(
      Object.entries(roles).filter(([, role]) => isRole(role)),
    ),
    judgeReport: parseJudgeReport(d.judgeReport),
    finalVerdict: typeof d.finalVerdict === "string" ? d.finalVerdict : "",
    timestamp:
      typeof d.timestamp === "number"
        ? d.timestamp
        : Date.parse(String(d.createdAt)) || 0,
  };
}

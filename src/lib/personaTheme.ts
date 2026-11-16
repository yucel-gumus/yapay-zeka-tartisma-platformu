import type { JudgeDecision } from "@/types/debate";

export interface PersonaTheme {
  bg: string;
  text: string;
  border: string;
  tint: string;
}

const PERSONA_BY_ID: Record<string, PersonaTheme> = {
  "uzay-bilimleri-profesoru": {
    bg: "#EC7D55",
    text: "#253341",
    border: "#AB421C",
    tint: "rgba(236, 125, 85, 0.14)",
  },
  matematikci: {
    bg: "#253341",
    text: "#F5F9F5",
    border: "#3E5164",
    tint: "rgba(37, 51, 65, 0.08)",
  },
  fizikci: {
    bg: "#3E5164",
    text: "#F5F9F5",
    border: "#253341",
    tint: "rgba(62, 81, 100, 0.1)",
  },
  "islam-ilimleri-uzmani": {
    bg: "#F2A488",
    text: "#253341",
    border: "#AB421C",
    tint: "rgba(242, 164, 136, 0.18)",
  },
};

const PERSONA_POOL: ReadonlyArray<PersonaTheme> = [
  PERSONA_BY_ID["uzay-bilimleri-profesoru"],
  PERSONA_BY_ID.matematikci,
  PERSONA_BY_ID.fizikci,
  PERSONA_BY_ID["islam-ilimleri-uzmani"],
  {
    bg: "#AB421C",
    text: "#F5F9F5",
    border: "#253341",
    tint: "rgba(171, 66, 28, 0.1)",
  },
  {
    bg: "#DBE6DD",
    text: "#253341",
    border: "#3E5164",
    tint: "rgba(219, 230, 221, 0.45)",
  },
];

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function getPersonaTheme(identifier?: string): PersonaTheme {
  const key = (identifier || "").trim().toLowerCase();
  if (key && PERSONA_BY_ID[key]) {
    return PERSONA_BY_ID[key];
  }
  return PERSONA_POOL[hashString(key || "expert") % PERSONA_POOL.length];
}

export function getOutcomeStyle(outcome: JudgeDecision["outcome"]) {
  switch (outcome) {
    case "supported":
      return { bg: "#DBE6DD", text: "#253341", border: "#3E5164" };
    case "refuted":
      return { bg: "#AB421C", text: "#F5F9F5", border: "#253341" };
    case "mixed":
      return { bg: "#F2A488", text: "#253341", border: "#EC7D55" };
    case "not_established":
    default:
      return { bg: "#DCE3EA", text: "#3E5164", border: "#BCC7D2" };
  }
}

export function getScoreTierStyle(score: number) {
  if (score >= 8) {
    return {
      bar: "#EC7D55",
      badgeBg: "#EC7D55",
      badgeText: "#253341",
      border: "#AB421C",
    };
  }
  if (score >= 5) {
    return {
      bar: "#3E5164",
      badgeBg: "#DBE6DD",
      badgeText: "#253341",
      border: "#3E5164",
    };
  }
  return {
    bar: "#AB421C",
    badgeBg: "#F2A488",
    badgeText: "#253341",
    border: "#AB421C",
  };
}

import type { ChatMessageType } from "@/types/debate";

const PRODUCTION_VERCEL_HOSTS = new Set([
  "yapay-zeka-tartisma-platformu.vercel.app",
]);

export const DIRECT_CLOUD_RUN_BASE_URL =
  "https://python-backend-270384591051.europe-west3.run.app";

export function resolveDirectBackendBase(): string | null {
  const configured =
    typeof process !== "undefined"
      ? process.env?.NEXT_PUBLIC_DIRECT_AI_API_URL?.trim()
      : undefined;
  if (configured) {
    return configured.replace(/\/+$/, "");
  }
  if (
    typeof window !== "undefined" &&
    window?.location?.hostname &&
    PRODUCTION_VERCEL_HOSTS.has(window.location.hostname)
  ) {
    return DIRECT_CLOUD_RUN_BASE_URL;
  }
  return null;
}

export function extractApiError(data: unknown, fallback: string): string {
  if (data && typeof data === "object") {
    const rec = data as Record<string, unknown>;
    if (typeof rec.error === "string" && rec.error.trim()) return rec.error.trim();
    if (typeof rec.detail === "string" && rec.detail.trim()) return rec.detail.trim();
  }
  return fallback;
}

export function toBackendChatHistory(history: ChatMessageType[]) {
  return history
    .filter((m) => !m.failed)
    .map((m) => ({
      role: m.role,
      content: m.content,
      branch_name: m.branchName || null,
      debate_role: m.debateRole || null,
      round_number: m.roundNumber || null,
      stage: m.stage || null,
    }));
}

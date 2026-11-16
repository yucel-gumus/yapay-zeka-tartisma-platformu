import React from "react";
import { DEBATE_ROLES } from "@/lib/debateProtocol";
import { STAGE_LABELS } from "@/lib/debateSchedule";
import { getPersonaTheme } from "@/lib/personaTheme";
import JudgeReportView from "./JudgeReportView";
import { ChatMessageType, JudgeReport } from "@/types/debate";
import { JudgeIcon } from "./ui/Icons";
interface ChatMessageProps {
  message: ChatMessageType;
  isStreaming?: boolean;
  judgeReport?: JudgeReport | null;
}
const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isStreaming = false,
  judgeReport,
}) => {
  if (message.role === "judge")
    return (
      <article className="judge-message">
        <div className="message-header">
          <span className="message-avatar bg-[#AB421C] text-[#F5F9F5] border-[#253341]">
            <JudgeIcon size={18} />
          </span>
          <strong>Hakem değerlendirmesi</strong>
        </div>
        {judgeReport ? (
          <JudgeReportView report={judgeReport} />
        ) : (
          <div className="message-content">{message.content}</div>
        )}
      </article>
    );
  const user = message.role === "user";
  const name =
    message.branchName || (user ? "Tartışmanın başlangıcı" : "Uzman");
  const persona = !user
    ? getPersonaTheme(message.branch || message.branchName)
    : null;
  return (
    <article
      className={`message ${user ? "user-message" : "pl-4"}`}
      style={
        persona ? { borderLeft: `3px solid ${persona.border}` } : undefined
      }
    >
      <div className="message-header">
        <span
          className="message-avatar"
          style={
            user
              ? {
                  backgroundColor: "#3E5164",
                  color: "#F5F9F5",
                  borderColor: "#253341",
                }
              : {
                  backgroundColor: persona?.bg,
                  color: persona?.text,
                  borderColor: persona?.border,
                }
          }
        >
          {user ? "?" : name.slice(0, 1)}
        </span>
        <strong>{name}</strong>
        {message.branchName && (
          <span
            className="pill"
            style={
              persona
                ? {
                    backgroundColor: persona.tint,
                    borderColor: persona.border,
                    color: "#253341",
                  }
                : undefined
            }
          >
            {message.debateRole
              ? DEBATE_ROLES[message.debateRole]?.label || "Uzman görüşü"
              : "Uzman görüşü"}
          </span>
        )}
        {message.stage && STAGE_LABELS[message.stage] && (
          <span className="helper sm:ml-auto">
            {message.roundNumber ? `Tur ${message.roundNumber} · ` : ""}
            {STAGE_LABELS[message.stage]}
          </span>
        )}
      </div>
      <div className="message-content">
        {message.content}
        {isStreaming && (
          <span className="animate-pulse text-[#AB421C]" aria-hidden="true">
            {" "}
            ▍
          </span>
        )}
      </div>
    </article>
  );
};
export default ChatMessage;

import React from "react";
import { DEBATE_ROLES } from "@/lib/debateProtocol";
import { STAGE_LABELS } from "@/lib/debateSchedule";
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
          <span className="message-avatar">
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
  return (
    <article className={`message ${user ? "user-message" : ""}`}>
      <div className="message-header">
        <span className="message-avatar">{user ? "?" : name.slice(0, 1)}</span>
        <strong>{name}</strong>
        {message.branchName && (
          <span className="pill">
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
          <span className="animate-pulse" aria-hidden="true">
            {" "}
            ▍
          </span>
        )}
      </div>
    </article>
  );
};
export default ChatMessage;

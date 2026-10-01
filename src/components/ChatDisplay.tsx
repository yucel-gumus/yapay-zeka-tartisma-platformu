import React, { useEffect, useRef } from "react";
import {
  getTurnContext,
  STAGE_LABELS,
  type DebateRounds,
} from "@/lib/debateSchedule";
import type { DebateFrame } from "@/types/debate";
import DebateFrameView from "./DebateFrameView";
import { DEBATE_ROLES } from "@/lib/debateProtocol";
import ChatMessage from "./ChatMessage";
import {
  ChatMessageType,
  Branch,
  DebateRole,
  JudgeReport,
} from "@/types/debate";
import { JudgeIcon, ShareIcon } from "./ui/Icons";

interface ChatDisplayProps {
  debateFrame: DebateFrame | null;
  chatHistory: ChatMessageType[];
  isStreamingMessage: boolean;
  currentStreamingContent: string;
  selectedBranches: string[];
  activeBranchOrder?: string[];
  currentTurn: number;
  totalTurns: number;
  roundsPerExpert: DebateRounds;
  allBranches: Branch[];
  topic: string;
  isDebating: boolean;
  finalVerdict: string;
  onStopDebate: () => void;
  onPauseDebate: () => void;
  onResumeDebate: () => void;
  isJudgeLoading: boolean;
  branchRoles: Record<string, DebateRole>;
  judgeReport: JudgeReport | null;
  onShowJudgeReport: () => void;
  onResetDebate: () => void;
  onShareDebate: () => void;
  chatEndRef: React.RefObject<HTMLDivElement | null>;
}

const ChatDisplay: React.FC<ChatDisplayProps> = ({
  debateFrame,
  chatHistory,
  isStreamingMessage,
  currentStreamingContent,
  selectedBranches,
  activeBranchOrder = [],
  currentTurn,
  totalTurns,
  roundsPerExpert,
  allBranches,
  topic,
  isDebating,
  finalVerdict,
  onStopDebate,
  onPauseDebate,
  onResumeDebate,
  isJudgeLoading,
  branchRoles,
  judgeReport,
  onShowJudgeReport,
  onResetDebate,
  onShareDebate,
  chatEndRef,
}) => {
  const order = activeBranchOrder.length ? activeBranchOrder : selectedBranches;
  const currentBranchId = order[currentTurn % (order.length || 1)];
  const context = getTurnContext(
    Math.max(0, Math.min(currentTurn, totalTurns - 1)),
    order.length || 1,
    roundsPerExpert,
  );
  const experts = order
    .map((id) => allBranches.find((b) => b.id === id))
    .filter((b): b is Branch => !!b);
  const scrollRef = useRef<HTMLDivElement>(null);
  const followRef = useRef(true);
  useEffect(() => {
    const el = scrollRef.current;
    if (el && followRef.current) el.scrollTop = el.scrollHeight;
  }, [chatHistory, currentStreamingContent]);
  const status = isJudgeLoading
    ? "Hakem değerlendiriyor"
    : finalVerdict
      ? "Karar verildi"
      : isDebating
        ? "Tartışma sürüyor"
        : currentTurn >= totalTurns
          ? "Değerlendirmeye hazır"
          : "Duraklatıldı";
  return (
    <div className="space-y-5">
      <div className="debate-heading">
        <span className="eyebrow">TARTIŞMA OTURUMU</span>
        <h1>{topic}</h1>
        <div className="flex flex-wrap items-center gap-3">
          <span className="pill">{status}</span>
          <span className="helper">
            {experts.length} uzman · {roundsPerExpert} tam tur · {currentTurn}/
            {totalTurns} konuşma
          </span>
        </div>
      </div>
      {debateFrame && (
        <details className="surface px-5 py-4 text-sm">
          <summary className="cursor-pointer font-medium">
            Onaylanan tartışma çerçevesi{" "}
            <span className="helper ml-2">Tez, kavramlar ve kapsam</span>
          </summary>
          <div className="pt-4">
            <DebateFrameView frame={debateFrame} />
          </div>
        </details>
      )}
      <div className="expert-rail">
        {experts.map((expert, index) => (
          <div
            key={expert.id}
            className={`rail-card ${isDebating && expert.id === currentBranchId ? "speaking" : ""}`}
          >
            <div className="flex items-center justify-between gap-2">
              <strong>{expert.name}</strong>
              <span className="helper">{index + 1}.</span>
            </div>
            <p className="helper mt-1">
              {DEBATE_ROLES[branchRoles[expert.id] || "assumptions"].label}
            </p>
            {isDebating && expert.id === currentBranchId && (
              <span className="pill mt-2">Şimdi konuşuyor</span>
            )}
          </div>
        ))}
      </div>
      <div className="surface debate-toolbar">
        <div>
          <p className="text-sm font-medium">
            {currentTurn >= totalTurns
              ? "Tüm konuşmalar tamamlandı"
              : `Tur ${context.roundNumber}/${roundsPerExpert} · ${STAGE_LABELS[context.stage]}`}
          </p>
          <div
            role="progressbar"
            aria-label="Tamamlanan konuşmalar"
            aria-valuemin={0}
            aria-valuemax={totalTurns}
            aria-valuenow={Math.min(currentTurn, totalTurns)}
            className="mt-2 h-1.5 w-40 rounded-full bg-[#FFB6A6]/35"
          >
            <div
              className="h-full rounded-full bg-[#9BCEC1]"
              style={{
                width: `${Math.min((currentTurn / (totalTurns || 1)) * 100, 100)}%`,
              }}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {isDebating && (
            <button onClick={onPauseDebate} className="btn btn-outline">
              Duraklat
            </button>
          )}
          {!isDebating && !finalVerdict && currentTurn < totalTurns && (
            <button
              disabled={isJudgeLoading}
              onClick={onResumeDebate}
              className="btn btn-mint"
            >
              Kaldığı yerden sürdür
            </button>
          )}
          {!finalVerdict && (
            <button
              onClick={onStopDebate}
              disabled={currentTurn < 1 || isJudgeLoading}
              className="btn btn-dark"
            >
              <JudgeIcon size={17} />
              {isJudgeLoading
                ? "Değerlendiriliyor…"
                : "Hakem değerlendirmesi al"}
            </button>
          )}
          {finalVerdict && (
            <>
              <button onClick={onShowJudgeReport} className="btn btn-dark">
                <JudgeIcon size={17} />
                Hakem raporunu aç
              </button>
              <button
                onClick={onShareDebate}
                disabled={isJudgeLoading}
                className="btn btn-mint"
              >
                <ShareIcon size={17} />
                Paylaş
              </button>
              <button
                onClick={onStopDebate}
                disabled={isJudgeLoading}
                className="btn btn-outline"
              >
                {isJudgeLoading
                  ? "Değerlendiriliyor…"
                  : "Hakem kararını yenile"}
              </button>
            </>
          )}
          <button
            onClick={onResetDebate}
            disabled={isJudgeLoading}
            className="btn btn-quiet"
          >
            Yeni tartışma
          </button>
        </div>
      </div>
      <section className="surface transcript" aria-label="Tartışma konuşmaları">
        <div className="flex items-center justify-between gap-3 mb-6">
          <h3 className="section-title">Konuşmalar</h3>
          <span className="helper">Seçilen sıra ile</span>
        </div>
        <div
          ref={scrollRef}
          onScroll={() => {
            const el = scrollRef.current;
            if (el)
              followRef.current =
                el.scrollHeight - el.scrollTop - el.clientHeight < 100;
          }}
          className="transcript-scroll custom-scrollbar"
          tabIndex={0}
          aria-label="Konuşma akışı"
        >
          {chatHistory.map((message, index) => (
            <ChatMessage
              key={index}
              message={message}
              judgeReport={message.role === "judge" ? judgeReport : null}
            />
          ))}
          {isStreamingMessage && !currentStreamingContent && (
            <div role="status" className="message">
              <div className="message-header">
                <span className="message-avatar">…</span>
                <strong>
                  {allBranches.find((b) => b.id === currentBranchId)?.name ||
                    "Uzman"}
                </strong>
                <span className="helper animate-pulse">
                  Yanıtını hazırlıyor…
                </span>
              </div>
            </div>
          )}
          {isStreamingMessage && currentStreamingContent && (
            <ChatMessage
              message={{
                role: "assistant",
                content: currentStreamingContent,
                branch: currentBranchId,
                roundNumber: context.roundNumber,
                stage: context.stage,
                branchName:
                  allBranches.find((b) => b.id === currentBranchId)?.name ||
                  "Uzman",
              }}
              isStreaming
            />
          )}
          <div ref={chatEndRef} />
        </div>
        <p className="helper mt-5 pt-4 border-t border-[#5E3D38]/10">
          {isDebating
            ? "Yeni konuşmalar geldikçe akış güncellenir. Önceki mesajları okumak için yukarı kaydırabilirsin."
            : finalVerdict
              ? "Tartışma ve hakem değerlendirmesi bu oturumda kayıtlı."
              : currentTurn >= totalTurns
                ? "Tartışma tamamlandı. Sonuç için hakem değerlendirmesi alabilirsin."
                : "Oturum duraklatıldı. Hazır olduğunda kaldığın yerden sürdürebilirsin."}
        </p>
      </section>
    </div>
  );
};
export default ChatDisplay;

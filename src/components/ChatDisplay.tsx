import React from "react";
import { getTurnContext, STAGE_LABELS, type DebateRounds } from "@/lib/debateSchedule";
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
import {
  JudgeIcon,
  ShareIcon,
  RefreshIcon,
  RobotIcon,
  TargetIcon,
  ClockIcon,
  SparklesIcon,
} from "./ui/Icons";

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
  const branchOrderList =
    activeBranchOrder.length > 0 ? activeBranchOrder : selectedBranches;
  const currentBranchId =
    branchOrderList[currentTurn % (branchOrderList.length || 1)];
  const currentContext = getTurnContext(Math.min(currentTurn, totalTurns - 1), branchOrderList.length || 1, roundsPerExpert);

  // Map active expert details
  const activeExperts = branchOrderList
    .map((id) => allBranches.find((b) => b.id === id))
    .filter((b): b is Branch => b !== undefined);

  const gridColsClass =
    activeExperts.length === 2
      ? "grid-cols-1 sm:grid-cols-2"
      : activeExperts.length === 3
        ? "grid-cols-1 sm:grid-cols-3"
        : "grid-cols-2 lg:grid-cols-4";

  return (
    <div className="min-h-screen bg-[#FFEBD3] space-y-6">
      {debateFrame && <DebateFrameView frame={debateFrame} />}
      {/* AI PODIUM ARENA STAGE (Top Stage Bar) */}
      <div className="bg-[#FFEBD3] border-3 border-[#FFB6A6] rounded-3xl p-6 shadow-xl overflow-hidden">
        <div className="flex items-center justify-between mb-4 border-b-2 border-[#FFB6A6]/40 pb-3">
          <div className="flex items-center space-x-2 text-[#2C1A18]">
            <SparklesIcon size={20} />
            <h3 className="text-base font-extrabold tracking-tight">
              AI Uzman Podyum Sahnesi (Live Stage)
            </h3>
          </div>
          <div className="text-xs font-extrabold bg-[#FFB6A6]/30 px-3 py-1 rounded-xl text-[#2C1A18] border border-[#FFB6A6]">
            {isDebating
              ? `Konuşma ${currentTurn}/${totalTurns}`
              : finalVerdict
                ? "Değerlendirildi"
                : currentTurn >= totalTurns
                  ? "Değerlendirmeye hazır"
                  : "Duraklatıldı"}
          </div>
        </div>

        {/* Expert Cards Deck on Podium */}
        <div className={`grid ${gridColsClass} gap-4`}>
          {activeExperts.map((expert, idx) => {
            const isSpeakingNow = isDebating && currentBranchId === expert.id;
            return (
              <div
                key={expert.id}
                className={`relative p-4 rounded-2xl border-2 transition-all duration-300 ${
                  isSpeakingNow
                    ? "bg-[#9BCEC1] border-[#9BCEC1] shadow-lg scale-[1.03] text-[#2C1A18]"
                    : "bg-[#FFB6A6]/20 border-[#FFB6A6] text-[#2C1A18]"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-extrabold text-xs shadow-xs ${
                        isSpeakingNow
                          ? "bg-[#FFEBD3] text-[#2C1A18]"
                          : "bg-[#9BCEC1] text-[#2C1A18]"
                      }`}
                    >
                      #{idx + 1}
                    </div>
                    <span className="font-extrabold text-sm truncate max-w-[120px]">
                      {expert.name}
                    </span>
                  </div>
                  {isSpeakingNow && (
                    <span className="text-[10px] bg-[#FFEBD3] text-[#2C1A18] font-extrabold px-2 py-0.5 rounded-lg animate-pulse">
                      Söz Sahibi
                    </span>
                  )}
                </div>
                <p className="mb-1 text-xs font-semibold">
                  {DEBATE_ROLES[branchRoles[expert.id] || "assumptions"].label}
                </p>
                <p className="text-xs font-medium opacity-90 line-clamp-2">
                  {expert.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* STICKY CONTROL & PROGRESS BAR */}
      <div className="sticky top-4 z-20 bg-[#FFEBD3]/95 backdrop-blur-md border-3 border-[#FFB6A6] rounded-3xl p-4 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Topic Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[#9BCEC1] text-[#2C1A18] rounded-2xl flex items-center justify-center shadow-xs">
                <TargetIcon size={22} />
              </div>
              <div>
                <span className="text-xs font-extrabold uppercase text-[#5E3D38] tracking-wider">
                  Tartışılan Konu
                </span>
                <h2 className="text-lg font-extrabold text-[#2C1A18] line-clamp-1">
                  {topic}
                </h2>
              </div>
            </div>

            {/* Progress Bar */}
            {isDebating && (
              <div className="flex items-center gap-3 mt-2">
                <div className="flex-1 bg-[#FFB6A6]/40 rounded-full h-3 overflow-hidden border border-[#FFB6A6]">
                  <div
                    className="h-full bg-[#9BCEC1] rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${Math.min((currentTurn / totalTurns) * 100, 100)}%`,
                    }}
                  />
                </div>
                <span className="text-xs font-extrabold text-[#2C1A18] min-w-[60px]">
                  {currentTurn}/{totalTurns} Konuşma
                </span>
              </div>
            )}
          </div>

          <p className="text-sm font-semibold text-[#5E3D38]">
            {currentTurn >= totalTurns ? `${roundsPerExpert} tam tur tamamlandı` : `Tur ${currentContext.roundNumber}/${roundsPerExpert} · ${STAGE_LABELS[currentContext.stage]}`}
          </p>
          {/* Action Buttons */}
          <div className="flex gap-3 flex-wrap">
            {isDebating && (
              <button
                onClick={onPauseDebate}
                className="rounded-xl border border-[#FFB6A6] px-4 py-3 font-semibold"
              >
                Duraklat
              </button>
            )}
            {!isDebating &&
              !finalVerdict &&
              currentTurn < totalTurns && (
                <button
                  disabled={isJudgeLoading}
                  onClick={onResumeDebate}
                  className="rounded-xl bg-[#9BCEC1] px-4 py-3 font-semibold disabled:opacity-50"
                >
                  Kaldığı yerden sürdür
                </button>
              )}
            {!finalVerdict && (
              <button
                onClick={onResetDebate}
                className="rounded-xl border border-[#FFB6A6] px-4 py-3 font-semibold disabled:opacity-50"
              >
                Yeni tartışma
              </button>
            )}
            {!finalVerdict && (
              <button
                onClick={onStopDebate}
                disabled={currentTurn < 1 || isJudgeLoading}
                className={`px-6 py-3 rounded-2xl font-extrabold transition-all shadow-md ${
                  currentTurn >= 1 && !isJudgeLoading
                    ? "bg-[#9BCEC1] hover:bg-[#85b9ac] text-[#2C1A18] hover:scale-105 cursor-pointer"
                    : "bg-[#FFB6A6]/30 text-[#5E3D38]/60 border border-[#FFB6A6]/50 cursor-not-allowed"
                }`}
              >
                <span className="flex items-center gap-2">
                  <JudgeIcon size={20} />
                  {isJudgeLoading
                    ? "Değerlendiriliyor…"
                    : "Hakem değerlendirmesi al"}
                </span>
              </button>
            )}
            {finalVerdict && (
              <>
                <button
                  onClick={onShowJudgeReport}
                  className="rounded-xl border border-[#9BCEC1] px-4 py-3 font-semibold"
                >
                  Hakem raporunu aç
                </button>
                <button
                  onClick={onStopDebate}
                  disabled={isJudgeLoading}
                  className="rounded-xl border border-[#9BCEC1] px-4 py-3 font-semibold disabled:opacity-50"
                >
                  {isJudgeLoading ? "Değerlendiriliyor…" : "Hakem kararını yenile"}
                </button>
                <button
                  onClick={onShareDebate}
                  disabled={isJudgeLoading}
                  className="bg-[#9BCEC1] hover:bg-[#85b9ac] text-[#2C1A18] font-extrabold px-6 py-3 rounded-2xl transition-all shadow-md hover:scale-105 cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <ShareIcon size={20} />
                    Paylaş
                  </span>
                </button>
                <button
                  onClick={onResetDebate}
                  disabled={isJudgeLoading}
                  className="bg-[#FFB6A6] hover:bg-[#f0a595] text-[#2C1A18] font-extrabold px-6 py-3 rounded-2xl transition-all shadow-md hover:scale-105 cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <RefreshIcon size={20} />
                    Yeni Tartışma
                  </span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* MAIN CHAT STREAM DECK */}
      <div className="bg-[#FFEBD3] rounded-3xl shadow-xl border-3 border-[#FFB6A6] overflow-hidden">
        <div className="p-6 space-y-6 h-[calc(100vh-340px)] overflow-y-auto custom-scrollbar">
          {chatHistory.map((message, index) => (
            <ChatMessage
              key={index}
              message={message}
              judgeReport={message.role === "judge" ? judgeReport : null}
            />
          ))}

          {isStreamingMessage && !currentStreamingContent && (
            <div className="flex items-center space-x-4 p-6 bg-[#FFB6A6]/35 rounded-3xl border-3 border-[#FFB6A6] shadow-sm animate-pulse">
              <div className="relative">
                <div className="w-12 h-12 bg-[#9BCEC1] text-[#2C1A18] rounded-2xl flex items-center justify-center shadow-xs">
                  <RobotIcon size={24} />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-extrabold text-[#2C1A18] text-base">
                    {allBranches.find((b) => b.id === currentBranchId)?.name ||
                      "Uzman"}
                  </span>
                  <div className="flex space-x-1">
                    <div className="w-2.5 h-2.5 bg-[#9BCEC1] rounded-full animate-bounce"></div>
                    <div
                      className="w-2.5 h-2.5 bg-[#9BCEC1] rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2.5 h-2.5 bg-[#9BCEC1] rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
                <p className="text-[#5E3D38] text-sm font-bold">
                  Podyumda yanıt hazırlanıyor...
                </p>
              </div>
            </div>
          )}

          {isStreamingMessage && currentStreamingContent && (
            <ChatMessage
              message={{
                role: "assistant",
                content: currentStreamingContent,
                branch: currentBranchId,
                roundNumber: currentContext.roundNumber,
                stage: currentContext.stage,
                branchName:
                  allBranches.find((b) => b.id === currentBranchId)?.name ||
                  "Uzman",
              }}
              isStreaming={true}
            />
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Status Footer */}
        {isDebating && (
          <div className="px-6 py-4 border-t-3 border-[#FFB6A6] bg-[#FFB6A6]/20">
            {currentTurn >= totalTurns ? (
              <div className="text-center">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-[#9BCEC1] text-[#2C1A18] rounded-2xl flex items-center justify-center animate-pulse shadow-xs">
                    <ClockIcon size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-[#2C1A18]">
                      Tartışma Tamamlandı!
                    </h3>
                    <p className="text-sm text-[#5E3D38] font-bold">
                      Tüm {activeExperts.length} uzman{" "}
                      {totalTurns} konuşmayı bitirdi
                    </p>
                  </div>
                </div>
                <div className="bg-[#FFEBD3] rounded-2xl p-4 border-2 border-[#FFB6A6]">
                  <p className="text-sm text-[#2C1A18] mb-1 font-extrabold">
                    Hakem kararını almak için yukarıdaki butona tıklayın
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-[#9BCEC1] text-[#2C1A18] rounded-2xl flex items-center justify-center shadow-xs">
                    <RobotIcon size={20} />
                  </div>
                  <div>
                    <p className="font-extrabold text-[#2C1A18]">
                      Şu An Podyumda:{" "}
                      {allBranches.find((b) => b.id === currentBranchId)
                        ?.name || "Bilinmiyor"}
                    </p>
                    <p className="text-xs text-[#5E3D38] font-extrabold">
                      Konuşma {currentTurn} / {totalTurns}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[#2C1A18] font-extrabold bg-[#9BCEC1] px-4 py-1.5 rounded-xl shadow-xs">
                    Kalan konuşma: {totalTurns - currentTurn}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatDisplay;

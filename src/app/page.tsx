"use client";

import Link from "next/link";
import React, { useMemo } from "react";
import branchesData from "@/data/branches.json";
import { useDebateLogic } from "@/hooks/useDebateLogic";
import { useBranchManagement } from "@/hooks/useBranchManagement";
import DebateSetup from "@/components/DebateSetup";
import ChatDisplay from "@/components/ChatDisplay";
import AddBranchModal from "@/components/AddBranchModal";
import JudgePopup from "@/components/JudgePopup";
import ShareModal from "@/components/ShareModal";
import { Branch } from "@/types/debate";
import { RobotIcon } from "@/components/ui/Icons";

const branches = branchesData as Branch[];

export default function Home() {
  const debateLogic = useDebateLogic();
  const branchManagement = useBranchManagement();

  const allBranches = useMemo(
    () => [...branches, ...branchManagement.customBranches],
    [branchManagement.customBranches],
  );

  const { generateShareData } = debateLogic;
  const shareData = useMemo(
    () => generateShareData(allBranches),
    [generateShareData, allBranches],
  );

  return (
    <div className="app-shell">
      <div className="app-content space-y-6">
        <header className="app-header">
          <Link href="/" className="brand">
            <span className="brand-symbol">
              <RobotIcon size={22} />
            </span>
            <span>
              Yapay Zeka
              <span className="brand-subtitle">Tartışma Platformu</span>
            </span>
          </Link>
          <span className="header-note">
            <span className="status-dot" />
            Fikirler karşılaşır. Bakış açın genişler.
          </span>
        </header>

        {!debateLogic.ready && (
          <p role="status">Kayıtlı oturum yükleniyor...</p>
        )}
        {debateLogic.error && (
          <div
            role="alert"
            className="rounded-2xl border border-[#FFB6A6] bg-white/50 p-4 text-[#2C1A18]"
          >
            {debateLogic.error}
          </div>
        )}
        {/* MAIN BODY AREA (Command Setup vs Live Arena) */}
        {debateLogic.ready && debateLogic.chatHistory.length === 0 && (
          <DebateSetup
            debateFrame={debateLogic.debateFrame}
            isClarifying={debateLogic.isClarifying}
            onClarifyTopic={debateLogic.clarifyTopic}
            onFrameChange={debateLogic.setDebateFrame}
            onManualFrame={debateLogic.editFrameManually}
            topic={debateLogic.topic}
            roundsPerExpert={debateLogic.roundsPerExpert}
            onRoundsChange={debateLogic.setRoundsPerExpert}
            setTopic={debateLogic.setTopic}
            sources={debateLogic.sources}
            setSources={debateLogic.setSources}
            branchRoles={debateLogic.branchRoles}
            onRoleChange={(id, role) =>
              debateLogic.setBranchRoles((prev) => ({ ...prev, [id]: role }))
            }
            selectedBranches={debateLogic.selectedBranches}
            allBranches={allBranches}
            customBranches={branchManagement.customBranches}
            onBranchSelection={debateLogic.handleBranchSelection}
            onStartDebate={() => debateLogic.startDebate(allBranches)}
            onShowAddBranchModal={() =>
              branchManagement.setShowAddBranchModal(true)
            }
            onEditBranch={branchManagement.editBranch}
            onDeleteBranch={(id) => {
              debateLogic.removeBranch(id);
              branchManagement.deleteBranch(id);
            }}
          />
        )}

        {debateLogic.chatHistory.length > 0 && (
          <ChatDisplay
            debateFrame={debateLogic.debateFrame}
            chatHistory={debateLogic.chatHistory}
            isStreamingMessage={debateLogic.isStreamingMessage}
            currentStreamingContent={debateLogic.currentStreamingContent}
            selectedBranches={debateLogic.selectedBranches}
            activeBranchOrder={debateLogic.activeBranchOrder}
            currentTurn={debateLogic.currentTurn}
            totalTurns={debateLogic.totalTurns}
            roundsPerExpert={debateLogic.roundsPerExpert}
            allBranches={allBranches}
            topic={debateLogic.topic}
            isDebating={debateLogic.isDebating}
            finalVerdict={debateLogic.finalVerdict}
            onStopDebate={debateLogic.stopDebate}
            onPauseDebate={debateLogic.pauseDebate}
            onResumeDebate={() => debateLogic.resumeDebate(allBranches)}
            isJudgeLoading={debateLogic.isJudgeLoading}
            judgeReport={debateLogic.judgeReport}
            onShowJudgeReport={debateLogic.openJudgePopup}
            branchRoles={debateLogic.branchRoles}
            onResetDebate={debateLogic.resetDebate}
            onShareDebate={debateLogic.openShareModal}
            chatEndRef={debateLogic.chatEndRef}
          />
        )}

        {/* MODALS */}
        <JudgePopup
          showPopup={debateLogic.showJudgePopup}
          isLoading={debateLogic.isJudgeLoading}
          verdict={debateLogic.finalVerdict}
          report={debateLogic.judgeReport}
          onClose={debateLogic.closeJudgePopup}
        />

        <AddBranchModal
          showModal={branchManagement.showAddBranchModal}
          newBranchName={branchManagement.newBranchName}
          setNewBranchName={branchManagement.setNewBranchName}
          newBranchDescription={branchManagement.newBranchDescription}
          setNewBranchDescription={branchManagement.setNewBranchDescription}
          isGeneratingDescription={branchManagement.isGeneratingDescription}
          error={branchManagement.error}
          editingBranch={branchManagement.editingBranch}
          onGenerateDescription={branchManagement.generateDescription}
          onAddBranch={branchManagement.addCustomBranch}
          onClose={branchManagement.closeAddBranchModal}
        />

        <ShareModal
          isOpen={debateLogic.showShareModal}
          onClose={debateLogic.closeShareModal}
          debateData={shareData}
        />
      </div>
    </div>
  );
}

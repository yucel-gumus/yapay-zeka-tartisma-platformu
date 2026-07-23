'use client';

import React, { useEffect } from 'react';
import branchesData from '@/data/branches.json';
import { useDebateLogic } from '@/hooks/useDebateLogic';
import { useBranchManagement } from '@/hooks/useBranchManagement';
import DebateSetup from '@/components/DebateSetup';
import ChatDisplay from '@/components/ChatDisplay';
import AddBranchModal from '@/components/AddBranchModal';
import JudgePopup from '@/components/JudgePopup';
import ShareModal from '@/components/ShareModal';
import { Branch } from '@/types/debate';
import { RobotIcon } from '@/components/ui/Icons';

const branches = branchesData as Branch[];

export default function Home() {
  const debateLogic = useDebateLogic();
  const branchManagement = useBranchManagement();

  const allBranches = [...branches, ...branchManagement.customBranches];

  useEffect(() => {
    debateLogic.chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [debateLogic.chatHistory, debateLogic.currentStreamingContent, debateLogic.chatEndRef]);

  return (
    <div className="min-h-screen bg-[#FFEBD3] py-6 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* MINIMAL HEADER BAR */}
        <header className="flex items-center justify-between py-3 px-5 bg-[#FFEBD3] border-2 border-[#FFB6A6] rounded-2xl shadow-xs">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#9BCEC1] text-[#2C1A18] rounded-xl shadow-xs">
              <RobotIcon size={22} />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-[#2C1A18] tracking-tight leading-tight">
                Yapay Zeka Tartışma Platformu
              </h1>
              <p className="text-xs text-[#5E3D38] font-semibold">
                Farklı disiplinlerden yapay zeka modellerinin canlı bilimsel tartışması
              </p>
            </div>
          </div>
        </header>

        {/* MAIN BODY AREA (Command Setup vs Live Arena) */}
        {!debateLogic.isDebating && !debateLogic.finalVerdict && (
          <DebateSetup
            topic={debateLogic.topic}
            setTopic={debateLogic.setTopic}
            selectedBranches={debateLogic.selectedBranches}
            allBranches={allBranches}
            customBranches={branchManagement.customBranches}
            onBranchSelection={debateLogic.handleBranchSelection}
            onStartDebate={() => debateLogic.startDebate(allBranches)}
            onShowAddBranchModal={() => branchManagement.setShowAddBranchModal(true)}
            onEditBranch={branchManagement.editBranch}
            onDeleteBranch={branchManagement.deleteBranch}
          />
        )}

        {(debateLogic.isDebating || debateLogic.finalVerdict) && (
          <ChatDisplay
            chatHistory={debateLogic.chatHistory}
            isStreamingMessage={debateLogic.isStreamingMessage}
            currentStreamingContent={debateLogic.currentStreamingContent}
            selectedBranches={debateLogic.selectedBranches}
            activeBranchOrder={debateLogic.activeBranchOrder}
            currentTurn={debateLogic.currentTurn}
            allBranches={allBranches}
            topic={debateLogic.topic}
            isDebating={debateLogic.isDebating}
            finalVerdict={debateLogic.finalVerdict}
            onStopDebate={debateLogic.stopDebate}
            onResetDebate={debateLogic.resetDebate}
            onShareDebate={debateLogic.openShareModal}
            chatEndRef={debateLogic.chatEndRef}
          />
        )}

        <footer className="text-center text-[#5E3D38] text-sm font-semibold border-t-2 border-[#FFB6A6]/40 pt-6">
          <p>Powered by Google Gemini AI • Next.js • Tailwind CSS</p>
        </footer>

        {/* MODALS */}
        <JudgePopup
          showPopup={debateLogic.showJudgePopup}
          isLoading={debateLogic.isJudgeLoading}
          verdict={debateLogic.finalVerdict}
          onClose={debateLogic.closeJudgePopup}
        />

        <AddBranchModal
          showModal={branchManagement.showAddBranchModal}
          newBranchName={branchManagement.newBranchName}
          setNewBranchName={branchManagement.setNewBranchName}
          newBranchDescription={branchManagement.newBranchDescription}
          setNewBranchDescription={branchManagement.setNewBranchDescription}
          isGeneratingDescription={branchManagement.isGeneratingDescription}
          editingBranch={branchManagement.editingBranch}
          onGenerateDescription={branchManagement.generateDescription}
          onAddBranch={branchManagement.addCustomBranch}
          onClose={branchManagement.closeAddBranchModal}
        />

        <ShareModal
          isOpen={debateLogic.showShareModal}
          onClose={debateLogic.closeShareModal}
          debateData={debateLogic.generateShareData(allBranches)}
        />
      </div>
    </div>
  );
}

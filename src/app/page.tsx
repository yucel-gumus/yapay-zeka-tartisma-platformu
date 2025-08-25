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

const branches = branchesData as Array<{
  id: string;
  name: string;
  description: string;
}>;

export default function Home() {
  const debateLogic = useDebateLogic();
  const branchManagement = useBranchManagement();

  const allBranches = [...branches, ...branchManagement.customBranches];

  useEffect(() => {
    debateLogic.chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [debateLogic.chatHistory, debateLogic.currentStreamingContent, debateLogic.chatEndRef]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🤖 Yapay Zeka Tartışma Platformu
          </h1>
          <p className="text-gray-600 text-lg">
            Farklı uzmanlık alanlarından yapay zeka modellerinin canlı tartışması
          </p>
        </header>

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

        <footer className="text-center mt-12 text-gray-500 text-sm">
          <p>Powered by Google Gemini AI • Next.js • Tailwind CSS</p>
        </footer>

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

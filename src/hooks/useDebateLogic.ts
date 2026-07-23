import { useState, useRef, useCallback } from 'react';
import { ChatMessageType, Branch, SharedDebateData } from '@/types/debate';
import { DEBATE_CONFIG } from '@/config/constants';

export type { ChatMessageType };

export const useDebateLogic = () => {
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [activeBranchOrder, setActiveBranchOrder] = useState<string[]>([]);
  const [topic, setTopic] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessageType[]>([]);
  const [isDebating, setIsDebating] = useState(false);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [finalVerdict, setFinalVerdict] = useState('');
  const [isStreamingMessage, setIsStreamingMessage] = useState(false);
  const [currentStreamingContent, setCurrentStreamingContent] = useState('');
  const [showJudgePopup, setShowJudgePopup] = useState(false);
  const [isJudgeLoading, setIsJudgeLoading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleBranchSelection = (branchId: string) => {
    setSelectedBranches((prev: string[]) => {
      if (prev.includes(branchId)) {
        return prev.filter((id: string) => id !== branchId);
      } else if (prev.length < DEBATE_CONFIG.REQUIRED_EXPERTS) {
        return [...prev, branchId];
      }
      return prev;
    });
  };

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const generateNextResponse = useCallback(async (
    turnIndex: number,
    currentHistory: ChatMessageType[],
    branchOrder: string[],
    allBranches: Branch[],
    retryCount: number = 0
  ) => {
    if (turnIndex >= DEBATE_CONFIG.TOTAL_TURNS) return;

    const branchIndex = turnIndex % DEBATE_CONFIG.REQUIRED_EXPERTS;
    const branchId = branchOrder[branchIndex];
    const selectedBranch = allBranches.find((b) => b.id === branchId);

    if (!selectedBranch) return;

    setIsStreamingMessage(true);
    setCurrentStreamingContent('');

    // AbortController initialization
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify({
          chatHistory: currentHistory,
          personaDescription: selectedBranch,
          topic,
          branch: selectedBranch.id,
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      const decoder = new TextDecoder();
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullContent += chunk;
        if (!controller.signal.aborted) {
          setCurrentStreamingContent(fullContent);
        }
      }

      if (controller.signal.aborted) return;

      if (!fullContent.trim() || fullContent.trim().length < 10) {
        setCurrentStreamingContent('');
        setIsStreamingMessage(false);

        if (retryCount < DEBATE_CONFIG.MAX_RETRIES) {
          setTimeout(() => {
            if (!controller.signal.aborted) {
              generateNextResponse(turnIndex, currentHistory, branchOrder, allBranches, retryCount + 1);
            }
          }, DEBATE_CONFIG.RETRY_STREAM_DELAY_MS);
          return;
        } else {
          const fallbackMessage: ChatMessageType = {
            role: 'assistant',
            content: `[${selectedBranch.name} bu turda yanıt veremedi - sistem hatası]`,
            branch: selectedBranch.id,
            branchName: selectedBranch.name,
          };

          const updatedHistory = [...currentHistory, fallbackMessage];
          setChatHistory(updatedHistory);
          setCurrentTurn(turnIndex + 1);

          setTimeout(() => {
            if (!controller.signal.aborted) {
              generateNextResponse(turnIndex + 1, updatedHistory, branchOrder, allBranches);
            }
          }, DEBATE_CONFIG.NEXT_TURN_DELAY_MS);
          return;
        }
      }

      const newMessage: ChatMessageType = {
        role: 'assistant',
        content: fullContent.trim(),
        branch: selectedBranch.id,
        branchName: selectedBranch.name,
      };

      const updatedHistory = [...currentHistory, newMessage];
      setChatHistory(updatedHistory);
      setCurrentStreamingContent('');
      setIsStreamingMessage(false);
      setCurrentTurn(turnIndex + 1);

      setTimeout(() => {
        if (!controller.signal.aborted) {
          generateNextResponse(turnIndex + 1, updatedHistory, branchOrder, allBranches);
        }
      }, DEBATE_CONFIG.NEXT_TURN_DELAY_MS);

    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        return; // Request was aborted cleanly
      }

      setIsStreamingMessage(false);
      setCurrentStreamingContent('');

      if (retryCount < DEBATE_CONFIG.MAX_RETRIES) {
        setTimeout(() => {
          if (!controller.signal.aborted) {
            generateNextResponse(turnIndex, currentHistory, branchOrder, allBranches, retryCount + 1);
          }
        }, DEBATE_CONFIG.RETRY_ERROR_DELAY_MS);
      } else {
        const errorMessage: ChatMessageType = {
          role: 'assistant',
          content: `[${selectedBranch.name} teknik bir sorun nedeniyle bu turda yanıt veremedi]`,
          branch: selectedBranch.id,
          branchName: selectedBranch.name,
        };

        const updatedHistory = [...currentHistory, errorMessage];
        setChatHistory(updatedHistory);
        setCurrentTurn(turnIndex + 1);

        setTimeout(() => {
          if (!controller.signal.aborted) {
            generateNextResponse(turnIndex + 1, updatedHistory, branchOrder, allBranches);
          }
        }, DEBATE_CONFIG.NEXT_TURN_DELAY_MS);
      }
    }
  }, [topic]);

  const startDebate = (allBranches: Branch[]) => {
    if (selectedBranches.length !== DEBATE_CONFIG.REQUIRED_EXPERTS || !topic.trim()) return;

    const shuffledBranchOrder = shuffleArray([...selectedBranches]);
    setActiveBranchOrder(shuffledBranchOrder);

    setIsDebating(true);
    setCurrentTurn(0);
    setChatHistory([]);
    setFinalVerdict('');

    const initialMessage: ChatMessageType = {
      role: 'user',
      content: `Tartışma konusu: "${topic}". Seçilen uzmanlar tartışmaya başlıyor...`,
    };
    setChatHistory([initialMessage]);

    setTimeout(() => {
      generateNextResponse(0, [initialMessage], shuffledBranchOrder, allBranches);
    }, DEBATE_CONFIG.START_DEBATE_DELAY_MS);
  };

  const stopDebate = async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsDebating(false);
    setIsStreamingMessage(false);
    setShowJudgePopup(true);
    setIsJudgeLoading(true);
    setFinalVerdict('');

    try {
      const response = await fetch('/api/judge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatHistory,
          topic,
        }),
      });

      if (!response.ok) throw new Error('Failed to get judge verdict');

      const data = await response.json();
      setFinalVerdict(data.verdict);
      setIsJudgeLoading(false);

      const judgeMessage: ChatMessageType = {
        role: 'judge',
        content: data.verdict,
      };
      setChatHistory((prev: ChatMessageType[]) => [...prev, judgeMessage]);

    } catch {
      setFinalVerdict('Hakem kararı alınırken bir hata oluştu.');
      setIsJudgeLoading(false);
    }
  };

  const resetDebate = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setSelectedBranches([]);
    setActiveBranchOrder([]);
    setTopic('');
    setChatHistory([]);
    setIsDebating(false);
    setCurrentTurn(0);
    setFinalVerdict('');
    setIsStreamingMessage(false);
    setCurrentStreamingContent('');
    setShowJudgePopup(false);
    setIsJudgeLoading(false);
  };

  const closeJudgePopup = () => {
    setShowJudgePopup(false);
  };

  const openShareModal = () => {
    setShowShareModal(true);
  };

  const closeShareModal = () => {
    setShowShareModal(false);
  };

  const generateShareData = (allBranches: Branch[]): SharedDebateData => {
    const selectedBranchDetails = allBranches.filter(branch =>
      selectedBranches.includes(branch.id)
    );

    return {
      topic,
      chatHistory,
      selectedBranches,
      branchDetails: selectedBranchDetails,
      finalVerdict,
      timestamp: Date.now(),
    };
  };

  return {
    selectedBranches,
    activeBranchOrder,
    topic,
    setTopic,
    chatHistory,
    isDebating,
    currentTurn,
    finalVerdict,
    isStreamingMessage,
    currentStreamingContent,
    showJudgePopup,
    isJudgeLoading,
    showShareModal,
    chatEndRef,
    handleBranchSelection,
    startDebate,
    stopDebate,
    resetDebate,
    closeJudgePopup,
    openShareModal,
    closeShareModal,
    generateShareData,
  };
};

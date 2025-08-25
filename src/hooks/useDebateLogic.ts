import { useState, useRef } from 'react';
import { availableModels } from '@/lib/gemini';

export interface ChatMessageType {
  role: 'user' | 'assistant' | 'judge';
  content: string;
  branch?: string;
  branchName?: string;
}

export const useDebateLogic = () => {
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [topic, setTopic] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessageType[]>([]);
  const [isDebating, setIsDebating] = useState(false);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [finalVerdict, setFinalVerdict] = useState('');
  const [isStreamingMessage, setIsStreamingMessage] = useState(false);
  const [currentStreamingContent, setCurrentStreamingContent] = useState('');
  const [showJudgePopup, setShowJudgePopup] = useState(false);
  const [isJudgeLoading, setIsJudgeLoading] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const handleBranchSelection = (branchId: string) => {
    setSelectedBranches((prev: string[]) => {
      if (prev.includes(branchId)) {
        return prev.filter((id: string) => id !== branchId);
      } else if (prev.length < 4) {
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

  const startDebate = (allBranches: { id: string; name: string; description: string }[]) => {
    if (selectedBranches.length !== 4 || !topic.trim()) return;
    
    const shuffledModels = shuffleArray([...availableModels]);
    
    setIsDebating(true);
    setCurrentTurn(0);
    setChatHistory([]);
    setFinalVerdict('');
    
    const initialMessage: ChatMessageType = {
      role: 'user',
      content: `Tartışma konusu: "${topic}". Seçilen uzmanlar tartışmaya başlıyor...`
    };
    setChatHistory([initialMessage]);
    
    setTimeout(() => {
      generateNextResponse(0, [initialMessage], shuffledModels.slice(0, 4), allBranches);
    }, 1000);
  };

  const generateNextResponse = async (turnIndex: number, currentHistory: ChatMessageType[], models: string[], allBranches: { id: string; name: string; description: string }[], retryCount: number = 0) => {
    if (turnIndex >= 12) return;
    
    const branchIndex = turnIndex % 4;
    const selectedBranch = allBranches.find((b) => b.id === selectedBranches[branchIndex]);
    
    if (!selectedBranch) return;
    
    setIsStreamingMessage(true);
    setCurrentStreamingContent('');
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatHistory: currentHistory,
          currentModel: models[branchIndex],
          personaDescription: selectedBranch,
          topic,
          branch: selectedBranch.id
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
        setCurrentStreamingContent(fullContent);
      }

      // Check if response is empty or too short
      if (!fullContent.trim() || fullContent.trim().length < 10) {
        console.warn(`Empty or too short response from ${selectedBranch.name}, retry ${retryCount + 1}/3`);
        setCurrentStreamingContent('');
        setIsStreamingMessage(false);
        
        // Retry up to 3 times
        if (retryCount < 2) {
          setTimeout(() => {
            generateNextResponse(turnIndex, currentHistory, models, allBranches, retryCount + 1);
          }, 2000);
          return;
        } else {
          // After 3 failed attempts, add a fallback message and continue
          console.error(`Failed to get response from ${selectedBranch.name} after 3 attempts, skipping turn`);
          const fallbackMessage: ChatMessageType = {
            role: 'assistant',
            content: `[${selectedBranch.name} bu turda yanıt veremedi - sistem hatası]`,
            branch: selectedBranch.id,
            branchName: selectedBranch.name
          };
          
          const updatedHistory = [...currentHistory, fallbackMessage];
          setChatHistory(updatedHistory);
          setCurrentTurn(turnIndex + 1);
          
          setTimeout(() => {
            generateNextResponse(turnIndex + 1, updatedHistory, models, allBranches);
          }, 1500);
          return;
        }
      }

      const newMessage: ChatMessageType = {
        role: 'assistant',
        content: fullContent.trim(),
        branch: selectedBranch.id,
        branchName: selectedBranch.name
      };

      const updatedHistory = [...currentHistory, newMessage];
      setChatHistory(updatedHistory);
      setCurrentStreamingContent('');
      setIsStreamingMessage(false);
      setCurrentTurn(turnIndex + 1);

      setTimeout(() => {
        generateNextResponse(turnIndex + 1, updatedHistory, models, allBranches);
      }, 1500);

    } catch (error) {
      console.error('Error generating response:', error);
      setIsStreamingMessage(false);
      setCurrentStreamingContent('');
      
      // Handle network/API errors with retry logic
      if (retryCount < 2) {
        console.warn(`API error for ${selectedBranch.name}, retry ${retryCount + 1}/3`);
        setTimeout(() => {
          generateNextResponse(turnIndex, currentHistory, models, allBranches, retryCount + 1);
        }, 3000);
      } else {
        // After 3 failed attempts, add error message and continue
        console.error(`Failed to get response from ${selectedBranch.name} after 3 attempts due to API error`);
        const errorMessage: ChatMessageType = {
          role: 'assistant',
          content: `[${selectedBranch.name} teknik bir sorun nedeniyle bu turda yanıt veremedi]`,
          branch: selectedBranch.id,
          branchName: selectedBranch.name
        };
        
        const updatedHistory = [...currentHistory, errorMessage];
        setChatHistory(updatedHistory);
        setCurrentTurn(turnIndex + 1);
        
        setTimeout(() => {
          generateNextResponse(turnIndex + 1, updatedHistory, models, allBranches);
        }, 1500);
      }
    }
  };

  const stopDebate = async () => {
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
          topic
        }),
      });

      if (!response.ok) throw new Error('Failed to get judge verdict');

      const data = await response.json();
      setFinalVerdict(data.verdict);
      setIsJudgeLoading(false);
      
      const judgeMessage: ChatMessageType = {
        role: 'judge',
        content: data.verdict
      };
      setChatHistory((prev: ChatMessageType[]) => [...prev, judgeMessage]);

    } catch (error) {
      console.error('Error getting judge verdict:', error);
      setFinalVerdict('Hakem kararı alınırken bir hata oluştu.');
      setIsJudgeLoading(false);
    }
  };

  const resetDebate = () => {
    setSelectedBranches([]);
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

  return {
    selectedBranches,
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
    chatEndRef,
    handleBranchSelection,
    startDebate,
    stopDebate,
    resetDebate,
    closeJudgePopup
  };
};

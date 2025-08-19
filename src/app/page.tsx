'use client';

import React, { useState, useEffect, useRef } from 'react';
import ChatMessage from '@/components/ChatMessage';
import branchesData from '@/data/branches.json';
import { availableModels } from '@/lib/gemini';

const branches = branchesData as Array<{
  id: string;
  name: string;
  description: string;
}>;

interface Branch {
  id: string;
  name: string;
  description: string;
}

interface ChatMessageType {
  role: 'user' | 'assistant' | 'judge';
  content: string;
  branch?: string;
  branchName?: string;
}

export default function Home() {
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

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, currentStreamingContent]);

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

  const startDebate = () => {
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
      generateNextResponse(0, [initialMessage], shuffledModels.slice(0, 4));
    }, 1000);
  };

  const generateNextResponse = async (turnIndex: number, currentHistory: ChatMessageType[], models: string[]) => {
    if (turnIndex >= 12) return;
    
    const branchIndex = turnIndex % 4;
    const selectedBranch = branches.find((b) => b.id === selectedBranches[branchIndex]);
    
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
        generateNextResponse(turnIndex + 1, updatedHistory, models);
      }, 1500);

    } catch (error) {
      console.error('Error generating response:', error);
      setIsStreamingMessage(false);
      setCurrentStreamingContent('');
    }
  };

  const stopDebate = async () => {
    setIsDebating(false);
    setIsStreamingMessage(false);
    setShowJudgePopup(true);
    setIsJudgeLoading(true);
    setFinalVerdict('');
    
    console.log('Starting judge request with topic:', topic);
    console.log('Chat history for judge:', chatHistory);
    
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

      console.log('Judge response status:', response.status);

      if (!response.ok) throw new Error('Failed to get judge verdict');

      const data = await response.json();
      console.log('Judge response data:', data);
      console.log('Verdict text:', data.verdict);
      
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🤖 Gemini AI Tartışma Platformu
          </h1>
          <p className="text-gray-600 text-lg">
            Farklı uzmanlık alanlarından yapay zeka modellerinin canlı tartışması
          </p>
        </header>

        {!isDebating && !finalVerdict && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                🎯 Tartışma Kurulumu
              </h2>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tartışma Konusu
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Örn: Yapay zeka teknolojisinin toplum üzerindeki etkisi"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Uzmanlık Alanları Seçin (Tam 4 tane seçin)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {branches.map((branch: Branch) => (
                    <div
                      key={branch.id}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedBranches.includes(branch.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleBranchSelection(branch.id)}
                    >
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedBranches.includes(branch.id)}
                          onChange={() => {}}
                          className="mr-2"
                        />
                        <span className="font-medium text-sm">{branch.name}</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {branch.description.substring(0, 60)}...
                      </p>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Seçilen: {selectedBranches.length}/4
                </p>
              </div>

              <button
                onClick={startDebate}
                disabled={selectedBranches.length !== 4 || !topic.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                🚀 Tartışmayı Başlat
              </button>
            </div>
          </div>
        )}

        {(isDebating || finalVerdict) && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">
                  💬 Canlı Tartışma
                </h2>
                <div className="flex gap-2">
                  {isDebating && (
                    <button
                      onClick={stopDebate}
                      className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                    >
                      👨‍⚖️ Hakem Kararını Göster
                    </button>
                  )}
                  {finalVerdict && (
                    <button
                      onClick={resetDebate}
                      className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                    >
                      🔄 Yeni Tartışma
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {chatHistory.map((message, index) => (
                  <ChatMessage key={index} message={message} />
                ))}
                
                {isStreamingMessage && currentStreamingContent && (
                  <ChatMessage
                    message={{
                      role: 'assistant',
                      content: currentStreamingContent,
                      branch: selectedBranches[currentTurn % 4],
                      branchName: branches.find((b) => b.id === selectedBranches[currentTurn % 4])?.name
                    }}
                    isStreaming={true}
                  />
                )}
                
                <div ref={chatEndRef} />
              </div>

              {isDebating && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    🎭 Sıra: {branches.find((b) => b.id === selectedBranches[currentTurn % 4])?.name || 'Bilinmiyor'} 
                    ({currentTurn + 1}/8)
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Konu: {topic}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        <footer className="text-center mt-12 text-gray-500 text-sm">
          <p>Powered by Google Gemini AI • Next.js • Tailwind CSS</p>
        </footer>

        {/* Hakem Popup */}
        {showJudgePopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
              <div className="text-center">
                <div className="text-4xl mb-4">⚖️</div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  Hakem Kararı
                </h3>
                
                {isJudgeLoading ? (
                  <div className="py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Hakem cevabı bekleniyor...</p>
                    <p className="text-sm text-gray-400 mt-2">Uzman görüşleri analiz ediliyor</p>
                  </div>
                ) : (
                  <div className="text-left">
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <p className="text-gray-800 leading-relaxed">
                        {finalVerdict || 'Boş cevap alındı'}
                      </p>
                      {/* Debug info */}
                      <div className="text-xs text-gray-400 mt-2">
                        Debug: Verdict length: {finalVerdict?.length || 0}
                      </div>
                    </div>
                    <button
                      onClick={closeJudgePopup}
                      className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Kapat
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

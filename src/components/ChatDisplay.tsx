import React from 'react';
import ChatMessage from './ChatMessage';
import { ChatMessageType } from '@/hooks/useDebateLogic';
import { Branch } from '@/hooks/useBranchManagement';

interface ChatDisplayProps {
  chatHistory: ChatMessageType[];
  isStreamingMessage: boolean;
  currentStreamingContent: string;
  selectedBranches: string[];
  currentTurn: number;
  allBranches: Branch[];
  topic: string;
  isDebating: boolean;
  finalVerdict: string;
  onStopDebate: () => void;
  onResetDebate: () => void;
  onShareDebate: () => void;
  chatEndRef: React.RefObject<HTMLDivElement | null>;
}

const ChatDisplay: React.FC<ChatDisplayProps> = ({
  chatHistory,
  isStreamingMessage,
  currentStreamingContent,
  selectedBranches,
  currentTurn,
  allBranches,
  topic,
  isDebating,
  finalVerdict,
  onStopDebate,
  onResetDebate,
  onShareDebate,
  chatEndRef
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header Section */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Title and Topic */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <span className="text-white text-lg">💬</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    Canlı Tartışma
                  </h1>
                  <p className="text-sm text-gray-500 font-medium">
                    {topic}
                  </p>
                </div>
              </div>
              
              {/* Progress Bar */}
              {isDebating && (
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${Math.min((currentTurn / 12) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-600 min-w-[60px]">
                    {currentTurn}/12
                  </span>
                </div>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3">
              {isDebating && (
                <button
                  onClick={onStopDebate}
                  disabled={currentTurn < 12}
                  className={`group relative overflow-hidden px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    currentTurn >= 12 
                      ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105' 
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <span className="text-lg">👨‍⚖️</span>
                    Hakem Kararını Göster
                  </span>
                  {currentTurn >= 12 && (
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                  )}
                </button>
              )}
              {finalVerdict && (
                <>
                  <button
                    onClick={onShareDebate}
                    className="group relative overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <span className="text-lg">🔗</span>
                      Paylaş
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                  </button>
                  <button
                    onClick={onResetDebate}
                    className="group relative overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <span className="text-lg">🔄</span>
                      Yeni Tartışma
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Chat Area */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="p-6 space-y-6 h-[calc(100vh-280px)] overflow-y-auto custom-scrollbar">
          {chatHistory.map((message, index) => (
            <ChatMessage key={index} message={message} />
          ))}
          
            {isStreamingMessage && !currentStreamingContent && (
              <div className="flex items-center space-x-4 p-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-2xl border border-blue-200/50 shadow-sm">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-lg">🤔</span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-bold text-gray-800">
                      {allBranches.find((b) => b.id === selectedBranches[currentTurn % 4])?.name}
                    </span>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                  <p className="text-blue-600 text-sm font-medium">Yanıt hazırlanıyor...</p>
                </div>
              </div>
            )}
          
          {isStreamingMessage && currentStreamingContent && (
            <ChatMessage
              message={{
                role: 'assistant',
                content: currentStreamingContent,
                branch: selectedBranches[currentTurn % 4],
                branchName: allBranches.find((b) => b.id === selectedBranches[currentTurn % 4])?.name
              }}
              isStreaming={true}
            />
          )}
          
            <div ref={chatEndRef} />
          </div>
          
          {/* Status Footer */}
          {isDebating && (
            <div className={`px-6 py-4 border-t border-gray-200/50 ${
              currentTurn >= 12 
                ? 'bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50' 
                : 'bg-gradient-to-r from-blue-50 to-indigo-50'
            }`}>
              {currentTurn >= 12 ? (
                <div className="text-center">
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center animate-pulse">
                      <span className="text-white text-xl">⏰</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-amber-700">
                        Tartışma Tamamlandı!
                      </h3>
                      <p className="text-sm text-amber-600">
                        Tüm uzmanlar görüşlerini belirtti
                      </p>
                    </div>
                  </div>
                  <div className="bg-white/60 rounded-xl p-4 backdrop-blur-sm">
                    <p className="text-sm text-amber-700 mb-2 font-medium">
                      Hakem kararını almak için yukarıdaki butona tıklayın
                    </p>
                    <div className="flex items-center justify-center gap-2 text-xs text-amber-600">
                      <span>🎯</span>
                      <span className="font-medium">{topic}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">🎭</span>
                    </div>
                    <div>
                      <p className="font-semibold text-blue-700">
                        Sıra: {allBranches.find((b) => b.id === selectedBranches[currentTurn % 4])?.name || 'Bilinmiyor'}
                      </p>
                      <p className="text-xs text-blue-600">
                        Tur {currentTurn} / 12
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-blue-600 font-medium">
                      Kalan tur: {12 - currentTurn}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #3b82f6, #6366f1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #2563eb, #4f46e5);
        }
      `}</style>
    </div>
  );
};

export default ChatDisplay;

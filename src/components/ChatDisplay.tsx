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
  chatEndRef
}) => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            💬 Canlı Tartışma
          </h2>
          <div className="flex gap-2">
            {isDebating && (
              <button
                onClick={onStopDebate}
                disabled={currentTurn < 12}
                className={`font-semibold py-2 px-4 rounded-lg transition-colors ${
                  currentTurn >= 12 
                    ? 'bg-red-600 hover:bg-red-700 text-white cursor-pointer' 
                    : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                }`}
              >
                👨‍⚖️ Hakem Kararını Göster
              </button>
            )}
            {finalVerdict && (
              <button
                onClick={onResetDebate}
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
          
          {isStreamingMessage && !currentStreamingContent && (
            <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
              <div className="text-blue-700">
                <span className="font-semibold">
                  {allBranches.find((b) => b.id === selectedBranches[currentTurn % 4])?.name}
                </span>
                <span className="text-blue-600 ml-1">düşünüyor...</span>
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

        {isDebating && (
          <div className={`mt-4 p-4 rounded-xl ${currentTurn >= 12 ? 'bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-200' : 'bg-blue-50'}`}>
            {currentTurn >= 12 ? (
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <span className="text-2xl">⏰</span>
                  <p className="text-lg font-bold text-orange-700">
                    Tartışma Tamamlandı!
                  </p>
                </div>
                <p className="text-sm text-orange-600 mb-3">
                  Tüm uzmanlar görüşlerini belirtti. Artık hakem kararını almak için &quot;Hakem Kararını Göster&quot; butonuna tıklayın.
                </p>
                <div className="flex items-center justify-center space-x-2 text-xs text-orange-500">
                  <span>🎯</span>
                  <span>Konu: {topic}</span>
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm text-blue-700">
                  🎭 Sıra: {allBranches.find((b) => b.id === selectedBranches[currentTurn % 4])?.name || 'Bilinmiyor'} 
                  ({currentTurn}/12)
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Konu: {topic}
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatDisplay;

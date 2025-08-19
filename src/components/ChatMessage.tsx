import React from 'react';

interface ChatMessageProps {
  message: {
    role: 'user' | 'assistant' | 'judge';
    content: string;
    branch?: string;
    branchName?: string;
  };
  isStreaming?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isStreaming = false }) => {
  const getBranchColor = (branch?: string) => {
    if (!branch) return 'bg-gray-100';
    
    const colors = [
      'bg-blue-100 border-blue-300',
      'bg-green-100 border-green-300', 
      'bg-yellow-100 border-yellow-300',
      'bg-purple-100 border-purple-300',
      'bg-red-100 border-red-300',
      'bg-indigo-100 border-indigo-300',
      'bg-pink-100 border-pink-300',
      'bg-teal-100 border-teal-300'
    ];
    
    const hash = branch.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    return colors[Math.abs(hash) % colors.length];
  };

  if (message.role === 'judge') {
    return (
      <div className="mb-6 p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-lg shadow-md">
        <div className="flex items-center mb-3">
          <div className="w-3 h-3 bg-amber-500 rounded-full mr-2"></div>
          <span className="font-bold text-amber-800 text-lg">🏛️ Hakem Kararı</span>
        </div>
        <div className="text-gray-800 text-lg leading-relaxed">
          {message.content}
          {isStreaming && <span className="animate-pulse">|</span>}
        </div>
      </div>
    );
  }

  return (
    <div className={`mb-4 p-4 rounded-lg border-2 ${getBranchColor(message.branch)} shadow-sm`}>
      <div className="flex items-center mb-2">
        <div className="w-2 h-2 bg-gray-600 rounded-full mr-2"></div>
        <span className="font-semibold text-gray-700">
          {message.branchName || 'Kullanıcı'}
        </span>
      </div>
      <div className="text-gray-800 leading-relaxed">
        {message.content}
        {isStreaming && <span className="animate-pulse">|</span>}
      </div>
    </div>
  );
};

export default ChatMessage;

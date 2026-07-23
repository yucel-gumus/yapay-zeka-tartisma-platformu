import React from 'react';
import { ChatMessageType } from '@/types/debate';
import { JudgeIcon, RobotIcon, UserAvatarIcon } from './ui/Icons';

interface ChatMessageProps {
  message: ChatMessageType;
  isStreaming?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isStreaming = false }) => {
  if (message.role === 'judge') {
    return (
      <div className="mb-6 p-6 bg-[#9BCEC1] border-3 border-[#FFB6A6] rounded-3xl shadow-md">
        <div className="flex items-center mb-3 space-x-3">
          <div className="p-2 bg-[#FFB6A6] text-[#2C1A18] rounded-2xl shadow-xs">
            <JudgeIcon size={22} />
          </div>
          <span className="font-extrabold text-[#2C1A18] text-xl">Hakem Kararı</span>
        </div>
        <div className="text-[#2C1A18] text-lg leading-relaxed font-bold">
          {message.content}
          {isStreaming && <span className="animate-pulse">|</span>}
        </div>
      </div>
    );
  }

  const isUser = message.role === 'user';

  return (
    <div
      className={`mb-4 p-5 rounded-3xl border-2 transition-all shadow-xs ${
        isUser
          ? 'bg-[#FFB6A6]/40 border-[#FFB6A6] text-[#2C1A18]'
          : 'bg-[#FFB6A6]/20 border-[#FFB6A6]/80 text-[#2C1A18]'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 bg-[#9BCEC1] text-[#2C1A18] rounded-xl flex items-center justify-center shadow-xs">
            {isUser ? <UserAvatarIcon size={18} /> : <RobotIcon size={18} />}
          </div>
          <span className="font-extrabold text-[#2C1A18] text-base">
            {message.branchName || (isUser ? 'Tartışma Konusu & Başlangıcı' : 'Uzman')}
          </span>
        </div>
        {message.branchName && (
          <span className="text-xs bg-[#9BCEC1] text-[#2C1A18] font-extrabold px-3 py-1 rounded-xl shadow-xs">
            Uzman Görüşü
          </span>
        )}
      </div>
      <div className="text-[#2C1A18] leading-relaxed font-semibold text-base whitespace-pre-wrap pl-1">
        {message.content}
        {isStreaming && <span className="animate-pulse font-extrabold text-[#9BCEC1]"> |</span>}
      </div>
    </div>
  );
};

export default ChatMessage;

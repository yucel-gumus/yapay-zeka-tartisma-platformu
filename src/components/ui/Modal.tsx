import React from 'react';
import { CloseIcon } from './Icons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  icon?: React.ReactNode;
  maxWidthClass?: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  icon,
  maxWidthClass = 'max-w-lg',
  children,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#2C1A18]/50 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
      <div
        className={`bg-[#FFEBD3] border-2 border-[#FFB6A6] rounded-3xl p-6 ${maxWidthClass} w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col`}
      >
        {title && (
          <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-[#FFB6A6]/40">
            <div className="flex items-center space-x-3">
              {icon && (
                <div className="w-10 h-10 bg-[#9BCEC1] rounded-2xl flex items-center justify-center text-[#2C1A18] shadow-xs">
                  {icon}
                </div>
              )}
              <h3 className="text-xl font-extrabold text-[#2C1A18] tracking-tight">{title}</h3>
            </div>
            <button
              onClick={onClose}
              className="text-[#5E3D38] hover:text-[#2C1A18] transition-colors w-9 h-9 flex items-center justify-center rounded-2xl hover:bg-[#FFB6A6]/40 cursor-pointer"
              aria-label="Kapat"
            >
              <CloseIcon size={20} />
            </button>
          </div>
        )}
        <div className="overflow-y-auto flex-1 custom-scrollbar">{children}</div>
      </div>
    </div>
  );
};

import React from 'react';
import { Modal } from './ui/Modal';
import { JudgeIcon } from './ui/Icons';

interface JudgePopupProps {
  showPopup: boolean;
  isLoading: boolean;
  verdict: string;
  onClose: () => void;
}

const JudgePopup: React.FC<JudgePopupProps> = ({
  showPopup,
  isLoading,
  verdict,
  onClose,
}) => {
  return (
    <Modal
      isOpen={showPopup}
      onClose={onClose}
      title="Hakem Kararı"
      icon={<JudgeIcon size={24} />}
      maxWidthClass="max-w-2xl"
    >
      <div className="text-center">
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-4">
            <div className="animate-spin rounded-full h-14 w-14 border-b-4 border-[#9BCEC1] border-t-transparent"></div>
            <div>
              <p className="text-[#2C1A18] font-extrabold text-xl">Hakem kararı değerlendiriliyor...</p>
              <p className="text-sm text-[#5E3D38] font-semibold mt-1">4 uzmanın sunduğu tüm argümanlar çapraz analiz ediliyor</p>
            </div>
          </div>
        ) : (
          <div className="text-left space-y-6">
            <div className="bg-[#FFB6A6]/30 rounded-3xl p-6 md:p-8 border-2 border-[#FFB6A6] shadow-xs max-h-[60vh] overflow-y-auto custom-scrollbar">
              <div className="flex items-center space-x-2 mb-4 pb-3 border-b border-[#FFB6A6]/60">
                <span className="text-xs font-extrabold uppercase tracking-widest text-[#5E3D38] bg-[#9BCEC1] px-3 py-1 rounded-xl text-[#2C1A18]">
                  Resmi Mahkeme Kararı Metni
                </span>
              </div>
              <p className="text-[#2C1A18] leading-relaxed font-bold text-base md:text-lg whitespace-pre-wrap">
                {verdict || 'Boş cevap alındı'}
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-full bg-[#9BCEC1] hover:bg-[#85b9ac] text-[#2C1A18] font-extrabold text-lg py-4 px-6 rounded-2xl transition-all shadow-md hover:shadow-lg active:opacity-90 cursor-pointer"
            >
              Kararı Anladım ve Kapat
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default JudgePopup;

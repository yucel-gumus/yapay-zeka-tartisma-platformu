import React, { useState } from 'react';

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
  onClose
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(verdict);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  if (!showPopup) return null;

  return (
    <div className="fixed inset-0 bg-white/10 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="text-center">
          <div className="text-4xl mb-4">⚖️</div>
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Hakem Kararı
          </h3>
          
          {isLoading ? (
            <div className="py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Hakem cevabı bekleniyor...</p>
              <p className="text-sm text-gray-400 mt-2">Uzman görüşleri analiz ediliyor</p>
            </div>
          ) : (
            <div className="text-left">
              <div className="bg-gray-50 rounded-lg p-4 mb-4 relative">
                <p className="text-gray-800 leading-relaxed pr-10">
                  {verdict || 'Boş cevap alındı'}
                </p>
                <button
                  onClick={handleCopy}
                  className="absolute top-2 right-2 p-1 hover:bg-gray-200 rounded transition-colors"
                  title={copied ? 'Kopyalandı!' : 'Kopyala'}
                >
                  {copied ? (
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>
              </div>
              <button
                onClick={onClose}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Kapat
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JudgePopup;

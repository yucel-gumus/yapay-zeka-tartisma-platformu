import React from 'react';

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
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-gray-800 leading-relaxed">
                  {verdict || 'Boş cevap alındı'}
                </p>
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

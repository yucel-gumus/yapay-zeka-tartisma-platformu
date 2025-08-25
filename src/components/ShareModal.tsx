'use client';

import React, { useState } from 'react';
import { SharedDebateData, generateShareableLink, copyToClipboard } from '@/utils/shareUtils';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  debateData: SharedDebateData;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, debateData }) => {
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (isOpen && debateData) {
      const generateLink = async () => {
        setLoading(true);
        setShareLink('');
        try {
          const link = await generateShareableLink(debateData);
          setShareLink(link);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
          alert(`Link oluşturma hatası: ${errorMessage}`);
          setShareLink('');
        } finally {
          setLoading(false);
        }
      };
      
      generateLink();
    }
  }, [isOpen, debateData]);

  const handleCopyLink = async () => {
    const success = await copyToClipboard(shareLink);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSocialShare = (platform: string) => {
    const text = `"${debateData.topic}" konusunda yapılan AI tartışmasını inceleyin!`;
    const url = shareLink;
    
    let shareUrl = '';
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">🔗 Tartışmayı Paylaş</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="mb-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200 mb-4">
              <h3 className="font-semibold text-blue-800 mb-1">{debateData.topic}</h3>
              <p className="text-sm text-blue-600">
                {debateData.selectedBranches.length} uzman • {debateData.chatHistory.length} mesaj
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Firebase&apos;e kaydediliyor...</span>
              </div>
            ) : shareLink ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Paylaşım Linki:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={shareLink}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 text-black rounded-lg  text-sm"
                  />
                  <button
                    onClick={handleCopyLink}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      copied 
                        ? 'bg-green-600 text-white' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {copied ? '✓' : 'Kopyala'}
                  </button>
                </div>
                {copied && (
                  <p className="text-green-600 text-sm mt-1">Link kopyalandı!</p>
                )}
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm">
                  <span className="font-medium">❌ Hata:</span> Link oluşturulamadı. Firebase bağlantısını kontrol edin.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-2 text-red-600 hover:text-red-800 text-sm underline"
                >
                  Sayfayı yenile ve tekrar dene
                </button>
              </div>
            )}
          </div>

          <div className="mb-6">
            <h4 className="font-medium text-gray-700 mb-3">Sosyal Medyada Paylaş:</h4>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleSocialShare('twitter')}
                className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors"
              >
                <span>🐦</span>
                Twitter
              </button>
              <button
                onClick={() => handleSocialShare('linkedin')}
                className="flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white py-2 px-4 rounded-lg transition-colors"
              >
                <span>💼</span>
                LinkedIn
              </button>
              <button
                onClick={() => handleSocialShare('whatsapp')}
                className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition-colors"
              >
                <span>📱</span>
                WhatsApp
              </button>
              <button
                onClick={() => handleSocialShare('telegram')}
                className="flex items-center justify-center gap-2 bg-blue-400 hover:bg-blue-500 text-white py-2 px-4 rounded-lg transition-colors"
              >
                <span>✈️</span>
                Telegram
              </button>
            </div>
          </div>


          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <span className="font-medium">💡 Not:</span> Bu link tartışmanın tam kopyasını içerir ve herkes tarafından görüntülenebilir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;

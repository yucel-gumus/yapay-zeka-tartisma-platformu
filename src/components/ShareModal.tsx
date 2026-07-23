'use client';

import React, { useState, useEffect } from 'react';
import { SharedDebateData, generateShareableLink, copyToClipboard } from '@/utils/shareUtils';
import { Modal } from './ui/Modal';
import { ShareIcon, CopyIcon, CheckIcon, TwitterIcon, LinkedInIcon, WhatsAppIcon, TelegramIcon } from './ui/Icons';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  debateData: SharedDebateData;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, debateData }) => {
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tartışmayı Paylaş"
      icon={<ShareIcon size={22} />}
      maxWidthClass="max-w-md"
    >
      <div className="mb-6 space-y-4">
        <div className="bg-[#FFB6A6]/30 rounded-2xl p-4 border-2 border-[#FFB6A6]">
          <h3 className="font-extrabold text-[#2C1A18] text-base mb-1">{debateData.topic}</h3>
          <p className="text-sm font-semibold text-[#5E3D38]">
            {debateData.selectedBranches.length} uzman • {debateData.chatHistory.length} mesaj
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#9BCEC1]"></div>
            <span className="ml-3 font-extrabold text-[#2C1A18]">Firebase&apos;e kaydediliyor...</span>
          </div>
        ) : shareLink ? (
          <div>
            <label className="block text-sm font-extrabold text-[#2C1A18] mb-2">
              Paylaşım Linki:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={shareLink}
                readOnly
                className="flex-1 px-4 py-3 border-2 border-[#FFB6A6] bg-[#FFEBD3] text-[#2C1A18] font-bold rounded-2xl text-sm focus:outline-none"
              />
              <button
                onClick={handleCopyLink}
                className="px-5 py-3 rounded-2xl font-extrabold transition-all shadow-xs cursor-pointer bg-[#9BCEC1] hover:bg-[#85b9ac] text-[#2C1A18] flex items-center gap-1.5"
              >
                {copied ? <CheckIcon size={18} /> : <CopyIcon size={18} />}
                <span>{copied ? 'Kopyalandı' : 'Kopyala'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-[#FFB6A6]/40 border-2 border-[#FFB6A6] rounded-2xl p-4">
            <p className="text-[#2C1A18] text-sm font-extrabold">
              ❌ Hata: Link oluşturulamadı. Firebase bağlantısını kontrol edin.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-[#2C1A18] font-extrabold text-sm underline cursor-pointer"
            >
              Sayfayı yenile ve tekrar dene
            </button>
          </div>
        )}
      </div>

      <div className="mb-6">
        <h4 className="font-extrabold text-[#2C1A18] mb-3">Sosyal Medyada Paylaş:</h4>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleSocialShare('twitter')}
            className="flex items-center justify-center gap-2 bg-[#9BCEC1] hover:bg-[#85b9ac] text-[#2C1A18] font-extrabold py-3 px-4 rounded-2xl transition-all shadow-xs cursor-pointer"
          >
            <TwitterIcon size={18} />
            <span>X / Twitter</span>
          </button>
          <button
            onClick={() => handleSocialShare('linkedin')}
            className="flex items-center justify-center gap-2 bg-[#FFB6A6] hover:bg-[#f0a595] text-[#2C1A18] font-extrabold py-3 px-4 rounded-2xl transition-all shadow-xs cursor-pointer"
          >
            <LinkedInIcon size={18} />
            <span>LinkedIn</span>
          </button>
          <button
            onClick={() => handleSocialShare('whatsapp')}
            className="flex items-center justify-center gap-2 bg-[#9BCEC1] hover:bg-[#85b9ac] text-[#2C1A18] font-extrabold py-3 px-4 rounded-2xl transition-all shadow-xs cursor-pointer"
          >
            <WhatsAppIcon size={18} />
            <span>WhatsApp</span>
          </button>
          <button
            onClick={() => handleSocialShare('telegram')}
            className="flex items-center justify-center gap-2 bg-[#FFB6A6] hover:bg-[#f0a595] text-[#2C1A18] font-extrabold py-3 px-4 rounded-2xl transition-all shadow-xs cursor-pointer"
          >
            <TelegramIcon size={18} />
            <span>Telegram</span>
          </button>
        </div>
      </div>

      <div className="bg-[#FFB6A6]/20 border-2 border-[#FFB6A6] rounded-2xl p-4">
        <p className="text-xs text-[#5E3D38] font-semibold">
          💡 Not: Bu link tartışmanın tam kopyasını içerir ve herkes tarafından görüntülenebilir.
        </p>
      </div>
    </Modal>
  );
};

export default ShareModal;

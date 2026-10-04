"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  SharedDebateData,
  generateShareableLink,
  copyToClipboard,
} from "@/utils/shareUtils";
import { Modal } from "./ui/Modal";
import {
  ShareIcon,
  CopyIcon,
  CheckIcon,
  TwitterIcon,
  LinkedInIcon,
  WhatsAppIcon,
  TelegramIcon,
  IdeaIcon,
} from "./ui/Icons";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  debateData: SharedDebateData;
}

const SOCIAL_TARGETS = [
  {
    label: "X / Twitter",
    Icon: TwitterIcon,
    href: (url: string, text: string) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
  },
  {
    label: "LinkedIn",
    Icon: LinkedInIcon,
    href: (url: string) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
  {
    label: "WhatsApp",
    Icon: WhatsAppIcon,
    href: (url: string, text: string) =>
      `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
  },
  {
    label: "Telegram",
    Icon: TelegramIcon,
    href: (url: string, text: string) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
  },
];

const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  debateData,
}) => {
  const [shareLink, setShareLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const idRef = useRef<string>("");
  const dataRef = useRef<SharedDebateData | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (isOpen && debateData) {
      if (dataRef.current !== debateData) {
        dataRef.current = debateData;
        idRef.current = crypto.randomUUID();
      }
      const generateLink = async () => {
        setLoading(true);
        setShareLink("");
        setError("");
        setCopied(false);
        try {
          const link = await generateShareableLink(debateData, idRef.current);
          if (!cancelled) setShareLink(link);
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Bilinmeyen hata";
          if (!cancelled) {
            setError(errorMessage);
            setShareLink("");
          }
        } finally {
          if (!cancelled) setLoading(false);
        }
      };

      generateLink();
    }
    return () => {
      cancelled = true;
    };
  }, [isOpen, debateData, retry]);

  const handleCopyLink = async () => {
    const success = await copyToClipboard(shareLink);
    setCopyFailed(!success);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareText = `"${debateData.topic}" konusunda yapılan AI tartışmasını inceleyin!`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tartışmayı Paylaş"
      icon={<ShareIcon size={22} />}
      maxWidthClass="max-w-md"
    >
      <div className="mb-6 space-y-4">
        <div className="bg-[#FFB6A6]/30 rounded-xl p-4 border border-[#FFB6A6]">
          <h3 className="font-semibold text-[#2C1A18] text-base mb-1">
            {debateData.topic}
          </h3>
          <p className="text-sm font-semibold text-[#5E3D38]">
            {debateData.selectedBranches.length} uzman •{" "}
            {debateData.chatHistory.length} mesaj
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#9BCEC1]"></div>
            <span className="ml-3 font-semibold text-[#2C1A18]">
              Paylaşım bağlantısı hazırlanıyor…
            </span>
          </div>
        ) : shareLink ? (
          <div>
            <label
              htmlFor="share-link"
              className="block text-sm font-semibold text-[#2C1A18] mb-2"
            >
              Paylaşım Linki:
            </label>
            <div className="flex gap-2">
              <input
                id="share-link"
                type="text"
                value={shareLink}
                readOnly
                className="field min-w-0 flex-1"
              />
              <button
                onClick={handleCopyLink}
                className="btn btn-mint"
              >
                {copied ? <CheckIcon size={18} /> : <CopyIcon size={18} />}
                <span>{copied ? "Kopyalandı" : "Kopyala"}</span>
              </button>
            </div>
            {copyFailed && (
              <p role="alert" className="helper mt-2">
                Otomatik kopyalanamadı. Bağlantıyı seçip elle kopyalayın.
              </p>
            )}
          </div>
        ) : (
          <div className="bg-[#FFB6A6]/40 border border-[#FFB6A6] rounded-xl p-4">
            <p className="text-[#2C1A18] text-sm font-semibold">
              {error || "Paylaşım bağlantısı oluşturulamadı."}
            </p>
            <button
              onClick={() => setRetry((value) => value + 1)}
              className="mt-2 text-[#2C1A18] font-semibold text-sm underline cursor-pointer"
            >
              Tekrar dene
            </button>
          </div>
        )}
      </div>

      <div className="mb-6">
        <h4 className="font-semibold text-[#2C1A18] mb-3">
          Sosyal Medyada Paylaş:
        </h4>
        <div className="grid grid-cols-2 gap-3">
          {SOCIAL_TARGETS.map(({ label, Icon, href }) => (
            <button
              key={label}
              disabled={!shareLink || loading}
              onClick={() =>
                window.open(
                  href(shareLink, shareText),
                  "_blank",
                  "noopener,noreferrer,width=600,height=400",
                )
              }
              className="btn btn-outline"
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[#FFB6A6]/20 border border-[#FFB6A6] rounded-xl p-4">
        <p className="text-xs text-[#5E3D38] font-semibold flex items-center gap-1.5">
          <IdeaIcon size={16} className="shrink-0 text-[#2C1A18]" />
          <span>
            Not: Bu link tartışmanın tam kopyasını içerir ve herkes tarafından
            görüntülenebilir.
          </span>
        </p>
      </div>
    </Modal>
  );
};

export default ShareModal;

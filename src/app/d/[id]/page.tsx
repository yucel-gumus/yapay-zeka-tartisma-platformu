"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ChatMessage from "@/components/ChatMessage";
import JudgeReportView from "@/components/JudgeReportView";
import DebateFrameView from "@/components/DebateFrameView";
import { SharedDebateData } from "@/types/debate";
import { loadDebateFromFirebase, formatTimestamp } from "@/utils/shareUtils";
import {
  ShareIcon,
  TargetIcon,
  ClockIcon,
  UsersIcon,
  ChatIcon,
  JudgeIcon,
  CloseIcon,
} from "@/components/ui/Icons";

function DebateContent() {
  const params = useParams();
  const [debateData, setDebateData] = useState<SharedDebateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDebate = async () => {
      const debateId = params.id as string;

      if (!debateId) {
        setError("Geçersiz tartışma ID'si");
        setLoading(false);
        return;
      }

      try {
        const data = await loadDebateFromFirebase(debateId);
        if (data) {
          setDebateData(data);
        } else {
          setError("Tartışma bulunamadı veya süresi dolmuş olabilir.");
        }
      } catch {
        setError("Tartışma yüklenirken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    };

    loadDebate();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFEBD3] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#9BCEC1] border-t-transparent mx-auto mb-4"></div>
          <p className="text-[#2C1A18] font-semibold text-lg">
            Tartışma yükleniyor...
          </p>
        </div>
      </div>
    );
  }

  if (error || !debateData) {
    return (
      <div className="min-h-screen bg-[#FFEBD3] flex items-center justify-center p-4">
        <div className="bg-[#FFEBD3] border border-[#FFB6A6] rounded-3xl shadow-sm p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-[#FFB6A6]/40 text-[#2C1A18] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#FFB6A6]">
            <CloseIcon size={32} />
          </div>
          <h1 className="text-2xl font-semibold text-[#2C1A18] mb-2">
            Tartışma Bulunamadı
          </h1>
          <p className="text-[#5E3D38] font-semibold mb-6">{error}</p>
          <Link
            href="/"
            className="inline-block bg-[#9BCEC1] hover:bg-[#85b9ac] text-[#2C1A18] font-semibold py-3 px-6 rounded-2xl transition-all shadow-sm"
          >
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    );
  }

  const conversationMessages = debateData.chatHistory.filter(
    (message) => message.role !== "judge",
  );

  const finalVerdictText =
    debateData.finalVerdict ||
    debateData.chatHistory.find((message) => message.role === "judge")?.content;

  return (
    <div className="min-h-screen bg-[#FFEBD3]">
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8">
        {/* Header */}
        <div className="surface section-pad mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <h1 className="text-2xl font-semibold text-[#2C1A18] flex items-center gap-3">
              <ShareIcon size={28} className="text-[#2C1A18]" />
              Paylaşılan Tartışma
            </h1>
            <Link
              href="/"
              className="bg-[#9BCEC1] hover:bg-[#85b9ac] text-[#2C1A18] font-semibold py-3 px-6 rounded-2xl transition-all shadow-sm"
            >
              Yeni Tartışma Başlat
            </Link>
          </div>

          <div className="bg-[#FFB6A6]/30 rounded-2xl p-5 border border-[#FFB6A6]">
            <h2 className="text-xl font-semibold text-[#2C1A18] mb-2 flex items-center gap-2">
              <TargetIcon size={22} className="text-[#2C1A18]" />
              {debateData.topic}
            </h2>
            <div className="flex flex-wrap gap-4 text-sm font-bold text-[#5E3D38]">
              <span className="flex items-center gap-1.5">
                <ClockIcon size={16} />
                {formatTimestamp(debateData.timestamp)}
              </span>
              <span className="flex items-center gap-1.5">
                <UsersIcon size={16} />
                {debateData.selectedBranches.length} Uzman
              </span>
              <span className="flex items-center gap-1.5">
                <ChatIcon size={16} />
                {conversationMessages.length} Mesaj
              </span>
            </div>
          </div>
        </div>

        {debateData.debateFrame && (
          <DebateFrameView frame={debateData.debateFrame} />
        )}
        {debateData.sources && (
          <section className="mb-6 rounded-2xl border border-[#FFB6A6] p-5">
            <h3 className="mb-2 font-semibold">Kullanıcının kaynak notları</h3>
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {debateData.sources}
            </p>
            <p className="mt-2 text-xs">Bu notlar bağımsız doğrulanmamıştır.</p>
          </section>
        )}
        {/* Experts */}
        <div className="surface section-pad mb-6">
          <h3 className="text-xl font-semibold text-[#2C1A18] mb-4 flex items-center gap-2">
            <UsersIcon size={22} />
            Katılan Uzmanlar
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {debateData.branchDetails
              .filter((branch) =>
                debateData.selectedBranches.includes(branch.id),
              )
              .map((branch) => (
                <div
                  key={branch.id}
                  className="bg-[#FFB6A6]/20 rounded-2xl p-4 border border-[#FFB6A6]"
                >
                  <h4 className="font-semibold text-[#2C1A18] mb-1">
                    {branch.name}
                  </h4>
                  <p className="text-sm text-[#5E3D38] font-medium leading-relaxed">
                    {branch.description}
                  </p>
                </div>
              ))}
          </div>
        </div>

        {/* Chat History */}
        <div className="surface section-pad mb-6">
          <h3 className="text-xl font-semibold text-[#2C1A18] mb-4 flex items-center gap-2">
            <ChatIcon size={22} />
            Tartışma Geçmişi
          </h3>
          <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
            {conversationMessages.map((message, index) => (
              <ChatMessage key={index} message={message} />
            ))}
          </div>
        </div>

        {/* Final Verdict */}
        {finalVerdictText && (
          <div className="surface section-pad">
            <h3 className="text-xl font-semibold text-[#2C1A18] mb-4 flex items-center gap-2">
              <JudgeIcon size={24} />
              Hakem Kararı
            </h3>
            <div className="rounded-xl p-1">
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-[#2C1A18] font-semibold text-lg leading-relaxed">
                  {debateData.judgeReport ? (
                    <JudgeReportView report={debateData.judgeReport} />
                  ) : (
                    finalVerdictText
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SharedDebatePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FFEBD3] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#9BCEC1] border-t-transparent mx-auto mb-4"></div>
            <p className="text-[#2C1A18] font-semibold text-lg">
              Sayfa yükleniyor...
            </p>
          </div>
        </div>
      }
    >
      <DebateContent />
    </Suspense>
  );
}

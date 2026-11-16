"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ChatMessage from "@/components/ChatMessage";
import JudgeReportView from "@/components/JudgeReportView";
import DebateFrameView from "@/components/DebateFrameView";
import { SharedDebateData } from "@/types/debate";
import { loadDebateFromFirebase, formatTimestamp } from "@/utils/shareUtils";
import { getPersonaTheme } from "@/lib/personaTheme";
import {
  ShareIcon,
  TargetIcon,
  ClockIcon,
  UsersIcon,
  ChatIcon,
  JudgeIcon,
  CloseIcon,
} from "@/components/ui/Icons";

export default function SharedDebatePage() {
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
      <div className="min-h-screen bg-[#EDF3EE] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#EC7D55] border-t-transparent mx-auto mb-4"></div>
          <p className="text-[#253341] font-semibold text-lg">
            Tartışma yükleniyor...
          </p>
        </div>
      </div>
    );
  }

  if (error || !debateData) {
    return (
      <div className="min-h-screen bg-[#EDF3EE] flex items-center justify-center p-4">
        <div className="bg-[#DCE3EA] border border-[#BCC7D2] rounded-3xl shadow-sm p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-[#F2A488]/35 text-[#AB421C] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#AB421C]">
            <CloseIcon size={32} />
          </div>
          <h1 className="text-2xl font-semibold text-[#253341] mb-2">
            Tartışma Bulunamadı
          </h1>
          <p className="text-[#3E5164] font-semibold mb-6">{error}</p>
          <Link href="/" className="btn btn-mint">
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
    <div className="min-h-screen bg-[#EDF3EE]">
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8">
        {/* Header */}
        <div className="surface section-pad mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <h1 className="text-2xl font-semibold text-[#253341] flex items-center gap-3">
              <ShareIcon size={28} className="text-[#AB421C]" />
              Paylaşılan Tartışma
            </h1>
            <Link href="/" className="btn btn-mint">
              Yeni Tartışma Başlat
            </Link>
          </div>

          <div className="bg-[#DBE6DD] rounded-2xl p-5 border border-[#BCC7D2]">
            <h2 className="text-xl font-semibold text-[#253341] mb-2 flex items-center gap-2">
              <TargetIcon size={22} className="text-[#AB421C]" />
              {debateData.topic}
            </h2>
            <div className="flex flex-wrap gap-4 text-sm font-bold text-[#3E5164]">
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
          <section className="mb-6 rounded-2xl border border-[#BCC7D2] bg-[#DCE3EA] p-5 text-[#253341]">
            <h3 className="mb-2 font-semibold">Kullanıcının kaynak notları</h3>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#253341]">
              {debateData.sources}
            </p>
            <p className="mt-2 text-xs text-[#3E5164]">Bu notlar bağımsız doğrulanmamıştır.</p>
          </section>
        )}
        {/* Experts */}
        <div className="surface section-pad mb-6">
          <h3 className="text-xl font-semibold text-[#253341] mb-4 flex items-center gap-2">
            <UsersIcon size={22} />
            Katılan Uzmanlar
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {debateData.branchDetails
              .filter((branch) =>
                debateData.selectedBranches.includes(branch.id),
              )
              .map((branch) => {
                const persona = getPersonaTheme(branch.id || branch.name);
                return (
                  <div
                    key={branch.id}
                    className="bg-[#F5F9F5] rounded-2xl p-4 border border-[#BCC7D2]"
                    style={{ borderTop: `3px solid ${persona.border}` }}
                  >
                    <div className="flex items-center gap-2.5 mb-2">
                      <span
                        className="w-7 h-7 rounded-lg inline-flex items-center justify-center text-xs font-bold shrink-0 border"
                        style={{
                          backgroundColor: persona.bg,
                          color: persona.text,
                          borderColor: persona.border,
                        }}
                      >
                        {branch.name.slice(0, 1)}
                      </span>
                      <h4 className="font-semibold text-[#253341] leading-snug">
                        {branch.name}
                      </h4>
                    </div>
                    <p className="text-sm text-[#3E5164] font-medium leading-relaxed">
                      {branch.description}
                    </p>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Chat History */}
        <div className="surface section-pad mb-6">
          <h3 className="text-xl font-semibold text-[#253341] mb-4 flex items-center gap-2">
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
            <h3 className="text-xl font-semibold text-[#253341] mb-4 flex items-center gap-2">
              <JudgeIcon size={24} className="text-[#AB421C]" />
              Hakem Kararı
            </h3>
            {debateData.judgeReport ? (
              <JudgeReportView report={debateData.judgeReport} />
            ) : (
              <p className="whitespace-pre-wrap text-sm leading-relaxed break-words text-[#253341]">
                {finalVerdictText}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

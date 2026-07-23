'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ChatMessage from '@/components/ChatMessage';
import { SharedDebateData } from '@/types/debate';
import { loadDebateFromFirebase, formatTimestamp } from '@/utils/shareUtils';

function DebateContent() {
  const params = useParams();
  const [debateData, setDebateData] = useState<SharedDebateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDebate = async () => {
      const debateId = params.id as string;
      
      if (!debateId) {
        setError('Geçersiz tartışma ID\'si');
        setLoading(false);
        return;
      }

      try {
        const data = await loadDebateFromFirebase(debateId);
        if (data) {
          setDebateData(data);
        } else {
          setError('Tartışma bulunamadı veya süresi dolmuş olabilir.');
        }
      } catch {
        setError('Tartışma yüklenirken bir hata oluştu.');
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
          <p className="text-[#3D2622] font-extrabold text-lg">Tartışma yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error || !debateData) {
    return (
      <div className="min-h-screen bg-[#FFEBD3] flex items-center justify-center p-4">
        <div className="bg-[#FFEBD3] border-3 border-[#FFB6A6] rounded-3xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-extrabold text-[#3D2622] mb-2">Tartışma Bulunamadı</h1>
          <p className="text-[#6B4E4A] font-semibold mb-6">{error}</p>
          <Link 
            href="/"
            className="inline-block bg-[#9BCEC1] hover:bg-[#85b9ac] text-[#3D2622] font-extrabold py-3 px-6 rounded-2xl transition-all shadow-sm"
          >
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFEBD3]">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-[#FFEBD3] rounded-3xl border-2 border-[#FFB6A6] shadow-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <h1 className="text-3xl font-extrabold text-[#3D2622]">
              🔗 Paylaşılan Tartışma
            </h1>
            <Link 
              href="/"
              className="bg-[#9BCEC1] hover:bg-[#85b9ac] text-[#3D2622] font-extrabold py-3 px-6 rounded-2xl transition-all shadow-sm"
            >
              Yeni Tartışma Başlat
            </Link>
          </div>
          
          <div className="bg-[#FFB6A6]/30 rounded-2xl p-5 border-2 border-[#FFB6A6]">
            <h2 className="text-xl font-extrabold text-[#3D2622] mb-2">
              📝 {debateData.topic}
            </h2>
            <div className="flex flex-wrap gap-4 text-sm font-bold text-[#6B4E4A]">
              <span>📅 {formatTimestamp(debateData.timestamp)}</span>
              <span>👥 {debateData.selectedBranches.length} Uzman</span>
              <span>💬 {debateData.chatHistory.length} Mesaj</span>
            </div>
          </div>
        </div>

        {/* Experts */}
        <div className="bg-[#FFEBD3] rounded-3xl border-2 border-[#FFB6A6] shadow-lg p-6 mb-6">
          <h3 className="text-xl font-extrabold text-[#3D2622] mb-4">
            👨‍💼 Katılan Uzmanlar
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {debateData.branchDetails
              .filter(branch => debateData.selectedBranches.includes(branch.id))
              .map((branch) => (
                <div key={branch.id} className="bg-[#FFB6A6]/20 rounded-2xl p-4 border-2 border-[#FFB6A6]">
                  <h4 className="font-extrabold text-[#3D2622] mb-1">{branch.name}</h4>
                  <p className="text-sm text-[#6B4E4A] font-medium leading-relaxed">{branch.description}</p>
                </div>
              ))}
          </div>
        </div>

        {/* Chat History */}
        <div className="bg-[#FFEBD3] rounded-3xl border-2 border-[#FFB6A6] shadow-lg p-6 mb-6">
          <h3 className="text-xl font-extrabold text-[#3D2622] mb-4">
            💬 Tartışma Geçmişi
          </h3>
          <div className="space-y-4 max-h-screen overflow-y-auto custom-scrollbar pr-2">
            {debateData.chatHistory.map((message, index) => (
              <ChatMessage key={index} message={message} />
            ))}
          </div>
        </div>

        {/* Final Verdict */}
        {debateData.finalVerdict ? (
          <div className="bg-[#FFEBD3] rounded-3xl border-2 border-[#FFB6A6] shadow-lg p-6">
            <h3 className="text-xl font-extrabold text-[#3D2622] mb-4">
              👨‍⚖️ Hakem Kararı
            </h3>
            <div className="bg-[#9BCEC1] rounded-2xl p-6 border-2 border-[#FFB6A6]">
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-[#3D2622] font-extrabold text-lg leading-relaxed">
                  {debateData.finalVerdict}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-[#FFEBD3] rounded-3xl border-2 border-[#FFB6A6] shadow-lg p-6">
            <h3 className="text-xl font-extrabold text-[#3D2622] mb-4">
              👨‍⚖️ Hakem Kararı
            </h3>
            <div className="bg-[#FFB6A6]/20 rounded-2xl p-6 border-2 border-[#FFB6A6]">
              <p className="text-[#6B4E4A] font-semibold italic">Hakem Kararı bulunmuyor.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SharedDebatePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FFEBD3] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#9BCEC1] border-t-transparent mx-auto mb-4"></div>
          <p className="text-[#3D2622] font-extrabold text-lg">Sayfa yükleniyor...</p>
        </div>
      </div>
    }>
      <DebateContent />
    </Suspense>
  );
}

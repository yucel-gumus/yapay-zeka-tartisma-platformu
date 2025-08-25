'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ChatMessage from '@/components/ChatMessage';
import { SharedDebateData, loadDebateFromFirebase, formatTimestamp } from '@/utils/shareUtils';

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Tartışma yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error || !debateData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-4">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Tartışma Bulunamadı</h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <Link 
              href="/"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Ana Sayfaya Dön
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-800">
              🔗 Paylaşılan Tartışma
            </h1>
            <Link 
              href="/"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Yeni Tartışma Başlat
            </Link>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
            <h2 className="text-xl font-semibold text-blue-800 mb-2">
              📝 {debateData.topic}
            </h2>
            <div className="flex flex-wrap gap-4 text-sm text-blue-600">
              <span>📅 {formatTimestamp(debateData.timestamp)}</span>
              <span>👥 {debateData.selectedBranches.length} Uzman</span>
              <span>💬 {debateData.chatHistory.length} Mesaj</span>
            </div>
          </div>
        </div>

        {/* Experts */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            👨‍💼 Katılan Uzmanlar
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {debateData.branchDetails
              .filter(branch => debateData.selectedBranches.includes(branch.id))
              .map((branch) => (
                <div key={branch.id} className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-2">{branch.name}</h4>
                  <p className="text-sm text-gray-600">{branch.description}</p>
                </div>
              ))}
          </div>
        </div>

        {/* Chat History */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            💬 Tartışma Geçmişi
          </h3>
          <div className="space-y-4 max-h-screen overflow-y-auto">
            {debateData.chatHistory.map((message, index) => (
              <ChatMessage key={index} message={message} />
            ))}
          </div>
        </div>

        {/* Final Verdict */}
        {!debateData.finalVerdict && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              👨‍⚖️ Hakem Kararı
            </h3>
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-6 border border-yellow-200">
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-gray-700">
                  &quot;Hakem Kararı oluşmadı&quot;
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
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Sayfa yükleniyor...</p>
        </div>
      </div>
    }>
      <DebateContent />
    </Suspense>
  );
}

import React from 'react';
import { Branch } from '@/hooks/useBranchManagement';

interface DebateSetupProps {
  topic: string;
  setTopic: (topic: string) => void;
  selectedBranches: string[];
  allBranches: Branch[];
  customBranches: Branch[];
  onBranchSelection: (branchId: string) => void;
  onStartDebate: () => void;
  onShowAddBranchModal: () => void;
  onEditBranch: (branch: Branch) => void;
  onDeleteBranch: (branchId: string) => void;
}

const DebateSetup: React.FC<DebateSetupProps> = ({
  topic,
  setTopic,
  selectedBranches,
  allBranches,
  customBranches,
  onBranchSelection,
  onStartDebate,
  onShowAddBranchModal,
  onEditBranch,
  onDeleteBranch
}) => {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 rounded-full p-2">
              <span className="text-2xl">🎯</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                Tartışma Kurulumu
              </h2>
              <p className="text-blue-100 text-sm">
                Konunuzu belirleyin ve uzmanları seçin
              </p>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Topic Input Section */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className="text-lg">💭</span>
              <label className="text-lg font-semibold text-gray-800">
                Tartışma Konusu
              </label>
            </div>
            <div className="relative">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Örn: Yapay zeka teknolojisinin toplum üzerindeki etkisi"
                className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 bg-black shadow-sm hover:shadow-md placeholder-gray-400"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <div className={`w-3 h-3 rounded-full ${topic.trim() ? 'bg-green-400' : 'bg-gray-300'} transition-colors`}></div>
              </div>
            </div>
          </div>

          {/* Experts Selection Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-lg">👥</span>
                <label className="text-lg font-semibold text-gray-800">
                  Uzmanlık Alanları
                </label>
                <button
                  onClick={onShowAddBranchModal}
                  className="ml-3 px-3 py-1 text-sm bg-green-100 hover:bg-green-200 text-green-700 rounded-full transition-colors flex items-center space-x-1"
                >
                  <span className="text-xs">➕</span>
                  <span>Uzmanlık Alanı Ekle</span>
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  selectedBranches.length === 4 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {selectedBranches.length}/4 seçildi
                </div>
              </div>
            </div>
            
            <p className="text-gray-600 text-sm bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
              4 farklı AI modeline rastgele atanacak uzmanlık alanlarını seçin
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allBranches.map((branch: Branch) => (
                <div
                  key={branch.id}
                  className={`group relative p-5 rounded-xl border-2 cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
                    selectedBranches.includes(branch.id)
                      ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg'
                      : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                  }`}
                  onClick={() => onBranchSelection(branch.id)}
                >
                  {/* Selection indicator */}
                  <div className={`absolute top-3 right-3 w-6 h-6 rounded-full border-2 transition-all ${
                    selectedBranches.includes(branch.id)
                      ? 'bg-blue-500 border-blue-500'
                      : 'border-gray-300 group-hover:border-blue-400'
                  }`}>
                    {selectedBranches.includes(branch.id) && (
                      <svg className="w-4 h-4 text-white absolute top-0.5 left-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>

                  <div className="pr-8">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-gray-900 text-base group-hover:text-blue-700 transition-colors">
                        {branch.name}
                      </h3>
                      <div className="flex items-center space-x-2">
                        {customBranches.find(cb => cb.id === branch.id) && (
                          <>
                            <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                              Özel
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditBranch(branch);
                              }}
                              className="text-blue-500 hover:text-blue-700 text-sm p-1"
                              title="Düzenle"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm('Bu uzmanlık alanını silmek istediğinizden emin misiniz?')) {
                                  onDeleteBranch(branch.id);
                                }
                              }}
                              className="text-red-500 hover:text-red-700 text-sm p-1"
                              title="Sil"
                            >
                              🗑️
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {branch.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Start Button */}
          <div className="pt-4">
            <button
              onClick={onStartDebate}
              disabled={selectedBranches.length !== 4 || !topic.trim()}
              className={`w-full py-4 px-8 text-lg font-bold rounded-2xl transition-all duration-300 transform ${
                selectedBranches.length === 4 && topic.trim()
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <span className="text-xl">🚀</span>
                <span>Tartışmayı Başlat</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebateSetup;

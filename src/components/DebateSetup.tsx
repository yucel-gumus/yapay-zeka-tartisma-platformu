import React from 'react';
import { Branch } from '@/types/debate';
import { IdeaIcon, UsersIcon, PlusIcon, EditIcon, TrashIcon, RocketIcon, CheckIcon, SparklesIcon } from './ui/Icons';

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

const SUGGESTED_TOPICS = [
  "Yapay zeka etiği ve insan iradesi",
  "Kuantum bilgisayarların geleceği",
  "Uzay madenciliği ve küresel ekonomi",
  "Genetik mühendisliği ve insan ömrü"
];

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
    <div className="max-w-7xl mx-auto">
      {/* Main Dual-Panel Command Center Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* LEFT PANEL: Command Deck & Control Console (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#FFEBD3] border-3 border-[#FFB6A6] rounded-3xl p-6 shadow-xl relative overflow-hidden">

            {/* Topic Console Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-[#2C1A18]">
                <IdeaIcon size={22} />
                <h3 className="text-xl font-extrabold tracking-tight">Tartışma Konusu</h3>
              </div>

              <div className="relative">
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Tartışılmasını istediğiniz konuyu veya soruyu girin..."
                  rows={4}
                  className="w-full px-5 py-4 text-base border-2 border-[#FFB6A6] rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#9BCEC1]/50 bg-[#FFEBD3] text-[#2C1A18] placeholder-[#5E3D38]/60 font-semibold resize-none shadow-xs transition-all leading-relaxed"
                />
                <div className="absolute right-4 bottom-4">
                  <div className={`w-3.5 h-3.5 rounded-full ${topic.trim() ? 'bg-[#9BCEC1]' : 'bg-[#FFB6A6]/60'} transition-colors`} />
                </div>
              </div>

              {/* Quick Topic Suggestion Chips */}
              <div>
                <div className="flex items-center space-x-1 mb-2 text-xs font-extrabold text-[#5E3D38]">
                  <SparklesIcon size={14} />
                  <span>Önerilen Konular:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_TOPICS.map((suggested, idx) => (
                    <button
                      key={idx}
                      onClick={() => setTopic(suggested)}
                      className="text-xs bg-[#FFB6A6]/30 hover:bg-[#FFB6A6]/60 text-[#2C1A18] font-bold px-3 py-1.5 rounded-xl border border-[#FFB6A6] transition-all cursor-pointer text-left"
                    >
                      {suggested}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Selection Summary Counter */}
            <div className="mt-6 pt-6 border-t-2 border-[#FFB6A6]/40">
              <div className="flex items-center justify-between bg-[#FFB6A6]/30 p-4 rounded-2xl border-2 border-[#FFB6A6]">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[#9BCEC1] text-[#2C1A18] rounded-2xl flex items-center justify-center font-extrabold text-lg shadow-xs">
                    {selectedBranches.length}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-[#2C1A18] text-sm">Seçilen Uzmanlar</h4>
                    <p className="text-xs text-[#5E3D38] font-semibold">Hedef: Tam 4 Uzman</p>
                  </div>
                </div>
                <span className={`text-xs font-extrabold px-3 py-1 rounded-xl ${selectedBranches.length === 4 ? 'bg-[#9BCEC1] text-[#2C1A18]' : 'bg-[#FFB6A6] text-[#2C1A18]'
                  }`}>
                  {selectedBranches.length === 4 ? 'Hazır ✓' : 'Eksik'}
                </span>
              </div>
            </div>

            {/* Huge Launch Button */}
            <div className="mt-6">
              <button
                onClick={onStartDebate}
                disabled={selectedBranches.length !== 4 || !topic.trim()}
                className={`w-full py-5 px-8 text-xl font-extrabold rounded-2xl transition-all duration-300 transform shadow-lg ${selectedBranches.length === 4 && topic.trim()
                  ? 'bg-[#9BCEC1] hover:bg-[#85b9ac] text-[#2C1A18] hover:scale-[1.02] active:scale-[0.98] cursor-pointer'
                  : 'bg-[#FFB6A6]/30 text-[#5E3D38]/50 cursor-not-allowed border-2 border-[#FFB6A6]/40'
                  }`}
              >
                <div className="flex items-center justify-center space-x-3">
                  <RocketIcon size={28} />
                  <span>Tartışma Arenasını Başlat</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Expert Bento Grid Deck (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#FFEBD3] border-3 border-[#FFB6A6] rounded-3xl p-6 shadow-xl">

            {/* Section Title & Add Custom Button */}
            <div className="flex items-center justify-between flex-wrap gap-4 mb-6 pb-4 border-b-2 border-[#FFB6A6]/40">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#9BCEC1] text-[#2C1A18] rounded-2xl flex items-center justify-center shadow-xs">
                  <UsersIcon size={22} />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-[#2C1A18] tracking-tight">
                    Uzmanlık Kadrosu
                  </h3>
                  <p className="text-xs text-[#5E3D38] font-bold">
                    Tartışacak 4 uzmana tıklayarak kadroyu oluşturun
                  </p>
                </div>
              </div>

              <button
                onClick={onShowAddBranchModal}
                className="px-4 py-2.5 bg-[#9BCEC1] hover:bg-[#85b9ac] text-[#2C1A18] font-extrabold text-sm rounded-2xl transition-all shadow-xs flex items-center space-x-2 cursor-pointer"
              >
                <PlusIcon size={18} />
                <span>Özel Uzmanlık Ekle</span>
              </button>
            </div>

            {/* Bento Grid layout for Expert cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allBranches.map((branch: Branch) => {
                const selectedIndex = selectedBranches.indexOf(branch.id);
                const isSelected = selectedIndex !== -1;

                return (
                  <div
                    key={branch.id}
                    onClick={() => onBranchSelection(branch.id)}
                    className={`relative p-5 rounded-3xl border-3 cursor-pointer transition-all duration-200 flex flex-col justify-between ${isSelected
                      ? 'border-[#9BCEC1] bg-[#FFB6A6]/35 shadow-md scale-[1.02]'
                      : 'border-[#FFB6A6]/60 bg-[#FFEBD3] hover:border-[#FFB6A6] hover:shadow-xs'
                      }`}
                  >
                    {/* Header of card with selection order badge */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center space-x-2">
                        <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-extrabold text-xs border-2 ${isSelected
                          ? 'bg-[#9BCEC1] border-[#9BCEC1] text-[#2C1A18]'
                          : 'bg-[#FFB6A6]/30 border-[#FFB6A6] text-[#5E3D38]'
                          }`}>
                          {isSelected ? `#${selectedIndex + 1}` : <CheckIcon size={14} />}
                        </div>
                        <h4 className="font-extrabold text-[#2C1A18] text-base leading-snug">
                          {branch.name}
                        </h4>
                      </div>

                      {/* Custom branch edit/delete controls */}
                      {customBranches.find(cb => cb.id === branch.id) && (
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditBranch(branch);
                            }}
                            className="text-[#2C1A18] hover:bg-[#FFB6A6]/50 p-1.5 rounded-xl transition-colors cursor-pointer"
                            title="Düzenle"
                          >
                            <EditIcon size={15} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('Bu uzmanlık alanını silmek istediğinizden emin misiniz?')) {
                                onDeleteBranch(branch.id);
                              }
                            }}
                            className="text-[#2C1A18] hover:bg-[#FFB6A6]/50 p-1.5 rounded-xl transition-colors cursor-pointer"
                            title="Sil"
                          >
                            <TrashIcon size={15} />
                          </button>
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-[#5E3D38] leading-relaxed font-semibold mb-3">
                      {branch.description}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-[#FFB6A6]/30 text-[11px] font-bold">
                      <span className={isSelected ? 'text-[#2C1A18]' : 'text-[#5E3D38]/70'}>
                        {isSelected ? '✓ Kadroda Seçili' : '+ Kadroya Ekle'}
                      </span>
                      {customBranches.find(cb => cb.id === branch.id) && (
                        <span className="bg-[#9BCEC1] text-[#2C1A18] px-2 py-0.5 rounded-lg">
                          Özel Oluşturuldu
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Add Custom Branch Tile inside Bento Grid */}
              <div
                onClick={onShowAddBranchModal}
                className="p-5 rounded-3xl border-3 border-dashed border-[#FFB6A6] bg-[#FFB6A6]/10 hover:bg-[#FFB6A6]/25 transition-all cursor-pointer flex flex-col items-center justify-center text-center space-y-2 min-h-[140px]"
              >
                <div className="w-10 h-10 bg-[#9BCEC1] text-[#2C1A18] rounded-2xl flex items-center justify-center shadow-xs">
                  <PlusIcon size={22} />
                </div>
                <h4 className="font-extrabold text-[#2C1A18] text-sm">
                  Yeni Uzmanlık Alanı Ekle
                </h4>
                <p className="text-xs text-[#5E3D38] font-semibold">
                  Kendi tanımladığınız özel uzmanı tartışmaya katın
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default DebateSetup;

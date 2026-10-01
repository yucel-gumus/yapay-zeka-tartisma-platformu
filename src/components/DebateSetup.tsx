import React from "react";
import { DEBATE_ROLES } from "@/lib/debateProtocol";
import { DEBATE_LENGTHS, type DebateRounds } from "@/lib/debateSchedule";
import { Branch, DebateRole, DebateFrame } from "@/types/debate";
import { parseDebateFrame } from "@/lib/debateFrame";
import DebateFrameEditor from "./DebateFrameEditor";
import {
  IdeaIcon,
  UsersIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  RocketIcon,
  CheckIcon,
  SparklesIcon,
} from "./ui/Icons";

interface DebateSetupProps {
  topic: string;
  debateFrame: DebateFrame | null;
  isClarifying: boolean;
  onClarifyTopic: () => void;
  onFrameChange: (frame: DebateFrame) => void;
  onManualFrame: () => void;
  roundsPerExpert: DebateRounds;
  onRoundsChange: (rounds: DebateRounds) => void;
  sources: string;
  setSources: (value: string) => void;
  branchRoles: Record<string, DebateRole>;
  onRoleChange: (id: string, role: DebateRole) => void;
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
  "Genetik mühendisliği ve insan ömrü",
];

const DebateSetup: React.FC<DebateSetupProps> = ({
  topic,
  debateFrame,
  isClarifying,
  onClarifyTopic,
  onFrameChange,
  onManualFrame,
  roundsPerExpert,
  onRoundsChange,
  sources,
  setSources,
  branchRoles,
  onRoleChange,
  setTopic,
  selectedBranches,
  allBranches,
  customBranches,
  onBranchSelection,
  onStartDebate,
  onShowAddBranchModal,
  onEditBranch,
  onDeleteBranch,
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
                <h3 className="text-xl font-extrabold tracking-tight">
                  Tartışma Konusu
                </h3>
              </div>

              <div className="relative">
                <textarea
                  id="debate-topic"
                  aria-label="Tartışma konusu"
                  maxLength={2000}
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Tartışılmasını istediğiniz konuyu veya soruyu girin..."
                  rows={4}
                  className="w-full px-5 py-4 text-base border-2 border-[#FFB6A6] rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#9BCEC1]/50 bg-[#FFEBD3] text-[#2C1A18] placeholder-[#5E3D38]/60 font-semibold resize-none shadow-xs transition-all leading-relaxed"
                />
                <div className="absolute right-4 bottom-4">
                  <div
                    className={`w-3.5 h-3.5 rounded-full ${topic.trim() ? "bg-[#9BCEC1]" : "bg-[#FFB6A6]/60"} transition-colors`}
                  />
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

            <section className="mt-5 rounded-2xl border-2 border-[#9BCEC1] bg-[#9BCEC1]/15 p-4">
              <h3 className="font-semibold">Tezi netleştir</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#5E3D38]">
                AI, konunu ortak bir tartışma çerçevesine dönüştürür. Öneriyi düzenleyip başlangıç düğmesiyle onaylayabilirsin.
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                <button type="button" onClick={onClarifyTopic} disabled={!topic.trim() || isClarifying}
                  className="rounded-xl bg-[#9BCEC1] px-4 py-2 text-sm font-semibold disabled:opacity-50">
                  {isClarifying ? "Çerçeve hazırlanıyor…" : debateFrame ? "AI önerisini yenile" : "AI ile çerçeve oluştur"}
                </button>
                {!debateFrame && (
                  <button type="button" onClick={onManualFrame} disabled={!topic.trim() || isClarifying}
                    className="text-sm font-semibold underline disabled:opacity-50">Kendim netleştireceğim</button>
                )}
              </div>
              {isClarifying && <p role="status" className="mt-2 text-sm">Tez, kavramlar ve alt iddialar hazırlanıyor. Tartışma henüz başlamadı.</p>}
              {debateFrame && <DebateFrameEditor frame={debateFrame} onChange={onFrameChange} disabled={isClarifying} />}
              {debateFrame && !parseDebateFrame(debateFrame) && <p className="mt-3 text-sm text-[#5E3D38]">Başlatmak için tez, alt iddialar, kapsam ve eklediğin kavramların anlamları boş olmamalı.</p>}
            </section>

            <div className="mt-5 space-y-2">
              <label htmlFor="debate-sources" className="block font-semibold">
                Kaynaklar ve kanıt notları (isteğe bağlı)
              </label>
              <textarea
                id="debate-sources"
                value={sources}
                onChange={(e) => setSources(e.target.value)}
                maxLength={4000}
                rows={3}
                placeholder="İlgili kaynak bağlantılarını ve destekledikleri iddiaları yazın…"
                className="w-full rounded-xl border border-[#FFB6A6] bg-white/40 p-3 text-sm"
              />
              <p className="text-xs text-[#5E3D38]">
                Notlar tartışmaya eklenir. Bağlantıların içeriği otomatik
                okunmaz veya doğrulanmaz.
              </p>
            </div>
            <fieldset className="mt-6 space-y-3">
              <legend className="font-semibold">Tartışma uzunluğu</legend>
              {DEBATE_LENGTHS.map((option) => (
                <label key={option.rounds} className="flex items-start gap-3 rounded-xl border border-[#9BCEC1] bg-white/30 p-3 cursor-pointer">
                  <input type="radio" name="debate-length" value={option.rounds}
                    checked={roundsPerExpert === option.rounds}
                    onChange={() => onRoundsChange(option.rounds)} className="mt-1" />
                  <span className="text-sm">
                    <strong>{option.label} · Kişi başına {option.rounds} konuşma</strong>
                    <span className="mt-1 block text-[#5E3D38]">{option.description}</span>
                  </span>
                </label>
              ))}
              <p className="text-sm text-[#5E3D38]">
                Bir tam turda her uzman bir kez konuşur.
                {selectedBranches.length >= 2 && ` Seçiminiz: ${roundsPerExpert} tam tur, toplam ${roundsPerExpert * selectedBranches.length} konuşma.`}
              </p>
            </fieldset>
            {/* Selection Summary Counter */}
            <div className="mt-6 pt-6 border-t-2 border-[#FFB6A6]/40">
              <div className="flex items-center justify-between bg-[#FFB6A6]/30 p-4 rounded-2xl border-2 border-[#FFB6A6]">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[#9BCEC1] text-[#2C1A18] rounded-2xl flex items-center justify-center font-extrabold text-lg shadow-xs">
                    {selectedBranches.length}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-[#2C1A18] text-sm">
                      Seçilen Uzmanlar
                    </h4>
                    <p className="text-xs text-[#5E3D38] font-semibold">
                      Hedef: 2, 3 veya 4 Uzman
                    </p>
                  </div>
                </div>
                <span
                  className={`text-xs font-extrabold px-3 py-1 rounded-xl ${
                    selectedBranches.length >= 2 && selectedBranches.length <= 4
                      ? "bg-[#9BCEC1] text-[#2C1A18]"
                      : "bg-[#FFB6A6] text-[#2C1A18]"
                  }`}
                >
                  {selectedBranches.length >= 2 && selectedBranches.length <= 4
                    ? "Hazır ✓"
                    : `${selectedBranches.length}/4 Uzman`}
                </span>
              </div>
            </div>

            {/* Huge Launch Button */}
            <div className="mt-6">
              <button
                onClick={onStartDebate}
                disabled={
                  selectedBranches.length < 2 ||
                  selectedBranches.length > 4 ||
                  !topic.trim() || isClarifying || !parseDebateFrame(debateFrame)
                }
                className={`w-full py-5 px-8 text-xl font-extrabold rounded-2xl transition-all duration-300 transform shadow-lg ${
                  selectedBranches.length >= 2 &&
                  selectedBranches.length <= 4 &&
                  topic.trim() && !isClarifying && parseDebateFrame(debateFrame)
                    ? "bg-[#9BCEC1] hover:bg-[#85b9ac] text-[#2C1A18] hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                    : "bg-[#FFB6A6]/30 text-[#5E3D38]/50 cursor-not-allowed border-2 border-[#FFB6A6]/40"
                }`}
              >
                <div className="flex items-center justify-center space-x-3">
                  <RocketIcon size={28} />
                  <span>Çerçeveyi onayla ve başlat</span>
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
                    Tartışacak 2, 3 veya 4 uzmana tıklayarak kadroyu oluşturun
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
                    role="button"
                    tabIndex={0}
                    aria-pressed={isSelected}
                    aria-label={`${branch.name} seçimi`}
                    onKeyDown={(e) => {
                      if (
                        e.target === e.currentTarget &&
                        (e.key === "Enter" || e.key === " ")
                      ) {
                        e.preventDefault();
                        onBranchSelection(branch.id);
                      }
                    }}
                    onClick={() => onBranchSelection(branch.id)}
                    className={`relative p-5 rounded-3xl border-3 cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                      isSelected
                        ? "border-[#9BCEC1] bg-[#FFB6A6]/35 shadow-md scale-[1.02]"
                        : "border-[#FFB6A6]/60 bg-[#FFEBD3] hover:border-[#FFB6A6] hover:shadow-xs"
                    }`}
                  >
                    {isSelected && (
                      <div
                        className="mb-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <label
                          htmlFor={`role-${branch.id}`}
                          className="mb-1 block text-xs font-semibold"
                        >
                          Tartışmadaki görevi
                        </label>
                        <select
                          id={`role-${branch.id}`}
                          value={branchRoles[branch.id] || "assumptions"}
                          onChange={(e) =>
                            onRoleChange(
                              branch.id,
                              e.target.value as DebateRole,
                            )
                          }
                          className="w-full rounded-lg border border-[#9BCEC1] bg-white/60 p-2 text-sm"
                        >
                          {Object.entries(DEBATE_ROLES).map(([id, role]) => (
                            <option key={id} value={id}>
                              {role.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    {/* Header of card with selection order badge */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center font-extrabold text-xs border-2 ${
                            isSelected
                              ? "bg-[#9BCEC1] border-[#9BCEC1] text-[#2C1A18]"
                              : "bg-[#FFB6A6]/30 border-[#FFB6A6] text-[#5E3D38]"
                          }`}
                        >
                          {isSelected ? (
                            `#${selectedIndex + 1}`
                          ) : (
                            <CheckIcon size={14} />
                          )}
                        </div>
                        <h4 className="font-extrabold text-[#2C1A18] text-base leading-snug">
                          {branch.name}
                        </h4>
                      </div>

                      {/* Custom branch edit/delete controls */}
                      {customBranches.find((cb) => cb.id === branch.id) && (
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
                              if (
                                confirm(
                                  "Bu uzmanlık alanını silmek istediğinizden emin misiniz?",
                                )
                              ) {
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
                      <span
                        className={
                          isSelected ? "text-[#2C1A18]" : "text-[#5E3D38]/70"
                        }
                      >
                        {isSelected ? "✓ Kadroda Seçili" : "+ Kadroya Ekle"}
                      </span>
                      {customBranches.find((cb) => cb.id === branch.id) && (
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
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onShowAddBranchModal();
                  }
                }}
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

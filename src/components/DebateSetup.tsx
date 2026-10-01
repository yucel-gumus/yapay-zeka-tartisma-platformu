import React from "react";
import { DEBATE_ROLES } from "@/lib/debateProtocol";
import { DEBATE_LENGTHS, type DebateRounds } from "@/lib/debateSchedule";
import { Branch, DebateRole, DebateFrame } from "@/types/debate";
import { parseDebateFrame } from "@/lib/debateFrame";
import DebateFrameEditor from "./DebateFrameEditor";
import { PlusIcon, EditIcon, TrashIcon, RocketIcon } from "./ui/Icons";

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

const DebateSetup: React.FC<DebateSetupProps> = (props) => {
  const {
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
  } = props;
  const validExperts =
    selectedBranches.length >= 2 && selectedBranches.length <= 4;
  const validFrame = !!parseDebateFrame(debateFrame);
  const ready = validExperts && !!topic.trim() && validFrame && !isClarifying;
  return (
    <div className="setup-layout">
      <div className="setup-intro">
        <span className="eyebrow">FİKİRLERE YENİ BİR PENCERE</span>
        <h1>
          Bir konu.
          <br />
          Birden fazla bakış açısı.
        </h1>
        <p>
          Tezini netleştir, uzmanlarını seç ve argümanların nasıl şekillendiğini
          izle.
        </p>
        <div className="workflow" aria-label="Tartışma hazırlık adımları">
          {[
            ["01", "Konuyu belirle"],
            ["02", "Tezi netleştir"],
            ["03", "Uzmanları seç"],
          ].map(([n, label]) => (
            <span key={n}>
              <b>{n}</b>
              {label}
            </span>
          ))}
        </div>
      </div>
      <div className="setup-main space-y-5">
        <section className="surface section-pad">
          <div className="section-heading">
            <span className="step-number">01</span>
            <div>
              <h3>Ne üzerine tartışalım?</h3>
              <p>Bir soru veya değerlendirilmesini istediğin bir iddia yaz.</p>
            </div>
          </div>
          <label htmlFor="debate-topic" className="sr-only">
            Tartışma konusu
          </label>
          <textarea
            id="debate-topic"
            aria-label="Tartışma konusu"
            maxLength={2000}
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Örneğin: Kuantum bilgisayarlar günlük hayatımızı değiştirecek mi?"
            rows={3}
            className="field topic-field"
          />
          <div className="flex justify-between gap-3 mt-2 mb-4">
            <span className="helper">Sorunu olabildiğince açık ifade et.</span>
            <span className="helper tabular-nums">{topic.length}/2000</span>
          </div>
          <p className="eyebrow mb-2">İLHAM AL</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_TOPICS.map((suggested) => (
              <button
                key={suggested}
                onClick={() => setTopic(suggested)}
                className="topic-chip"
              >
                {suggested}
              </button>
            ))}
          </div>
        </section>
        <section className="surface section-pad">
          <div className="section-heading">
            <span className="step-number mint">02</span>
            <div>
              <h3>Tezi netleştir</h3>
              <p>Uzmanlar ve hakem aynı çerçeveyi değerlendirsin.</p>
            </div>
            {validFrame && <span className="pill ml-auto">Düzenlenebilir</span>}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onClarifyTopic}
              disabled={!topic.trim() || isClarifying}
              className="btn btn-mint"
            >
              {isClarifying
                ? "Çerçeve hazırlanıyor…"
                : debateFrame
                  ? "AI önerisini yenile"
                  : "AI ile çerçeve oluştur"}
            </button>
            {!debateFrame && (
              <button
                type="button"
                onClick={onManualFrame}
                disabled={!topic.trim() || isClarifying}
                className="btn btn-quiet"
              >
                Kendim netleştireceğim
              </button>
            )}
          </div>
          {isClarifying && (
            <p role="status" className="helper mt-3">
              Tez, kavramlar ve alt iddialar hazırlanıyor…
            </p>
          )}
          {debateFrame && (
            <DebateFrameEditor
              frame={debateFrame}
              onChange={onFrameChange}
              disabled={isClarifying}
            />
          )}
          {debateFrame && !validFrame && (
            <p className="helper mt-3" role="status">
              Başlatmak için tez, alt iddialar, kapsam ve kavramların anlamları
              boş olmamalı.
            </p>
          )}
        </section>
        <section className="surface section-pad">
          <fieldset>
            <legend className="section-title mb-3">
              Tartışmanın derinliği
            </legend>
            <div className="length-options">
              {DEBATE_LENGTHS.map((option) => (
                <label
                  key={option.rounds}
                  className={`length-option ${roundsPerExpert === option.rounds ? "selected" : ""}`}
                >
                  <input
                    type="radio"
                    name="debate-length"
                    value={option.rounds}
                    checked={roundsPerExpert === option.rounds}
                    onChange={() => onRoundsChange(option.rounds)}
                  />
                  <strong>{option.label}</strong>
                  <span>{option.rounds} tam tur</span>
                  <small>{option.description}</small>
                </label>
              ))}
            </div>
          </fieldset>
          <p className="helper mt-3">
            Her turda her uzman bir kez konuşur.
            {validExperts &&
              ` Toplam ${roundsPerExpert * selectedBranches.length} konuşma.`}
          </p>
          <details
            className="disclosure mt-5"
            open={sources ? true : undefined}
          >
            <summary>
              Kaynaklar ve kanıt notları <span>İsteğe bağlı</span>
            </summary>
            <div className="pt-3">
              <label htmlFor="debate-sources" className="sr-only">
                Kaynaklar ve kanıt notları
              </label>
              <textarea
                id="debate-sources"
                value={sources}
                onChange={(e) => setSources(e.target.value)}
                maxLength={4000}
                rows={3}
                placeholder="Kaynak bağlantılarını ve destekledikleri iddiaları yaz…"
                className="field"
              />
              <p className="helper mt-2">
                Notlar tartışmaya eklenir. Bağlantılar otomatik okunmaz veya
                doğrulanmaz.
              </p>
            </div>
          </details>
        </section>
      </div>
      <aside className="setup-experts surface section-pad">
        <div className="section-heading">
          <span className="step-number">03</span>
          <div>
            <h3>Uzman kadrosu</h3>
            <p>Farklı bakış açıları için 2–4 uzman seç.</p>
          </div>
          <span className="pill ml-auto">{selectedBranches.length}/4</span>
        </div>
        <div className="expert-grid">
          {allBranches.map((branch) => {
            const index = selectedBranches.indexOf(branch.id);
            const selected = index !== -1;
            const custom = customBranches.some((b) => b.id === branch.id);
            return (
              <article
                key={branch.id}
                className={`expert-card ${selected ? "selected" : ""}`}
              >
                <button
                  type="button"
                  aria-pressed={selected}
                  aria-label={`${branch.name} seçimi`}
                  onClick={() => onBranchSelection(branch.id)}
                  className="expert-select"
                >
                  <span className="expert-card-top">
                    <span className="expert-avatar">
                      {branch.name.slice(0, 1)}
                    </span>
                    <span className="selection-mark">
                      {selected ? index + 1 : "+"}
                    </span>
                  </span>
                  <strong>{branch.name}</strong>
                  <span className="expert-description">
                    {branch.description}
                  </span>
                  <span className="expert-select-label">
                    {selected ? `${index + 1}. sırada seçili` : "Kadroya ekle"}
                  </span>
                </button>
                {selected && (
                  <div className="expert-role">
                    <label htmlFor={`role-${branch.id}`}>
                      Tartışmadaki görevi
                    </label>
                    <select
                      id={`role-${branch.id}`}
                      value={branchRoles[branch.id] || "assumptions"}
                      onChange={(e) =>
                        onRoleChange(branch.id, e.target.value as DebateRole)
                      }
                      className="field"
                    >
                      {Object.entries(DEBATE_ROLES).map(([id, role]) => (
                        <option key={id} value={id}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {custom && (
                  <div className="flex items-center justify-between px-4 pb-3">
                    <span className="helper">Özel uzman</span>
                    <div className="flex">
                      <button
                        onClick={() => onEditBranch(branch)}
                        className="icon-btn"
                        aria-label={`${branch.name} düzenle`}
                      >
                        <EditIcon size={16} />
                      </button>
                      <button
                        onClick={() => {
                          if (
                            confirm(
                              "Bu uzmanlık alanını silmek istediğinizden emin misiniz?",
                            )
                          )
                            onDeleteBranch(branch.id);
                        }}
                        className="icon-btn"
                        aria-label={`${branch.name} sil`}
                      >
                        <TrashIcon size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
        <button
          onClick={onShowAddBranchModal}
          className="btn btn-outline w-full mt-4"
        >
          <PlusIcon size={18} />
          Özel uzmanlık ekle
        </button>
        <p className="helper mt-3">
          Seçim sırası, konuşma sırasını belirler. Her uzmanın görevini
          değiştirebilirsin.
        </p>
      </aside>
      <div className="launch-bar surface">
        <div>
          <strong>{ready ? "Tartışman hazır" : "Başlamadan önce"}</strong>
          <p>
            {!topic.trim()
              ? "Bir tartışma konusu yaz."
              : !validFrame
                ? "Tez çerçevesini oluştur ve gözden geçir."
                : !validExperts
                  ? "Kadroya en az 2 uzman ekle."
                  : `${selectedBranches.length} uzman · ${roundsPerExpert} tam tur · ${selectedBranches.length * roundsPerExpert} konuşma`}
          </p>
        </div>
        <button
          onClick={onStartDebate}
          disabled={!ready}
          className="btn btn-dark"
        >
          <RocketIcon size={19} />
          Çerçeveyi onayla ve başlat
        </button>
      </div>
    </div>
  );
};
export default DebateSetup;

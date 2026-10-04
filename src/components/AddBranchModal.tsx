import React from "react";
import { Modal } from "./ui/Modal";
import { PlusIcon, SparklesIcon, IdeaIcon } from "./ui/Icons";

interface AddBranchModalProps {
  showModal: boolean;
  error?: string;
  newBranchName: string;
  setNewBranchName: (name: string) => void;
  newBranchDescription: string;
  setNewBranchDescription: (description: string) => void;
  isGeneratingDescription: boolean;
  editingBranch: { id: string; name: string; description: string } | null;
  onGenerateDescription: () => Promise<void>;
  onAddBranch: () => void;
  onClose: () => void;
}

const AddBranchModal: React.FC<AddBranchModalProps> = ({
  showModal,
  error,
  newBranchName,
  setNewBranchName,
  newBranchDescription,
  setNewBranchDescription,
  isGeneratingDescription,
  editingBranch,
  onGenerateDescription,
  onAddBranch,
  onClose,
}) => {
  return (
    <Modal
      isOpen={showModal}
      onClose={onClose}
      title={
        editingBranch ? "Uzmanlık Alanını Düzenle" : "Yeni Uzmanlık Alanı Ekle"
      }
      icon={<PlusIcon size={22} />}
      maxWidthClass="max-w-lg"
    >
      {error && (
        <p role="alert" className="mb-4 text-sm text-[#5E3D38]">
          {error}
        </p>
      )}
      <div className="space-y-6">
        {/* Expertise Name Section */}
        <div className="relative">
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-8 h-8 bg-[#9BCEC1] rounded-xl flex items-center justify-center text-[#2C1A18] font-semibold text-sm">
              1
            </div>
            <label
              htmlFor="custom-expert-name"
              className="text-sm font-semibold text-[#2C1A18]"
            >
              Uzmanlık Alanı Adı
            </label>
          </div>
          <input
            maxLength={150}
            id="custom-expert-name"
            type="text"
            value={newBranchName}
            onChange={(e) => setNewBranchName(e.target.value)}
            placeholder="Örn: Biyomedikal Mühendisi, Yapay Zeka Uzmanı"
            className="field"
          />
        </div>

        {/* Description Section */}
        <div className="relative">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-[#FFB6A6] rounded-xl flex items-center justify-center text-[#2C1A18] font-semibold text-sm">
                2
              </div>
              <label
                htmlFor="custom-expert-description"
                className="text-sm font-semibold text-[#2C1A18]"
              >
                Uzmanlık Açıklaması
              </label>
            </div>
            <button
              onClick={onGenerateDescription}
              disabled={!newBranchName.trim() || isGeneratingDescription}
              className="btn btn-mint"
            >
              {isGeneratingDescription ? (
                <>
                  <div className="animate-spin w-4 h-4 border border-[#2C1A18] border-t-transparent rounded-full"></div>
                  <span>Oluşturuluyor...</span>
                </>
              ) : (
                <>
                  <SparklesIcon size={18} />
                  <span>AI ile Oluştur</span>
                </>
              )}
            </button>
          </div>
          <textarea
            id="custom-expert-description"
            maxLength={4000}
            value={newBranchDescription}
            onChange={(e) => setNewBranchDescription(e.target.value)}
            placeholder="Bu uzmanlık alanının özelliklerini ve bakış açısını detaylı olarak açıklayın..."
            rows={5}
            className="field"
          />
          <div className="flex items-center justify-between mt-2 text-xs font-bold text-[#5E3D38]">
            <span className="flex items-center space-x-1">
              <IdeaIcon size={14} className="text-[#2C1A18]" />
              <span>Detaylı açıklama daha iyi tartışmalar sağlar</span>
            </span>
            <span
              className={
                newBranchDescription.length > 100
                  ? "text-[#2C1A18]"
                  : "text-[#5E3D38]"
              }
            >
              {newBranchDescription.length} karakter
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button onClick={onClose} className="btn btn-outline flex-1">
          İptal
        </button>
        <button
          onClick={onAddBranch}
          disabled={!newBranchName.trim() || !newBranchDescription.trim()}
          className="btn btn-mint flex-1"
        >
          {editingBranch ? "Güncelle" : "Ekle"}
        </button>
      </div>
    </Modal>
  );
};

export default AddBranchModal;

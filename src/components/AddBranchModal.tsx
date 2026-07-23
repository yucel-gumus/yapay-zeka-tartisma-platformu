import React from 'react';
import { Modal } from './ui/Modal';
import { PlusIcon, SparklesIcon } from './ui/Icons';

interface AddBranchModalProps {
  showModal: boolean;
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
      title={editingBranch ? 'Uzmanlık Alanını Düzenle' : 'Yeni Uzmanlık Alanı Ekle'}
      icon={<PlusIcon size={22} />}
      maxWidthClass="max-w-lg"
    >
      <div className="space-y-6">
        {/* Expertise Name Section */}
        <div className="relative">
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-8 h-8 bg-[#9BCEC1] rounded-xl flex items-center justify-center text-[#2C1A18] font-extrabold text-sm">
              1
            </div>
            <label className="text-lg font-extrabold text-[#2C1A18]">
              Uzmanlık Alanı Adı
            </label>
          </div>
          <input
            type="text"
            value={newBranchName}
            onChange={(e) => setNewBranchName(e.target.value)}
            placeholder="Örn: Biyomedikal Mühendisi, Yapay Zeka Uzmanı"
            className="w-full px-5 py-4 bg-[#FFEBD3] border-2 border-[#FFB6A6] rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#9BCEC1]/50 text-[#2C1A18] placeholder-[#5E3D38]/60 font-semibold transition-all"
          />
        </div>

        {/* Description Section */}
        <div className="relative">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-[#FFB6A6] rounded-xl flex items-center justify-center text-[#2C1A18] font-extrabold text-sm">
                2
              </div>
              <label className="text-lg font-extrabold text-[#2C1A18]">
                Uzmanlık Açıklaması
              </label>
            </div>
            <button
              onClick={onGenerateDescription}
              disabled={!newBranchName.trim() || isGeneratingDescription}
              className="px-4 py-2 bg-[#9BCEC1] hover:bg-[#85b9ac] text-[#2C1A18] font-extrabold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-xs cursor-pointer"
            >
              {isGeneratingDescription ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-[#2C1A18] border-t-transparent rounded-full"></div>
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
            value={newBranchDescription}
            onChange={(e) => setNewBranchDescription(e.target.value)}
            placeholder="Bu uzmanlık alanının özelliklerini ve bakış açısını detaylı olarak açıklayın..."
            rows={5}
            className="w-full px-5 py-4 bg-[#FFEBD3] border-2 border-[#FFB6A6] rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#9BCEC1]/50 text-[#2C1A18] placeholder-[#5E3D38]/60 font-semibold resize-none transition-all leading-relaxed"
          />
          <div className="flex items-center justify-between mt-2 text-xs font-bold text-[#5E3D38]">
            <span className="flex items-center space-x-1">
              <span>💡</span>
              <span>Detaylı açıklama daha iyi tartışmalar sağlar</span>
            </span>
            <span className={newBranchDescription.length > 100 ? 'text-[#2C1A18]' : 'text-[#5E3D38]'}>
              {newBranchDescription.length} karakter
            </span>
          </div>
        </div>
      </div>

      <div className="flex space-x-3 mt-6">
        <button
          onClick={onClose}
          className="flex-1 py-3.5 px-4 border-2 border-[#FFB6A6] bg-[#FFB6A6]/30 text-[#2C1A18] font-extrabold rounded-2xl hover:bg-[#FFB6A6]/50 transition-colors cursor-pointer"
        >
          İptal
        </button>
        <button
          onClick={onAddBranch}
          disabled={!newBranchName.trim() || !newBranchDescription.trim()}
          className="flex-1 py-3.5 px-4 bg-[#9BCEC1] hover:bg-[#85b9ac] text-[#2C1A18] font-extrabold rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xs cursor-pointer"
        >
          {editingBranch ? 'Güncelle' : 'Ekle'}
        </button>
      </div>
    </Modal>
  );
};

export default AddBranchModal;

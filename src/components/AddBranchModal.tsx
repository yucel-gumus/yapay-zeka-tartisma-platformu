import React from 'react';

interface AddBranchModalProps {
  showModal: boolean;
  newBranchName: string;
  setNewBranchName: (name: string) => void;
  newBranchDescription: string;
  setNewBranchDescription: (description: string) => void;
  isGeneratingDescription: boolean;
  editingBranch: any;
  onGenerateDescription: () => void;
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
  onClose
}) => {
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-white/10 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-lg w-full mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">➕</span>
            <h3 className="text-xl font-bold text-gray-800">
              {editingBranch ? 'Uzmanlık Alanını Düzenle' : 'Yeni Uzmanlık Alanı Ekle'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          {/* Expertise Name Section */}
          <div className="relative">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">1</span>
              </div>
              <label className="text-lg font-semibold text-gray-800">
                Uzmanlık Alanı Adı
              </label>
            </div>
            <div className="relative group">
              <input
                type="text"
                value={newBranchName}
                onChange={(e) => setNewBranchName(e.target.value)}
                placeholder="Örn: Biyomedikal Mühendisi, Yapay Zeka Uzmanı"
                className="w-full px-5 py-4 bg-gradient-to-r from-gray-50 to-blue-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-400 focus:shadow-lg focus:shadow-blue-100 transition-all duration-300 text-gray-800 placeholder-gray-500 group-hover:shadow-md"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
          </div>

          {/* Description Section */}
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">2</span>
                </div>
                <label className="text-lg font-semibold text-gray-800">
                  Uzmanlık Açıklaması
                </label>
              </div>
              <button
                onClick={onGenerateDescription}
                disabled={!newBranchName.trim() || isGeneratingDescription}
                className="group relative px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
              >
                {isGeneratingDescription ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span className="font-medium">Oluşturuluyor...</span>
                  </>
                ) : (
                  <>
                    <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                      <span className="text-sm">🤖</span>
                    </div>
                    <span className="font-medium">AI ile Oluştur</span>
                  </>
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              </button>
            </div>
            <div className="relative group">
              <textarea
                value={newBranchDescription}
                onChange={(e) => setNewBranchDescription(e.target.value)}
                placeholder="Bu uzmanlık alanının özelliklerini, yaklaşımını ve perspektifini detaylı olarak açıklayın. Örneğin: hangi konularda uzman olduğu, nasıl yaklaştığı, hangi metodları kullandığı..."
                rows={5}
                className="w-full px-5 py-4 bg-gradient-to-br from-gray-50 to-purple-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-purple-400 focus:shadow-lg focus:shadow-purple-100 transition-all duration-300 text-gray-800 placeholder-gray-500 resize-none group-hover:shadow-md leading-relaxed"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
              <span className="flex items-center space-x-1">
                <span>💡</span>
                <span>Detaylı açıklama daha iyi tartışmalar sağlar</span>
              </span>
              <span className={`${newBranchDescription.length > 100 ? 'text-green-600' : 'text-orange-500'}`}>
                {newBranchDescription.length} karakter
              </span>
            </div>
          </div>
        </div>

        <div className="flex space-x-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
          >
            İptal
          </button>
          <button
            onClick={onAddBranch}
            disabled={!newBranchName.trim() || !newBranchDescription.trim()}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {editingBranch ? 'Güncelle' : 'Ekle'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddBranchModal;

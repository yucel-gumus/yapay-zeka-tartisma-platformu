import React from 'react';
import { Modal } from './ui/Modal';
import { JudgeIcon, SparklesIcon } from './ui/Icons';

interface JudgePopupProps {
  showPopup: boolean;
  isLoading: boolean;
  verdict: string;
  onClose: () => void;
}

// Clean raw markdown symbols (###, **, *, etc)
function cleanText(text: string): string {
  return text
    .replace(/^#+\s*/gm, '')       // Remove heading hashes
    .replace(/\*+/g, '')           // Remove markdown asterisks
    .replace(/^[-•]\s+/gm, '• ')   // Clean bullet points
    .replace(/NİHAİ HÜKÜM:\s*/gi, '') // Remove inline prefix
    .trim();
}

interface ParsedSection {
  title: string;
  type: 'evaluation' | 'winner' | 'conditions' | 'ruling' | 'generic';
  icon: string;
  content: string;
}

function parseVerdict(rawVerdict: string): ParsedSection[] {
  if (!rawVerdict) return [];

  // Remove preamble text if present
  const text = rawVerdict.replace(/Mahkeme salonu[\s\S]*?\*\*\*/, '').trim();

  const sections: ParsedSection[] = [];

  // Regex matches for the 4 structured sections
  const evaluationMatch = text.match(/(?:###|\*\*|)?\s*(?:📌|1\.)?\s*TARTIŞMA VE KRİTER DEĞERLENDİRMESİ:?\s*([\s\S]*?)(?=(?:###|\*\*|)?\s*(?:🏆|2\.|ÖNE ÇIKAN)|$)/i);
  const winnerMatch = text.match(/(?:###|\*\*|)?\s*(?:🏆|2\.)?\s*ÖNE ÇIKAN \/ KAZANAN TARAF:?\s*([\s\S]*?)(?=(?:###|\*\*|)?\s*(?:⚖️|3\.|KRİTİK KOŞULLAR)|$)/i);
  const conditionsMatch = text.match(/(?:###|\*\*|)?\s*(?:⚖️|3\.)?\s*KRİTİK KOŞULLAR VE NÜANSLAR:?\s*([\s\S]*?)(?=(?:###|\*\*|)?\s*(?:🏛️|4\.|NİHAİ HAKEM HÜKMÜ)|$)/i);
  const rulingMatch = text.match(/(?:###|\*\*|)?\s*(?:🏛️|4\.)?\s*NİHAİ HAKEM HÜKMÜ:?\s*([\s\S]*?)$/i);

  if (evaluationMatch && evaluationMatch[1].trim()) {
    sections.push({
      title: 'Tartışma ve Kriter Değerlendirmesi',
      type: 'evaluation',
      icon: '📊',
      content: cleanText(evaluationMatch[1]),
    });
  }

  if (winnerMatch && winnerMatch[1].trim()) {
    sections.push({
      title: 'Öne Çıkan / Kazanan Taraf',
      type: 'winner',
      icon: '🏆',
      content: cleanText(winnerMatch[1]),
    });
  }

  if (conditionsMatch && conditionsMatch[1].trim()) {
    sections.push({
      title: 'Kritik Koşullar ve Nüanslar',
      type: 'conditions',
      icon: '⚖️',
      content: cleanText(conditionsMatch[1]),
    });
  }

  if (rulingMatch && rulingMatch[1].trim()) {
    sections.push({
      title: 'Nihai Hakem Hükmü',
      type: 'ruling',
      icon: '🏛️',
      content: cleanText(rulingMatch[1]),
    });
  }

  // Fallback if standard headers weren't found
  if (sections.length === 0) {
    sections.push({
      title: 'Resmi Hakem Değerlendirmesi',
      type: 'generic',
      icon: '🏛️',
      content: cleanText(text),
    });
  }

  return sections;
}

const JudgePopup: React.FC<JudgePopupProps> = ({
  showPopup,
  isLoading,
  verdict,
  onClose,
}) => {
  const sections = parseVerdict(verdict);

  return (
    <Modal
      isOpen={showPopup}
      onClose={onClose}
      title="Hakem Değerlendirme & Hüküm Raporu"
      icon={<JudgeIcon size={24} />}
      maxWidthClass="max-w-3xl"
    >
      <div className="text-center">
        {isLoading ? (
          <div className="py-14 flex flex-col items-center justify-center space-y-4">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#9BCEC1] border-t-transparent"></div>
            <div>
              <p className="text-[#2C1A18] font-extrabold text-xl">Hakem Kararı Analiz Ediliyor...</p>
              <p className="text-sm text-[#5E3D38] font-semibold mt-1">
                Seçilen tüm uzmanların sunduğu argümanlar çapraz analiz edilerek sentezleniyor
              </p>
            </div>
          </div>
        ) : (
          <div className="text-left space-y-5">
            {/* Header Badge */}
            <div className="flex items-center justify-between bg-[#FFB6A6]/30 px-5 py-3 rounded-2xl border border-[#FFB6A6]">
              <div className="flex items-center space-x-2">
                <SparklesIcon size={18} className="text-[#2C1A18]" />
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#2C1A18]">
                  Yapay Zeka Hakem Heyeti Kararı
                </span>
              </div>
              <span className="text-[11px] font-extrabold bg-[#9BCEC1] text-[#2C1A18] px-3 py-0.5 rounded-full">
                Resmi Sentez
              </span>
            </div>

            {/* Scrollable Verdict Section Deck */}
            <div className="space-y-4 max-h-[62vh] overflow-y-auto pr-1 custom-scrollbar">
              {sections.map((sec, idx) => {
                if (sec.type === 'winner') {
                  return (
                    <div
                      key={idx}
                      className="bg-[#9BCEC1]/30 border-2 border-[#9BCEC1] rounded-2xl p-5 shadow-xs relative overflow-hidden"
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-xl">{sec.icon}</span>
                        <h4 className="font-extrabold text-[#2C1A18] text-base">
                          {sec.title}
                        </h4>
                      </div>
                      <p className="text-[#2C1A18] text-sm md:text-base font-bold leading-relaxed whitespace-pre-wrap">
                        {sec.content}
                      </p>
                    </div>
                  );
                }

                if (sec.type === 'ruling') {
                  return (
                    <div
                      key={idx}
                      className="bg-[#2C1A18] text-[#FFEBD3] rounded-2xl p-6 shadow-md border-2 border-[#FFB6A6] relative"
                    >
                      <div className="flex items-center space-x-2 mb-3">
                        <span className="text-2xl">{sec.icon}</span>
                        <h4 className="font-extrabold text-[#9BCEC1] text-lg uppercase tracking-wide">
                          {sec.title}
                        </h4>
                      </div>
                      <p className="text-[#FFEBD3] text-base md:text-lg font-extrabold leading-relaxed whitespace-pre-wrap">
                        {sec.content}
                      </p>
                    </div>
                  );
                }

                return (
                  <div
                    key={idx}
                    className="bg-[#FFB6A6]/20 border-2 border-[#FFB6A6]/60 rounded-2xl p-5 shadow-xs"
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-xl">{sec.icon}</span>
                      <h4 className="font-extrabold text-[#2C1A18] text-base">
                        {sec.title}
                      </h4>
                    </div>
                    <p className="text-[#2C1A18] text-sm md:text-base font-semibold leading-relaxed whitespace-pre-wrap">
                      {sec.content}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Dismiss Button */}
            <button
              onClick={onClose}
              className="w-full bg-[#9BCEC1] hover:bg-[#85b9ac] text-[#2C1A18] font-extrabold text-lg py-4 px-6 rounded-2xl transition-all shadow-md hover:shadow-lg active:scale-[0.99] cursor-pointer"
            >
              Kararı Anladım ve Kapat
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default JudgePopup;

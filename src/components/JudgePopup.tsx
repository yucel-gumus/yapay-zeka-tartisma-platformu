import React from "react";
import type { JudgeReport } from "@/types/debate";
import JudgeReportView from "./JudgeReportView";
import { Modal } from "./ui/Modal";
import { JudgeIcon } from "./ui/Icons";

interface JudgePopupProps {
  showPopup: boolean;
  isLoading: boolean;
  verdict: string;
  report?: JudgeReport | null;
  onClose: () => void;
}

// Clean raw markdown symbols (###, **, *, etc)
function cleanText(text: string): string {
  return text
    .replace(/^#+\s*/gm, "") // Remove heading hashes
    .replace(/\*+/g, "") // Remove markdown asterisks
    .replace(/^[-•]\s+/gm, "• ") // Clean bullet points
    .replace(/NİHAİ HÜKÜM:\s*/gi, "") // Remove inline prefix
    .trim();
}

interface ParsedSection {
  title: string;
  type: "evaluation" | "winner" | "conditions" | "ruling" | "generic";
  icon: string;
  content: string;
}

function parseVerdict(rawVerdict: string): ParsedSection[] {
  if (!rawVerdict) return [];

  // Remove preamble text if present
  const text = rawVerdict.replace(/Mahkeme salonu[\s\S]*?\*\*\*/, "").trim();

  const sections: ParsedSection[] = [];

  // Regex matches for the 4 structured sections
  const evaluationMatch = text.match(
    /(?:###|\*\*|)?\s*(?:📌|1\.)?\s*TARTIŞMA VE KRİTER DEĞERLENDİRMESİ:?\s*([\s\S]*?)(?=(?:###|\*\*|)?\s*(?:🏆|2\.|ÖNE ÇIKAN)|$)/i,
  );
  const winnerMatch = text.match(
    /(?:###|\*\*|)?\s*(?:🏆|2\.)?\s*ÖNE ÇIKAN \/ KAZANAN TARAF:?\s*([\s\S]*?)(?=(?:###|\*\*|)?\s*(?:⚖️|3\.|KRİTİK KOŞULLAR)|$)/i,
  );
  const conditionsMatch = text.match(
    /(?:###|\*\*|)?\s*(?:⚖️|3\.)?\s*KRİTİK KOŞULLAR VE NÜANSLAR:?\s*([\s\S]*?)(?=(?:###|\*\*|)?\s*(?:🏛️|4\.|NİHAİ HAKEM HÜKMÜ)|$)/i,
  );
  const rulingMatch = text.match(
    /(?:###|\*\*|)?\s*(?:🏛️|4\.)?\s*NİHAİ HAKEM HÜKMÜ:?\s*([\s\S]*?)$/i,
  );

  if (evaluationMatch && evaluationMatch[1].trim()) {
    sections.push({
      title: "Tartışma ve Kriter Değerlendirmesi",
      type: "evaluation",
      icon: "📊",
      content: cleanText(evaluationMatch[1]),
    });
  }

  if (winnerMatch && winnerMatch[1].trim()) {
    sections.push({
      title: "Öne Çıkan / Kazanan Taraf",
      type: "winner",
      icon: "🏆",
      content: cleanText(winnerMatch[1]),
    });
  }

  if (conditionsMatch && conditionsMatch[1].trim()) {
    sections.push({
      title: "Kritik Koşullar ve Nüanslar",
      type: "conditions",
      icon: "⚖️",
      content: cleanText(conditionsMatch[1]),
    });
  }

  if (rulingMatch && rulingMatch[1].trim()) {
    sections.push({
      title: "Nihai Hakem Hükmü",
      type: "ruling",
      icon: "🏛️",
      content: cleanText(rulingMatch[1]),
    });
  }

  // Fallback if standard headers weren't found
  if (sections.length === 0) {
    sections.push({
      title: "Hakem Değerlendirmesi",
      type: "generic",
      icon: "🏛️",
      content: cleanText(text),
    });
  }

  return sections;
}

const JudgePopup: React.FC<JudgePopupProps> = ({
  showPopup,
  isLoading,
  verdict,
  report,
  onClose,
}) => {
  const sections = parseVerdict(verdict);
  return (
    <Modal
      isOpen={showPopup}
      onClose={onClose}
      title="Hakem değerlendirmesi"
      icon={<JudgeIcon size={21} />}
      maxWidthClass="max-w-3xl"
    >
      {isLoading ? (
        <div role="status" className="py-12 text-center">
          <div className="animate-spin w-9 h-9 rounded-full border-2 border-[#9BCEC1] border-t-transparent mx-auto mb-5" />
          <p className="text-lg font-semibold">Argümanlar değerlendiriliyor</p>
          <p className="helper mt-2">
            Tutarlılık, kanıtlar ve karşı argümanlara verilen yanıtlar
            inceleniyor.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {report ? (
            <JudgeReportView report={report} />
          ) : (
            sections.map((section, index) => (
              <section
                key={index}
                className={
                  section.type === "ruling"
                    ? "report-decision"
                    : "border-b border-[#5E3D38]/15 pb-5"
                }
              >
                <h4 className="text-sm font-semibold mb-3">{section.title}</h4>
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                  {section.content}
                </p>
              </section>
            ))
          )}
          <button onClick={onClose} className="btn btn-dark w-full">
            Kararı anladım ve kapat
          </button>
        </div>
      )}
    </Modal>
  );
};
export default JudgePopup;

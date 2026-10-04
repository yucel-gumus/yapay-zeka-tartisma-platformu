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

const JudgePopup: React.FC<JudgePopupProps> = ({
  showPopup,
  isLoading,
  verdict,
  report,
  onClose,
}) => {
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
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
              {verdict}
            </p>
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

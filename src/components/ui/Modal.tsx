"use client";

import React, { useId, useRef } from "react";
import { CloseIcon } from "./Icons";
import { useModalDialog } from "@/lib/useModalDialog";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  icon?: React.ReactNode;
  maxWidthClass?: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  icon,
  maxWidthClass = "max-w-lg",
  children,
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const closeDialog = useModalDialog(dialogRef, isOpen, onClose);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={title ? titleId : undefined}
      aria-label={title ? undefined : "İletişim kutusu"}
      {...({ closedby: "any" } as Record<string, string>)}
      className={`mwg-dialog m-auto w-[calc(100%-2rem)] ${maxWidthClass} rounded-2xl shadow-2xl`}
    >
      <div className="bg-[#EDF3EE] border border-[#BCC7D2] rounded-2xl p-5 sm:p-7 w-full overflow-hidden max-h-[90vh] flex flex-col">
        {title && (
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#BCC7D2]">
            <div className="flex items-center space-x-3">
              {icon && (
                <div className="w-9 h-9 bg-[#EC7D55] rounded-2xl flex items-center justify-center text-[#253341]">
                  {icon}
                </div>
              )}
              <h3
                id={titleId}
                className="text-lg font-semibold text-[#253341] tracking-tight"
              >
                {title}
              </h3>
            </div>
            <button
              type="button"
              onClick={closeDialog}
              className="text-[#3E5164] hover:text-[#253341] transition-colors w-9 h-9 flex items-center justify-center rounded-2xl hover:bg-[#DBE6DD] cursor-pointer"
              aria-label="Kapat"
            >
              <CloseIcon size={20} />
            </button>
          </div>
        )}
        <div className="overflow-y-auto overscroll-contain flex-1 custom-scrollbar">
          {children}
        </div>
      </div>
    </dialog>
  );
};

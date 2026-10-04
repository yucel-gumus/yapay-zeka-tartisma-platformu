import React, { useEffect, useId, useRef } from "react";
import { CloseIcon } from "./Icons";

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
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const previous = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    const focusable = () =>
      Array.from(
        dialog?.querySelectorAll<HTMLElement>(
          'button:not(:disabled), input, textarea, select, a[href], [tabindex="0"]',
        ) || [],
      );
    (focusable()[0] || dialog)?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
      }
      if (event.key === "Tab") {
        const elements = focusable();
        const first = elements[0];
        const last = elements[elements.length - 1];
        if (!first) {
          event.preventDefault();
          dialog?.focus();
        } else if (
          event.shiftKey &&
          (document.activeElement === first ||
            document.activeElement === dialog)
        ) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previous?.focus();
    };
  }, [isOpen]);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#2C1A18]/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={title ? undefined : "İletişim kutusu"}
        tabIndex={-1}
        className={`bg-[#FFEBD3] border border-[#FFB6A6]/50 rounded-2xl p-5 sm:p-7 ${maxWidthClass} w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col`}
      >
        {title && (
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#FFB6A6]/40">
            <div className="flex items-center space-x-3">
              {icon && (
                <div className="w-9 h-9 bg-[#9BCEC1] rounded-2xl flex items-center justify-center text-[#2C1A18] ">
                  {icon}
                </div>
              )}
              <h3
                id={titleId}
                className="text-lg font-semibold text-[#2C1A18] tracking-tight"
              >
                {title}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-[#5E3D38] hover:text-[#2C1A18] transition-colors w-9 h-9 flex items-center justify-center rounded-2xl hover:bg-[#FFB6A6]/40 cursor-pointer"
              aria-label="Kapat"
            >
              <CloseIcon size={20} />
            </button>
          </div>
        )}
        <div className="overflow-y-auto flex-1 custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, maxWidth = 'max-w-lg', className = '' }) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className={`bg-white border border-[#E8E2D8] rounded-2xl ${maxWidth} w-full p-4 sm:p-6 shadow-2xl space-y-4 relative max-h-[92vh] overflow-y-auto ${className}`}>
        <div className="flex items-center justify-between border-b border-[#E8E2D8] pb-3 sticky top-0 bg-white/95 backdrop-blur-xs z-10 -mt-1 pt-1">
          <h3 className="text-lg font-bold text-[#1B211E] truncate pr-2">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#6E736E] hover:text-[#1B211E] hover:bg-[#F2EFEB] transition-colors shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="pt-1">{children}</div>
      </div>
    </div>,
    document.body,
  );
};

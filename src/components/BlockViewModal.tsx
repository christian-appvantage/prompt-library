'use client';

import { X } from 'lucide-react';
import type { Block } from '@/types';

interface BlockViewModalProps {
  block: Block | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleSelection: () => void;
  isSelected: boolean;
  categoryLabel?: string;
}

export default function BlockViewModal({
  block,
  isOpen,
  onClose,
  onToggleSelection,
  isSelected,
  categoryLabel
}: BlockViewModalProps) {
  if (!isOpen || !block) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-[#E60000]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-white/80">{block.id}</span>
              <span className="text-xs text-white/80">{categoryLabel}</span>
            </div>
            <h2 className="text-xl font-light text-white">{block.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{block.prompt}</p>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-slate-200 bg-slate-50">
          <div className="flex-1 text-sm text-slate-600">
            {isSelected ? 'Selected' : 'Not selected'}
          </div>
          <button
            onClick={onToggleSelection}
            className={`px-6 py-2 rounded-lg font-light transition-all ${
              isSelected
                ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                : 'bg-[#E60000] text-white hover:bg-[#CC0000]'
            }`}
          >
            {isSelected ? 'Remove' : 'Select'}
          </button>
        </div>
      </div>
    </div>
  );
}

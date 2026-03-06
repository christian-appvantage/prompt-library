'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Zap, RotateCcw } from 'lucide-react';
import type { Placeholder } from '@/utils/placeholderParser';
import SmartPlaceholderInput from './SmartPlaceholderInput';
import { saveToHistory } from '@/utils/placeholderHistory';

interface PlaceholderFormProps {
  placeholders: Placeholder[];
  onComplete: (values: Record<string, string>) => void;
  onSkip: () => void;
}

export default function PlaceholderForm({
  placeholders,
  onComplete,
  onSkip
}: PlaceholderFormProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
  const firstInputRef = useRef<HTMLDivElement>(null);

  // Auto-focus first field on mount
  useEffect(() => {
    if (firstInputRef.current) {
      const input = firstInputRef.current.querySelector('input');
      if (input) {
        input.focus();
      }
    }
  }, []);

  const handleSubmit = () => {
    // Save filled values to history
    Object.entries(values).forEach(([key, value]) => {
      if (value && value.trim()) {
        saveToHistory(key, value);
      }
    });

    onComplete(values);
  };

  const formatKey = (key: string): string => {
    return key
      .replace(/_/g, ' ')
      .replace(/\//g, ' / ')
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  // Calculate progress
  const filledCount = Object.values(values).filter(v => v && v.trim()).length;
  const totalCount = placeholders.length;
  const percentage = totalCount > 0 ? Math.round((filledCount / totalCount) * 100) : 0;

  // Batch operations
  const handleQuickFill = () => {
    const newValues: Record<string, string> = {};
    placeholders.forEach((ph) => {
      if (ph.examples.length > 0) {
        newValues[ph.key] = ph.examples[0];
      }
    });
    setValues({ ...values, ...newValues });
  };

  const handleClearAll = () => {
    setValues({});
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === 'Enter' && idx === placeholders.length - 1) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onSkip();
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 border-2 border-[#E60000]/20 shadow-lg">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-light text-black flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#E60000]" />
            Fill in Missing Details
          </h3>
          <p className="text-sm text-slate-600 mt-1">
            We found {placeholders.length} placeholder{placeholders.length !== 1 ? 's' : ''} in your prompt.
            Fill in what you can, or skip to use as-is.
          </p>
        </div>

        {/* Batch Operation Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleQuickFill}
            title="Fill all fields with first example"
            className="px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors border border-slate-300 flex items-center gap-1.5"
          >
            <Zap className="w-4 h-4" />
            Quick Fill
          </button>
          <button
            onClick={handleClearAll}
            title="Clear all fields"
            className="px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors border border-slate-300 flex items-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            Clear
          </button>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-600">
            Progress: {filledCount}/{totalCount} filled
          </span>
          <span className="text-xs font-medium text-slate-600">{percentage}%</span>
        </div>
        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#E60000] transition-all duration-300 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-5 mb-6">
        {placeholders.map((ph, idx) => (
          <div
            key={ph.key}
            className="space-y-2"
            ref={idx === 0 ? firstInputRef : null}
            onKeyDown={(e) => handleKeyDown(e, idx)}
          >
            {/* Label with number */}
            <label className="block text-sm font-light text-black">
              {idx + 1}. {formatKey(ph.key)}
            </label>

            {/* Smart Placeholder Input with Clickable Examples */}
            <SmartPlaceholderInput
              placeholder={ph}
              value={values[ph.key] || ''}
              onChange={(value) => setValues({ ...values, [ph.key]: value })}
              autoFocus={idx === 0}
              label={formatKey(ph.key)}
            />
          </div>
        ))}
      </div>

      {/* Optional Note */}
      <div className="bg-[#E60000]/5 border border-[#E60000]/20 rounded-lg p-3 mb-4">
        <p className="text-xs text-[#595959]">
          <span className="font-light">Note:</span> All fields are optional.
          Unfilled placeholders will remain in the prompt for later editing.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onSkip}
          className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors border border-slate-300"
        >
          Skip (keep placeholders)
        </button>
        <button
          onClick={handleSubmit}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#E60000] text-white rounded-lg font-medium shadow-lg shadow-[#E60000]/25 hover:shadow-xl hover:shadow-[#E60000]/30 transition-all"
        >
          <Sparkles className="w-4 h-4" />
          Apply & Finalize
        </button>
      </div>
    </div>
  );
}

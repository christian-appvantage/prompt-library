'use client';

import { useState, useEffect } from 'react';
import { detectInputType, getCleanKey } from '@/utils/placeholderTypeDetector';
import { getHistory } from '@/utils/placeholderHistory';
import { History } from 'lucide-react';
import type { Placeholder } from '@/utils/placeholderParser';

export interface SmartPlaceholderInputProps {
  placeholder: Placeholder;
  value: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
  label: string;
}

export default function SmartPlaceholderInput({
  placeholder,
  value,
  onChange,
  autoFocus = false,
  label
}: SmartPlaceholderInputProps) {
  // Detect the appropriate input type
  const { type, options } = detectInputType(placeholder);
  const cleanKey = getCleanKey(placeholder.key);

  // Render based on detected type
  if (type === 'select' && options) {
    return <SelectInput options={options} value={value} onChange={onChange} label={label} autoFocus={autoFocus} />;
  }

  if (type === 'date') {
    return <DateInput value={value} onChange={onChange} label={label} autoFocus={autoFocus} />;
  }

  if (type === 'number') {
    return <NumberInput value={value} onChange={onChange} label={label} autoFocus={autoFocus} />;
  }

  // Default: chips (if examples) or text input
  const hasExamples = placeholder.examples.length > 0;
  const [history, setHistory] = useState<string[]>([]);

  // Load history on mount
  useEffect(() => {
    const historyValues = getHistory(placeholder.key);
    setHistory(historyValues);
  }, [placeholder.key]);

  const handleChipClick = (example: string) => {
    onChange(example);
  };

  // Filter history to exclude values already in examples
  const uniqueHistory = history.filter(h => !placeholder.examples.includes(h));

  return (
    <div className="space-y-2">
      {/* Clickable Example Chips */}
      {hasExamples && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-slate-600">Quick select:</p>
          <div className="flex flex-wrap gap-2">
            {placeholder.examples.slice(0, 10).map((example, idx) => {
              const isSelected = value === example;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleChipClick(example)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    isSelected
                      ? 'bg-[#E91E8C] text-white shadow-md shadow-[#E91E8C]/25'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
                  }`}
                >
                  {example}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Previously Used (History) Chips */}
      {uniqueHistory.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-blue-600 flex items-center gap-1">
            <History className="w-3 h-3" />
            Previously used:
          </p>
          <div className="flex flex-wrap gap-2">
            {uniqueHistory.slice(0, 5).map((historyValue, idx) => {
              const isSelected = value === historyValue;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleChipClick(historyValue)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                      : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-300'
                  }`}
                >
                  {historyValue}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Text Input (always available) */}
      <div>
        {hasExamples && (
          <p className="text-xs text-slate-500 mb-1.5">Or enter custom value:</p>
        )}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Enter ${label.toLowerCase()} (optional)`}
          autoFocus={autoFocus}
          list={`suggestions-${placeholder.key}`}
          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E91E8C] focus:border-transparent text-slate-700 placeholder:text-slate-400"
        />
        {/* Autocomplete suggestions from history and examples */}
        {(history.length > 0 || placeholder.examples.length > 0) && (
          <datalist id={`suggestions-${placeholder.key}`}>
            {history.map((h, idx) => (
              <option key={`history-${idx}`} value={h} />
            ))}
            {placeholder.examples.map((ex, idx) => (
              <option key={`example-${idx}`} value={ex} />
            ))}
          </datalist>
        )}
      </div>
    </div>
  );
}

// Select dropdown component
function SelectInput({
  options,
  value,
  onChange,
  label,
  autoFocus
}: {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  label: string;
  autoFocus?: boolean;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      autoFocus={autoFocus}
      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E91E8C] focus:border-transparent text-slate-700 bg-white"
    >
      <option value="">Select {label.toLowerCase()}...</option>
      {options.map((option, idx) => (
        <option key={idx} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

// Date picker component
function DateInput({
  value,
  onChange,
  label,
  autoFocus
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  autoFocus?: boolean;
}) {
  return (
    <input
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      autoFocus={autoFocus}
      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E91E8C] focus:border-transparent text-slate-700"
    />
  );
}

// Number input component
function NumberInput({
  value,
  onChange,
  label,
  autoFocus
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  autoFocus?: boolean;
}) {
  return (
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={`Enter ${label.toLowerCase()} (optional)`}
      autoFocus={autoFocus}
      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E91E8C] focus:border-transparent text-slate-700 placeholder:text-slate-400"
    />
  );
}

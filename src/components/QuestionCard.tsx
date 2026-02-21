'use client';

import { useRef, useCallback, useState } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, SkipForward, X, Image as ImageIcon } from 'lucide-react';
import VoiceInput from './VoiceInput';
import type { ClarifyingQuestion } from '@/types';

interface ImageAttachment {
  id: string;
  data: string;
  type: string;
  name: string;
}

interface QuestionCardProps {
  question: ClarifyingQuestion;
  questionNumber: number;
  totalQuestions: number;
  currentAnswer: string;
  onAnswer: (answer: string) => void;
  onNext: () => void;
  onBack: () => void;
  onSkipAll: () => void;
  isFirst: boolean;
  isLast: boolean;
}

// Category color mapping matching the TCWEI categories
const categoryColors: Record<string, string> = {
  writer: 'bg-[#E91E8C]/10 text-[#E91E8C]',
  task: 'bg-violet-100 text-violet-700',
  context: 'bg-blue-100 text-blue-700',
  examples: 'bg-amber-100 text-amber-700',
  instructions: 'bg-emerald-100 text-emerald-700',
  bestPractices: 'bg-rose-100 text-rose-700',
  coding: 'bg-cyan-100 text-cyan-700',
};

const categoryLabels: Record<string, string> = {
  writer: 'Role',
  task: 'Task',
  context: 'Context',
  examples: 'Examples',
  instructions: 'Instructions',
  bestPractices: 'Best Practices',
  coding: 'Coding',
};

export default function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  currentAnswer,
  onAnswer,
  onNext,
  onBack,
  onSkipAll,
  isFirst,
  isLast,
}: QuestionCardProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [selectedOptions, setSelectedOptions] = useState<Set<string>>(new Set());
  const [additionalInput, setAdditionalInput] = useState('');
  const [images, setImages] = useState<ImageAttachment[]>([]);

  // Auto-focus on mount
  const textareaCallbackRef = useCallback((node: HTMLTextAreaElement | null) => {
    if (node) {
      requestAnimationFrame(() => node.focus());
    }
    (textareaRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
  }, []);

  const handleVoiceTranscript = (transcript: string) => {
    setAdditionalInput(prev => prev ? `${prev} ${transcript}` : transcript);
  };

  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData.items;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();

        if (!file) continue;

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert('Image size must be less than 5MB');
          continue;
        }

        // Convert to base64
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64 = event.target?.result as string;
          const newImage: ImageAttachment = {
            id: `img-${Date.now()}-${i}`,
            data: base64.split(',')[1],
            type: file.type,
            name: file.name || 'pasted-image',
          };

          setImages(prev => [...prev, newImage]);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const toggleOption = (option: string) => {
    const newSelected = new Set(selectedOptions);
    if (newSelected.has(option)) {
      newSelected.delete(option);
    } else {
      newSelected.add(option);
    }
    setSelectedOptions(newSelected);
  };

  const handleNext = () => {
    // Combine selections and additional input into answer string
    const parts: string[] = [];
    if (selectedOptions.size > 0) {
      parts.push(`Selected: ${Array.from(selectedOptions).join(', ')}`);
    }
    if (additionalInput.trim()) {
      parts.push(`Additional: ${additionalInput.trim()}`);
    }
    const combinedAnswer = parts.join(' | ');
    onAnswer(combinedAnswer || ''); // Pass to parent
    onNext();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleNext();
    }
  };

  const colorClass = categoryColors[question.category] || 'bg-slate-100 text-slate-700';
  const categoryLabel = categoryLabels[question.category] || question.category;

  return (
    <div className="animate-fade-in-slide">
      {/* Question header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-500">
            Question {questionNumber} of {totalQuestions}
          </span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
            {categoryLabel}
          </span>
        </div>
      </div>

      {/* Question text */}
      <h3 className="text-lg font-semibold text-slate-800 mb-3 leading-snug">
        {question.text}
      </h3>

      {/* Hint */}
      {question.hint && (
        <div className="bg-slate-50 rounded-lg p-3 mb-4">
          <p className="text-sm text-slate-500 italic">
            <span className="font-medium not-italic text-slate-600">Hint: </span>
            {question.hint}
          </p>
        </div>
      )}

      {/* Multi-select options with A/B/C/D labels */}
      {question.options && question.options.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-medium text-slate-700 mb-2">
            Select one or more options (optional):
          </p>
          <div className="space-y-2">
            {question.options.map((option, idx) => {
              const letter = String.fromCharCode(65 + idx); // A, B, C, D...
              const isSelected = selectedOptions.has(option);

              return (
                <label
                  key={option}
                  className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    isSelected
                      ? 'border-[#E91E8C] bg-[#E91E8C]/5'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleOption(option)}
                    className="w-4 h-4 text-[#E91E8C] rounded focus:ring-[#E91E8C] border-slate-300"
                  />
                  <span className="font-bold text-[#E91E8C] text-sm min-w-[1.5rem]">
                    {letter}.
                  </span>
                  <span className="text-slate-800 text-sm flex-1">{option}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Additional details input (always visible) */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Additional details or other option (optional):
        </label>
        <div className="flex gap-3">
          <div className="flex-1">
            <textarea
              ref={textareaCallbackRef}
              value={additionalInput}
              onChange={(e) => setAdditionalInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              placeholder="Add any additional context or paste screenshots (Ctrl+V)..."
              className="w-full h-20 px-4 py-3 border border-slate-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-700 placeholder:text-slate-400 text-sm"
              aria-label="Additional details"
            />
          </div>
          <div className="flex flex-col justify-start">
            <VoiceInput onTranscript={handleVoiceTranscript} disabled={false} />
          </div>
        </div>

        {/* Image previews */}
        {images.length > 0 && (
          <div className="mt-3">
            <div className="flex items-center gap-2 mb-2">
              <ImageIcon className="w-4 h-4 text-slate-600" />
              <span className="text-xs font-medium text-slate-700">Attached Images ({images.length})</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {images.slice(0, 3).map((img, index) => (
                <div key={img.id} className="relative group">
                  <div className="w-full aspect-square rounded-lg border-2 border-slate-200 overflow-hidden bg-slate-50">
                    <img
                      src={`data:${img.type};base64,${img.data}`}
                      alt={`Screenshot ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    onClick={() => removeImage(img.id)}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-pink-600 hover:bg-pink-700 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Remove image"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {images.length > 3 && (
                <div className="w-full aspect-square rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center">
                  <span className="text-sm font-medium text-slate-600">+{images.length - 3} more</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between">
        <div>
          {!isFirst && (
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onSkipAll}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-all"
          >
            <SkipForward className="w-3.5 h-3.5" />
            Skip &amp; Generate
          </button>

          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#E91E8C] text-white rounded-xl font-medium shadow-lg shadow-[#E91E8C]/25 hover:shadow-xl hover:shadow-[#E91E8C]/30 transition-all text-sm"
          >
            {isLast ? (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Prompt
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Keyboard hint */}
      <div className="mt-4 pt-3 border-t border-slate-100">
        <p className="text-xs text-slate-400 text-center">
          Press <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-500 font-mono">Enter</kbd> to continue or <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-500 font-mono">Shift+Enter</kbd> for new line
        </p>
      </div>
    </div>
  );
}

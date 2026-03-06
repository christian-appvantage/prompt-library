'use client';

import { useState, useRef } from 'react';
import { Sparkles, Loader2, AlertCircle, X, Image as ImageIcon, Upload } from 'lucide-react';
import VoiceInput from './VoiceInput';

interface ImageAttachment {
  id: string;
  data: string;
  type: string;
  name: string;
}

interface IntentInputProps {
  onSubmit: (intent: string, images?: ImageAttachment[]) => void;
  isLoading?: boolean;
  initialValue?: string;
}

const EXAMPLE_INTENTS = [
  {
    label: 'Stakeholder email',
    text: 'I need to write a professional email to stakeholders about a project delay, explaining the reasons and proposed next steps',
  },
  {
    label: 'Code review checklist',
    text: 'Create a thorough code review checklist for a senior developer reviewing pull requests in a TypeScript project',
  },
  {
    label: 'Meeting summary',
    text: 'Help me write a concise meeting summary that captures key decisions, action items, and owners from a project status meeting',
  },
];

export default function IntentInput({ onSubmit, isLoading = false, initialValue = '' }: IntentInputProps) {
  const [intent, setIntent] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);
  const [prevInitialValue, setPrevInitialValue] = useState(initialValue);
  const [images, setImages] = useState<ImageAttachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync with initialValue using derived state pattern (no effect needed)
  if (initialValue !== prevInitialValue) {
    setPrevInitialValue(initialValue);
    if (initialValue) {
      setIntent(initialValue);
    }
  }

  const handleVoiceTranscript = (transcript: string) => {
    setIntent(prev => prev ? `${prev} ${transcript}` : transcript);
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
          setError('Image size must be less than 5MB');
          setTimeout(() => setError(null), 3000);
          continue;
        }

        // Convert to base64
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64 = event.target?.result as string;
          const newImage: ImageAttachment = {
            id: `img-${Date.now()}-${i}`,
            data: base64.split(',')[1], // Remove data:image/... prefix
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!file.type.startsWith('image/')) {
        setError('Only image files are supported');
        setTimeout(() => setError(null), 3000);
        continue;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        setTimeout(() => setError(null), 3000);
        continue;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        const newImage: ImageAttachment = {
          id: `img-${Date.now()}-${i}`,
          data: base64.split(',')[1],
          type: file.type,
          name: file.name,
        };
        setImages(prev => [...prev, newImage]);
      };
      reader.readAsDataURL(file);
    }

    // Reset input so same file can be uploaded again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = () => {
    if (!intent.trim()) {
      setError('Please describe what you want to accomplish');
      return;
    }
    setError(null);
    onSubmit(intent.trim(), images.length > 0 ? images : undefined);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-light text-black mb-1">What do you need help with?</h2>
        <p className="text-sm text-[#808080]">
          Describe your task in plain English. Our AI will analyze your request and guide you to the perfect prompt.
        </p>
      </div>

      <div className="flex gap-3">
        <div className="flex-1 relative">
          <textarea
            value={intent}
            onChange={(e) => {
              setIntent(e.target.value);
              setError(null);
            }}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder="e.g., I need to write a professional email to stakeholders about a project delay... (Tip: Paste screenshots with Ctrl+V or click the upload button)"
            className="w-full h-24 px-4 py-3 border border-[#E8E8E8] rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#E60000] focus:border-transparent text-black placeholder:text-[#a5a9ab]"
            disabled={isLoading}
            aria-label="Describe your task"
          />
          {error && (
            <div className="absolute -bottom-6 left-0 flex items-center gap-1 text-red-500 text-sm" role="alert">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <VoiceInput onTranscript={handleVoiceTranscript} disabled={isLoading} />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="w-12 h-12 rounded-xl border-2 border-[#E8E8E8] hover:border-[#E60000] hover:bg-[#E60000]/5 transition-all flex items-center justify-center group"
            aria-label="Upload screenshot or image"
            title="Upload screenshot or image"
          >
            <Upload className="w-5 h-5 text-[#a5a9ab] group-hover:text-[#E60000]" />
          </button>

          <button
            onClick={handleSubmit}
            disabled={isLoading || !intent.trim()}
            className="btn-primary flex items-center justify-center gap-2 px-4 py-3"
            aria-label="Submit task description"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Sparkles className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileUpload}
          className="hidden"
          aria-label="File input for images"
        />
      </div>

      {/* Image previews */}
      {images.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-2">
            <ImageIcon className="w-4 h-4 text-slate-600" />
            <span className="text-sm font-medium text-slate-700">Attached Images ({images.length})</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {images.map((img) => (
              <div key={img.id} className="relative group">
                <div className="w-24 h-24 rounded-lg border-2 border-slate-200 overflow-hidden bg-slate-50">
                  <img
                    src={`data:${img.type};base64,${img.data}`}
                    alt="Pasted screenshot"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={() => removeImage(img.id)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-pink-600 hover:bg-pink-700 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Screenshots will be sent to the AI for visual context analysis
          </p>
        </div>
      )}

      {!intent.trim() && !isLoading && (
        <div className="flex flex-wrap gap-2 mt-4">
          {EXAMPLE_INTENTS.map((example) => (
            <button
              key={example.label}
              onClick={() => setIntent(example.text)}
              className="border border-slate-200 rounded-full px-3 py-1.5 text-sm text-slate-600 hover:border-[#E60000] hover:text-[#E60000] transition-colors"
            >
              {example.label}
            </button>
          ))}
        </div>
      )}

      <div className="mt-8 pt-4 border-t border-slate-100">
        <p className="text-xs text-slate-400 text-center">
          Press <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-500 font-mono">Enter</kbd> to continue or <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-500 font-mono">Shift+Enter</kbd> for new line
          <span className="mx-2">•</span>
          <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-500 font-mono">Ctrl+V</kbd> to paste images
        </p>
      </div>
    </div>
  );
}

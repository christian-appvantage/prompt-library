'use client';

import { useState, useRef } from 'react';
import { Sparkles, Loader2, AlertCircle, X, Image as ImageIcon, Upload, FileText } from 'lucide-react';
import { ImageAttachment, DocumentAttachment } from '@/types';

interface IntentInputProps {
  onSubmit: (intent: string, images?: ImageAttachment[], documents?: DocumentAttachment[]) => void;
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
  const [documents, setDocuments] = useState<DocumentAttachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync with initialValue using derived state pattern (no effect needed)
  if (initialValue !== prevInitialValue) {
    setPrevInitialValue(initialValue);
    if (initialValue) {
      setIntent(initialValue);
    }
  }


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

      // Check if it's an image
      if (file.type.startsWith('image/')) {
        // Handle image upload
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
      // Check if it's a document
      else if (
        file.type === 'application/pdf' ||
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      ) {
        // Handle document upload
        if (file.size > 10 * 1024 * 1024) {
          setError('Document size must be less than 10MB');
          setTimeout(() => setError(null), 4000);
          continue;
        }

        const reader = new FileReader();
        reader.onload = async (event) => {
          const base64 = event.target?.result as string;
          const docId = `doc-${Date.now()}-${i}`;

          const newDocument: DocumentAttachment = {
            id: docId,
            data: base64.split(',')[1],
            type: file.type,
            name: file.name,
          };

          // Add to state immediately (shows uploading state)
          setDocuments(prev => [...prev, newDocument]);

          // Extract text
          try {
            const response = await fetch('/api/extract-document', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ document: newDocument }),
            });

            if (!response.ok) {
              const { error } = await response.json();
              throw new Error(error);
            }

            const { extractedText, metadata } = await response.json();

            // Update with extracted text
            setDocuments(prev =>
              prev.map(d =>
                d.id === docId ? { ...d, extractedText, metadata } : d
              )
            );
          } catch (err: any) {
            setError(err.message || 'Failed to extract document text');
            setTimeout(() => setError(null), 4000);
            // Remove failed document
            setDocuments(prev => prev.filter(d => d.id !== docId));
          }
        };
        reader.readAsDataURL(file);
      } else {
        setError('Unsupported file type. Please upload images (PNG, JPG, GIF, WebP) or documents (PDF, DOCX, PPTX)');
        setTimeout(() => setError(null), 4000);
      }
    }

    // Reset input so same file can be uploaded again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  const handleSubmit = () => {
    if (!intent.trim()) {
      setError('Please describe what you want to accomplish');
      return;
    }
    setError(null);
    onSubmit(
      intent.trim(),
      images.length > 0 ? images : undefined,
      documents.length > 0 ? documents : undefined
    );
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
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="w-12 h-12 rounded-xl border-2 border-[#E8E8E8] hover:border-[#E60000] hover:bg-[#E60000]/5 transition-all flex items-center justify-center group"
            aria-label="Upload files (images or documents)"
            title="Upload images (PNG, JPG, GIF, WebP) or documents (PDF, DOCX, PPTX)"
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
          accept="image/*,.pdf,.docx,.pptx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation"
          multiple
          onChange={handleFileUpload}
          className="hidden"
          aria-label="File input for images and documents"
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

      {/* Document previews */}
      {documents.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-slate-600" />
            <span className="text-sm font-medium text-slate-700">Attached Documents ({documents.length})</span>
          </div>
          <div className="space-y-2">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center gap-3 p-3 border-2 border-slate-200 rounded-lg">
                <div className="flex-shrink-0">
                  {doc.type.includes('pdf') && <FileText className="w-6 h-6 text-red-500" />}
                  {doc.type.includes('word') && <FileText className="w-6 h-6 text-blue-500" />}
                  {doc.type.includes('presentation') && <FileText className="w-6 h-6 text-orange-500" />}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{doc.name}</p>
                  {doc.extractedText ? (
                    <p className="text-xs text-green-600">
                      ✓ Extracted {doc.metadata?.wordCount || 0} words
                      {doc.metadata?.pageCount && ` (${doc.metadata.pageCount} pages)`}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Extracting text...
                    </p>
                  )}
                </div>

                <button
                  onClick={() => removeDocument(doc.id)}
                  className="flex-shrink-0 w-6 h-6 bg-pink-600 hover:bg-pink-700 text-white rounded-full flex items-center justify-center"
                  aria-label="Remove document"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {documents.some(d => d.metadata?.truncated) && (
            <p className="text-xs text-amber-600 mt-2">
              ⚠️ Some documents were truncated to 50,000 characters due to size limits.
            </p>
          )}
        </div>
      )}

      {!intent.trim() && !isLoading && (
        <div className="flex flex-wrap gap-2 mt-4">
          {EXAMPLE_INTENTS.map((example) => (
            <button
              key={example.label}
              onClick={() => setIntent(example.text)}
            className="w-full h-24 px-4 py-3 border border-[#E8E8E8] rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#E60000] focus:border-transparent text-black placeholder:text-[#a5a9ab]"
            >
              {example.label}
            </button>
          ))}
        </div>
      )}

      <div className="mt-8 pt-4 border-t border-slate-100">
        <p className="text-xs text-slate-400 text-center">
          Press <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-500 font-mono">Enter</kbd> to submit or <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-500 font-mono">Shift+Enter</kbd> for new line
          <span className="mx-2">•</span>
          <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-500 font-mono">Ctrl+V</kbd> to paste images
        </p>
      </div>
    </div>
  );
}

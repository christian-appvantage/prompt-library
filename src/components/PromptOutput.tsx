'use client';

import { useState, useEffect } from 'react';
import { Copy, Check, X, Lightbulb, ChevronDown, ChevronUp, Edit, Download, Heart } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import PlaceholderForm from './PlaceholderForm';
import { extractPlaceholders, replacePlaceholders, hasPlaceholders } from '@/utils/placeholderParser';
import { downloadPrompt } from '@/utils/downloadPrompt';
import { addToFavorites, isFavorited } from '@/utils/favoritesManager';

interface SelectedBlock {
  id: string;
  title: string;
  category: string;
  categoryLabel?: string;
}

interface PromptOutputProps {
  prompt: string;
  selectedBlocks: SelectedBlock[];
  reasoning?: string;
  userIntent?: string;
  onClose: () => void;
}

export default function PromptOutput({ prompt, selectedBlocks, reasoning, userIntent, onClose }: PromptOutputProps) {
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteId, setFavoriteId] = useState<string | null>(null);
  const [showReasoning, setShowReasoning] = useState(false);
  const [showPlaceholderForm, setShowPlaceholderForm] = useState(false);
  const [finalPrompt, setFinalPrompt] = useState(prompt);

  // Detect placeholders on mount and check favorite status
  useEffect(() => {
    if (hasPlaceholders(prompt)) {
      setShowPlaceholderForm(true);
    }
    setFinalPrompt(prompt);
    setIsFavorite(isFavorited(prompt));
  }, [prompt]);

  const handlePlaceholderComplete = (values: Record<string, string>) => {
    // Replace placeholders in the current finalPrompt (supports re-opening form)
    const filled = replacePlaceholders(finalPrompt, values);
    setFinalPrompt(filled);
    setShowPlaceholderForm(false);
  };

  const handleSkipPlaceholders = () => {
    setShowPlaceholderForm(false);
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(finalPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    try {
      downloadPrompt(
        {
          prompt: finalPrompt,
          selectedBlocks,
          reasoning,
          userIntent,
        },
        userIntent
      );
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 2000);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download prompt. Please try again.');
    }
  };

  const handleFavoriteToggle = () => {
    if (isFavorite) {
      alert('To remove from favorites, use the Favorites panel in the header');
      return;
    }

    try {
      const favorite = addToFavorites({
        prompt: finalPrompt,
        selectedBlocks,
        userIntent,
        reasoning,
      });
      setIsFavorite(true);
      setFavoriteId(favorite.id);
    } catch (error) {
      console.error('Failed to add favorite:', error);
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert('Failed to save favorite. Please try again.');
      }
    }
  };

  // Custom renderer for markdown that highlights placeholders
  const components = {
    // Highlight placeholders in all text nodes
    p: ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => {
      const content = String(children || '');
      const parts = content.split(/(\[[^\]]+\])/);
      return (
        <p {...props} className="mb-4 last:mb-0">
          {parts.map((part, i) => {
            if (part.startsWith('[') && part.endsWith(']')) {
              return (
                <span key={i} className="bg-amber-200 text-amber-900 px-1 rounded font-medium">
                  {part}
                </span>
              );
            }
            return part;
          })}
        </p>
      );
    },
    // Style code blocks
    code: ({ children, className, ...props }: React.HTMLAttributes<HTMLElement> & { className?: string }) => {
      const isInline = !className;
      const content = String(children || '');

      if (isInline) {
        // Inline code - check for placeholders
        const parts = content.split(/(\[[^\]]+\])/);
        return (
          <code {...props} className="bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded text-sm font-mono">
            {parts.map((part, i) => {
              if (part.startsWith('[') && part.endsWith(']')) {
                return (
                  <span key={i} className="bg-amber-200 text-amber-900">
                    {part}
                  </span>
                );
              }
              return part;
            })}
          </code>
        );
      }

      // Code block
      return (
        <code {...props} className={`block bg-slate-800 text-slate-100 p-4 rounded-lg overflow-x-auto font-mono text-sm ${className || ''}`}>
          {children}
        </code>
      );
    },
    pre: ({ children }: React.HTMLAttributes<HTMLPreElement>) => {
      return <pre className="mb-4">{children}</pre>;
    },
    h1: ({ children }: React.HTMLAttributes<HTMLHeadingElement>) => (
      <h1 className="text-2xl font-bold mb-4 text-slate-900">{children}</h1>
    ),
    h2: ({ children }: React.HTMLAttributes<HTMLHeadingElement>) => (
      <h2 className="text-xl font-bold mb-3 text-slate-800">{children}</h2>
    ),
    h3: ({ children }: React.HTMLAttributes<HTMLHeadingElement>) => (
      <h3 className="text-lg font-bold mb-2 text-slate-800">{children}</h3>
    ),
    ul: ({ children }: React.HTMLAttributes<HTMLUListElement>) => (
      <ul className="list-disc list-inside mb-4 space-y-1">{children}</ul>
    ),
    ol: ({ children }: React.HTMLAttributes<HTMLOListElement>) => (
      <ol className="list-decimal list-inside mb-4 space-y-1">{children}</ol>
    ),
    li: ({ children }: React.HTMLAttributes<HTMLLIElement>) => (
      <li className="text-slate-700">{children}</li>
    ),
    blockquote: ({ children }: React.HTMLAttributes<HTMLQuoteElement>) => (
      <blockquote className="border-l-4 border-slate-300 pl-4 italic mb-4 text-slate-600">
        {children}
      </blockquote>
    ),
    hr: () => <hr className="my-6 border-slate-300" />,
    strong: ({ children }: React.HTMLAttributes<HTMLElement>) => (
      <strong className="font-bold text-slate-900">{children}</strong>
    ),
    em: ({ children }: React.HTMLAttributes<HTMLElement>) => (
      <em className="italic">{children}</em>
    ),
  };

  // Group blocks by category
  const blocksByCategory = selectedBlocks.reduce((acc, block) => {
    const cat = block.categoryLabel || block.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(block);
    return acc;
  }, {} as Record<string, SelectedBlock[]>);

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="prompt-output-title"
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col animate-scale-up">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-blue-600 to-pink-600 rounded-t-3xl flex items-center justify-between">
          <div>
            <h2 id="prompt-output-title" className="font-bold text-xl text-white">
              Your Generated Prompt
            </h2>
            <p className="text-sm text-blue-100">
              {selectedBlocks.length} building blocks assembled
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleFavoriteToggle}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all shadow-md ${
                isFavorite
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-white/20 hover:bg-white/30 text-white'
              }`}
              aria-label={isFavorite ? 'Prompt saved to favorites' : 'Save prompt to favorites'}
              title={isFavorite ? 'Saved to favorites' : 'Save to favorites'}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
              {isFavorite ? 'Saved' : 'Save'}
            </button>
            <button
              onClick={handleDownload}
              className="btn-primary flex items-center gap-2 px-5 py-2.5"
              aria-label={downloaded ? 'Prompt downloaded' : 'Download prompt as markdown file'}
            >
              {downloaded ? (
                <>
                  <Check className="w-4 h-4 animate-check-pop" />
                  Downloaded!
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download
                </>
              )}
            </button>
            <button
              onClick={copyToClipboard}
              className="btn-primary flex items-center gap-2 px-5 py-2.5"
              aria-label={copied ? 'Prompt copied to clipboard' : 'Copy prompt to clipboard'}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 animate-check-pop" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Close prompt output dialog"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-8">
          {/* Blocks used indicator */}
          <div className="mb-6 p-4 bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-2xl">
            <p className="text-sm font-bold text-blue-900 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              Building Blocks Used:
            </p>
            <div className="flex flex-wrap gap-3" role="list" aria-label="TCWEI blocks used">
              {Object.entries(blocksByCategory).map(([category, blocks]) => (
                <div key={category} className="flex items-center gap-2 bg-white/60 rounded-xl px-3 py-2">
                  <span className="text-xs font-semibold text-slate-600">{category}:</span>
                  <div className="flex gap-1">
                    {blocks.map((block) => (
                      <span
                        key={block.id}
                        className="px-2 py-1 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-lg text-xs font-bold shadow-sm"
                        role="listitem"
                        title={block.title}
                      >
                        {block.id}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Reasoning (collapsible) */}
          {reasoning && (
            <div className="mb-6">
              <button
                onClick={() => setShowReasoning(!showReasoning)}
                className="flex items-center gap-2 px-4 py-3 bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 rounded-xl w-full text-left transition-all font-medium text-yellow-900"
                aria-expanded={showReasoning}
                aria-controls="reasoning-content"
              >
                <Lightbulb className="w-5 h-5 text-yellow-600" />
                <span className="flex-1">Why these blocks were selected</span>
                {showReasoning ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </button>
              {showReasoning && (
                <div
                  id="reasoning-content"
                  className="mt-3 p-4 bg-white border-2 border-yellow-200 rounded-xl text-sm text-slate-700 leading-relaxed animate-fade-in"
                >
                  {reasoning}
                </div>
              )}
            </div>
          )}

          {/* Placeholder Form (if placeholders detected) */}
          {showPlaceholderForm && (
            <div className="mb-4">
              <PlaceholderForm
                placeholders={extractPlaceholders(finalPrompt)}
                onComplete={handlePlaceholderComplete}
                onSkip={handleSkipPlaceholders}
              />
            </div>
          )}

          {/* The generated prompt */}
          {!showPlaceholderForm && (
            <>
              <div
                className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-8 prose prose-slate max-w-none border-2 border-slate-200 shadow-inner"
                role="article"
                aria-label="Generated prompt content"
              >
                <ReactMarkdown components={components}>
                  {finalPrompt}
                </ReactMarkdown>
              </div>

              {/* Placeholder tip (only if placeholders still exist) */}
              {hasPlaceholders(finalPrompt) && (
                <div className="mt-6 p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl" role="alert">
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-sm text-amber-900 font-medium">
                      <strong>💡 Next Step:</strong> Replace all{' '}
                      <span className="bg-amber-200 px-2 py-1 rounded-lg font-mono">[PLACEHOLDERS]</span> with your
                      specific details before using this prompt.
                    </p>
                    <button
                      onClick={() => setShowPlaceholderForm(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium text-sm transition-colors shadow-md whitespace-nowrap"
                      title="Open placeholder form to fill in values"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Placeholders
                    </button>
                  </div>
                </div>
              )}

              {/* Success message if no placeholders */}
              {!hasPlaceholders(finalPrompt) && (
                <div
                  className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl"
                  role="status"
                >
                  <p className="text-sm text-green-900 font-medium">
                    <strong>✅ Ready to use:</strong> Your prompt is complete and ready to copy-paste!
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

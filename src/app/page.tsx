'use client';

import { useState, useEffect, useRef } from 'react';
import { Sparkles, Copy, Check, Plus, X, User, Target, FileText, BookOpen, Settings, Shield, Code, Menu, Heart, Eye } from 'lucide-react';
import GuidedFlow from '@/components/GuidedFlow';
import PromptOutput from '@/components/PromptOutput';
import FavoritesPanel from '@/components/FavoritesPanel';
import TCWEIIntroModal from '@/components/TCWEIIntroModal';
import Tooltip from '@/components/Tooltip';
import TCWEIHelpPanel from '@/components/TCWEIHelpPanel';
import BlockViewModal from '@/components/BlockViewModal';
import { useKeyboardShortcuts, useEscapeKey } from '@/hooks/useKeyboardShortcuts';
import { getFavoritesCount } from '@/utils/favoritesManager';
import blocksData from '@/data/blocks.json';
import type { BlocksData, Block, SelectedBlock } from '@/types';

const data = blocksData as BlocksData;

// Icon mapping
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  User, Target, FileText, BookOpen, Settings, Shield, Code
};

export default function PromptLibrary() {
  const [activeCategory, setActiveCategory] = useState('writer');
  const [selected, setSelected] = useState<Record<string, SelectedBlock>>({});
  const [showOutput, setShowOutput] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState<'ai' | 'manual'>('ai');
  const [showIntroModal, setShowIntroModal] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const intentInputRef = useRef<HTMLDivElement>(null);

  // AI-generated prompt state
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [generatedBlocks, setGeneratedBlocks] = useState<Array<{ id: string; title: string; category: string }>>([]);
  const [generatedReasoning, setGeneratedReasoning] = useState<string>('');
  const [userIntent, setUserIntent] = useState<string>('');

  // Favorites state
  const [showFavorites, setShowFavorites] = useState(false);
  const [favoritesCount, setFavoritesCount] = useState(0);

  // Block viewer state
  const [viewingBlock, setViewingBlock] = useState<Block | null>(null);

  // Check if user has seen intro modal
  useEffect(() => {
    const hasSeenIntro = localStorage.getItem('hasSeenTCWEIIntro');
    if (!hasSeenIntro) {
      setShowIntroModal(true);
    }

    // Remember mode preference
    const savedMode = localStorage.getItem('promptLibraryMode') as 'ai' | 'manual';
    if (savedMode) {
      setMode(savedMode);
    }

    // Load favorites count
    setFavoritesCount(getFavoritesCount());

    // Listen for storage events (cross-tab sync)
    const handleStorageChange = () => {
      setFavoritesCount(getFavoritesCount());
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Save mode preference
  useEffect(() => {
    localStorage.setItem('promptLibraryMode', mode);
  }, [mode]);

  const handleCloseIntroModal = () => {
    setShowIntroModal(false);
    localStorage.setItem('hasSeenTCWEIIntro', 'true');
  };

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'k',
      ctrl: true,
      handler: () => {
        if (mode === 'ai') {
          // Focus on intent input
          const textarea = document.querySelector('textarea');
          textarea?.focus();
        }
      },
      description: 'Focus intent input',
    },
  ]);

  // Close modals on Escape
  useEscapeKey(() => {
    if (showOutput) {
      setShowOutput(false);
    }
  });

  const toggleItem = (categoryKey: string, item: Block) => {
    setSelected(prev => {
      const key = `${categoryKey}-${item.id}`;
      if (prev[key]) {
        const { [key]: _removed, ...rest } = prev;
        void _removed;
        return rest;
      }
      return { ...prev, [key]: { ...item, category: categoryKey } };
    });
  };

  const removeItem = (key: string) => {
    setSelected(prev => {
      const { [key]: _removed, ...rest } = prev;
      void _removed;
      return rest;
    });
  };

  const selectedItems = Object.entries(selected);
  const selectedByCategory = data.categoryOrder.reduce((acc, cat) => {
    acc[cat] = selectedItems.filter(([, v]) => v.category === cat);
    return acc;
  }, {} as Record<string, [string, SelectedBlock][]>);

  const generateManualPrompt = () => {
    const sections: string[] = [];
    const sectionHeaders: Record<string, string> = {
      writer: '## ROLE',
      task: '## TASK',
      context: '## CONTEXT',
      examples: '## EXAMPLES',
      instructions: '## OUTPUT INSTRUCTIONS',
      bestPractices: '## GUIDELINES',
      coding: '## CODING TASK'
    };

    for (const categoryKey of data.categoryOrder) {
      const items = selectedByCategory[categoryKey];
      if (items.length > 0) {
        sections.push(sectionHeaders[categoryKey] + '\n' + items.map(([, v]) => v.prompt).join('\n\n'));
      }
    }

    return sections.join('\n\n---\n\n');
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(generateManualPrompt());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const highlightPlaceholders = (text: string) => {
    return text.split(/(\[[^\]]+\])/).map((part, i) => {
      if (part.startsWith('[') && part.endsWith(']')) {
        return <span key={i} className="bg-amber-200 text-amber-900 px-1 rounded font-medium">{part}</span>;
      }
      return part;
    });
  };

  const handleAIGenerate = (prompt: string, blocks: Array<{ id: string; title: string; category: string }>, reasoning: string, intent?: string) => {
    setGeneratedPrompt(prompt);
    setGeneratedBlocks(blocks);
    setGeneratedReasoning(reasoning);
    setUserIntent(intent || '');
    setShowOutput(true);
  };

  const cat = data.categories[activeCategory];
  const IconComponent = iconMap[cat.icon] || FileText;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* TCWEI Intro Modal */}
      {showIntroModal && <TCWEIIntroModal onClose={handleCloseIntroModal} />}

      {/* Header - Redesigned with Appvantage brand */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#E8E8E8] px-4 md:px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between max-w-7xl mx-auto gap-4">
          <div className="flex items-center gap-3 md:gap-4">
            {/* Mobile menu button */}
            {mode === 'manual' && (
              <button
                onClick={() => setShowMobileSidebar(!showMobileSidebar)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Toggle categories menu"
              >
                <Menu className="w-6 h-6 text-black" />
              </button>
            )}

            <h1 className="text-xl md:text-2xl font-light text-black">
              Prompt Library
            </h1>
            <div className="hidden sm:block h-6 w-px bg-[#E8E8E8]" />
            <div className="hidden sm:block">
              <span className="text-base md:text-lg text-black font-light">Prompt Library</span>
              <p className="text-xs text-[#808080] hidden md:block">Powered by TCWEI Framework</p>
            </div>
          </div>

          {/* Mode Toggle & Actions */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Favorites Button */}
            <button
              onClick={() => {
                setShowFavorites(true);
                // Update count when opening (in case changed in current tab)
                setFavoritesCount(getFavoritesCount());
              }}
              className="relative flex items-center gap-2 px-3 md:px-4 py-2 bg-white hover:bg-gray-50 text-black rounded-lg border border-[#E8E8E8] transition-all min-h-[44px]"
              aria-label={`View favorites (${favoritesCount} saved)`}
            >
              <Heart className={`w-4 h-4 ${favoritesCount > 0 ? 'fill-current text-[#E60000]' : 'text-[#808080]'}`} />
              <span className="hidden sm:inline text-sm font-light">Favorites</span>
              {favoritesCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#E60000] text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
                  {favoritesCount > 99 ? '99+' : favoritesCount}
                </span>
              )}
            </button>

            <div className="relative flex items-center bg-gray-100 p-1 rounded-full border border-[#E8E8E8]">
              <div
                className={`absolute top-1 bottom-1 bg-[#E60000] rounded-full transition-all duration-300 ease-out ${
                  mode === 'ai' ? 'left-1 right-[50%]' : 'left-[50%] right-1'
                }`}
              />
              <button
                onClick={() => setMode('ai')}
                className={`relative z-10 px-3 md:px-6 py-2 rounded-full text-xs md:text-sm font-light transition-all min-h-[44px] ${
                  mode === 'ai' ? 'text-white' : 'text-[#808080] hover:text-black'
                }`}
                aria-label="Switch to AI Mode"
              >
                <span className="flex items-center gap-1 md:gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span className="hidden sm:inline">AI Mode</span>
                  <span className="sm:hidden">AI</span>
                  <span className="hidden lg:inline">
                    <Tooltip content="Let AI automatically select the best TCWEI blocks for your prompt based on your description" position="bottom" asSpan />
                  </span>
                </span>
              </button>
              <button
                onClick={() => setMode('manual')}
                className={`relative z-10 px-3 md:px-6 py-2 rounded-full text-xs md:text-sm font-light transition-all min-h-[44px] ${
                  mode === 'manual' ? 'text-white' : 'text-[#808080] hover:text-black'
                }`}
                aria-label="Switch to Manual Mode"
              >
                <span className="flex items-center gap-1 md:gap-2">
                  Manual
                  <span className="hidden lg:inline">
                    <Tooltip content="Browse and hand-pick TCWEI blocks yourself for maximum control" position="bottom" asSpan />
                  </span>
                </span>
              </button>
            </div>

            {mode === 'manual' && (
              <button
                onClick={() => setShowOutput(true)}
                disabled={selectedItems.length === 0}
                className="btn-primary flex items-center gap-2 px-3 md:px-5 py-2.5 text-xs md:text-sm min-h-[44px]"
                aria-label="Create prompt from selected blocks"
              >
                <Sparkles className="w-4 h-4" />
                <span className="hidden sm:inline">Create Prompt</span>
                <span className="sm:hidden">Create</span>
                {selectedItems.length > 0 && (
                  <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs md:text-sm font-bold">
                    {selectedItems.length}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* AI Mode - Guided Flow */}
      {mode === 'ai' && (
        <div className="max-w-3xl mx-auto w-full px-4 py-8">
          <GuidedFlow onComplete={handleAIGenerate} />

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              Or switch to <button onClick={() => setMode('manual')} className="text-[#E60000] hover:underline font-light">Manual Mode</button> to select blocks yourself
            </p>
          </div>
        </div>
      )}

      {/* Manual Mode - Block Browser */}
      {mode === 'manual' && (
        <div className="flex-1 flex max-w-7xl mx-auto w-full relative">
          {/* Mobile sidebar overlay */}
          {showMobileSidebar && (
            <div
              className="lg:hidden fixed inset-0 bg-black/50 z-30"
              onClick={() => setShowMobileSidebar(false)}
              aria-label="Close menu overlay"
            />
          )}

          {/* Sidebar - Categories */}
          <nav
            className={`fixed lg:static top-0 left-0 h-full lg:h-auto w-64 lg:w-56 bg-white border-r border-[#E8E8E8] p-3 space-y-1 z-40 transition-transform duration-300 lg:translate-x-0 ${
              showMobileSidebar ? 'translate-x-0' : '-translate-x-full'
            }`}
            role="navigation"
            aria-label="TCWEI categories"
          >
            {data.categoryOrder.map(key => {
              const c = data.categories[key];
              const CIcon = iconMap[c.icon] || FileText;
              const count = selectedItems.filter(([, v]) => v.category === key).length;
              const isActive = activeCategory === key;
              return (
                <button
                  key={key}
                  onClick={() => {
                    setActiveCategory(key);
                    setShowMobileSidebar(false); // Close mobile menu on selection
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left min-h-[44px] ${
                    isActive
                      ? c.color + ' text-white shadow-lg'
                      : 'hover:bg-gray-50 text-black'
                  }`}
                >
                  <CIcon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1 font-light text-sm">{c.label}</span>
                  {count > 0 && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20' : 'bg-[#E60000]/10 text-[#E60000]'}`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Main Content */}
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            {/* TCWEI Help Panel */}
            <TCWEIHelpPanel />

            {/* Category Header */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 rounded-xl ${cat.color} flex items-center justify-center shadow-lg`}>
                  <IconComponent className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-light text-black">{cat.label}</h2>
                    <Tooltip content={`${cat.description} - Part of the TCWEI framework`} position="right" />
                  </div>
                  <p className="text-sm text-[#808080]">{cat.description}</p>
                </div>
              </div>
            </div>

            {/* Items Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {cat.items.map(item => {
                const isSelected = selected[`${activeCategory}-${item.id}`];
                return (
                  <div key={item.id} className="flex items-start gap-2">
                    {/* Selection button */}
                    <button
                      onClick={() => toggleItem(activeCategory, item)}
                      className={`flex-1 text-left p-4 rounded-xl border-2 transition-all ${
                        isSelected
                          ? 'border-[#E60000]/60 bg-[#E60000]/5 shadow-lg shadow-[#E60000]/10'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          isSelected ? 'bg-[#E60000]' : 'bg-slate-200'
                        }`}>
                          {isSelected ? (
                            <Check className="w-4 h-4 text-white" />
                          ) : (
                            <Plus className="w-4 h-4 text-slate-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-mono text-slate-400">{item.id}</span>
                            <h3 className="font-light text-black">{item.title}</h3>
                          </div>
                          <p className="text-sm text-[#808080] line-clamp-2">{item.prompt.substring(0, 120)}...</p>
                        </div>
                      </div>
                    </button>

                    {/* View button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setViewingBlock(item);
                      }}
                      className="p-4 rounded-xl border-2 border-slate-200 bg-white hover:border-[#E60000] hover:bg-[#E60000]/5 transition-all"
                      aria-label="View full content"
                      title="View full block content"
                    >
                      <Eye className="w-5 h-5 text-slate-400" />
                    </button>
                  </div>
                );
              })}
            </div>
          </main>

          {/* Selected Items Panel */}
          {selectedItems.length > 0 && (
            <aside className="hidden xl:block w-72 bg-white border-l border-[#E8E8E8] p-4 overflow-auto">
              <h3 className="font-light text-black mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#E60000] text-white text-xs flex items-center justify-center">
                  {selectedItems.length}
                </span>
                Selected Blocks
              </h3>
              <div className="space-y-2">
                {data.categoryOrder.map(catKey => {
                  const items = selectedByCategory[catKey];
                  if (items.length === 0) return null;
                  return (
                    <div key={catKey}>
                      <p className="text-xs font-light text-[#808080] uppercase tracking-wider mb-1">
                        {data.categories[catKey].label}
                      </p>
                      {items.map(([key, item]) => (
                        <div key={key} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg mb-1 group">
                          <span className="text-xs font-mono text-slate-400">{item.id}</span>
                          <span className="flex-1 text-sm text-slate-700 truncate">{item.title}</span>
                          <button
                            onClick={() => removeItem(key)}
                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </aside>
          )}
        </div>
      )}

      {/* Output Modal */}
      {showOutput && mode === 'ai' && generatedPrompt && (
        <PromptOutput
          prompt={generatedPrompt}
          selectedBlocks={generatedBlocks}
          reasoning={generatedReasoning}
          userIntent={userIntent}
          onClose={() => {
            setShowOutput(false);
            // Refresh favorites count in case prompt was saved
            setFavoritesCount(getFavoritesCount());
          }}
        />
      )}

      {/* Favorites Panel */}
      {showFavorites && (
        <FavoritesPanel
          onClose={() => {
            setShowFavorites(false);
            // Refresh count after closing panel (in case favorites were deleted)
            setFavoritesCount(getFavoritesCount());
          }}
        />
      )}

      {/* Manual mode output modal */}
      {showOutput && mode === 'manual' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-[#E8E8E8] flex items-center justify-between">
              <h2 className="font-light text-lg text-black">Your Generated Prompt</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-4 py-2 bg-[#E60000] text-white rounded-lg font-light hover:shadow-lg transition-all"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={() => setShowOutput(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-6">
              <div className="prose prose-slate max-w-none">
                <div className="bg-gray-50 rounded-xl p-4 font-mono text-sm whitespace-pre-wrap leading-relaxed">
                  {generateManualPrompt().split('\n').map((line, i) => (
                    <div key={i}>{highlightPlaceholders(line) || '\u00A0'}</div>
                  ))}
                </div>
              </div>
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  <strong>💡 Tip:</strong> Replace all <span className="bg-amber-200 px-1 rounded">[PLACEHOLDERS]</span> with your specific details before using this prompt.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Block View Modal */}
      <BlockViewModal
        block={viewingBlock}
        isOpen={!!viewingBlock}
        onClose={() => setViewingBlock(null)}
        onToggleSelection={() => {
          if (viewingBlock) {
            toggleItem(activeCategory, viewingBlock);
          }
        }}
        isSelected={viewingBlock ? !!selected[`${activeCategory}-${viewingBlock.id}`] : false}
        categoryLabel={data.categories[activeCategory]?.label}
      />
    </div>
  );
}

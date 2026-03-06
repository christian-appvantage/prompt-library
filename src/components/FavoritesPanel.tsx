/**
 * FavoritesPanel - Modal component for managing saved favorite prompts
 */

'use client';

import { useState, useEffect } from 'react';
import { Heart, Search, Download, Copy, Trash2, X, Check, FileDown, Edit2 } from 'lucide-react';
import {
  loadFavorites,
  removeFavorite,
  updateFavorite,
  getFavoritesCount,
  exportFavoritesAsJSON,
} from '@/utils/favoritesManager';
import { downloadPrompt } from '@/utils/downloadPrompt';
import type { FavoritePrompt } from '@/types';

interface FavoritesPanelProps {
  onClose: () => void;
}

export default function FavoritesPanel({ onClose }: FavoritesPanelProps) {
  const [favorites, setFavorites] = useState<FavoritePrompt[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [downloadedId, setDownloadedId] = useState<string | null>(null);

  // Load favorites on mount
  useEffect(() => {
    setFavorites(loadFavorites());
  }, []);

  // Filter favorites based on search query
  const filteredFavorites = favorites.filter((fav) => {
    const query = searchQuery.toLowerCase();
    const matchesName = fav.name?.toLowerCase().includes(query);
    const matchesIntent = fav.userIntent?.toLowerCase().includes(query);
    const matchesContent = fav.prompt.toLowerCase().includes(query);
    const matchesTags = fav.tags?.some((tag) => tag.toLowerCase().includes(query));
    return matchesName || matchesIntent || matchesContent || matchesTags;
  });

  // Handle copy to clipboard
  const handleCopy = async (favorite: FavoritePrompt) => {
    try {
      await navigator.clipboard.writeText(favorite.prompt);
      setCopiedId(favorite.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      alert('Failed to copy prompt to clipboard');
    }
  };

  // Handle download as markdown
  const handleDownload = (favorite: FavoritePrompt) => {
    try {
      downloadPrompt(
        {
          prompt: favorite.prompt,
          selectedBlocks: favorite.selectedBlocks,
          reasoning: favorite.reasoning,
          userIntent: favorite.userIntent,
        },
        favorite.name || favorite.userIntent
      );
      setDownloadedId(favorite.id);
      setTimeout(() => setDownloadedId(null), 2000);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download prompt');
    }
  };

  // Handle delete favorite
  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this favorite?')) {
      removeFavorite(id);
      setFavorites(loadFavorites());
    }
  };

  // Handle start editing name
  const handleStartEdit = (favorite: FavoritePrompt) => {
    setEditingId(favorite.id);
    setEditingName(favorite.name || favorite.userIntent || 'Untitled Prompt');
  };

  // Handle save edited name
  const handleSaveEdit = (id: string) => {
    if (editingName.trim()) {
      updateFavorite(id, { name: editingName.trim() });
      setFavorites(loadFavorites());
    }
    setEditingId(null);
    setEditingName('');
  };

  // Handle cancel editing
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  // Handle export all favorites
  const handleExportAll = () => {
    try {
      const jsonContent = exportFavoritesAsJSON();
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `prompt-library-favorites-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export favorites');
    }
  };

  // Format date for display
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl border border-[#E8E8E8] w-full max-w-4xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#E8E8E8]">
          <div className="flex items-center gap-3">
            <Heart className="w-6 h-6 text-[#E60000] fill-current" />
            <h2 className="text-2xl font-light text-black">
              Favorites
              <span className="ml-2 text-sm font-light text-[#808080]">
                ({filteredFavorites.length} {filteredFavorites.length === 1 ? 'prompt' : 'prompts'})
              </span>
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {favorites.length > 0 && (
              <button
                onClick={handleExportAll}
                className="flex items-center gap-2 px-4 py-2 bg-[#E60000]/10 hover:bg-[#E60000]/20 text-[#E60000] rounded-lg transition-all font-light"
                title="Export all favorites as JSON"
              >
                <FileDown className="w-4 h-4" />
                Export All
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-[#808080] hover:text-black"
              aria-label="Close favorites panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {favorites.length > 0 && (
          <div className="p-4 border-b border-[#E8E8E8]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#a5a9ab]" />
              <input
                type="text"
                placeholder="Search by name, content, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-[#E8E8E8] rounded-lg text-black placeholder-[#a5a9ab] focus:outline-none focus:border-[#E60000] focus:ring-2 focus:ring-[#E60000]/20 transition-all"
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredFavorites.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <Heart className="w-16 h-16 text-[#E8E8E8] mb-4" />
              <h3 className="text-xl font-light text-black mb-2">
                {searchQuery ? 'No matching favorites' : 'No favorites yet'}
              </h3>
              <p className="text-[#808080] max-w-md font-light">
                {searchQuery
                  ? 'Try adjusting your search query'
                  : 'Generate a prompt and click the Save button to add it to your favorites'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFavorites.map((favorite) => (
                <div
                  key={favorite.id}
                  className="bg-gray-50 rounded-xl p-5 border border-[#E8E8E8] hover:border-[#E60000]/30 transition-all"
                >
                  {/* Title with inline editing */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      {editingId === favorite.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveEdit(favorite.id);
                              if (e.key === 'Escape') handleCancelEdit();
                            }}
                            className="flex-1 px-3 py-1.5 bg-white border border-[#E60000]/50 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#E60000]/20"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveEdit(favorite.id)}
                            className="p-1.5 bg-[#E60000]/10 hover:bg-[#E60000]/20 text-[#E60000] rounded transition-colors"
                            title="Save"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="p-1.5 bg-gray-100 hover:bg-gray-200 text-[#808080] rounded transition-colors"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-light text-black">
                            {favorite.name || favorite.userIntent || 'Untitled Prompt'}
                          </h3>
                          <button
                            onClick={() => handleStartEdit(favorite)}
                            className="p-1 hover:bg-gray-200 rounded text-[#a5a9ab] hover:text-black transition-colors"
                            title="Edit name"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center gap-4 text-sm text-[#808080] mb-3">
                    <span>Created: {formatDate(favorite.createdAt)}</span>
                    <span>•</span>
                    <span>{favorite.selectedBlocks.length} blocks</span>
                    {favorite.tags && favorite.tags.length > 0 && (
                      <>
                        <span>•</span>
                        <div className="flex gap-1">
                          {favorite.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 bg-[#E60000]/10 text-[#E60000] rounded text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Preview */}
                  <p className="text-[#595959] text-sm mb-3 line-clamp-3 font-light">
                    {favorite.prompt.length > 200
                      ? favorite.prompt.substring(0, 200) + '...'
                      : favorite.prompt}
                  </p>

                  {/* Block badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {favorite.selectedBlocks.map((block) => (
                      <span
                        key={block.id}
                        className="px-2 py-1 bg-white text-[#595959] rounded text-xs border border-[#E8E8E8]"
                        title={block.categoryLabel || block.category}
                      >
                        {block.id}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(favorite)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-[#E60000]/10 hover:bg-[#E60000]/20 text-[#E60000] rounded-lg transition-all text-sm font-light"
                    >
                      {copiedId === favorite.id ? (
                        <>
                          <Check className="w-4 h-4" />
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
                      onClick={() => handleDownload(favorite)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-[#595959] rounded-lg transition-all text-sm font-light"
                    >
                      {downloadedId === favorite.id ? (
                        <>
                          <Check className="w-4 h-4" />
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
                      onClick={() => handleDelete(favorite.id)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-all text-sm font-light ml-auto"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

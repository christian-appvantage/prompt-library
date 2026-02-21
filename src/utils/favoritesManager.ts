/**
 * Utility for managing favorite prompts in localStorage
 */

import type { FavoritePrompt, FavoritesStorage } from '@/types';

const STORAGE_KEY = 'prompt-library-favorites';
const STORAGE_VERSION = 1;
const MAX_FAVORITES = 100; // Prevent localStorage quota issues

/**
 * Check if localStorage is available
 */
function isLocalStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    console.warn('localStorage unavailable:', e);
    return false;
  }
}

/**
 * Load favorites from localStorage
 */
export function loadFavorites(): FavoritePrompt[] {
  if (!isLocalStorageAvailable()) {
    return [];
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as FavoritesStorage;

    // Version compatibility check
    if (parsed.version !== STORAGE_VERSION) {
      console.warn('Incompatible favorites version, resetting...');
      return [];
    }

    return parsed.favorites || [];
  } catch (e) {
    console.error('Failed to load favorites:', e);
    return [];
  }
}

/**
 * Save favorites to localStorage
 */
function saveFavorites(favorites: FavoritePrompt[]): void {
  if (!isLocalStorageAvailable()) {
    throw new Error('localStorage is not available');
  }

  try {
    const storage: FavoritesStorage = {
      version: STORAGE_VERSION,
      favorites,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
  } catch (e) {
    if (e instanceof Error && e.name === 'QuotaExceededError') {
      throw new Error(
        'Storage quota exceeded. Please delete some favorites.'
      );
    }
    throw new Error('Failed to save favorites');
  }
}

/**
 * Add a prompt to favorites
 */
export function addToFavorites(
  prompt: Omit<FavoritePrompt, 'id' | 'createdAt' | 'lastModified'>
): FavoritePrompt {
  const favorites = loadFavorites();

  // Check quota
  if (favorites.length >= MAX_FAVORITES) {
    throw new Error(
      `Maximum ${MAX_FAVORITES} favorites reached. Please delete some to add more.`
    );
  }

  const now = Date.now();
  const newFavorite: FavoritePrompt = {
    ...prompt,
    id: `fav-${now}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: now,
    lastModified: now,
  };

  const updated = [newFavorite, ...favorites]; // Add to beginning
  saveFavorites(updated);

  return newFavorite;
}

/**
 * Remove a favorite by ID
 */
export function removeFavorite(id: string): void {
  const favorites = loadFavorites();
  const filtered = favorites.filter((f) => f.id !== id);
  saveFavorites(filtered);
}

/**
 * Update a favorite (name, tags)
 */
export function updateFavorite(
  id: string,
  updates: Partial<Pick<FavoritePrompt, 'name' | 'tags'>>
): void {
  const favorites = loadFavorites();
  const index = favorites.findIndex((f) => f.id === id);

  if (index === -1) {
    throw new Error('Favorite not found');
  }

  favorites[index] = {
    ...favorites[index],
    ...updates,
    lastModified: Date.now(),
  };

  saveFavorites(favorites);
}

/**
 * Get a single favorite by ID
 */
export function getFavorite(id: string): FavoritePrompt | null {
  const favorites = loadFavorites();
  return favorites.find((f) => f.id === id) || null;
}

/**
 * Check if a prompt is already favorited (by content hash or ID)
 */
export function isFavorited(promptText: string): boolean {
  const favorites = loadFavorites();
  // Simple content-based check (could improve with hash)
  return favorites.some((f) => f.prompt === promptText);
}

/**
 * Clear all favorites
 */
export function clearAllFavorites(): void {
  if (!isLocalStorageAvailable()) {
    return;
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear favorites:', e);
  }
}

/**
 * Export favorites as JSON
 */
export function exportFavoritesAsJSON(): string {
  const favorites = loadFavorites();
  return JSON.stringify(
    { favorites, exportedAt: new Date().toISOString() },
    null,
    2
  );
}

/**
 * Get favorites count
 */
export function getFavoritesCount(): number {
  return loadFavorites().length;
}

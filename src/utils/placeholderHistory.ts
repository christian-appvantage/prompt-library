/**
 * Utility for managing placeholder value history using localStorage
 */

const STORAGE_KEY = 'prompt-library-placeholder-history';
const MAX_HISTORY_PER_KEY = 5;
const STORAGE_VERSION = 1;

interface PlaceholderHistoryEntry {
  values: string[];      // Max 5 recent values
  lastUsed: number;      // Timestamp
  useCount: number;      // Frequency
}

interface PlaceholderHistoryStorage {
  version: number;
  data: {
    [placeholderKey: string]: PlaceholderHistoryEntry;
  };
}

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
 * Load history data from localStorage
 */
function loadHistory(): PlaceholderHistoryStorage {
  if (!isLocalStorageAvailable()) {
    return { version: STORAGE_VERSION, data: {} };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { version: STORAGE_VERSION, data: {} };
    }

    const parsed = JSON.parse(raw) as PlaceholderHistoryStorage;

    // Check version compatibility
    if (parsed.version !== STORAGE_VERSION) {
      console.warn('Incompatible history version, resetting...');
      return { version: STORAGE_VERSION, data: {} };
    }

    return parsed;
  } catch (e) {
    console.error('Failed to load history:', e);
    return { version: STORAGE_VERSION, data: {} };
  }
}

/**
 * Save history data to localStorage
 */
function saveHistory(storage: PlaceholderHistoryStorage): void {
  if (!isLocalStorageAvailable()) {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
  } catch (e) {
    console.error('Failed to save history:', e);
  }
}

/**
 * Get history values for a specific placeholder key
 */
export function getHistory(key: string): string[] {
  const storage = loadHistory();
  const entry = storage.data[key];

  if (!entry) {
    return [];
  }

  return entry.values;
}

/**
 * Save a value to history for a specific placeholder key
 */
export function saveToHistory(key: string, value: string): void {
  if (!value || !value.trim()) {
    return; // Skip empty values
  }

  const storage = loadHistory();
  const entry = storage.data[key] || {
    values: [],
    lastUsed: Date.now(),
    useCount: 0
  };

  // Remove duplicate if exists
  const filteredValues = entry.values.filter(v => v !== value);

  // Add to front (most recent)
  const newValues = [value, ...filteredValues].slice(0, MAX_HISTORY_PER_KEY);

  storage.data[key] = {
    values: newValues,
    lastUsed: Date.now(),
    useCount: entry.useCount + 1
  };

  saveHistory(storage);
}

/**
 * Clear history for a specific key or all keys
 */
export function clearHistory(key?: string): void {
  if (key) {
    const storage = loadHistory();
    delete storage.data[key];
    saveHistory(storage);
  } else {
    // Clear all history
    if (isLocalStorageAvailable()) {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {
        console.error('Failed to clear history:', e);
      }
    }
  }
}

/**
 * Get combined suggestions (examples + history)
 * Returns unique values with history first, then examples
 */
export function getCombinedSuggestions(key: string, examples: string[]): string[] {
  const history = getHistory(key);
  const combined = [...history];

  // Add examples that aren't already in history
  for (const example of examples) {
    if (!combined.includes(example)) {
      combined.push(example);
    }
  }

  return combined;
}

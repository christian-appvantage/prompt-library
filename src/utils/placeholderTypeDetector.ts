/**
 * Utility for detecting appropriate input types based on placeholder patterns
 */

import type { Placeholder } from './placeholderParser';

export type InputType = 'text' | 'select' | 'chips' | 'date' | 'number';

export interface DetectedInputType {
  type: InputType;
  options?: string[]; // For select type
}

/**
 * Detect the most appropriate input type for a placeholder
 */
export function detectInputType(placeholder: Placeholder): DetectedInputType {
  // Priority 1: Check if placeholder has examples → 'chips'
  if (placeholder.examples.length > 0) {
    return { type: 'chips' };
  }

  // Priority 2: Check key name for options pattern: "LEVEL: option1/option2/option3"
  if (placeholder.key.includes(':')) {
    const parts = placeholder.key.split(':');
    if (parts.length === 2) {
      const optionsText = parts[1].trim();
      const options = optionsText
        .split('/')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      if (options.length > 0) {
        return { type: 'select', options };
      }
    }
  }

  // Priority 3: Check for date-related keywords
  if (/DATE|DEADLINE|TIMEFRAME|SCHEDULE|DUE/i.test(placeholder.key)) {
    return { type: 'date' };
  }

  // Priority 4: Check for number-related keywords
  if (/NUMBER|COUNT|QUANTITY|WORDS|PARAGRAPHS|AMOUNT|SIZE|LENGTH/i.test(placeholder.key)) {
    return { type: 'number' };
  }

  // Default: text input
  return { type: 'text' };
}

/**
 * Extract the clean key name (without options suffix)
 */
export function getCleanKey(key: string): string {
  if (key.includes(':')) {
    return key.split(':')[0].trim();
  }
  return key;
}

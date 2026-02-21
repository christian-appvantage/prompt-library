/**
 * Utility for detecting and parsing placeholders in generated prompts
 * Pattern: [PLACEHOLDER_NAME, e.g., "example1", "example2", "example3"]
 */

export interface Placeholder {
  key: string;              // e.g., "FEATURE_DESCRIPTION"
  examples: string[];       // e.g., ["user auth", "dark mode"]
  fullMatch: string;        // Original matched text for replacement
}

/**
 * Extract all placeholders from a prompt text
 */
export function extractPlaceholders(prompt: string): Placeholder[] {
  const placeholders: Placeholder[] = [];

  // Pattern: [PLACEHOLDER_NAME, e.g., "example1", "example2", ...]
  // Matches: [TEXT, e.g., "..."] or [TEXT]
  const regex = /\[([A-Z_][A-Z0-9_/\s]*?)(?:,\s*e\.g\.,\s*([^\]]+))?\]/g;

  let match;
  const seen = new Set<string>();

  while ((match = regex.exec(prompt)) !== null) {
    const fullMatch = match[0];
    const key = match[1].trim();
    const examplesText = match[2] || '';

    // Skip if we've already seen this placeholder key
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);

    // Parse examples from comma-separated quoted strings
    const examples: string[] = [];
    if (examplesText) {
      // Extract quoted strings: "example1", "example2"
      const exampleMatches = examplesText.matchAll(/"([^"]+)"/g);
      for (const exMatch of exampleMatches) {
        examples.push(exMatch[1]);
      }
    }

    placeholders.push({
      key,
      examples,
      fullMatch
    });
  }

  return placeholders;
}

/**
 * Replace placeholders in prompt with user-provided values
 */
export function replacePlaceholders(
  prompt: string,
  values: Record<string, string>
): string {
  let result = prompt;

  // For each placeholder key, replace ALL occurrences
  Object.entries(values).forEach(([key, value]) => {
    if (!value.trim()) {
      return; // Skip empty values
    }

    // Match: [KEY, e.g., "..."] or [KEY]
    const regex = new RegExp(
      `\\[${key.replace(/[/\s]/g, '[/\\\\s]')}(?:,\\s*e\\.g\\.,\\s*[^\\]]+)?\\]`,
      'g'
    );

    result = result.replace(regex, value);
  });

  return result;
}

/**
 * Count remaining placeholders in a prompt
 */
export function countPlaceholders(prompt: string): number {
  return extractPlaceholders(prompt).length;
}

/**
 * Check if prompt has any placeholders
 */
export function hasPlaceholders(prompt: string): boolean {
  return countPlaceholders(prompt) > 0;
}

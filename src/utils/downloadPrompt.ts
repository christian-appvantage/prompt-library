/**
 * Utility for downloading generated prompts as markdown files
 */

export interface PromptMetadata {
  prompt: string;
  selectedBlocks: Array<{
    id: string;
    title: string;
    category: string;
    categoryLabel?: string;
  }>;
  reasoning?: string;
  userIntent?: string;
}

/**
 * Generate markdown content with metadata header
 */
export function generateMarkdownContent(metadata: PromptMetadata): string {
  const { prompt, selectedBlocks, reasoning, userIntent } = metadata;

  // Generate metadata header
  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Group blocks by category
  const blocksByCategory = selectedBlocks.reduce(
    (acc, block) => {
      const cat = block.categoryLabel || block.category;
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(block.id);
      return acc;
    },
    {} as Record<string, string[]>
  );

  let markdown = '---\n';
  markdown += `Generated: ${date}\n`;
  markdown += `Framework: TCWEI\n`;
  markdown += `Blocks Used: ${selectedBlocks.length}\n`;

  // Add blocks by category
  Object.entries(blocksByCategory).forEach(([category, ids]) => {
    markdown += `  - ${category}: ${ids.join(', ')}\n`;
  });

  if (userIntent) {
    markdown += `Original Intent: "${userIntent}"\n`;
  }

  markdown += '---\n\n';

  // Add reasoning if available
  if (reasoning) {
    markdown += '## AI Reasoning\n\n';
    markdown += reasoning + '\n\n';
    markdown += '---\n\n';
  }

  // Add the actual prompt
  markdown += prompt;

  return markdown;
}

/**
 * Sanitize filename by removing invalid characters
 */
export function sanitizeFilename(
  text: string,
  maxLength: number = 50
): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, maxLength);
}

/**
 * Generate filename from intent or use timestamp
 */
export function generateFilename(userIntent?: string): string {
  const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  if (userIntent && userIntent.trim()) {
    const sanitized = sanitizeFilename(userIntent);
    return `prompt-${sanitized}-${timestamp}.md`;
  }

  const timeStr = new Date().getTime();
  return `prompt-${timestamp}-${timeStr}.md`;
}

/**
 * Download text content as a file
 */
export function downloadTextAsFile(content: string, filename: string): void {
  try {
    // Create blob with UTF-8 encoding
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });

    // Create temporary download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;

    // Trigger download
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Download failed:', error);
    throw new Error('Failed to download file. Please try again.');
  }
}

/**
 * Main download function - combines all steps
 */
export function downloadPrompt(
  metadata: PromptMetadata,
  userIntent?: string
): void {
  const content = generateMarkdownContent(metadata);
  const filename = generateFilename(userIntent);
  downloadTextAsFile(content, filename);
}

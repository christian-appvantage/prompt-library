import blocksData from '@/data/blocks.json';
import type { BlocksData, Categories, Category, Block } from '@/types';

// Type assertion for the imported JSON
const data = blocksData as BlocksData;

export function getCategories(): Categories {
  return data.categories;
}

export function getCategoryOrder(): string[] {
  return data.categoryOrder;
}

export function getCategory(key: string): Category | undefined {
  return data.categories[key];
}

export function getAllBlocks(): Block[] {
  const allBlocks: Block[] = [];
  for (const categoryKey of data.categoryOrder) {
    const category = data.categories[categoryKey];
    if (category) {
      allBlocks.push(...category.items);
    }
  }
  return allBlocks;
}

export function getBlockById(id: string): { block: Block; category: string } | undefined {
  for (const [categoryKey, category] of Object.entries(data.categories)) {
    const block = category.items.find(item => item.id === id);
    if (block) {
      return { block, category: categoryKey };
    }
  }
  return undefined;
}

export function getBlocksForLLMContext(): string {
  const lines: string[] = [];

  for (const categoryKey of data.categoryOrder) {
    const category = data.categories[categoryKey];
    if (category) {
      lines.push(`\n## ${category.label.toUpperCase()} (${category.description})`);
      for (const item of category.items) {
        lines.push(`- ${item.id}: ${item.title}`);
        lines.push(`  "${item.prompt}"`);
      }
    }
  }

  return lines.join('\n');
}

export function getCategoryLabel(key: string): string {
  const category = data.categories[key];
  return category?.label || key;
}

export function getSectionHeader(categoryKey: string): string {
  const headers: Record<string, string> = {
    writer: '## ROLE',
    task: '## TASK',
    context: '## CONTEXT',
    examples: '## EXAMPLES',
    instructions: '## OUTPUT INSTRUCTIONS',
    bestPractices: '## GUIDELINES',
    coding: '## CODING TASK'
  };
  return headers[categoryKey] || `## ${categoryKey.toUpperCase()}`;
}

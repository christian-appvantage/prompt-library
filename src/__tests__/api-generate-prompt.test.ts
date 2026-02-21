/**
 * Unit Tests for the Prompt Generation API
 * Tests the /api/generate-prompt endpoint
 */

import { getBlocksForLLMContext, getBlockById, getSectionHeader } from '@/lib/blocks';

// Test the blocks utility functions first
describe('Blocks Utility Functions', () => {
  describe('getBlocksForLLMContext', () => {
    it('should return a non-empty string with all blocks', () => {
      const context = getBlocksForLLMContext();
      expect(context).toBeTruthy();
      expect(typeof context).toBe('string');
      expect(context.length).toBeGreaterThan(100);
    });

    it('should include all category headers', () => {
      const context = getBlocksForLLMContext();
      expect(context).toContain('WRITER');
      expect(context).toContain('TASK');
      expect(context).toContain('CONTEXT');
      expect(context).toContain('EXAMPLES');
      expect(context).toContain('INSTRUCTIONS');
      expect(context).toContain('BEST PRACTICES');
      expect(context).toContain('CODING');
    });

    it('should include block IDs in correct format', () => {
      const context = getBlocksForLLMContext();
      expect(context).toContain('W-01');
      expect(context).toContain('T-01');
      expect(context).toContain('C-01');
      expect(context).toContain('BP-01');
      expect(context).toContain('CD-01');
    });
  });

  describe('getBlockById', () => {
    it('should find a valid block by ID', () => {
      const result = getBlockById('W-01');
      expect(result).toBeDefined();
      expect(result?.block.id).toBe('W-01');
      expect(result?.block.title).toBe('AI Strategist');
      expect(result?.category).toBe('writer');
    });

    it('should return undefined for invalid ID', () => {
      const result = getBlockById('INVALID-99');
      expect(result).toBeUndefined();
    });

    it('should find blocks from different categories', () => {
      const writerBlock = getBlockById('W-05');
      expect(writerBlock?.category).toBe('writer');

      const taskBlock = getBlockById('T-03');
      expect(taskBlock?.category).toBe('task');

      const codingBlock = getBlockById('CD-10');
      expect(codingBlock?.category).toBe('coding');
    });
  });

  describe('getSectionHeader', () => {
    it('should return correct header for writer', () => {
      expect(getSectionHeader('writer')).toBe('## ROLE');
    });

    it('should return correct header for task', () => {
      expect(getSectionHeader('task')).toBe('## TASK');
    });

    it('should return correct header for bestPractices', () => {
      expect(getSectionHeader('bestPractices')).toBe('## GUIDELINES');
    });

    it('should return uppercase fallback for unknown category', () => {
      const header = getSectionHeader('unknownCategory');
      expect(header).toBe('## UNKNOWNCATEGORY');
    });
  });
});

// Test API request validation
describe('API Request Validation', () => {
  // Helper function that mirrors the actual API validation logic
  const isValidUserIntent = (userIntent: unknown): boolean => {
    return Boolean(userIntent && typeof userIntent === 'string' && userIntent.trim() !== '');
  };

  it('should reject empty userIntent', async () => {
    const mockRequest = {
      json: jest.fn().mockResolvedValue({ userIntent: '' }),
    };

    const { userIntent } = await mockRequest.json();
    expect(isValidUserIntent(userIntent)).toBe(false);
  });

  it('should reject null userIntent', async () => {
    const mockRequest = {
      json: jest.fn().mockResolvedValue({ userIntent: null }),
    };

    const { userIntent } = await mockRequest.json();
    expect(isValidUserIntent(userIntent)).toBe(false);
  });

  it('should reject whitespace-only userIntent', async () => {
    const mockRequest = {
      json: jest.fn().mockResolvedValue({ userIntent: '   ' }),
    };

    const { userIntent } = await mockRequest.json();
    expect(isValidUserIntent(userIntent)).toBe(false);
  });

  it('should accept valid userIntent', async () => {
    const mockRequest = {
      json: jest.fn().mockResolvedValue({ userIntent: 'Help me write an email' }),
    };

    const { userIntent } = await mockRequest.json();
    expect(isValidUserIntent(userIntent)).toBe(true);
  });
});

// Test JSON parsing logic
describe('LLM Response Parsing', () => {
  it('should extract valid JSON from response', () => {
    const response = `Here is the prompt:
{
  "selectedBlocks": ["W-01", "T-06"],
  "reasoning": "Selected email writer",
  "assembledPrompt": "## ROLE\\nYou are..."
}`;

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    expect(jsonMatch).not.toBeNull();

    const parsed = JSON.parse(jsonMatch![0]);
    expect(parsed.selectedBlocks).toEqual(['W-01', 'T-06']);
    expect(parsed.reasoning).toBe('Selected email writer');
  });

  it('should handle pure JSON response', () => {
    const response = `{"selectedBlocks":["W-01"],"reasoning":"test","assembledPrompt":"prompt"}`;

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    expect(jsonMatch).not.toBeNull();

    const parsed = JSON.parse(jsonMatch![0]);
    expect(parsed.selectedBlocks).toEqual(['W-01']);
  });

  it('should fail gracefully on invalid JSON', () => {
    const response = 'This is not JSON at all';

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    expect(jsonMatch).toBeNull();
  });

  it('should handle malformed JSON', () => {
    const response = '{ "selectedBlocks": ["W-01", }';

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    expect(jsonMatch).not.toBeNull();

    expect(() => JSON.parse(jsonMatch![0])).toThrow();
  });
});

// Test block enrichment logic
describe('Block Enrichment', () => {
  it('should enrich valid block IDs with metadata', () => {
    const selectedBlockIds = ['W-01', 'T-06', 'BP-01'];

    const enrichedBlocks = selectedBlockIds.map((id) => {
      const blockInfo = getBlockById(id);
      return blockInfo ? {
        id,
        title: blockInfo.block.title,
        category: blockInfo.category,
        categoryLabel: getSectionHeader(blockInfo.category).replace('## ', '')
      } : null;
    }).filter(Boolean);

    expect(enrichedBlocks).toHaveLength(3);
    expect(enrichedBlocks[0]).toEqual({
      id: 'W-01',
      title: 'AI Strategist',
      category: 'writer',
      categoryLabel: 'ROLE'
    });
  });

  it('should filter out invalid block IDs', () => {
    const selectedBlockIds = ['W-01', 'INVALID-99', 'T-01'];

    const enrichedBlocks = selectedBlockIds.map((id) => {
      const blockInfo = getBlockById(id);
      return blockInfo ? {
        id,
        title: blockInfo.block.title,
        category: blockInfo.category,
      } : null;
    }).filter(Boolean);

    expect(enrichedBlocks).toHaveLength(2);
  });
});

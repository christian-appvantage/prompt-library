// Building Block Types for the Prompt Library

export interface Block {
  id: string;
  title: string;
  prompt: string;
}

export interface Category {
  label: string;
  description: string;
  icon: string;
  color: string;
  items: Block[];
}

export interface Categories {
  [key: string]: Category;
}

export interface BlocksData {
  categories: Categories;
  categoryOrder: string[];
}

// Selected block with category context
export interface SelectedBlock extends Block {
  category: string;
}

// API Request/Response types
export interface GeneratePromptRequest {
  userIntent: string;
}

export interface GeneratePromptResponse {
  prompt: string;
  selectedBlocks: {
    id: string;
    title: string;
    category: string;
  }[];
  reasoning?: string;
}

// Voice input state
export interface VoiceInputState {
  isListening: boolean;
  transcript: string;
  error: string | null;
}

// Guided flow types
export type FlowStep = 'input' | 'evaluating' | 'clarifying' | 'generating' | 'result';

export interface ClarifyingQuestion {
  id: number;
  text: string;
  hint: string;
  category: string;
  options?: string[];
}

export interface EvaluateContextRequest {
  userIntent: string;
}

export interface EvaluateContextResponse {
  sufficient: boolean;
  reasoning: string;
  questions?: ClarifyingQuestion[];
}

export interface ClarifyingAnswer {
  question: string;
  answer: string;
}

export interface GeneratePromptRequestV2 extends GeneratePromptRequest {
  clarifyingAnswers?: ClarifyingAnswer[];
}

// Favorites feature types
export interface FavoritePrompt {
  id: string;                    // Unique identifier (timestamp-based)
  prompt: string;                // The actual prompt text
  selectedBlocks: {              // Blocks used in prompt
    id: string;
    title: string;
    category: string;
    categoryLabel?: string;
  }[];
  userIntent?: string;           // Original user intent/description
  reasoning?: string;            // AI reasoning (if available)
  name?: string;                 // User-editable name
  tags?: string[];               // User-added tags
  createdAt: number;             // Timestamp
  lastModified: number;          // Last edit timestamp
}

export interface FavoritesStorage {
  version: number;               // Storage schema version
  favorites: FavoritePrompt[];
}

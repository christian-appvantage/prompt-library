# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Prompt Library** - An AI-powered Next.js application that generates standardized prompts using the TCWEI (Task-Context-Writer-Examples-Instructions) framework. The application features both AI-guided and manual prompt building modes with multi-modal support (text and images).

## Tech Stack

- **Framework**: Next.js 16.1.6 (App Router) with TypeScript
- **Runtime**: Node.js
- **Styling**: Tailwind CSS 4 with @tailwindcss/typography
- **LLM Integration**: Anthropic Claude API (`@anthropic-ai/sdk`)
  - Sonnet 4.6: `claude-sonnet-4-6` (both generation and context evaluation)
- **Icons**: Lucide React
- **Testing**: Jest with React Testing Library
- **React**: 19.2.3 with functional components and hooks

## Project Structure

```
prompt-library/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── api/
│   │   │   ├── generate-prompt/      # Main prompt generation endpoint
│   │   │   │   └── route.ts          # POST /api/generate-prompt
│   │   │   ├── evaluate-context/     # Context evaluation for clarifying questions
│   │   │   │   └── route.ts          # POST /api/evaluate-context
│   │   │   └── test-env/             # Environment test endpoint
│   │   ├── page.tsx                  # Main UI (dual mode: AI/Manual)
│   │   ├── layout.tsx                # Root layout
│   │   └── globals.css               # Global styles
│   ├── components/
│   │   ├── GuidedFlow.tsx           # Multi-step AI flow orchestrator
│   │   ├── IntentInput.tsx          # Text/voice/image input component
│   │   ├── VoiceInput.tsx           # Web Speech API integration
│   │   ├── QuestionCard.tsx         # Clarifying question UI
│   │   ├── PromptOutput.tsx         # Generated prompt display
│   │   ├── EvaluatingSpinner.tsx    # Loading state with animation
│   │   ├── StepIndicator.tsx        # Progress indicator
│   │   ├── Tooltip.tsx              # Reusable tooltip (supports asSpan prop)
│   │   ├── TCWEIIntroModal.tsx      # Onboarding modal
│   │   └── TCWEIHelpPanel.tsx       # Framework explanation panel
│   ├── data/
│   │   └── blocks.json              # TCWEI building blocks database
│   ├── lib/
│   │   └── blocks.ts                # Data access utilities
│   ├── types/
│   │   └── index.ts                 # TypeScript definitions
│   ├── hooks/
│   │   └── useKeyboardShortcuts.ts  # Keyboard shortcut handling
│   └── utils/
│       ├── debounce.ts              # Debounce utility
│       ├── downloadPrompt.ts        # Export prompts to file
│       ├── favoritesManager.ts      # LocalStorage favorites management
│       ├── placeholderHistory.ts    # Placeholder value persistence
│       ├── placeholderParser.ts     # [PLACEHOLDER] extraction/highlighting
│       └── placeholderTypeDetector.ts # Detect placeholder value types
└── __tests__/                       # Jest tests (not actively used)
```

## Core Architecture

### TCWEI Framework Categories
The application is built around 7 categories of prompt building blocks:
1. **Writer** (W-xx): AI persona/role definitions
2. **Task** (T-xx): Action specifications
3. **Context** (C-xx): Background, constraints, audience info
4. **Examples** (E-xx): Reference patterns
5. **Instructions** (I-xx): Output format requirements
6. **Best Practices** (BP-xx): Quality guardrails
7. **Coding** (CD-xx): Developer-specific tasks

### Dual Mode System

#### AI Mode (Guided Flow)
- User provides intent via text, voice, or images
- `/api/evaluate-context` assesses if context is sufficient
- If insufficient, shows clarifying questions with predefined options
- `/api/generate-prompt` creates final prompt using Claude Sonnet 4.5
- Flow steps: `input` → `evaluating` → `clarifying` (if needed) → `generating` → `result`

#### Manual Mode
- Traditional block browser for manual selection
- Category sidebar navigation with visual indicators
- Real-time block selection and preview
- Manual prompt assembly with customizable sections

### API Routes

#### POST /api/evaluate-context
- **Purpose**: Evaluates user intent and generates clarifying questions
- **Model**: `claude-sonnet-4-6`
- **Input**: `{ userIntent: string, images?: ImageAttachment[] }`
- **Output**: `{ sufficient: boolean, reasoning: string, questions?: ClarifyingQuestion[] }`
- **Timeout**: Browser default (~60s)

#### POST /api/generate-prompt
- **Purpose**: Generates structured prompts from intent + answers
- **Model**: `claude-sonnet-4-6`
- **Max Tokens**: 4096 (optimized for speed)
- **Input**: `{ userIntent: string, clarifyingAnswers?: ClarifyingAnswer[], images?: ImageAttachment[] }`
- **Output**: `{ prompt: string, selectedBlocks: Block[], reasoning: string }`
- **Timeout**: 90 seconds (client-side AbortController)

### Multi-Modal Support
- **Image Upload**: Click upload button or drag-and-drop
- **Screenshot Paste**: Ctrl+V (Cmd+V on Mac) directly into textarea
- **Validation**: Max 5MB per image, image/* mime types only
- **Base64 Encoding**: Images converted to base64 for API transmission
- **Vision Models**: Uses Sonnet 4.5 for image analysis

## Development Commands

```bash
# Install dependencies
npm install

# Development server (http://localhost:3000)
npm run dev

# Production build
npm run build

# Start production server
npm start

# Linting
npm run lint

# Testing
npm test              # Run all tests
npm run test:watch    # Watch mode
```

## Environment Configuration

Create `.env.local` with:
```env
CLAUDE_API_KEY=your_api_key_here
```

**Note**: The app checks both `CLAUDE_API_KEY` and `ANTHROPIC_API_KEY` environment variables. Use `CLAUDE_API_KEY` to avoid conflicts with system-level `ANTHROPIC_API_KEY`.

## Key Implementation Details

### Path Aliases
TypeScript configured with `@/*` alias mapping to `./src/*`

### Data Management
- Building blocks stored in `src/data/blocks.json`
- Accessed via utility functions in `src/lib/blocks.ts`
- JSON structure: `{ categories: { [key]: Category }, categoryOrder: string[] }`

### LLM Integration
- **JSON Response Handling**: Strips markdown code blocks (```json ... ```) before parsing
- **Error Recovery**: Fixes unescaped newlines/tabs in JSON strings
- **System Prompts**: Carefully structured to enforce valid JSON output
- **Timeout Handling**: 90s client timeout with AbortController, clear error messages
- **Model Selection**: Haiku for simple tasks, Sonnet for complex generation

### Voice Input
- Uses Web Speech API (browser-native, no external dependencies)
- Graceful fallback to text input if unavailable
- Best support in Chrome/Edge browsers
- Appends to existing text instead of replacing

### Image Handling
- **Paste Handler**: Intercepts clipboard events for images
- **File Upload**: Hidden input triggered by visible upload button
- **Preview Display**: Thumbnail grid with hover-to-remove functionality
- **Cleanup**: Images cleared on "Start Over" or successful submission

### Utility Features
- **Favorites**: LocalStorage-based prompt bookmarking (`favoritesManager.ts`)
- **Download**: Export generated prompts to text files (`downloadPrompt.ts`)
- **Placeholder Management**: Parse, highlight, and persist placeholder values across sessions
  - `placeholderParser.ts`: Extract `[PLACEHOLDER]` patterns from prompts
  - `placeholderTypeDetector.ts`: Infer placeholder value types
  - `placeholderHistory.ts`: LocalStorage persistence for user-filled values
- **Debounce**: General-purpose debounce utility for input handling

### Component Patterns
- **Tooltip Component**: Supports `asSpan` prop to avoid nested buttons (use when tooltip is inside another button)
- **Error Handling**: User-friendly messages, temporary display with auto-dismiss
- **Loading States**: Minimum display time (1s) to prevent UI flashing
- **Keyboard Shortcuts**: Enter to submit, Shift+Enter for newline, Ctrl+V for paste

## Code Conventions

- **TypeScript**: Strict mode enabled, explicit types preferred
- **React**: Functional components only, hooks for state management
- **Async**: Use `async/await` over raw promises
- **Path Imports**: Always use `@/` alias (not relative paths)
- **Styling**: Tailwind utility classes, semantic color variables
- **Error Handling**: Try-catch with specific error types, user-friendly messages
- **Constants**: Upper case, defined at module top
- **Naming**: camelCase for variables/functions, PascalCase for components/types

## Testing

- Jest with jsdom environment
- React Testing Library for component tests
- Path aliases configured in `jest.config.js`
- Tests located in `src/__tests__/` (currently minimal coverage)

## Common Issues & Solutions

### Model 404 Errors
**Problem**: API returns 404 for model
**Solution**: Ensure using current model ID: `claude-sonnet-4-6`

### JSON Parsing Failures
**Problem**: "Failed to parse evaluation response"
**Solution**: Both API routes now strip markdown code blocks before parsing. If errors persist, check Claude's raw response in server logs.

### Hydration Errors
**Problem**: Nested button elements
**Solution**: Use `<Tooltip asSpan />` when tooltip is inside another button element

### Timeout Errors
**Problem**: Request takes too long
**Solution**: Client has 90s timeout. Check server logs for actual response time. Consider reducing `max_tokens` if responses are consistently slow.

### Image Upload Issues
**Problem**: Images not appearing
**Solution**: Check file size (<5MB), valid image mime type, browser console for errors

## Design Patterns

### State Management
- Local component state with `useState`
- Refs for mutable values that don't trigger re-renders (`useRef`)
- Derived state pattern (no useEffect) for syncing props to state
- Stable refs for callbacks (`onCompleteRef.current = onComplete`)

### API Error Handling
1. Specific error messages for common failures (API key, auth, timeout)
2. Generic fallback for unexpected errors
3. Server-side logging with truncated response previews
4. Client-side retry suggestions

### Performance
- Minimum display time for loading states (prevent flashing)
- Abort controllers for long-running requests
- Optimized token limits (4096 vs 8192)
- Conditional image processing (only if present)

## Brand & Styling

- **Primary Color**: `#E60000` (E.ON red) - used for CTAs, accents, selections
- **Secondary**: Blue (#3B82F6) for interactive elements
- **Neutrals**: Slate grays for text and borders
- **Brand Name**: "Prompt Library" (generic, no company branding)
- **Framework**: "TCWEI Framework" - always capitalized

## Important Notes

- The app generates prompts for OTHER LLMs - it does NOT execute them
- Placeholders formatted as `[PLACEHOLDER_TEXT]` are highlighted in amber
- Modal overlays used for output display (dark backdrop)
- Responsive design with mobile-first breakpoints
- Local storage used for mode preference and intro modal state

## Development Tips

1. **Hot Reload**: Changes to components auto-reload, API routes require manual refresh
2. **API Testing**: Check `/api/test-env` to verify environment variables
3. **Model Testing**: Use Haiku for faster iteration during development
4. **JSON Debugging**: Check server console for full LLM responses when parsing fails
5. **Image Testing**: Use small test images first (base64 payloads can be large)

## Future Considerations

- Streaming API responses for better UX on slow connections
- Prompt history/favorites with localStorage or backend
- Export prompts to various formats (Markdown, JSON, plain text)
- Collaborative prompt building with shareable links
- Analytics for popular blocks and patterns

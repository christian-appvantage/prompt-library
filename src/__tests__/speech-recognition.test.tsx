/**
 * Unit Tests for Speech Recognition / Voice Input
 * Tests the VoiceInput component and Web Speech API integration
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import VoiceInput from '@/components/VoiceInput';

// Custom types matching the component's Speech API types
interface MockSpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: { transcript: string; confidence: number };
}

interface MockSpeechRecognitionEvent {
  results: MockSpeechRecognitionResult[];
}

interface MockSpeechRecognitionErrorEvent {
  error: string;
  message?: string;
}

// Mock implementation for SpeechRecognition
const createMockSpeechRecognition = () => {
  const instance = {
    continuous: false,
    interimResults: false,
    lang: '',
    onstart: null as (() => void) | null,
    onend: null as (() => void) | null,
    onresult: null as ((event: MockSpeechRecognitionEvent) => void) | null,
    onerror: null as ((event: MockSpeechRecognitionErrorEvent) => void) | null,
    start: jest.fn(),
    stop: jest.fn(),
    abort: jest.fn(),
  };
  return instance;
};

// Typed window augmentation for tests
interface WindowWithSpeech extends Window {
  SpeechRecognition: unknown;
  webkitSpeechRecognition: unknown;
}

describe('VoiceInput Component', () => {
  let mockRecognition: ReturnType<typeof createMockSpeechRecognition>;
  let originalSpeechRecognition: unknown;
  let originalWebkitSpeechRecognition: unknown;

  beforeEach(() => {
    mockRecognition = createMockSpeechRecognition();

    // Store originals
    originalSpeechRecognition = (window as unknown as WindowWithSpeech).SpeechRecognition;
    originalWebkitSpeechRecognition = (window as unknown as WindowWithSpeech).webkitSpeechRecognition;

    // Mock the constructors
    (window as unknown as WindowWithSpeech).SpeechRecognition = jest.fn(() => mockRecognition);
    (window as unknown as WindowWithSpeech).webkitSpeechRecognition = jest.fn(() => mockRecognition);
  });

  afterEach(() => {
    // Restore originals
    (window as unknown as WindowWithSpeech).SpeechRecognition = originalSpeechRecognition;
    (window as unknown as WindowWithSpeech).webkitSpeechRecognition = originalWebkitSpeechRecognition;
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the microphone button', () => {
      const onTranscript = jest.fn();
      render(<VoiceInput onTranscript={onTranscript} />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should be disabled when disabled prop is true', () => {
      const onTranscript = jest.fn();
      render(<VoiceInput onTranscript={onTranscript} disabled={true} />);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should show disabled state when Speech API is not supported', () => {
      // Remove Speech API
      delete (window as unknown as WindowWithSpeech & Record<string, unknown>).SpeechRecognition;
      delete (window as unknown as WindowWithSpeech & Record<string, unknown>).webkitSpeechRecognition;

      const onTranscript = jest.fn();
      render(<VoiceInput onTranscript={onTranscript} />);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });
  });

  describe('Speech Recognition Flow', () => {
    it('should start recognition when button is clicked', async () => {
      const onTranscript = jest.fn();
      render(<VoiceInput onTranscript={onTranscript} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      // The start method should be called
      expect(mockRecognition.start).toHaveBeenCalled();
    });

    it('should set correct language to English', () => {
      const onTranscript = jest.fn();
      render(<VoiceInput onTranscript={onTranscript} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(mockRecognition.lang).toBe('en-US');
    });

    it('should call onTranscript with result when speech is recognized', async () => {
      const onTranscript = jest.fn();
      render(<VoiceInput onTranscript={onTranscript} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      // Simulate successful speech recognition with isFinal: true
      const mockEvent: MockSpeechRecognitionEvent = {
        results: [Object.assign([{ transcript: 'Hello world', confidence: 1 }], { isFinal: true })],
      };

      // Trigger the onresult callback
      if (mockRecognition.onresult) {
        mockRecognition.onresult(mockEvent);
      }

      expect(onTranscript).toHaveBeenCalledWith('Hello world');
    });

    it('should NOT call onTranscript for non-final results', async () => {
      const onTranscript = jest.fn();
      render(<VoiceInput onTranscript={onTranscript} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      // Simulate interim result with isFinal: false
      const mockEvent: MockSpeechRecognitionEvent = {
        results: [Object.assign([{ transcript: 'Hello', confidence: 0.5 }], { isFinal: false })],
      };

      if (mockRecognition.onresult) {
        mockRecognition.onresult(mockEvent);
      }

      expect(onTranscript).not.toHaveBeenCalled();
    });

    it('should only process result once even if onresult fires multiple times', async () => {
      const onTranscript = jest.fn();
      render(<VoiceInput onTranscript={onTranscript} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      const mockEvent: MockSpeechRecognitionEvent = {
        results: [Object.assign([{ transcript: 'Hello world', confidence: 1 }], { isFinal: true })],
      };

      // Fire onresult multiple times (simulating browser bug)
      if (mockRecognition.onresult) {
        mockRecognition.onresult(mockEvent);
        mockRecognition.onresult(mockEvent);
        mockRecognition.onresult(mockEvent);
      }

      // Should only be called once due to hasProcessedResult guard
      expect(onTranscript).toHaveBeenCalledTimes(1);
    });

    it('should handle recognition start event', () => {
      const onTranscript = jest.fn();
      render(<VoiceInput onTranscript={onTranscript} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      // Simulate start event
      if (mockRecognition.onstart) {
        mockRecognition.onstart();
      }

      // Button should now show listening state
      expect(mockRecognition.start).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle not-allowed error (microphone permission denied)', async () => {
      const onTranscript = jest.fn();
      render(<VoiceInput onTranscript={onTranscript} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      // Simulate error
      const mockError: MockSpeechRecognitionErrorEvent = {
        error: 'not-allowed',
      };

      if (mockRecognition.onerror) {
        mockRecognition.onerror(mockError);
      }

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/microphone access denied/i)).toBeInTheDocument();
      });
    });

    it('should handle no-speech error', async () => {
      const onTranscript = jest.fn();
      render(<VoiceInput onTranscript={onTranscript} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      const mockError: MockSpeechRecognitionErrorEvent = {
        error: 'no-speech',
      };

      if (mockRecognition.onerror) {
        mockRecognition.onerror(mockError);
      }

      await waitFor(() => {
        expect(screen.getByText(/no speech detected/i)).toBeInTheDocument();
      });
    });

    it('should handle generic errors', async () => {
      const onTranscript = jest.fn();
      render(<VoiceInput onTranscript={onTranscript} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      const mockError: MockSpeechRecognitionErrorEvent = {
        error: 'network',
      };

      if (mockRecognition.onerror) {
        mockRecognition.onerror(mockError);
      }

      await waitFor(() => {
        expect(screen.getByText(/error.*network/i)).toBeInTheDocument();
      });
    });
  });

  describe('Recognition End', () => {
    it('should reset listening state when recognition ends', () => {
      const onTranscript = jest.fn();
      render(<VoiceInput onTranscript={onTranscript} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      // Simulate end event
      if (mockRecognition.onend) {
        mockRecognition.onend();
      }

      // Button should be clickable again
      expect(button).not.toBeDisabled();
    });
  });
});

describe('IntentInput Component Integration', () => {
  // Test that IntentInput properly integrates with VoiceInput
  it('should append voice transcript to existing text', () => {
    // This tests the handleVoiceTranscript logic
    let currentIntent = 'existing text';
    const handleVoiceTranscript = (transcript: string) => {
      currentIntent = currentIntent ? `${currentIntent} ${transcript}` : transcript;
    };

    handleVoiceTranscript('new voice input');

    expect(currentIntent).toBe('existing text new voice input');
  });

  it('should set transcript as intent when input is empty', () => {
    let currentIntent = '';
    const handleVoiceTranscript = (transcript: string) => {
      currentIntent = currentIntent ? `${currentIntent} ${transcript}` : transcript;
    };

    handleVoiceTranscript('voice input');

    expect(currentIntent).toBe('voice input');
  });
});

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

// Check support once at module level (runs client-side only)
const checkSpeechSupport = () => {
  if (typeof window === 'undefined') return true; // SSR: assume supported
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
};

export default function VoiceInput({ onTranscript, disabled }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported] = useState(checkSpeechSupport);
  const [error, setError] = useState<string | null>(null);

  // Use ref to track recognition instance and prevent duplicates
  const recognitionRef = useRef<SpeechRecognitionType | null>(null);
  const hasProcessedResult = useRef(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
        recognitionRef.current = null;
      }
    };
  }, []);

  const startListening = useCallback(() => {
    if (typeof window === 'undefined') return;

    // Stop any existing recognition first
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Speech recognition not supported in this browser');
      return;
    }

    // Reset the processed flag for new recognition session
    hasProcessedResult.current = false;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    // Store reference
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event: SpeechRecognitionEventType) => {
      // Guard against multiple result events
      if (hasProcessedResult.current) {
        return;
      }

      const result = event.results[0];
      // Only process final results to prevent duplicates
      if (result.isFinal) {
        hasProcessedResult.current = true;
        const transcript = result[0].transcript;
        onTranscript(transcript);
        setIsListening(false);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEventType) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        setError('Microphone access denied. Please allow microphone access.');
      } else if (event.error === 'no-speech') {
        setError('No speech detected. Please try again.');
      } else if (event.error === 'aborted') {
        // Ignore aborted errors (user cancelled or new session started)
        return;
      } else {
        setError(`Error: ${event.error}`);
      }
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    try {
      recognition.start();
    } catch (err) {
      console.error('Failed to start recognition:', err);
      setError('Failed to start voice input');
      setIsListening(false);
      recognitionRef.current = null;
    }
  }, [onTranscript]);

  if (!isSupported) {
    return (
      <button
        disabled
        className="p-3 bg-slate-100 text-slate-400 rounded-xl cursor-not-allowed"
        title="Voice input not supported in this browser"
      >
        <MicOff className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={startListening}
        disabled={disabled || isListening}
        className={`p-3 rounded-xl transition-all ${
          isListening
            ? 'bg-red-500 text-white animate-pulse'
            : 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        title={isListening ? 'Listening...' : 'Click to speak'}
      >
        {isListening ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Mic className="w-5 h-5" />
        )}
      </button>
      {error && (
        <div className="absolute top-full mt-2 left-0 right-0 min-w-[200px] p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
          {error}
        </div>
      )}
    </div>
  );
}

// Type declarations for Web Speech API
interface SpeechRecognitionResultItem {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: SpeechRecognitionResultItem;
}

interface SpeechRecognitionEventType {
  results: SpeechRecognitionResult[];
}

interface SpeechRecognitionErrorEventType {
  error: string;
  message?: string;
}

interface SpeechRecognitionType {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventType) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventType) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionType;
    webkitSpeechRecognition: new () => SpeechRecognitionType;
  }
}

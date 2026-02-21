'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { RotateCcw, AlertCircle } from 'lucide-react';
import IntentInput from './IntentInput';
import StepIndicator from './StepIndicator';
import QuestionCard from './QuestionCard';
import EvaluatingSpinner from './EvaluatingSpinner';
import type { FlowStep, ClarifyingQuestion, ClarifyingAnswer } from '@/types';

interface GuidedFlowProps {
  onComplete: (
    prompt: string,
    selectedBlocks: Array<{ id: string; title: string; category: string }>,
    reasoning: string,
    userIntent?: string
  ) => void;
}

// Enforce a minimum display time for API calls (so spinners don't flash too quickly)
const withMinDisplayTime = async <T,>(promise: Promise<T>, minMs: number = 1000): Promise<T> => {
  const start = Date.now();
  const result = await promise;
  const elapsed = Date.now() - start;
  if (elapsed < minMs) {
    await new Promise(resolve => setTimeout(resolve, minMs - elapsed));
  }
  return result;
};

export default function GuidedFlow({ onComplete }: GuidedFlowProps) {
  // Flow state
  const [step, setStep] = useState<FlowStep>('input');
  const [userIntent, setUserIntent] = useState('');
  const [userImages, setUserImages] = useState<Array<{ id: string; data: string; type: string; name: string }>>([]);
  const [clarifyingQuestions, setClarifyingQuestions] = useState<ClarifyingQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [error, setError] = useState<string | null>(null);

  // Track previous intent for "Start Over" pre-fill
  const previousIntentRef = useRef('');

  // Use a ref for onComplete to avoid stale closure issues
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // === CORE API FUNCTIONS (not useCallback to avoid circular deps) ===

  const generatePrompt = async (intent: string, clarifyingAnswers: ClarifyingAnswer[], images?: Array<{ id: string; data: string; type: string; name: string }>) => {
    setStep('generating');
    setError(null);

    try {
      // Create AbortController for timeout (90 seconds to handle slow AI responses)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90000);

      const response = await withMinDisplayTime(
        fetch('/api/generate-prompt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userIntent: intent,
            clarifyingAnswers: clarifyingAnswers.length > 0 ? clarifyingAnswers : undefined,
            images: images && images.length > 0 ? images : undefined,
          }),
          signal: controller.signal,
        }),
        1500
      );

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate prompt');
      }

      setStep('result');
      onCompleteRef.current(data.prompt, data.selectedBlocks, data.reasoning, intent);
    } catch (err) {
      console.error('Generation error:', err);
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          setError('Request timed out. The AI is taking too long to respond. Please try again with a simpler request.');
        } else {
          setError(err.message);
        }
      } else {
        setError('An error occurred while generating the prompt. Please try again.');
      }
      setStep('input');
    }
  };

  // === STEP HANDLERS ===

  const handleIntentSubmit = async (intent: string, images?: Array<{ id: string; data: string; type: string; name: string }>) => {
    setUserIntent(intent);
    setUserImages(images || []);
    previousIntentRef.current = intent;
    setError(null);
    setStep('evaluating');

    try {
      const response = await withMinDisplayTime(
        fetch('/api/evaluate-context', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userIntent: intent,
            images: images && images.length > 0 ? images : undefined,
          }),
        })
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to evaluate your request');
      }

      if (data.sufficient) {
        // Context is sufficient - skip to generating
        await generatePrompt(intent, [], images);
      } else {
        // Context is insufficient - show clarifying questions
        setClarifyingQuestions(data.questions || []);
        setCurrentQuestionIndex(0);
        setAnswers({});
        setStep('clarifying');
      }
    } catch (err) {
      console.error('Evaluation error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setStep('input');
    }
  };

  const handleAnswerChange = useCallback((answer: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestionIndex]: answer }));
  }, [currentQuestionIndex]);

  const handleNextQuestion = () => {
    if (currentQuestionIndex < clarifyingQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // All questions answered - generate with all context
      const allAnswers: ClarifyingAnswer[] = clarifyingQuestions.map((q, idx) => ({
        question: q.text,
        answer: answers[idx] || '',
      })).filter(a => a.answer.trim() !== '');

      generatePrompt(userIntent, allAnswers, userImages);
    }
  };

  const handleBackQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  }, [currentQuestionIndex]);

  const handleSkipAll = () => {
    const partialAnswers: ClarifyingAnswer[] = clarifyingQuestions.map((q, idx) => ({
      question: q.text,
      answer: answers[idx] || '',
    })).filter(a => a.answer.trim() !== '');

    generatePrompt(userIntent, partialAnswers, userImages);
  };

  const handleStartOver = useCallback(() => {
    setStep('input');
    setUserImages([]);
    setClarifyingQuestions([]);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setError(null);
  }, []);

  // === AUTO-SCROLL ON STEP CHANGE ===
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to top when step changes (smooth scroll for better UX)
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [step, currentQuestionIndex]);

  // === RENDER ===

  return (
    <div ref={containerRef} className="bg-white rounded-3xl shadow-xl border-2 border-slate-200 p-8 card-hover">
      {/* Step indicator */}
      <StepIndicator
        currentStep={step}
        totalQuestions={clarifyingQuestions.length}
        currentQuestionIndex={currentQuestionIndex}
      />

      {/* Error banner */}
      {error && step === 'input' && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Step content */}
      {step === 'input' && (
        <IntentInput
          onSubmit={handleIntentSubmit}
          isLoading={false}
          initialValue={previousIntentRef.current}
        />
      )}

      {step === 'evaluating' && (
        <EvaluatingSpinner
          message="Analyzing your request..."
          userIntent={userIntent}
        />
      )}

      {step === 'clarifying' && clarifyingQuestions.length > 0 && (
        <QuestionCard
          key={currentQuestionIndex}
          question={clarifyingQuestions[currentQuestionIndex]}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={clarifyingQuestions.length}
          currentAnswer={answers[currentQuestionIndex] || ''}
          onAnswer={handleAnswerChange}
          onNext={handleNextQuestion}
          onBack={handleBackQuestion}
          onSkipAll={handleSkipAll}
          isFirst={currentQuestionIndex === 0}
          isLast={currentQuestionIndex === clarifyingQuestions.length - 1}
        />
      )}

      {step === 'generating' && (
        <EvaluatingSpinner
          message="Crafting your prompt..."
          userIntent={userIntent}
        />
      )}

      {/* Start Over button - shown during clarifying and generating */}
      {(step === 'clarifying' || step === 'generating') && (
        <div className="mt-4 pt-3 border-t border-slate-100 text-center">
          <button
            onClick={handleStartOver}
            disabled={step === 'generating'}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCcw className="w-3 h-3" />
            Start over
          </button>
        </div>
      )}
    </div>
  );
}

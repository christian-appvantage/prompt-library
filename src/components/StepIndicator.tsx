'use client';

import { Check } from 'lucide-react';
import type { FlowStep } from '@/types';

interface StepIndicatorProps {
  currentStep: FlowStep;
  totalQuestions?: number;
  currentQuestionIndex?: number;
}

const STEPS = [
  { key: 'input' as const, label: 'Describe', activeOn: ['input'] },
  { key: 'clarifying' as const, label: 'Refine', activeOn: ['evaluating', 'clarifying'] },
  { key: 'generating' as const, label: 'Generate', activeOn: ['generating', 'result'] },
];

const getStepState = (
  stepActiveOn: string[],
  stepIndex: number,
  currentStep: FlowStep
): 'completed' | 'active' | 'pending' => {
  const stepOrder: FlowStep[] = ['input', 'evaluating', 'clarifying', 'generating', 'result'];
  const currentIdx = stepOrder.indexOf(currentStep);

  // Map visual steps to their earliest flow step index
  const visualStepFirstFlowIdx = [0, 1, 3]; // input=0, evaluating=1, generating=3

  if (stepActiveOn.includes(currentStep)) return 'active';
  if (visualStepFirstFlowIdx[stepIndex] < currentIdx) return 'completed';
  return 'pending';
};

export default function StepIndicator({ currentStep, totalQuestions, currentQuestionIndex }: StepIndicatorProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-center gap-0">
        {STEPS.map((step, idx) => {
          const state = getStepState(step.activeOn, idx, currentStep);

          return (
            <div key={step.key} className="flex items-center">
              {/* Step circle + label */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                    state === 'active'
                      ? 'bg-[#E91E8C] text-white shadow-lg shadow-[#E91E8C]/30 scale-110'
                      : state === 'completed'
                        ? 'bg-[#E91E8C] text-white'
                        : 'bg-slate-200 text-slate-400'
                  }`}
                >
                  {state === 'completed' ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>
                <span
                  className={`text-xs mt-1.5 font-medium transition-colors duration-300 ${
                    state === 'active'
                      ? 'text-[#E91E8C]'
                      : state === 'completed'
                        ? 'text-slate-600'
                        : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </span>

                {/* Question progress sub-text */}
                {step.key === 'clarifying' && currentStep === 'clarifying' && totalQuestions && currentQuestionIndex !== undefined && (
                  <span className="text-[10px] text-[#E91E8C] font-medium mt-0.5">
                    {currentQuestionIndex + 1} of {totalQuestions}
                  </span>
                )}
              </div>

              {/* Connector line */}
              {idx < STEPS.length - 1 && (
                <div
                  className={`w-16 h-0.5 mx-2 mb-5 transition-colors duration-300 ${
                    state === 'completed' ? 'bg-[#E91E8C]/60' : 'bg-slate-200'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

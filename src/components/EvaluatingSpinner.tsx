'use client';

import { Sparkles } from 'lucide-react';

interface EvaluatingSpinnerProps {
  message?: string;
  userIntent?: string;
}

export default function EvaluatingSpinner({ message = 'Analyzing your request...', userIntent }: EvaluatingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6">
      {/* Pulsing icon */}
      <div className="relative mb-6">
        <div className="absolute inset-0 w-16 h-16 rounded-full bg-[#E91E8C]/20 animate-ping" />
        <div className="relative w-16 h-16 rounded-full bg-[#E91E8C] flex items-center justify-center shadow-lg shadow-[#E91E8C]/30">
          <Sparkles className="w-7 h-7 text-white animate-pulse" />
        </div>
      </div>

      {/* Status message */}
      <p className="text-slate-700 font-medium text-base mb-2">{message}</p>

      {/* Animated dots */}
      <div className="flex gap-1 mb-6">
        <div className="w-1.5 h-1.5 rounded-full bg-[#E91E8C]/60 animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-1.5 h-1.5 rounded-full bg-[#E91E8C]/60 animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-1.5 h-1.5 rounded-full bg-[#E91E8C]/60 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>

      {/* User's original input */}
      {userIntent && (
        <div className="max-w-md text-center">
          <p className="text-xs text-slate-400 italic truncate">
            &ldquo;{userIntent.length > 120 ? userIntent.substring(0, 120) + '...' : userIntent}&rdquo;
          </p>
        </div>
      )}
    </div>
  );
}

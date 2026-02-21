'use client';

import { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Sparkles, Target, FileText, BookOpen, Code, User } from 'lucide-react';

interface TCWEIIntroModalProps {
  onClose: () => void;
}

export default function TCWEIIntroModal({ onClose }: TCWEIIntroModalProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    setTimeout(() => setIsVisible(true), 50);
  }, []);

  const slides = [
    {
      title: 'Build Better Prompts with TCWEI',
      content: (
        <div className="text-center space-y-6">
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-pink-600 flex items-center justify-center shadow-2xl">
            <Sparkles className="w-12 h-12 text-white" />
          </div>
          <p className="text-lg text-slate-700 leading-relaxed">
            TCWEI is a proven framework for creating structured, effective prompts that get better results from AI.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
            <p className="text-sm text-blue-800 font-medium">
              Instead of guessing what to include, TCWEI gives you a systematic approach to prompt engineering.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: 'The TCWEI Framework',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border border-purple-200">
              <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center flex-shrink-0">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-purple-900">Task (T)</h4>
                <p className="text-sm text-purple-800">What you want the AI to do</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
              <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-blue-900">Context (C)</h4>
                <p className="text-sm text-blue-800">Background information & constraints</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-pink-50 to-pink-100 rounded-xl border border-pink-200">
              <div className="w-10 h-10 rounded-lg bg-pink-500 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-pink-900">Writer (W)</h4>
                <p className="text-sm text-pink-800">The AI's role or persona</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200">
              <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-green-900">Examples (E)</h4>
                <p className="text-sm text-green-800">Reference patterns or samples</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl border border-yellow-200">
              <div className="w-10 h-10 rounded-lg bg-yellow-500 flex items-center justify-center flex-shrink-0">
                <Code className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-yellow-900">Instructions (I)</h4>
                <p className="text-sm text-yellow-800">Format & output requirements</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'How It Works',
      content: (
        <div className="space-y-6">
          <p className="text-slate-700 leading-relaxed">
            Each TCWEI component is a building block. Combine them to create powerful, structured prompts:
          </p>

          <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-purple-500 flex items-center justify-center text-white text-xs font-bold">T</div>
              <span className="text-sm text-slate-600">Define what you want accomplished</span>
            </div>
            <div className="text-2xl text-slate-300 text-center">+</div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-blue-500 flex items-center justify-center text-white text-xs font-bold">C</div>
              <span className="text-sm text-slate-600">Add relevant background & constraints</span>
            </div>
            <div className="text-2xl text-slate-300 text-center">+</div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-pink-500 flex items-center justify-center text-white text-xs font-bold">W</div>
              <span className="text-sm text-slate-600">Set the AI's role or expertise</span>
            </div>
            <div className="text-2xl text-slate-300 text-center">=</div>
            <div className="bg-gradient-to-r from-purple-100 via-blue-100 to-pink-100 border-2 border-pink-500 rounded-xl p-3 text-center">
              <span className="font-bold text-slate-800">Perfect Prompt ✨</span>
            </div>
          </div>

          <p className="text-sm text-slate-600 italic text-center">
            Mix and match blocks to suit your specific needs!
          </p>
        </div>
      ),
    },
    {
      title: 'Two Ways to Build',
      content: (
        <div className="space-y-5">
          <div className="p-5 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-bold text-blue-900 text-lg">AI Mode</h4>
            </div>
            <p className="text-sm text-blue-800 mb-3">
              Tell us what you need in plain English, and our AI will automatically select the best TCWEI blocks and build your prompt.
            </p>
            <div className="bg-white/50 rounded-lg p-2 text-xs text-blue-700 font-medium">
              ✨ Best for: Quick prompts, beginners, exploratory tasks
            </div>
          </div>

          <div className="p-5 bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-300 rounded-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-slate-600 flex items-center justify-center shadow-lg">
                <Code className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-bold text-slate-900 text-lg">Manual Mode</h4>
            </div>
            <p className="text-sm text-slate-800 mb-3">
              Browse all TCWEI building blocks by category and hand-pick exactly what you need for maximum control.
            </p>
            <div className="bg-white/50 rounded-lg p-2 text-xs text-slate-700 font-medium">
              🎯 Best for: Precise requirements, advanced users, reusable templates
            </div>
          </div>

          <p className="text-center text-sm text-slate-600 font-medium pt-2">
            Switch between modes anytime!
          </p>
        </div>
      ),
    },
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      handleClose();
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 200);
  };

  return (
    <div
      className={`fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 transition-opacity duration-200 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleClose}
    >
      <div
        className={`glass-dark rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden transition-all duration-200 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-pink-600 p-6 relative">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <h2 className="text-2xl font-bold text-white pr-12">{slides[currentSlide].title}</h2>
        </div>

        {/* Content */}
        <div className="p-8 bg-white overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          <div className="animate-fade-in">
            {slides[currentSlide].content}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-6">
          <div className="flex items-center justify-between">
            {/* Progress Dots */}
            <div className="flex gap-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentSlide
                      ? 'bg-blue-500 w-8'
                      : 'bg-slate-300 hover:bg-slate-400'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-3">
              {currentSlide > 0 && (
                <button
                  onClick={prevSlide}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-700 rounded-full font-medium hover:bg-slate-300 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>
              )}
              <button
                onClick={nextSlide}
                className="btn-primary flex items-center gap-2"
              >
                {currentSlide === slides.length - 1 ? "Let's Go!" : 'Next'}
                {currentSlide < slides.length - 1 && <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

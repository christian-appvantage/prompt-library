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
          <div className="w-24 h-24 mx-auto rounded-full bg-[#E60000] flex items-center justify-center shadow-2xl">
            <Sparkles className="w-12 h-12 text-white" />
          </div>
          <p className="text-lg text-black font-light leading-relaxed">
            TCWEI is a proven framework for creating structured, effective prompts that get better results from AI.
          </p>
          <div className="bg-[#E60000]/5 border border-[#E60000]/20 rounded-2xl p-4">
            <p className="text-sm text-black font-light">
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
            <div className="flex items-start gap-4 p-4 bg-[#E60000]/5 rounded-xl border border-[#E60000]/20">
              <div className="w-10 h-10 rounded-lg bg-[#E60000]/90 flex items-center justify-center flex-shrink-0">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-light text-black">Task (T)</h4>
                <p className="text-sm text-[#595959]">What you want the AI to do</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-[#E8E8E8]">
              <div className="w-10 h-10 rounded-lg bg-[#808080] flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-light text-black">Context (C)</h4>
                <p className="text-sm text-[#595959]">Background information & constraints</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-[#E60000]/5 rounded-xl border border-[#E60000]/20">
              <div className="w-10 h-10 rounded-lg bg-[#E60000] flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-light text-black">Writer (W)</h4>
                <p className="text-sm text-[#595959]">The AI&apos;s role or persona</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-[#E8E8E8]">
              <div className="w-10 h-10 rounded-lg bg-[#595959] flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-light text-black">Examples (E)</h4>
                <p className="text-sm text-[#595959]">Reference patterns or samples</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-[#E8E8E8]">
              <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center flex-shrink-0">
                <Code className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-light text-black">Instructions (I)</h4>
                <p className="text-sm text-[#595959]">Format & output requirements</p>
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
          <p className="text-black font-light leading-relaxed">
            Each TCWEI component is a building block. Combine them to create powerful, structured prompts:
          </p>

          <div className="bg-gray-50 border-2 border-[#E8E8E8] rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-[#E60000]/90 flex items-center justify-center text-white text-xs font-bold">T</div>
              <span className="text-sm text-[#595959]">Define what you want accomplished</span>
            </div>
            <div className="text-2xl text-[#E8E8E8] text-center">+</div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-[#808080] flex items-center justify-center text-white text-xs font-bold">C</div>
              <span className="text-sm text-[#595959]">Add relevant background & constraints</span>
            </div>
            <div className="text-2xl text-[#E8E8E8] text-center">+</div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-[#E60000] flex items-center justify-center text-white text-xs font-bold">W</div>
              <span className="text-sm text-[#595959]">Set the AI&apos;s role or expertise</span>
            </div>
            <div className="text-2xl text-[#E8E8E8] text-center">=</div>
            <div className="bg-[#E60000]/5 border-2 border-[#E60000] rounded-xl p-3 text-center">
              <span className="font-light text-black">Perfect Prompt</span>
            </div>
          </div>

          <p className="text-sm text-[#808080] italic text-center">
            Mix and match blocks to suit your specific needs!
          </p>
        </div>
      ),
    },
    {
      title: 'Two Ways to Build',
      content: (
        <div className="space-y-5">
          <div className="p-5 bg-[#E60000]/5 border-2 border-[#E60000]/30 rounded-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-[#E60000] flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-light text-black text-lg">AI Mode</h4>
            </div>
            <p className="text-sm text-[#595959] mb-3">
              Tell us what you need in plain English, and our AI will automatically select the best TCWEI blocks and build your prompt.
            </p>
            <div className="bg-white/50 rounded-lg p-2 text-xs text-black font-light">
              Best for: Quick prompts, beginners, exploratory tasks
            </div>
          </div>

          <div className="p-5 bg-gray-50 border-2 border-[#E8E8E8] rounded-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center shadow-lg">
                <Code className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-light text-black text-lg">Manual Mode</h4>
            </div>
            <p className="text-sm text-[#595959] mb-3">
              Browse all TCWEI building blocks by category and hand-pick exactly what you need for maximum control.
            </p>
            <div className="bg-white/50 rounded-lg p-2 text-xs text-black font-light">
              Best for: Precise requirements, advanced users, reusable templates
            </div>
          </div>

          <p className="text-center text-sm text-[#808080] font-light pt-2">
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
        className={`bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden transition-all duration-200 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#E60000] p-6 relative rounded-t-3xl">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <h2 className="text-2xl font-light text-white pr-12">{slides[currentSlide].title}</h2>
        </div>

        {/* Content */}
        <div className="p-8 bg-white overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          <div className="animate-fade-in">
            {slides[currentSlide].content}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-[#E8E8E8] p-6">
          <div className="flex items-center justify-between">
            {/* Progress Dots */}
            <div className="flex gap-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentSlide
                      ? 'bg-[#E60000] w-8'
                      : 'bg-[#E8E8E8] hover:bg-[#a5a9ab]'
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
                  className="flex items-center gap-2 px-4 py-2 bg-[#E8E8E8] text-black rounded-full font-light hover:bg-[#a5a9ab] hover:text-white transition-all"
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

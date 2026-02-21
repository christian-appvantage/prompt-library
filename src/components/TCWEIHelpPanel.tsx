'use client';

import { useState, useEffect } from 'react';
import { X, BookOpen } from 'lucide-react';

export default function TCWEIHelpPanel() {
  const [isVisible, setIsVisible] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Check localStorage for panel preference
    const dismissed = localStorage.getItem('tcwei-help-dismissed');
    if (dismissed === 'true') {
      setIsVisible(false);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('tcwei-help-dismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 rounded-xl p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
          <BookOpen className="w-4 h-4 text-white" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-blue-900">TCWEI Quick Reference</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                {isExpanded ? 'Hide' : 'Show'}
              </button>
              <button
                onClick={handleDismiss}
                className="p-1 hover:bg-blue-100 rounded transition-colors"
                aria-label="Dismiss help panel"
              >
                <X className="w-4 h-4 text-blue-600" />
              </button>
            </div>
          </div>

          <p className="text-xs text-blue-800 mb-3">
            Understanding the TCWEI framework helps you build better prompts.
          </p>

          {isExpanded && (
            <div className="space-y-2 animate-fade-in">
              <div className="bg-white rounded-lg p-3 border border-blue-200">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-blue-100">
                      <th className="text-left py-2 px-2 font-bold text-blue-900">Category</th>
                      <th className="text-left py-2 px-2 font-bold text-blue-900">Purpose</th>
                      <th className="text-left py-2 px-2 font-bold text-blue-900">Example</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-50">
                    <tr>
                      <td className="py-2 px-2">
                        <span className="font-semibold text-purple-700">Task (T)</span>
                      </td>
                      <td className="py-2 px-2 text-slate-700">
                        What action should be performed
                      </td>
                      <td className="py-2 px-2 text-slate-600 italic">
                        &quot;Analyze this data&quot;
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-2">
                        <span className="font-semibold text-blue-700">Context (C)</span>
                      </td>
                      <td className="py-2 px-2 text-slate-700">
                        Background info & constraints
                      </td>
                      <td className="py-2 px-2 text-slate-600 italic">
                        &quot;For B2B SaaS audience&quot;
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-2">
                        <span className="font-semibold text-pink-700">Writer (W)</span>
                      </td>
                      <td className="py-2 px-2 text-slate-700">
                        AI&apos;s role or expertise
                      </td>
                      <td className="py-2 px-2 text-slate-600 italic">
                        &quot;As a senior analyst&quot;
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-2">
                        <span className="font-semibold text-green-700">Examples (E)</span>
                      </td>
                      <td className="py-2 px-2 text-slate-700">
                        Reference patterns to follow
                      </td>
                      <td className="py-2 px-2 text-slate-600 italic">
                        &quot;Like this format...&quot;
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-2">
                        <span className="font-semibold text-yellow-700">Instructions (I)</span>
                      </td>
                      <td className="py-2 px-2 text-slate-700">
                        Output format & requirements
                      </td>
                      <td className="py-2 px-2 text-slate-600 italic">
                        &quot;In bullet points&quot;
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-blue-100 rounded-lg p-2">
                <p className="text-xs text-blue-800">
                  <strong>💡 Pro Tip:</strong> You don&apos;t need all categories for every prompt. Mix and match based on your needs!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useRef, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';

interface TooltipProps {
  content: string;
  children?: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  asSpan?: boolean; // Render as span instead of button (for use inside buttons)
}

export default function Tooltip({ content, children, position = 'top', asSpan = false }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Show tooltip on hover or focus
  const showTooltip = () => setIsVisible(true);
  const hideTooltip = () => {
    if (!isFocused) {
      setIsVisible(false);
    }
  };

  // Handle keyboard accessibility
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible) {
        setIsVisible(false);
        setIsFocused(false);
        buttonRef.current?.blur();
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isVisible]);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const TriggerElement = asSpan ? 'span' : 'button';
  const triggerProps = asSpan
    ? {
        className: "inline-flex items-center justify-center p-1 cursor-help",
        onMouseEnter: showTooltip,
        onMouseLeave: hideTooltip,
        'aria-label': "Help information",
        'aria-describedby': isVisible ? 'tooltip-content' : undefined,
      }
    : {
        ref: buttonRef,
        type: "button" as const,
        className: "inline-flex items-center justify-center p-1 rounded-full hover:bg-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500",
        onMouseEnter: showTooltip,
        onMouseLeave: hideTooltip,
        onFocus: () => {
          setIsFocused(true);
          showTooltip();
        },
        onBlur: () => {
          setIsFocused(false);
          hideTooltip();
        },
        'aria-label': "Help information",
        'aria-describedby': isVisible ? 'tooltip-content' : undefined,
      };

  return (
    <div className="relative inline-block">
      <TriggerElement {...triggerProps}>
        {children || <HelpCircle className="w-4 h-4 text-slate-400" />}
      </TriggerElement>

      {isVisible && (
        <div
          ref={tooltipRef}
          id="tooltip-content"
          role="tooltip"
          className={`absolute ${positionClasses[position]} z-50 animate-fade-in`}
        >
          <div className="bg-slate-900 text-white text-sm rounded-lg px-3 py-2 shadow-xl max-w-xs whitespace-normal">
            {content}
            {/* Arrow */}
            <div
              className={`absolute w-2 h-2 bg-slate-900 rotate-45 ${
                position === 'top'
                  ? 'bottom-[-4px] left-1/2 -translate-x-1/2'
                  : position === 'bottom'
                  ? 'top-[-4px] left-1/2 -translate-x-1/2'
                  : position === 'left'
                  ? 'right-[-4px] top-1/2 -translate-y-1/2'
                  : 'left-[-4px] top-1/2 -translate-y-1/2'
              }`}
            />
          </div>
        </div>
      )}
    </div>
  );
}

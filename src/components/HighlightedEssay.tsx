"use client";

import { useEffect, useRef } from "react";

interface Highlight {
  text: string;
  type: "needs-improvement" | "good";
  reason?: string;
  id?: string;
}

interface HighlightedEssayProps {
  text: string;
  highlights: Highlight[];
  focusedHighlightId?: string | null;
}

export default function HighlightedEssay({
  text,
  highlights,
  focusedHighlightId,
}: HighlightedEssayProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll to focused highlight when it changes
  useEffect(() => {
    if (focusedHighlightId && containerRef.current) {
      // Find the first focused element using data attribute
      const focusedElement = containerRef.current.querySelector(
        `[data-focused="true"]`
      ) as HTMLElement;

      if (focusedElement) {
        const container = containerRef.current;
        const elementTop = focusedElement.offsetTop;
        const elementHeight = focusedElement.offsetHeight;
        const containerTop = container.scrollTop;
        const containerHeight = container.clientHeight;

        // Check if element is not fully visible
        if (
          elementTop < containerTop ||
          elementTop + elementHeight > containerTop + containerHeight
        ) {
          // Scroll to center the element in the viewport
          container.scrollTo({
            top: elementTop - containerHeight / 2 + elementHeight / 2,
            behavior: "smooth",
          });
        }
      }
    }
  }, [focusedHighlightId]);

  // Store all highlight ranges
  interface HighlightRange {
    start: number;
    end: number;
    type: Highlight["type"];
    reason?: string;
    id?: string;
    isFocused?: boolean;
  }

  const ranges: HighlightRange[] = [];

  // Find all highlight positions in the text
  highlights.forEach((highlight, highlightIndex) => {
    let searchIndex = 0;
    const searchText = highlight.text;
    const highlightId = highlight.id || `highlight-${highlightIndex}`;
    const isFocused = focusedHighlightId === highlightId;

    // Try case-insensitive matching
    while (searchIndex < text.length) {
      const index = text
        .toLowerCase()
        .indexOf(searchText.toLowerCase(), searchIndex);
      if (index === -1) break;

      ranges.push({
        start: index,
        end: index + searchText.length,
        type: highlight.type,
        reason: highlight.reason,
        id: highlightId,
        isFocused,
      });

      searchIndex = index + 1;
    }
  });

  // Sort ranges by start position, then by length (longer first)
  ranges.sort((a, b) => {
    if (a.start !== b.start) return a.start - b.start;
    return b.end - a.end; // Longer ranges first
  });

  // Merge overlapping ranges (keep the first one)
  const mergedRanges: HighlightRange[] = [];
  ranges.forEach((range) => {
    if (mergedRanges.length === 0) {
      mergedRanges.push(range);
      return;
    }

    const last = mergedRanges[mergedRanges.length - 1];
    if (range.start >= last.end) {
      // No overlap
      mergedRanges.push(range);
    } else if (range.end > last.end) {
      // Overlap - extend the last range
      last.end = range.end;
    }
    // If completely contained, ignore it
  });

  // Build segments
  const segments: Array<{
    text: string;
    highlight?: Highlight["type"];
    reason?: string;
    isFocused?: boolean;
  }> = [];

  let currentIndex = 0;

  mergedRanges.forEach((range) => {
    // Add text before highlight
    if (range.start > currentIndex) {
      segments.push({
        text: text.substring(currentIndex, range.start),
      });
    }

    // Add highlighted text
    segments.push({
      text: text.substring(range.start, range.end),
      highlight: range.type,
      reason: range.reason,
      isFocused: range.isFocused,
    });

    currentIndex = range.end;
  });

  // Add remaining text
  if (currentIndex < text.length) {
    segments.push({
      text: text.substring(currentIndex),
    });
  }

  // If no segments created, just show the text
  if (segments.length === 0) {
    segments.push({ text });
  }

  return (
    <div
      ref={containerRef}
      className="border rounded-lg w-[95%] resize-none h-[38rem] p-4 overflow-y-auto whitespace-pre-wrap leading-relaxed hide-scrollbar"
    >
      {segments.map((segment, index) => {
        if (segment.highlight) {
          const isFocused = segment.isFocused;
          return (
            <span
              key={index}
              data-focused={isFocused ? "true" : undefined}
              className={`${
                segment.highlight === "needs-improvement"
                  ? isFocused
                    ? "bg-orange-400 dark:bg-orange-700/80 underline decoration-4 decoration-orange-600 dark:decoration-orange-300 border-2 border-orange-600 dark:border-orange-400 font-semibold shadow-lg shadow-orange-500/50 dark:shadow-orange-400/30"
                    : "bg-yellow-200 dark:bg-yellow-900/40 underline decoration-2 decoration-yellow-600 dark:decoration-yellow-400"
                  : isFocused
                  ? "bg-emerald-400 dark:bg-emerald-700/80 border-2 border-emerald-600 dark:border-emerald-400 font-semibold shadow-lg shadow-emerald-500/50 dark:shadow-emerald-400/30"
                  : "bg-green-200 dark:bg-green-900/40"
              } transition-all duration-300 rounded px-0.5`}
              title={segment.reason}
            >
              {segment.text}
            </span>
          );
        }
        return <span key={index}>{segment.text}</span>;
      })}
    </div>
  );
}

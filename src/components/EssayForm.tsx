"use client";
import { useState, useEffect } from "react";
import HighlightedEssay from "./HighlightedEssay";

export interface Highlight {
  text: string;
  type: "needs-improvement" | "good";
  reason?: string;
  id?: string;
}

interface EssayFormProps {
  onGetFeedback?: () => void;
  showFeedback?: boolean;
  highlights?: Highlight[];
  setHighlights?: (highlights: Highlight[]) => void;
  focusedHighlightId?: string | null;
}

// Pre-defined highlights for the sample essay
const sampleHighlights: Highlight[] = [
  {
    text: "kind of similar",
    type: "needs-improvement" as const,
    reason: "Too informal. Use 'relatively similar' or 'broadly similar'",
    id: "highlight-0",
  },
  {
    text: "somewhere in between",
    type: "needs-improvement" as const,
    reason: "Too informal. Use 'moderate' or 'approximately 15%'",
    id: "highlight-1",
  },
  {
    text: "puts more money into",
    type: "needs-improvement" as const,
    reason: "Too informal. Use 'allocates more to' or 'spends more on'",
    id: "highlight-2",
  },
  {
    text: "just over 30%",
    type: "needs-improvement" as const,
    reason: "Could be more precise: 'approximately 32%' or 'over 30%'",
    id: "highlight-3",
  },
  {
    text: "only around 10%",
    type: "needs-improvement" as const,
    reason:
      "Repetitive phrasing. Consider varying: 'approximately 10%' or 'roughly 10%'",
    id: "highlight-4",
  },
  {
    text: "surprisingly",
    type: "good" as const,
    reason: "Good use of an adverb to express unexpected information",
    id: "highlight-5",
  },
  {
    text: "Overall, it is clear that",
    type: "good" as const,
    reason: "Excellent opening phrase for Task 1 overview",
    id: "highlight-6",
  },
  {
    text: "To conclude",
    type: "good" as const,
    reason: "Good conclusion phrase",
    id: "highlight-7",
  },
];

export default function EssayForm({
  onGetFeedback,
  showFeedback = false,
  highlights: parentHighlights,
  setHighlights,
  focusedHighlightId,
}: EssayFormProps) {
  const [essay, setEssay] = useState("");
  const [isInitialMount, setIsInitialMount] = useState(true);

  // Use parent highlights if provided, otherwise use sample highlights
  const highlights =
    parentHighlights && parentHighlights.length > 0
      ? parentHighlights
      : sampleHighlights;

  useEffect(() => {
    if (isInitialMount) {
      // On initial mount, don't load - textarea starts empty
      setIsInitialMount(false);
      // Initialize highlights if not provided
      if (!parentHighlights && setHighlights) {
        setHighlights(sampleHighlights);
      }
      return;
    }

    // Only load essay from localStorage when feedback button is clicked
    if (showFeedback) {
      const savedEssay = localStorage.getItem("essay") || "";
      setEssay(savedEssay);
      // Initialize highlights if not provided
      if (!parentHighlights && setHighlights) {
        setHighlights(sampleHighlights);
      }
    } else {
      // When going back from feedback, clear the essay so textarea is empty
      setEssay("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showFeedback]);

  // Count words
  const wordCount = essay.trim() === "" ? 0 : essay.trim().split(/\s+/).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("essay", essay);
    if (onGetFeedback) {
      onGetFeedback();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg flex flex-col items-center min-h-[40rem]"
    >
      {showFeedback && essay ? (
        <>
          {/* Show highlighted read-only version */}
          <HighlightedEssay
            text={essay}
            highlights={highlights}
            focusedHighlightId={focusedHighlightId}
          />
          <div className="w-[95%] flex justify-between items-center mt-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Word count: {wordCount}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              <span className="bg-yellow-200 dark:bg-yellow-900/40 px-2 py-1 rounded mr-2">
                Yellow underline
              </span>
              = Needs improvement
            </p>
          </div>
        </>
      ) : (
        <>
          <textarea
            value={essay}
            onChange={(e) => setEssay(e.target.value)}
            placeholder="Paste your IELTS essay here..."
            className="border rounded-lg w-[95%] resize-none h-[37rem] p-4 hide-scrollbar"
            required
          />
          {/* Word Counter and Button Row */}
          <div className="w-[95%] flex justify-between items-center mt-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Word count: {wordCount}
            </p>
            <button
              type="submit"
              className="px-6 py-2 rounded-full transition-all hover:bg-[var(--color-accent)]"
            >
              Get Feedback
            </button>
          </div>
        </>
      )}
    </form>
  );
}

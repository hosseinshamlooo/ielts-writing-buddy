"use client";

import { useState, useEffect } from "react";
import EssayForm from "@/src/components/EssayForm";
import TaskSelector from "@/src/components/TaskSelector";
import FeedbackCard from "@/src/components/FeedbackCard";

export interface Highlight {
  text: string;
  type: "needs-improvement" | "good";
  reason?: string;
  id?: string; // Unique identifier for linking
}

export default function Page() {
  const [showFeedback, setShowFeedback] = useState(false);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [focusedHighlightId, setFocusedHighlightId] = useState<string | null>(
    null
  );

  useEffect(() => {
    // Check if feedback should be shown (when essay is submitted)
    const essay = localStorage.getItem("essay");
    const hasFeedback = localStorage.getItem("hasFeedback") === "true";
    if (essay && hasFeedback) {
      // Use setTimeout to avoid synchronous state update in effect
      setTimeout(() => {
        setShowFeedback(true);
      }, 0);
    }
  }, []);

  const handleGetFeedback = () => {
    localStorage.setItem("hasFeedback", "true");
    setShowFeedback(true);
  };

  const handleBackToPrompt = () => {
    setShowFeedback(false);
    localStorage.removeItem("hasFeedback");
    setFocusedHighlightId(null);
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-2/3 flex flex-col gap-6">
        <h1
          className="text-4xl font-bold text-center mb-6"
          style={{ color: "var(--color-foreground)" }}
        >
          AI IELTS Writing Feedback Generator
        </h1>

        <div className="flex flex-row gap-4">
          <div className="w-[48%]">
            <EssayForm
              onGetFeedback={handleGetFeedback}
              showFeedback={showFeedback}
              highlights={highlights}
              setHighlights={setHighlights}
              focusedHighlightId={focusedHighlightId}
            />
          </div>
          <div className="w-[48%]">
            {showFeedback ? (
              <div className="flex flex-col">
                <button
                  onClick={handleBackToPrompt}
                  className="mb-4 text-base text-[var(--color-secondary)] hover:text-[var(--color-foreground)] transition-colors self-start"
                >
                  ← Back to Practice Prompt
                </button>
                <FeedbackCard
                  highlights={highlights}
                  focusedHighlightId={focusedHighlightId}
                  onSuggestionClick={(highlightId) => {
                    // Toggle: if clicking the same highlight, clear focus
                    setFocusedHighlightId(
                      focusedHighlightId === highlightId ? null : highlightId
                    );
                  }}
                />
              </div>
            ) : (
              <TaskSelector />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

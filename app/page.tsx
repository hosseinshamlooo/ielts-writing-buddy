"use client";

import { useState, useEffect } from "react";
import EssayForm from "@/src/components/EssayForm";
import TaskSelector from "@/src/components/TaskSelector";
import FeedbackCard from "@/src/components/FeedbackCard";
import { useTask } from "@/src/contexts/TaskContext";

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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { task } = useTask();

  useEffect(() => {
    // Check if feedback should be shown (when essay is submitted)
    const essay = localStorage.getItem("essay");
    const hasFeedback = localStorage.getItem("hasFeedback") === "true";
    const savedHighlights = localStorage.getItem("highlights");
    if (essay && hasFeedback) {
      // Use setTimeout to avoid synchronous state update in effect
      setTimeout(() => {
        setShowFeedback(true);
        if (savedHighlights) {
          try {
            setHighlights(JSON.parse(savedHighlights));
          } catch (e) {
            console.error("Error parsing saved highlights:", e);
          }
        }
      }, 0);
    }
  }, []);

  const handleGetFeedback = async () => {
    const essay = localStorage.getItem("essay");
    if (!essay || essay.trim().length === 0) {
      setError("Please write an essay first");
      return;
    }

    // Get the current prompt from localStorage
    const currentPrompt = localStorage.getItem("currentPrompt") || "";

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          essay: essay,
          taskType: task === "task1" ? "Task 1" : "Task 2",
          prompt: currentPrompt,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get feedback");
      }

      const data = await response.json();

      // Save feedback and highlights to localStorage
      localStorage.setItem("feedback", data.feedback);
      localStorage.setItem("highlights", JSON.stringify(data.highlights || []));
      localStorage.setItem("hasFeedback", "true");

      // Update state
      setHighlights(data.highlights || []);
      setShowFeedback(true);
    } catch (err: unknown) {
      console.error("Error getting feedback:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to get feedback. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
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
          IELTS ScoreLab AI
        </h1>

        <div className="flex flex-row gap-4">
          <div className="w-[48%]">
            {error && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-500 rounded-lg text-red-700 dark:text-red-300 text-sm">
                {error}
              </div>
            )}
            <EssayForm
              onGetFeedback={handleGetFeedback}
              showFeedback={showFeedback}
              highlights={highlights}
              setHighlights={setHighlights}
              focusedHighlightId={focusedHighlightId}
              isLoading={isLoading}
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

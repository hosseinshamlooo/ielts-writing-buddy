"use client";
import { useEffect, useState, useRef, useMemo } from "react";

interface Highlight {
  text: string;
  type: "needs-improvement" | "good";
  reason?: string;
  id?: string;
  criterion?:
    | "taskResponse"
    | "coherenceCohesion"
    | "lexicalResource"
    | "grammar";
}

interface FeedbackData {
  taskResponse: number | null;
  coherenceCohesion: number | null;
  lexicalResource: number | null;
  grammar: number | null;
  overallScore: number | null;
  feedback: string;
  suggestions: {
    taskResponse: {
      strengths: Array<{ text: string; highlightId?: string }>;
      improvements: Array<{ text: string; highlightId?: string }>;
    };
    coherenceCohesion: {
      strengths: Array<{ text: string; highlightId?: string }>;
      improvements: Array<{ text: string; highlightId?: string }>;
    };
    lexicalResource: {
      strengths: Array<{ text: string; highlightId?: string }>;
      improvements: Array<{ text: string; highlightId?: string }>;
    };
    grammar: {
      strengths: Array<{ text: string; highlightId?: string }>;
      improvements: Array<{ text: string; highlightId?: string }>;
    };
  };
}

interface FeedbackCardProps {
  highlights?: Highlight[];
  onSuggestionClick?: (highlightId: string | null) => void;
  focusedHighlightId?: string | null;
}

export default function FeedbackCard({
  highlights = [],
  onSuggestionClick,
  focusedHighlightId,
}: FeedbackCardProps) {
  const [data, setData] = useState<FeedbackData>({
    taskResponse: null,
    coherenceCohesion: null,
    lexicalResource: null,
    grammar: null,
    overallScore: null,
    feedback: "",
    suggestions: {
      taskResponse: {
        strengths: [
          { text: "You addressed the main parts of the task" },
          { text: "Your position was clear throughout the essay" },
        ],
        improvements: [
          { text: "Ensure you fully address all parts of the task" },
          { text: "Develop your ideas with relevant examples" },
          { text: "Maintain a clear position throughout your essay" },
        ],
      },
      coherenceCohesion: {
        strengths: [
          { text: "Your essay has a logical structure" },
          { text: "Paragraphs are generally well-organized" },
        ],
        improvements: [
          { text: "Use more linking words to connect your ideas" },
          { text: "Organize paragraphs with clear topic sentences" },
          { text: "Improve paragraph transitions for better flow" },
        ],
      },
      lexicalResource: {
        strengths: [
          { text: "You used appropriate vocabulary for the topic" },
          { text: "Word choice was generally accurate" },
        ],
        improvements: [
          { text: "Use more precise vocabulary instead of common words" },
          { text: "Avoid repetition by using synonyms" },
          { text: "Incorporate more academic vocabulary" },
        ],
      },
      grammar: {
        strengths: [
          { text: "Most sentences are grammatically correct" },
          { text: "You demonstrated good control of basic structures" },
        ],
        improvements: [
          { text: "Review subject-verb agreement" },
          { text: "Pay attention to article usage (a, an, the)" },
          { text: "Use a variety of sentence structures" },
        ],
      },
    },
  });

  const [selectedBox, setSelectedBox] = useState<string | null>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Calculate overall score with IELTS rounding rules
  const calculateOverallScore = (
    taskResponse: number | null,
    coherenceCohesion: number | null,
    lexicalResource: number | null,
    grammar: number | null
  ): number | null => {
    if (
      taskResponse === null ||
      coherenceCohesion === null ||
      lexicalResource === null ||
      grammar === null
    ) {
      return null;
    }

    // Calculate average
    const average =
      (taskResponse + coherenceCohesion + lexicalResource + grammar) / 4;

    // Round to 2 decimal places to handle floating point precision
    const roundedAverage = Math.round(average * 100) / 100;

    // Get the decimal part
    const decimalPart = roundedAverage % 1;
    const wholePart = Math.floor(roundedAverage);

    // Apply IELTS rounding rules
    if (Math.abs(decimalPart - 0.25) < 0.01) {
      // Round up to .5 (e.g., 6.25 → 6.5)
      return wholePart + 0.5;
    } else if (Math.abs(decimalPart - 0.75) < 0.01) {
      // Round up to next whole band (e.g., 6.75 → 7.0)
      return wholePart + 1.0;
    } else {
      // Round to nearest 0.5 (e.g., 6.1 → 6.0, 6.3 → 6.5, 6.6 → 6.5, 6.8 → 7.0)
      return Math.round(roundedAverage * 2) / 2;
    }
  };

  // Generate suggestions from highlights, categorized by criterion
  const suggestionsFromHighlights = useMemo(() => {
    // Ensure highlights have IDs and criterion
    const highlightsWithIds = highlights.map((h, idx) => ({
      ...h,
      id: h.id || `highlight-${idx}`,
      criterion: h.criterion || "lexicalResource", // Default to lexicalResource if not specified
    }));

    // Helper function to get suggestions for a criterion
    const getSuggestionsForCriterion = (
      criterion:
        | "taskResponse"
        | "coherenceCohesion"
        | "lexicalResource"
        | "grammar"
    ) => {
      const criterionHighlights = highlightsWithIds.filter(
        (h) => h.criterion === criterion
      );

      const strengths = criterionHighlights
        .filter((h) => h.type === "good")
        .map((h) => ({
          text: h.reason || `Good use of: "${h.text}"`,
          highlightId: h.id,
        }));

      const improvements = criterionHighlights
        .filter((h) => h.type === "needs-improvement")
        .map((h) => ({
          text: h.reason || `Consider improving: "${h.text}"`,
          highlightId: h.id,
        }));

      return { strengths, improvements };
    };

    return {
      taskResponse: getSuggestionsForCriterion("taskResponse"),
      coherenceCohesion: getSuggestionsForCriterion("coherenceCohesion"),
      lexicalResource: getSuggestionsForCriterion("lexicalResource"),
      grammar: getSuggestionsForCriterion("grammar"),
    };
  }, [highlights]);

  // Store computed result so React doesn't warn
  const payloadRef = useRef<{ essay: string; feedback: string } | null>(null);

  useEffect(() => {
    const savedEssay = localStorage.getItem("essay") || "";
    const savedFeedback = localStorage.getItem("feedback") || "";

    if (!savedFeedback) {
      return; // No feedback available yet
    }

    payloadRef.current = {
      essay: savedEssay,
      feedback: savedFeedback,
    };

    // Set state on next microtask, prevents synchronous render cascade
    Promise.resolve().then(() => {
      if (payloadRef.current) {
        // Parse feedback string to extract scores
        const feedbackText = payloadRef.current.feedback;
        const taskResponseMatch = feedbackText.match(
          /Task Response:\s*(\d+\.?\d*)/
        );
        const coherenceMatch = feedbackText.match(
          /Coherence & Cohesion:\s*(\d+\.?\d*)/
        );
        const lexicalMatch = feedbackText.match(
          /Lexical Resource:\s*(\d+\.?\d*)/
        );
        const grammarMatch = feedbackText.match(/Grammar:\s*(\d+\.?\d*)/);
        const feedbackMatch = feedbackText.match(/Feedback:\s*([\s\S]+)/);

        const taskResponse = taskResponseMatch
          ? parseFloat(taskResponseMatch[1])
          : null;
        const coherenceCohesion = coherenceMatch
          ? parseFloat(coherenceMatch[1])
          : null;
        const lexicalResource = lexicalMatch
          ? parseFloat(lexicalMatch[1])
          : null;
        const grammar = grammarMatch ? parseFloat(grammarMatch[1]) : null;

        // Calculate overall score using IELTS rounding rules
        const calculatedOverallScore = calculateOverallScore(
          taskResponse,
          coherenceCohesion,
          lexicalResource,
          grammar
        );

        setData({
          taskResponse,
          coherenceCohesion,
          lexicalResource,
          grammar,
          overallScore: calculatedOverallScore,
          feedback: feedbackMatch ? feedbackMatch[1].trim() : "",
          suggestions: suggestionsFromHighlights,
        });
      }
    });
  }, [suggestionsFromHighlights]);

  // Hide webkit scrollbar for suggestions section
  useEffect(() => {
    if (suggestionsRef.current) {
      const styleId = "suggestions-scrollbar-hide";
      if (!document.getElementById(styleId)) {
        const style = document.createElement("style");
        style.id = styleId;
        style.textContent = `
          .suggestions-scroll::-webkit-scrollbar {
            display: none;
          }
        `;
        document.head.appendChild(style);
      }
      if (suggestionsRef.current) {
        suggestionsRef.current.classList.add("suggestions-scroll");
      }
    }
  }, [selectedBox]);

  const handleBoxClick = (box: string) => {
    setSelectedBox(selectedBox === box ? null : box);
  };

  const getScoreColor = (score: number | null) => {
    if (score === null) return "";
    if (score >= 7.5) return "text-green-600 dark:text-green-400";
    if (score >= 6.5) return "text-blue-600 dark:text-blue-400";
    if (score >= 5.5) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  // Format score to always show .0 when needed (e.g., 6.0 not 6)
  const formatScore = (score: number | null): string => {
    if (score === null) return "";
    // Always show one decimal place
    return score.toFixed(1);
  };

  return (
    <div className="flex flex-col h-[40rem]">
      {/* Overall Score Box - Full width of grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div
          className="bg-[var(--color-card)] border-2 border-[var(--color-border)] rounded-lg flex flex-col items-center justify-center p-6 col-span-2"
          style={{ height: "130px" }}
        >
          <div
            className="text-5xl font-bold mb-2"
            style={{ color: "var(--color-foreground)" }}
          >
            {formatScore(data.overallScore)}
          </div>
          <h3 className="text-lg font-semibold mb-1">Overall Score</h3>
        </div>
      </div>

      {/* Scores Grid */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {/* Task Response Box */}
        <div
          className={`bg-[var(--color-card)] border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
            selectedBox === "taskResponse"
              ? "border-pink-500 dark:border-pink-400"
              : "border-[var(--color-border)]"
          }`}
          onClick={() => handleBoxClick("taskResponse")}
          style={{ height: "140px" }}
        >
          <div className="p-3 flex flex-col items-center justify-center h-full">
            <div
              className={`text-3xl font-bold mb-1 ${getScoreColor(
                data.taskResponse
              )}`}
            >
              {formatScore(data.taskResponse)}
            </div>
            <h3 className="text-sm font-semibold text-center">
              Task
              <br />
              Response
            </h3>
          </div>
        </div>

        {/* Coherence & Cohesion Box */}
        <div
          className={`bg-[var(--color-card)] border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
            selectedBox === "coherenceCohesion"
              ? "border-pink-500 dark:border-pink-400"
              : "border-[var(--color-border)]"
          }`}
          onClick={() => handleBoxClick("coherenceCohesion")}
          style={{ height: "140px" }}
        >
          <div className="p-3 flex flex-col items-center justify-center h-full">
            <div
              className={`text-3xl font-bold mb-1 ${getScoreColor(
                data.coherenceCohesion
              )}`}
            >
              {formatScore(data.coherenceCohesion)}
            </div>
            <h3 className="text-sm font-semibold text-center">
              Coherence
              <br />& Cohesion
            </h3>
          </div>
        </div>

        {/* Lexical Resource Box */}
        <div
          className={`bg-[var(--color-card)] border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
            selectedBox === "lexicalResource"
              ? "border-pink-500 dark:border-pink-400"
              : "border-[var(--color-border)]"
          }`}
          onClick={() => handleBoxClick("lexicalResource")}
          style={{ height: "140px" }}
        >
          <div className="p-3 flex flex-col items-center justify-center h-full">
            <div
              className={`text-3xl font-bold mb-1 ${getScoreColor(
                data.lexicalResource
              )}`}
            >
              {formatScore(data.lexicalResource)}
            </div>
            <h3 className="text-sm font-semibold text-center">
              Lexical
              <br />
              Resource
            </h3>
          </div>
        </div>

        {/* Grammar Box */}
        <div
          className={`bg-[var(--color-card)] border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
            selectedBox === "grammar"
              ? "border-pink-500 dark:border-pink-400"
              : "border-[var(--color-border)]"
          }`}
          onClick={() => handleBoxClick("grammar")}
          style={{ height: "140px" }}
        >
          <div className="p-3 flex flex-col items-center justify-center h-full">
            <div
              className={`text-3xl font-bold mb-1 ${getScoreColor(
                data.grammar
              )}`}
            >
              {formatScore(data.grammar)}
            </div>
            <h3 className="text-sm font-semibold text-center">
              Grammar Range
              <br />& Accuracy
            </h3>
          </div>
        </div>
      </div>

      {/* Suggestions Dropdown - Shows when a box is selected */}
      {selectedBox && selectedBox !== "overall" && (
        <div
          ref={suggestionsRef}
          className="bg-[var(--color-card)] border-2 border-[var(--color-border)] rounded-lg p-4 space-y-4 overflow-y-auto flex-1 min-h-0"
          style={{
            maxHeight: "250px",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {/* Strengths Section */}
          {data.suggestions[selectedBox as keyof typeof data.suggestions]
            .strengths.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3 text-[var(--color-foreground)] flex items-center gap-2">
                <span className="text-green-600 dark:text-green-400">✓</span>
                What you did well:
              </h4>
              <ul className="space-y-2">
                {data.suggestions[
                  selectedBox as keyof typeof data.suggestions
                ].strengths.map((strength, index) => {
                  const isActive = strength.highlightId === focusedHighlightId;
                  return (
                    <li
                      key={index}
                      className={`flex items-start gap-2 ${
                        strength.highlightId
                          ? `cursor-pointer rounded-md p-2 -m-2 transition-all duration-200 group ${
                              isActive
                                ? "bg-emerald-100 dark:bg-emerald-900/30"
                                : "hover:bg-green-50 dark:hover:bg-green-900/20"
                            }`
                          : ""
                      }`}
                      onClick={() => {
                        if (strength.highlightId && onSuggestionClick) {
                          // Toggle: if clicking the same highlight, clear focus
                          onSuggestionClick(
                            focusedHighlightId === strength.highlightId
                              ? null
                              : strength.highlightId
                          );
                        }
                      }}
                    >
                      <div
                        className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 transition-transform ${
                          isActive
                            ? "bg-emerald-500 scale-125"
                            : "bg-green-500 group-hover:scale-125"
                        }`}
                      ></div>
                      <p
                        className={`text-[var(--color-foreground)] ${
                          strength.highlightId
                            ? isActive
                              ? "font-semibold text-emerald-700 dark:text-emerald-300"
                              : "group-hover:font-medium"
                            : ""
                        }`}
                      >
                        {strength.text}
                        {strength.highlightId && (
                          <span
                            className={`ml-2 text-xs transition-opacity ${
                              isActive
                                ? "text-emerald-600 dark:text-emerald-400 opacity-100"
                                : "text-green-600 dark:text-green-400 opacity-0 group-hover:opacity-100"
                            }`}
                          >
                            {isActive
                              ? "(Highlighted)"
                              : "(Click to highlight)"}
                          </span>
                        )}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Improvements Section */}
          {data.suggestions[selectedBox as keyof typeof data.suggestions]
            .improvements.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3 text-[var(--color-foreground)] flex items-center gap-2">
                <span className="text-pink-500 dark:text-pink-400">→</span>
                What requires improvement:
              </h4>
              <ul className="space-y-2">
                {data.suggestions[
                  selectedBox as keyof typeof data.suggestions
                ].improvements.map((improvement, index) => {
                  const isActive =
                    improvement.highlightId === focusedHighlightId;
                  return (
                    <li
                      key={index}
                      className={`flex items-start gap-2 cursor-pointer rounded-md p-2 -m-2 transition-all duration-200 group ${
                        isActive
                          ? "bg-orange-100 dark:bg-orange-900/30"
                          : "hover:bg-pink-50 dark:hover:bg-pink-900/20"
                      }`}
                      onClick={() => {
                        if (improvement.highlightId && onSuggestionClick) {
                          // Toggle: if clicking the same highlight, clear focus
                          onSuggestionClick(
                            focusedHighlightId === improvement.highlightId
                              ? null
                              : improvement.highlightId
                          );
                        }
                      }}
                    >
                      <div
                        className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 transition-transform ${
                          isActive
                            ? "bg-orange-500 scale-125"
                            : "bg-pink-500 group-hover:scale-125"
                        }`}
                      ></div>
                      <p
                        className={`text-[var(--color-foreground)] ${
                          isActive
                            ? "font-semibold text-orange-700 dark:text-orange-300"
                            : "group-hover:font-medium"
                        }`}
                      >
                        {improvement.text}
                        {improvement.highlightId && (
                          <span
                            className={`ml-2 text-xs transition-opacity ${
                              isActive
                                ? "text-orange-600 dark:text-orange-400 opacity-100"
                                : "text-pink-500 dark:text-pink-400 opacity-0 group-hover:opacity-100"
                            }`}
                          >
                            {isActive
                              ? "(Highlighted)"
                              : "(Click to highlight)"}
                          </span>
                        )}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

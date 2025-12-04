"use client";
import { useEffect, useState, useRef, useMemo } from "react";

interface Highlight {
  text: string;
  type: "needs-improvement" | "good";
  reason?: string;
  id?: string;
}

interface FeedbackData {
  taskResponse: number;
  coherenceCohesion: number;
  lexicalResource: number;
  grammar: number;
  overallScore: number;
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
    taskResponse: 7.0,
    coherenceCohesion: 6.5,
    lexicalResource: 7.0,
    grammar: 6.0,
    overallScore: 6.5,
    feedback:
      "Your essay presents clear ideas but needs stronger logical linking. Vocabulary is appropriate but could be more precise. Grammar errors occur occasionally.",
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

  // Generate suggestions from highlights
  const suggestionsFromHighlights = useMemo(() => {
    // Ensure highlights have IDs
    const highlightsWithIds = highlights.map((h, idx) => ({
      ...h,
      id: h.id || `highlight-${idx}`,
    }));

    // Categorize highlights - most are lexical/grammar related
    // For now, we'll put all "needs-improvement" in lexicalResource improvements
    // and all "good" in lexicalResource strengths
    const lexicalImprovements = highlightsWithIds
      .filter((h) => h.type === "needs-improvement")
      .map((h) => ({
        text: h.reason || `Consider improving: "${h.text}"`,
        highlightId: h.id,
      }));

    const lexicalStrengths = highlightsWithIds
      .filter((h) => h.type === "good")
      .map((h) => ({
        text: h.reason || `Good use of: "${h.text}"`,
        highlightId: h.id,
      }));

    return {
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
        strengths:
          lexicalStrengths.length > 0
            ? lexicalStrengths
            : [{ text: "You used appropriate vocabulary for the topic" }],
        improvements:
          lexicalImprovements.length > 0
            ? lexicalImprovements
            : [
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
    };
  }, [highlights]);

  // Store computed result so React doesn't warn
  const payloadRef = useRef<{ essay: string; feedback: string } | null>(null);

  useEffect(() => {
    const savedEssay = localStorage.getItem("essay") || "";
    const savedFeedback =
      localStorage.getItem("feedback") ||
      "Task Response: 7.0\nCoherence & Cohesion: 6.5\nLexical Resource: 7.0\nGrammar: 6.0\n\nOverall Score: 6.5\n\nFeedback: Your essay presents clear ideas but needs stronger logical linking. Vocabulary is appropriate but could be more precise. Grammar errors occur occasionally.";

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
        const overallMatch = feedbackText.match(/Overall Score:\s*(\d+\.?\d*)/);
        const feedbackMatch = feedbackText.match(/Feedback:\s*([\s\S]+)/);

        setData({
          taskResponse: taskResponseMatch
            ? parseFloat(taskResponseMatch[1])
            : 7.0,
          coherenceCohesion: coherenceMatch
            ? parseFloat(coherenceMatch[1])
            : 6.5,
          lexicalResource: lexicalMatch ? parseFloat(lexicalMatch[1]) : 7.0,
          grammar: grammarMatch ? parseFloat(grammarMatch[1]) : 6.0,
          overallScore: overallMatch ? parseFloat(overallMatch[1]) : 6.5,
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

  const getScoreColor = (score: number) => {
    if (score >= 7.5) return "text-green-600 dark:text-green-400";
    if (score >= 6.5) return "text-blue-600 dark:text-blue-400";
    if (score >= 5.5) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
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
            {data.overallScore}
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
              {data.taskResponse}
            </div>
            <h3 className="text-sm font-semibold text-center">Task Response</h3>
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
              {data.coherenceCohesion}
            </div>
            <h3 className="text-sm font-semibold text-center">
              Coherence & Cohesion
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
              {data.lexicalResource}
            </div>
            <h3 className="text-sm font-semibold text-center">
              Lexical Resource
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
              {data.grammar}
            </div>
            <h3 className="text-sm font-semibold text-center">Grammar Range</h3>
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
                                ? "bg-emerald-100 dark:bg-emerald-900/30 border-2 border-emerald-400 dark:border-emerald-500"
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
                          ? "bg-orange-100 dark:bg-orange-900/30 border-2 border-orange-400 dark:border-orange-500"
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

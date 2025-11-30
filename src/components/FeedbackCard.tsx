"use client";
import { useEffect, useState, useRef } from "react";

export default function FeedbackCard() {
  const [data, setData] = useState({
    essay: "",
    feedback: "",
  });

  // Store computed result so React doesn’t warn
  const payloadRef = useRef<{ essay: string; feedback: string } | null>(null);

  useEffect(() => {
    const savedEssay = localStorage.getItem("essay") || "";

    payloadRef.current = {
      essay: savedEssay,
      feedback:
        "Task Response: 7.0\nCoherence & Cohesion: 6.5\nLexical Resource: 7.0\nGrammar: 6.0\n\nOverall Score: 6.5\n\nFeedback: Your essay presents clear ideas but needs stronger logical linking. Vocabulary is appropriate but could be more precise. Grammar errors occur occasionally.",
    };

    // Set state on next microtask, prevents synchronous render cascade
    Promise.resolve().then(() => {
      if (payloadRef.current) setData(payloadRef.current);
    });
  }, []);

  return (
    <div className="border p-4 rounded shadow">
      <h2 className="text-xl font-semibold mb-2">Essay</h2>
      <p className="whitespace-pre-wrap mb-4">{data.essay}</p>

      <h2 className="text-xl font-semibold mb-2">AI Feedback</h2>
      <p className="whitespace-pre-wrap">{data.feedback}</p>
    </div>
  );
}

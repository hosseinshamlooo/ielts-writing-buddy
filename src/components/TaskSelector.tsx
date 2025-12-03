"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import promptsData from "../prompts.json";
import { useTask } from "@/src/contexts/TaskContext";
import { RefreshCw } from "lucide-react";

// Types
type Prompt = {
  prompt: string;
  image?: string;
};

type PromptsJSON = {
  [key: string]: Prompt[];
};

const prompts = promptsData as PromptsJSON;

export default function TaskSelector() {
  const { task } = useTask();
  const [currentPrompt, setCurrentPrompt] = useState<Prompt>(
    prompts[task]?.[0] || prompts["task1"][0]
  );
  const [isRotating, setIsRotating] = useState(false);

  // Update prompt when task changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (prompts[task] && prompts[task].length > 0) {
        setCurrentPrompt(prompts[task][0]);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [task]);

  // Function to get a new random prompt
  const getNewPrompt = () => {
    if (prompts[task] && prompts[task].length > 0) {
      // Start rotation animation
      setIsRotating(true);

      const availablePrompts = prompts[task];
      // Get a random prompt that's different from the current one
      let newPrompt;
      do {
        const randomIndex = Math.floor(Math.random() * availablePrompts.length);
        newPrompt = availablePrompts[randomIndex];
      } while (
        availablePrompts.length > 1 &&
        newPrompt.prompt === currentPrompt.prompt
      );
      setCurrentPrompt(newPrompt);

      // Stop rotation animation after 500ms
      setTimeout(() => {
        setIsRotating(false);
      }, 100);
    }
  };

  return (
    <div className="flex flex-col min-h-[40rem]">
      {/* Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center mb-4"></div>

      {/* Prompt Card */}
      <div className="rounded-lg" style={{ borderRadius: "0.8rem" }}>
        <div className="flex items-center justify-center gap-3 mb-6">
          <h3 className="text-lg font-semibold">Practice Prompt</h3>
          <button
            onClick={getNewPrompt}
            className="flex items-center gap-3 px-3 py-3 rounded-full text-base bg-[var(--color-selected-bg)] text-[var(--color-selected-text)] hover:opacity-90 transition-all border-0 outline-none font-sans"
            style={{ fontFamily: "var(--font-sans), 'Outfit', sans-serif" }}
            title="Get a new prompt"
          >
            <RefreshCw
              className={`size-5 ${
                isRotating ? "animate-[spin_0.3s_linear_infinite]" : ""
              }`}
            />
          </button>
        </div>
        {currentPrompt.image && (
          <div className="w-full max-w-md mx-auto">
            <Image
              src={currentPrompt.image}
              alt="Task illustration"
              width={600}
              height={400}
              className="rounded-xl"
            />
          </div>
        )}

        <p className="mt-8 text-center whitespace-pre-wrap">
          {currentPrompt.prompt}
        </p>
      </div>
    </div>
  );
}

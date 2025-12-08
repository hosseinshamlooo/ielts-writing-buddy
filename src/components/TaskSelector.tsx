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
  const [mounted, setMounted] = useState(false);

  // Initialize with default to avoid hydration mismatch
  // Always use task1 default on both server and client initially
  const [currentPrompt, setCurrentPrompt] = useState<Prompt>(
    prompts["task1"][0]
  );

  const [isRotating, setIsRotating] = useState(false);

  // Initialize from localStorage only after mount (client-side only)
  useEffect(() => {
    setMounted(true);
    const savedPrompt = localStorage.getItem("currentPrompt");
    const currentTask = localStorage.getItem("selectedTask") || "task1";
    
    if (savedPrompt && prompts[currentTask]) {
      // Check if saved prompt exists in current task prompts
      const promptExists = prompts[currentTask].some(
        (p) => p.prompt === savedPrompt
      );
      if (promptExists) {
        setCurrentPrompt({ prompt: savedPrompt });
        return;
      }
    }
    // Use default prompt for current task
    const defaultPrompt = prompts[currentTask]?.[0] || prompts["task1"][0];
    setCurrentPrompt(defaultPrompt);
  }, []);

  // Save prompt to localStorage when it changes (only after mount)
  useEffect(() => {
    if (mounted && currentPrompt.prompt) {
      localStorage.setItem("currentPrompt", currentPrompt.prompt);
    }
  }, [currentPrompt, mounted]);

  // Update prompt when task changes
  useEffect(() => {
    if (prompts[task] && prompts[task].length > 0) {
      // Use setTimeout to defer state update and avoid cascading renders
      const timer = setTimeout(() => {
        const savedPrompt = localStorage.getItem("currentPrompt");
        // Check if saved prompt exists in new task prompts
        if (savedPrompt) {
          const promptExists = prompts[task].some(
            (p) => p.prompt === savedPrompt
          );
          if (promptExists) {
            setCurrentPrompt({ prompt: savedPrompt });
            return;
          }
        }
        // Use first prompt of new task
        const newPrompt = prompts[task][0];
        setCurrentPrompt(newPrompt);
      }, 0);

      return () => clearTimeout(timer);
    }
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
      // Save prompt to localStorage
      localStorage.setItem("currentPrompt", newPrompt.prompt);

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
            className="flex items-center gap-3 px-3 py-3 rounded-full text-base bg-[var(--color-selected-bg)] text-[var(--color-selected-text)] hover:opacity-90 transition-all border-0 outline-none"
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

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import promptsData from "../prompts.json";
import { useTask } from "@/src/contexts/TaskContext";

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

  // Update prompt when task changes
  useEffect(() => {
    if (prompts[task] && prompts[task].length > 0) {
      setCurrentPrompt(prompts[task][0]);
    }
  }, [task]);

  const generateRandomPrompt = () => {
    const list = prompts[task];
    const randomIndex = Math.floor(Math.random() * list.length);
    setCurrentPrompt(list[randomIndex]);
  };

  return (
    <div className="flex flex-col min-h-[40rem]">
      {/* Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center mb-4">
        <button
          onClick={generateRandomPrompt}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          New Prompt
        </button>
      </div>

      {/* Prompt Card */}
      <div
        className="bg-white dark:bg-gray-800 border border-gray-400 dark:border-gray-600 rounded-lg"
        style={{ borderRadius: "0.8rem" }}
      >
        <h3 className="text-lg font-semibold mb-2">Practice Prompt</h3>
        {currentPrompt.image && (
          <div className="w-full max-w-md mx-auto">
            <Image
              src={currentPrompt.image}
              alt="Task illustration"
              width={600}
              height={400}
              className="rounded border"
            />
          </div>
        )}

        <p className="mb-4 text-center whitespace-pre-wrap">
          {currentPrompt.prompt}
        </p>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Image from "next/image";
import promptsData from "../prompts.json";

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
  const taskOptions = Object.keys(prompts);
  const [task, setTask] = useState<string>("task1");
  const [currentPrompt, setCurrentPrompt] = useState<Prompt>(
    prompts["task1"][0]
  );

  const generateRandomPrompt = () => {
    const list = prompts[task];
    const randomIndex = Math.floor(Math.random() * list.length);
    setCurrentPrompt(list[randomIndex]);
  };

  const handleTaskChange = (value: string) => {
    setTask(value);
    setCurrentPrompt(prompts[value][0]);
  };

  return (
    <div className="flex flex-col gap-4 mx-auto max-w-lg w-full">
      {/* Selector */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <label className="font-medium">Select Task:</label>

        <select
          value={task}
          onChange={(e) => handleTaskChange(e.target.value)}
          className="border p-2 rounded w-full sm:w-auto"
        >
          {taskOptions.map((key) => (
            <option key={key} value={key}>
              {key.toUpperCase()}
            </option>
          ))}
        </select>

        <button
          onClick={generateRandomPrompt}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          New Prompt
        </button>
      </div>

      {/* Prompt Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg mx-auto">
        <h3 className="text-lg font-semibold mb-2">Practice Prompt</h3>
        <p className="mb-4 whitespace-pre-wrap">{currentPrompt.prompt}</p>

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
      </div>
    </div>
  );
}

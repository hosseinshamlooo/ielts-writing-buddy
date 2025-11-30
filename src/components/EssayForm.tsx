"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EssayForm() {
  const [essay, setEssay] = useState("");
  const router = useRouter();

  // Count words
  const wordCount = essay.trim() === "" ? 0 : essay.trim().split(/\s+/).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("essay", essay);
    router.push("/feedback");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-gray-800 rounded-lg flex flex-col items-center shadow mt-10 gap-10"
    >
      <textarea
        value={essay}
        onChange={(e) => setEssay(e.target.value)}
        placeholder="Paste your IELTS essay here..."
        className="border rounded p-3 w-full max-w-[84rem] resize-none h-[20rem] mt-10"
        required
      />
      {/* Word Counter */}
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Word count: {wordCount}
      </p>
      <button className="bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-700">
        Get Feedback
      </button>
    </form>
  );
}

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EssayForm() {
  const [essay, setEssay] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Save essay to localStorage or state manager
    localStorage.setItem("essay", essay);
    router.push("/feedback");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <textarea
        value={essay}
        onChange={(e) => setEssay(e.target.value)}
        placeholder="Paste your IELTS essay here..."
        className="border rounded p-3 h-60"
        required
      />
      <button className="bg-blue-600 text-white py-2 rounded">
        Get Feedback
      </button>
    </form>
  );
}

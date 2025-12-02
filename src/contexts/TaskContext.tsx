"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type TaskContextType = {
  task: string;
  setTask: (task: string) => void;
};

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: ReactNode }) {
  const [task, setTaskState] = useState<string>("task1");

  // Load task from localStorage on mount
  useEffect(() => {
    const savedTask = localStorage.getItem("selectedTask");
    if (savedTask) {
      setTaskState(savedTask);
    }
  }, []);

  // Save task to localStorage when it changes
  const setTask = (newTask: string) => {
    setTaskState(newTask);
    localStorage.setItem("selectedTask", newTask);
  };

  return (
    <TaskContext.Provider value={{ task, setTask }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTask() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error("useTask must be used within a TaskProvider");
  }
  return context;
}


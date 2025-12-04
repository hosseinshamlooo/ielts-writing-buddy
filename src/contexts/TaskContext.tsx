"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

type TaskContextType = {
  task: string;
  setTask: (task: string) => void;
};

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: ReactNode }) {
  // Initialize state with localStorage value to avoid cascading renders
  const [task, setTaskState] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("selectedTask") || "task1";
    }
    return "task1";
  });

  // Sync localStorage when task changes (but not on initial mount)
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedTask", task);
    }
  }, [task]);

  // Save task to localStorage when it changes
  const setTask = (newTask: string) => {
    setTaskState(newTask);
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

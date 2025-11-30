import EssayForm from "@/src/components/EssayForm";
import TaskSelector from "@/src/components/TaskSelector";

export default function Page() {
  return (
    <main className="min-h-screen p-6 flex flex-col gap-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold">
        AI IELTS Writing Feedback Generator
      </h1>
      <TaskSelector />
      <EssayForm />
    </main>
  );
}

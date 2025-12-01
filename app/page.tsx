import EssayForm from "@/src/components/EssayForm";
import TaskSelector from "@/src/components/TaskSelector";

export default function Page() {
  return (
    <main className="min-h-screen flex justify-center bg-gray-50 dark:bg-gray-900 p-6">
      <div className="w-2/3 mx-auto flex flex-col gap-6 mt-16">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-900 dark:text-gray-100">
          AI IELTS Writing Feedback Generator
        </h1>

        <div className="flex flex-row">
          <div className="w-[48%] mr-4">
            <EssayForm />
          </div>
          <div className="w-[48%] ml-4">
            <TaskSelector />
          </div>
        </div>
      </div>
    </main>
  );
}

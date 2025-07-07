import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import Footer from "./components/Footer";
import { Task } from "./types";
import { CloudFog } from "lucide-react";

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const mapPriorityToScore = (priority: string): number => {
    switch (priority) {
      case "urgent":
        return 9;
      case "medium":
        return 6;
      case "low":
      default:
        return 3;
    }
  };

  const mapPriorityScore = (score: number): "low" | "medium" | "urgent" => {
    if (score >= 8) return "urgent";
    if (score >= 5) return "medium";
    return "low";
  };

  const normalizeStatus = (status: string): Task["status"] => {
    return status.replace("_", "-") as Task["status"];
  };

  const denormalizeStatus = (status: Task["status"]) => {
    return status.replace("-", "_");
  };

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const res = await fetch("http://localhost:8000/api/tasks");
        if (!res.ok) throw new Error("Failed to fetch tasks");

        const rawData = await res.json();
        const parsedTasks: Task[] = rawData.map((t: any) => ({
          id: t.id.toString(),
          title: t.title,
          description: t.description,
          checklist_items: t.checklist_items,
          category: t.category?.name || "Uncategorized",
          category_id: t.category?.id || 1, // ✅ capture the numeric category_id
          priority: mapPriorityScore(t.priority_score),
          aiScore: t.priority_score,
          deadline: t.deadline,
          status: normalizeStatus(t.status),
          tags: t.tags || [],
          createdAt: t.created_at || new Date().toISOString(),
          updatedAt: t.updated_at || new Date().toISOString(),
        }));

        setTasks(parsedTasks);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const handleTaskCreate = async (
    taskData: Omit<Task, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      const res = await fetch("http://localhost:8000/api/tasks/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...taskData,
          category_id: taskData.category_id || 1,
          priority_score: mapPriorityToScore(taskData.priority), // ✅ convert priority to score
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to create task:\n${errorText}`);
      }

      const raw = await res.json();
      console.log(raw);
      const newTask: Task = {
        id: raw.id.toString(),
        title: raw.title,
        description: raw.description,
        checklist_items: raw.checklist_items,
        category: raw.category?.name || "Uncategorized",
        category_id: raw.category?.id || 1,
        priority: mapPriorityScore(raw.priority_score),
        deadline: raw.deadline,
        aiScore: raw.priority_score,
        status: normalizeStatus(raw.status),
        tags: raw.tags || [],
        createdAt: raw.created_at || new Date().toISOString(),
        updatedAt: raw.updated_at || new Date().toISOString(),
      };

      setTasks((prev) => [...prev, newTask]);
    } catch (err) {
      console.error("Create Task Error:", err);
    }
  };

  const handleTaskUpdate = async (updatedTask: Task) => {
    try {
      const transformedTask = {
        ...updatedTask,
        status: denormalizeStatus(updatedTask.status),
        created_at: updatedTask.createdAt,
        updated_at: updatedTask.updatedAt,
        priority_score: mapPriorityToScore(updatedTask.priority), // ✅ convert priority to score
      };

      delete (transformedTask as any).createdAt;
      delete (transformedTask as any).updatedAt;
      delete (transformedTask as any).priority; // ✅ remove old priority string

      const res = await fetch(
        `http://localhost:8000/api/tasks/${updatedTask.id}/update`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(transformedTask),
        }
      );

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Failed to update task\n${err}`);
      }

      const raw = await res.json();

      const normalizedTask: Task = {
        id: raw.id.toString(),
        title: raw.title,
        description: raw.description,
        checklist_items: raw.checklist_items,
        category: raw.category?.name || "Uncategorized",
        category_id: raw.category?.id || 1,
        priority: mapPriorityScore(raw.priority_score),
        aiScore: raw.priority_score,
        deadline: raw.deadline,
        status: normalizeStatus(raw.status),
        tags: raw.tags || [],
        createdAt: raw.created_at || new Date().toISOString(),
        updatedAt: raw.updated_at || new Date().toISOString(),
      };

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === normalizedTask.id ? normalizedTask : task
        )
      );
    } catch (err) {
      console.error("Update Task Error:", err);
    }
  };

  const handleTaskDelete = async (taskId: string) => {
    try {
      const res = await fetch(
        `http://localhost:8000/api/tasks/${taskId}/delete`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to delete task:\n${errorText}`);
      }

      // Remove the deleted task from state
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
    } catch (err) {
      console.error("Delete Task Error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <main className="flex-1">
        {loading ? (
          <p className="text-center text-gray-500 mt-10">Loading tasks...</p>
        ) : error ? (
          <p className="text-center text-red-500 mt-10">{error}</p>
        ) : (
          <Dashboard
            tasks={tasks}
            searchQuery={searchQuery}
            onTaskUpdate={handleTaskUpdate}
            onTaskCreate={handleTaskCreate}
            onTaskDelete={handleTaskDelete}
          />
        )}
      </main>
      <Footer />
    </div>
  );
}

export default App;

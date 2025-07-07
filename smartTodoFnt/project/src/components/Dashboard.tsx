import React, { useState } from "react";
import {
  Plus,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Task } from "../types";
import TaskCard from "./TaskCard";
import QuickAddTask from "./QuickAddTask";

interface DashboardProps {
  tasks: Task[];
  onTaskUpdate: (task: Task) => void;
  onTaskCreate: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => void;
  searchQuery: string;
  onTaskDelete: (taskId: string) => void;
  recommendedTask: Task | null;
  fetchRecommendedTask: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  tasks,
  onTaskUpdate,
  onTaskCreate,
  searchQuery,
  onTaskDelete,
  recommendedTask,
  fetchRecommendedTask,
}) => {
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [filter, setFilter] = useState("all");

  const stats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.status === "completed").length,
    pending: tasks.filter((t) => t.status === "pending").length,
    urgent: tasks.filter((t) => t.priority === "urgent").length,
  };

  const filteredTasks = tasks
    .filter((task) => {
      switch (filter) {
        case "urgent":
          return task.priority === "urgent";
        case "today":
          return (
            new Date(task.deadline).toDateString() === new Date().toDateString()
          );
        case "pending":
          return task.status === "pending";
        default:
          return true;
      }
    })
    .filter(
      (task) =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.completed}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.pending}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Urgent</p>
              <p className="text-2xl font-bold text-gray-900">{stats.urgent}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Header with filters */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-gray-900">Your Tasks</h2>
          <div className="flex space-x-2">
            {["all", "urgent", "today", "pending"].map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filter === filterType
                    ? "bg-indigo-100 text-indigo-700"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={() => setShowQuickAdd(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Add Task</span>
        </button>
      </div>

      {/* AI Recommendation Button */}
      <div className="mb-6">
        <button
          onClick={fetchRecommendedTask}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          💡 AI Recommendation
        </button>

        {recommendedTask && (
          <div className="mt-4 bg-green-50 border border-green-300 rounded-lg p-4 shadow-sm">
            <h3 className="text-lg font-semibold text-green-700 mb-1">
              AI Suggests:
            </h3>
            <p className="text-gray-800">
              <strong>{recommendedTask.title}</strong> —{" "}
              <span className="text-sm text-gray-600">
                {recommendedTask.description}
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onUpdate={onTaskUpdate}
            onDelete={onTaskDelete}
          />
        ))}
      </div>

      {/* Quick Add Modal */}
      {showQuickAdd && (
        <QuickAddTask
          onClose={() => setShowQuickAdd(false)}
          onSubmit={onTaskCreate}
        />
      )}
    </div>
  );
};

export default Dashboard;

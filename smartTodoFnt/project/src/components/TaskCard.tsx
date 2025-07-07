import React, { useState } from "react";
import {
  Calendar,
  Tag,
  CheckCircle,
  Circle,
  Clock,
  Brain,
  Edit,
  Trash,
  MoreVertical,
  Play,
  Pause,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Task } from "../types";
import TaskEditModal from "./TaskEditModal";

interface TaskCardProps {
  task: Task;
  onUpdate: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onUpdate, onDelete }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [expandedChecklist, setExpandedChecklist] = useState(false);

  const priorityColors = {
    low: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-orange-100 text-orange-800",
    urgent: "bg-red-100 text-red-800",
  };

  const statusConfig = {
    pending: {
      icon: Circle,
      color: "text-gray-400 hover:text-gray-600",
      bgColor: "bg-gray-100",
    },
    "in-progress": {
      icon: Play,
      color: "text-blue-500 hover:text-blue-600",
      bgColor: "bg-blue-100",
    },
    completed: {
      icon: CheckCircle,
      color: "text-green-600 hover:text-green-700",
      bgColor: "bg-green-100",
    },
  };

  const StatusIcon = statusConfig[task.status].icon;

  const handleStatusCycle = async () => {
    const statusOrder: Array<Task["status"]> = [
      "pending",
      "in-progress",
      "completed",
    ];
    const currentIndex = statusOrder.indexOf(task.status);
    const nextIndex = (currentIndex + 1) % statusOrder.length;
    const newStatus = statusOrder[nextIndex];

    await onUpdate({
      ...task,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    });
  };
  const handleChecklistItemToggle = (itemId: string) => {
    const updatedChecklistItems =
      task.checklist_items?.map((item) =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      ) || [];

    onUpdate({
      ...task,
      checklist_items: updatedChecklistItems,
      updatedAt: new Date().toISOString(),
    });
  };

  const isOverdue =
    new Date(task.deadline) < new Date() && task.status !== "completed";
  const completedItems =
    task.checklist_items?.filter((item) => item.completed).length || 0;
  const totalItems = task.checklist_items?.length || 0;
  const isCompleted = task.status === "completed";

  const displayItems = expandedChecklist
    ? task.checklist_items
    : task.checklist_items?.slice(0, 3);
  const hiddenItemsCount = Math.max(0, totalItems - 3);
  return (
    <>
      <div
        className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-300 relative ${
          isCompleted ? "bg-gray-50 border-gray-300" : ""
        }`}
      >
        {/* Completed Task Overlay Effect */}
        {isCompleted && (
          <div className="absolute inset-0 bg-green-50 bg-opacity-40 rounded-lg pointer-events-none backdrop-opacity-50"></div>
        )}

        <div className="flex items-start justify-between mb-3 relative z-10">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleStatusCycle}
              className={`p-1 rounded-full transition-colors ${
                statusConfig[task.status].color
              } ${isCompleted ? "bg-green-100" : ""}`}
              title={`Status: ${task.status} (click to cycle)`}
            >
              <StatusIcon className="h-5 w-5" />
            </button>
            <div className="flex items-center space-x-2">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  isCompleted
                    ? "bg-gray-200 text-gray-600"
                    : priorityColors[task.priority]
                }`}
              >
                {task.priority}
              </span>
              <div className="flex items-center space-x-1">
                <Brain
                  className={`h-4 w-4 ${
                    isCompleted ? "text-gray-400" : "text-indigo-500"
                  }`}
                />
                <span
                  className={`text-sm font-medium ${
                    isCompleted ? "text-gray-500" : "text-indigo-600"
                  }`}
                >
                  {task.aiScore}/10
                </span>
              </div>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className={`p-1 rounded-full transition-colors ${
                isCompleted
                  ? "text-gray-400 hover:text-gray-500 hover:bg-gray-200"
                  : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              }`}
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 min-w-[120px]">
                <button
                  onClick={() => {
                    setShowEditModal(true);
                    setShowMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit Task</span>
                </button>
                <button
                  onClick={() => {
                    onDelete(task.id);
                    setShowMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                >
                  <Trash className="h-4 w-4" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2 mb-2 relative z-10">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              isCompleted
                ? "bg-green-200 text-green-700"
                : `${statusConfig[task.status].bgColor} ${
                    statusConfig[task.status].color
                  }`
            }`}
          >
            {isCompleted
              ? "✓ " + task.status.replace("-", " ")
              : task.status.replace("-", " ")}
          </span>
          {/* {isCompleted && (
            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
              ✓ Completed
            </span>
          )} */}
        </div>

        <h3
          className={`text-lg font-semibold mb-2 transition-all duration-300 relative z-10 ${
            isCompleted ? "text-gray-500 line-through" : "text-gray-900"
          }`}
        >
          {task.title}
        </h3>

        <p
          className={`text-sm mb-4 line-clamp-2 relative z-10 transition-all duration-300 ${
            isCompleted ? "text-gray-400" : "text-gray-600"
          }`}
        >
          {task.description}
        </p>

        {/* Checklist Progress */}
        {task.checklist_items && task.checklist_items.length > 0 && (
          <div className="mb-4 relative z-10">
            <div className="flex items-center justify-between mb-2">
              <span
                className={`text-sm font-medium ${
                  isCompleted ? "text-gray-500" : "text-gray-700"
                }`}
              >
                Checklist
              </span>
              <span
                className={`text-xs ${
                  isCompleted ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {completedItems}/{totalItems}
              </span>
            </div>
            <div
              className={`w-full rounded-full h-2 mb-3 ${
                isCompleted ? "bg-gray-300" : "bg-gray-200"
              }`}
            >
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  isCompleted ? "bg-green-400" : "bg-indigo-600"
                }`}
                style={{
                  width:
                    totalItems > 0
                      ? `${(completedItems / totalItems) * 100}%`
                      : "0%",
                }}
              ></div>
            </div>

            <div className="space-y-2">
              {displayItems?.map((item) => (
                <div key={item.id} className="flex items-center space-x-2">
                  <button
                    onClick={() => handleChecklistItemToggle(item.id)}
                    className={`flex-shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                      item.completed
                        ? isCompleted
                          ? "bg-green-500 border-green-500 text-white"
                          : "bg-indigo-600 border-indigo-600 text-white"
                        : isCompleted
                        ? "border-gray-400 hover:border-gray-500"
                        : "border-gray-300 hover:border-indigo-400"
                    }`}
                  >
                    {item.completed && <CheckCircle className="h-3 w-3" />}
                  </button>
                  <span
                    className={`text-xs flex-1 transition-all duration-300 ${
                      item.completed
                        ? isCompleted
                          ? "line-through text-gray-400"
                          : "line-through text-gray-500"
                        : isCompleted
                        ? "text-gray-500"
                        : "text-gray-700"
                    }`}
                  >
                    {item.text}
                  </span>
                </div>
              ))}

              {!expandedChecklist && hiddenItemsCount > 0 && (
                <button
                  onClick={() => setExpandedChecklist(true)}
                  className={`flex items-center space-x-1 text-xs font-medium pl-6 py-1 transition-colors ${
                    isCompleted
                      ? "text-gray-500 hover:text-gray-600"
                      : "text-indigo-600 hover:text-indigo-700"
                  }`}
                >
                  <ChevronDown className="h-3 w-3" />
                  <span>+{hiddenItemsCount} more items</span>
                </button>
              )}

              {expandedChecklist && totalItems > 3 && (
                <button
                  onClick={() => setExpandedChecklist(false)}
                  className={`flex items-center space-x-1 text-xs font-medium pl-6 py-1 transition-colors ${
                    isCompleted
                      ? "text-gray-500 hover:text-gray-600"
                      : "text-indigo-600 hover:text-indigo-700"
                  }`}
                >
                  <ChevronUp className="h-3 w-3" />
                  <span>Show less</span>
                </button>
              )}
            </div>
          </div>
        )}

        <div
          className={`flex items-center justify-between text-sm mb-3 relative z-10 transition-all duration-300 ${
            isCompleted ? "text-gray-400" : "text-gray-500"
          }`}
        >
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span
              className={`${
                isOverdue && !isCompleted
                  ? "text-red-600 font-medium"
                  : isCompleted
                  ? "text-gray-400"
                  : ""
              }`}
            >
              {new Date(task.deadline).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <Tag className="h-4 w-4" />
            <span>{task.category || "Uncategorized"}</span>
          </div>
        </div>

        {task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 relative z-10">
            {task.tags.map((tag, index) => (
              <span
                key={index}
                className={`px-2 py-1 rounded-full text-xs transition-all duration-300 ${
                  isCompleted
                    ? "bg-gray-200 text-gray-500"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <TaskEditModal
          task={task}
          onClose={() => setShowEditModal(false)}
          onUpdate={onUpdate}
        />
      )}
    </>
  );
};

export default TaskCard;

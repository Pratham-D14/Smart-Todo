import React, { useState } from "react";
import { X, Brain, Sparkles, Plus, Trash2, CheckCircle } from "lucide-react";
import { Task, ChecklistItem } from "../types";

interface QuickAddTaskProps {
  onClose: () => void;
  onSubmit: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => void;
}

const QuickAddTask: React.FC<QuickAddTaskProps> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "work",
    priority: "medium" as const,
    deadline: "",
    tags: [] as string[],
    checklist_items: [] as ChecklistItem[],
  });

  const [newChecklistItem, setNewChecklistItem] = useState("");
  const [aiSuggestions] = useState({
    priority: "medium",
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    category: "work",
    enhancedDescription: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      status: "pending",
      aiScore: Math.floor(Math.random() * 10) + 1,
      tags: formData.tags.filter((tag) => tag.trim() !== ""),
      checklist_items: formData.checklist_items,
      category_id: 1, // TODO: Replace with actual category ID logic
    });
    onClose();
  };

  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && e.currentTarget.value.trim()) {
      e.preventDefault();
      const newTag = e.currentTarget.value.trim();
      if (!formData.tags.includes(newTag)) {
        setFormData((prev) => ({
          ...prev,
          tags: [...prev.tags, newTag],
        }));
      }
      e.currentTarget.value = "";
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const addChecklistItem = () => {
    if (newChecklistItem.trim()) {
      const newItem: ChecklistItem = {
        id: Date.now().toString(),
        text: newChecklistItem.trim(),
        completed: false,
      };
      setFormData((prev) => ({
        ...prev,
        checklist_items: [...prev.checklist_items, newItem],
      }));
      setNewChecklistItem("");
    }
  };

  const removeChecklistItem = (itemId: string) => {
    setFormData((prev) => ({
      ...prev,
      checklist_items: prev.checklist_items.filter(
        (item) => item.id !== itemId
      ),
    }));
  };

  const toggleChecklistItem = (itemId: string) => {
    setFormData((prev) => ({
      ...prev,
      checklist_items: prev.checklist_items.map((item) =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      ),
    }));
  };

  const updateChecklistItemText = (itemId: string, newText: string) => {
    setFormData((prev) => ({
      ...prev,
      checklist_items: prev.checklist_items.map((item) =>
        item.id === itemId ? { ...item, text: newText } : item
      ),
    }));
  };

  const applyAISuggestion = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Add New Task</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Enter task title..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              rows={3}
              placeholder="Describe your task..."
            />
            {aiSuggestions.enhancedDescription && (
              <div className="mt-2 p-3 bg-indigo-50 rounded-md">
                <div className="flex items-center space-x-2 mb-2">
                  <Brain className="h-4 w-4 text-indigo-600" />
                  <span className="text-sm font-medium text-indigo-800">
                    AI Enhancement
                  </span>
                </div>
                <p className="text-sm text-indigo-700 mb-2">
                  {aiSuggestions.enhancedDescription}
                </p>
                <button
                  type="button"
                  onClick={() =>
                    applyAISuggestion(
                      "description",
                      aiSuggestions.enhancedDescription
                    )
                  }
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Apply Suggestion
                </button>
              </div>
            )}
          </div>

          {/* Checklist Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Checklist Items (Optional)
            </label>
            <div className="space-y-2 mb-3">
              {formData.checklist_items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md"
                >
                  <button
                    type="button"
                    onClick={() => toggleChecklistItem(item.id)}
                    className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center ${
                      item.completed
                        ? "bg-indigo-600 border-indigo-600 text-white"
                        : "border-gray-300 hover:border-indigo-400"
                    }`}
                  >
                    {item.completed && <CheckCircle className="h-3 w-3" />}
                  </button>
                  <input
                    type="text"
                    value={item.text}
                    onChange={(e) =>
                      updateChecklistItemText(item.id, e.target.value)
                    }
                    className={`flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-indigo-500 focus:border-transparent ${
                      item.completed ? "line-through text-gray-500" : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => removeChecklistItem(item.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex space-x-2">
              <input
                type="text"
                value={newChecklistItem}
                onChange={(e) => setNewChecklistItem(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addChecklistItem())
                }
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                placeholder="Add checklist item and press Enter..."
              />
              <button
                type="button"
                onClick={addChecklistItem}
                className="px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, category: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="work">Work</option>
                <option value="personal">Personal</option>
                <option value="health">Health</option>
                <option value="learning">Learning</option>
                <option value="shopping">Shopping</option>
                <option value="other">Other</option>
              </select>
              {aiSuggestions.category !== formData.category && (
                <div className="mt-2 flex items-center space-x-2">
                  <Sparkles className="h-4 w-4 text-indigo-500" />
                  <span className="text-sm text-indigo-600">
                    AI suggests: {aiSuggestions.category}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      applyAISuggestion("category", aiSuggestions.category)
                    }
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    priority: e.target.value as any,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
              {aiSuggestions.priority !== formData.priority && (
                <div className="mt-2 flex items-center space-x-2">
                  <Sparkles className="h-4 w-4 text-indigo-500" />
                  <span className="text-sm text-indigo-600">
                    AI suggests: {aiSuggestions.priority}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      applyAISuggestion("priority", aiSuggestions.priority)
                    }
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deadline
            </label>
            <input
              type="date"
              value={formData.deadline}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, deadline: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
            {aiSuggestions.deadline !== formData.deadline && (
              <div className="mt-2 flex items-center space-x-2">
                <Sparkles className="h-4 w-4 text-indigo-500" />
                <span className="text-sm text-indigo-600">
                  AI suggests:{" "}
                  {new Date(aiSuggestions.deadline).toLocaleDateString()}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    applyAISuggestion("deadline", aiSuggestions.deadline)
                  }
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Apply
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <input
              type="text"
              onKeyDown={handleTagInput}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Type and press Enter to add tags..."
            />
            {formData.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm flex items-center space-x-1"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuickAddTask;

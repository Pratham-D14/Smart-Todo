export interface Task {
  id: string;
  title: string;
  description: string;
  category_id: number; // for backend use
  category: string; // readable name for UI
  priority: "low" | "medium" | "high" | "urgent";
  deadline: string;
  status: "pending" | "in_progress" | "completed";
  tags: string[];
  createdAt: string;
  updatedAt: string;
  checklist_items?: {
    id: string;
    text: string;
    completed: boolean;
  }[];
  aiScore?: number;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface ContextEntry {
  id: string;
  content: string;
  source: "whatsapp" | "email" | "notes";
  timestamp: string;
  processed: boolean;
  insights?: string[];
}

export interface Category {
  id: string;
  name: string;
  color: string;
  count: number;
}

export interface AIsuggestion {
  type: "priority" | "deadline" | "category" | "description";
  value: string;
  confidence: number;
  reasoning: string;
}

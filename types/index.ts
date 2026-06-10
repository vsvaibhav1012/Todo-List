export type Priority = "LOW" | "MEDIUM" | "HIGH";

export interface User {
  id: string;
  email: string;
  displayName: string | null;
  createdAt: string;
}

export interface Todo {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  completed: boolean;
  priority: Priority;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiError {
  error: { code: string; message: string };
}

export interface TodoFilters {
  completed?: boolean;
  priority?: Priority;
  search?: string;
  sortBy?: "createdAt" | "dueDate" | "priority";
  order?: "asc" | "desc";
}

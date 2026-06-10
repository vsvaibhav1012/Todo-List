"use client";

import { useGetTodosQuery } from "@/store/api/todosApi";
import { TodoItem } from "./TodoItem";
import { TodoSkeleton } from "./TodoSkeleton";
import type { TodoFilters } from "@/types";
import { ClipboardList } from "lucide-react";

export function TodoList({ filters }: { filters: TodoFilters }) {
  const { data, isLoading, isError, error } = useGetTodosQuery(filters);

  if (isLoading) return <TodoSkeleton />;

  if (isError) {
    const msg = (error as { data?: { error?: { message?: string } } })?.data?.error?.message ?? "Failed to load todos.";
    return (
      <div className="text-center py-12 text-destructive text-sm" role="alert">
        {msg}
      </div>
    );
  }

  const todos = data?.todos ?? [];

  if (todos.length === 0) {
    return (
      <div className="text-center py-12 space-y-2" role="status">
        <ClipboardList className="h-10 w-10 text-muted-foreground mx-auto" />
        <p className="text-muted-foreground text-sm">
          {filters.search || filters.completed !== undefined || filters.priority
            ? "No todos match your filters."
            : "No todos yet — add your first one!"}
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-2" aria-label="Todo list">
      {todos.map((todo) => (
        <li key={todo.id}>
          <TodoItem todo={todo} />
        </li>
      ))}
    </ul>
  );
}

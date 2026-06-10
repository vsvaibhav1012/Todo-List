"use client";

import { useState } from "react";
import { TodoCreateForm } from "@/components/todos/TodoCreateForm";
import { TodoFilters } from "@/components/todos/TodoFilters";
import { TodoList } from "@/components/todos/TodoList";
import type { TodoFilters as Filters } from "@/types";

export default function TodosPage() {
  const [filters, setFilters] = useState<Filters>({
    sortBy: "createdAt",
    order: "desc",
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Todos</h1>
        <p className="text-muted-foreground mt-1">Manage your tasks</p>
      </div>
      <TodoCreateForm />
      <TodoFilters filters={filters} onChange={setFilters} />
      <TodoList filters={filters} />
    </div>
  );
}

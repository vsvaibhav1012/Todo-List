"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useCreateTodoMutation } from "@/store/api/todosApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Priority } from "@/types";

const PRIORITIES: { value: Priority; label: string; classes: string; active: string }[] = [
  {
    value: "LOW",
    label: "Low",
    classes: "border-green-200 text-green-700 hover:bg-green-50 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-950",
    active: "bg-green-100 border-green-400 text-green-800 dark:bg-green-900 dark:border-green-500 dark:text-green-200",
  },
  {
    value: "MEDIUM",
    label: "Medium",
    classes: "border-yellow-200 text-yellow-700 hover:bg-yellow-50 dark:border-yellow-800 dark:text-yellow-400 dark:hover:bg-yellow-950",
    active: "bg-yellow-100 border-yellow-400 text-yellow-800 dark:bg-yellow-900 dark:border-yellow-500 dark:text-yellow-200",
  },
  {
    value: "HIGH",
    label: "High",
    classes: "border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950",
    active: "bg-red-100 border-red-400 text-red-800 dark:bg-red-900 dark:border-red-500 dark:text-red-200",
  },
];

export function TodoCreateForm() {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [create, { isLoading }] = useCreateTodoMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    try {
      await create({
        title: trimmed,
        priority,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      }).unwrap();
      setTitle("");
      setPriority("MEDIUM");
      setDueDate("");
      toast.success("Todo added");
    } catch (err: unknown) {
      const msg = (err as { data?: { error?: { message?: string } } })?.data?.error?.message ?? "Failed to add todo.";
      toast.error(msg);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border bg-card p-3 space-y-3">
      {/* Title row */}
      <div className="flex gap-2">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a new todo..."
          maxLength={200}
          aria-label="New todo title"
          className="flex-1"
        />
        <Button type="submit" disabled={isLoading || !title.trim()} size="icon" aria-label="Add todo">
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        </Button>
      </div>

      {/* Priority + due date — always visible */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Priority pills */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground font-medium">Priority:</span>
          {PRIORITIES.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setPriority(p.value)}
              className={cn(
                "text-xs px-2.5 py-1 rounded-full border font-medium transition-colors",
                priority === p.value ? p.active : p.classes
              )}
              aria-pressed={priority === p.value}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Due date */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground font-medium">
            Due date <span className="font-normal opacity-60">(optional)</span>
          </span>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            className="text-xs border rounded-md px-2 py-1 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Due date (optional)"
          />
          {dueDate && (
            <button
              type="button"
              onClick={() => setDueDate("")}
              className="text-xs text-muted-foreground hover:text-foreground"
              aria-label="Clear due date"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </form>
  );
}

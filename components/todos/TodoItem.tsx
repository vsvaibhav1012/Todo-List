"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { useUpdateTodoMutation, useDeleteTodoMutation } from "@/store/api/todosApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { Trash2, Pencil, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { Todo, Priority } from "@/types";

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

const PRIORITY_VARIANT: Record<Priority, "low" | "medium" | "high"> = {
  LOW: "low", MEDIUM: "medium", HIGH: "high",
};

export function TodoItem({ todo }: { todo: Todo }) {
  const [update, { isLoading: isUpdating }] = useUpdateTodoMutation();
  const [deleteTodo, { isLoading: isDeleting }] = useDeleteTodoMutation();

  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editPriority, setEditPriority] = useState<Priority>(todo.priority);
  const [showDelete, setShowDelete] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync local edit state if the todo updates from server
  useEffect(() => {
    if (!editing) {
      setEditTitle(todo.title);
      setEditPriority(todo.priority);
    }
  }, [todo.title, todo.priority, editing]);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const handleToggle = async () => {
    try {
      await update({ id: todo.id, completed: !todo.completed }).unwrap();
    } catch {
      toast.error("Failed to update todo.");
    }
  };

  const handleSaveEdit = async () => {
    const trimmed = editTitle.trim();
    if (!trimmed) {
      setEditTitle(todo.title);
      setEditPriority(todo.priority);
      setEditing(false);
      return;
    }
    const titleChanged = trimmed !== todo.title;
    const priorityChanged = editPriority !== todo.priority;
    if (!titleChanged && !priorityChanged) {
      setEditing(false);
      return;
    }
    try {
      await update({
        id: todo.id,
        ...(titleChanged ? { title: trimmed } : {}),
        ...(priorityChanged ? { priority: editPriority } : {}),
      }).unwrap();
      setEditing(false);
    } catch {
      toast.error("Failed to update todo.");
      setEditTitle(todo.title);
      setEditPriority(todo.priority);
    }
  };

  const handlePriorityChange = async (p: Priority) => {
    if (p === todo.priority) return;
    try {
      await update({ id: todo.id, priority: p }).unwrap();
    } catch {
      toast.error("Failed to update priority.");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTodo(todo.id).unwrap();
      toast.success("Todo deleted.");
    } catch {
      toast.error("Failed to delete todo.");
    } finally {
      setShowDelete(false);
    }
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSaveEdit();
    if (e.key === "Escape") {
      setEditTitle(todo.title);
      setEditPriority(todo.priority);
      setEditing(false);
    }
  };

  return (
    <>
      <div
        className={cn(
          "group flex items-start gap-3 p-4 rounded-lg border bg-card transition-opacity",
          (isUpdating || isDeleting) && "opacity-60"
        )}
      >
        {/* Complete toggle */}
        <button
          onClick={handleToggle}
          disabled={isUpdating}
          aria-label={todo.completed ? "Mark incomplete" : "Mark complete"}
          className={cn(
            "mt-0.5 flex-shrink-0 h-5 w-5 rounded border-2 flex items-center justify-center transition-colors",
            todo.completed
              ? "bg-primary border-primary text-primary-foreground"
              : "border-muted-foreground hover:border-primary"
          )}
        >
          {todo.completed && <Check className="h-3 w-3" />}
        </button>

        <div className="flex-1 min-w-0">
          {/* Title */}
          {editing ? (
            <Input
              ref={inputRef}
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleSaveEdit}
              onKeyDown={handleEditKeyDown}
              maxLength={200}
              className="h-7 py-0 text-sm mb-2"
              aria-label="Edit todo title"
            />
          ) : (
            <p
              className={cn(
                "text-sm font-medium break-words mb-1.5",
                todo.completed && "line-through text-muted-foreground"
              )}
            >
              {todo.title}
            </p>
          )}

          {/* Priority pills — inline edit when in editing mode, clickable otherwise */}
          <div className="flex flex-wrap items-center gap-2">
            {editing ? (
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">Priority:</span>
                {PRIORITIES.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()} // prevent input blur
                    onClick={() => setEditPriority(p.value)}
                    className={cn(
                      "text-xs px-2 py-0.5 rounded-full border font-medium transition-colors",
                      editPriority === p.value ? p.active : p.classes
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-1" role="group" aria-label="Priority">
                {PRIORITIES.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    disabled={isUpdating}
                    onClick={() => handlePriorityChange(p.value)}
                    className={cn(
                      "text-xs px-2 py-0.5 rounded-full border font-medium transition-colors",
                      todo.priority === p.value ? p.active : p.classes,
                      "opacity-0 group-hover:opacity-100 transition-opacity",
                      todo.priority === p.value && "opacity-100"
                    )}
                    aria-pressed={todo.priority === p.value}
                    aria-label={`Set priority to ${p.label}`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            )}

            {todo.dueDate && (
              <span className="text-xs text-muted-foreground">
                Due {format(new Date(todo.dueDate), "MMM d")}
              </span>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {editing ? (
            <>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleSaveEdit} aria-label="Save">
                <Check className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost" size="icon" className="h-7 w-7"
                onClick={() => { setEditTitle(todo.title); setEditPriority(todo.priority); setEditing(false); }}
                aria-label="Cancel"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </>
          ) : (
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditing(true)} aria-label="Edit todo">
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button
            variant="ghost" size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={() => setShowDelete(true)}
            aria-label="Delete todo"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <DeleteConfirmModal
        open={showDelete}
        onOpenChange={setShowDelete}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title={todo.title}
      />
    </>
  );
}

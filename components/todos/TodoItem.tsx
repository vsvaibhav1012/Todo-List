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
import type { Todo } from "@/types";

const PRIORITY_LABEL: Record<string, string> = { LOW: "Low", MEDIUM: "Medium", HIGH: "High" };
const PRIORITY_VARIANT: Record<string, "low" | "medium" | "high"> = {
  LOW: "low", MEDIUM: "medium", HIGH: "high",
};

export function TodoItem({ todo }: { todo: Todo }) {
  const [update, { isLoading: isUpdating }] = useUpdateTodoMutation();
  const [deleteTodo, { isLoading: isDeleting }] = useDeleteTodoMutation();

  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [showDelete, setShowDelete] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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
      setEditing(false);
      return;
    }
    if (trimmed === todo.title) {
      setEditing(false);
      return;
    }
    try {
      await update({ id: todo.id, title: trimmed }).unwrap();
      setEditing(false);
    } catch {
      toast.error("Failed to update title.");
      setEditTitle(todo.title);
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
          {editing ? (
            <Input
              ref={inputRef}
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleSaveEdit}
              onKeyDown={handleEditKeyDown}
              maxLength={200}
              className="h-7 py-0 text-sm"
              aria-label="Edit todo title"
            />
          ) : (
            <p
              className={cn(
                "text-sm font-medium break-words",
                todo.completed && "line-through text-muted-foreground"
              )}
            >
              {todo.title}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            <Badge variant={PRIORITY_VARIANT[todo.priority]}>
              {PRIORITY_LABEL[todo.priority]}
            </Badge>
            {todo.dueDate && (
              <span className="text-xs text-muted-foreground">
                Due {format(new Date(todo.dueDate), "MMM d")}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {editing ? (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={handleSaveEdit}
                aria-label="Save edit"
              >
                <Check className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => { setEditTitle(todo.title); setEditing(false); }}
                aria-label="Cancel edit"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setEditing(true)}
              aria-label="Edit todo"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
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

"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useCreateTodoMutation } from "@/store/api/todosApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Loader2 } from "lucide-react";

export function TodoCreateForm() {
  const [title, setTitle] = useState("");
  const [create, { isLoading }] = useCreateTodoMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    try {
      await create({ title: trimmed }).unwrap();
      setTitle("");
      toast.success("Todo added");
    } catch (err: unknown) {
      const msg = (err as { data?: { error?: { message?: string } } })?.data?.error?.message ?? "Failed to add todo.";
      toast.error(msg);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
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
    </form>
  );
}

import { baseApi } from "./baseApi";
import type { Todo, TodoFilters } from "@/types";
import type { CreateTodoInput, UpdateTodoInput } from "@/validation/todo";

interface TodosResponse {
  todos: Todo[];
}

interface TodoResponse {
  todo: Todo;
}

export const todosApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getTodos: build.query<TodosResponse, TodoFilters>({
      query: (filters) => {
        const params = new URLSearchParams();
        if (filters.completed !== undefined) params.set("completed", String(filters.completed));
        if (filters.priority) params.set("priority", filters.priority);
        if (filters.search) params.set("search", filters.search);
        if (filters.sortBy) params.set("sortBy", filters.sortBy);
        if (filters.order) params.set("order", filters.order);
        return `/todos?${params.toString()}`;
      },
      providesTags: (result) =>
        result
          ? [...result.todos.map(({ id }) => ({ type: "Todo" as const, id })), { type: "Todo", id: "LIST" }]
          : [{ type: "Todo", id: "LIST" }],
    }),

    createTodo: build.mutation<TodoResponse, CreateTodoInput>({
      query: (body) => ({ url: "/todos", method: "POST", body }),
      invalidatesTags: [{ type: "Todo", id: "LIST" }],
    }),

    updateTodo: build.mutation<TodoResponse, { id: string } & UpdateTodoInput>({
      query: ({ id, ...body }) => ({ url: `/todos/${id}`, method: "PATCH", body }),
      async onQueryStarted({ id, ...patch }, { dispatch, queryFulfilled, getState }) {
        // Optimistic update across all cached todo queries
        const patchResults: ReturnType<typeof dispatch>[] = [];
        const state = getState() as Record<string, unknown>;
        const apiState = (state as { api: { queries: Record<string, { data?: TodosResponse }> } }).api?.queries ?? {};

        for (const key of Object.keys(apiState)) {
          if (!key.startsWith("getTodos")) continue;
          const patch1 = dispatch(
            todosApi.util.updateQueryData("getTodos", {} as TodoFilters, (draft) => {
              const todo = draft.todos.find((t) => t.id === id);
              if (todo) Object.assign(todo, patch, { updatedAt: new Date().toISOString() });
            })
          );
          patchResults.push(patch1);
        }

        try {
          await queryFulfilled;
        } catch {
          patchResults.forEach((p) => (p as { undo: () => void }).undo());
        }
      },
      invalidatesTags: (_, __, { id }) => [{ type: "Todo", id }],
    }),

    deleteTodo: build.mutation<void, string>({
      query: (id) => ({ url: `/todos/${id}`, method: "DELETE" }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          todosApi.util.updateQueryData("getTodos", {} as TodoFilters, (draft) => {
            draft.todos = draft.todos.filter((t) => t.id !== id);
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: (_, __, id) => [{ type: "Todo", id }, { type: "Todo", id: "LIST" }],
    }),

    markAllComplete: build.mutation<{ count: number }, void>({
      query: () => ({ url: "/todos/bulk/complete", method: "POST" }),
      invalidatesTags: [{ type: "Todo", id: "LIST" }],
    }),
  }),
});

export const {
  useGetTodosQuery,
  useCreateTodoMutation,
  useUpdateTodoMutation,
  useDeleteTodoMutation,
} = todosApi;

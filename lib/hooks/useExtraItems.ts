// 📁 lib/hooks/useExtraItems.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { ExtraItem, ExtraItemCategory } from "@/types";

// ── Query keys ────────────────────────────────────────────────────────────────

export const extraItemKeys = {
  all: ["extra-items"] as const,
  list: (params?: { category?: string }) => ["extra-items", params] as const,
  categories: ["extra-item-categories"] as const,
};

// ── Queries ───────────────────────────────────────────────────────────────────

export function useExtraItems(params?: { category?: string }) {
  return useQuery<ExtraItem[]>({
    queryKey: extraItemKeys.list(params),
    queryFn: async () => {
      const { data } = await api.get("/extra-items", { params });
      return data.data.items;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useExtraItemCategories() {
  return useQuery<ExtraItemCategory[]>({
    queryKey: extraItemKeys.categories,
    queryFn: async () => {
      const { data } = await api.get("/extra-items-categories");
      return data.data.categories;
    },
    staleTime: 5 * 60 * 1000,
  });
}

// ── Extra Item Category Mutations ─────────────────────────────────────────────

export function useCreateExtraItemCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string }) =>
      api
        .post("/extra-items-categories", payload)
        .then((r) => r.data.data.category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: extraItemKeys.all });
      queryClient.invalidateQueries({ queryKey: extraItemKeys.categories });
    },
  });
}

export function useUpdateExtraItemCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      api.patch(`/extra-items-categories/${id}`, { name }).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: extraItemKeys.all });
      queryClient.invalidateQueries({ queryKey: extraItemKeys.categories });
    },
  });
}

export function useDeleteExtraItemCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/extra-items-categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: extraItemKeys.categories });
      queryClient.invalidateQueries({ queryKey: extraItemKeys.all });
    },
  });
}

// ── Extra Item Mutations ──────────────────────────────────────────────────────

export interface CreateExtraItemPayload {
  name: string;
  price: number;
  description?: string;
  category: string; // ExtraItemCategory ObjectId
}

export function useCreateExtraItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateExtraItemPayload) =>
      api.post("/extra-items", payload).then((r) => r.data.data.item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: extraItemKeys.all });
    },
  });
}

export function useUpdateExtraItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<CreateExtraItemPayload>;
    }) => api.patch(`/extra-items/${id}`, payload).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: extraItemKeys.all });
    },
  });
}

export function useDeleteExtraItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/extra-items/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: extraItemKeys.all });
      queryClient.invalidateQueries({ queryKey: extraItemKeys.categories });
    },
  });
}

// Re-export types for convenience
export type { ExtraItem, ExtraItemCategory };

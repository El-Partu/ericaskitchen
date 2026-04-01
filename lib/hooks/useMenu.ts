// 📁 lib/hooks/useMenu.ts

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { get, post } from "@/lib/api";
import type {
  Category,
  MenuItem,
  MenuItemFilters,
  MenuItemsResponse,
  DailySpecial,
  Testimonial,
  ApiListResponse,
  ApiResponse,
} from "@/types";

export const queryKeys = {
  categories: ["categories"] as const,
  menuItems: (filters?: MenuItemFilters) =>
    filters ? ["menu-items", filters] : ["menu-items"],
  menuItem: (idOrSlug: string) => ["menu-items", idOrSlug] as const,
  dailySpecials: ["daily-specials", "today"] as const,
  testimonials: ["testimonials", "featured"] as const,
  likeStatus: (menuItemId: string) => ["likes", "status", menuItemId] as const,
};

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: () =>
      get<ApiListResponse<{ categories: Category[] }>>("/categories").then(
        (res) => res.data.categories,
      ),
    staleTime: 10 * 60 * 1000,
  });
}

export function useMenuItems(filters: MenuItemFilters = {}) {
  return useQuery({
    queryKey: ["menu-items", filters],
    queryFn: () =>
      get<MenuItemsResponse>("/menu-items", { params: filters }).then(
        (res) => res.data,
      ),
    staleTime: 2 * 60 * 1000,
    // KEY FIX: keep showing previous results while new request is in-flight.
    // Without this, switching categories causes a cache miss → data = undefined
    // → items = [] → grid disappears → empty state flashes.
    placeholderData: keepPreviousData,
  });
}

export function useMenuItem(idOrSlug: string) {
  const isId = /^[a-f\d]{24}$/i.test(idOrSlug);
  const url = isId ? `/menu-items/${idOrSlug}` : `/menu-items/slug/${idOrSlug}`;

  return useQuery({
    queryKey: queryKeys.menuItem(idOrSlug),
    queryFn: () =>
      get<ApiResponse<{ menuItem: MenuItem }>>(url).then(
        (res) => res.data.menuItem,
      ),
    enabled: Boolean(idOrSlug),
  });
}

export function useDailySpecials() {
  return useQuery({
    queryKey: queryKeys.dailySpecials,
    queryFn: () =>
      get<ApiListResponse<{ dailySpecials: DailySpecial[] }>>(
        "/daily-specials/today",
      ).then((res) => res.data.dailySpecials),
    staleTime: 5 * 60 * 1000,
  });
}

export function useTestimonials() {
  return useQuery({
    queryKey: queryKeys.testimonials,
    queryFn: () =>
      get<ApiListResponse<{ testimonials: Testimonial[] }>>(
        "/testimonials/featured",
      ).then((res) => res.data.testimonials),
    staleTime: 5 * 60 * 1000,
  });
}

export function useLikeStatus(menuItemId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.likeStatus(menuItemId),
    queryFn: () =>
      get<ApiResponse<{ liked: boolean }>>(`/likes/${menuItemId}/status`).then(
        (res) => res.data.liked,
      ),
    enabled: Boolean(menuItemId) && enabled,
  });
}

export function useToggleLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (menuItemId: string) =>
      post<ApiResponse<{ liked: boolean; likes: number }>>(
        `/likes/${menuItemId}`,
      ),
    onSuccess: (data, menuItemId) => {
      queryClient.setQueryData(
        queryKeys.likeStatus(menuItemId),
        data.data.liked,
      );
      queryClient.invalidateQueries({
        queryKey: queryKeys.menuItem(menuItemId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.menuItems() });
    },
  });
}

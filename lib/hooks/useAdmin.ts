// 📁 lib/hooks/useAdmin.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post, patch, del } from "@/lib/api";
import type {
  Order,
  MenuItem,
  MenuItemFilters,
  MenuItemsResponse,
  ApiResponse,
  ApiListResponse,
  Pagination,
} from "@/types";

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

export const adminKeys = {
  profile: ["admin", "profile"] as const,
  orders: (filters?: Record<string, unknown>) =>
    filters ? ["admin", "orders", filters] : ["admin", "orders"],
  order: (id: string) => ["admin", "orders", id] as const,
  menuItems: (filters?: MenuItemFilters) =>
    filters ? ["admin", "menu-items", filters] : ["admin", "menu-items"],
  users: (filters?: Record<string, unknown>) =>
    filters ? ["admin", "users", filters] : ["admin", "users"],
  analytics: ["admin", "analytics", "dashboard"] as const,
  recentActivity: ["admin", "analytics", "recent-activity"] as const,
};

// ---------------------------------------------------------------------------
// Analytics
// ---------------------------------------------------------------------------

export interface DashboardAnalytics {
  totalRevenue: number;
  ordersToday: number;
  averageRating: number;
  totalOrders: number;
  totalCustomers: number;
}

export function useAnalyticsDashboard() {
  return useQuery({
    queryKey: adminKeys.analytics,
    queryFn: () =>
      get<ApiResponse<{ dashboard: DashboardAnalytics }>>(
        "/analytics/dashboard",
      ).then((res) => res.data.dashboard),
    staleTime: 2 * 60 * 1000,
  });
}

export interface ActivityItem {
  _id: string;
  type: string;
  description: string;
  createdAt: string;
  user?: { name: string };
}

export function useRecentActivity() {
  return useQuery({
    queryKey: adminKeys.recentActivity,
    queryFn: () =>
      get<ApiListResponse<{ activities: ActivityItem[] }>>(
        "/analytics/recent-activity",
      ).then((res) => res.data.activities),
    staleTime: 60 * 1000,
  });
}

// ---------------------------------------------------------------------------
// Admin Profile
// ---------------------------------------------------------------------------

export interface AdminProfile {
  _id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  avatar?: string | null;
  role: { name: string };
  createdAt: string;
}

export function useAdminProfile() {
  return useQuery({
    queryKey: adminKeys.profile,
    queryFn: () =>
      get<ApiResponse<{ user: AdminProfile }>>("/admin/profile").then(
        (res) => res.data.user,
      ),
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateAdminProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name?: string; phoneNumber?: string }) =>
      patch<ApiResponse<{ user: AdminProfile }>>(
        "/admin/profile",
        payload,
      ).then((res) => res.data.user),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.profile });
    },
  });
}

export function useUpdatePassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      currentPassword: string;
      newPassword: string;
      newPasswordConfirm: string;
    }) => patch("/auth/update-password", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.profile });
    },
  });
}

// ---------------------------------------------------------------------------
// Admin Orders
// ---------------------------------------------------------------------------

export interface AdminOrderFilters {
  status?: string;
  page?: number;
  limit?: number;
  search?: string;
}

export function useAdminOrders(filters: AdminOrderFilters = {}) {
  return useQuery({
    queryKey: adminKeys.orders(filters as Record<string, unknown>),
    queryFn: () =>
      get<ApiListResponse<{ orders: Order[]; pagination: Pagination }>>(
        "/orders",
        { params: filters },
      ).then((res) => res.data),
  });
}

/**
 * Fetches a single page of pending orders just to get the total count from
 * pagination. Used by OrderStatsCards to show a live pending orders badge.
 */
export function usePendingOrdersCount() {
  return useQuery({
    queryKey: adminKeys.orders({ status: "pending", limit: 1, page: 1 }),
    queryFn: () =>
      get<ApiListResponse<{ orders: Order[]; pagination: Pagination }>>(
        "/orders",
        { params: { status: "pending", limit: 1, page: 1 } },
      ).then((res) => res.data.pagination.total),
    staleTime: 60 * 1000,
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
      note,
    }: {
      id: string;
      status: string;
      note?: string;
    }) => patch(`/orders/${id}/status`, { status, note }),
    onSuccess: (_data, { id }) => {
      // Invalidate the specific order and all order list queries
      queryClient.invalidateQueries({ queryKey: adminKeys.order(id) });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      // Also refresh analytics since order counts change
      queryClient.invalidateQueries({ queryKey: adminKeys.analytics });
    },
  });
}

export function useConfirmAllOrders() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (note?: string) => patch("/orders/confirm-all", { note }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      queryClient.invalidateQueries({ queryKey: adminKeys.analytics });
    },
  });
}

export function useAssignRider() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, riderId }: { id: string; riderId: string }) =>
      patch(`/orders/${id}/assign-rider`, { riderId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      queryClient.invalidateQueries({ queryKey: adminKeys.analytics });
    },
  });
}

// ---------------------------------------------------------------------------
// Admin Menu Items
// ---------------------------------------------------------------------------

export function useAdminMenuItems(filters: MenuItemFilters = {}) {
  return useQuery({
    queryKey: adminKeys.menuItems(filters),
    queryFn: () =>
      get<MenuItemsResponse>("/menu-items", { params: filters }).then(
        (res) => res.data,
      ),
  });
}

export interface CreateMenuItemPayload {
  name: string;
  description?: string;
  price: number;
  category: string;
  images: string[];
  extraItems?: string[];
  preparationTime?: number;
  ingredients?: string[];
  allergens?: string[];
  isAvailable?: boolean;
  isFeatured?: boolean;
}

export function useCreateMenuItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateMenuItemPayload) =>
      post<ApiResponse<{ menuItem: MenuItem }>>("/menu-items", payload).then(
        (res) => res.data.menuItem,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-items"] });
      queryClient.invalidateQueries({ queryKey: adminKeys.menuItems() });
      queryClient.invalidateQueries({ queryKey: adminKeys.analytics });
    },
  });
}

export function useUpdateMenuItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<CreateMenuItemPayload>;
    }) =>
      patch<ApiResponse<{ menuItem: MenuItem }>>(
        `/menu-items/${id}`,
        payload,
      ).then((res) => res.data.menuItem),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-items"] });
      queryClient.invalidateQueries({ queryKey: adminKeys.menuItems() });
      queryClient.invalidateQueries({ queryKey: adminKeys.analytics });
    },
  });
}

export function useDeleteMenuItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => del(`/menu-items/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-items"] });
      queryClient.invalidateQueries({ queryKey: adminKeys.menuItems() });
      queryClient.invalidateQueries({ queryKey: adminKeys.analytics });
    },
  });
}

// ---------------------------------------------------------------------------
// Admin Users
// ---------------------------------------------------------------------------

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: { _id: string; name: string };
  active: boolean;
  emailVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

export interface AdminUserFilters {
  search?: string;
  role?: string;
  active?: boolean;
  page?: number;
  limit?: number;
}

export function useAdminUsers(filters: AdminUserFilters = {}) {
  return useQuery({
    queryKey: adminKeys.users(filters as Record<string, unknown>),
    queryFn: () =>
      get<ApiListResponse<{ users: AdminUser[]; pagination: Pagination }>>(
        "/admin/users",
        { params: filters },
      ).then((res) => res.data),
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: { active?: boolean; role?: string; emailVerified?: boolean };
    }) => patch(`/admin/users/${id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
    },
  });
}

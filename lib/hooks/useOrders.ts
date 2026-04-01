// 📁 lib/hooks/useOrders.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post } from "@/lib/api";
import type {
  Order,
  Payment,
  CreateOrderPayload,
  PaystackInitializeResponse,
  ApiResponse,
  ApiListResponse,
  Pagination,
} from "@/types";

export const orderKeys = {
  myOrders: (filters?: Record<string, unknown>) =>
    filters ? ["orders", "my", filters] : ["orders", "my"],
  detail: (id: string) => ["orders", id] as const,
};

// ---------------------------------------------------------------------------
// Customer order history
// ---------------------------------------------------------------------------

export function useMyOrders(filters: Record<string, unknown> = {}) {
  return useQuery({
    queryKey: orderKeys.myOrders(filters),
    queryFn: () =>
      get<ApiListResponse<{ orders: Order[]; pagination: Pagination }>>(
        "/orders/my",
        { params: filters },
      ).then((res) => res.data),
    refetchInterval: (query) => {
      const orders = query.state.data?.orders ?? [];
      const hasActive = orders.some((o) =>
        [
          "pending",
          "confirmed",
          "preparing",
          "ready_for_pickup",
          "out_for_delivery",
        ].includes(o.status),
      );
      return hasActive ? 15_000 : false;
    },
  });
}

// ---------------------------------------------------------------------------
// Single order detail
// ---------------------------------------------------------------------------

export function useOrder(id: string) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () =>
      get<ApiResponse<{ order: Order }>>(`/orders/${id}`).then(
        (res) => res.data.order,
      ),
    enabled: Boolean(id),
    // Poll every 30s for active orders so status updates appear automatically
    refetchInterval: (query) => {
      const order = query.state.data;
      if (!order) return false;
      const activeStatuses = [
        "pending",
        "confirmed",
        "preparing",
        "ready_for_pickup",
        "out_for_delivery",
      ];
      return activeStatuses.includes(order.status) ? 30_000 : false;
    },
  });
}

// ---------------------------------------------------------------------------
// Place order
// ---------------------------------------------------------------------------

// Deprecated: usePlaceOrder is no longer used in the new payment-first flow
// export function usePlaceOrder() { ... }

// ---------------------------------------------------------------------------
// Cancel order
// ---------------------------------------------------------------------------

export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => post(`/orders/${id}/cancel`),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

// ---------------------------------------------------------------------------
// Initialize Paystack payment
// ---------------------------------------------------------------------------

// Deprecated: useInitializePayment is no longer used in the new payment-first flow
// export function useInitializePayment() { ... }

// ---------------------------------------------------------------------------
// Verify Paystack payment (called from callback page)
// ---------------------------------------------------------------------------

export function useVerifyPayment(reference: string) {
  return useQuery({
    queryKey: ["payments", "verify", reference],
    queryFn: () =>
      // FIX: use the full Payment type instead of a narrow inline type
      get<ApiResponse<{ payment: Payment }>>(
        `/payments/paystack/verify/${reference}`,
      ).then((res) => res.data),
    enabled: Boolean(reference),
    retry: 3,
    retryDelay: 2000,
  });
}

// 📁 lib/hooks/useAddresses.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post, patch, del } from "@/lib/api";
import type {
  Address,
  CreateAddressPayload,
  ApiListResponse,
  ApiResponse,
} from "@/types";

export const addressKeys = {
  all: ["addresses"] as const,
  detail: (id: string) => ["addresses", id] as const,
};

// ---------------------------------------------------------------------------
// Fetch all addresses
// ---------------------------------------------------------------------------

export function useAddresses(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: addressKeys.all,
    queryFn: () =>
      get<ApiListResponse<{ addresses: Address[] }>>("/addresses").then(
        (res) => res.data.addresses,
      ),
    enabled: options?.enabled ?? true,
  });
}

// ---------------------------------------------------------------------------
// Create address
// ---------------------------------------------------------------------------

export function useCreateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateAddressPayload) =>
      post<ApiResponse<{ address: Address }>>("/addresses", payload).then(
        (res) => res.data.address,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: addressKeys.all });
    },
  });
}

// ---------------------------------------------------------------------------
// Update address
// ---------------------------------------------------------------------------

export function useUpdateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<CreateAddressPayload>;
    }) =>
      patch<ApiResponse<{ address: Address }>>(
        `/addresses/${id}`,
        payload,
      ).then((res) => res.data.address),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: addressKeys.all });
    },
  });
}

// ---------------------------------------------------------------------------
// Delete address
// ---------------------------------------------------------------------------

export function useDeleteAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => del(`/addresses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: addressKeys.all });
    },
  });
}

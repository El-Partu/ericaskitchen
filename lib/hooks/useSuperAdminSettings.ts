import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { del, get, patch, post } from "@/lib/api";
import type {
  ApiListResponse,
  ApiMessageResponse,
  ApiResponse,
  CommissionConfig,
  CommissionTodaySummary,
  ProcessingFeeConfig,
  PromoCode,
} from "@/types";

export const superAdminSettingsKeys = {
  processingFee: ["super-admin", "settings", "processing-fee"] as const,
  promoCodes: ["super-admin", "settings", "promo-codes"] as const,
  promoCode: (id: string) =>
    ["super-admin", "settings", "promo-codes", id] as const,
  commission: ["super-admin", "settings", "commission"] as const,
  commissionToday: ["super-admin", "settings", "commission", "today"] as const,
};

interface UpdateProcessingFeePayload {
  type: ProcessingFeeConfig["type"];
  amount: number;
}

interface CreatePromoCodePayload {
  code: string;
  discountType: PromoCode["discountType"];
  discountValue: number;
  maxRedemptions?: number;
  expiresAt?: string;
  isActive?: boolean;
}

interface UpdatePromoCodePayload {
  code?: string;
  discountType?: PromoCode["discountType"];
  discountValue?: number;
  maxRedemptions?: number;
  expiresAt?: string;
  isActive?: boolean;
}

interface UpdateCommissionPayload {
  type: CommissionConfig["type"];
  value: number;
}

function normalizeCommissionTodaySummary(
  summary: Partial<CommissionTodaySummary>,
): CommissionTodaySummary {
  return {
    totalCommission: Number(summary.totalCommission ?? 0),
    orderCount: Number(summary.orderCount ?? 0),
    date: summary.date,
  };
}

export function useProcessingFee() {
  return useQuery({
    queryKey: superAdminSettingsKeys.processingFee,
    queryFn: () =>
      get<ApiResponse<{ processingFee: ProcessingFeeConfig }>>(
        "/admin/settings/processing-fee",
      ).then((res) => res.data.processingFee),
  });
}

export function useUpdateProcessingFee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProcessingFeePayload) =>
      patch<ApiResponse<{ processingFee: ProcessingFeeConfig }>>(
        "/admin/settings/processing-fee",
        payload,
      ).then((res) => res.data.processingFee),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: superAdminSettingsKeys.processingFee,
      });
    },
  });
}

export function usePromoCodes() {
  return useQuery({
    queryKey: superAdminSettingsKeys.promoCodes,
    queryFn: () =>
      get<ApiListResponse<{ promoCodes: PromoCode[] }>>(
        "/admin/settings/promo-codes",
      ).then((res) => res.data.promoCodes),
  });
}

export function usePromoCode(id: string) {
  return useQuery({
    queryKey: superAdminSettingsKeys.promoCode(id),
    queryFn: () =>
      get<ApiResponse<{ promoCode: PromoCode }>>(
        `/admin/settings/promo-codes/${id}`,
      ).then((res) => res.data.promoCode),
    enabled: Boolean(id),
  });
}

export function useCreatePromoCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePromoCodePayload) =>
      post<ApiResponse<{ promoCode: PromoCode }>>(
        "/admin/settings/promo-codes",
        payload,
      ).then((res) => res.data.promoCode),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: superAdminSettingsKeys.promoCodes,
      });
    },
  });
}

export function useUpdatePromoCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdatePromoCodePayload;
    }) =>
      patch<ApiResponse<{ promoCode: PromoCode }>>(
        `/admin/settings/promo-codes/${id}`,
        payload,
      ).then((res) => res.data.promoCode),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({
        queryKey: superAdminSettingsKeys.promoCodes,
      });
      queryClient.invalidateQueries({
        queryKey: superAdminSettingsKeys.promoCode(id),
      });
    },
  });
}

export function useInvalidatePromoCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      patch<ApiResponse<{ promoCode: PromoCode }>>(
        `/admin/settings/promo-codes/${id}/invalidate`,
      ).then((res) => res.data.promoCode),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({
        queryKey: superAdminSettingsKeys.promoCodes,
      });
      queryClient.invalidateQueries({
        queryKey: superAdminSettingsKeys.promoCode(id),
      });
    },
  });
}

export function useDeletePromoCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      del<ApiMessageResponse>(`/admin/settings/promo-codes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: superAdminSettingsKeys.promoCodes,
      });
    },
  });
}

export function useCommissionSettings() {
  return useQuery({
    queryKey: superAdminSettingsKeys.commission,
    queryFn: () =>
      get<ApiResponse<{ commission: CommissionConfig }>>(
        "/admin/settings/commission",
      ).then((res) => res.data.commission),
  });
}

export function useUpdateCommissionSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateCommissionPayload) =>
      patch<ApiResponse<{ commission: CommissionConfig }>>(
        "/admin/settings/commission",
        payload,
      ).then((res) => res.data.commission),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: superAdminSettingsKeys.commission,
      });
      queryClient.invalidateQueries({
        queryKey: superAdminSettingsKeys.commissionToday,
      });
    },
  });
}

export function useCommissionTodaySummary() {
  return useQuery({
    queryKey: superAdminSettingsKeys.commissionToday,
    queryFn: () =>
      get<ApiResponse<{ summary: Partial<CommissionTodaySummary> }>>(
        "/admin/settings/commission/today",
      ).then((res) => normalizeCommissionTodaySummary(res.data.summary ?? {})),
  });
}

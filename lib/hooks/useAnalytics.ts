// 📁 lib/hooks/useAnalytics.ts

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

// ── Types matching GET /analytics/dashboard response ──────────────────────────

export interface DashboardOverview {
  totalSales: number;
  ordersToday: number;
  customerReviews: {
    average: number;
    total: number;
  };
}

export interface RestaurantStatistics {
  monthlySales: number;
  totalOrders: number;
  newCustomers: number;
}

export interface AnalyticsDashboardData {
  overview: DashboardOverview;
  restaurantStatistics: RestaurantStatistics;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * GET /analytics/dashboard
 * Requires: report:read permission
 * Returns combined overview KPIs + restaurant statistics in a single request.
 * Shared by OverviewCards and RestaurantStatistics — never fetch this twice.
 */
export function useAnalyticsDashboard() {
  return useQuery<AnalyticsDashboardData>({
    queryKey: ["analytics", "dashboard"],
    queryFn: async () => {
      const { data } = await api.get("/analytics/dashboard");
      return data.data;
    },
    staleTime: 60 * 1000, // 1 min — dashboard numbers don't need real-time precision
  });
}

// ── Revenue chart ─────────────────────────────────────────────────────────────

/**
 * GET /analytics/revenue-chart?year=YYYY&month=M
 */
export function useRevenueChart(params?: { year?: number; month?: number }) {
  return useQuery({
    queryKey: ["analytics", "revenue-chart", params],
    queryFn: async () => {
      const { data } = await api.get("/analytics/revenue-chart", { params });
      return data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

// ── Sales ─────────────────────────────────────────────────────────────────────

export type AnalyticsPeriod = "today" | "week" | "month" | "year";

/**
 * GET /analytics/sales?period=...
 */
export function useAnalyticsSales(period: AnalyticsPeriod = "month") {
  return useQuery({
    queryKey: ["analytics", "sales", period],
    queryFn: async () => {
      const { data } = await api.get("/analytics/sales", {
        params: { period },
      });
      return data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

// ── Orders ────────────────────────────────────────────────────────────────────

/**
 * GET /analytics/orders?period=...
 */
export function useAnalyticsOrders(period: AnalyticsPeriod = "month") {
  return useQuery({
    queryKey: ["analytics", "orders", period],
    queryFn: async () => {
      const { data } = await api.get("/analytics/orders", {
        params: { period },
      });
      return data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

// ── Customers ─────────────────────────────────────────────────────────────────

/**
 * GET /analytics/customers?period=...
 * period: "week" | "month" | "year"
 */
export function useAnalyticsCustomers(
  period: "week" | "month" | "year" = "month",
) {
  return useQuery({
    queryKey: ["analytics", "customers", period],
    queryFn: async () => {
      const { data } = await api.get("/analytics/customers", {
        params: { period },
      });
      return data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

// ── Menu performance ──────────────────────────────────────────────────────────

/**
 * GET /analytics/menu-performance?period=...&limit=...
 */
export function useMenuPerformance(params?: {
  period?: "week" | "month" | "year";
  limit?: number;
}) {
  return useQuery({
    queryKey: ["analytics", "menu-performance", params],
    queryFn: async () => {
      const { data } = await api.get("/analytics/menu-performance", { params });
      return data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

// ── Recent activity ───────────────────────────────────────────────────────────

/**
 * GET /analytics/recent-activity
 * Used by RecentActivity component directly.
 */
export interface ActivityItem {
  type: string; // e.g. "audit"
  title: string; // e.g. "auth.login"
  description: string;
  timestamp: string; // ISO — not "createdAt"
  data: {
    logId: string;
    resource: string;
    actor?: {
      _id: string;
      name: string;
    };
  };
}

export function useRecentActivity() {
  return useQuery<ActivityItem[]>({
    queryKey: ["analytics", "recent-activity"],
    queryFn: async () => {
      const { data } = await api.get("/analytics/recent-activity");
      // Response: { data: { activities: [...] } }
      return data.data.activities;
    },
    staleTime: 30 * 1000,
  });
}

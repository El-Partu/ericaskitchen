// 📁 components/admin/RestaurantStatistics.tsx
//
// Data comes from GET /analytics/dashboard → data.restaurantStatistics
// Props are passed down from AdminDashboard (single shared fetch — no duplicate requests).
//
// Correct field names from the API response:
//   monthlySales  (not totalRevenue)
//   totalOrders   ✓
//   newCustomers  (not totalCustomers)

import { RestaurantStatistics as RestaurantStatisticsData } from "@/lib/hooks/useAnalytics";
import { TrendingUp } from "lucide-react";

interface Props {
  data?: RestaurantStatisticsData;
  isLoading: boolean;
}

function formatGHS(amount: number) {
  return `GH₵ ${amount.toLocaleString("en-GH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function ValueSkeleton() {
  return (
    <span className="inline-block h-4 w-20 animate-pulse rounded-full bg-[#f0ebe5]" />
  );
}

export default function RestaurantStatistics({ data, isLoading }: Props) {
  const stats = [
    {
      label: "Monthly Revenue",
      value: data?.monthlySales != null ? formatGHS(data.monthlySales) : "—",
      highlight: true,
    },
    {
      label: "Total Orders",
      value: data?.totalOrders?.toLocaleString() ?? "—",
      highlight: false,
    },
    {
      label: "New Customers",
      value: data?.newCustomers?.toLocaleString() ?? "—",
      highlight: false,
    },
  ];

  return (
    <div className="rounded-[16px] bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.05]">
      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <p className="font-body text-[11px] font-semibold uppercase tracking-widest text-admin-muted">
            This Month
          </p>
          <h3 className="mt-0.5 font-heading text-[16px] font-bold text-admin-text">
            Restaurant Statistics
          </h3>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-admin-accent/10">
          <TrendingUp size={15} className="text-admin-accent" />
        </div>
      </div>

      {/* ── Mini bar chart ── */}
      <div className="mt-4 overflow-hidden rounded-[12px] bg-admin-bg p-4">
        <div className="flex h-14 items-end justify-between gap-1">
          {[45, 60, 38, 72, 55, 80, 65].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-sm bg-admin-accent/30 transition-all duration-300"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
        <div className="mt-2 flex justify-between">
          {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
            <span
              key={i}
              className="flex-1 text-center font-body text-[10px] text-admin-muted"
            >
              {d}
            </span>
          ))}
        </div>
      </div>

      {/* ── Stats rows ── */}
      <div className="mt-4 space-y-1">
        {stats.map((s) => (
          <div
            key={s.label}
            className={`flex items-center justify-between rounded-[10px] px-3 py-2.5 ${
              s.highlight ? "bg-admin-accent/8" : "hover:bg-admin-bg"
            } transition-colors duration-150`}
          >
            <span className="font-body text-[13px] text-admin-muted">
              {s.label}
            </span>
            <span
              className={`font-heading text-[14px] font-bold ${
                s.highlight ? "text-admin-accent" : "text-admin-text"
              }`}
            >
              {isLoading ? <ValueSkeleton /> : s.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

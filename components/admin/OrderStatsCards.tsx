// 📁 components/admin/OrderStatsCards.tsx
//
// Props from AdminOrdersPage (shared fetch — no duplicate requests):
//   ordersToday  → GET /analytics/dashboard → data.overview.ordersToday
//   totalOrders  → GET /analytics/dashboard → data.restaurantStatistics.totalOrders
//   totalSales   → GET /analytics/dashboard → data.overview.totalSales
//
// Fetched internally (only consumer of this count):
//   pending      → GET /admin/orders?status=pending&limit=1 → pagination.total

import { ShoppingBag, Clock, AlertCircle, TrendingUp } from "lucide-react";
import { useAdminOrders } from "@/lib/hooks/useAdmin";

interface Props {
  ordersToday: number | undefined;
  totalOrders: number | undefined;
  totalSales: number | undefined;
  isLoading: boolean;
}

function formatGHS(amount: number) {
  return `GH₵ ${amount.toLocaleString("en-GH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function StatCard({
  label,
  value,
  icon: Icon,
  iconColor,
  iconBg,
  isLoading,
}: {
  label: string;
  value: string | undefined;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  isLoading: boolean;
}) {
  return (
    <div className="rounded-[16px] bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.05]">
      <div className="flex items-center gap-2.5">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${iconBg}`}
        >
          <Icon size={15} className={iconColor} />
        </div>
        <p className="font-body text-[11px] font-semibold uppercase tracking-widest text-admin-muted">
          {label}
        </p>
      </div>
      <div className="mt-3">
        {isLoading ? (
          <div className="h-8 w-20 animate-pulse rounded-full bg-[#f0ebe5]" />
        ) : (
          <span className="font-heading text-[26px] font-bold leading-none text-admin-text">
            {value ?? "—"}
          </span>
        )}
      </div>
    </div>
  );
}

export default function OrderStatsCards({
  ordersToday,
  totalOrders,
  totalSales,
  isLoading,
}: Props) {
  // GET /admin/orders?status=pending&limit=1 — only this card needs this count
  const { data: pendingData, isLoading: pendingLoading } = useAdminOrders({
    status: "pending",
    limit: 1,
  });
  const pendingCount = pendingData?.pagination?.total;

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard
        label="Total Orders"
        value={totalOrders?.toLocaleString()}
        icon={ShoppingBag}
        iconColor="text-admin-accent"
        iconBg="bg-admin-accent/10"
        isLoading={isLoading}
      />
      <StatCard
        label="Orders Today"
        value={ordersToday?.toLocaleString()}
        icon={Clock}
        iconColor="text-admin-amber"
        iconBg="bg-admin-amber/10"
        isLoading={isLoading}
      />
      <StatCard
        label="Pending"
        value={pendingCount?.toLocaleString()}
        icon={AlertCircle}
        iconColor="text-admin-amber"
        iconBg="bg-admin-amber/10"
        isLoading={pendingLoading}
      />
      <StatCard
        label="Total Sales"
        value={totalSales != null ? formatGHS(totalSales) : undefined}
        icon={TrendingUp}
        iconColor="text-green-600"
        iconBg="bg-green-500/10"
        isLoading={isLoading}
      />
    </div>
  );
}

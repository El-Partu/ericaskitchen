"use client";

// API endpoints consumed by this page:
//  GET /admin/profile                           → AdminProfileCard
//  GET /analytics/dashboard                     → OrderStatsCards (shared fetch)
//  GET /admin/orders?status=pending&limit=1     → OrderStatsCards (pending count)
//  GET /admin/orders                            → OrdersTable (status, search, page, limit)
//  PATCH /admin/orders/:id/status 🔐 order:update → OrdersTable (status change)
//  PATCH /admin/orders/confirm-all 🔐 order:update → OrdersTable (bulk confirm)

import AdminProfileCard from "@/components/admin/AdminProfileCard";
import OrderStatsCards from "@/components/admin/OrderStatsCards";
import OrdersTable from "@/components/admin/OrdersTable";
import { SlideIn, SlideUp, FadeIn } from "@/components/ui/Animations";
import { useAdminProfile } from "@/lib/hooks/useAdmin";
import { useAnalyticsDashboard } from "@/lib/hooks/useAnalytics";

export default function AdminOrdersPage() {
  const { data: profile, isLoading: profileLoading } = useAdminProfile();

  // Lifted — shared by OrderStatsCards (overview.ordersToday, overview.totalSales,
  // restaurantStatistics.totalOrders). Never fetched twice.
  const { data: analytics, isLoading: analyticsLoading } =
    useAnalyticsDashboard();

  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-GH", {
        month: "long",
        year: "numeric",
      })
    : undefined;

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
      <SlideIn direction="left" className="w-full md:max-w-[320px] lg:w-auto">
        <AdminProfileCard
          name={profile?.name}
          role={profile?.role?.name}
          email={profile?.email}
          phone={profile?.phoneNumber}
          avatar={profile?.avatar}
          memberSince={memberSince}
          isLoading={profileLoading}
        />
      </SlideIn>

      <div className="min-w-0 flex-1 space-y-5">
        <FadeIn>
          <div>
            <p className="font-body text-[11px] font-semibold uppercase tracking-widest text-admin-muted">
              Admin
            </p>
            <h1 className="mt-0.5 font-heading text-[22px] font-bold text-admin-text">
              Orders
            </h1>
          </div>
        </FadeIn>

        <SlideUp delay={0.1}>
          <OrderStatsCards
            ordersToday={analytics?.overview?.ordersToday}
            totalOrders={analytics?.restaurantStatistics?.totalOrders}
            totalSales={analytics?.overview?.totalSales}
            isLoading={analyticsLoading}
          />
        </SlideUp>

        <FadeIn delay={0.2}>
          <OrdersTable />
        </FadeIn>
      </div>
    </div>
  );
}

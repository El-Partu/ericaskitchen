"use client";

// API endpoints consumed by this page:
//  GET /admin/profile              → profile card
//  GET /analytics/dashboard        → overview KPIs + restaurant statistics (shared, single fetch)
//  GET /analytics/recent-activity  → RecentActivity (fetches internally)

import AdminProfileCard from "@/components/admin/AdminProfileCard";
import OverviewCards from "@/components/admin/OverviewCards";
import RecentActivity from "@/components/admin/RecentActivity";
import RestaurantStatistics from "@/components/admin/RestaurantStatistics";
import QuickActions from "@/components/admin/QuickActions";
import { FadeIn, SlideIn, SlideUp } from "@/components/ui/Animations";
import { useAdminProfile } from "@/lib/hooks/useAdmin";
import { useAnalyticsDashboard } from "@/lib/hooks/useAnalytics";

export default function AdminDashboard() {
  // GET /admin/profile → { data: { user: { name, email, phoneNumber, role: { name }, createdAt, avatar } } }
  const { data: profile, isLoading: profileLoading } = useAdminProfile();

  // GET /analytics/dashboard → { data: { overview, restaurantStatistics } }
  // Fetched once here and passed down so OverviewCards + RestaurantStatistics
  // don't each fire their own identical request.
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
      {/* ── Left: Profile card ── */}
      <SlideIn direction="left">
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

      {/* ── Right: Main content ── */}
      <div className="min-w-0 flex-1 space-y-6">
        {/* Overview KPIs — data.overview: { totalSales, ordersToday, customerReviews } */}
        <SlideUp>
          <OverviewCards
            data={analytics?.overview}
            isLoading={analyticsLoading}
          />
        </SlideUp>

        <div className="grid gap-6 md:grid-cols-[1fr_320px]">
          <FadeIn delay={0.15}>
            <div className="space-y-6">
              {/* GET /analytics/recent-activity */}
              <RecentActivity />
            </div>
          </FadeIn>

          {/* data.restaurantStatistics: { monthlySales, totalOrders, newCustomers } */}
          <SlideIn direction="right" delay={0.2}>
            <RestaurantStatistics
              data={analytics?.restaurantStatistics}
              isLoading={analyticsLoading}
            />
          </SlideIn>
        </div>

        {/* Quick nav shortcuts — no API */}
        <SlideUp delay={0.25}>
          <QuickActions />
        </SlideUp>
      </div>
    </div>
  );
}

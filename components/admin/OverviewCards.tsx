// 📁 components/admin/OverviewCards.tsx
//
// Data from GET /analytics/dashboard → data.overview:
//   totalSales          (not totalRevenue)
//   ordersToday         ✓
//   customerReviews: { average, total }  (not averageRating)
//
// Props passed down from AdminDashboard — no self-fetch.

import { Star, ShoppingBag, ClipboardList } from "lucide-react";
import { DashboardOverview } from "@/lib/hooks/useAnalytics";

interface Props {
  data?: DashboardOverview;
  isLoading: boolean;
}

function formatGHS(amount: number) {
  return `GH₵ ${amount.toLocaleString("en-GH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function ValueSkeleton({ wide = false }: { wide?: boolean }) {
  return (
    <div
      className={`h-8 animate-pulse rounded-full bg-[#f0ebe5] ${wide ? "w-28" : "w-16"}`}
    />
  );
}

function LabelSkeleton() {
  return <div className="h-3 w-20 animate-pulse rounded-full bg-[#f0ebe5]" />;
}

export default function OverviewCards({ data, isLoading }: Props) {
  const rating = data?.customerReviews?.average ?? 0;
  const ratingRounded = Math.round(rating);
  const reviewTotal = data?.customerReviews?.total ?? 0;

  const cards = [
    {
      label: "Total Sales",
      value: data?.totalSales != null ? formatGHS(data.totalSales) : "—",
      icon: ShoppingBag,
      iconColor: "text-admin-accent",
      iconBg: "bg-admin-accent/10",
      wide: true,
    },
    {
      label: "Orders Today",
      value: data?.ordersToday?.toLocaleString() ?? "—",
      icon: ClipboardList,
      iconColor: "text-blue-500",
      iconBg: "bg-blue-500/10",
    },
    {
      label: "Customer Reviews",
      value: rating > 0 ? rating.toFixed(1) : "—",
      icon: Star,
      iconColor: "text-admin-amber",
      iconBg: "bg-admin-amber/10",
      isRating: true,
    },
  ];

  return (
    <div className="rounded-[16px] bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.05]">
      {/* ── Header ── */}
      <div>
        <p className="font-body text-[11px] font-semibold uppercase tracking-widest text-admin-muted">
          At a Glance
        </p>
        <h3 className="mt-0.5 font-heading text-[16px] font-bold text-admin-text">
          Overview
        </h3>
      </div>

      {/* ── Cards ── */}
      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="flex flex-col gap-3 rounded-[12px] bg-admin-bg p-4 ring-1 ring-black/[0.04]"
            >
              {/* Icon + label */}
              <div className="flex items-center gap-2">
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${card.iconBg}`}
                >
                  <Icon size={13} className={card.iconColor} />
                </div>
                {isLoading ? (
                  <LabelSkeleton />
                ) : (
                  <span className="font-body text-[11px] font-semibold text-admin-muted">
                    {card.label}
                  </span>
                )}
              </div>

              {/* Value */}
              {isLoading ? (
                <ValueSkeleton wide={card.wide} />
              ) : card.isRating ? (
                <div>
                  <span className="font-heading text-[26px] font-bold leading-none text-admin-text">
                    {card.value}
                  </span>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          size={12}
                          className={
                            i <= ratingRounded
                              ? "fill-admin-amber text-admin-amber"
                              : "fill-black/10 text-black/10"
                          }
                        />
                      ))}
                    </div>
                    {reviewTotal > 0 && (
                      <span className="font-body text-[11px] text-admin-muted">
                        ({reviewTotal})
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <span
                  className={`font-heading font-bold leading-none text-admin-text ${
                    card.wide ? "text-[22px]" : "text-[28px]"
                  }`}
                >
                  {card.value}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

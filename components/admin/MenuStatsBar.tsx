// 📁 components/admin/MenuStatsBar.tsx
// Data sources (all GET /menu-items with limit=1 — only pagination.total is needed):
//  total items   → no filters
//  featured      → ?isFeatured=true
//  available     → ?isAvailable=true
//  unavailable   → ?isAvailable=false

"use client";

import { ShoppingBag, Flame, CheckCircle, XCircle } from "lucide-react";
import { useMenuItems } from "@/lib/hooks/useMenu";

interface StatCardProps {
  label: string;
  value: number | undefined;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  isLoading: boolean;
}

function StatCard({
  label,
  value,
  icon: Icon,
  iconColor,
  iconBg,
  isLoading,
}: StatCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-[12px] bg-white px-4 py-3 shadow-[0_1px_6px_rgba(0,0,0,0.05)] ring-1 ring-black/[0.06]">
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${iconBg}`}
      >
        <Icon size={15} className={iconColor} />
      </div>
      <div className="flex flex-col">
        <span className="font-body text-[10px] font-semibold uppercase tracking-widest text-admin-muted">
          {label}
        </span>
        {isLoading ? (
          <div className="mt-1 h-4 w-8 animate-pulse rounded-full bg-[#f0ebe5]" />
        ) : (
          <span className="font-heading text-[18px] font-bold leading-none text-admin-text">
            {value ?? "—"}
          </span>
        )}
      </div>
    </div>
  );
}

export default function MenuStatsBar() {
  // Each call uses limit=1 — we only need pagination.total, not the items themselves
  const { data: allData, isLoading: l1 } = useMenuItems({ limit: 1 });
  const { data: featuredData, isLoading: l2 } = useMenuItems({
    isFeatured: true,
    limit: 1,
  });
  const { data: availableData, isLoading: l3 } = useMenuItems({
    isAvailable: true,
    limit: 1,
  });
  const { data: unavailableData, isLoading: l4 } = useMenuItems({
    isAvailable: false,
    limit: 1,
  });

  const stats = [
    {
      label: "Total Items",
      value: allData?.pagination?.total,
      icon: ShoppingBag,
      iconColor: "text-admin-accent",
      iconBg: "bg-admin-accent/10",
      isLoading: l1,
    },
    {
      label: "Featured",
      value: featuredData?.pagination?.total,
      icon: Flame,
      iconColor: "text-admin-amber",
      iconBg: "bg-admin-amber/10",
      isLoading: l2,
    },
    {
      label: "Available",
      value: availableData?.pagination?.total,
      icon: CheckCircle,
      iconColor: "text-green-600",
      iconBg: "bg-green-500/10",
      isLoading: l3,
    },
    {
      label: "Unavailable",
      value: unavailableData?.pagination?.total,
      icon: XCircle,
      iconColor: "text-red-500",
      iconBg: "bg-red-500/10",
      isLoading: l4,
    },
  ];

  return (
    <div className="flex flex-wrap gap-3">
      {stats.map((s) => (
        <StatCard key={s.label} {...s} />
      ))}
    </div>
  );
}

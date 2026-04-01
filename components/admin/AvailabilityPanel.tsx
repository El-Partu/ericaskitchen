// 📁 components/admin/AvailabilityPanel.tsx
//
// API endpoints:
//  GET  /menu-items?isAvailable=true&limit=1   → pagination.total (in-stock count)
//  GET  /menu-items?isAvailable=false&limit=1  → pagination.total (out-of-stock count)
//  GET  /menu-items?limit=50&sort=name         → toggle list
//  PATCH /menu-items/:id  🔐 menu:update       → toggle isAvailable

"use client";

import { toast } from "sonner";
import { useAdminMenuItems, useUpdateMenuItem } from "@/lib/hooks/useAdmin";
import { useMenuItems } from "@/lib/hooks/useMenu";
import type { MenuItem } from "@/types";

function CountCard({
  label,
  count,
  isLoading,
  variant,
}: {
  label: string;
  count: number | undefined;
  isLoading: boolean;
  variant: "success" | "danger";
}) {
  const colors =
    variant === "success"
      ? {
          bg: "bg-green-500/10",
          text: "text-green-700",
          badge: "bg-green-500/20 text-green-800",
        }
      : {
          bg: "bg-red-500/10",
          text: "text-red-600",
          badge: "bg-red-500/20 text-red-700",
        };

  return (
    <div
      className={`flex flex-1 items-center justify-between rounded-[12px] px-4 py-3 ${colors.bg}`}
    >
      <span className={`font-body text-[13px] font-semibold ${colors.text}`}>
        {label}
      </span>
      {isLoading ? (
        <div className="h-5 w-8 animate-pulse rounded-full bg-black/[0.08]" />
      ) : (
        <span
          className={`rounded-full px-2 py-0.5 font-heading text-[12px] font-bold ${colors.badge}`}
        >
          {count ?? "—"}
        </span>
      )}
    </div>
  );
}

export default function AvailabilityPanel() {
  const { mutate: updateItem } = useUpdateMenuItem();

  // Counts — limit=1, only pagination.total is needed
  const { data: inStockData, isLoading: l1 } = useMenuItems({
    isAvailable: true,
    limit: 1,
  });
  const { data: outStockData, isLoading: l2 } = useMenuItems({
    isAvailable: false,
    limit: 1,
  });

  // Toggle list — all items, sorted by name
  const { data: listData, isLoading: listLoading } = useAdminMenuItems({
    limit: 50,
    sort: "name",
  });

  const items = listData?.items ?? [];

  const handleToggle = (item: MenuItem) => {
    const next = !item.isAvailable;
    updateItem(
      { id: item._id, payload: { isAvailable: next } },
      {
        onSuccess: () =>
          toast.success(
            `${item.name} marked as ${next ? "available" : "unavailable"}`,
          ),
        onError: () => toast.error(`Failed to update ${item.name}`),
      },
    );
  };

  return (
    <div className="flex w-full shrink-0 flex-col border-t border-black/[0.07] bg-white lg:w-[280px] lg:border-l lg:border-t-0">
      {/* ── Header ── */}
      <div className="px-4 pt-5">
        <p className="font-body text-[11px] font-semibold uppercase tracking-widest text-admin-muted">
          Stock
        </p>
        <h3 className="mt-0.5 font-heading text-[15px] font-bold text-admin-text">
          Availability
        </h3>
      </div>

      {/* ── Count cards ── */}
      <div className="mt-4 flex gap-2 px-4">
        <CountCard
          label="In Stock"
          count={inStockData?.pagination?.total}
          isLoading={l1}
          variant="success"
        />
        <CountCard
          label="Out"
          count={outStockData?.pagination?.total}
          isLoading={l2}
          variant="danger"
        />
      </div>

      {/* ── Divider ── */}
      <div className="mx-4 mt-4 h-px bg-black/[0.06]" />

      {/* ── Toggle list ── */}
      <div className="mt-3 flex-1 overflow-y-auto px-4 pb-4">
        {listLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="space-y-1.5">
                  <div className="h-3 w-28 animate-pulse rounded-full bg-[#f0ebe5]" />
                  <div className="h-2.5 w-16 animate-pulse rounded-full bg-[#f0ebe5]" />
                </div>
                <div className="h-6 w-11 animate-pulse rounded-full bg-[#f0ebe5]" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="py-6 text-center font-body text-[13px] text-admin-muted">
            No items found.
          </p>
        ) : (
          <div className="space-y-3.5">
            {items.map((item) => (
              <div
                key={item._id}
                className="flex items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-body text-[13px] font-semibold text-admin-text">
                    {item.name}
                  </p>
                  <p className="font-body text-[11px] text-admin-muted">
                    {typeof item.category === "object" && item.category !== null
                      ? item.category.name
                      : "—"}
                  </p>
                </div>

                {/* Toggle switch */}
                <button
                  onClick={() => handleToggle(item)}
                  aria-label={`Toggle ${item.name} availability`}
                  className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ${
                    item.isAvailable ? "bg-green-500" : "bg-black/[0.12]"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all duration-200 ${
                      item.isAvailable ? "left-[22px]" : "left-0.5"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// 📁 app/(customer)/orders/page.tsx
//
// Moved from app/(user)/orders/page.tsx into the (customer) route group
// so it renders inside CustomerTopBar layout — same shell as the dashboard.
//
// API: GET /orders/my?status=...&page=...&limit=10  🔒 Auth

"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, ChevronLeft, ShoppingBag } from "lucide-react";
import { useMyOrders } from "@/lib/hooks/useOrders";
import { SlideUp, FadeIn } from "@/components/ui/Animations";
import type { OrderStatus } from "@/types";

// ── Status config — matches the system semantic colour convention ─────────────

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; bg: string; text: string }
> = {
  pending: { label: "Pending", bg: "bg-amber-50", text: "text-amber-600" },
  confirmed: { label: "Confirmed", bg: "bg-blue-50", text: "text-blue-600" },
  preparing: {
    label: "Preparing",
    bg: "bg-orange-50",
    text: "text-orange-600",
  },
  ready_for_pickup: {
    label: "Ready",
    bg: "bg-green-50",
    text: "text-green-700",
  },
  out_for_delivery: {
    label: "On the way",
    bg: "bg-cyan-50",
    text: "text-cyan-600",
  },
  delivered: { label: "Delivered", bg: "bg-green-50", text: "text-green-700" },
  cancelled: { label: "Cancelled", bg: "bg-red-50", text: "text-red-500" },
};

const TAB_STATUSES = [
  "all",
  "pending",
  "preparing",
  "out_for_delivery",
  "delivered",
  "cancelled",
] as const;

type TabStatus = (typeof TAB_STATUSES)[number];

const TAB_LABELS: Record<TabStatus, string> = {
  all: "All",
  pending: "Pending",
  preparing: "Preparing",
  out_for_delivery: "On the way",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

// ── Page ─────────────────────────────────────────────────────────────────────

export default function OrdersPage() {
  const [statusFilter, setStatusFilter] = useState<TabStatus>("all");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useMyOrders({
    ...(statusFilter !== "all" && { status: statusFilter }),
    page,
    limit: 10,
  });

  const orders = data?.orders ?? [];
  const pagination = data?.pagination;

  return (
    // Matches the dashboard page container exactly:
    // max-w-[1376px] px-8 py-8 — no min-h-screen, no bg — those come from (customer)/layout.tsx
    <div className="mx-auto max-w-[1376px] space-y-6 px-4 py-6 sm:px-6 sm:py-8 md:px-8">
      {/* ── Heading ── */}
      <SlideUp>
        <h1 className="font-heading text-2xl font-black text-foreground">
          My Orders
        </h1>
      </SlideUp>

      {/* ── Status filter tabs ── */}
      <FadeIn delay={0.05}>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {TAB_STATUSES.map((status) => (
            <button
              key={status}
              onClick={() => {
                setStatusFilter(status);
                setPage(1);
              }}
              className={`rounded-full px-3 py-2 font-body text-[12px] font-semibold whitespace-nowrap transition-all duration-200 sm:px-4 sm:text-[13px] ${
                statusFilter === status
                  ? "bg-primary text-white shadow-[0_4px_12px_rgba(235,108,108,0.30)]"
                  : "bg-[#f5f0eb] text-foreground/60 hover:bg-primary/10 hover:text-primary"
              }`}
            >
              {TAB_LABELS[status]}
            </button>
          ))}
        </div>
      </FadeIn>

      {/* ── Orders list ── */}
      <SlideUp delay={0.1}>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-[88px] animate-pulse rounded-[20px] bg-[#f5f0eb]"
              />
            ))}
          </div>
        ) : !orders.length ? (
          <div className="flex flex-col items-center justify-center rounded-[24px] bg-white py-16 text-center shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#f5f0eb]">
              <ShoppingBag size={22} className="text-foreground/30" />
            </div>
            <p className="font-body text-[15px] font-semibold text-foreground/50">
              No orders yet
            </p>
            <p className="mt-1 font-body text-sm text-foreground/35">
              {statusFilter !== "all"
                ? `No ${TAB_LABELS[statusFilter].toLowerCase()} orders.`
                : "Your order history will appear here."}
            </p>
            <Link
              href="/menu"
              className="mt-5 flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 font-body text-sm font-semibold text-white shadow-[0_4px_12px_rgba(235,108,108,0.35)] transition-all hover:opacity-90"
            >
              Browse the menu
              <ChevronRight size={15} />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const status = STATUS_CONFIG[order.status] ?? {
                label: order.status,
                bg: "bg-[#f5f0eb]",
                text: "text-foreground/60",
              };
              const firstItem = order.items?.[0];
              const extraCount = order.items.length - 1;

              return (
                <Link
                  key={order._id}
                  href={`/orders/${order._id}`}
                  className="group flex flex-wrap items-start gap-3 rounded-[20px] bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.05)] transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.09)] sm:flex-nowrap sm:items-center sm:gap-4"
                >
                  {/* Icon */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f5f0eb]">
                    <ShoppingBag size={16} className="text-foreground/40" />
                  </div>

                  {/* Details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <p className="font-heading text-[14px] font-bold text-foreground">
                        {order.orderNumber}
                      </p>
                      <span
                        className={`rounded-full px-2.5 py-0.5 font-body text-[11px] font-semibold ${status.bg} ${status.text}`}
                      >
                        {status.label}
                      </span>
                      {order.orderType && order.orderType !== "delivery" && (
                        <span
                          className={`rounded-full px-2.5 py-0.5 font-body text-[11px] font-semibold ${
                            order.orderType === "dine_in"
                              ? "bg-green-50 text-green-700"
                              : "bg-orange-50 text-orange-600"
                          }`}
                        >
                          {order.orderType === "dine_in"
                            ? "Dine In"
                            : "Takeaway"}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 truncate font-body text-[13px] text-foreground/50">
                      {firstItem?.name ?? "Order"}
                      {extraCount > 0 && (
                        <span className="text-foreground/35">
                          {" "}
                          +{extraCount} more
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Right: price + date + arrow */}
                  <div className="flex w-full items-center justify-between pl-[52px] sm:w-auto sm:shrink-0 sm:flex-col sm:items-end sm:justify-start sm:gap-1 sm:pl-0">
                    <span className="font-heading text-[15px] font-bold text-foreground">
                      GH₵ {order.totalAmount.toFixed(2)}
                    </span>
                    <span className="font-body text-[11px] text-foreground/35">
                      {new Date(order.createdAt).toLocaleDateString("en-GH", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <ChevronRight
                    size={16}
                    className="hidden shrink-0 text-foreground/20 transition-transform group-hover:translate-x-0.5 group-hover:text-primary sm:block"
                  />
                </Link>
              );
            })}
          </div>
        )}
      </SlideUp>

      {/* ── Pagination ── */}
      {pagination && pagination.pages > 1 && (
        <FadeIn>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f5f0eb] text-foreground/60 transition-all hover:bg-primary/10 hover:text-primary disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="min-w-[80px] text-center font-body text-[14px] font-semibold text-foreground/60">
              {page} / {pagination.pages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
              disabled={page === pagination.pages}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f5f0eb] text-foreground/60 transition-all hover:bg-primary/10 hover:text-primary disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </FadeIn>
      )}
    </div>
  );
}

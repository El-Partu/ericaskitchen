// 📁 components/customer/RecentOrdersGrid.tsx

"use client";

import { useMyOrders } from "@/lib/hooks/useOrders";
import { ShoppingBag, ChevronRight, Clock, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import type { Order } from "@/types";

const STATUS_STYLES: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  pending: { bg: "bg-amber-50", text: "text-amber-600", label: "Pending" },
  confirmed: { bg: "bg-blue-50", text: "text-blue-600", label: "Confirmed" },
  preparing: {
    bg: "bg-orange-50",
    text: "text-orange-600",
    label: "Preparing",
  },
  ready_for_pickup: {
    bg: "bg-green-50",
    text: "text-green-600",
    label: "Ready",
  },
  out_for_delivery: {
    bg: "bg-cyan-50",
    text: "text-cyan-600",
    label: "On the way",
  },
  delivered: { bg: "bg-green-50", text: "text-green-700", label: "Delivered" },
  cancelled: { bg: "bg-red-50", text: "text-red-500", label: "Cancelled" },
};

function OrderCard({ order }: { order: Order }) {
  const status = STATUS_STYLES[order.status] ?? {
    bg: "bg-gray-50",
    text: "text-gray-500",
    label: order.status,
  };

  const firstItem = order.items?.[0];
  const extraCount = order.items.length - 1;

  return (
    <Link
      href={`/orders/${order._id}`}
      className="group flex flex-col rounded-[20px] bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.05)] transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.09)]"
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f5f0eb]">
            <ShoppingBag size={15} className="text-foreground/50" />
          </div>
          <div>
            <p className="font-body text-[13px] font-semibold text-foreground">
              {order.orderNumber}
            </p>
            <p className="font-body text-[11px] text-foreground/40">
              {new Date(order.createdAt).toLocaleDateString("en-GH", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-0.5 font-body text-[11px] font-semibold ${status.bg} ${status.text}`}
        >
          {status.label}
        </span>
      </div>

      {/* Items */}
      <div className="mt-3 flex-1">
        <p className="font-body text-[13px] text-foreground/70 line-clamp-1">
          {firstItem?.name ?? "Order"}
          {extraCount > 0 && (
            <span className="text-foreground/40"> +{extraCount} more</span>
          )}
        </p>
      </div>

      {/* Bottom row */}
      <div className="mt-3 flex items-center justify-between border-t border-black/[0.05] pt-3">
        <span className="font-heading text-[15px] font-bold text-foreground">
          GH₵ {order.totalAmount.toFixed(2)}
        </span>
        <ChevronRight
          size={16}
          className="text-foreground/25 transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
        />
      </div>
    </Link>
  );
}

export default function RecentOrdersGrid() {
  const { data, isLoading } = useMyOrders({ limit: 8, page: 1 });
  const orders = data?.orders ?? [];

  if (isLoading) {
    return (
      <section>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-heading text-lg font-bold text-foreground">
            Recent Orders
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-[130px] animate-pulse rounded-[20px] bg-[#f5f0eb]"
            />
          ))}
        </div>
      </section>
    );
  }

  if (!orders.length) {
    return (
      <section>
        <h2 className="mb-5 font-heading text-lg font-bold text-foreground">
          Recent Orders
        </h2>
        <div className="flex flex-col items-center justify-center rounded-[24px] bg-white py-14 text-center shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#f5f0eb]">
            <ShoppingBag size={22} className="text-foreground/30" />
          </div>
          <p className="font-body text-sm text-foreground/50">
            You haven't placed any orders yet.
          </p>
          <Link
            href="/menu"
            className="mt-4 flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 font-body text-sm font-semibold text-white shadow-[0_4px_12px_rgba(235,108,108,0.35)] transition-all hover:opacity-90"
          >
            Browse the menu
            <ChevronRight size={15} />
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-heading text-lg font-bold text-foreground">
          Recent Orders
        </h2>
        <Link
          href="/orders"
          className="flex items-center gap-1 font-body text-sm text-primary hover:underline"
        >
          View all
          <ChevronRight size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {orders.slice(0, 7).map((order) => (
          <OrderCard key={order._id} order={order} />
        ))}

        {/* Quick reorder CTA card */}
        {orders.length > 0 && (
          <div className="flex flex-col items-center justify-center rounded-[20px] bg-[#1e2025] p-4 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
              <RotateCcw size={18} className="text-white" />
            </div>
            <p className="mt-3 font-body text-[13px] text-white/70">
              Loved your last order?
            </p>
            <button
              onClick={() =>
                toast.success("Reorder placed!", {
                  description: `${orders[0].items.length} item(s) added to cart.`,
                })
              }
              className="mt-3 rounded-full bg-primary px-4 py-2 font-body text-[13px] font-semibold text-white shadow-[0_4px_12px_rgba(235,108,108,0.4)] transition-all hover:opacity-90"
            >
              Reorder in one click
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

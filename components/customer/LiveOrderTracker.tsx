// 📁 components/customer/LiveOrderTracker.tsx

"use client";

import { useMyOrders } from "@/lib/hooks/useOrders";
import Link from "next/link";
import { ShoppingBag, Clock, ChevronRight, MapPin } from "lucide-react";
import type { OrderStatus } from "@/types";

const ACTIVE_STATUSES = [
  "pending",
  "confirmed",
  "preparing",
  "ready_for_pickup",
  "out_for_delivery",
];

const STEPS: { status: OrderStatus; label: string; emoji: string }[] = [
  { status: "pending", label: "Order placed", emoji: "📋" },
  { status: "preparing", label: "Preparing", emoji: "👨‍🍳" },
  { status: "ready_for_pickup", label: "Ready", emoji: "✅" },
  { status: "out_for_delivery", label: "On the way", emoji: "🛵" },
];

const STEP_PROGRESS: Record<string, number> = {
  pending: 10,
  confirmed: 20,
  preparing: 49,
  ready_for_pickup: 72,
  out_for_delivery: 90,
  delivered: 100,
};

const STATUS_MESSAGE: Record<string, string> = {
  pending: "Your order has been placed and is awaiting confirmation.",
  confirmed: "Your order has been confirmed!",
  preparing: "The kitchen is preparing your food.",
  ready_for_pickup: "Your order is ready — a rider is on the way.",
  out_for_delivery: "Your food is on its way to you! 🛵",
};

export default function LiveOrderTracker() {
  const { data, isLoading } = useMyOrders({
    status: ACTIVE_STATUSES.join(","),
    limit: 1,
    page: 1,
  });

  const activeOrder = data?.orders?.[0];
  const progress = activeOrder ? (STEP_PROGRESS[activeOrder.status] ?? 0) : 0;

  // ── Skeleton ───────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="animate-pulse rounded-[24px] bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
        <div className="h-5 w-32 rounded-full bg-[#ede8e3]" />
        <div className="mt-4 h-2 rounded-full bg-[#ede8e3]" />
        <div className="mt-4 flex justify-between">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-[#ede8e3]" />
              <div className="h-3 w-14 rounded-full bg-[#ede8e3]" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── No active order ────────────────────────────────────────────────────────
  if (!activeOrder) {
    return (
      <div className="flex items-center justify-between rounded-[24px] bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f5f0eb]">
            <ShoppingBag size={20} className="text-foreground/40" />
          </div>
          <div>
            <p className="font-heading text-[15px] font-bold text-foreground">
              No active orders
            </p>
            <p className="mt-0.5 font-body text-sm text-foreground/40">
              Your next order will be tracked here in real time.
            </p>
          </div>
        </div>
        <Link
          href="/menu"
          className="flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 font-body text-sm font-semibold text-white shadow-[0_4px_12px_rgba(235,108,108,0.35)] transition-all hover:opacity-90"
        >
          Order now
          <ChevronRight size={15} />
        </Link>
      </div>
    );
  }

  const currentStepIdx = STEPS.findIndex(
    (s) =>
      s.status === activeOrder.status ||
      (activeOrder.status === "confirmed" && s.status === "pending"),
  );

  return (
    <div className="rounded-[24px] bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-2.5 w-2.5 rounded-full bg-green-500">
            <span className="h-2.5 w-2.5 animate-ping rounded-full bg-green-400 opacity-75" />
          </span>
          <span className="font-heading text-[15px] font-bold text-foreground">
            Live Order
          </span>
          <span className="rounded-full bg-[#f5f0eb] px-2.5 py-0.5 font-body text-[11px] font-semibold text-foreground/60">
            {activeOrder.orderNumber}
          </span>
        </div>
        <Link
          href={`/orders/${activeOrder._id}`}
          className="flex items-center gap-1 font-body text-sm text-primary hover:underline"
        >
          View details
          <ChevronRight size={14} />
        </Link>
      </div>

      {/* Status message */}
      <p className="mt-3 font-body text-sm text-foreground/50">
        {STATUS_MESSAGE[activeOrder.status] ?? "Your order is being processed."}
        {activeOrder.estimatedDelivery && (
          <span className="ml-1 font-medium text-foreground/70">
            Arriving around{" "}
            {new Date(activeOrder.estimatedDelivery).toLocaleTimeString(
              "en-GH",
              {
                hour: "2-digit",
                minute: "2-digit",
              },
            )}
            .
          </span>
        )}
      </p>

      {/* Progress bar */}
      <div className="mt-5">
        <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-[#f0ece8]">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-primary transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Step labels */}
        <div className="mt-4 flex items-start justify-between">
          {STEPS.map((step, i) => {
            const isCompleted = i < currentStepIdx;
            const isActive = i === currentStepIdx;
            return (
              <div
                key={step.status}
                className="flex flex-col items-center gap-2"
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-lg transition-all ${
                    isActive
                      ? "bg-primary/10 ring-2 ring-primary ring-offset-2"
                      : isCompleted
                        ? "bg-primary/10"
                        : "bg-[#f5f0eb]"
                  }`}
                >
                  <span className={isCompleted || isActive ? "" : "opacity-30"}>
                    {step.emoji}
                  </span>
                </div>
                <span
                  className={`font-body text-[12px] font-medium ${
                    isActive
                      ? "text-primary"
                      : isCompleted
                        ? "text-foreground/70"
                        : "text-foreground/30"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Delivery address */}
      {activeOrder.deliveryAddress && (
        <div className="mt-5 flex items-center gap-2 rounded-[12px] bg-[#f5f0eb] px-4 py-2.5">
          <MapPin size={14} className="shrink-0 text-foreground/40" />
          <p className="font-body text-[13px] text-foreground/60 truncate">
            {activeOrder.deliveryAddress.location}
          </p>
          <span className="ml-auto flex items-center gap-1 font-body text-[12px] text-foreground/40">
            <Clock size={12} />
            {activeOrder.status === "out_for_delivery"
              ? "Arriving soon"
              : "Estimated delivery"}
          </span>
        </div>
      )}
    </div>
  );
}

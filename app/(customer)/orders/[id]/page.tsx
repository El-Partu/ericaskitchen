// 📁 app/(customer)/orders/[id]/page.tsx
//
// GET  /orders/:id              🔒 Auth → order detail
// POST /orders/:id/cancel       🔒 Auth → cancel pending order (before payment only)

"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post } from "@/lib/api";
import {
  ChevronLeft,
  MapPin,
  Clock,
  Package,
  CheckCircle2,
  Circle,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { SlideUp, FadeIn } from "@/components/ui/Animations";
import type { Order, OrderStatus } from "@/types";

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
  delivered: { label: "Delivered", bg: "bg-green-50", text: "text-green-800" },
  cancelled: { label: "Cancelled", bg: "bg-red-50", text: "text-red-500" },
};

const PAYMENT_STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string }
> = {
  initiated: {
    label: "Initiated",
    bg: "bg-[#f5f0eb]",
    text: "text-foreground/50",
  },
  pending: { label: "Pending", bg: "bg-amber-50", text: "text-amber-600" },
  success: { label: "Paid", bg: "bg-green-50", text: "text-green-700" },
  failed: { label: "Failed", bg: "bg-red-50", text: "text-red-500" },
  refunded: { label: "Refunded", bg: "bg-blue-50", text: "text-blue-600" },
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  mobile_money: "Mobile Money",
  card: "Card",
  cash_on_delivery: "Cash on Delivery",
};

const STATUS_STEPS: OrderStatus[] = [
  "pending",
  "confirmed",
  "preparing",
  "ready_for_pickup",
  "out_for_delivery",
  "delivered",
];

const STATUS_STEP_LABELS: Record<OrderStatus, string> = {
  pending: "Order placed",
  confirmed: "Confirmed",
  preparing: "Preparing",
  ready_for_pickup: "Ready for pickup",
  out_for_delivery: "On the way",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

// Build a readable extras string from an order item's selectedExtras.
// Handles both shapes the server may return:
//   - { name: "Tilapia", quantity: 1 }              (name hoisted directly)
//   - { extraItem: { name: "Tilapia" }, quantity: 1 } (name nested)
function formatExtras(
  extras:
    | Order["items"][number]["selectedExtras"]
    | Order["items"][number]["extraItems"],
): string | null {
  if (!extras?.length) return null;
  return extras
    .map((se) => {
      const name =
        se.name ??
        (typeof se.extraItem === "object" ? se.extraItem.name : undefined) ??
        "Extra";
      return se.quantity > 1 ? `${name} ×${se.quantity}` : name;
    })
    .join(", ");
}

const cardCls =
  "rounded-[24px] bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.06]";

function CancelModal({
  orderId,
  onClose,
}: {
  orderId: string;
  onClose: () => void;
}) {
  const [reason, setReason] = useState("");
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      post(`/orders/${orderId}/cancel`, { reason: reason.trim() || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      queryClient.invalidateQueries({ queryKey: ["orders", "my"] });
      toast.success("Order cancelled.");
      onClose();
    },
    onError: () => toast.error("Failed to cancel order."),
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-[24px] bg-white p-6 shadow-[0_8px_40px_rgba(0,0,0,0.14)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="font-body text-[11px] font-semibold uppercase tracking-widest text-foreground/40">
              Confirm
            </p>
            <h3 className="mt-0.5 font-heading text-[18px] font-bold text-foreground">
              Cancel order?
            </h3>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-black/[0.05] text-foreground/40 transition-colors hover:bg-black/10 hover:text-foreground"
          >
            <X size={15} />
          </button>
        </div>
        <p className="mt-2 font-body text-[13px] text-foreground/50">
          This cannot be undone. A reason helps us improve.
        </p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Optional — changed my mind, ordered by mistake…"
          rows={3}
          maxLength={500}
          className="mt-4 w-full resize-none rounded-[12px] border border-black/[0.10] bg-[#f5f0eb] px-4 py-3 font-body text-[14px] text-foreground placeholder:text-foreground/35 focus:border-primary/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
        />
        <div className="mt-4 flex gap-2.5">
          <button
            onClick={() => mutate()}
            disabled={isPending}
            className="flex-1 rounded-full bg-red-500 py-2.5 font-body text-[14px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isPending ? "Cancelling…" : "Yes, cancel"}
          </button>
          <button
            onClick={onClose}
            className="flex-1 rounded-full py-2.5 font-body text-[14px] font-semibold text-foreground/60 ring-1 ring-black/[0.10] transition-colors hover:bg-[#f5f0eb]"
          >
            Keep order
          </button>
        </div>
      </div>
    </div>
  );
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [showCancel, setShowCancel] = useState(false);

  const {
    data: order,
    isLoading,
    isError,
  } = useQuery<Order>({
    queryKey: ["order", id],
    queryFn: () =>
      get<{ status: string; data: { order: Order } }>(`/orders/${id}`).then(
        (res) => res.data.order,
      ),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1376px] space-y-5 px-4 py-6 sm:px-6 sm:py-8 md:px-8">
        <div className="h-8 w-32 animate-pulse rounded-full bg-[#f5f0eb]" />
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            {[180, 280, 140].map((h, i) => (
              <div
                key={i}
                className="animate-pulse rounded-[24px] bg-[#f5f0eb]"
                style={{ height: h }}
              />
            ))}
          </div>
          <div className="h-[280px] animate-pulse rounded-[24px] bg-[#f5f0eb]" />
        </div>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="mx-auto max-w-[1376px] px-4 py-6 sm:px-6 sm:py-8 md:px-8">
        <div className="flex flex-col items-center justify-center rounded-[24px] bg-white py-16 text-center shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#f5f0eb]">
            <Package size={22} className="text-foreground/30" />
          </div>
          <p className="font-body text-[15px] font-semibold text-foreground/50">
            Order not found
          </p>
          <Link
            href="/orders"
            className="mt-4 font-body text-sm text-primary transition-opacity hover:opacity-75"
          >
            ← Back to orders
          </Link>
        </div>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[order.status] ?? {
    label: order.status,
    bg: "bg-[#f5f0eb]",
    text: "text-foreground/50",
  };
  const paymentCfg = PAYMENT_STATUS_CONFIG[order.paymentStatus] ?? {
    label: order.paymentStatus,
    bg: "bg-[#f5f0eb]",
    text: "text-foreground/50",
  };
  const canCancel =
    order.status === "pending" && order.paymentStatus !== "success";
  const currentStepIdx = STATUS_STEPS.indexOf(order.status as OrderStatus);

  return (
    <div className="mx-auto max-w-[1376px] space-y-6 px-4 py-6 sm:px-6 sm:py-8 md:px-8">
      <SlideUp>
        <Link
          href="/orders"
          className="mb-3 flex w-fit items-center gap-1.5 font-body text-sm text-foreground/40 transition-colors hover:text-foreground"
        >
          <ChevronLeft size={15} />
          My Orders
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-heading text-2xl font-black text-foreground">
            {order.orderNumber}
          </h1>
          {order.orderType && (
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-body text-[11px] font-semibold ${
                order.orderType === "delivery"
                  ? "bg-blue-50 text-blue-600"
                  : order.orderType === "dine_in"
                    ? "bg-green-50 text-green-700"
                    : "bg-orange-50 text-orange-600"
              }`}
            >
              {order.orderType === "delivery"
                ? "Delivery"
                : order.orderType === "dine_in"
                  ? "Dine In"
                  : "Takeaway"}
            </span>
          )}
          <span
            className={`rounded-full px-3 py-1 font-body text-[12px] font-semibold ${statusCfg.bg} ${statusCfg.text}`}
          >
            {statusCfg.label}
          </span>
          <span
            className={`rounded-full px-3 py-1 font-body text-[12px] font-semibold ${paymentCfg.bg} ${paymentCfg.text}`}
          >
            {paymentCfg.label}
          </span>
        </div>
        <p className="mt-1 font-body text-[13px] text-foreground/40">
          Placed{" "}
          {new Date(order.createdAt).toLocaleDateString("en-GH", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </SlideUp>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          {/* Status timeline */}
          <FadeIn delay={0.05}>
            <div className={cardCls}>
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                  <Clock size={16} className="text-primary" />
                </div>
                <h2 className="font-heading text-[16px] font-bold text-foreground">
                  Order Status
                </h2>
              </div>

              {order.status === "cancelled" ? (
                <div className="rounded-[14px] bg-red-50 px-4 py-3">
                  <p className="font-body text-[14px] font-semibold text-red-500">
                    This order was cancelled.
                  </p>
                  {order.cancellationReason && (
                    <p className="mt-1 font-body text-[13px] text-red-400">
                      Reason: {order.cancellationReason}
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex items-start justify-between gap-1">
                  {STATUS_STEPS.map((step, i) => {
                    const isCompleted = i < currentStepIdx;
                    const isActive = i === currentStepIdx;
                    return (
                      <div
                        key={step}
                        className="flex flex-1 flex-col items-center gap-2"
                      >
                        <div className="flex w-full items-center">
                          <div
                            className={`h-0.5 flex-1 ${i === 0 ? "invisible" : isCompleted || isActive ? "bg-primary" : "bg-black/[0.08]"}`}
                          />
                          <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all ${isActive ? "bg-primary ring-2 ring-primary ring-offset-2" : isCompleted ? "bg-primary" : "bg-[#f5f0eb]"}`}
                          >
                            {isCompleted ? (
                              <CheckCircle2 size={14} className="text-white" />
                            ) : isActive ? (
                              <span className="h-2 w-2 rounded-full bg-white" />
                            ) : (
                              <Circle
                                size={14}
                                className="text-foreground/20"
                              />
                            )}
                          </div>
                          <div
                            className={`h-0.5 flex-1 ${i === STATUS_STEPS.length - 1 ? "invisible" : isCompleted ? "bg-primary" : "bg-black/[0.08]"}`}
                          />
                        </div>
                        <span
                          className={`text-center font-body text-[11px] font-medium leading-tight ${isActive ? "text-primary" : isCompleted ? "text-foreground/60" : "text-foreground/25"}`}
                        >
                          {STATUS_STEP_LABELS[step]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {canCancel && (
                <div className="mt-5 border-t border-black/[0.06] pt-4">
                  <button
                    onClick={() => setShowCancel(true)}
                    className="font-body text-sm text-red-400 transition-colors hover:text-red-500"
                  >
                    Cancel this order
                  </button>
                </div>
              )}
            </div>
          </FadeIn>

          {/* Items — extras shown per item */}
          <FadeIn delay={0.08}>
            <div className={cardCls}>
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f5f0eb]">
                  <Package size={16} className="text-foreground/40" />
                </div>
                <h2 className="font-heading text-[16px] font-bold text-foreground">
                  Items Ordered
                </h2>
              </div>

              <div className="divide-y divide-black/[0.05]">
                {order.items.map((item, i) => {
                  const extrasLabel = formatExtras(
                    item.selectedExtras ?? item.extraItems,
                  );
                  return (
                    <div
                      key={i}
                      className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-body text-[14px] font-semibold text-foreground">
                          {item.name}
                        </p>
                        <p className="font-body text-[12px] text-foreground/40">
                          × {item.quantity}
                          {item.unitPrice !== undefined && (
                            <span> · GH₵ {item.unitPrice.toFixed(2)} each</span>
                          )}
                        </p>
                        {/* ── Extras line — shown in coral so it reads as an add-on ── */}
                        {extrasLabel && (
                          <p className="mt-0.5 font-body text-[12px] text-primary/75">
                            + {extrasLabel}
                          </p>
                        )}
                      </div>
                      <p className="shrink-0 font-heading text-[15px] font-bold text-foreground">
                        GH₵ {item.lineTotal.toFixed(2)}
                      </p>
                    </div>
                  );
                })}
              </div>

              {order.notes && (
                <div className="mt-4 rounded-[12px] bg-[#f5f0eb] px-4 py-3">
                  <p className="mb-1 font-body text-[12px] font-semibold uppercase tracking-widest text-foreground/40">
                    Order notes
                  </p>
                  <p className="font-body text-[13px] italic text-foreground/70">
                    &ldquo;{order.notes}&rdquo;
                  </p>
                </div>
              )}
            </div>
          </FadeIn>

          {/* Delivery address */}
          {(!order.orderType || order.orderType === "delivery") && (
            <FadeIn delay={0.11}>
              <div className={cardCls}>
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f5f0eb]">
                    <MapPin size={16} className="text-foreground/40" />
                  </div>
                  <h2 className="font-heading text-[16px] font-bold text-foreground">
                    Delivery Address
                  </h2>
                </div>
                <div className="space-y-1">
                  <p className="font-body text-[14px] font-semibold text-foreground">
                    {order.deliveryAddress.customerName}
                    {order.deliveryAddress.addressLabel && (
                      <span className="ml-2 rounded-full bg-[#f5f0eb] px-2.5 py-0.5 font-body text-[11px] font-semibold text-foreground/50">
                        {order.deliveryAddress.addressLabel}
                      </span>
                    )}
                  </p>
                  <p className="font-body text-[13px] text-foreground/70">
                    {order.deliveryAddress.location}
                  </p>
                  {order.deliveryAddress.landmark && (
                    <p className="font-body text-[12px] text-foreground/45">
                      {order.deliveryAddress.landmark}
                    </p>
                  )}
                  {order.deliveryAddress.gpsAddress && (
                    <p className="font-mono text-[12px] text-foreground/40">
                      {order.deliveryAddress.gpsAddress}
                    </p>
                  )}
                  <p className="font-body text-[13px] text-foreground/60">
                    {order.deliveryAddress.phoneNumber}
                  </p>
                </div>
              </div>
            </FadeIn>
          )}
        </div>

        {/* Right: summary */}
        <FadeIn delay={0.06}>
          <div className={`${cardCls} sticky top-6`}>
            <h2 className="mb-5 font-heading text-[16px] font-bold text-foreground">
              Order Summary
            </h2>

            <div className="space-y-3">
              {[
                { label: "Subtotal", value: order.subtotal, show: true },
                {
                  label: "Delivery fee",
                  value: order.deliveryFee,
                  show: order.deliveryFee > 0,
                },
                {
                  label: "Processing fee",
                  value: order.processingFee,
                  show: order.processingFee > 0,
                },
                { label: "Tax", value: order.tax, show: order.tax > 0 },
              ]
                .filter((r) => r.show)
                .map((row) => (
                  <div
                    key={row.label}
                    className="flex justify-between font-body text-[13px]"
                  >
                    <span className="text-foreground/50">{row.label}</span>
                    <span className="text-foreground">
                      GH₵ {row.value.toFixed(2)}
                    </span>
                  </div>
                ))}
            </div>

            <div className="mt-4 flex justify-between border-t border-black/[0.06] pt-4">
              <span className="font-heading text-[15px] font-bold text-foreground">
                Total
              </span>
              <span className="font-heading text-[15px] font-bold text-foreground">
                GH₵ {order.totalAmount.toFixed(2)}
              </span>
            </div>

            <div className="mt-5 space-y-2 rounded-[14px] bg-[#f5f0eb] px-4 py-3">
              <div className="flex justify-between font-body text-[12px]">
                <span className="text-foreground/50">Payment method</span>
                <span className="font-semibold capitalize text-foreground/70">
                  {PAYMENT_METHOD_LABELS[order.paymentMethod] ??
                    order.paymentMethod.replace(/_/g, " ")}
                </span>
              </div>
              <div className="flex justify-between font-body text-[12px]">
                <span className="text-foreground/50">Payment status</span>
                <span className={`font-semibold ${paymentCfg.text}`}>
                  {paymentCfg.label}
                </span>
              </div>
            </div>

            <Link
              href="/orders"
              className="mt-5 flex w-full items-center justify-center gap-1.5 rounded-full py-2.5 font-body text-[13px] font-semibold text-foreground/60 ring-1 ring-black/[0.10] transition-colors hover:bg-[#f5f0eb]"
            >
              <ChevronLeft size={14} />
              Back to orders
            </Link>
          </div>
        </FadeIn>
      </div>

      {showCancel && (
        <CancelModal orderId={order._id} onClose={() => setShowCancel(false)} />
      )}
    </div>
  );
}

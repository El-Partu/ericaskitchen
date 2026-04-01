// 📁 components/admin/OrdersTable.tsx
//
// GET  /admin/orders?status=...&search=...&page=...&limit=...  🔐 order:read
// PATCH /admin/orders/:id/status                               🔐 order:update
// PATCH /admin/orders/confirm-all                              🔐 order:update

"use client";

import { useState, useEffect } from "react";
import {
  Search,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  CheckCheck,
} from "lucide-react";
import { toast } from "sonner";
import {
  useAdminOrders,
  useUpdateOrderStatus,
  useConfirmAllOrders,
} from "@/lib/hooks/useAdmin";
import type { OrderStatus, PaymentStatus } from "@/types";

const LIMIT = 10;

// ── Semantic badge tokens ──────────────────────────────────────────────────────

const ORDER_STATUS_STYLES: Record<string, string> = {
  pending: "bg-admin-amber/10 text-admin-amber",
  confirmed: "bg-blue-500/10 text-blue-600",
  preparing: "bg-admin-amber/10 text-admin-amber",
  ready_for_pickup: "bg-green-500/10 text-green-700",
  out_for_delivery: "bg-blue-500/10 text-blue-600",
  delivered: "bg-green-500/10 text-green-800",
  cancelled: "bg-red-500/10 text-red-600",
};

const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  preparing: "Preparing",
  ready_for_pickup: "Ready",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const PAYMENT_STYLES: Record<PaymentStatus, string> = {
  initiated: "bg-black/[0.06] text-admin-muted",
  pending: "bg-admin-amber/10 text-admin-amber",
  success: "bg-green-500/10 text-green-700",
  failed: "bg-red-500/10 text-red-600",
  refunded: "bg-blue-500/10 text-blue-600",
};

const PAYMENT_LABELS: Record<PaymentStatus, string> = {
  initiated: "Initiated",
  pending: "Pending",
  success: "Paid",
  failed: "Failed",
  refunded: "Refunded",
};

const STATUS_OPTIONS: OrderStatus[] = [
  "pending",
  "confirmed",
  "preparing",
  "ready_for_pickup",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

const TERMINAL = new Set(["delivered", "cancelled"]);

// ── Component ─────────────────────────────────────────────────────────────────

export default function OrdersTable() {
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => {
      setSearchQuery(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data, isLoading } = useAdminOrders({
    ...(statusFilter && { status: statusFilter }),
    ...(searchQuery && { search: searchQuery }),
    page,
    limit: LIMIT,
  });

  const { mutate: updateStatus } = useUpdateOrderStatus();
  const { mutate: confirmAll, isPending: confirming } = useConfirmAllOrders();

  const orders = data?.orders ?? [];
  const pagination = data?.pagination;

  const handleStatusChange = (id: string, status: string) => {
    setUpdatingId(id);
    updateStatus(
      { id, status },
      {
        onSuccess: () => {
          toast.success("Order status updated");
          setUpdatingId(null);
        },
        onError: () => {
          toast.error("Failed to update status");
          setUpdatingId(null);
        },
      },
    );
  };

  const handleConfirmAll = () => {
    confirmAll(undefined, {
      onSuccess: (data: any) =>
        toast.success(
          `${data?.data?.confirmedCount ?? "All"} orders confirmed`,
        ),
      onError: () => toast.error("Failed to confirm orders"),
    });
  };

  return (
    <div className="rounded-[16px] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.05]">
      {/* ── Toolbar ── */}
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:flex-wrap sm:items-center">
        {/* Header */}
        <div className="sm:mr-2">
          <p className="font-body text-[11px] font-semibold uppercase tracking-widest text-admin-muted">
            Overview
          </p>
          <h3 className="mt-0.5 font-heading text-[16px] font-bold text-admin-text">
            Order List
          </h3>
        </div>

        {/* Search */}
        <div className="relative w-full sm:min-w-[200px] sm:max-w-[280px] sm:flex-1">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-muted"
          />
          <input
            type="text"
            placeholder="Order # or customer…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full rounded-[10px] bg-admin-bg py-2 pl-8 pr-3 font-body text-[13px] text-admin-text ring-1 ring-black/[0.08] placeholder:text-admin-muted focus:outline-none focus:ring-2 focus:ring-admin-accent/30 transition-all duration-150"
          />
          {searchInput !== searchQuery && (
            <span className="absolute right-3 top-1/2 h-1.5 w-1.5 -translate-y-1/2 animate-pulse rounded-full bg-admin-accent" />
          )}
        </div>

        {/* Status filter */}
        <div className="relative w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full cursor-pointer appearance-none rounded-[10px] bg-admin-bg py-2 pl-3.5 pr-8 font-body text-[13px] font-semibold text-admin-text ring-1 ring-black/[0.08] transition-all focus:outline-none focus:ring-2 focus:ring-admin-accent/30 sm:w-auto"
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {ORDER_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
          <ChevronDown
            size={12}
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-admin-muted"
          />
        </div>

        {/* Confirm All */}
        <button
          onClick={handleConfirmAll}
          disabled={confirming}
          className="flex w-full items-center justify-center gap-1.5 rounded-full bg-admin-accent px-4 py-2 font-body text-[12px] font-semibold text-white shadow-[0_2px_8px_rgba(160,58,26,0.25)] transition-opacity hover:opacity-90 disabled:opacity-50 sm:ml-auto sm:w-auto"
        >
          <CheckCheck size={14} />
          {confirming ? "Confirming…" : "Confirm All"}
        </button>
      </div>

      {/* ── Table ── */}
      <div className="px-4 pb-2 pt-1 sm:hidden">
        <p className="font-body text-[11px] text-admin-muted">
          Showing essential columns on mobile. Expand a row for full details.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left sm:min-w-0">
          <thead>
            <tr className="border-y border-black/[0.06] bg-admin-bg">
              {/* expand toggle col */}
              <th className="w-8 py-2.5 pl-3" />
              <th className="py-2.5 font-body text-[11px] font-semibold uppercase tracking-widest text-admin-muted">
                Order #
              </th>
              <th className="hidden py-2.5 font-body text-[11px] font-semibold uppercase tracking-widest text-admin-muted sm:table-cell">
                Customer
              </th>
              <th className="hidden py-2.5 font-body text-[11px] font-semibold uppercase tracking-widest text-admin-muted md:table-cell">
                Date
              </th>
              <th className="py-2.5 font-body text-[11px] font-semibold uppercase tracking-widest text-admin-muted">
                Total
              </th>
              <th className="hidden py-2.5 font-body text-[11px] font-semibold uppercase tracking-widest text-admin-muted lg:table-cell">
                Method
              </th>
              <th className="hidden py-2.5 font-body text-[11px] font-semibold uppercase tracking-widest text-admin-muted md:table-cell">
                Payment
              </th>
              <th className="py-2.5 font-body text-[11px] font-semibold uppercase tracking-widest text-admin-muted">
                Status
              </th>
              <th className="py-2.5 font-body text-[11px] font-semibold uppercase tracking-widest text-admin-muted">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: LIMIT }).map((_, i) => (
                <tr key={i} className="border-b border-black/[0.05]">
                  {Array.from({ length: 9 }).map((_, j) => (
                    <td key={j} className="py-3 pl-3">
                      <div className="h-3.5 animate-pulse rounded-full bg-[#f0ebe5]" />
                    </td>
                  ))}
                </tr>
              ))
            ) : orders.length > 0 ? (
              orders.flatMap((order) => {
                const isExpanded = !collapsedIds.has(order._id);
                return [
                  // ── Main row ──
                  <tr
                    key={order._id}
                    onClick={() => {
                      setCollapsedIds((prev) => {
                        const next = new Set(prev);
                        if (next.has(order._id)) {
                          next.delete(order._id);
                        } else {
                          next.add(order._id);
                        }
                        return next;
                      });
                    }}
                    className={`cursor-pointer select-none border-b border-black/[0.05] transition-colors duration-150 hover:bg-admin-bg/60 ${isExpanded ? "bg-admin-bg/70" : ""}`}
                  >
                    {/* Expand icon */}
                    <td className="py-3 pl-3 text-admin-muted">
                      {isExpanded ? (
                        <ChevronUp size={13} />
                      ) : (
                        <ChevronDown size={13} />
                      )}
                    </td>

                    {/* Order # */}
                    <td className="py-3 font-heading text-[13px] font-bold text-admin-text">
                      {order.orderNumber}
                    </td>

                    {/* Customer */}
                    <td className="hidden py-3 font-body text-[13px] font-semibold text-admin-text sm:table-cell">
                      {order.deliveryAddress.customerName}
                    </td>

                    {/* Date */}
                    <td className="hidden py-3 font-body text-[13px] text-admin-muted md:table-cell">
                      {new Date(order.createdAt).toLocaleDateString("en-GH", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>

                    {/* Total */}
                    <td className="py-3 font-heading text-[13px] font-bold text-admin-text">
                      GH₵{order.totalAmount.toFixed(2)}
                    </td>

                    {/* Method */}
                    <td className="hidden py-3 font-body text-[13px] capitalize text-admin-muted lg:table-cell">
                      {order.paymentMethod.replace(/_/g, " ")}
                    </td>

                    {/* Payment badge */}
                    <td className="hidden py-3 md:table-cell">
                      <span
                        className={`rounded-full px-2.5 py-0.5 font-body text-[11px] font-semibold ${PAYMENT_STYLES[order.paymentStatus] ?? "bg-black/[0.06] text-admin-muted"}`}
                      >
                        {PAYMENT_LABELS[order.paymentStatus] ??
                          order.paymentStatus}
                      </span>
                    </td>

                    {/* Status badge */}
                    <td className="py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 font-body text-[11px] font-semibold ${ORDER_STATUS_STYLES[order.status] ?? "bg-black/[0.06] text-admin-muted"}`}
                      >
                        {ORDER_STATUS_LABELS[order.status] ?? order.status}
                      </span>
                    </td>

                    {/* Action select */}
                    <td className="py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="relative inline-block">
                        <select
                          disabled={
                            updatingId === order._id ||
                            TERMINAL.has(order.status)
                          }
                          value={order.status}
                          onChange={(e) =>
                            handleStatusChange(order._id, e.target.value)
                          }
                          className="appearance-none rounded-[8px] bg-admin-bg py-1.5 pl-3 pr-7 font-body text-[12px] font-semibold text-admin-text ring-1 ring-black/[0.08] focus:outline-none focus:ring-2 focus:ring-admin-accent/30 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {ORDER_STATUS_LABELS[s]}
                            </option>
                          ))}
                        </select>
                        <ChevronRight
                          size={11}
                          className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rotate-90 text-admin-muted"
                        />
                      </div>
                    </td>
                  </tr>,

                  // ── Expanded detail row ──
                  ...(isExpanded
                    ? [
                        <tr
                          key={`${order._id}-detail`}
                          className="border-b border-black/[0.05] bg-admin-bg/40"
                        >
                          <td colSpan={9} className="px-6 py-5">
                            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
                              {/* Items + fees + notes */}
                              <div className="space-y-3">
                                <p className="font-body text-[11px] font-semibold uppercase tracking-widest text-admin-muted">
                                  Items ordered
                                </p>

                                {/* Items sub-table */}
                                <div className="overflow-hidden rounded-[10px] bg-white ring-1 ring-black/[0.07]">
                                  <table className="w-full text-left">
                                    <thead>
                                      <tr className="border-b border-black/[0.06] bg-admin-bg">
                                        {[
                                          "Item",
                                          "Qty",
                                          "Unit price",
                                          "Line total",
                                        ].map((h, i) => (
                                          <th
                                            key={h}
                                            className={`py-2 font-body text-[10px] font-semibold uppercase tracking-widest text-admin-muted ${i === 0 ? "pl-3" : i >= 2 ? "text-right pr-3" : "text-center"}`}
                                          >
                                            {h}
                                          </th>
                                        ))}
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {order.items.map((item, idx) => {
                                        // Build a readable extras string if the backend returns them
                                        const extrasLabel = item.extraItems
                                          ?.map((se) => {
                                            const isPopulated =
                                              typeof se.extraItem ===
                                                "object" &&
                                              se.extraItem !== null;

                                            const name = isPopulated
                                              ? ((
                                                  se.extraItem as {
                                                    name?: string;
                                                  }
                                                ).name ??
                                                se.name ??
                                                "Extra")
                                              : (se.name ?? "Extra");

                                            const price =
                                              se.unitPrice ??
                                              (isPopulated
                                                ? ((
                                                    se.extraItem as {
                                                      price?: number;
                                                    }
                                                  ).price ?? se.price)
                                                : se.price);

                                            const qty =
                                              se.quantity > 1
                                                ? ` ×${se.quantity}`
                                                : "";
                                            const priceTag =
                                              price != null
                                                ? ` (GH₵${price.toFixed(2)})`
                                                : "";

                                            return `${name}${qty}${priceTag}`;
                                          })
                                          .join(", ");

                                        return (
                                          <tr
                                            key={idx}
                                            className="border-t border-black/[0.05]"
                                          >
                                            {/* Name + extras */}
                                            <td className="py-2 pl-3">
                                              <p className="font-body text-[13px] font-semibold text-admin-text">
                                                {item.name}
                                              </p>
                                              {item.extraItems &&
                                                item.extraItems.length > 0 && (
                                                  <div className="mt-1.5 space-y-1 pl-1">
                                                    {item.extraItems.map(
                                                      (se, seIdx) => {
                                                        const isPopulated =
                                                          typeof se.extraItem ===
                                                            "object" &&
                                                          se.extraItem !== null;

                                                        const name = isPopulated
                                                          ? ((
                                                              se.extraItem as {
                                                                name?: string;
                                                              }
                                                            ).name ??
                                                            se.name ??
                                                            "Extra")
                                                          : (se.name ??
                                                            "Extra");

                                                        const price =
                                                          se.unitPrice ??
                                                          (isPopulated
                                                            ? ((
                                                                se.extraItem as {
                                                                  price?: number;
                                                                }
                                                              ).price ??
                                                              se.price)
                                                            : se.price);

                                                        const qty =
                                                          se.quantity > 1
                                                            ? ` ×${se.quantity}`
                                                            : "";
                                                        const priceTag =
                                                          price != null
                                                            ? ` (GH₵${price.toFixed(
                                                                2,
                                                              )})`
                                                            : "";

                                                        return (
                                                          <p
                                                            key={seIdx}
                                                            className="font-body text-[13px]"
                                                          >
                                                            <span className="text-admin-muted">
                                                              +
                                                            </span>{" "}
                                                            <span className="font-semibold text-admin-text">
                                                              {name}
                                                            </span>
                                                            <span className="text-admin-muted">
                                                              {qty}
                                                            </span>
                                                            <span className="font-semibold text-admin-text/80">
                                                              {priceTag}
                                                            </span>
                                                          </p>
                                                        );
                                                      },
                                                    )}
                                                  </div>
                                                )}
                                            </td>
                                            <td className="py-2 text-center font-body text-[13px] text-admin-muted">
                                              {item.quantity}
                                            </td>
                                            <td className="py-2 pr-3 text-right font-body text-[13px] text-admin-muted">
                                              GH₵{item.unitPrice.toFixed(2)}
                                            </td>
                                            <td className="py-2 pr-3 text-right font-heading text-[13px] font-bold text-admin-text">
                                              GH₵{item.lineTotal.toFixed(2)}
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>

                                {/* Fee breakdown */}
                                <div className="mt-4 flex justify-end">
                                  <div className="w-full space-y-1.5 rounded-[10px] bg-white p-3 ring-1 ring-black/[0.07] sm:ml-auto sm:w-64">
                                    {[
                                      {
                                        label: "Subtotal",
                                        value: order.subtotal,
                                        show: true,
                                      },
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
                                      {
                                        label: "Tax",
                                        value: order.tax,
                                        show: order.tax > 0,
                                      },
                                    ]
                                      .filter((r) => r.show)
                                      .map((r) => (
                                        <div
                                          key={r.label}
                                          className="flex justify-between font-body text-[12px] text-admin-muted"
                                        >
                                          <span>{r.label}</span>
                                          <span className="font-medium text-admin-text">
                                            GH₵{r.value.toFixed(2)}
                                          </span>
                                        </div>
                                      ))}
                                    <div className="flex justify-between border-t border-black/[0.08] pt-1.5 font-heading text-[14px] font-bold text-admin-text">
                                      <span>Total</span>
                                      <span>
                                        GH₵{order.totalAmount.toFixed(2)}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Notes */}
                                {order.notes && (
                                  <div className="rounded-[10px] bg-admin-amber/10 px-3 py-2 font-body text-[12px] text-admin-amber ring-1 ring-admin-amber/20">
                                    <span className="font-semibold">
                                      Note:{" "}
                                    </span>
                                    {order.notes}
                                  </div>
                                )}
                              </div>

                              {/* Delivery address + cancellation */}
                              <div className="space-y-3">
                                <p className="font-body text-[11px] font-semibold uppercase tracking-widest text-admin-muted">
                                  Delivery address
                                </p>
                                <div className="rounded-[10px] bg-white p-3 ring-1 ring-black/[0.07] space-y-1">
                                  <p className="font-body text-[13px] font-semibold text-admin-text">
                                    {order.deliveryAddress.customerName}
                                  </p>
                                  <p className="font-body text-[12px] text-admin-muted">
                                    {order.deliveryAddress.location}
                                  </p>
                                  {order.deliveryAddress.landmark && (
                                    <p className="font-body text-[12px] text-admin-muted">
                                      {order.deliveryAddress.landmark}
                                    </p>
                                  )}
                                  {order.deliveryAddress.gpsAddress && (
                                    <p className="font-mono text-[11px] text-admin-muted">
                                      {order.deliveryAddress.gpsAddress}
                                    </p>
                                  )}
                                  <p className="pt-1 font-body text-[12px] font-semibold text-admin-text">
                                    {order.deliveryAddress.phoneNumber}
                                  </p>
                                </div>

                                {order.cancellationReason && (
                                  <>
                                    <p className="font-body text-[11px] font-semibold uppercase tracking-widest text-admin-muted">
                                      Cancellation reason
                                    </p>
                                    <div className="rounded-[10px] bg-red-500/10 px-3 py-2 font-body text-[12px] text-red-600 ring-1 ring-red-500/20">
                                      {order.cancellationReason}
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>,
                      ]
                    : []),
                ];
              })
            ) : (
              <tr>
                <td colSpan={9} className="py-10 text-center">
                  <p className="font-body text-[13px] text-admin-muted">
                    {searchQuery
                      ? `No orders matching "${searchQuery}"`
                      : "No orders found."}
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      {pagination && (
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-black/[0.06] px-4 py-3">
          <span className="font-body text-[12px] text-admin-muted">
            {pagination.total.toLocaleString()} orders total
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-admin-bg text-admin-muted transition-colors hover:bg-admin-accent/10 hover:text-admin-accent disabled:opacity-40"
            >
              <ChevronLeft size={13} />
            </button>
            <span className="min-w-[60px] text-center font-body text-[13px] font-bold text-admin-text">
              {page} / {pagination.pages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
              disabled={page === pagination.pages}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-admin-bg text-admin-muted transition-colors hover:bg-admin-accent/10 hover:text-admin-accent disabled:opacity-40"
            >
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

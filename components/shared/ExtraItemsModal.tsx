// 📁 components/shared/ExtraItemsModal.tsx
//
// Replaces SoupProteinModal entirely.
// Fetches real extra items from GET /extra-items, filtered to the IDs
// allowed for this menu item (menuItem.extraItems), grouped by category.
// Passes selectedExtras: [{ extraItem, quantity }] to the cart API.
//
// API:
//   GET /extra-items                → all extras, filter client-side
//   POST /cart/items body shape:    { menuItem, quantity, selectedExtras }

"use client";

import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { X, Plus, Minus } from "lucide-react";
import { motion, type Easing } from "framer-motion";
import { toast } from "sonner";
import { useCart } from "@/lib/cart-context";
import { useExtraItems, type ExtraItem } from "@/lib/hooks/useExtraItems";
import type { MenuItem, SelectedExtraInput } from "@/types";

const ease: Easing = [0.25, 0.1, 0.25, 1];

export interface SelectedExtra {
  extraItem: string; // ExtraItem _id
  quantity: number;
  name?: string;
  price?: number;
}

interface Props {
  item: MenuItem;
  onClose: () => void;
}

// ── Qty stepper ───────────────────────────────────────────────────────────────

function Stepper({
  value,
  onChange,
  min = 0,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
}) {
  return (
    <div
      className="flex items-center gap-2"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 transition-colors hover:border-black/30 disabled:opacity-30 sm:h-7 sm:w-7"
        aria-label="Decrease"
      >
        <Minus size={14} className="sm:h-3 sm:w-3" />
      </button>
      <span className="min-w-[20px] text-center font-heading text-[15px] font-bold leading-none text-foreground">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-white transition-opacity hover:opacity-80 sm:h-7 sm:w-7"
        aria-label="Increase"
      >
        <Plus size={14} className="sm:h-3 sm:w-3" />
      </button>
    </div>
  );
}

// ── Modal inner ───────────────────────────────────────────────────────────────

function ExtraItemsModalInner({ item, onClose }: Props) {
  const { addItem } = useCart();
  const { data: allExtras, isLoading } = useExtraItems();

  // IDs of extras allowed for this menu item
  const allowedIds = useMemo(() => {
    const rawExtraItems = (item.extraItems ?? []) as Array<
      string | { _id: string }
    >;
    return new Set(
      rawExtraItems.map((e) => (typeof e === "string" ? e : e._id)),
    );
  }, [item.extraItems]);

  const extras = useMemo(
    () => (allExtras ?? []).filter((e) => allowedIds.has(e._id)),
    [allExtras, allowedIds],
  );

  // Group by category name
  const grouped = useMemo(() => {
    const map = new Map<string, { label: string; items: ExtraItem[] }>();
    for (const extra of extras) {
      const cat =
        typeof extra.category === "object"
          ? extra.category
          : { _id: String(extra.category), name: "Add-ons" };
      if (!map.has(cat._id)) map.set(cat._id, { label: cat.name, items: [] });
      map.get(cat._id)!.items.push(extra);
    }
    return [...map.values()];
  }, [extras]);

  // Selection: extraItemId → quantity
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [mainQty, setMainQty] = useState(1);

  const setQty = (id: string, qty: number) => {
    setQuantities((prev) => {
      if (qty === 0) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: qty };
    });
  };

  const selectedExtras: SelectedExtraInput[] = Object.entries(quantities)
    .map(([extraItem, quantity]) => {
      const extra = extras.find((e) => e._id === extraItem);
      return {
        extraItem,
        quantity,
        name: extra?.name,
        price: extra?.price,
      };
    })
    .filter((extra) => extra.quantity > 0);

  const extrasTotal = extras
    .filter((e) => quantities[e._id])
    .reduce((sum, e) => sum + e.price * (quantities[e._id] ?? 0), 0);
  const totalPreview = (item.price + extrasTotal) * mainQty;

  const handleConfirm = async () => {
    // Pass selectedExtras to cart — replaces the old freetext customization string
    await addItem(item, mainQty, selectedExtras);
    toast.success(`${item.name} added to cart`);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 backdrop-blur-[2px] sm:items-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease }}
        className="relative max-h-[90vh] w-full max-w-[640px] overflow-y-auto rounded-[24px] bg-white p-4 shadow-[0_8px_40px_rgba(0,0,0,0.14)] sm:p-6 lg:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-black/[0.05] text-foreground/50 transition-colors hover:bg-black/10 hover:text-foreground"
          aria-label="Close"
        >
          <X size={17} />
        </button>

        {/* Header */}
        <div className="pr-10">
          <p className="font-body text-[11px] font-semibold uppercase tracking-widest text-foreground/40">
            Customise your order
          </p>
          <h2 className="mt-1 font-heading text-[22px] font-bold leading-snug sm:text-[24px]">
            {item.name}
          </h2>
          <p className="mt-1 font-body text-[13px] text-foreground/50">
            Select any add-ons you&apos;d like with your order.
          </p>
        </div>

        {/* Body */}
        {isLoading ? (
          <div className="mt-6 space-y-3">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-14 animate-pulse rounded-[14px] bg-[#f5f0eb]"
              />
            ))}
          </div>
        ) : extras.length === 0 ? (
          <div className="mt-6 rounded-[14px] bg-[#f5f0eb] px-4 py-4 text-center">
            <p className="font-body text-[14px] text-foreground/40">
              No add-ons available for this item.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            {grouped.map(({ label, items }) => (
              <section key={label}>
                <p className="mb-2 font-body text-[11px] font-semibold uppercase tracking-widest text-foreground/40">
                  {label}
                </p>
                <div className="flex flex-col gap-2">
                  {items.map((extra) => {
                    const qty = quantities[extra._id] ?? 0;
                    const isSelected = qty > 0;
                    return (
                      <button
                        key={extra._id}
                        type="button"
                        onClick={() => setQty(extra._id, isSelected ? 0 : 1)}
                        className={`flex w-full items-center justify-between rounded-[14px] px-4 py-3 text-left transition-all duration-200 ${
                          isSelected
                            ? "bg-primary/8 ring-1 ring-primary/30"
                            : "bg-[#f5f0eb] hover:bg-[#ede8e3]"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {/* Checkbox indicator */}
                          <span
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
                              isSelected
                                ? "border-primary bg-primary"
                                : "border-black/20 bg-white"
                            }`}
                          >
                            {isSelected && (
                              <svg
                                width="10"
                                height="8"
                                viewBox="0 0 10 8"
                                fill="none"
                              >
                                <path
                                  d="M1 4L3.5 6.5L9 1"
                                  stroke="white"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            )}
                          </span>
                          <div>
                            <p className="font-body text-[14px] font-semibold text-foreground">
                              {extra.name}
                            </p>
                            {extra.description && (
                              <p className="font-body text-[12px] text-foreground/45">
                                {extra.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Price + stepper when selected */}
                        <div className="ml-3 flex shrink-0 items-center gap-3">
                          {isSelected && (
                            <Stepper
                              value={qty}
                              min={1}
                              onChange={(v) => setQty(extra._id, v)}
                            />
                          )}
                          <div className="flex items-baseline gap-0.5">
                            <span className="font-body text-[11px] text-foreground/40">
                              GH₵
                            </span>
                            <span className="font-heading text-[15px] font-bold text-foreground">
                              {extra.price.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}

        {/* Footer: main qty + total + CTA */}
        <div className="mt-6 rounded-[14px] bg-[#f5f0eb] px-5 py-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Stepper value={mainQty} min={1} onChange={setMainQty} />

            <div className="flex items-center justify-between gap-4 sm:justify-start">
              <div className="flex flex-col items-end">
                <span className="font-body text-[10px] uppercase tracking-widest text-foreground/40">
                  Total
                </span>
                <div className="flex items-baseline gap-0.5">
                  <span className="font-body text-[11px] font-medium text-foreground/50">
                    GH₵
                  </span>
                  <span className="font-heading text-[22px] font-bold leading-none text-foreground">
                    {totalPreview.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleConfirm}
                className="flex items-center gap-1.5 rounded-full bg-primary px-6 py-2.5 font-body text-[14px] font-semibold text-white shadow-[0_4px_12px_rgba(235,108,108,0.35)] transition-all hover:opacity-90 hover:shadow-[0_4px_16px_rgba(235,108,108,0.45)] active:scale-95"
              >
                Add to Cart
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/25 text-sm font-bold leading-none">
                  +
                </span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Portal wrapper
export default function ExtraItemsModal(props: Props) {
  if (typeof document === "undefined") return null;
  return createPortal(<ExtraItemsModalInner {...props} />, document.body);
}

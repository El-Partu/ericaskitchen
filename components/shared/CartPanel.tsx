"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  MapPin,
  Minus,
  Plus,
  Trash2,
  ChevronDown,
  LogIn,
  ArrowRight,
  Tag,
} from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { useAddresses } from "@/lib/hooks/useAddresses";

type OrderType = "Delivery" | "Dine In" | "Takeaway";
const ORDER_TYPES: OrderType[] = ["Delivery", "Dine In", "Takeaway"];
const ORDER_TYPE_MAP: Record<OrderType, "delivery" | "dine_in" | "takeaway"> = {
  Delivery: "delivery",
  "Dine In": "dine_in",
  Takeaway: "takeaway",
};

export default function CartPanel() {
  const {
    items,
    totalAmount,
    itemCount,
    isLoading,
    updateQuantity,
    removeItem,
  } = useCart();

  const { isAuthenticated } = useAuth();
  const { data: addresses } = useAddresses({ enabled: isAuthenticated });
  const router = useRouter();

  const [orderType, setOrderType] = useState<OrderType>("Delivery");
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [promoCode, setPromoCode] = useState("");

  const defaultAddressId =
    addresses && addresses.length > 0
      ? (addresses.find((a) => a.isDefault) ?? addresses[0])._id
      : "";
  const effectiveAddressId = selectedAddressId || defaultAddressId;
  const normalizedOrderType = ORDER_TYPE_MAP[orderType];
  const isDeliveryOrder = normalizedOrderType === "delivery";

  const handleCheckout = () => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/checkout");
      return;
    }

    const params = new URLSearchParams();
    params.set("orderType", normalizedOrderType);

    if (normalizedOrderType === "delivery" && effectiveAddressId) {
      params.set("addressId", effectiveAddressId);
    }

    if (notes.trim()) params.set("notes", notes.trim());
    if (promoCode.trim())
      params.set("promoCode", promoCode.trim().toUpperCase());
    router.push(`/checkout?${params.toString()}`);
  };

  return (
    <div className="rounded-[24px] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.08)] overflow-hidden">
      {/* ── Header ───────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
            <ShoppingCart size={15} className="text-primary" />
          </div>
          <h3 className="font-heading text-lg font-bold">
            Your Cart
            {itemCount > 0 && (
              <span className="ml-2 rounded-full bg-primary px-2 py-0.5 font-body text-xs font-semibold text-white">
                {itemCount}
              </span>
            )}
          </h3>
        </div>
        {isLoading && (
          <span className="font-body text-[11px] text-foreground/30">
            Syncing…
          </span>
        )}
      </div>

      {/* ── Order type toggle ─────────────────────────────────── */}
      <div className="px-4 pb-4">
        <div className="flex rounded-[12px] bg-[#f5f0eb] p-1 gap-1">
          {ORDER_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setOrderType(type)}
              className={`flex-1 rounded-[9px] py-2 text-center font-body text-[13px] font-medium transition-all duration-200 ${
                orderType === type
                  ? "bg-white text-foreground shadow-[0_1px_4px_rgba(0,0,0,0.10)]"
                  : "text-foreground/50 hover:text-foreground/80"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* ── Delivery address ──────────────────────────────────── */}
      {isDeliveryOrder ? (
        <div className="mx-4 mb-4 rounded-[14px] bg-[#f5f0eb] p-4">
          <p className="mb-2 font-body text-[11px] font-semibold uppercase tracking-widest text-foreground/40">
            Deliver to
          </p>

          {!isAuthenticated ? (
            <p className="font-body text-sm text-foreground/50">
              Sign in to select a delivery address.
            </p>
          ) : addresses && addresses.length > 0 ? (
            <div className="relative">
              <select
                value={effectiveAddressId}
                onChange={(e) => setSelectedAddressId(e.target.value)}
                className="w-full appearance-none rounded-[10px] border border-black/8 bg-white px-3 py-2.5 pr-8 font-body text-sm outline-none focus:border-primary"
              >
                {addresses.map((addr) => (
                  <option key={addr._id} value={addr._id}>
                    {addr.label ? `${addr.label} — ` : ""}
                    {addr.location}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40"
              />
            </div>
          ) : (
            <Link
              href="/addresses"
              className="flex items-center gap-1.5 font-body text-sm text-primary"
            >
              <MapPin size={13} />
              Add a delivery address
            </Link>
          )}

          {isAuthenticated && addresses && addresses.length > 0 && (
            <Link
              href="/addresses"
              className="mt-2 flex items-center gap-1 font-body text-[11px] text-foreground/40 hover:text-primary"
            >
              <MapPin size={11} />
              Manage addresses
            </Link>
          )}
        </div>
      ) : (
        <div className="mx-4 mb-4 rounded-[14px] bg-[#f5f0eb] p-4">
          <p className="font-body text-[11px] font-semibold uppercase tracking-widest text-foreground/40">
            Order type
          </p>
          <p className="mt-1 font-body text-sm text-foreground/55 capitalize">
            {normalizedOrderType.replace("_", " ")} selected. Delivery address
            is not required.
          </p>
        </div>
      )}

      {/* ── Cart items ────────────────────────────────────────── */}
      <div className="max-h-[300px] overflow-y-auto px-4">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#f5f0eb]">
              <ShoppingCart size={20} className="text-foreground/30" />
            </div>
            <p className="font-body text-sm text-foreground/40">
              Your cart is empty
            </p>
            <Link
              href="/menu"
              className="mt-2 font-body text-sm text-primary hover:underline"
            >
              Browse the menu →
            </Link>
          </div>
        ) : (
          <div className="space-y-1 pb-2">
            {items.map((cartItem, index) => (
              <div key={cartItem.lineId ?? cartItem.menuItemId}>
                <div className="flex items-center gap-3 py-3">
                  {/* Thumbnail */}
                  <div className="relative h-[52px] w-[52px] shrink-0 overflow-hidden rounded-[12px] bg-[#f5f0eb]">
                    {cartItem.image ? (
                      <Image
                        src={cartItem.image}
                        alt={cartItem.name}
                        fill
                        sizes="52px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <ShoppingCart
                          size={16}
                          className="text-foreground/20"
                        />
                      </div>
                    )}
                  </div>

                  {/* Name + price + customization */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-body text-[14px] font-medium leading-tight text-foreground">
                      {cartItem.name}
                    </p>
                    {cartItem.customization && (
                      <p className="mt-0.5 truncate font-body text-[11px] text-foreground/40">
                        {cartItem.customization}
                      </p>
                    )}
                    <p className="mt-1 font-heading text-[15px] font-bold text-primary">
                      GH₵{" "}
                      {(
                        cartItem.lineTotal ?? cartItem.price * cartItem.quantity
                      ).toFixed(2)}
                    </p>
                  </div>

                  {/* Qty stepper + remove */}
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    {/* Remove */}
                    <button
                      onClick={() => {
                        removeItem(cartItem.lineId ?? cartItem.menuItemId);
                        toast.info(`${cartItem.name} removed`);
                      }}
                      className="flex h-6 w-6 items-center justify-center rounded-full transition-colors hover:bg-red-50 hover:text-red-400"
                      aria-label="Remove item"
                    >
                      <Trash2 size={12} />
                    </button>

                    {/* Stepper */}
                    <div className="flex items-center gap-1.5 rounded-full border border-black/10 px-1.5 py-1">
                      <button
                        onClick={() =>
                          updateQuantity(
                            cartItem.lineId ?? cartItem.menuItemId,
                            cartItem.quantity - 1,
                          )
                        }
                        className="flex h-5 w-5 items-center justify-center rounded-full transition-colors hover:bg-black/5"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={10} />
                      </button>
                      <span className="min-w-[16px] text-center font-body text-[13px] font-semibold">
                        {cartItem.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(
                            cartItem.lineId ?? cartItem.menuItemId,
                            cartItem.quantity + 1,
                          )
                        }
                        className="flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-white transition-opacity hover:opacity-75"
                        aria-label="Increase quantity"
                      >
                        <Plus size={10} />
                      </button>
                    </div>
                  </div>
                </div>

                {index < items.length - 1 && (
                  <div className="h-px w-full bg-black/5" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Add more ─────────────────────────────────────────── */}
      {items.length > 0 && (
        <div className="px-4 pt-1 pb-3">
          <Link
            href="/menu"
            className="flex items-center justify-center gap-1.5 rounded-[10px] border border-dashed border-black/15 py-2.5 font-body text-[13px] text-foreground/50 transition-colors hover:border-primary/40 hover:text-primary"
          >
            <Plus size={13} />
            Add more items
          </Link>
        </div>
      )}

      {/* ── Promo + notes ─────────────────────────────────────── */}
      <div className="mx-4 space-y-3 border-t border-black/6 pt-4">
        {/* Promo */}
        <div className="flex items-center gap-2 rounded-[10px] border border-black/8 bg-[#fafafa] px-3 py-2.5">
          <Tag size={13} className="shrink-0 text-foreground/30" />
          <input
            type="text"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            placeholder="Promotion code"
            className="flex-1 bg-transparent font-body text-sm outline-none placeholder:text-foreground/30"
          />
        </div>
        {promoCode.trim() && (
          <p className="font-body text-[11px] text-foreground/40">
            Promo code will be validated at checkout.
          </p>
        )}

        {/* Notes */}
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Special requests, allergies…"
          rows={2}
          className="w-full resize-none rounded-[10px] border border-black/8 bg-[#fafafa] px-3 py-2.5 font-body text-sm text-foreground outline-none placeholder:text-foreground/30 focus:border-primary"
        />
      </div>

      {/* ── Totals ───────────────────────────────────────────── */}
      <div className="mx-4 mt-4 space-y-2 rounded-[14px] bg-[#f5f0eb] p-4">
        <div className="flex justify-between font-body text-[13px] text-foreground/60">
          <span>Subtotal</span>
          <span className="font-medium text-foreground">
            GH₵ {totalAmount.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between font-body text-[13px] text-foreground/40">
          <span>Delivery fee</span>
          <span>At checkout</span>
        </div>
        <div className="border-t border-black/10 pt-2">
          <div className="flex justify-between">
            <span className="font-heading text-base font-bold">Total</span>
            <span className="font-heading text-base font-bold text-primary">
              GH₵ {totalAmount.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <div className="p-4">
        {!isAuthenticated ? (
          <button
            onClick={() => router.push("/login?redirect=/checkout")}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 font-body text-[15px] font-bold text-white shadow-[0_4px_16px_rgba(235,108,108,0.35)] transition-all hover:opacity-90 hover:shadow-[0_4px_20px_rgba(235,108,108,0.45)] active:scale-[0.98]"
          >
            <LogIn size={17} />
            Sign in to checkout
          </button>
        ) : items.length === 0 ? (
          <button
            disabled
            className="w-full rounded-full bg-[#eeeeee] py-3.5 font-body text-[15px] font-bold text-foreground/30"
          >
            Your cart is empty
          </button>
        ) : isDeliveryOrder && !effectiveAddressId ? (
          <Link
            href="/addresses"
            className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 font-body text-[15px] font-bold text-white shadow-[0_4px_16px_rgba(235,108,108,0.35)] transition-all hover:opacity-90 active:scale-[0.98]"
          >
            <MapPin size={17} />
            Add address to continue
          </Link>
        ) : (
          <button
            onClick={handleCheckout}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 font-body text-[15px] font-bold text-white shadow-[0_4px_16px_rgba(235,108,108,0.35)] transition-all hover:opacity-90 hover:shadow-[0_4px_20px_rgba(235,108,108,0.45)] active:scale-[0.98]"
          >
            Proceed to checkout
            <ArrowRight size={17} />
          </button>
        )}
      </div>
    </div>
  );
}
